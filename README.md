# CarbonOS Design System

**"Refined Carbon"** — the shared React component library and design language behind Carbon Backbone.

Dark-mode-first, data-dense but breathable, with a warm amber accent over carbon blacks and
monospace numerals for accounting alignment. Documented and developed in **Storybook**.

## Quick start

```bash
pnpm install
pnpm dev          # Storybook at http://localhost:6006
pnpm build        # Static Storybook into ./storybook-static
pnpm typecheck    # Type-check the package
```

## What's inside

```
src/
├── styles/theme.css        # Design tokens — the single source of truth (Tailwind v4 @theme)
├── lib/                     # cn() class merge + money/date formatters
├── components/ui/           # Components + their *.stories.tsx
├── stories/
│   ├── Introduction.mdx
│   └── foundations/         # Colors · Typography · Spacing · Radius
└── index.ts                 # Public barrel export
```

## Stack

- **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@theme` tokens, no `tailwind.config`)
- **Radix UI** primitives
- **class-variance-authority** for variants
- **Storybook 8** (react-vite) with autodocs + a11y addon

## Theming (dark & light)

Dark-mode-first, with a light theme. Toggle modes from the **Theme** switch in the Storybook
toolbar. In an app, dark is the default; add the `.light` class to a root element to switch:

```html
<html class="light"> ... </html>
```

Only the semantic tokens (surfaces, text, borders, accent, and the adaptive
`accent`/`success`/`error`/`info` text colors) remap — the raw palette stays fixed. Components
reference semantic tokens, so they adapt with no code changes. See the Theming block in
[`src/styles/theme.css`](src/styles/theme.css).

### Semantic color tokens components depend on

Components never emit fixed palette utilities (`text-amber-400`, `bg-green-500/15`, …) — those
do not adapt when the theme flips and fail WCAG AA on light surfaces. Instead they use the
semantic tokens below. **If you supply your own theme instead of importing
`@codelittinc/carbon-design-system/styles`, you must define every `--color-*` variable here**
(with light/dark values), or the compiled components render with no color:

| Token (utility) | CSS variable | Role |
|-----------------|--------------|------|
| `text-accent-text` | `--color-accent-text` | Accent text/number, readable on the surface |
| `bg-accent` · `border-accent` · `ring-accent` | `--color-accent` | Solid accent fills, active borders, focus rings |
| `bg-accent-hover` | `--color-accent-hover` | Accent hover state |
| `bg-accent-muted` | `--color-accent-muted` | Soft accent fill (badge, selected row, count pill) |
| `text-success-text` · `text-error-text` · `text-info-text` | `--color-{success,error,info}-text` | Adaptive status text |
| `bg-success-soft` · `bg-error-soft` · `bg-info-soft` | `--color-{success,error,info}-soft` | Soft status fills (badges, toasts) |
| `border-success-border` · `border-error-border` | `--color-{success,error}-border` | Status borders (toasts) |
| `bg-error-solid` · `text-error-foreground` | `--color-error-solid` · `--color-error-foreground` | The destructive button's fill and its text (fixed in both themes, like the status colours) |

Each token pair (soft fill + text) is tuned to clear WCAG AA (≥4.5:1) in **both** themes. The
raw `carbon-*` foundation scale and the amber accent ramp stay fixed by design; the
theme-independent `public`/`vendor` variants of the address inputs intentionally pin their color
scheme: `public` is always dark and `vendor` always light. They do it with these same tokens,
scoped by the `dark` / `light` class on the field, and write out only the vendor portal's emerald
brand accent, which has no token.

## Internationalization (English & Spanish)

Story example copy is bilingual — **English** and **Spanish** are the only supported languages.
Flip every story with the **Language** toggle (🌐) in the Storybook toolbar.

Built on [react-i18next](https://react.i18next.com/). The shared instance lives in
[`src/i18n/index.ts`](src/i18n/index.ts); each story registers its own namespace via
`i18n.addResourceBundle("en" | "es", "<component>", { … })` and renders with
`useTranslation("<component>")`. Because components are presentational, i18n applies only to
example copy — status codes, amounts, and names are left as data.

## Foundations (design tokens)

All tokens live in [`src/styles/theme.css`](src/styles/theme.css) and generate the Tailwind
utilities used throughout the components — there are no hard-coded hex values in component code.

| Token group | Examples |
|-------------|----------|
| **Colors** | `carbon-50…950`, `amber-300…900`, `success`/`error`/`warning`/`info`, semantic `surface`/`text-*`/`border`, adaptive `accent-*`/`*-text`/`*-soft`/`*-border` (see [Theming](#theming-dark--light)) |
| **Typography** | `font-display` (Instrument Serif), `font-body` (DM Sans), `font-mono` (JetBrains Mono), `.tabular-nums` |
| **Spacing** | tightened scale `px → 20` (1px → 80px) |
| **Radius** | `sm` 4px · `md` 6px · `lg` 8px · `xl` 12px |

## Installation

Published to **GitHub Packages** under the `@codelittinc` scope. Point the scope
at the GitHub registry (once per consuming project) in an `.npmrc`:

```
@codelittinc:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs the `read:packages` scope. Then:

```sh
pnpm add @codelittinc/carbon-design-system
```

## Usage in an app

```ts
import "@codelittinc/carbon-design-system/styles";
import { Button, Badge, DataTable, useToast } from "@codelittinc/carbon-design-system";
```

> **Tailwind consumers:** the components ship pre-built with literal utility
> class names, so add the package to your Tailwind sources so those classes are
> generated — in Tailwind v4: `@source "../node_modules/@codelittinc/carbon-design-system/dist";`

## Components

Forms: Button · Input · Textarea · Checkbox · Switch · Select · MoneyInput · SearchSelect · AddressAutocomplete
Overlays: Dialog · AlertDialog · DropdownMenu · Sheet · Popover · Tooltip · CommandPalette · Toast · FileViewer
Data display: Badge · StatusBadge · DataTable · Tabs · Progress · Skeleton · Separator · ScrollArea · EmptyState · PageHeader · Card / CardHeader · Swatch
Navigation: Pagination · TextLink
Confirmation: `useConfirm()` + `ConfirmProvider` (an `AlertDialog` that resolves to the answer)

### Icons

The icons the components draw with are exported from the package with an `Icon` suffix, so an
app needs neither `lucide-react` nor hand-drawn SVGs:

```tsx
import { Button, SearchIcon, TrashIcon } from "@codelittinc/carbon-design-system";

<Button variant="ghost" size="icon" aria-label="Delete"><TrashIcon size={14} /></Button>
```

The set is short and curated, so an app ships these icons rather than all of lucide. They come
from the package's single bundle, so unimported ones are dropped only if your bundler tree-shakes
re-exports (a Next client boundary may keep the whole list). They render `aria-hidden`: name the
control around an icon-only button. The list lives in
[`src/components/ui/icons.ts`](src/components/ui/icons.ts); add an icon there rather than
importing `lucide-react` in the app.

### FileViewer

A file in a dialog over the page: PDF, Word (`.docx`), CSV, PNG/JPEG/GIF/BMP/WebP/AVIF images
and plain text. Wrap any trigger, or pass `open` / `onOpenChange`:

```tsx
import { Button, FileViewer } from "@codelittinc/carbon-design-system";

<FileViewer url={file.url} filename={file.filename} contentType={file.contentType}>
  <Button type="button" variant="ghost" aria-label={`Preview ${file.filename}`}>Preview</Button>
</FileViewer>
```

`contentType` decides the renderer when given; otherwise the response's `Content-Type` does. The
extension is read only when the type is `application/octet-stream` or missing (and a `.csv` sent
as `vnd.ms-excel` or `text/plain` is still a CSV). `docx-preview` and `papaparse` load the first time a DOCX or a CSV
opens, so pages that never open one don't ship them.

Legacy `.doc`, a `.docx` the browser can't lay out, and every other type show what
`loadFallback` returns, or a Download when there is no callback or it returns nothing. Return
`{ text, note? }` or `{ html }` (sanitised again by the viewer):

```tsx
const loadFallback: FileViewerFallback = async ({ reason, url, signal }) => {
  // reason: "doc" | "render-failed" | "unsupported"
  const res = await fetch(`${url}?extract=1`, { signal });
  if (!res.ok) return null;
  const { text } = await res.json();
  return { text, note: "Formatting isn't shown for Word 97–2003 files." };
};
```

What the app must provide:

- **PDFs are framed.** The viewer puts `url` in an iframe, so that route must allow same-origin
  framing: `X-Frame-Options: SAMEORIGIN` or `Content-Security-Policy: frame-ancestors 'self'`.
  Without it the browser shows "refused to connect" inside the dialog.
- **Download saves under `filename` only for same-origin URLs.** Browsers ignore `download` across
  origins, and the availability check (a `fetch` with the page's credentials) needs CORS there.
- **DOCX needs `img-src data:` and `style-src 'unsafe-inline'`** in a CSP, for the document's
  images and the styles docx-preview injects. The document renders in a shadow root, so those
  styles reach the document only, never the app page. Embedded fonts are not loaded; text uses
  the font families the document names.
- **Serve untrusted files with `X-Content-Type-Options: nosniff`, and never as `text/html`.**
  Who may open a file is the file route's own check: the viewer adds no authorization.

### Select with an empty choice

A `SelectItem` may have `value=""`, for "All" or "None", with no `"__all__"` sentinel:
`value` and `onValueChange` see `""`, and a form submits `""`. Without such an item, `""` still
shows the placeholder.

> These components were ported from the Carbon Backbone web app as the starting point for a
> shared library. The originals remain in the app; this repository is the canonical home going
> forward.
