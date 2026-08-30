# Changelog

All notable changes to `@codelittinc/carbon-design-system` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry corresponds to a published version. When you bump the version in
`package.json`, add a matching `## [x.y.z]` section here — the publish workflow
uses it as the GitHub Release notes.

## [1.8.0] - 2026-08-30

### Dialog: a max height, and a body that scrolls inside it

`DialogContent` had no height limit and centres itself with `-translate-y-1/2`,
so a dialog taller than the viewport ran off BOTH edges — and the top half could
not be reached at all, because the page behind does not scroll it and there is
nothing to grab. It is now capped at `85dvh`.

- **`DialogContent`** is a flex column, capped at `85dvh`, and scrolls as a whole
  if nothing inside it is set up to. That alone makes every existing dialog
  reachable, with no change at the call site.
- **New `DialogBody`** — the scrolling middle, between a pinned header and
  footer. Reach for it whenever a dialog can get long. Without it the whole
  dialog scrolls, which takes the footer with it (so the primary action ends up
  below the fold of its own dialog) and takes the close X too, since that is
  positioned against the content box.
- **`DialogHeader` and `DialogFooter`** gained `shrink-0`, so they keep their
  height against a `DialogBody` competing for the same capped space.

`dvh` rather than `vh`: on a phone `vh` measures the viewport with the browser
chrome retracted, so an `85vh` dialog is taller than the screen it is on exactly
when somebody is reaching for its buttons.

The cap is overridable — `cn` is tailwind-merge, so a `max-h-*` passed in
`className` replaces it rather than fighting it.

**Migrating: nothing is required.** To pin the header and footer, wrap the long
part:

```tsx
<DialogContent>
  <DialogHeader>…</DialogHeader>
  <DialogBody>…the long part…</DialogBody>
  <DialogFooter>…</DialogFooter>
</DialogContent>
```

One behavioural note: `DialogContent` is now `display: flex` (column) rather than
a block, so margins between its direct children no longer collapse. Dialogs built
from `DialogHeader` / `DialogFooter` are unaffected — their `mb-4` / `mt-6` did
not collapse against a typical body anyway.


## [1.7.0] - 2026-08-27

Adds a WYSIWYG editor for short prose, and the sanitizer that makes storing its
output safe. The two ship together on purpose: an editor that emits HTML is only
half of the feature, and the half that is missing is the one with the security
hole in it.

### Added

- **`RichTextEditor`** — a contenteditable field with bold, italic, bulleted and
  numbered lists, and links. Controlled, like `MoneyInput` and `SearchSelect`:

  ```tsx
  const [notes, setNotes] = useState(product.notes ?? "");

  <FormField label="Notes" htmlFor="notes">
    <RichTextEditor
      id="notes"
      value={notes}
      onChange={setNotes}
      placeholder="Add a note…"
      className="min-h-40"
    />
  </FormField>
  ```

  Pasted content is inserted as plain text, so pasting from Word or a web page
  does not carry a document's worth of markup into the field. `Cmd/Ctrl+K` opens
  the link row, which refuses any URL the sanitizer would strip — a link cannot
  appear to work and then turn back into plain text on save.

- **`sanitizeRichText`, `isRichTextEmpty`, `safeHref`, `RICH_TEXT_TAGS`** —
  exported from the package root **and** from `/utils`. Import them from
  `/utils` in a server component; from the root they come back as client
  references and throw at request time.

### The rule for storing what the editor produces

`RichTextEditor` emits raw `innerHTML` and does **not** sanitize it. That is
deliberate and is the one thing to get right when adopting it. A client is not a
trust boundary: whatever the editor produces reaches your server as a string in
a form post, and a string in a form post can say anything at all regardless of
what the editor would have done. So:

```ts
// Writing — the database holds clean markup.
await db.update(products).set({ notes: sanitizeRichText(input.notes) });

// Rendering — in a server component.
import { sanitizeRichText } from "@codelittinc/carbon-design-system/utils";

<div dangerouslySetInnerHTML={{ __html: sanitizeRichText(product.notes) }} />
```

Sanitizing on render is not redundant with sanitizing on write. It covers rows
written before the allow-list tightened, rows edited by hand in a SQL client, and
rows imported from somewhere else — the database is storage, not a trust boundary
either. `sanitizeRichText` is idempotent, so running it twice costs nothing.

**Do not sanitize inside `onChange`.** Feeding back a different string than the
editor emitted makes it treat the value as an external change, rewrite the DOM,
and drop the caret to the start of the field on every keystroke.

