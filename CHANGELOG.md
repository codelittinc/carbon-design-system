# Changelog

All notable changes to `@codelittinc/carbon-design-system` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry corresponds to a published version. When you bump the version in
`package.json`, add a matching `## [x.y.z]` section here — the publish workflow
uses it as the GitHub Release notes.

## [1.25.0] - 2026-10-09

### Added

- App-shell navigation icons in the curated set: `ClipboardCheckIcon`, `LayoutDashboardIcon`,
  `LayersIcon`, `LogOutIcon`, `MapPinIcon`, `PanelLeftIcon`, `PanelLeftCloseIcon`,
  `SettingsIcon` and `WalletIcon` (lucide `ClipboardCheck`, `LayoutDashboard`, `Layers`,
  `LogOut`, `MapPin`, `PanelLeft`, `PanelLeftClose`, `Settings`, `Wallet`). They let an app draw
  the Carbon sidebar (icon nav, collapse rail, sign-out item) without importing `lucide-react`.

## [1.24.1] - 2026-10-08

### Fixed

- `themeScript()` and `THEME_SCRIPT` can now be called from a server component (a Next.js
  root layout). They are exported from the server-safe `@codelittinc/carbon-design-system/utils`
  entry, which has no `"use client"` directive. Imported from the package root they came back
  as client references and failed the build with "Attempted to call themeScript() from the
  server". Root-entry exports are unchanged, so existing client imports keep working.

## [1.24.0] - 2026-10-08

### Added

- `FilterBar` `searchLabel` prop: the search input's accessible name (`aria-label`). It
  defaults to `searchPlaceholder`, so every search box now has a name that
  `getByRole("textbox", { name })` and screen readers can find.
- `themeScript({ defaultTheme })`: builds the no-flash theme script with a chosen fallback
  (`"light"` or `"dark"`) for when nothing is saved. `THEME_SCRIPT` is unchanged and equals
  `themeScript()` (dark fallback).
- `ThemeProvider` `defaultTheme` prop: the theme to fall back to when `initialTheme` is
  omitted. It never overrides the user's saved choice: on mount the provider uses the class
  the theme script set, else the saved theme (when `persist`), else `defaultTheme`. Server and
  first client render assume it. Pass the same value to `themeScript({ defaultTheme })`.
- `MenuIcon` (hamburger, lucide `Menu`) in the icon set.

## [1.23.1] - 2026-10-08

### Fixed

- Preserve exact decimal-string cents in `formatMoney`, `Money`, and blurred `MoneyInput` displays, including amounts beyond JavaScript's safe integer range. Monetary rounding uses half-up cents without converting strings to floating-point numbers.
- A decimal string that rounds to zero cents (for example `-0.004`) displays `$0.00`, not `($0.00)`.

## [1.23.0] - 2026-10-08

### Added

- `AddressCombobox` provider mode: `fetchSuggestions(query, { signal })`, `onSelect`,
  `onStatusChange`, optional shared-status suppression and attribution. Provider mode never
  loads Google scripts; lookups debounce, abort stale requests and time out after ten seconds.
  Existing Google/structured-address behavior remains the default.

## [1.22.0] - 2026-10-07

### Added: `@codelittinc/carbon-design-system/tokens`, every colour as a plain value

`colorTokens.dark` and `colorTokens.light` hold every `--color-*` token in
`theme.css` as a literal CSS value, with each `var()` reference resolved. They
are for places that cannot read a CSS variable, so they can still take their
colours from the design system rather than copying hex values: a PDF renderer
(react-pdf), an HTML email, or a site that does not use Tailwind (Docusaurus).

```ts
import { colorTokens } from "@codelittinc/carbon-design-system/tokens";
colorTokens.light["text-primary"]; // "#18181b"
colorTokens.dark.accent;           // "#f59e0b"
```

- `dark` is the default theme (`@theme` + `@theme static`); `light` applies
  `.light`. `.dark` must restate `@theme`, not change it: a `.dark` value that
  differs fails the build, since the app's default (no theme class) and every
  PDF and email would otherwise show different colours. The category fills are the same in both, as in
  the stylesheet.
- A solid colour is `#rrggbb` and a translucent one is `rgba(r, g, b, a)`
  (today only `table-stripe` / `table-row-hover`): the forms react-pdf and
  email clients read. The generator converts `theme.css`'s `rgb(r g b / a%)` and fails the
  build on any colour syntax it cannot convert (oklch, hsl, named colours).
  Every `--color-*` declaration must sit directly in `@theme`, `@theme static`,
  `.dark` or `.light`; one anywhere else (`html.light`, an `@media` inside
  `.light`) fails the build, since it has no single plain value and would
  otherwise leave PDFs and emails on the old colour.
  Outlook desktop ignores alpha, so in an email set those two over an opaque
  background and treat them as optional.
- Types: `ColorTheme` (`"dark" | "light"`) and `ColorToken` (every token name).
- `src/tokens.ts` is **generated** from `theme.css` by
  `scripts/generate-tokens.mjs` (`pnpm tokens:generate`), and `build:lib`
  regenerates it before bundling. `test/tokens.test.ts` fails when the
  committed file and `theme.css` disagree, and
  `test/dist-client-boundary.test.ts` fails when the committed
  `dist/tokens.js` or `dist/tokens.d.ts` differs from `src/tokens.ts`. `theme.css` stays the one
  source.
- A server-safe entry: no React, no `"use client"`, nothing but the object.
  Browser apps should keep using the utilities and `var(--color-…)`, which
  follow a theme switch; these values do not.

## [1.21.0] - 2026-10-07

### Changed: warning badges, alerts and toasts are yellow, not accent amber

**Visual change.** `Badge variant="warning"`, `Alert variant="warning"`,
`toast.warning()` and every `StatusBadge` status that maps to warning
(`PENDING`, `PENDING_APPROVAL`, `NOTICE`, `NOT_STARTED`, `SOFT_CLOSED`) now
use the `warning-soft` / `warning-text` / `warning-border` tokens added in
1.20.0. Before, they borrowed the accent's amber, so a caution looked the
same as `Badge variant="accent"`. The two are now distinct. `accent` is
unchanged.

### Added: `info-border` and `info-muted`

`info` was the other status missing tokens, so `border-info-border` compiled
to nothing. Both now exist (`info-border` in the default, `.light` and `.dark`
blocks; `info-muted` once, fixed in both themes like the other `-muted`
tokens). All four statuses now carry the same set, and
`test/status-tokens.test.ts` keeps it that way.

**Also visual:** warning and info `Alert`s and toasts get a tinted border
(`border-warning-border`, `border-info-border`) where they had the neutral
`border-border`, matching success and error.

## [1.20.0] - 2026-10-07

### Added: warning status tokens

