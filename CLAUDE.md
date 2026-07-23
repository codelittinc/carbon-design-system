# CarbonOS Design System — working notes for Claude

This repo is a **published package**: `@codelittinc/carbon-design-system` on GitHub
Packages. Consuming apps (e.g. carbon-backbone) install it, so changes here ship
to real apps. Treat every change as a release.

## Versioning — bump `package.json` on every change

**Whenever you make a change that affects the published package, bump the
`version` in `package.json` in the same PR.** The published surface is anything
under `src/` (components, tokens, `src/styles/theme.css`) and the build/packaging
config (`tsup.config.ts`, `package.json` `exports`/`files`).

Use semver:

| Change | Bump | Example |
|--------|------|---------|
| Bug fix, style tweak, internal refactor (no API change) | **patch** | `0.1.0 → 0.1.1` |
| New component, new prop, new export (backward-compatible) | **minor** | `0.1.1 → 0.2.0` |
| Renamed/removed export, changed prop contract, token rename | **major** | `0.2.0 → 1.0.0` |

Changes that do **not** touch the published surface — Storybook stories,
`README.md`, CI config, this file — don't require a bump.

If you forget to bump, the publish on `main` is **skipped** (the registry rejects
re-publishing an existing version), so the app never receives your change. Bump.

## Publishing — automatic on `main`

`.github/workflows/publish.yml` publishes to GitHub Packages on **every push to
`main`** (plus GitHub Releases and manual dispatch). The flow is:

1. You bump `version` in your PR.
2. PR merges to `main` → the workflow builds (`pnpm run build:lib`) and publishes
   that version.
3. If the version already exists on the registry, the workflow skips publish
   instead of failing.

Do **not** publish by hand. Let `main` do it.

## Build / package facts

- `pnpm run build:lib` (tsup) emits `dist/` ESM + `.d.ts`. Entry points: the
  barrel (`.`) and the Button subpath (`./button`).
- Deps and peerDeps are externalized; the `@/` alias resolves at build time.
- Every emitted JS file must keep its `"use client"` directive — esbuild strips
  it when bundling, so `tsup.config.ts`'s `onSuccess` hook re-adds it. Don't
  remove that hook.
- `pnpm run typecheck` and `pnpm run build:lib` should both pass before merging.
