# Browser End-to-End Tests

[Playwright](https://playwright.dev) tests that load the UMD bundles for `markdown-html`, `markdown-template` and `markdown-transform` into a real headless Chromium and call the public API. These tests exist to catch packaging/bundling regressions that unit tests miss — for example, accidentally pulling Node-only modules like `jsdom` into the browser bundle.

## Run

From the repository root:

```bash
npm install --workspaces
npm run -w markdown-transform-e2e test
```

`npm test` from the e2e directory runs `pretest` first, which:
1. Builds each TS package (`tsc`)
2. Builds each UMD bundle (`webpack`)
3. Installs the Chromium browser used by Playwright (cached after first run)

## What's covered

| Spec | Asserts |
|------|---------|
| `markdown-html.spec.ts`      | `HtmlTransformer` exported on the global; `toHtml`/`toCiceroMark` work using the native `DOMParser` (jsdom is **not** in the browser bundle) |
| `markdown-template.spec.ts`  | `TemplateMarkTransformer` exported; `toTokens` and `normalizeNLs` work |
| `markdown-transform.spec.ts` | `transform`, `formatDescriptor`, `generateTransformationDiagram`, `TransformEngine` exported; markdown → commonmark and markdown → html transformations succeed |

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