`warning` was the only status with no adaptive tokens, so `bg-warning-soft`,
`text-warning-text` and `border-warning-border` compiled to nothing: a caution
banner built from them rendered with no tint and body-coloured text, in both
themes, with no build error (#25). They now exist in the default, `.light` and
`.dark` blocks, alongside the success and error sets:

| Token | Dark | Light |
|---|---|---|
| `--color-warning-text` | `#facc15` | `#a16207` |
| `--color-warning-soft` | `#262010` | `#fef9c3` |
| `--color-warning-border` | `#524517` | `#fef08a` |
| `--color-warning-muted` | `#713f12` (fixed, like `success-muted` / `error-muted`) | |

`warning-text` on `warning-soft` is 10.6:1 in dark and 4.58:1 in light, which
passes WCAG AA. The text is yellow, not the accent's amber, so a caution
doesn't read as a highlight.

Apps already using these classes start rendering the tint with no change on
their side. `Badge`, `Alert` and `Toast` look the same as before: their warning
tone still borrows the accent, and moving them onto these tokens is a separate
visual change.

## [1.19.0] - 2026-10-06

### Added: `FileViewer`

A file in a dialog over the page, so Backstage and Hirelitt can drop their own
copies of the same viewer. Additive only.

- **Formats:** PDF in the browser's own viewer; Word (`.docx`) laid out as
  pages by docx-preview, with Symbol/Wingdings bullets shown as real bullets,
  unsafe links (`javascript:`, `data:`, relative, control-character tricks)
  turned into plain text, external links opened in a new tab, and embedded
  HTML (altChunks) never rendered; CSV as a `Table` (delimiter detected,
  quoted fields kept whole, ragged rows padded, first 1,000 rows, UTF-8 or
  windows-1252); PNG, JPEG, GIF, BMP, WebP and AVIF images; plain text (first
  200k characters). Anything else offers a Download.
- **Usage:** wrap any trigger that forwards its ref (a `Button` of any
  variant), or pass `open` / `onOpenChange`. Clicks on the trigger and inside
  the dialog don't reach the trigger's ancestors, so it can sit in a clickable
  card. Every open fetches the file afresh.
- **Choosing the renderer:** `contentType` when given, else the response's
  `Content-Type`. The extension is read only when the type is
  `application/octet-stream` or missing; a `.csv` sent as
  `application/vnd.ms-excel` or `text/plain` is still a CSV.
- **`loadFallback`**, optional: called for a legacy `.doc` (`reason: "doc"`),
  a `.docx` that can't be laid out (`"render-failed"`) and other types
  (`"unsupported"`), with the URL, filename, resolved type and an
  `AbortSignal`. Return `{ text, note? }` or `{ html }` (the viewer sanitises
  it again), or nothing for the Download. Types: `FileViewerProps`,
  `FileViewerFallback`, `FileViewerFallbackRequest`,
  `FileViewerFallbackContent`, `FileViewerFallbackReason`.
- **New dependencies:** `docx-preview` and `papaparse`. Both are reached only
  through dynamic imports, so an app's bundler loads them the first time a
  DOCX or a CSV opens, and pages that never open one don't ship them.
- **Stylesheet:** the fallback-HTML typography is in
  `@codelittinc/carbon-design-system/styles`, and the DOCX page styling ships
  with the component. Apps that copied the `.docx-host` /
  `.document-preview` rules can delete them.
- **DOCX is isolated:** the document renders in a shadow root, so the
  stylesheet docx-preview builds from the file (which a crafted `.docx` can
  write rules into) styles the document only, never the app page, and a
  `contain: paint` wrapper keeps the document from covering the dialog's
  header. Embedded
  fonts are not loaded; text uses the font families the document names.
- **What the app must provide:** PDFs are framed, so the file route must allow
  same-origin framing (`X-Frame-Options: SAMEORIGIN` /
  `frame-ancestors 'self'`). DOCX needs `img-src data:` and
  `style-src 'unsafe-inline'` in a CSP. Download saves under `filename` only
  for same-origin URLs. See the README.

## [1.18.0] - 2026-10-06

### Added: what Backstage needs to stop hand-rolling UI

Additive only. Each item extends an existing component where one fits, and
comes with stories and tests.

- **`Swatch`** (`color`, `size: "xs" | "sm" | "md"`, `dimmed`, `label`,
  `title`): the round color key. `ChartLegend`, the chart tooltips,
  `DonutChart`'s legend and `StatusIndicator` all draw it.
- **`ChartLegendItem.value`**: a figure at the end of a legend entry (a share,
  a total). With values, the legend lists its entries in a column.
  `DonutChart`'s legend is now a `ChartLegend`.
- **`StatusIndicator` `nativeTitle`** (default `true`): pass `false` inside a
  `Tooltip`, so the reader sees one tooltip instead of two. The dot keeps its
  accessible name.
- **`CardHeader`** (`title`, `description`, `actions`,
  `as: "h2" | "h3" | "h4"` (default `h2`), `size: "sm" | "md"`): a section's
  heading row. `ChartCard`, and `TimesheetTable`'s day panel and time-off
  list, use it. `PageHeader` stays the page's `h1`. The time-off list's
  heading is still an `h2`, but now reads "Time off this week" / "Time off
  this month" (it was "Time Off This Week" / "… Month") and is drawn as a
  card title rather than the small-caps label: a test that finds it by name
  needs the new text.
- **`TextLink`**: an inline link, accent and underlined on hover, with no
  button box. `asChild` styles a router's link. `external` opens a new tab and
  shows the external icon, with "(opens in a new tab)" for screen readers; it
  adds `noopener noreferrer` to any `rel` you pass (`rel="nofollow"` stays).
  `TextLink` and `Button variant="link"` share one link style.
- **Icons**: the package re-exports lucide icons with an `Icon` suffix
  (`SearchIcon`, `TrashIcon`, `ChevronDownIcon`, …, plus the `IconComponent`
  and `IconProps` types). The full list is in `icons.ts` and the README. It is
  a short, curated list re-exported from the package's single bundle, so
  whether unimported icons are dropped is up to your bundler.
- **`SearchSelect`**:
  - `selectedOption` shows the chosen option when it isn't in `options`.
  - An option can be `disabled`: it's shown, the arrow keys skip it, and it
    can't be picked.
  - A `disabled` prop disables the trigger, and closes the list if it is
    open (enabling it again leaves the list closed).
  - The `SearchSelectOption` type is exported.
- **`Select`**: a `SelectItem` may have `value=""` for an "All" or "None"
  choice, with no sentinel. `value` and `onValueChange` see `""`, and a form
  submits `""`. Without such an item, `""` still shows the placeholder. With
  an empty item the field is submitted from Carbon's own hidden input, which
  honours `disabled` (nothing is submitted) and `form`, as Radix's does.
- **`useConfirm()` + `ConfirmProvider`**:
  `confirm({ title, description, confirmLabel, cancelLabel, destructive })`
  returns `Promise<boolean>` and is built on `AlertDialog`. Mount the provider
  once (beside `ToastProvider`). Without one, `useConfirm` throws. On close
  (the action, Cancel or Escape) focus goes back to whatever had it when
  `confirm()` was called, if it is still on the page. A provider that unmounts
  with a question open answers it `false`.
  **`AlertDialogAction` `tone="destructive"`** draws the destructive button,
  the same prop as `Button`'s.
- **`Button` `tone="destructive"`**: with `outline`, `ghost` or `link`, a red,
  token-based quiet delete. On the default variant it is the solid destructive
  button, with the same token fallbacks as `variant="destructive"`.
- **`StatCard`**:
  - `action` sits top right, level with the label.
  - `children` render under the value.
  - `valueClassName` is merged onto the value.
- **`DataTable` footer row**: give a column TanStack's own `footer` (a string,
  or `({ table }) => …`) and the table renders a `TableFooter` row with the
  column's alignment and classes. This is how you show totals.
