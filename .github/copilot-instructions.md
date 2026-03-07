# GitHub Copilot Instructions for Markdown-Transform

This repository is **Accord Project markdown-transform** — a JavaScript npm-workspaces monorepo for parsing and transforming Markdown, CommonMark, CiceroMark, and TemplateMark.

## Project context

- Runtime: Node.js `>=18`
- Package manager: `npm` (workspace root + package-level scripts)
- Languages: JavaScript (CommonJS)
- Linting: ESLint (`eslint:recommended` + strict local rules)
- Testing: Jest (most packages), Mocha (notably `packages/markdown-transform`)
- CI: GitHub Actions matrix on Ubuntu, macOS, and Windows

## Repository layout

- Root workspace packages live under `packages/`
- Primary packages include:
  - `markdown-common`
  - `markdown-cicero`
  - `markdown-template`
  - `markdown-html`
  - `markdown-it-cicero`
  - `markdown-it-template`
  - `markdown-cli`
  - `markdown-transform`
- Utility scripts are under `scripts/`

## Non-negotiable contribution requirements

1. **DCO sign-off is required on every commit**
   - Use `git commit --signoff` (or `-s`).

2. **Commit message format follows Accord Project conventions**
   - Prefer: `type(scope): description`
   - Examples seen in this repo:
     - `fix: update broken CI badge to use GitHub Actions workflow URL`
     - `chore(deps): update package dependencies`
     - `chore(actions): publish v0.16.25 to npm`

3. **Do not skip tests for behavior changes**
   - Add or update unit tests when changing logic.

## Coding standards (repo-specific)

- Use **4-space indentation**.
- Use **single quotes**.
- Use **semicolons**.
- Avoid `var`; use `const`/`let`.
- Keep braces for control flow (`curly` rule).
- Keep strict equality (`eqeqeq`).
- Add JSDoc for classes, methods, and function declarations (`require-jsdoc`).
- Prefer minimal, surgical diffs; avoid unrelated formatting churn.

## Build and test workflow

When changing code, run checks in this order:

1. `npm run build --workspaces --if-present`
2. `npm test`
3. If needed for coverage diagnostics: `npm run coverage`

For package-level iteration, run the package scripts directly inside the package folder (for example lint/test in `packages/markdown-common` or `packages/markdown-transform`).

## Dependency management rules (critical)

These are based on merged PR review feedback in this repository:

1. **Avoid broad `npm audit fix`-style dependency churn**
   - Reviewers flagged PRs where this introduced unnecessary new dependencies and unexpected downgrades.
   - Keep dependency updates intentional and minimal.

2. **Do not introduce version downgrades unless explicitly justified**
   - If downgrading is required, explain why in PR description and comments.

3. **Avoid adding new dependencies without clear rationale**
   - Reviewers repeatedly asked “Why the new deps?” across multiple package manifests.
   - Prefer updating existing dependencies over adding new ones.

4. **For core Accord dependencies, prefer exact versions when the repo already pins exact versions**
   - PR feedback explicitly pushed back on moving `@accordproject/concerto-core` from exact to caret ranges.
   - Keep versions consistent with surrounding package conventions.

5. **Keep workspace dependency versions consistent across packages**
   - If bumping a shared dependency, align all affected package manifests and lockfiles in one change.

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
   - If a review pattern repeats (e.g., “why new dependency?”, “why downgrade?”), treat it as a standing rule for future changes.
   - Prefer repository-established patterns over generic defaults.

5. **Human validation remains required**
   - AI is the first pass; maintainers decide final correctness, architecture, and release risk.

## PR quality checklist

Before proposing a PR-ready change:

- [ ] Change scope is minimal and focused
- [ ] New/updated behavior has tests
- [ ] Lint/build/tests pass
- [ ] Dependency changes are justified and minimal
- [ ] No accidental downgrades or unnecessary added packages
- [ ] Commit(s) use DCO sign-off
- [ ] PR description clearly explains **why** the change is needed

## Common pitfalls in this repo

- Adding many dependency changes in one sweep without explaining each one.
- Switching from exact to ranged versions for core dependencies without team agreement.
- Introducing dependency downgrades as side effects of automated tooling.
- Making large unrelated edits while addressing a small issue.

When in doubt, prefer small, explicit, well-tested changes that match existing package patterns.
