# Changelog

All notable changes to `@codelittinc/carbon-design-system` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry corresponds to a published version. When you bump the version in
`package.json`, add a matching `## [x.y.z]` section here — the publish workflow
uses it as the GitHub Release notes.

## [1.1.0] - 2026-07-26

Closes [#17](https://github.com/codelittinc/carbon-design-system/issues/17):
`SearchSelect` is now keyboard-accessible and its trigger/dropdown can be
restyled for non-dark surfaces.

### Added

- **Keyboard navigation** for `SearchSelect`, following the standard combobox
  a11y pattern:
  - `ArrowDown` / `ArrowUp` move an active option with wrap-around. When the list
    is closed they open it **and** activate the first / last option, so
    `ArrowDown` then `Enter` selects the first result without an extra keypress.
  - `Enter` selects the active option; `Escape` closes the list.
  - Closing the list (via `Escape` or selecting an option) **returns focus to
    the trigger**, so keyboard focus never falls back to `<body>`. Tabbing out
    of the widget also closes the list, so it never lingers open with
    `aria-expanded="true"` after focus has left.
  - A single combobox is exposed: the search input is the `role="combobox"`
    (with `aria-expanded` / `aria-controls` / `aria-autocomplete="list"` /
    `aria-activedescendant`); the trigger is a plain button with
    `aria-haspopup="listbox"` + `aria-expanded`. Options are `role="option"` +
    `aria-selected` inside a `role="listbox"`, kept out of the Tab sequence
    (`tabIndex={-1}`) since focus stays on the input.
  - The active option scrolls into view and follows mouse hover.
- **Style-override props** on `SearchSelect` — `triggerClassName`,
  `contentClassName`, and `optionClassName` — each merged after the default
  classes via `cn`, so a consumer can restyle the control (trigger, dropdown
  panel, options) for a differently themed surface (e.g. a light-themed public
  page) without forking the component.

## [1.0.0] - 2026-07-26

### Removed (breaking)

- The `@codelittinc/carbon-design-system/button` subpath export. Button was the
  only component with a dedicated entry point; it duplicated the barrel's code
  and was never generalized to other components. **Import `Button` from the
  package root instead:**

  ```diff
  - import { Button } from "@codelittinc/carbon-design-system/button";
  + import { Button } from "@codelittinc/carbon-design-system";
  ```

  `dist/button.js` / `dist/button.d.ts` are no longer emitted.

---

Also fixes [#15](https://github.com/codelittinc/carbon-design-system/issues/15):
compiled components no longer ship fixed Tailwind palette utilities
(`text-amber-400`, `bg-green-500/15`, `focus:ring-amber-500/50`, …), which did
not follow a consumer's theme and failed WCAG AA on light surfaces. Components
now use adaptive semantic tokens that clear AA in **both** light and dark themes.

### Added

- Semantic color tokens in `src/styles/theme.css`, tuned per theme:
  `--color-success-soft`, `--color-error-soft`, `--color-info-soft`,
  `--color-success-border`, `--color-error-border`. Consumers who supply their
  own theme (instead of importing `/styles`) must define these — see the
  [Semantic color tokens](README.md#semantic-color-tokens-components-depend-on)
  table in the README.
- A regression test (`theme-tokens.test.tsx`) that fails if any theme-critical
  component reintroduces a fixed palette utility, plus role/label checks for
  `AccountCombobox` and `MultiStatusFilter`.

### Changed

- **AccountCombobox** selected value & account numbers: `text-amber-400` →
  `text-accent-text`; focus rings → `ring-accent/50`.
- **MultiStatusFilter** hover border, count pill, "All" control, and checked box
  now use `accent`/`accent-muted`/`accent-text` instead of fixed `amber-*`.
- **Badge** `accent`/`success`/`warning`/`error`/`info` fills → `bg-accent-muted`
  / `bg-{success,error,info}-soft`.
- **DataTable** selected-row background: `bg-amber-500/5` → `bg-accent-muted`.
- **Toast** success/error borders & fills → `border-{success,error}-border` /
  `bg-{success,error}-soft`.
- Accent chrome across **Button** (primary fill/hover), **Tabs**, **Progress**,
  **Switch**, **Checkbox**, **SearchSelect**, and all form/overlay focus rings
  now resolve through the adaptive `accent` tokens.
- Light-theme `--color-accent-muted` (amber-100) and `--color-accent-text`
  (amber-800) retuned so the accent/warning badge clears AA (was ~3.5:1).

The theme-independent `public`/`vendor` address-input variants (fixed embedded
color schemes), the decorative theme-toggle icons, and the white-on-red danger
button are unchanged by design — each already meets AA on its own surface.

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