- **`Progress` `tone`**: `"accent"` (default), `"success"`, `"warning"`,
  `"error"` or `"info"`. `TimesheetTable`'s hours bar is now a `Progress`
  ("Hours logged of expected"), so it is a `progressbar` to assistive tech.
  The fill now respects `max`: before, `value={50} max={200}` drew 50%. The
  value is clamped to `[0, max]` for the bar and for `aria-valuenow`, so an
  overrun is a full bar, and a `max` that is not above 0 is treated as 100.
- **`PageHeader` `back`** (`{ href, label, as? }`): a back link above the
  title. `as` takes your router's link component, Next's `Link` for example.
- **`EmptyState` `as`** (`"h1" | "h2" | "h3" | "h4"`, default `h3`): use `h1`
  when the empty state is the whole page ("Access denied").

## [1.17.3] - 2026-10-06

### Fixed: copies of shared markup merged, with the bugs they carried

No API changes: no export, prop or variant was added, renamed or removed. Some
things look slightly different, and a few accessible names changed (listed
under "Tests may need updating").

- **`FormField`** draws `Label`, so its required `*` is hidden from screen
  readers like `Label`'s. The error or hint now **describes the control**: a
  single child element gets `aria-describedby` pointing at it (added to any it
  already has), and `aria-invalid` while there is an error, which is also
  announced (`role="alert"`). The ids come from `htmlFor`, or a generated id
  without it. The error is `text-error-text` and the hint `text-text-muted`,
  so both clear AA in the light theme. A `required` field also sets
  `aria-required` on the control, unless it already sets `required` or
  `aria-required` itself. With a `Select` child these props go to the
  `SelectTrigger` among the `Select`'s direct children (the `Select` itself is
  Radix's Root and renders nothing); a trigger nested deeper needs
  `aria-describedby` / `aria-invalid` / `aria-required` passed by hand.
- **`StructuredAddressInput`** builds each field from `FormField`. Required
  fields no longer write `" *"` into the label text and the street field's
  name: the field is named "City", not "City *", and its `required` state is
  what a screen reader announces.
- **`DataTable`** pages with `Pagination` ("Showing 1–25 of 57", numbered
  pages) instead of its own pager. Its buttons have names, and none submits a
  `<form>` around the table any more. The sort control is a button inside the
  heading, so it is reachable from the keyboard; `aria-sort` stays on the
  heading. A text header is the button, and wraps onto a second line as the
  heading did (no ellipsis); a header the column renders itself (a function,
  which may hold its own button or link) stays as given, with a small sort
  button ("Sort by <column id>") beside it, so no button is nested in another.
  When the data shrinks under the current page (a refetch with `resetPageOn`
  holding the page), the table moves to the last page that exists instead of
  showing an empty one.
- **`Pagination`**: every button is `type="button"`.
- **`Dialog` / `Sheet`**: the close X is a named button ("Close") instead of an
  unnamed icon. **`AlertDialog`** gets Dialog's `85dvh` cap and flex column, and
  its header and footer are Dialog's (with `shrink-0`), so a long confirmation
  keeps its buttons on screen; put a `DialogBody` between them to scroll the
  middle. The dialogs share one overlay and one surface.
- **`Toast`** draws its success / error / info / warning toasts as the matching
  `Alert` tone (the text takes the tone's colour too). `Alert`, `Toast` and
  `Badge` read one tone map, and `Tag`, `Alert`, `Toast` and the dialog close
  share one dismiss button.
- **`Button` `destructive`** uses theme tokens: the new `--color-error-solid`
  fill and `--color-error-foreground` text (fixed in both themes; red-600 as
  before, hover red-500), with those values as fallbacks, so it stays red on a
  theme that does not define them. **`Switch`**'s thumb is `carbon-50` instead of
  `bg-white`.
- **Address pickers**: the `public` and `vendor` variants of
  `AddressAutocomplete` / `AddressCombobox` and `StructuredAddressInput` keep
  their pinned schemes (public always dark, vendor always light), now drawn
  with the theme's tokens scoped by the `dark` / `light` class; only the vendor
  portal's emerald focus ring and highlight are written out.
- **`ChartCard` and `StatCard`** are `Card`s, so every card has the same edge:
  the `border` token (they used `border-subtle`). `StatCard`'s label is the
  shared small-caps label (`text-xs`, `text-text-muted`).
- **`ChartLegend`**'s toggles are `Button`s. `BarChart` and `LineChart` share
  their series state and legend code, and `DonutChart` renders its
  screen-reader table with `ChartDataTable`.
- **`formatDate`** shows a date-only string as that calendar day wherever the
  reader is: `"2026-09-12"` was "Sep 11, 2026" in the Americas. A full
  timestamp is still shown in the reader's zone, so a calendar day that
  arrives as midnight UTC (a Prisma `@db.Date` column,
  `"2026-09-12T00:00:00.000Z"`) is still a day early there: pass its date key,
  `value.slice(0, 10)`.
- **`monthOfKey`** reads a key the way `parseDateKey` does: an ISO instant by its
  date part, and a day that does not exist (`"2026-02-30"`) is `null`.
- **`MoneyInput`** formats with the same code as `formatMoney`, and
  `formatPeriodLabel` and `DateRangePicker` share one source of month names.
- **Calendars**: `MonthCalendar`, `EventCalendar` and `TimesheetTable` share
  one previous / next / today header, and `EventCalendar` and the timesheet's
  month view one month grid. The timesheet's month is now a table (rows,
  weekday column headers, a cell per day named by its date), as
  `EventCalendar`'s is. The timesheet's header is the calendar's: the period as
  a heading, then Today and two arrow buttons. Weekday headers are
  `text-text-muted`, which clears AA, in `EventCalendar` and `MonthCalendar`
  (whose weekday letters were `text-text-faint`) alike; the timesheet keeps
  its dimmed Sat / Sun headers to match its dimmed weekend days.
- **Tables**: one empty-row and one row-hover style for `DataTable` and the
  timesheet tables.
- **Shared looks**: one floating-panel surface (Popover, HoverCard, menus,
  Select and the comboboxes' lists), one option row, one field box (Input,
  Textarea, `SelectTrigger`, `SearchSelect`'s trigger) and one small-caps label.
  Field focus rings are `focus-visible` throughout (`SelectTrigger` and
  `SearchSelect` showed one after a mouse click), and `SearchSelect`'s trigger
  has the fields' disabled style.

### Custom themes: define the new tokens and scopes

If your app supplies its own theme instead of importing
`@codelittinc/carbon-design-system/styles`, define the two new tokens,
`--color-error-solid` (the destructive fill) and `--color-error-foreground`
(its text). `Button` falls back to red-600 and carbon-50 without them, but your
own values win once they exist. The address pickers' `public` and `vendor`
variants also need your theme's tokens scoped under `.dark` and `.light`
classes, as `theme.css` does; without those scopes they follow the page's
theme instead of keeping their fixed scheme.

### Tests may need updating

- The dialog and sheet close button: find it by role and name,
  `getByRole("button", { name: "Close" })`.
- `TimesheetTable`'s "Prev" / "Next" buttons are now "Previous week" / "Next
  week" (or "… month" in the month view).
- `DataTable`'s pager: "Previous page", "Next page" and "Page N"; the "N / M"
  and "N row(s)" text is gone. Sort by clicking the button in the heading
  (`getByRole("button", { name: /Name/ })`), not the heading cell; for a
  header rendered by a function, the "Sort by <column id>" button.
- `StructuredAddressInput`'s fields are named without the `*` ("City").

### Internal

- `test/composed-components.test.ts` checks every component file instead of an
  opt-in list, and also flags a raw `<label>`, `role="option" | "button" |
  "dialog"`, a `document` mousedown listener and a `fixed inset-0` overlay. The
  four hand-rolled comboboxes and `CommandPalette` are listed with the 2.0 item
  that replaces them. Each allowance names the tags it covers (`chart` may use
  the table elements, not a `<button>`), so an allowlisted file cannot add a
  different raw control.
- `src/index.ts` names `lib/calendar`'s public exports one by one (the same
  ones), so the module can also hold internal helpers.
