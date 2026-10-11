#!/usr/bin/env node
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/*
 * Emits the two ES module builds of the package in the current directory,
 * next to the CommonJS build that tsc writes to lib/:
 *
 *   lib/esm/          the `import` export condition, for Node
 *   lib/esm-browser/  the `browser` export condition, for bundlers targeting
 *                     the web
 *
 * Run it from a package directory after tsc (`npm run build:esm`). The layout
 * follows Concerto's scripts/build-esm.js.
 */

const fs = require('fs');
const path = require('path');
const { builtinModules } = require('module');
const esbuild = require('esbuild');

const packageDir = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
const srcDir = path.join(packageDir, 'src');

/**
 * Every source module is an entry point, so the output mirrors the module
 * graph that tsc emits for lib/ instead of flattening it into one file. A
 * consumer's bundler can then drop whole modules the consumer never reaches,
 * and code shared between entry points is hoisted into chunks.
 *
 * @param {string} dir - directory to scan
 * @param {string[]} found - accumulator
 * @return {string[]} absolute paths of the source modules under dir
 */
function collectEntryPoints(dir, found = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== '__snapshots__') {
                collectEntryPoints(entryPath, found);
            }
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') && !entry.name.endsWith('.test.ts')) {
            found.push(entryPath);
        }
    }
    return found;
}

// Dependencies whose code cannot run in a browser. The only one is jsdom, which
// markdown-html requires solely when DOMParser is missing, i.e. under Node.
const nodeOnlyDependencies = ['jsdom'];

// Every dependency (workspace siblings, Concerto as a peer, and third-party
// packages) stays a bare import in both builds, so it resolves through the
// consumer's node_modules exactly like the require() calls in lib/. Bundling
// them instead would give each package a private copy: markdown-it alone would
// appear once per package that uses it, and none of the copies could be
// deduplicated or patched with a lockfile bump.
const dependencies = [...new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
])];

const asExternal = names => names.flatMap(name => [name, `${name}/*`]);

const builtinSpecifiers = new Set([
    ...builtinModules,
    ...builtinModules.map(name => `node:${name}`),
]);

// The browser build replaces Node builtins and Node-only dependencies with
// empty modules, so a downstream bundler without Node polyfills is never asked
// to resolve `fs` or jsdom.
const stubNodeOnlyModulesPlugin = {
    name: 'stub-node-only-modules',
    setup(build) {
        build.onResolve({ filter: /^(node:|[a-z])/ }, args => {
            if (builtinSpecifiers.has(args.path) || nodeOnlyDependencies.includes(args.path)) {
                return { path: args.path, namespace: 'node-only-stub' };
            }
            return undefined;
        });
        build.onLoad({ filter: /.*/, namespace: 'node-only-stub' }, () => ({
            contents: 'module.exports = {};',
            loader: 'js',
        }));
    },
};

/**
 * Build options for one target.
 *
 * @param {'node'|'browser'} target - the runtime the build is for
 * @return {object} esbuild options shared by every entry point of that target
 */
function buildOptionsFor(target) {
    if (target === 'node') {
        return {
            platform: 'node',
            external: [...asExternal(dependencies), ...builtinSpecifiers],
            // jsdom is loaded with require() (only when DOMParser is missing),
            // which has no meaning in an ES module unless one is provided.
            banner: { js: 'import { createRequire as __createRequire } from "module";\nconst require = __createRequire(import.meta.url);' },
        };
    }
    return {
        platform: 'browser',
        external: asExternal(dependencies.filter(name => !nodeOnlyDependencies.includes(name))),
        plugins: [stubNodeOnlyModulesPlugin],
    };
}

async function main() {
    const entryPoints = collectEntryPoints(srcDir);
    const targets = [
        { target: 'node', outdir: path.join(packageDir, 'lib', 'esm') },
        { target: 'browser', outdir: path.join(packageDir, 'lib', 'esm-browser') },
    ];

    for (const { target, outdir } of targets) {
        // Chunk names are content hashes, so stale chunks from an earlier
        // build would otherwise accumulate and be published.
        fs.rmSync(outdir, { recursive: true, force: true });
        await esbuild.build({
            ...buildOptionsFor(target),
            entryPoints,
            outdir,
            outbase: srcDir,
            bundle: true,
            splitting: true,
            format: 'esm',
            target: 'es2020',
            sourcemap: true,
            logLevel: 'warning',
            // The package has no "type": "module", so ES modules need the .mjs
            // extension. esbuild rewrites the relative specifiers it emits to
            // match, which Node requires since it does not infer extensions.
            outExtension: { '.js': '.mjs' },
        });
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
