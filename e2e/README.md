# Browser End-to-End Tests

[Playwright](https://playwright.dev) tests that run the browser builds in a real headless Chromium and call the public API. These tests exist to catch packaging/bundling regressions that unit tests miss — for example, accidentally pulling Node-only modules like `jsdom` into a browser bundle.

Each package publishes an ES module build in `lib/esm-browser`, which bundlers select through the `browser` export condition. `esm-browser.spec.ts` bundles those builds with esbuild, as an application's bundler would, and loads the result into the page.

## Run

From the repository root:

```bash
npm install --workspaces
npm run build
npm run -w markdown-transform-e2e test
```

`npm run build` compiles each package and emits its ES module builds. `npm test` from the e2e directory then runs `pretest`, which installs the Chromium browser used by Playwright (cached after first run).

## What's covered

| Spec | Asserts |
|------|---------|
| `esm-browser.spec.ts` | every package resolves to `lib/esm-browser`; jsdom and the crypto polyfills stay out of the bundle; the `markdown-transform` API is exported; markdown → commonmark and markdown → html succeed; `toHtml`, and `toCiceroMark` with the native `DOMParser`, work; a template with a formula parses (with a name matching Node's SHA-256); `toTokens` and `normalizeNLs` work |

## Adding a test

The bundle built in `beforeAll` exposes the exports of its entry module on `window.markdownTransform`. To test another API, export it from `ENTRY` in `esm-browser.spec.ts`, then:

```ts
await loadBundle(page);

const result = await page.evaluate(() => {
    const { Something } = (window as any).markdownTransform;
    return new Something().doStuff();
});

expect(result).toBe(/* … */);
```