## [1.17.2] - 2026-10-06

### Fixed

- **`CommandPalette`**: Escape now closes the palette wherever focus is while
  it is open. It used to work only while focus was inside the panel, so once
  focus dropped to `<body>` (a click on the panel's padding, say) Escape did
  nothing. An Escape the panel or a nearer control already handled is left
  alone, so one press still closes only one thing. No API change.

## [1.17.1] - 2026-10-06

### Fixed

- **`DataTable`**: a table wider than its container now scrolls horizontally
  inside its bordered box. It used to overflow to the right and push the page
  sideways, which a wide table — a worklist with a dozen columns — always did
  at ordinary laptop widths. No API change.

## [1.17.0] - 2026-10-06

### New components: TimesheetTable, EventCalendar, CategoryChip, StatusIndicator, CheckboxGroup, HoverCard, Table

Added while moving Backstage off the Backstage design system, which had these and
Carbon did not. Each is built on the semantic tokens, so it works in both themes.

- **`TimesheetTable`**: a person's hours per contract per day, in a weekly grid
  or a monthly calendar, with expected hours, time off and a progress summary.
  Edits save 15 seconds after the last change (or with Save, or on navigating),
  only changed cells are sent, and "Revert" undoes a save for 5 seconds. The
  props, the `TimesheetApi` shape and `createDefaultApi(baseUrl, headers)` are
  the Backstage design system's, unchanged, so existing call sites keep working.
  Types: `TimesheetTableProps`, `TimesheetContract`, `TimesheetEntry`,
  `TimesheetApi`, `TimeEntryResponse`, `ExpectedHoursResponse`, `SaveResponse`,
  `TimesheetTimeOff`, `TimesheetViewMode`, `TimesheetGridData`. A failed load
  now shows an inline error with "Try again" as well as the error toast.
  "Today" is the reader's local day (as in `MonthCalendar`), not the UTC one,
  so in the Americas the current day no longer flips to tomorrow in the
  evening.

  Fixed against the Backstage version:
  - A failed save no longer loses edits on Prev, Next, Today or a view
    switch: the table stays on the period, the grid stays unsaved with Save,
    and the error toast is shown.
  - `api`, `apiHeaders` and `onNavigate` can be passed inline. They are read
    when used, so a parent re-render no longer refetches and wipes the edits,
    and `onNavigate` fires only when the period changes. A new `baseUrl`
    still refetches.
  - A failed Revert leaves the reverted values on screen, unsaved, with Save,
    instead of looking saved.
  - Typing into an empty cell and clearing it again is no longer an unsaved
    change.
  - The hours cells are text inputs with a decimal keypad (as `MoneyInput`),
    not number inputs, so Left and Right at the edge of a value move between
    weekly cells, as they always meant to. Only 0–24 with up to two decimals
    is taken. Tests that found them by the `spinbutton` role should use
    `textbox` (or the label).
  - Escape in the month view's inline hours field closes it and puts focus
    back on the day.
- **`EventCalendar`**: a month grid of items per day (who is off, what is
  due), generic over the item type, with a "+N more" popover past
  `maxVisibleItems`. The Backstage design system's `MonthCalendar` under a new
  name, because Carbon's `MonthCalendar` is a day picker. Its API matches
  Carbon's `MonthCalendar`, not the old one: `month` is a `YearMonth`
  (`{ year, month }`) and `onMonthChange` gets one, where the old component
  took `"YYYY-MM"` strings. **Weeks start on Monday**, and days outside the
  month are blank (the old one started on Sunday and showed the neighbouring
  months' days). It is a `role="table"` (rows, `columnheader` weekdays and
  `cell` days), not a `grid`: the days are reached with Tab, not arrow keys.
- **`CategoryChip`**: a small clickable chip whose fill is split into one
  color band per category, with a white label. A `Button` underneath, so focus
  and disabled states match every other button. Forwards its ref.
- **`StatusIndicator`**: a colored dot for a status. You pass the `color` (any
  CSS color, such as `"var(--color-chart-2)"`) and the `label`, which is also
  the dot's accessible name; the app keeps its own status → color mapping. Use
  `ChartLegend` as the key for a set of them; there is no separate legend.
- **`CheckboxGroup`**: labelled checkboxes for choosing any of a few options,
  in a `role="group"`, horizontal or vertical. `name` submits each checked
  value with a form. `MultiStatusFilter` now renders one inside its popover.
- **`HoverCard`** (`HoverCardTrigger`, `HoverCardContent`): a preview that
  opens on hover or keyboard focus, on Radix's hover card. A click on the
  trigger pins it open until a second click, Escape or a click outside, which
  is also how it opens on a touch screen. The trigger has `aria-expanded`, and
  `aria-controls` while open. **For preview content only:** the card is not
  in the Tab order, so a keyboard user cannot reach a link or button in it.
  Put interactive content in a `Popover`. Adds the `@radix-ui/react-hover-card`
  dependency.
- **`Table`** (`TableHeader`, `TableBody`, `TableFooter`, `TableRow`,
  `TableHead`, `TableCell`): the table elements, styled once. `DataTable` and
  `TimesheetTable` are now built from them; use them for a table `DataTable`
  does not fit.

### One calendar grid, Monday-first

`MonthCalendar`, `EventCalendar` and `TimesheetTable`'s month view now draw
from the same layout, `monthWeeks(month)` in `lib/calendar`, and every grid
starts its week on Monday. There is no option to change that. New calendar
exports for anyone laying out days: `monthWeeks`, `WEEKDAY_LABELS`, `addDays`,
`startOfWeek`, `isWeekend`, `parseDateKey`, `formatCalendarDate` and
`formatDateKey` (a `"2026-09-14"` key or ISO instant written out, or the
string unchanged if it is not a day).
`MonthCalendar` looks and behaves as before.

### Categorical colors

`getCategoricalColor(id)` gives an entity (a project, a team) a stable color
from its numeric id, and `getCategoricalSegments(ids)` turns a list of ids into
`CategoryChip` segments, capped at `MAX_CHIP_SEGMENTS` with a "+N" overflow.
Also `CATEGORICAL_PALETTE`, `NEUTRAL_CATEGORICAL_COLOR`, `OVERFLOW_SEGMENT_COLOR`
and the `CategoricalSegment` type. They are exported from `/utils` too, for
server components.

The values are `var(--color-category-*)` references to **new tokens**
`--color-category-1` … `--color-category-11`, `--color-category-neutral`,
`--color-category-overflow` and `--color-category-foreground` (white). They are
fills under white text, so every one clears 4.5:1 against it. Unlike the
`chart-*` slots they cycle (the set of ids has no end) and they are the same in
both themes, so an entity keeps one color whoever is looking.
They sit in an `@theme static` block, so Tailwind always emits all of them:
`getCategoricalColor` builds the names at runtime, where a source scan cannot
see them.

### DataTable: alignment, row classes, server-side sorting, expandable rows

All optional; a table that passes none of them behaves as before.

- Column `meta`: `align` (`left` · `right` · `center`) aligns the header and
  the cells, and `className` / `headerClassName` add classes to them. `meta` is
  typed on TanStack's `ColumnMeta`, so it needs no cast.
- `rowClassName(row)`: extra classes per row, applied over the stripe and
  hover, so a tint or `opacity-60` wins.
- `sorting` + `onSortingChange` control the sort, and `manualSorting` leaves
  the order of `data` alone, for a server sort. A sorted header now shows an
  up or down arrow, and `aria-sort`. `SortingState` is re-exported.
- Expandable rows: `renderExpanded(row)` shows a full-width detail row (on
  `surface-raised`) under an opened row, toggled by a chevron button in a new
  leading column (`aria-expanded`, named "Show details"). The toggle never
  fires `onRowClick`. `getRowCanExpand(row)` limits which rows get one (all, by
  default), and `expandOnRowClick` lets a click anywhere on the row toggle it.
  Open rows stay open across a refetch when rows are keyed with `getRowId`.

### Charts: custom tooltip content

`tooltipContent` on `LineChart` and `BarChart` replaces the tooltip body,
inside the standard tooltip shell, with your own. It gets
`{ label, payload: [{ key, label, value, color, datum }] }`: the hovered
category and each visible series, with the full data row. `DonutChart` takes
one too, called with `{ datum, value, color }` for the hovered slice. Return
`null` for no tooltip. Without it the tooltips are unchanged. New types:
`ChartTooltipRenderer`, `ChartTooltipContext`, `ChartTooltipEntry`,
`DonutTooltipContext`.

### MultiStatusFilter

Its trigger is now a `Button` (outline), and its options are a vertical
`CheckboxGroup`. The rows keep their full-width hover; option labels now use
the secondary text color, as `CheckboxGroup` does, and each is tied to its
checkbox with `for`/`id`. No API change.

### SearchSelect and MultiSelect: create a missing option

- **`onCreate(input)`** and **`createLabel(input)`** (default `Create "…"`) on
  both. The create option is the last one, shown when the trimmed search has
  no option with exactly that label (ignoring case). The arrow keys reach it
  after the options, and in `SearchSelect` Enter on it creates the value and,
  like Enter anywhere in the open list (1.15.5), never submits a surrounding
  form.
- One create at a time: while `onCreate` is pending the option is disabled,
  so a second Enter, click or press does nothing. If it rejects, the typed
  text stays for another try and the rejection is swallowed, so report the
  error yourself (a toast) in `onCreate`.
- **`MultiSelect`** gained `onSearchChange(query)` for server-side search
  (it then shows `options` as given, without filtering them) and `loading`.
- **`SearchSelect`** gained `emptyMessage`, shown when there are no options
  (default "No results").

## [1.16.0] - 2026-10-02

### `ThemeProvider`: start from a stored theme, skip localStorage, hear changes

For apps that save the light/dark choice themselves (e.g. on the user's
account) and render it on the server. Three optional props, all
backward-compatible; with none of them the provider behaves exactly as before.

- **`initialTheme?: "light" | "dark" | "system"`** seeds the theme and applies
  the class on mount. With `"light"` or `"dark"`, `ThemeToggle` draws its icon
  on the first render, server included, instead of a blank placeholder until
  mount. `"system"` follows the OS `prefers-color-scheme` once mounted (dark
  when there is no preference). Changing the prop later has no effect; remount
  the provider (e.g. with a `key`) to start again.
- **`persist?: boolean`** (default `true`). `false` never reads or writes
  localStorage.
- **`onThemeChange?: (theme) => void`** is called with the new theme after
  `setTheme` or `toggleTheme`, never on mount. Use it to save the choice.

`useTheme()` also returns `resolved`: true when the theme is known from the
first render. `ThemeProviderProps` is exported.

## [1.15.5] - 2026-10-02

### `SearchSelect`: Enter picks an option, and never submits the form around it

Inside a `<form>`, arrowing to an option and pressing Enter could submit the
form instead of choosing the option. Two things combined:

- **Enter only stopped the form's implicit submit while an option was
  active.** With the list open and nothing active, Enter fell through and sent
  the form. While the list is open, Enter now always belongs to it: it picks the
  active option, or does nothing.
- **The active option was cleared whenever `options` changed identity**, even
  when the rows were the same. A consumer that builds its options inline, or
  filters on the debounced `onSearch`, hands over a new array a moment after the
  user has arrowed. That cleared the active option just before Enter, so there
  was nothing to pick. It now resets only when the option values change.

Enter on the closed trigger is unchanged: it is a `type="button"` and opens the
list. No API change.

## [1.15.4] - 2026-10-01

### `Button`: a label made of text and expressions keeps its spaces

1.11.0 put each string child of a `Button` in its own truncating span. JSX
splits `Create {label} account` into three string children, so that became
three spans, and each span was a flex item. A flex item drops the spaces at its
edges, so:

- **On screen**, the words were a flex gap (8px) apart instead of a space apart,
  and each piece truncated on its own.
- **The accessible name** lost the spaces too: `"Createoperatingaccount"`,
  `"Confirm2026-07-31"`. Tests that find a button by its name failed.

Adjacent strings and numbers now go into one span, so the label renders and
reads as written. An element between text (an icon) still splits the label
around it, and a consumer's own elements are still passed through untouched.
No API change.

## [1.15.3] - 2026-10-01

### Tag, Alert, MultiSelect and SegmentedControl compose the design system's own controls

The same change as 1.13.2, for the components added in 1.14.0. They styled
raw `<button>`s and an `<input>` by hand; they now use `Button` and `Input`, so
they pick up those components' focus ring, disabled state and future fixes.
No props changed.

- **`Tag`**: the remove control is a ghost icon `Button`, still 16px, in the
  tag's own colour.
- **`Alert`**: the dismiss control is a ghost icon `Button`, in the alert's
  own colour.
- **`MultiSelect`**: the search field is an `Input`.
- **`SegmentedControl`**: each segment is a ghost `Button`, with
  `role="radio"`, roving tab stop and arrow keys as before. Segments never
  truncate their label.

A new test keeps these components, and Card, Label, Pagination and Spinner,
free of raw form controls.

## [1.15.2] - 2026-10-01

### `CommandPalette` leaves a ⌘K the focused control already handled

The palette opened on every ⌘K / Ctrl+K anywhere on the page. Inside a
`RichTextEditor`, ⌘K is the link shortcut, so one press opened the link row
and the palette over it: focus moved to the palette, so the address went into
the search box, and the editor lost its selection, so the link could not be
applied. The palette now skips a press whose default was already prevented,
which the editor's shortcut does. An unhandled ⌘K opens it as before. No
props changed.

## [1.15.1] - 2026-10-01

### Package exports resolve from `require` too

`.` and `/utils` were exported under the `import` condition only, so anything
that resolves with `require` failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`. That
includes a test runner loading CommonJS (`tsx --test`, Jest), and a server
script importing `sanitizeRichText` or `normalizeLinkHref` from `/utils`. Both
entries now also have a `default` condition pointing at the same ESM files,
which Node 22.12 and later load through `require`. Bundlers keep using `import`.
No code change.

## [1.15.0] - 2026-10-01

### `RichTextEditor` is rebuilt on TipTap, with opt-in capabilities

The editor ran on `document.execCommand`, which is deprecated and differs
between browsers (bold as `<b>` or as a styled `<span>`, pasted markup let
through). It now runs on [TipTap](https://tiptap.dev). The schema is derived from
the props, so the editor can only produce the tags its matching sanitizer keeps.

**Existing usage keeps working.** Every prop it had is unchanged and means the
same thing. With no new props you get the same five buttons (Bold, Italic,
Bulleted list, Numbered list, Link), the same inline link row with Cmd/Ctrl+K,
plain-text paste, and no Markdown typing shortcuts. `onChange` still emits HTML
that `sanitizeRichText(html)` keeps byte for byte. The differences:

- **Blank lines:** a blank line is emitted as `<p><br></p>`, which the
  sanitizer keeps, so blank lines no longer disappear on save.
- **Toolbar focus:** the toolbar is one Tab stop, with the arrow keys, Home and
  End moving between its buttons (the ARIA toolbar pattern).
- **Escape in a dialog:** inside a `Dialog`, Escape in the link row closes only
  the row, and focus goes back to the editor.

**New, all optional:**

- **`formatting="extended"`:** headings 1–3, strikethrough, quotes, inline code
  and code blocks, Markdown-style typing shortcuts (`## `, `> `, three
  backticks), and HTML paste reduced to those. There is no horizontal rule, so
  `---` stays text.
