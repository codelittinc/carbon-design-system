/**
 * Class strings that several components draw with, written once so the copies
 * cannot drift. Internal: not exported from the package.
 *
 * Every value is a literal on purpose. Tailwind finds the classes it generates
 * by scanning source text (and consumers scan the built bundle), so a class
 * assembled at runtime, say by prefixing each word of one of these, is never
 * generated and silently renders unstyled.
 */

/** The dimmed backdrop behind a modal: Dialog, AlertDialog, Sheet. */
export const overlayClass =
  "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

/**
 * A centred modal box: Dialog and AlertDialog.
 *
 * Capped at `85dvh` and a flex column, so a `DialogBody` inside it can be the
 * part that scrolls (see `DialogContent` for why `dvh`).
 */
export const modalSurfaceClass =
  "fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

/**
 * A panel floating over the page: popover, hover card, menu, select list and
 * the comboboxes' lists.
 */
export const floatingSurfaceClass = "z-50 rounded-lg border border-border bg-surface-raised shadow-lg";

/** The open/close animation of a Radix floating panel (keyed on `data-state`). */
export const floatingMotionClass =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

/** One row in a list of options: a select item, a menu item, a combobox option. */
export const optionRowClass =
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary outline-none transition-colors";

/**
 * The highlighted and disabled states of an option row driven by Radix, which
 * focuses the row itself (and marks it `data-highlighted` / `data-disabled`).
 */
export const optionRowFocusClass =
  "focus:bg-surface-overlay focus:text-text-primary data-[highlighted]:bg-surface-overlay data-[highlighted]:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

/** The highlighted row of a hand-rolled list, which tracks it as an index. */
export const optionRowActiveClass = "bg-surface-overlay text-text-primary";

/**
 * The box of a text field: Input, Textarea, SelectTrigger, SearchSelect's
 * trigger. No height or padding, which each sets for itself.
 *
 * `focus-visible`, not `focus`, everywhere: a ring after a mouse click on a
 * select trigger is noise, and a text input matches `:focus-visible` on any
 * focus, so typing fields still always show it.
 */
export const fieldChromeClass =
  "w-full min-w-0 rounded-md border border-border bg-surface-raised text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50";

/** The small upper-case label over a column, a stat or a group of rows. */
export const eyebrowClass = "text-xs font-medium uppercase tracking-wider text-text-muted";

/**
 * Status tones, shared by Alert, Toast and Badge: a soft fill with its text
 * colour, and the border that goes with it on a bordered surface. `warning`
 * has no amber-free token of its own and borrows the accent's.
 */
export const toneFillClass = {
  success: "bg-success-soft text-success-text",
  error: "bg-error-soft text-error-text",
  info: "bg-info-soft text-info-text",
  warning: "bg-accent-muted text-accent-text",
} as const;

export const toneBorderClass = {
  success: "border-success-border",
  error: "border-error-border",
  info: "border-border",
  warning: "border-border",
} as const;

export type Tone = keyof typeof toneFillClass;

/** The row hover every table uses: a reading aid, clickable row or not. */
export const tableRowHoverClass = "hover:bg-table-row-hover";

/**
 * A link's look: accent text, underlined on hover. `TextLink` and
 * `Button variant="link"` both draw it, so the two never drift apart.
 */
export const linkTextClass = "text-accent-text underline-offset-4 hover:underline";
