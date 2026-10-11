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

/**
 * Smoke test for the ES module builds, run after `npm run build`.
 *
 * The jest suites run src/ through ts-jest, so nothing else exercises what a
 * consumer actually loads: Node's `import` resolves to lib/esm, and a bundler
 * targeting the web resolves the `browser` condition to lib/esm-browser.
 *
 * Run with `npm run test:esm`.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { builtinModules, createRequire } from 'module';
import { fileURLToPath } from 'url';

import { ModelManager } from '@accordproject/concerto-core';
import { CommonMarkTransformer } from '@accordproject/markdown-common';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { HtmlTransformer } from '@accordproject/markdown-html';
import { TemplateMarkTransformer } from '@accordproject/markdown-template';
import { transform } from '@accordproject/markdown-transform';
import MarkdownIt from 'markdown-it';
import MarkdownItCicero from '@accordproject/markdown-it-cicero';
import MarkdownItTemplate from '@accordproject/markdown-it-template';

const require = createRequire(import.meta.url);
const packagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'packages');

const PACKAGES = [
    'markdown-common',
    'markdown-cicero',
    'markdown-html',
    'markdown-template',
    'markdown-transform',
    'markdown-it-cicero',
    'markdown-it-template',
];
// These export a single markdown-it plugin function (`module.exports = fn`).
const PLUGIN_PACKAGES = ['markdown-it-cicero', 'markdown-it-template'];
// Dependencies the browser build replaces with empty modules (see build-esm.js).
const NODE_ONLY_DEPENDENCIES = ['jsdom'];

const MODEL = `namespace smoke@1.0.0
@template
concept Agreement {
  o String party
  o DateTime effective
}`;

const checks = [];

/**
 * Register a named check.
 *
 * @param {string} name - what the check covers
 * @param {Function} fn - the check body; throws to fail
 */
function check(name, fn) {
    checks.push([name, fn]);
}

/**
 * Lists the .mjs files of one build of one package.
 *
 * @param {string} name - package directory name
 * @param {string} build - 'esm' or 'esm-browser'
 * @return {Array<[string, string]>} [relative path, source] pairs
 */
function modulesOf(name, build) {
    const dir = path.join(packagesDir, name, 'lib', build);
    return fs.readdirSync(dir, { recursive: true })
        .filter(file => file.endsWith('.mjs'))
        .map(file => [`${name}/lib/${build}/${file}`, fs.readFileSync(path.join(dir, file), 'utf8')]);
}

/**
 * Depth-first search of a markdown DOM.
 *
 * @param {object} node - the node to start from
 * @param {string} classSuffix - the end of the $class to look for
 * @return {object|undefined} the first matching node
 */
function findNode(node, classSuffix) {
    if (node.$class && node.$class.endsWith(classSuffix)) {
        return node;
    }
    for (const child of node.nodes || []) {
        const found = findNode(child, classSuffix);
        if (found) {
            return found;
        }
    }
    return undefined;
}

/**
 * Specifiers a module loads with a runtime require() call. In an ES module
 * these are invisible to a bundler, and esbuild's __require helper throws
 * "Dynamic require ... is not supported" wherever no require() is in scope.
 *
 * @param {string} source - module source
 * @return {string[]} the required specifiers
 */