- **`uploadImage(file) => Promise<url | null>`:** an Insert image button. The
  URL is inserted at the caret. A relative URL such as `/api/files/1` is made
  absolute against the page, so it survives `sanitizeRichText(html, { images:
  true })`; a URL the sanitizer would drop (`data:`, `blob:`) inserts nothing
  and says so in the editor's status region. `null` or a rejection inserts
  nothing, and the app shows its own error. An upload that finishes after the
  editor is disabled (a save started) inserts nothing. Images come in through
  the button only: images in pasted or dropped HTML are removed, so a pasted
  web page or email cannot fetch from its servers. Images the editor already
  held are kept, so dragging an image or cutting and pasting it moves it.
- **`linkPanel`:** a popover to add, edit and remove links, with optional text
  to show, an inline error, and URL normalisation (`example.com` →
  `https://example.com`, `ana@example.com` → `mailto:`).
- **`linkPanel={{ targets }}`:** hrefs that are not URLs, such as
  `{{signup_link}}`, for markup the app fills in later. Each has a quick-fill
  button and help text, worded by the app.
- **`insertActions`:** a toolbar button per snippet.
- **`ref`:** a `RichTextEditorHandle` with `insert(html)` and `focus()`, for
  inserting from outside the editor.
- **`ariaLabelledBy`, `ariaDescribedBy`:** placed on the editable surface.
- **`acceptPlainText`:** reads a tag-less `value` as plain text.

