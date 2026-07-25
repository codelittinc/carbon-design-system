# Changelog

All notable changes to `@codelittinc/carbon-design-system` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry corresponds to a published version. When you bump the version in
`package.json`, add a matching `## [x.y.z]` section here — the publish workflow
uses it as the GitHub Release notes.

## [0.2.1] - 2026-07-25

Test infrastructure only — no change to the published component surface (`dist/`
is byte-identical to `0.2.0`).

### Added

- Test runner: Vitest + Testing Library (jsdom) via `vitest.config.ts` /
  `vitest.setup.ts` and a `pnpm test` script.
- Integration coverage for the address cluster
  (`StructuredAddressInput` + `AddressAutocomplete` + `parseGooglePlaceAddress`),
  ported from carbon-backbone. It mocks `@/lib/google-places` — this package's
  own Google Places loader seam — so the coverage can live here as the app
  deletes its local copies (carbon-backbone issue #276).

## [0.2.0] - 2026-07-25

Sync improvements that had diverged into the carbon-backbone app back into the
published components.

### Added

- `StatusBadge`: new status mappings for the renewal pipeline — `NOT_STARTED`
  (warning), `RENEWED` (success), `WENT_MTM` (info), and `VACANT_APPLICANT_PENDING`
  (accent).
- `SearchSelect`: new `autoFocus` prop. When set, the dropdown opens and the
  search input takes focus on mount — intended for use inside dialogs so a
  keyboard user can start typing immediately.

### Fixed

- `MoneyInput`: strip leading zeros while typing so a default `0` no longer
  lingers (`"05"` → `"5"`), while still preserving a lone `"0"` and the `"0"` in
  `"0.50"`.

## [0.1.1] - 2026-07-24

### Changed

- Moved `express` from `dependencies` to `devDependencies`. It is only used by
  the Storybook deploy server (`server.js`), which is not part of the published
  package, so consuming apps no longer pull `express` and its dependency tree
  into their `node_modules`.

## [0.1.0] - 2026-07-23

### Added

- Initial publishable release of the CarbonOS design system to GitHub Packages.
- Library build (tsup) emitting ESM + type declarations, with a full-barrel
  entry (`@codelittinc/carbon-design-system`) and a Button subpath
  (`@codelittinc/carbon-design-system/button`).
- Design tokens shipped as `@codelittinc/carbon-design-system/styles`
  (`theme.css`): carbon/amber palettes, semantic surface/text/border tokens,
  adaptive accent/status foreground tokens, and a light/dark theme.
- Components: Button, Badge, StatusBadge, Input, Textarea, Checkbox, Switch,
  Select, Dialog, AlertDialog, DropdownMenu, Sheet, Separator, Skeleton,
  Progress, Tabs, Tooltip, Popover, ScrollArea, Toast, EmptyState, PageHeader,
  DataTable, MoneyInput, CommandPalette, SearchSelect, AddressAutocomplete.