`sanitizeRichText` re-serializes rather than filters: it parses the input and
emits fresh markup, writing only tags from `RICH_TEXT_TAGS` and only attributes
it composes itself. No attribute from the input is ever copied to the output —
the sole exception is `<a href>`, which must survive `safeHref` (http, https and
mailto only, checked after entity decoding and control-character stripping) and
is then re-escaped. `target="_blank" rel="noopener noreferrer"` is written by the
sanitizer, never carried over. The output tree is balanced by construction.

## [1.6.0] - 2026-08-10

Gives paginated `DataTable` callers control over when the page resets, so a
background refresh stops throwing readers back to page 1.

### Added

- **`DataTable` `resetPageOn`** — a value identifying your filters. When you pass
  it, the page returns to 1 when *that* changes rather than on every `data`
  change.

  By default (prop omitted) `DataTable` keeps TanStack's `autoResetPageIndex`:
  the page resets whenever `data` changes. That is right for a filter change and
  wrong for a refresh, because both hand the table a new array — so a screen that
  re-fetches its list after editing a row bounced the reader from page 3 back to
  page 1 on every edit.

  ```tsx
  <DataTable
    columns={columns}
    data={visible}
    pageSize={10}
    resetPageOn={filterSignature}
  />
  ```

  Filter changes reset the page; a refetch of the same list leaves the reader
  where they were. Unlike remounting the table on a `key` — the workaround this
  replaces — the column sort survives.

  Nothing changes for callers that omit the prop.

## [1.5.0] - 2026-08-10

Makes the pure helpers callable from React Server Components. Additive — nothing
moves and nothing is removed.

### Added

- **`@codelittinc/carbon-design-system/utils`** — a second entry point exporting
  `cn`, `formatMoney`, `formatDate` and `formatPeriodLabel`, and nothing else.
  Unlike the package root it carries no `"use client"` directive, so a server
  component can call these:

  ```ts
  import { cn } from "@codelittinc/carbon-design-system/utils";
  ```

  The root is one bundle marked `"use client"`, because almost all of it is
  React client components. An RSC bundler applies that directive to every export
  in the module — including plain functions — so a server component that
  imported `cn` from the root received a client reference and threw when it
  called it:

  ```
  Error: Attempted to call cn() from the server but cn is on the client.
  ```

  Nothing caught it earlier: the types resolve, the bundle builds, and the page
  only fails when it renders. It took a 500 on a signed-in admin page in
  player-scoreboard-v2 to surface. **If you call `cn` (or a formatter) from a
  server component, import it from `/utils`.** Client components can keep
  importing from either.

- **Build- and test-time guards on the client boundary.** `tsup.config.ts` now
  classifies each emitted bundle as client or server-safe and fails the build if
  a bundle is unclassified, if a client bundle is missing the directive, or if
  the `utils` bundle ever gains one. A test asserts the same invariant against
  the committed `dist/`, which is what git-dependency consumers actually execute.
  Both were confirmed to fail on a deliberate violation. A new entry point must
  now be classified deliberately rather than inheriting the directive by default.

### Notes

- `cn` and the formatters remain exported from the package root, so **no
  existing import needs to change**. The root's declarations now re-export them
  from `./utils.js` rather than declaring them inline; the runtime export is
  unchanged.

## [1.4.0] - 2026-08-06

Adds data visualization to the system: a validated chart palette and the three
chart forms a dashboard actually needs.

### Added

- **Chart series tokens** in `theme.css` — `--color-chart-1` through
  `--color-chart-8`, plus `--color-chart-grid`, with separately chosen steps for
  light and dark. The eight hues are assigned to series in fixed slot order and
  never cycled; that order is what keeps adjacent series distinguishable under
  protanopia and deuteranopia, and it was validated against the real carbon
  surfaces for CVD separation, lightness band, chroma, and contrast. Don't
  reorder or hand-tune the values. Status tokens (`success`/`error`/`warning`)
  stay reserved and are never spent as a series color.
- **`ChartCard`** — the titled card a chart sits in: `title`, `subtitle`,
  right-aligned `action` for controls, and `footer`.
- **`BarChart`** — vertical or `orientation="horizontal"` (the better choice for
  long category names), grouped or `stacked`, optional `onBarClick` for
  drill-down, and direct value labels that default on for a single series over
  ≤16 bars. `colorBy="category"` is available for the case where bar colors are
  shared with another chart on the page; past the eighth category its bars go
  neutral rather than repeating a hue, and say so in the console.
- **`LineChart`** — multi-series over time, optional `area` and stacking,
  `curve` (`"linear"` default), a `referenceValue` rule for targets, and
  `toggleableSeries` so a legend click shows/hides a line. Deliberately
  single-axis: there is no second y-scale.