Capabilities are read once, at mount, because they are the schema. To change
them, change the editor's `key`.

**TipTap loads only where an editor renders.** `RichTextEditor` loads TipTap
the first time one renders, not when the package is imported, so pages
without an editor download none of it. Until it arrives the editor draws the
same bordered box with an empty toolbar strip; the server render and hydration
always draw that box. A `ref` handle exists from the first render and does
nothing until the editor has loaded. If loading fails, the editor throws to the
nearest error boundary.

### Sanitizer options to match

- **Options:** `sanitizeRichText(html, { formatting: "extended", images: true })`
  keeps what an editor with those options can produce. Images keep only an
  http(s) `src` and `alt`; `h4`–`h6` fold to paragraphs. **With no options the
  output is byte for byte what it was.**
- **Tag lists:** `RICH_TEXT_EXTENDED_TAGS`, `RICH_TEXT_IMAGE_TAGS` and
  `richTextTags(options)` list each configuration's tags.
- **Image-only content:** `isRichTextEmpty` counts an image as content. It now
  measures what `sanitizeRichText` would store, so an `<img>` the sanitizer
  drops, or one inside an HTML comment, does not make a note non-empty.
- **Quotes inside a `<div>`:** a quote, heading or code block now closes an
  open paragraph, so `<div><blockquote>…</blockquote></div>` keeps its quote.
- **Link targets:** `sanitizeRichText` drops non-URL hrefs, keeping their text.
  An app that turns on link `targets` sanitizes that markup with its own
  allow-list.

### Link helpers

`normalizeLinkHref`, `isAllowedEditorHref` and `linkHrefErrorMessage` are
exported from the root and from the server-safe `/utils` entry, so a server can
check an href the same way the link panel does. `isAllowedEditorHref` reads a
scheme with a dot in it (`foo.bar:`) as a scheme, as a browser does, while a
host and port (`example.com:8080`) still autolinks.

### Dependencies

TipTap 3 (`@tiptap/core`, `react`, `pm`, `starter-kit`, `extension-link`,
`-list`, `-image`, `-code-block`, at `^3.31.3`) is now a dependency, kept
external to `dist/`. An app that already depends on TipTap should use the same
`^3.31` range so it installs one copy. The editor is built as its own file,
`dist/rich-text-editor-impl.js`, which `dist/index.js` reaches only through a
dynamic import, so an app's bundler puts TipTap in a separate chunk.

## [1.14.0] - 2026-10-01

### New components: Card, Alert, Spinner, Label, Tag, Pagination, MultiSelect, SegmentedControl

Added while moving Hirelitt off the Backstage design system, which had these and
Carbon did not. Each is built on the semantic tokens, so it works in both themes.

- **`Card`**: a bordered `surface` panel. `padding` (`none` · `sm` · `md` ·
  `lg`), `hoverable` for clickable cards, and `asChild` to render it as a link.
- **`Alert`**: an inline, persistent message (`error` · `success` · `info` ·
  `warning`) with an optional `title` and `onDismiss`. Errors are
  `role="alert"`, the other variants are `role="status"`.
- **`Spinner`**: an indeterminate loading indicator (`sm` · `md` · `lg`) with
  an optional `label`, which is also its accessible name.
- **`Label`**: a form label styled to match `FormField`, with a `required`
  marker. For controls whose layout does not fit `FormField`.
- **`Tag`**: a `Badge` that can be removed. Same variants as Badge, plus
  `onRemove` and `removeLabel`.
- **`Pagination`**: previous/next and page buttons, collapsing to seven slots
  around the current page, with an optional "Showing 11–20 of 57".
