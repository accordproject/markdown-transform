# Browser End-to-End Tests

[Playwright](https://playwright.dev) tests that load the browser builds into a real headless Chromium and call the public API. These tests exist to catch packaging/bundling regressions that unit tests miss — for example, accidentally pulling Node-only modules like `jsdom` into the browser bundle.

Two kinds of browser build are covered:

- the UMD bundles of `markdown-html`, `markdown-template` and `markdown-transform`, loaded with a `<script>` tag;
- the ES module builds in each package's `lib/esm-browser`, which bundlers select through the `browser` export condition. `esm-browser.spec.ts` bundles them with esbuild, as an application's bundler would, and loads the result.

## Run

From the repository root:

```bash
npm install --workspaces
npm run build
npm run -w markdown-transform-e2e test
```

`npm run build` compiles each package and emits its ES module builds. `npm test` from the e2e directory then runs `pretest`, which:
1. Builds each UMD bundle (`webpack`)
2. Installs the Chromium browser used by Playwright (cached after first run)

## What's covered

| Spec | Asserts |
|------|---------|
| `markdown-html.spec.ts`      | `HtmlTransformer` exported on the global; `toHtml`/`toCiceroMark` work using the native `DOMParser` (jsdom is **not** in the browser bundle) |
| `markdown-template.spec.ts`  | `TemplateMarkTransformer` exported; `toTokens` and `normalizeNLs` work |
| `markdown-transform.spec.ts` | `transform`, `formatDescriptor`, `generateTransformationDiagram`, `TransformEngine` exported; markdown → commonmark and markdown → html transformations succeed |
| `esm-browser.spec.ts`        | every package resolves to `lib/esm-browser`; jsdom and the crypto polyfills stay out of the bundle; markdown → html, `toCiceroMark` with the native `DOMParser`, and a template with a formula (whose name matches Node's SHA-256) work |

## Adding a test

Each UMD bundle exports its API onto `window['<package-name>']` (e.g. `window['markdown-html']`). Spec pattern:

```ts
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ path: path.resolve(__dirname, '../../packages/<pkg>/umd/<pkg>.js') });

const result = await page.evaluate(() => {
    const { Something } = (window as any)['<pkg>'];
    return new Something().doStuff();
});

expect(result).toBe(/* … */);
```
