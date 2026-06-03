# GitHub Copilot Instructions for Markdown-Transform

This repository is **Accord Project markdown-transform** — a TypeScript npm-workspaces monorepo for parsing and transforming Markdown, CommonMark, CiceroMark, and TemplateMark.

## Project context

- Runtime: Node.js `>=22`
- Package manager: `npm` (workspace root + package-level scripts)
- Language: **TypeScript** (target `ES2020`, `module: commonjs`). Source lives in `packages/*/src/`; compiled `.js` + `.d.ts` are emitted to `packages/*/lib/`.
- Build: `tsc` per package (config extends `tsconfig.base.json`).
- Linting: ESLint with `@typescript-eslint` (4-space indent, single quotes, semicolons).
- Unit testing: **Jest 29 + ts-jest** across every package. The legacy mocha+chai suites were removed during the TS migration.
- Browser E2E: **Playwright** under `e2e/` exercises the UMD bundles in headless Chromium.
- Bundling: `webpack 5` produces UMD bundles for `markdown-html`, `markdown-template`, `markdown-transform` (the three user-facing entry points). The other packages are CommonJS library deps consumed via bundlers.
- CI: GitHub Actions matrix on Ubuntu, macOS, and Windows for unit tests; Ubuntu-only for Playwright e2e.

## Repository layout

- `packages/` — eight publishable packages:
  - `markdown-common`
  - `markdown-cicero`
  - `markdown-template`     *(also UMD)*
  - `markdown-html`         *(also UMD)*
  - `markdown-it-cicero`
  - `markdown-it-template`
  - `markdown-cli`
  - `markdown-transform`    *(umbrella, also UMD)*
- `e2e/` — browser end-to-end tests (Playwright). Not published.
- `scripts/` — repo-level utilities (model generation, version bumping, coverage aggregation).
- `tsconfig.base.json` — shared compiler options inherited by every package.

Concerto models for CommonMark/CiceroMark/TemplateMark are downloaded by `scripts/external/getExternalModels.js` (run via `npm run models:get` / triggered as `postinstall`) and emitted as TS into `packages/markdown-common/src/externalModels/`. Treat those files as generated.

## Non-negotiable contribution requirements

1. **DCO sign-off is required on every commit**
   - Use `git commit --signoff` (or `-s`).

2. **Commit message format follows Accord Project conventions**
   - Prefer: `type(scope): description`
   - Examples seen in this repo:
     - `fix: update broken CI badge to use GitHub Actions workflow URL`
     - `chore(deps): update package dependencies`
     - `chore(actions): publish v1.0.0 to npm`

3. **Do not skip tests for behavior changes**
   - Add or update unit tests when changing logic; add a Playwright e2e test if the change affects the browser bundle surface.

## Coding standards (repo-specific)

- TypeScript only for new code. Avoid reintroducing `.js` files in `src/`.
- 4-space indentation, single quotes, semicolons.
- Prefer `const`/`let` (no `var`), keep braces (`curly`), strict equality (`eqeqeq`).
- The TS config is pragmatic — `strict: false`, `noImplicitAny: false` — so visitor/AST code uses `any` liberally. That is intentional: don't tighten types in unrelated files while fixing something else.
- Don't add JSDoc that simply restates the function signature; reserve comments for non-obvious *why*.
- Prefer minimal, surgical diffs; avoid unrelated formatting churn.

## Build and test workflow

When changing code, run checks in this order:

1. `npm run build` — runs `tsc` per workspace (also rebuilds before tests via each package's `pretest`).
2. `npm test` — runs the full Jest suite across every package.
3. `npm run -w markdown-transform-e2e test` — Playwright browser tests; only needed if you changed source that ends up in a UMD bundle.
4. `npm run coverage` — coverage aggregation (only if investigating coverage).

For package-level iteration, `cd packages/<name>` and run `npm run build`, `npm test`, etc. directly. For the umbrella package, also run `npm run webpack` after `npm run build` to refresh the UMD bundle.

When migrating Concerto: `@accordproject/concerto-core` is on **v4**. `new ModelManager({ strict: true })` is no longer valid — drop the option, don't cast to `any`. The model manager defaults are equivalent in v4.

## Dependency management rules (critical)

These are based on merged PR review feedback in this repository:

1. **Avoid broad `npm audit fix`-style dependency churn**
   - Reviewers flagged PRs where this introduced unnecessary new dependencies and unexpected downgrades.
   - Keep dependency updates intentional and minimal.

2. **Do not introduce version downgrades unless explicitly justified**
   - If downgrading is required, explain why in PR description and comments.

3. **Avoid adding new dependencies without clear rationale**
   - Reviewers repeatedly asked "Why the new deps?" across multiple package manifests.
   - Prefer updating existing dependencies over adding new ones.

4. **For core Accord dependencies, prefer exact versions when the repo already pins exact versions**
   - PR feedback explicitly pushed back on moving `@accordproject/concerto-core` from exact to caret ranges.
   - Keep versions consistent with surrounding package conventions.

5. **Keep workspace dependency versions consistent across packages**
   - If bumping a shared dependency, align all affected package manifests and lockfiles in one change.

6. **Browser polyfills only when strictly needed**
   - The webpack configs use `webpack.ProvidePlugin({ process: 'process/browser' })` and `resolve.alias = { jsdom: false }` to keep UMD bundles slim. Don't add Node polyfills unless a real test fails without them.

## Publishing & npm packages

- `package.json` `files` field for every publishable package is `["lib"]` (or `["lib", "umd"]` for the three UMD packages). `src/`, tests, snapshots, jest config, eslint config, and tsconfig stay out of the tarball.
- `main: "lib/index.js"`, `types: "lib/index.d.ts"`. The three UMD packages also set `browser: "umd/markdown-X.js"` so bundlers serving browser targets pick the UMD bundle automatically.
- Source maps (`*.js.map`) **are** shipped — keep `sourceMap: true` in `tsconfig.base.json` so consumer stack traces stay useful.

## AI review behavior (adapted from best-practice guidance)

Copilot suggestions should follow a **human-in-the-loop**, high-signal workflow:

1. **Clear expectations**
   - Use AI for concrete fixes: lint issues, test gaps, defensive checks, and small refactors.
   - Do not auto-apply broad architecture rewrites without explicit request.

2. **Actionable feedback only**
   - Prioritize issues that are high impact and verifiable.
   - If suggesting a change, include the specific reason and expected effect.

3. **Security-first**
   - Be cautious with code touching file operations, network requests, parsing, or dependency updates.
   - Do not trade security for convenience.

4. **Continuous learning loop**
   - If a review pattern repeats (e.g., "why new dependency?", "why downgrade?"), treat it as a standing rule for future changes.
   - Prefer repository-established patterns over generic defaults.

5. **Human validation remains required**
   - AI is the first pass; maintainers decide final correctness, architecture, and release risk.

## PR quality checklist

Before proposing a PR-ready change:

- [ ] Change scope is minimal and focused
- [ ] New/updated behavior has tests (unit and, where relevant, Playwright e2e)
- [ ] Lint/build/tests pass
- [ ] `npm pack --dry-run` for any package whose contents changed shows only `lib/` (+ optional `umd/`) — no tests, snapshots, or configs leaking
- [ ] Dependency changes are justified and minimal
- [ ] No accidental downgrades or unnecessary added packages
- [ ] Commit(s) use DCO sign-off
- [ ] PR description clearly explains **why** the change is needed

## Common pitfalls in this repo

- Mixing `.js` and `.ts` in `src/` — the source tree is TypeScript only.
- Forgetting to rebuild UMD bundles (`npm run webpack -w …`) after source changes; the Playwright e2e tests will then test stale code.
- Adding broad type tightening (`noImplicitAny`, `strict`) in unrelated files while fixing a small bug — out of scope, expand `any` only where the change is needed.
- Adding many dependency changes in one sweep without explaining each one.
- Switching from exact to ranged versions for core dependencies without team agreement.
- Re-introducing `npm install`-time `prepare`/`build` scripts. Build is a separate explicit step now (`npm run build`), keeping `npm install` fast and resilient to broken intermediate states.

When in doubt, prefer small, explicit, well-tested changes that match existing package patterns.