- **`MultiSelect`**: a searchable list that toggles several values, staying
  open while you pick. It renders no chips of its own; show the selection
  beside it with `Tag`.
- **`SegmentedControl`**: pick one of a few options, all visible. A radio group
  with one Tab stop and arrow-key movement. `name` submits the value with a
  form.

### Theme: the base styles are in cascade layers, so utilities win

`theme.css` set its base reset and helper classes outside any cascade layer.
Unlayered CSS beats every layered rule whatever the specificity, and
Tailwind's utilities are layered, so:

- **`* { border-color: var(--color-border) }` overrode every border colour
  utility.** `border-error`, `border-accent`, `border-success-border` and
  arbitrary `border-*` colours all rendered as the default border. This hit
  these components too: a checked `Checkbox`'s accent border, error borders on
  inputs, toast borders and the `SegmentedControl` error state.
- **`.tabular-nums` forced 13px**, overriding `text-xs`, `text-2xl` and other
  size utilities on the same element. `.focus-ring` and `.transition-default`
  likewise beat utilities set beside them.

The reset (`*`, `html`, `body`, scrollbars) is now in `@layer base`. The
helper classes (`.tabular-nums`, `.focus-ring`, `.transition-default`) are now
in `@layer components`. The defaults are unchanged; a utility on the same
element now wins.

**Visible change for consumers:** an element that sets `tabular-nums` together
with a text size utility now gets that size instead of 13px. Without a size
utility it is still 13px.

### `DataTable`: `paginate={false}` and `getRowId`

- **`paginate={false}`** turns the table's own paging off, so it renders every
  row it is given and draws no pager. Use it for lists the server already
  pages: pass one page of rows and put a `Pagination` under the table.
  `pageSize` is read once, on mount, so passing the current row count as
  `pageSize` freezes the table at the first render's size.
- **`getRowId`** gives each row a stable id, used as its React key. Without it
  rows are keyed by index, so state inside a cell (an inline rename box, an
  open menu) moves to a different row when the list re-sorts or gains a row.

### `toast` can be called without `useToast()`

`toast.success(title)`, `toast.error(title)`, `toast.info(title)` and
`toast.warning(title)`, each with an optional `{ description }`, plus
`toast({ title, variant })`. They show in whichever `ToastProvider` is
mounted, so they work in code that is not a component or cannot call a hook.
`useToast()` is unchanged.

The toast list also gained `info` and `warning` variants, and
an accessible region. An error toast is `role="alert"` and every other toast
is `role="status"`. The dismiss button now has a name.

## [1.13.2] - 2026-10-01

### Components built from other design-system components

Several components re-implemented controls the design system already ships.
They now compose those components, so they pick up their styling and fixes.
No props changed.

- **`DateRangePicker`** uses `Select` instead of four native `<select>`s. Each
  trigger has an accessible name: "Start month", "Start year", "End month" and
  "End year". **If your tests drive it with `fireEvent.change` on a `<select>`,
  update them to click the trigger (`combobox` role) and then the `option`.**
- **`MultiStatusFilter`** rows use `Checkbox` instead of a hand-drawn box. The
  count pill is a `Badge`, and All / Clear are link `Button`s.
- **`MoneyInput`**, **`AccountCombobox`**, **`AddressAutocomplete`** (both
  modules) and **`StructuredAddressInput`** render `Input`. The staff fields of
  `StructuredAddressInput` now show the standard 2px focus ring. The vendor and
  public palettes look the same as before.
- **`ThemeToggle`** is an outline icon `Button`. The **toast** dismiss control is
  a ghost icon `Button` and now has `type="button"` and `aria-label="Dismiss"`.

## [1.13.1] - 2026-10-01

### Checkbox: white checkmark in light mode

- A checked `Checkbox` now draws its checkmark with `text-accent-foreground`,
  so it is white on the accent fill in light mode instead of near-black. Dark
  mode is unchanged (`carbon-950` on amber).
- With this, everything drawn on a solid accent (`bg-accent`) fill uses
  `text-accent-foreground`: the `default` Button, `MultiStatusFilter`'s
  checkmark and `Checkbox`. Use that token for any new content on an accent fill.

## [1.13.0] - 2026-10-01

### Button and MultiStatusFilter: white on the accent fill in light mode

- The `default` (accent) `Button` now uses white text in light mode instead of
  near-black. Dark mode still uses `carbon-950` on amber.
- **New token `--color-accent-foreground`** (utility `text-accent-foreground`):
  the text color for anything on a solid `bg-accent` fill. It is `carbon-950`
  in dark mode and white in `.light`.
- `MultiStatusFilter`: the checkmark in a selected option's box now uses the
  same token, so it is white in light mode too.
- `Checkbox` (checked) still uses `text-carbon-950` on the accent fill and is
  unchanged.

## [1.12.0] - 2026-10-01

### MonthCalendar: picking one day

`DateRangePicker` selects a range of **months**, and there was nothing for the
much more ordinary job of picking a single day. Apps were writing their own —
one of them had a working implementation sitting in `components/` with a comment
saying it belonged here.

- **New `MonthCalendar`** — a month grid, controlled in both dimensions: the
  month on screen and the day chosen, because the two move independently
  (paging to December does not unpick the 3rd of September). `selected` and
  `onSelect` speak ISO day keys (`"2026-09-03"`), never `Date`.
- **`available` is optional.** Omit it and every day is pickable, which is what
  an ordinary date field wants. Pass a set when the days on offer are the point
  — somebody's published hours, the nights a room is free — and everything
  outside it renders **disabled rather than absent**, so the month keeps its
  shape and the reader can see the pattern of what is available.
- **`unavailableLabel`** names why a closed day is closed, read after the date
  by a screen reader (`"4 September 2026, no times"`). It defaults to
  `"unavailable"`; a picker that closes days for a specific reason — nobody is
  free, the day has not happened yet — should say which.
- **New `@/lib/calendar` exports**, which the grid is built on and which are
  useful on their own: `dateKey`, `weekdayOf` (Monday-first), `daysInMonth`,
  `shiftMonth`, `compareMonths`, `monthLabel`, `monthOfKey`, `todayIn`, and the
  `YearMonth` / `CalendarDate` types. All pure and zone-free: `new Date(iso)` is
  midnight **UTC**, so reading local fields off it is a day out west of
  Greenwich, and none of this does that.

### `Button` inside a form — documented, not changed

`Button` renders a bare `<button>` and sets **no default `type`**, which is
HTML's own rule and what shadcn and every other headless kit do. So an unmarked
button inside a `<form>` is `type="submit"`.

That bit a consuming app: it put a hand-rolled version of this calendar inside a
form dialog, and every day cell — and both month arrows — submitted the form. On
that dialog, submitting marked an employee for removal, so paging to the next
month offboarded them.

The fix is on the calendar, which now marks all three of its buttons, and there
is a test asserting it never submits a form it is placed in. **The default was
deliberately left alone:** changing it to `"button"` would silently stop every
form whose submit relies on it, in apps pinned to a SHA that cannot see the
change in their diff — the same class of silent failure pointed the other way.
`Button`'s doc comment now says so, so the next person hits the rule before the
bug.
## [1.10.1] - 2026-09-08

### `Select` and `SearchSelect`: a long value clips instead of escaping the trigger

