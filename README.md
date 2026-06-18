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
| **Colors** | `carbon-50…950`, `amber-300…900`, `success`/`error`/`warning`/`info`, semantic `surface`/`text-*`/`border` |
| **Typography** | `font-display` (Instrument Serif), `font-body` (DM Sans), `font-mono` (JetBrains Mono), `.tabular-nums` |
| **Spacing** | tightened scale `px → 20` (1px → 80px) |
| **Radius** | `sm` 4px · `md` 6px · `lg` 8px · `xl` 12px |

## Usage in an app

```ts
import "@carbon/design-system/styles";
import { Button, Badge, DataTable, useToast } from "@carbon/design-system";
```

## Components

Forms: Button · Input · Textarea · Checkbox · Switch · Select · MoneyInput · SearchSelect · AddressAutocomplete
Overlays: Dialog · AlertDialog · DropdownMenu · Sheet · Popover · Tooltip · CommandPalette · Toast
Data display: Badge · StatusBadge · DataTable · Tabs · Progress · Skeleton · Separator · ScrollArea · EmptyState · PageHeader

> These components were ported from the Carbon Backbone web app as the starting point for a
> shared library. The originals remain in the app; this repository is the canonical home going
> forward.
