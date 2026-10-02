# Migrating to markdown-transform 2.0

Version 2.0 changes how the packages in this repository are published. They now ship ES module builds selected through an `exports` map, and the prebuilt UMD browser bundles are gone. The aim is smaller browser bundles: a bundler now takes each package's browser build and shares one copy of every dependency with the rest of the application, where the UMD bundles each carried their own copy of Concerto and about 1 MB of Node polyfills.

**Who is affected:** if you import these packages by name, from Node or through a modern bundler, probably nobody:

```js
// CommonJS — unchanged
const { TemplateMarkTransformer } = require('@accordproject/markdown-template');

// ES modules — unchanged
import { transform } from '@accordproject/markdown-transform';
```

You are affected if you:

- load a UMD bundle (`umd/markdown-*.js`) with a `<script>` tag, or read `window['markdown-transform']` and similar globals;
- import a file inside a package, such as `@accordproject/markdown-common/lib/...`;
- build with a tool that does not read the `exports` field (webpack 4, browserify, Parcel 1);
- load the same package with both `import` and `require()` in one Node process.

These commands find the first two:

```bash
grep -rnE "@accordproject/markdown-[a-z-]+/(lib|umd)/" --include=*.js --include=*.ts --include=*.mjs --include=*.html .
grep -rnE "window\[['\"]markdown-(html|template|transform)['\"]\]" .
```

## Breaking changes

### The UMD bundles are removed

`@accordproject/markdown-html`, `@accordproject/markdown-template` and `@accordproject/markdown-transform` no longer publish `umd/markdown-*.js`, and the top-level `browser` field that pointed at them is gone.

- **Bundler users** (webpack 5, Vite, Rollup, esbuild): no change is needed. These bundlers read the `browser` condition of the `exports` map, which selects `lib/esm-browser`. That build already leaves out `jsdom` and Node builtins, so the `IgnorePlugin` for `jsdom`, `process` polyfills and `resolve.fallback` entries that the UMD era called for are no longer required by these packages.
- **`<script>` tag users:** add a bundler to your build and import the packages normally. `lib/esm-browser` is a module graph, not a single file, and it imports its dependencies by package name (`markdown-it`, `dayjs`, `@xmldom/xmldom`, `@accordproject/concerto-core`, ...). Some of those are CommonJS, so an import map alone cannot load the graph in a browser. A CDN that converts npm packages to browser-ready ES modules can, but check its behaviour before relying on it.
- **Tools that do not read `exports`** (webpack 4, browserify, Parcel 1): with the `browser` field gone, these fall back to `main`, the CommonJS build for Node. Bundling it pulls in `jsdom` through `markdown-html`, which is not built to run in a browser. Upgrade to a bundler that supports `exports`.

### Deep imports no longer resolve

Each package now declares an `exports` map exposing only the package root and `./package.json`. Importing a file inside a package, for example `@accordproject/markdown-template/lib/templatemarkutil`, fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` in Node and an equivalent error in bundlers. Import from the package root instead; for example `templatemarkutil` is exported as `import { templatemarkutil } from '@accordproject/markdown-template'`. If something you need is not exported from the root, please open an issue.

### `import` and `require()` load different files

`require()` still loads the CommonJS build in `lib/`, but Node's `import` now loads the ES module build in `lib/esm/`. A process that reaches the same package both ways holds two copies of it, and an `instanceof` check fails on an object created by the other copy. Use one module system per package in a process. If a dependency of yours still uses `require()`, hand objects it created back to it rather than to your own `import`ed copy. If something fails in a way that looks impossible, run `npm ls @accordproject/markdown-template` (or the package concerned) and check that it is installed once.

### The `process` dependency is dropped

`markdown-html`, `markdown-template` and `markdown-transform` listed the `process` polyfill as a runtime dependency for the webpack builds. It is removed; if your application used it through these packages, add it to your own dependencies.

## Not breaking

- Imports from a package root, with `require()` or `import`.
- TypeScript types: `types` still points at `lib/index.d.ts`.
- The markdown-it plugins: `require('@accordproject/markdown-it-cicero')` still returns the plugin function, and `import plugin from '@accordproject/markdown-it-cicero'` gives it as the default export. The same holds for `markdown-it-template`.
- Formula names in TemplateMark. They are now computed with a pure JavaScript SHA-256 instead of Node's `crypto` module, and are identical.

## What you get

Bundling `{ TemplateMarkTransformer }` from `markdown-template` and `{ transform }` from `markdown-transform` for the browser with esbuild (`--bundle --minify`), Concerto included:

| | Minified | Gzipped |
|---|---:|---:|
| 1.1.0, through the UMD bundles | 4,571 KB | 1,341 KB |
| 2.0, through `lib/esm-browser` | 689 KB | 192 KB |