Both triggers lay their value out as a flex item, and a flex item's default
`min-width: auto` will not let it shrink below its own text width. So a trigger
with a bounded width and an option longer than it did not clip — the value kept
its full width and pushed the chevron out through the right border, over the
control's own edge.

This was never opt-in-able. The options of a data-driven select come from a
query — a charge code, a GL account, a vendor, a resident — so the longest label
is not knowable when the trigger's width is chosen, and a consumer could not fix
it from outside without reaching into this component's internal DOM. Consuming
apps were instead shortening their labels to fit, which loses information the
label was carrying.

- **The value truncates**, with an ellipsis, inside whatever width the trigger
  has. `SearchSelect` truncates its placeholder on the same rule.
- **The chevron and the clear button keep their size.** The label is what gives.
- **Both triggers can shrink**, so one placed in a flex row rather than a
  fixed-width box narrows with the row instead of forcing it wider.

No new prop and no API change. A control that stays inside its own border is not
something a consumer should have to ask for, and there is no case for the old
behaviour to preserve behind a flag. Consumers that were passing
`[&>span]:truncate` themselves can drop it — it is now the default, and passing
it again is harmless.

A truncated label hides information, so a consumer showing values it does not
control should give the trigger a `title` with the full text. The design system
cannot do that for them: `Select` never sees the label of the selected item, only
the value.

## [1.10.0] - 2026-09-07

### DataTable: every row hovers, and the rows are striped

A row highlight existed but was tied to `onRowClick`, so only a table whose rows
navigate somewhere had one. That conflated two different questions: whether the
row does anything when you click it, and whether the reader can tell which row
their eye is on. A read-only table — an outstanding-work queue, a list of pending
memberships, a table of proposed matches — is exactly where tracking a row across
eight columns is hardest, and it was the one kind of table with no highlight at
all. There was no prop to ask for one either.

- **Hover is on every row**, clickable or not. `cursor-pointer` stays tied to
  `onRowClick`, because that one really is about whether clicking does anything.
- **Rows are striped**, first row plain. The banding is keyed to the row's index
  within the current PAGE, so page 2 opens the same way page 1 did instead of
  depending on whether the page before it held an odd number of rows.
- **A selected row keeps its own background.** The stripe is dropped from it
  rather than being left to CSS source order, and the hover wash is held back so
  the pointer cannot cover the selection.

Neither is a prop. A table that reads better is not something each consumer
should have to opt into, and there is no argument for the previous behaviour to
preserve behind a flag.

### Two new tokens: `--color-table-stripe` and `--color-table-row-hover`

Both are TRANSLUCENT, and that is the load-bearing part rather than a shortcut. A
`DataTable` draws no background of its own, so its rows sit on whatever the
consumer put behind them — the page `bg`, a `surface` card, a `surface-raised`
panel. An opaque stripe has to be a step away from one of those and vanishes
against the others, and in the light theme `surface` and `surface-raised` are the
same white, so no opaque value reads on both grounds. An ink wash composites over
any of them and holds roughly the same delta.

Hover sits about twice as far from the ground as the stripe, because the two are
seen next to each other: a hover that only matched the stripe would read as no
hover at all on every unstriped row.

Declared in all three token blocks (`@theme`, `.light`, `.dark`), so a consumer
importing `@codelittinc/carbon-design-system/styles` gets them with no change.
Nothing was renamed or removed.

## [1.9.1] - 2026-09-06

### Button: hover had a background swap but no cursor-pointer

`buttonVariants`' base class string set a hover background per variant but never
`cursor-pointer`, and native `<button>` elements don't get a hand cursor for free
the way `<a>` does. Every `Button` — every variant, every size — showed the default
arrow cursor on hover, so a background-color change was the only signal a control
was clickable.

- Added `cursor-pointer` to the shared base classes, and `disabled:cursor-not-allowed`
  next to the existing `disabled:pointer-events-none disabled:opacity-50` so a
  disabled button's cursor doesn't suggest it's clickable either.

## [1.9.0] - 2026-09-03

### CommandPalette: usable for a few hundred rows, and it stops losing keystrokes

The palette rendered every row a consumer gave it and let cmdk do the filtering,
with no way to influence either. Against a directory of 158 rows that produced
two failures in a real app, reported by its users, and neither could be worked
around from outside:

- **Rows that arrived while a search was active stayed invisible.** cmdk resolves
  a row's search value from that row's DOM NODE, and a row that does not match is
  rendered as `null` — so a row first mounted mid-query has no node to read,
  caches nothing, scores 0, and never appears again. Fetching rows when the
  palette opened therefore meant anybody who pressed ⌘K and typed straight away
  got "No results found." with every row present in the DOM.
- **Mounting all the rows is superlinear**, because each registration reschedules
  cmdk's filter and sort. Opening took seconds, and whatever was typed during
  that time was swallowed by the input arriving late.

Both come back to the same missing ability: a consumer could not render only the
rows it meant to show. It can now.

- **`CommandPalette` takes `value` / `onValueChange`** — a controlled query, so
  the consumer can see what was typed and decide what to render.
- **`CommandPalette` takes `shouldFilter`** (default `true`). With `false`, cmdk
  neither filters nor sorts, every row given is drawn in the order given, and the
  invisible-row behaviour above cannot happen.
- **`CommandPalette` takes `filter`** to replace cmdk's fuzzy scorer, for
  consumers that want their app's own matcher rather than a second one.
- **`CommandPalette` takes `loop`** (default `true`, unchanged). `false` stops
  ArrowUp at the top row instead of jumping to the last, which on a long list
  reads as the list scrolling itself to the bottom.
- **`CommandPalette` takes `placeholder`, `emptyMessage` and `label`.**
- **`CommandItem` forwards `value`, `keywords`, `forceMount` and `disabled`.**
  `value` is the important one: cmdk keys SELECTION on it, so two rows that read
  identically — two employees with the same name — were both highlighted, could
  not be reached from one another with ArrowDown, and Enter always took the first.

Three fixes that need no opting in:

- **The palette renders into `document.body`.** It positions itself with `fixed`,
  and a `backdrop-filter` anywhere in its ancestry — a translucent app header is
  the common case — makes that ancestor the containing block for fixed
  descendants. The palette silently sized itself to the header: measured in a
  consuming app at 1488×56 instead of 1728×996, with the dimming over the header
  alone.
- **The input is focused on open.** It was not, so the first thing anybody typed
  went to the page behind.
- **Escape closes it**, and the press is stopped there rather than also
  dismissing whatever sits underneath.

## [1.8.1] - 2026-08-31

### Dialog and Sheet: title element wasn't wired to Radix, so screen readers got no name

`DialogTitle` and `SheetTitle` rendered a plain `<h2>` instead of Radix's
`DialogPrimitive.Title`. `DialogContent`/`SheetContent` are Radix's real
`Dialog.Content`, which looks specifically for a `Dialog.Title` descendant to
label itself for assistive tech — a lookalike heading doesn't satisfy it, so
Radix logged "`DialogContent` requires a `DialogTitle`" on every open and the
dialog had no accessible name.

- **`DialogTitle`** and **`SheetTitle`** now render `DialogPrimitive.Title`,
  keeping the same visual styling. No prop or usage changes for consumers.

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