function runtimeRequires(source) {
    return [...source.matchAll(/\b__require\("([^"]+)"\)/g)].map(match => match[1]);
}

check('Node resolves the import condition to lib/esm', () => {
    for (const name of PACKAGES) {
        const resolved = import.meta.resolve(`@accordproject/${name}`);
        assert.ok(resolved.includes('/lib/esm/'), `${name}: expected lib/esm, got ${resolved}`);
    }
});

check('ESM and CJS entry points expose the same names', async () => {
    for (const name of PACKAGES) {
        const esm = await import(`@accordproject/${name}`);
        const cjs = require(`@accordproject/${name}`);
        if (PLUGIN_PACKAGES.includes(name)) {
            assert.strictEqual(typeof esm.default, 'function', `${name}: ESM default is not a function`);
            assert.strictEqual(typeof cjs, 'function', `${name}: CJS export is not a function`);
            continue;
        }
        const esmNames = Object.keys(esm).filter(key => key !== 'default').sort();
        const cjsNames = Object.keys(cjs).filter(key => key !== 'default' && key !== '__esModule').sort();
        assert.deepStrictEqual(esmNames, cjsNames, `${name}: export names differ between ESM and CJS`);
    }
});

check('markdown round-trips through CommonMark and CiceroMark', () => {
    const markdown = '# Heading\n\nSome *emphasis* and a [link](https://accordproject.org).';
    const commonMark = new CommonMarkTransformer();
    const dom = commonMark.fromMarkdown(markdown);
    assert.deepStrictEqual(commonMark.fromMarkdown(commonMark.toMarkdown(dom)), dom);
    const ciceroMark = new CiceroMarkTransformer();
    assert.ok(ciceroMark.fromMarkdown(markdown).nodes.length > 0);
});

check('the markdown-it plugins work as default imports', () => {
    const tokenTypes = (plugin, source) => new MarkdownIt().use(plugin).parse(source, {})
        .flatMap(token => [token, ...(token.children || [])])
        .map(token => token.type);
    assert.ok(tokenTypes(MarkdownItCicero, '{{% return 1 %}}').includes('formula'));
    assert.ok(tokenTypes(MarkdownItTemplate, 'Hello {{name}}.').includes('variable'));
});

check('a template with a variable, a date and a formula parses', () => {
    const modelManager = new ModelManager();
    modelManager.addCTOModel(MODEL);
    const templateMark = new TemplateMarkTransformer().fromMarkdownTemplate(
        { content: 'Between {{party}}, from {{effective as "D MMMM YYYY"}}, for {{% return 1 + 2 %}} days.' },
        modelManager,
        'contract',
    );
    assert.ok(findNode(templateMark, '.VariableDefinition'), 'no variable in the TemplateMark');
    const formula = findNode(templateMark, '.FormulaDefinition');
    assert.ok(formula, 'no formula in the TemplateMark');
    // Formula names are a SHA-256 of the code. Compare with Node's own
    // implementation to show the bundled one produces the same names.
    const expected = 'formula_' + createHash('sha256').update(formula.code.contents).digest('hex');
    assert.strictEqual(formula.name, expected);
});

check('transform() runs a multi-step conversion to HTML', async () => {
    const html = await transform('# Title\n\nBody text.', 'markdown', ['html']);
    assert.match(html, /<h1>Title<\/h1>/);
});

// The Node build loads jsdom with require(), so this covers its createRequire
// banner.
check('HtmlTransformer parses HTML under Node', () => {
    const ciceroMark = new HtmlTransformer().toCiceroMark('<p>Hello <em>world</em></p>');
    assert.ok(ciceroMark.$class.endsWith('.Document'), `unexpected root ${ciceroMark.$class}`);
    assert.ok(findNode(ciceroMark, '.Emph'), 'no emphasis in the CiceroMark');
});

check('the Node build only requires Node-only dependencies at runtime', () => {
    const offenders = [];
    for (const name of PACKAGES) {
        for (const [file, source] of modulesOf(name, 'esm')) {
            for (const specifier of runtimeRequires(source)) {
                if (!NODE_ONLY_DEPENDENCIES.includes(specifier)) {
                    offenders.push(`${file} requires ${specifier}`);
                }
            }
        }
    }
    assert.deepStrictEqual(offenders, [], 'use an import statement so the browser build can follow it');
});

check('the browser build has no Node builtins, runtime requires or free process', () => {
    const builtins = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`), ...NODE_ONLY_DEPENDENCIES]);
    const offenders = [];
    for (const name of PACKAGES) {
        for (const [file, source] of modulesOf(name, 'esm-browser')) {
            for (const [, specifier] of source.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*"([^"]+)"/g)) {
                if (builtins.has(specifier)) {
                    offenders.push(`${file} imports ${specifier}`);
                }
            }
            for (const specifier of runtimeRequires(source)) {
                offenders.push(`${file} requires ${specifier}`);
            }
            // A free `process` is answered by a webpack consumer's
            // ProvidePlugin with an extensionless `process/browser` request,
            // which webpack rejects from an .mjs module.
            if (/\bprocess\s*\./.test(source)) {
                offenders.push(`${file} references process`);
            }
        }
    }
    assert.deepStrictEqual(offenders, []);
});

let failures = 0;
for (const [name, fn] of checks) {
    try {
        await fn();
        console.log(`ok   ${name}`);
    } catch (err) {
        failures++;
        console.error(`FAIL ${name}\n     ${err.message}`);
    }
}

if (failures > 0) {
    console.error(`\n${failures} of ${checks.length} ESM smoke checks failed`);
    process.exit(1);
}
console.log(`\n${checks.length} ESM smoke checks passed`);