- **`DonutChart`** — part-to-whole with the total in the hole, a value legend,
  and automatic folding of the smallest categories into a neutral "Other" past
  `maxSlices` (default 6). Keeps input order by default so a filter change can't
  repaint entities.
- **Shared chart primitives** exported alongside them: `seriesColor`,
  `resolveSeriesColors`, `capSeries`, `formatChartValue`, `ChartLegend`,
  `ChartTooltipContent`, `ChartDataTable`, and the axis/label style constants,
  for building a chart form the three above don't cover.

Every chart renders a visually hidden data table carrying the same numbers, so
the values are reachable by screen reader — and so the three light-mode palette
slots that sit under 3:1 against white always have a text fallback.

Charts render from an internal copy of the `data` array rather than the array
you pass. Recharts holds chart data in a Redux store, and Redux Toolkit's immer
deep-freezes store state in development — passing your array straight through
would freeze it, and its row objects, in place. Your data stays yours: safe to
mutate or reuse after render.

`recharts` is a new runtime dependency (externalized in the build, so consumers
install it transitively).

## [1.3.1] - 2026-07-26

### Fixed

- **`SearchSelect` no longer lets a stale debounced `onSearch` fire after a
  selection or clear.** Selecting an option (or clicking the clear button) now
  cancels the pending debounce, so a query typed just before the choice can't
  fire afterwards and hand the parent a result set that omits the chosen option
  — which previously blanked the trigger while the value stayed selected. Adds
  tests covering cancellation on both select and clear.

## [1.3.0] - 2026-07-26

Follow-up to [#19](https://github.com/codelittinc/carbon-design-system/pull/19):
closes the `SearchSelect` accessibility gaps in the labeling props shipped in
1.2.0. The field has two focusable states — the trigger `<button>` (focused
while closed, the resting state) and the `combobox` search input (focused once
the dropdown opens) — and the 1.2.0 props only reached the trigger.

### Added

- **`ariaLabel`** on `SearchSelect` — accessible name applied as `aria-label` to
  **both** the trigger `<button>` and the search `combobox` input. An external
  `<label htmlFor={id}>` only names the trigger; once the dropdown opens, focus
  moves to the search input, which the label can't reach — so assistive tech
  announced its placeholder ("Search…") instead of the field name (e.g.
  "Purchase order"). `ariaLabel` names both elements so the field is announced
  consistently whether it's open or closed.
- **`requiredLabel`** on `SearchSelect` — screen-reader text for the closed
  trigger's required-state description (default `"Required"`; override to
  localize). Only rendered when `required` is set.

### Fixed

- **`required` is now conveyed in both focus states.** `aria-required` is not a
  supported state on the trigger's `button` role, so in 1.2.0 assistive tech
  ignored it and the field was never announced as required. It now applies
  `aria-required` to the `combobox` input (focused while open, where the state
  is valid) **and** describes the closed trigger via `aria-describedby` pointing
  to a visually-hidden `requiredLabel` hint — so the requirement is discoverable
  in the field's resting closed state, before the user opens the dropdown.

### Notes

- `ariaLabel` and `requiredLabel` are optional and additive; the required-state
  changes are a11y bug fixes with no breaking API change → **minor** bump
  `1.2.0 → 1.3.0`. Default rendering and existing consumers are unchanged.

## [1.2.0] - 2026-07-26

Follow-up to [#17](https://github.com/codelittinc/carbon-design-system/issues/17):
closes the two gaps that surfaced when `SearchSelect` replaced carbon-backbone's
hand-rolled PO picker — immediate query invalidation and trigger labeling.

### Added

- **`onQueryChange`** on `SearchSelect` — fires immediately on every keystroke,
  un-debounced, before the debounced `onSearch`. A consumer that clears a prior
  selection when the query is edited previously had to do it in `onSearch`, which
  left the stale selection live during the 300 ms debounce (long enough to submit
  the old value). `onQueryChange` invalidates it at once; `onSearch` stays the
  throttled hook for the actual fetch.
- **`id`** on `SearchSelect` — applied to the trigger `<button>` so an external
  `<label htmlFor={id}>` can name the control. The trigger is a labelable button,
  so this gives it an accessible name and makes the label click-to-focus.
- **`required`** on `SearchSelect` — marks the trigger `aria-required` so
  assistive tech announces the field as required.

### Changed

- The `LightSurfaceOverride` story now also demonstrates `id` + `<label>`,
  `required`, and `onQueryChange`-based selection invalidation.

### Notes

- All three props are optional and additive → **minor** bump `1.1.0 → 1.2.0`.
  Default rendering and existing consumers are unchanged.

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
