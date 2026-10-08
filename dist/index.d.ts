import { RichTextFormatting } from './utils.js';
export { CATEGORICAL_PALETTE, CategoricalSegment, LinkHrefOptions, LinkHrefReason, LinkHrefResult, MAX_CHIP_SEGMENTS, NEUTRAL_CATEGORICAL_COLOR, OVERFLOW_SEGMENT_COLOR, RICH_TEXT_EXTENDED_TAGS, RICH_TEXT_IMAGE_TAGS, RICH_TEXT_TAGS, RichTextSanitizeOptions, cn, formatDate, formatMoney, formatPeriodLabel, getCategoricalColor, getCategoricalSegments, isAllowedEditorHref, isRichTextEmpty, linkHrefErrorMessage, normalizeLinkHref, richTextTags, safeHref, sanitizeRichText } from './utils.js';
import * as react from 'react';
import { ReactElement, ReactNode, AnchorHTMLAttributes, ElementType } from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
export { AlertCircle as AlertCircleIcon, ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, ArrowUpDown as ArrowUpDownIcon, ArrowUp as ArrowUpIcon, Ban as BanIcon, Calendar as CalendarIcon, CheckCircle2 as CheckCircleIcon, Check as CheckIcon, ChevronDown as ChevronDownIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, ChevronUp as ChevronUpIcon, Copy as CopyIcon, Download as DownloadIcon, ExternalLink as ExternalLinkIcon, Eye as EyeIcon, File as FileIcon, FileText as FileTextIcon, LucideIcon as IconComponent, LucideProps as IconProps, Info as InfoIcon, LoaderCircle as LoaderIcon, Menu as MenuIcon, MoreHorizontal as MoreHorizontalIcon, Pencil as PencilIcon, Plus as PlusIcon, Search as SearchIcon, Trash2 as TrashIcon, Upload as UploadIcon, Users as UsersIcon, TriangleAlert as WarningIcon, X as XIcon } from 'lucide-react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { RowData, ColumnDef, SortingState } from '@tanstack/react-table';
export { ColumnDef, SortingState } from '@tanstack/react-table';
import 'clsx';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    variant?: "staff" | "public";
}
declare function AddressAutocomplete$1({ value, onChange, onBlur, placeholder, className, variant }: AddressAutocompleteProps): react.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
    tone?: "default" | "destructive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
/**
 * A button.
 *
 * **Inside a `<form>`, pass `type` explicitly.** This renders a bare `<button>`
 * and sets no default type, which is HTML's own rule and the same one shadcn and
 * every other headless kit follow — so an unmarked button in a form is
 * `type="submit"`. A button that opens a dialog, clears a field or pages a
 * calendar therefore needs `type="button"`, and the one that saves needs
 * `type="submit"`.
 *
 * This is not defaulted to `"button"` on purpose. Flipping it would silently
 * stop every form whose submit relies on the default, in apps pinned to a SHA
 * that cannot see the change in their diff — the same class of silent failure,
 * pointed the other way, and not one a component library should introduce to
 * save an attribute. `MonthCalendar` marks all three of its buttons for exactly
 * this reason; see the note there for what happened when it did not.
 */
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

declare const badgeVariants: (props?: ({
    variant?: "default" | "accent" | "success" | "warning" | "error" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
}
declare function Badge({ className, variant, ...props }: BadgeProps): ReactElement;

interface TagProps extends VariantProps<typeof badgeVariants> {
    children: React.ReactNode;
    /** Shows a remove button when given. */
    onRemove?: () => void;
    /** Accessible name for the remove button. Defaults to "Remove". */
    removeLabel?: string;
    disabled?: boolean;
    className?: string;
}
/**
 * A `Badge` that can be removed — a chosen value in a multi-value field, an
 * applied filter. Shares Badge's variants, so the two sit together.
 */
declare function Tag({ children, variant, onRemove, removeLabel, disabled, className, }: TagProps): ReactElement;

declare const cardVariants: (props?: ({
    padding?: "none" | "sm" | "lg" | "md" | null | undefined;
    hoverable?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    /**
     * Merge the card's styles onto the single child instead of rendering a
     * `<div>` — for a card that is itself a link (`<Card asChild><a …/></Card>`).
     */
    asChild?: boolean;
}
/**
 * A bordered surface that groups related content. `padding` picks a step on the
 * spacing scale; `hoverable` adds a hover state for cards that are clickable.
 *
 * Every card in the package is this one (`StatCard` and `ChartCard` compose
 * it), so cards share one border: the `border` token. `border-subtle` is for
 * rules inside a card (table rows), not for the card's own edge.
 */
declare const Card: react.ForwardRefExoticComponent<CardProps & react.RefAttributes<HTMLDivElement>>;
interface CardHeaderProps {
    title: ReactNode;
    /** A line under the title: a period, a caveat, a count. */
    description?: ReactNode;
    /** Right-aligned controls: a button, a Select, a link. */
    actions?: ReactNode;
    /**
     * The heading element, for the page's outline. `h2` (default) for a section
     * of a page, `h3` for a card inside one. The page's own `h1` is `PageHeader`.
     */
    as?: "h2" | "h3" | "h4";
    /** `md` (default) for a section; `sm` for a compact card, a chart, a panel. */
    size?: "sm" | "md";
    className?: string;
}
/**
 * A section's heading row: the title (and a description under it) on the left,
 * actions on the right. Inside a `Card` or heading a section of a page; for the
 * page's own title use `PageHeader`.
 */
declare function CardHeader({ title, description, actions, as: Heading, size, className, }: CardHeaderProps): ReactElement;

declare const alertVariants: (props?: ({
    variant?: "success" | "warning" | "error" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AlertProps extends VariantProps<typeof alertVariants> {
    /** Optional bold first line. */
    title?: React.ReactNode;
    children?: React.ReactNode;
    /** Shows a dismiss button when given. */
    onDismiss?: () => void;
    className?: string;
}
/**
 * An inline, persistent message about the surrounding content — a form that
 * failed to save, a section that could not load. For a transient confirmation
 * use `toast`.
 */
declare function Alert({ variant, title, children, onDismiss, className }: AlertProps): ReactElement;

declare const sizeClasses$1: {
    readonly sm: "h-4 w-4 border-2";
    readonly md: "h-6 w-6 border-2";
    readonly lg: "h-10 w-10 border-[3px]";
};
interface SpinnerProps {
    size?: keyof typeof sizeClasses$1;
    /**
     * Text shown under the spinner. Also its accessible name; without one the
     * spinner is announced as "Loading".
     */
    label?: string;
    className?: string;
}
/**
 * An indeterminate loading indicator, for work whose length is unknown. Prefer
 * `Skeleton` when the shape of the content that is coming is known.
 */
declare function Spinner({ size, label, className }: SpinnerProps): react.JSX.Element;

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /** Appends a required marker. */
    required?: boolean;
}
/**
 * A form control's label, the one `FormField` draws. Use it on its own when
 * the control's layout does not fit `FormField`'s label-above-control stack.
 */
declare const Label: react.ForwardRefExoticComponent<LabelProps & react.RefAttributes<HTMLLabelElement>>;

interface PaginationProps {
    /** Current page, 1-based. */
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** With `pageSize`, shows "Showing 11–20 of 57". */
    totalItems?: number;
    pageSize?: number;
    className?: string;
}
/**
 * Page controls for a list split into pages. Renders nothing when there is only
 * one page.
 *
 * Every button is `type="button"`, so paging a list inside a `<form>` never
 * submits it.
 */
declare function Pagination({ page, totalPages, onPageChange, totalItems, pageSize, className, }: PaginationProps): ReactElement | null;

interface MultiSelectOption {
    value: string;
    label: string;
    sublabel?: string;
    disabled?: boolean;
}
interface MultiSelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    options: MultiSelectOption[];
    placeholder?: string;
    /** Shown in the list when the search matches nothing. */
    emptyMessage?: React.ReactNode;
    disabled?: boolean;
    /** Put on the search input, so an external `<label htmlFor>` names it. */
    id?: string;
    ariaLabel?: string;
    className?: string;
    /**
     * Called on every keystroke in the search. When given, the caller owns the
     * filtering — fetch matching `options` from the server — and the list shows
     * `options` as passed instead of filtering them itself.
     */
    onSearchChange?: (query: string) => void;
    /** Shows "Loading…" in place of an empty list, while server results are on the way. */
    loading?: boolean;
    /**
     * Offers to create the typed value. It shows as the last option whenever the
     * trimmed search has no option with exactly that label (ignoring case), and
     * is called with the trimmed search. Add the new option to `options` and its
     * value to `value` yourself; the search clears once it resolves. While it is
     * pending the option is disabled, so a second Enter or press cannot create
     * twice. If it rejects, the search stays for another try, and the rejection
     * is swallowed: report the error yourself (a toast) before rethrowing.
     */
    onCreate?: (input: string) => void | Promise<void>;
    /** Text of the create option. Defaults to `Create "<input>"`. */
    createLabel?: (input: string) => React.ReactNode;
}
/**
 * A searchable list that toggles several values on and off. The list stays open
 * while choosing, so picking five people is five clicks, not five round trips.
 *
 * It shows no chips of its own: what is selected usually deserves more than a
 * chip (a status, a warning), so render the selection beside it — `Tag` with
 * `onRemove` is the usual fit. Backspace in an empty search removes the last
 * value.
 *
 * For a list searched on the server, pass `onSearchChange` and `loading`. To
 * let people add a value that is not there yet, pass `onCreate`.
 */
declare function MultiSelect({ value, onChange, options, placeholder, emptyMessage, disabled, id, ariaLabel, className, onSearchChange, loading, onCreate, createLabel, }: MultiSelectProps): ReactElement;

interface SegmentedControlOption {
    value: string;
    label: string;
}
interface SegmentedControlProps {
    options: SegmentedControlOption[];
    /** `null` when nothing is chosen yet. */
    value: string | null;
    onChange: (value: string) => void;
    /** Submits the value with a surrounding form, via a hidden input. */
    name?: string;
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-required"?: boolean;
    /** Marks the group invalid and draws an error border. */
    error?: boolean;
    disabled?: boolean;
    size?: "sm" | "md";
    className?: string;
}
/**
 * A choice of one from a few options, all of them visible. It is a radio group:
 * one Tab stop, and the arrow keys move the choice. Use `Tabs` when the options
 * switch what is shown, and `Select` when there are more than about four.
 */
declare function SegmentedControl({ options, value, onChange, name, id, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "aria-required": ariaRequired, error, disabled, size, className, }: SegmentedControlProps): react.JSX.Element;

interface CategoryChipSegment {
    /** Any CSS color. Usually from `getCategoricalColor` / `getCategoricalSegments`. */
    color: string;
}
interface CategoryChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    /** At least one. Each is drawn at an equal width, left to right. */
    segments: CategoryChipSegment[];
    label: React.ReactNode;
}
/**
 * A compact clickable chip filled with the colors of the categories it belongs
 * to — one equal band each, such as a calendar entry for someone on several
 * projects. The label is white, so the colors must be fills that hold white
 * text: the categorical palette is made for this.
 *
 * A `Button` underneath, so focus, disabled and `type="button"` behave like
 * every other button. The bands are decoration: give the chip an `aria-label`
 * that names what the colors stand for when the label alone does not.
 */
declare const CategoryChip: react.ForwardRefExoticComponent<CategoryChipProps & react.RefAttributes<HTMLButtonElement>>;

interface StatusIndicatorProps {
    /**
     * Any CSS color. Prefer a token reference such as `"var(--color-chart-2)"`
     * so the dot follows the theme.
     */
    color: string;
    /** What the color means. Also the dot's accessible name and hover title. */
    label: string;
    /** Shows the label as text beside the dot. */
    showLabel?: boolean;
    size?: "sm" | "md";
    /**
     * The browser's own hover title on the dot. Defaults on; pass `false` when
     * the indicator sits in a `Tooltip`, or the reader gets two tooltips. The
     * dot keeps its accessible name either way.
     */
    nativeTitle?: boolean;
    className?: string;
}
/**
 * A colored dot that stands for a status. The meaning is always carried by
 * `label` — as text with `showLabel`, otherwise as the dot's accessible name —
 * never by the color alone. The caller owns the status → color mapping; pair
 * it with `ChartLegend` to explain the colors once for a whole list.
 *
 * The dot is a `Swatch`, the same key the charts' legends draw.
 */
declare function StatusIndicator({ color, label, showLabel, size, nativeTitle, className, }: StatusIndicatorProps): ReactElement;

declare const sizeClasses: {
    /** 8px: a legend or tooltip key beside 12px text. */
    readonly xs: "size-2";
    /** 12px. */
    readonly sm: "size-3";
    /** 16px. */
    readonly md: "size-4";
};
interface SwatchProps {
    /**
     * Any CSS color. Prefer a token reference such as `"var(--color-chart-2)"`
     * so the swatch follows the theme.
     */
    color: string;
    size?: keyof typeof sizeClasses;
    /** Faded, for a series or a status that is toggled off. */
    dimmed?: boolean;
    /**
     * Names the swatch for a screen reader (`role="img"`) when nothing beside it
     * says what the color means. Without it the swatch is decoration, hidden
     * from assistive tech, and the text next to it carries the meaning.
     */
    label?: string;
    /** The browser's hover title. */
    title?: string;
    className?: string;
}
/**
 * The round color key: a chart legend's or tooltip's series marker, a status
 * dot. Color is never the only signal — pair it with visible text, or give it
 * a `label`.
 */
declare function Swatch({ color, size, dimmed, label, title, className }: SwatchProps): ReactElement;

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    /**
     * Styles the single child instead of rendering an `<a>` — for a router's
     * link: `<TextLink asChild><Link href="/x">Open</Link></TextLink>`.
     */
    asChild?: boolean;
    /**
     * Leaves the app: opens in a new tab (`target="_blank"`, with `noopener
     * noreferrer` added to any `rel` you pass) and shows the external icon, with
     * "(opens in a new tab)" for a screen reader.
     */
    external?: boolean;
}
/**
 * A link inside running text or a table cell: accent-colored, underlined on
 * hover, with no button box around it. For a link that looks like a button,
 * use `<Button asChild><a/></Button>`.
 */
declare const TextLink: react.ForwardRefExoticComponent<TextLinkProps & react.RefAttributes<HTMLAnchorElement>>;

interface ConfirmOptions {
    title: ReactNode;
    description?: ReactNode;
    /** The action button. Defaults to "Confirm". */
    confirmLabel?: string;
    /** The button that backs out. Defaults to "Cancel". */
    cancelLabel?: string;
    /** Draws the action as a destructive button. */
    destructive?: boolean;
}
type Confirm = (options: ConfirmOptions) => Promise<boolean>;
/**
 * Hosts the dialog that `useConfirm` opens. Mount it once near the root,
 * beside `ToastProvider`.
 */
declare function ConfirmProvider({ children }: {
    children: ReactNode;
}): ReactElement;
/**
 * Asks before doing something, in an `AlertDialog`, and resolves to the
 * answer — `window.confirm` in the design system's own dialog:
 *
 * ```tsx
 * const confirm = useConfirm();
 * async function remove() {
 *   if (!(await confirm({ title: "Delete this contract?", confirmLabel: "Delete", destructive: true }))) return;
 *   await deleteContract(id);
 * }
 * ```
 *
 * Resolves `true` for the action, `false` for Cancel or Escape. Needs a
 * `ConfirmProvider` above it, and throws without one rather than answering a
 * question nobody was shown.
 */
declare function useConfirm(): Confirm;

interface CheckboxGroupOption {
    value: string;
    label: string;
    disabled?: boolean;
}
interface CheckboxGroupProps {
    /** The checked options' values, in the order they were checked. */
    value: string[];
    onChange: (value: string[]) => void;
    options: CheckboxGroupOption[];
    /**
     * Submits each checked value under this name with a surrounding form — the
     * same shape as a group of native checkboxes sharing a name.
     */
    name?: string;
    orientation?: "horizontal" | "vertical";
    /** Disables every option. */
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}
/**
 * A set of labelled checkboxes for choosing any number of a few options, all
 * visible — a filter's "Active / Inactive", a user's roles. Use `MultiSelect`
 * when there are too many options to show at once. `MultiStatusFilter` puts a
 * vertical one inside a popover.
 */
declare function CheckboxGroup({ value, onChange, options, name, orientation, disabled, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, }: CheckboxGroupProps): ReactElement;

interface StatusBadgeProps {
    status: string;
    className?: string;
}
declare function StatusBadge({ status, className }: StatusBadgeProps): react.JSX.Element;

declare const Input: react.ForwardRefExoticComponent<react.InputHTMLAttributes<HTMLInputElement> & react.RefAttributes<HTMLInputElement>>;

declare const Textarea: react.ForwardRefExoticComponent<react.TextareaHTMLAttributes<HTMLTextAreaElement> & react.RefAttributes<HTMLTextAreaElement>>;

/** A toolbar button that inserts a fixed snippet at the caret. */
interface RichTextInsertAction {
    /** The button's text, and its accessible name. */
    label: string;
    /** Shown in a tooltip, e.g. what the snippet expands to. */
    title?: string;
    /** Reduced to this editor's schema on insert, the same way a paste is. */
    html: string;
}
/**
 * An href the full link panel accepts that is not a URL, such as
 * `{{booking_link}}`, for markup an app fills in later. App-supplied: Carbon
 * knows nothing about what it means.
 */
interface RichTextLinkTarget {
    /** The canonical form stored, matching `/^\{\{[a-z0-9_]+\}\}$/`. */
    href: string;
    /** The quick-fill button reads `Use ${name}`. */
    name: string;
    /** Help text under the quick-fill button. */
    description?: string;
}
interface RichTextLinkPanelOptions {
    targets?: readonly RichTextLinkTarget[];
}
/** What `ref` on a `RichTextEditor` gives you. */
interface RichTextEditorHandle {
    /**
     * Focus the editor, put the caret back where it last was, and insert `html`
     * there, reduced to this editor's schema. Does nothing before the editor
     * exists (the first client render) or after it is gone.
     */
    insert(html: string): void;
    focus(): void;
}
interface RichTextEditorProps {
    /** The current HTML. See the note on `onChange` about what may be fed back. */
    value: string;
    /**
     * Called with the editor's HTML on every edit by the person using it — never
     * on mount, and never when `value` replaces the content. `""` when the
     * editor is empty.
     *
     * **Store this through `sanitizeRichText`, but do not sanitize it here.** The
     * value handed back through `value` has to be the same string this emitted, or
     * the sync effect treats it as an external change, replaces the content, and
     * drops the caret to the start of the field on every keystroke. Sanitize where the
     * value is *stored* and again where it is *rendered* — see src/lib/rich-text.ts.
     */
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Applied to the editable surface, e.g. `min-h-40` to make the box taller. */
    className?: string;
    /** Lands on the editable surface, so a `<label for>` names it and a form can focus it. */
    id?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    /** Marks the surface invalid for assistive tech and draws the error border. */
    invalid?: boolean;
    /**
     * `extended` adds headings 1–3, strikethrough, quotes, inline code and code
     * blocks, Markdown-style typing shortcuts, and HTML paste reduced to those.
     * `basic` (the default) pastes plain text. Sanitize with the same
     * `formatting`.
     */
    formatting?: RichTextFormatting;
    /**
     * Adds an Insert image button. The picked file is passed here and the URL it
     * resolves to is inserted at the caret; `null` or a rejection inserts
     * nothing, and the app shows its own error. A relative URL is made absolute
     * against the page; one `sanitizeRichText` would drop (`data:`, `blob:`)
     * inserts nothing. Sanitize with `images: true`.
     */
    uploadImage?: (file: File) => Promise<string | null>;
    /**
     * The full link panel instead of the inline link row: a "Text to show" field,
     * an inline error, URL normalisation (`normalizeLinkHref`), autolink as you
     * type, and optional link `targets`.
     */
    linkPanel?: boolean | RichTextLinkPanelOptions;
    /** A toolbar button for each, inserting its HTML at the caret. */
    insertActions?: readonly RichTextInsertAction[];
    /** Read a `value` with no tags in it as plain text: blank lines are paragraphs, newlines line breaks. */
    acceptPlainText?: boolean;
}

/**
 * A WYSIWYG editor for a paragraph or two of prose. The full contract — what it
 * emits, how to sanitize it, each opt-in — is on the props and in
 * rich-text-editor-impl.tsx.
 *
 * TipTap is loaded the first time an editor renders, not when the package is
 * imported (see rich-text-editor-loader.ts). Until it arrives this draws the
 * same bordered box with an empty toolbar strip, so the page does not jump. The
 * server render and hydration always draw that box, so they agree whether or
 * not the editor has already loaded in this tab. A failed load throws to the
 * nearest error boundary.
 */
declare const RichTextEditor: react.ForwardRefExoticComponent<RichTextEditorProps & react.RefAttributes<RichTextEditorHandle>>;

declare const Checkbox: react.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const Switch: react.ForwardRefExoticComponent<Omit<SwitchPrimitive.SwitchProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

type SelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;
/**
 * Radix's Select, with one addition: **an item may have `value=""`.** Use it
 * for a "None" or "All" choice instead of a sentinel such as `"__all__"`:
 *
 * ```tsx
 * <Select value={status} onValueChange={setStatus}>
 *   <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="">All statuses</SelectItem>
 *     <SelectItem value="open">Open</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 *
 * `value` and `onValueChange` see `""` for it, and with `name` a form submits
 * `""`. Without a `value=""` item, `""` still means "nothing chosen" and shows
 * the placeholder, as in Radix.
 */
declare function Select({ value, defaultValue, onValueChange, name, disabled, form, children, ...props }: SelectProps): ReactElement;
declare const SelectGroup: react.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & react.RefAttributes<HTMLDivElement>>;
declare const SelectValue: react.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & react.RefAttributes<HTMLSpanElement>>;
/**
 * THE VALUE TRUNCATES; THE CHEVRON DOES NOT MOVE.
 *
 * `SelectValue` renders a `<span>` that sits here as a flex item, and a flex item's default
 * `min-width: auto` means it will not shrink below its own text width. So a trigger with a
 * bounded width and an option longer than it did not clip — the span kept its full width and
 * pushed the chevron out through the right border. Nothing about that is opt-in-able: an
 * option list whose longest label overflows is the normal case for any data-driven select
 * (a charge code, an account name, a vendor), and the consumer cannot fix it from outside
 * without knowing this component's internal DOM.
 *
 * Three classes, each load-bearing:
 *
 * - `min-w-0` on the trigger, so the trigger itself can shrink when a consumer puts it in a
 *   flex row rather than a fixed-width box.
 * - `[&>span]:min-w-0 [&>span]:truncate` on the value span. It has to be the child selector
 *   rather than a wrapper element: wrapping `{children}` would change the DOM every consumer
 *   already styles against. `truncate` needs the span blockified to apply `text-overflow`,
 *   which being a flex item already does for it.
 * - `shrink-0` on the chevron, so it keeps its 14px even when the label is what has to give.
 *
 * `[&>span]` matches the value and nothing else — the icon below is `asChild`, so it renders
 * as the `<svg>`, not as a span.
 */
declare const SelectTrigger: react.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;
declare const SelectContent: react.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
/** An option. `value=""` is allowed: see `Select`. */
declare const SelectItem: react.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const Dialog: react.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: react.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const DialogClose: react.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;
/**
 * The dialog itself: capped at `85dvh`, and a flex column so a `DialogBody`
 * inside it can be the thing that scrolls.
 *
 * `dvh` and not `vh`: on a phone `vh` measures the viewport with the browser
 * chrome retracted, so an `85vh` dialog is taller than the screen it is on for
 * as long as the address bar is showing — exactly when somebody is reaching for
 * its buttons. The cap is overridable: `cn` is tailwind-merge, so a `max-h-*` in
 * `className` replaces it rather than fighting it.
 *
 * **It is a scroll container, so it CLIPS.** Anything absolutely positioned
 * inside a dialog that used to spill past its edge — `SearchSelect`'s dropdown
 * is the one in this package — is now cut off at the boundary. Radix-based
 * `Select`, `Popover` and `Tooltip` portal out and are unaffected. A consumer
 * that needs the old behaviour more than it needs the cap can pass
 * `overflow-visible`, which tailwind-merge will honour.
 */
declare const DialogContent: react.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
/**
 * The scrolling middle of a dialog, between a pinned header and footer.
 *
 * **Use this whenever a dialog can get long.** `DialogContent` caps itself and
 * will scroll as a whole without it, which keeps a tall dialog reachable — but
 * scrolling the whole dialog takes the footer with it, so the primary action ends
 * up below the fold of its own dialog, and it takes the close X too, which is
 * positioned against the content box and scrolls out of view with everything
 * else. Wrapping the body in this keeps all three still and moves only the part
 * that is actually long.
 *
 * `min-h-0` is the load-bearing class and the reason this is a component rather
 * than a line in a consumer's `className`: a flex child defaults to
 * `min-height: auto` and refuses to shrink below its content, so `overflow-y-auto`
 * never engages without it. It is an easy thing to write out by hand and get
 * subtly wrong.
 */
declare function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): ReactElement;
declare function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): ReactElement;
declare const DialogTitle: react.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & react.RefAttributes<HTMLHeadingElement>, "ref"> & react.RefAttributes<HTMLHeadingElement>>;
declare function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>): ReactElement;
declare function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): ReactElement;

/** Why the viewer is asking the app for content. */
type FileViewerFallbackReason = "doc" | "render-failed" | "unsupported";
interface FileViewerFallbackRequest {
    /**
     * `doc` for a Word 97–2003 file, `render-failed` for a `.docx` the browser
     * could not lay out, `unsupported` for a type the viewer has no renderer for.
     */
    reason: FileViewerFallbackReason;
    url: string;
    filename: string;
    /** The resolved MIME type, lowercased and without parameters; "" when unknown. */
    contentType: string;
    /** Aborted when the dialog closes; pass it to fetch. */
    signal: AbortSignal;
}
/**
 * What the app can show instead. `html` is sanitised again by the viewer;
 * `text` is shown as preformatted text, with `note` in a banner above it.
 */
type FileViewerFallbackContent = {
    html: string;
} | {
    text: string;
    note?: string;
};
/** Resolves to the content to show, or null/undefined for the download-only message. */
type FileViewerFallback = (request: FileViewerFallbackRequest) => Promise<FileViewerFallbackContent | null | undefined>;
interface FileViewerProps {
    /** Same-origin file URL; fetched with the browser's normal credentials. */
    url: string;
    /** Dialog title, Download filename, iframe title and image alt. */
    filename: string;
    /** Decides the renderer when given. Otherwise the response's Content-Type does. */
    contentType?: string | null;
    /** Content for `.doc`, failed DOCX renders and unsupported types. Omit for download-only. */
    loadFallback?: FileViewerFallback;
    /**
     * The trigger: one element that forwards its ref and props, such as a
     * `Button`. Optional in controlled mode.
     */
    children?: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
/**
 * A file in a dialog over the page: PDF in the browser's own viewer, Word
 * (`.docx`) laid out as pages, CSV as a table, PNG/JPEG/GIF/BMP/WebP/AVIF
 * images and plain text. Legacy `.doc`, a `.docx` that can't be laid out and
 * other types show what `loadFallback` returns, or a Download.
 *
 * Wrap any trigger, or pass `open`/`onOpenChange` to control it. Every open
 * fetches the file afresh. PDFs frame `url`, so the app must allow same-origin
 * framing of that route; see the README.
 */
declare function FileViewer({ url, filename, contentType, loadFallback, children, open, onOpenChange, }: FileViewerProps): ReactElement;

declare const AlertDialog: react.FC<AlertDialogPrimitive.AlertDialogProps>;
declare const AlertDialogTrigger: react.ForwardRefExoticComponent<AlertDialogPrimitive.AlertDialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogContent: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const AlertDialogHeader: typeof DialogHeader;
declare const AlertDialogFooter: typeof DialogFooter;
declare const AlertDialogTitle: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTitleProps & react.RefAttributes<HTMLHeadingElement>, "ref"> & react.RefAttributes<HTMLHeadingElement>>;
declare const AlertDialogDescription: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogDescriptionProps & react.RefAttributes<HTMLParagraphElement>, "ref"> & react.RefAttributes<HTMLParagraphElement>>;
interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
    /**
     * `"destructive"` draws the action as the solid destructive button, for a
     * delete or a removal: the same prop and look as `Button`'s `tone`.
     */
    tone?: "default" | "destructive";
}
declare const AlertDialogAction: react.ForwardRefExoticComponent<AlertDialogActionProps & react.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogCancel: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogCancelProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const DropdownMenu: react.FC<DropdownMenuPrimitive.DropdownMenuProps>;
declare const DropdownMenuTrigger: react.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const DropdownMenuGroup: react.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuGroupProps & react.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuContent: react.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuItem: react.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuItemProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSeparator: react.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSeparatorProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuLabel: react.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuLabelProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const Sheet: react.FC<DialogPrimitive.DialogProps>;
declare const SheetTrigger: react.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const SheetClose: react.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;
interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    side?: "left" | "right";
}
declare const SheetContent: react.ForwardRefExoticComponent<SheetContentProps & react.RefAttributes<HTMLDivElement>>;
declare function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): ReactElement;
declare const SheetTitle: react.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & react.RefAttributes<HTMLHeadingElement>, "ref"> & react.RefAttributes<HTMLHeadingElement>>;
declare function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): ReactElement;
declare function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): ReactElement;

declare const Separator: react.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;

declare const toneClasses: {
    readonly accent: "bg-accent";
    readonly success: "bg-success";
    readonly warning: "bg-warning";
    readonly error: "bg-error";
    readonly info: "bg-info";
};
type ProgressTone = keyof typeof toneClasses;
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    /**
     * The fill's color. `accent` (default) for plain progress; a status tone when
     * the amount itself is the news — complete, over, short.
     */
    tone?: ProgressTone;
}
/**
 * A bar filled to `value` (of `max`, 100 by default). A `progressbar` to
 * assistive tech: give it an `aria-label` (or `aria-labelledby`) saying what
 * is filling up.
 *
 * `value` is clamped to `[0, max]`, so 120 of 100 hours is a full bar (and
 * `aria-valuenow` 100) rather than one drawn past its track; say the overrun
 * in the text beside it. A `max` that is not above 0 is taken as 100.
 */
declare const Progress: react.ForwardRefExoticComponent<ProgressProps & react.RefAttributes<HTMLDivElement>>;

declare const Tabs: react.ForwardRefExoticComponent<TabsPrimitive.TabsProps & react.RefAttributes<HTMLDivElement>>;
declare const TabsList: react.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const TabsTrigger: react.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;
declare const TabsContent: react.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const TooltipProvider: react.FC<TooltipPrimitive.TooltipProviderProps>;
declare const Tooltip: react.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: react.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const TooltipContent: react.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const Popover: react.FC<PopoverPrimitive.PopoverProps>;
declare const PopoverTrigger: react.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const PopoverAnchor: react.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & react.RefAttributes<HTMLDivElement>>;
declare const PopoverContent: react.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

type HoverCardProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>;
/**
 * A preview that opens while the pointer rests on its trigger, or while the
 * trigger has keyboard focus — a person's details behind a calendar chip. A
 * click on the trigger PINS it open until a second click, Escape or a click
 * outside, which is also how a touch screen opens it.
 *
 * The trigger carries `aria-expanded` and, while open, `aria-controls`.
 *
 * **For preview content only.** The card is not in the Tab order (Radix keeps
 * a hover card out of it), so a keyboard user cannot reach a link or button
 * inside it. Put interactive content in a `Popover`, which takes focus. Use
 * `Tooltip` for a line of text naming a control.
 */
declare function HoverCard({ open: controlledOpen, defaultOpen, onOpenChange, openDelay, closeDelay, ...props }: HoverCardProps): ReactElement;
/** The trigger. Pass `asChild` to make your own `Button` or `CategoryChip` it. */
declare const HoverCardTrigger: react.ForwardRefExoticComponent<Omit<HoverCardPrimitive.HoverCardTriggerProps & react.RefAttributes<HTMLAnchorElement>, "ref"> & react.RefAttributes<HTMLAnchorElement>>;
declare const HoverCardContent: react.ForwardRefExoticComponent<Omit<HoverCardPrimitive.HoverCardContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const ScrollArea: react.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

type ToastVariant = "default" | "success" | "error" | "info" | "warning";
interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
}
type ToastInput = Omit<Toast, "id">;
interface ToastContextValue {
    toast: (t: ToastInput) => void;
}
declare function useToast(): ToastContextValue;
type ToastOptions = Pick<ToastInput, "description">;
/**
 * Fire a toast without `useToast()`. Shows in whichever `ToastProvider` is
 * mounted; with none mounted it is a no-op, the same as `useToast()` outside a
 * provider.
 *
 * ```ts
 * toast.success("Saved");
 * toast.error("Couldn't save", { description: res.error });
 * ```
 */
declare const toast: ((t: ToastInput) => void) & {
    success: (title: string, options?: ToastOptions) => void;
    error: (title: string, options?: ToastOptions) => void;
    info: (title: string, options?: ToastOptions) => void;
    warning: (title: string, options?: ToastOptions) => void;
};
declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): ReactElement;

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    /**
     * The title's heading element. `h3` (default) for a gap inside a page; `h1`
     * when the empty state is the whole page ("Access denied", "Not found").
     */
    as?: "h1" | "h2" | "h3" | "h4";
    description?: string;
    action?: React.ReactNode;
    className?: string;
}
declare function EmptyState({ icon, title, as: Heading, description, action, className, }: EmptyStateProps): ReactElement;

interface PageHeaderBack {
    href: string;
    /** Where it goes: "Contracts", "All profiles". */
    label: string;
    /**
     * The link element to render, for client-side routing — Next.js's `Link`,
     * say. Defaults to a plain `<a>`.
     */
    as?: ElementType<{
        href: string;
        children?: ReactNode;
    }>;
}
interface PageHeaderProps {
    title: ReactNode;
    description?: string;
    actions?: ReactNode;
    /** A link back to the page above this one, shown over the title. */
    back?: PageHeaderBack;
    className?: string;
}
/**
 * The page's title (its `h1`), with an optional description, actions on the
 * right, and a back link above it. For a section's heading inside the page,
 * use `CardHeader`.
 */
declare function PageHeader({ title, description, actions, back, className }: PageHeaderProps): ReactElement;

/**
 * The table elements, styled once. `DataTable` is built from these; use them
 * directly for a table `DataTable` does not fit — an editable grid, a short
 * summary inside a `Card`. Every part takes `className`, merged last, so a
 * cell's padding or alignment can be overridden in place.
 */
declare const Table: react.ForwardRefExoticComponent<react.TableHTMLAttributes<HTMLTableElement> & react.RefAttributes<HTMLTableElement>>;
/** The heading rows. Their bottom border is the full `border` token, not the subtle one. */
declare const TableHeader: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLTableSectionElement> & react.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLTableSectionElement> & react.RefAttributes<HTMLTableSectionElement>>;
/** Totals. A heavier rule above sets them off from the body. */
declare const TableFooter: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLTableSectionElement> & react.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLTableRowElement> & react.RefAttributes<HTMLTableRowElement>>;
declare const TableHead: react.ForwardRefExoticComponent<react.ThHTMLAttributes<HTMLTableCellElement> & react.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: react.ForwardRefExoticComponent<react.TdHTMLAttributes<HTMLTableCellElement> & react.RefAttributes<HTMLTableCellElement>>;

/**
 * Per-column presentation, set on a column's `meta`:
 *
 * ```ts
 * { accessorKey: "amount", header: "Amount", meta: { align: "right", className: "w-32" } }
 * ```
 *
 * Declared on TanStack's own `ColumnMeta` so it typechecks in the consumer's
 * column definitions with no cast.
 */
declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        /** Aligns the header and the cells. Right for numbers. Defaults to left. */
        align?: "left" | "right" | "center";
        /** Extra classes on every body cell in the column — a width, `whitespace-nowrap`. */
        className?: string;
        /** Extra classes on the column's header cell. */
        headerClassName?: string;
    }
}
interface DataTableProps<TData, TValue> {
    /**
     * TanStack column definitions. Give a column a `footer` (a string, or a
     * function of the table: `({ table }) => total(table.getFilteredRowModel().rows)`)
     * and the table gets a footer row, for totals.
     */
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onRowClick?: (row: TData) => void;
    pageSize?: number;
    /**
     * `false` turns the table's own paging off and renders every row it is given.
     * For a list the server already pages: hand it one page of rows and put a
     * `Pagination` under it. Otherwise `pageSize`, which is read once on mount,
     * would cut a page the server sent and add a second pager inside the real one.
     */
    paginate?: boolean;
    /**
     * A stable id per row, used as its React key. Without it rows are keyed by
     * index, so a cell that holds its own state (an inline rename, an open menu)
     * moves to a different row when the list re-sorts or gains a row.
     */
    getRowId?: (row: TData) => string;
    enableSelection?: boolean;
    emptyMessage?: string;
    /**
     * What a page reset keys off.
     *
     * By default the page returns to 1 whenever `data` changes — TanStack's
     * `autoResetPageIndex`. That is right for a filter change and wrong for a refresh,
     * because both hand us a new array: re-fetching the same list after a row edit
     * throws the reader back to page 1, and on a long list they have to page forward
     * again for every edit.
     *
     * Pass a value that identifies the *filters* (a string of their current values, say)
     * and the page resets when that changes instead of on every `data` change. A refresh
     * then keeps the reader where they were, and unlike remounting the table on a `key`,
     * the column sort survives.
     */
    resetPageOn?: unknown;
    /** Extra classes for a row, applied after the stripe and hover so a tint wins. */
    rowClassName?: (row: TData) => string | undefined;
    /**
     * Controlled sort. Without it the table keeps its own sort state, as before.
     * With `manualSorting` the table only reports header clicks through
     * `onSortingChange` and shows `data` in the order given — for a server sort.
     */
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    manualSorting?: boolean;
    /**
     * Detail shown in a full-width row under an expanded row — an audit entry's
     * changed fields, say. Setting it adds a leading column with a toggle button
     * on every row that can expand. Pair with `getRowId` so a refetch keeps the
     * same rows open.
     */
    renderExpanded?: (row: TData) => React.ReactNode;
    /** Which rows get a toggle. Defaults to every row when `renderExpanded` is set. */
    getRowCanExpand?: (row: TData) => boolean;
    /**
     * A click anywhere on an expandable row toggles it too, not just the button.
     * `onRowClick` still fires for those clicks; a click on the button itself
     * never reaches `onRowClick`.
     */
    expandOnRowClick?: boolean;
}
declare function DataTable<TData, TValue>({ columns, data, onRowClick, pageSize, paginate, getRowId, enableSelection, emptyMessage, resetPageOn, rowClassName, sorting: controlledSorting, onSortingChange, manualSorting, renderExpanded, getRowCanExpand, expandOnRowClick, }: DataTableProps<TData, TValue>): ReactElement;

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: string;
    onChange: (value: string) => void;
}
/**
 * Money input. CRITICAL: while the field is focused we render the RAW typed value
 * (so multi-digit entry works — typing "150" stays "150"); we only apply 2-decimal
 * formatting on blur. Reformatting on every keystroke (the previous bug) fought the
 * caret and mangled input (e.g. "150" -> "1.01"). The value handed to onChange is
 * always the raw decimal string (never a float) so money stays Decimal-safe.
 */
declare const MoneyInput: react.ForwardRefExoticComponent<MoneyInputProps & react.RefAttributes<HTMLInputElement>>;

/**
 * How cmdk decides what a search matches: a score, where 0 means "no match" and
 * anything above it ranks. Mirrors cmdk's own filter signature so a consumer can
 * pass `defaultFilter`, their own matcher, or nothing at all.
 */
type CommandFilter = (value: string, search: string, keywords?: string[]) => number;
interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    /**
     * Makes the query controlled, so the consumer owns it.
     *
     * Needed to render only the rows that will be shown. cmdk filters whatever is
     * rendered, so "show me the best five" is only possible if the consumer can
     * see the query and decide what to render — and that matters more than it
     * sounds: mounting every row is superlinear in cmdk (each registration
     * reschedules the filter and the sort), so a few hundred rows makes opening
     * the palette take seconds. Pair with `shouldFilter={false}`.
     */
    value?: string;
    /** Fires on every keystroke when `value` is supplied. */
    onValueChange?: (value: string) => void;
    /**
     * Whether cmdk filters and sorts the rows. Default `true`.
     *
     * Set `false` when the consumer has already narrowed and ordered them. It also
     * side-steps cmdk's most surprising behaviour: a row that does not match is
     * rendered as `null`, and cmdk resolves a row's search value from that row's
     * DOM NODE — so a row that first mounts while a search is already active has
     * no node to read, caches an empty value, scores 0, and stays invisible for as
     * long as the palette is open. With filtering off, rows always render, so rows
     * that arrive late (or change as the query changes) behave.
     */
    shouldFilter?: boolean;
    /** Replaces cmdk's default fuzzy scorer. Ignored when `shouldFilter` is false. */
    filter?: CommandFilter;
    /**
     * Whether ArrowUp/ArrowDown wrap around at the ends. Default `true`, which is
     * what this component has always done — pass `false` for a long list, where
     * one ArrowUp at the top jumping to the last row reads as a scroll bug.
     */
    loop?: boolean;
    placeholder?: string;
    /** Shown when nothing matches. Ignored when `shouldFilter` is false. */
    emptyMessage?: React.ReactNode;
    /** Names the dialog for assistive technology. */
    label?: string;
}
/**
 * A ⌘K command palette.
 *
 * Binds ⌘K / Ctrl+K on `document` while mounted — unless something nearer the
 * target already handled the press (`defaultPrevented`), so a focused control
 * with its own ⌘K, such as `RichTextEditor`'s link shortcut, keeps it — closes
 * on Escape (wherever focus is while it is open) and on a click outside, and **renders into `document.body`** — the last of those is not
 * cosmetic. The panel positions itself with `fixed`, and a `backdrop-filter`
 * anywhere in its ancestry (a translucent app header, say) makes that ancestor
 * the containing block for fixed descendants, so an in-place palette silently
 * sizes itself to the header instead of the viewport.
 */
declare function CommandPalette({ open, onOpenChange, children, value, onValueChange, shouldFilter, filter, loop, placeholder, emptyMessage, label, }: CommandPaletteProps): react.ReactPortal | null;
declare function CommandGroup({ heading, children }: {
    heading: string;
    children: React.ReactNode;
}): react.JSX.Element;
interface CommandItemProps {
    onSelect: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
    /**
     * What this row is matched and identified by. Defaults to the row's rendered
     * text, which is cmdk's behaviour and is usually right.
     *
     * Supply it when two rows can read identically — two employees with the same
     * name, say. cmdk keys SELECTION on this value, not on the element, so
     * duplicates come out both highlighted, unreachable from one another by
     * ArrowDown, and Enter always takes the first of them.
     *
     * It also decouples matching from the DOM: cmdk otherwise reads the value off
     * the rendered node, which a row cannot do while it is filtered out.
     */
    value?: string;
    /** Extra terms this row should match on, beyond its text. */
    keywords?: string[];
    /** Keeps the row rendered even when it does not match the current search. */
    forceMount?: boolean;
    /** Skipped by keyboard navigation and not selectable. */
    disabled?: boolean;
}
declare function CommandItem({ onSelect, icon, children, value, keywords, forceMount, disabled, }: CommandItemProps): react.JSX.Element;

interface SearchSelectOption {
    value: string;
    label: string;
    sublabel?: string;
    /** Shown but not selectable; the arrow keys pass over it. */
    disabled?: boolean;
}
interface SearchSelectProps {
    value: string | null;
    onChange: (value: string | null) => void;
    onSearch: (query: string) => void;
    /**
     * Fires immediately on every keystroke, un-debounced — before the debounced
     * `onSearch`. Use it when editing the query must take effect at once rather
     * than after the debounce, e.g. to invalidate a prior selection the moment the
     * user starts typing a replacement (so a stale value can't be submitted during
     * the debounce window). `onSearch` remains the throttled hook for the actual
     * fetch.
     */
    onQueryChange?: (query: string) => void;
    options: SearchSelectOption[];
    /**
     * The chosen option, for the trigger to show when it is not in `options` —
     * a value loaded with the record, before any search has run, or one the
     * latest search no longer returns. Without it such a value shows the
     * placeholder. An entry in `options` with the same value wins.
     */
    selectedOption?: SearchSelectOption | null;
    /** Disables the trigger, so the list cannot open. */
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
    /** Shown in the list when there are no options. Defaults to "No results". */
    emptyMessage?: React.ReactNode;
    className?: string;
    /**
     * Applied to the trigger `<button>`, so an external `<label htmlFor={id}>` can
     * name the control (the trigger is a labelable button). Without it the label
     * has nothing to bind to and assistive tech can't announce the field.
     *
     * Note: an external `<label htmlFor={id}>` only names the *trigger*. Once the
     * dropdown opens, focus moves to the search `combobox` input, which the label
     * can't reach — so it would be announced by its placeholder ("Search…")
     * instead of the field name. Pass `ariaLabel` to name both elements.
     */
    id?: string;
    /**
     * Accessible name applied as `aria-label` to *both* the trigger `<button>` and
     * the search `combobox` input. Use this so the field is announced with the same
     * name whether focus is on the closed trigger or the opened input — an external
     * `<label htmlFor={id}>` only reaches the trigger.
     */
    ariaLabel?: string;
    /**
     * Marks the field as required. Because the field has two focusable states, the
     * required state is conveyed in both:
     * - the `combobox` input (focused while open) gets `aria-required` — the
     *   supported state for the combobox role;
     * - the trigger `<button>` (focused while closed, the field's resting state)
     *   gets `aria-describedby` pointing to a visually-hidden "Required" hint,
     *   since `aria-required` is not a supported state on the `button` role.
     * Without the trigger hint, assistive tech couldn't discover the requirement
     * until the user opened the dropdown.
     */
    required?: boolean;
    /**
     * Screen-reader text describing the required state on the closed trigger
     * (referenced via `aria-describedby`). Override to localize. Only rendered
     * when `required` is set.
     */
    requiredLabel?: string;
    /**
     * Override styling of the trigger `<button>`. Merged after the default
     * classes via `cn`, so a consumer can restyle the control for a differently
     * themed surface (e.g. a light-themed public page).
     */
    triggerClassName?: string;
    /** Override styling of the dropdown panel. Merged after the defaults via `cn`. */
    contentClassName?: string;
    /** Override styling of each option `<button>`. Merged after the defaults via `cn`. */
    optionClassName?: string;
    clearable?: boolean;
    renderOption?: (option: SearchSelectOption) => React.ReactNode;
    /**
     * Open the dropdown and focus the search input on mount. Used inside dialogs
     * so a keyboard user can type a name immediately — without this the closed
     * trigger button takes focus (it looks highlighted but can't be typed into).
     */
    autoFocus?: boolean;
    /**
     * Offers to create the typed value. It shows as the last option whenever the
     * trimmed query has no option with exactly that label (ignoring case), and is
     * hidden while `loading`. Called with the trimmed query; select the new
     * record yourself (`value`, and an `options` entry for its label). The list
     * closes once it resolves. While it is pending the option is disabled, so a
     * second Enter or click cannot create twice. If it rejects, the list stays
     * open with the query for another try, and the rejection is swallowed:
     * report the error yourself (a toast) before rethrowing.
     */
    onCreate?: (input: string) => void | Promise<void>;
    /** Text of the create option. Defaults to `Create "<input>"`. */
    createLabel?: (input: string) => React.ReactNode;
}
declare function SearchSelect({ value, onChange, onSearch, onQueryChange, options, selectedOption: selectedOptionProp, disabled, loading, placeholder, emptyMessage, className, id, ariaLabel, required, requiredLabel, triggerClassName, contentClassName, optionClassName, clearable, renderOption, autoFocus, onCreate, createLabel, }: SearchSelectProps): ReactElement;

interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Numeric value or decimal string. Formatted via formatMoney. */
    value: string | number | null | undefined;
    /** Render negative values in the error color (parentheses already signal sign). */
    colorNegative?: boolean;
}
/**
 * Monospace, tabular-aligned currency display. Use anywhere a dollar amount is
 * shown in a table cell, ledger row, or detail panel so figures line up on the
 * decimal. Wraps formatMoney for consistent $ / (parentheses) formatting.
 */
declare function Money({ value, colorNegative, className, ...props }: MoneyProps): react.JSX.Element;

interface FormFieldProps {
    label: React.ReactNode;
    /** Associates the label with a control via its id. */
    htmlFor?: string;
    required?: boolean;
    /** Error message; takes precedence over hint and colors the field error. */
    error?: string;
    /** Helper text shown below the control when there is no error. */
    hint?: string;
    className?: string;
    children: React.ReactNode;
}
/**
 * Labelled form control wrapper: a `Label` above the control with an optional
 * required marker, and an error or a hint below it. Pairs with the Input,
 * Select, Textarea, and MoneyInput primitives.
 *
 * When `children` is a single element, the field's state reaches the control
 * itself, so a screen reader reads it with the field rather than leaving it
 * stranded around it: `aria-describedby` pointing at the error or hint (added to
 * any it already has), `aria-invalid` while there is an error, and
 * `aria-required` when `required` (unless the control already sets `required`
 * or `aria-required`).
 *
 * A `Select` renders no element of its own (it wraps Radix's Root), so the
 * props go to the `SelectTrigger` among its direct children instead. A trigger
 * nested deeper (inside a wrapper of your own) is not found: pass it
 * `aria-describedby`, `aria-invalid` and `aria-required` yourself.
 */
declare function FormField({ label, htmlFor, required, error, hint, className, children, }: FormFieldProps): ReactElement;

interface DefinitionListProps {
    /** Number of columns in the grid. Defaults to 2. */
    columns?: 1 | 2 | 3;
    className?: string;
    children: React.ReactNode;
}
/**
 * Grid of label/value pairs for detail panels and summary sections. Wrap
 * DefinitionItem children. Defaults to a 2-column layout matching the detail
 * sheets used throughout the app.
 */
declare function DefinitionList({ columns, className, children }: DefinitionListProps): react.JSX.Element;
interface DefinitionItemProps {
    label: React.ReactNode;
    /** The value. Accepts text, a Badge, or any node. */
    children: React.ReactNode;
    className?: string;
}
/** A single label-over-value pair inside a DefinitionList. */
declare function DefinitionItem({ label, children, className }: DefinitionItemProps): react.JSX.Element;

interface FilterBarProps {
    /** Current search value. When provided with onSearchChange, renders the search box. */
    search?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    /**
     * Accessible name for the search input (its `aria-label`). Defaults to
     * `searchPlaceholder`, since a placeholder alone is not a name.
     */
    searchLabel?: string;
    /** Filter controls (selects, toggles) rendered to the right of the search box. */
    children?: React.ReactNode;
    className?: string;
}
/**
 * Toolbar above a list/table: a search input with a leading icon plus a slot
 * for filter controls. Pass DS `Select`s (or `MultiStatusFilter`) as children.
 */
declare function FilterBar({ search, onSearchChange, searchPlaceholder, searchLabel, children, className, }: FilterBarProps): react.JSX.Element;

interface StatCardProps {
    label: string;
    value: ReactNode;
    /** Optional sub-line, e.g. a delta or context. Colored by trend. */
    sub?: string;
    trend?: "up" | "down" | "neutral";
    loading?: boolean;
    /** Top-right of the tile, level with the label: a link, a menu, an info tooltip. */
    action?: ReactNode;
    /** Anything under the value and sub-line: a breakdown, a Progress, a link. */
    children?: ReactNode;
    /** Merged onto the value, e.g. a tone (`text-error-text`) or a smaller size. */
    valueClassName?: string;
    className?: string;
}
/**
 * KPI/metric tile: an uppercase label, a large monospace value, and an optional
 * trend-colored sub-line. Shows a skeleton in place of the value while loading.
 */
declare function StatCard({ label, value, sub, trend, loading, action, children, valueClassName, className, }: StatCardProps): ReactElement;

/**
 * Shared foundations for the CarbonOS chart components (BarChart, LineChart,
 * DonutChart). Everything here is presentation-level: the card shell, the
 * series palette contract, the tooltip and legend, and the screen-reader table
 * that every chart renders alongside its plot.
 *
 * ── The series palette ──
 * Charts take their colors from the eight `--color-chart-*` tokens in
 * theme.css, assigned in fixed slot order and never cycled. That order is the
 * colorblind-safety mechanism (adjacent slots are validated for separation
 * under protanopia and deuteranopia), so a ninth series does NOT wrap back to
 * slot 1 — it folds into "Other", or the data gets split across two charts.
 * `seriesColor()` clamps rather than wraps to keep that guarantee.
 *
 * ── Status colors are not series colors ──
 * The success / error / warning tokens keep their reserved meaning. Don't pass
 * them as a series `color` to mean "the fourth line".
 */
/** Number of distinct categorical series the palette can encode. */
declare const CHART_SERIES_LIMIT = 8;
/**
 * Color for categorical slot `index` (0-based), as a CSS variable reference so
 * it re-resolves when the theme flips between light and dark.
 *
 * Clamps at the last slot instead of cycling: a repeated hue reads as a
 * repeated entity. If you have more series than slots, fold the tail into an
 * "Other" series rather than relying on this.
 */
declare function seriesColor(index: number): string;
/**
 * Fill for anything the categorical palette deliberately refuses to encode —
 * a folded "Other" wedge, or categories past the eighth slot. It reads as
 * "no identity assigned" rather than as another entity, which is the honest
 * signal when the palette has run out.
 */
declare const CHART_NEUTRAL_COLOR = "var(--color-text-faint)";
/** One plotted measure. `color` overrides the palette slot for this series. */
interface ChartSeries {
    /** Key to read off each datum. */
    key: string;
    /** Human-readable name — shown in the legend, tooltip, and table view. */
    label: string;
    /** Overrides the assigned palette slot. Use a `--color-chart-*` token. */
    color?: string;
}
/** A row of chart data: the category plus one numeric field per series key. */
type ChartDatum = Record<string, string | number | null | undefined>;
/** Resolves each series to its final color, honoring explicit overrides. */
declare function resolveSeriesColors(series: ChartSeries[]): string[];
/**
 * Caps a series list at the palette limit. Returns the kept series; anything
 * beyond the limit is dropped rather than silently recolored, and flagged in
 * development so the truncation is not invisible.
 */
declare function capSeries(series: ChartSeries[], context: string): ChartSeries[];
/** Default number formatting: grouped thousands, no forced decimals. */
declare const formatChartValue: (value: number) => string;
type ChartValueFormatter = (value: number) => string;
interface ChartCardProps {
    /** Section heading. Names the measure so a single-series chart needs no legend. */
    title?: react.ReactNode;
    /** Supporting line under the title — a period, a caveat, a unit. */
    subtitle?: react.ReactNode;
    /** Right-aligned controls: a metric Select, a date range, a Tabs switcher. */
    action?: react.ReactNode;
    /** Rendered under the chart — a source note or a threshold key. */
    footer?: react.ReactNode;
    className?: string;
    children: react.ReactNode;
}
/**
 * Titled card that a chart sits inside. Pure chrome — the chart itself owns its
 * loading and empty states, so this composes with any of them:
 *
 * ```tsx
 * <ChartCard title="Leads by property" action={<PeriodSelect />}>
 *   <BarChart data={rows} categoryKey="property" series={[{ key: "leads", label: "Leads" }]} />
 * </ChartCard>
 * ```
 */
declare function ChartCard({ title, subtitle, action, footer, className, children, }: ChartCardProps): react.ReactElement;
interface ChartLegendItem {
    label: string;
    color: string;
    /** Renders the swatch dimmed — for a series toggled off. */
    inactive?: boolean;
    /**
     * A figure at the end of the entry — a share, a total. Set it on any item
     * and the legend lists its entries in a column, values right-aligned.
     */
    value?: react.ReactNode;
}
interface ChartLegendProps {
    items: ChartLegendItem[];
    /** Makes each entry a button. Use to toggle series visibility. */
    onItemClick?: (index: number) => void;
    className?: string;
}
/**
 * Swatch-and-label key. Identity is never carried by color alone — the label
 * beside the swatch is what a colorblind reader goes by. Text stays in the ink
 * tokens; only the swatch takes the series color.
 */
declare function ChartLegend({ items, onItemClick, className }: ChartLegendProps): react.ReactElement;
interface TooltipPayloadItem {
    name?: string | number;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
    payload?: Record<string, unknown>;
}
/** One plotted series at the hovered category, as a custom tooltip sees it. */
interface ChartTooltipEntry {
    /** The series `key`. */
    key: string;
    /** The series `label`. */
    label: string;
    value: number;
    color: string;
    /** The whole data row for the hovered category. */
    datum: ChartDatum;
}
interface ChartTooltipContext {
    /** The hovered category, as in the data (before any `labelFormatter`). */
    label: string | number;
    /** The visible series, in plot order. */
    payload: ChartTooltipEntry[];
}
/**
 * A custom tooltip body for `LineChart` and `BarChart`. It renders inside the
 * standard tooltip shell, replacing the heading and rows. Return `null` to show
 * no tooltip for that category.
 */
type ChartTooltipRenderer = (ctx: ChartTooltipContext) => react.ReactNode;
interface ChartTooltipContentProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string | number;
    valueFormatter?: ChartValueFormatter;
    /** Rewrites the tooltip heading — e.g. a short week key into a full date. */
    labelFormatter?: (label: string | number) => string;
    /** Replaces the body. See `ChartTooltipRenderer`. */
    render?: ChartTooltipRenderer;
}
/**
 * Tooltip body. Values are monospaced so they stay column-aligned across rows,
 * matching the tabular-nums treatment used in tables.
 */
declare function ChartTooltipContent({ active, payload, label, valueFormatter, labelFormatter, render, }: ChartTooltipContentProps): react.ReactElement | null;
/** The hovered slice of a `DonutChart`, as a custom tooltip sees it. */
interface DonutTooltipContext<TDatum = {
    label: string;
    value: number;
    color?: string;
}> {
    /** The slice's data row — the folded "Other" slice gets a synthetic one. */
    datum: TDatum;
    value: number;
    color: string;
}
interface SliceTooltipContentProps<TDatum> {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    render: (ctx: DonutTooltipContext<TDatum>) => react.ReactNode;
}
/** Custom tooltip body for a pie slice, in the standard shell. */
declare function ChartSliceTooltipContent<TDatum>({ active, payload, render, }: SliceTooltipContentProps<TDatum>): react.ReactElement | null;
interface ChartDataTableProps {
    caption: string;
    categoryLabel: string;
    categories: (string | number)[];
    series: ChartSeries[];
    data: ChartDatum[];
    valueFormatter?: ChartValueFormatter;
}
/**
 * The same numbers as a real table, visually hidden.
 *
 * This is the chart's accessible fallback: an SVG plot is unreadable to a
 * screen reader, and it doubles as the "relief channel" that makes lower-
 * contrast palette slots legitimate in light mode — the values are always
 * available in text somewhere.
 */
declare function ChartDataTable({ caption, categoryLabel, categories, series, data, valueFormatter, }: ChartDataTableProps): react.ReactElement;
interface ChartStateProps {
    loading?: boolean;
    /** Heading for the empty state shown when `data` has no rows. */
    emptyTitle?: string;
    emptyDescription?: string;
}
/** Skeleton stand-in sized to the chart's own height, to avoid layout shift. */
declare function ChartSkeleton({ height }: {
    height: number;
}): react.ReactElement;
declare function ChartEmpty({ height, title, description, }: {
    height: number;
    title?: string;
    description?: string;
}): react.ReactElement;
/** Tick style for a numeric axis. */
declare const CHART_TICK_VALUE: {
    readonly fill: "var(--color-text-secondary)";
    readonly fontSize: 11;
    readonly fontFamily: "var(--font-mono)";
};
/** Tick style for a category axis. */
declare const CHART_TICK_CATEGORY: {
    readonly fill: "var(--color-text-secondary)";
    readonly fontSize: 11;
    readonly fontFamily: "var(--font-body)";
};
/** Gridlines and axis rules — recessive, behind the data. */
declare const CHART_GRID_COLOR = "var(--color-chart-grid)";
/** Direct value labels wear an ink token, never the series color. */
declare const CHART_LABEL_STYLE: {
    readonly fill: "var(--color-text-secondary)";
    readonly fontSize: 10;
    readonly fontFamily: "var(--font-mono)";
    readonly fontWeight: 500;
};

interface BarChartProps extends ChartStateProps {
    data: ChartDatum[];
    /** Field holding each row's category name (the label axis). */
    categoryKey: string;
    /** One entry per measure. Colors come from the palette in slot order. */
    series: ChartSeries[];
    /**
     * Which way the bars run. `"vertical"` (default) stands them up from a
     * bottom baseline; `"horizontal"` lays them out from the left, which is the
     * right choice when category names are long — they get a real label column
     * instead of being rotated.
     */
    orientation?: "vertical" | "horizontal";
    /** Stacks multiple series into one bar per category instead of grouping them. */
    stacked?: boolean;
    /**
     * `"series"` (default) gives every bar of a measure the same hue — bar length
     * already encodes the value, so color is free to encode *which measure*.
     *
     * `"category"` gives each bar its own palette slot. Only reach for it when
     * the bar colors are load-bearing elsewhere on the page (a donut of the same
     * categories beside it, say). On its own it re-encodes what length already
     * shows and burns the identity channel. Single-series charts only.
     *
     * There are eight identity slots. Bars past the eighth render neutral rather
     * than repeating a hue — two bars in the same color read as the same entity —
     * and the overflow is logged. Sort and group the tail if you hit this.
     */
    colorBy?: "series" | "category";
    /**
     * Prints each bar's value at its end. Defaults on for a single series — it
     * is the relief channel that keeps lower-contrast palette slots readable —
     * and off for multiple, where a number per bar becomes noise.
     */
    valueLabels?: boolean;
    /** Legend visibility. Defaults on for 2+ series; a single series is named by the title. */
    legend?: boolean;
    /** Lets a legend click show/hide that series. */
    toggleableSeries?: boolean;
    /** Plot height in px, excluding legend. */
    height?: number;
    /** Upper bound on bar thickness in px, so few categories don't become slabs. */
    maxBarSize?: number;
    /** Formats tooltip values and data labels. */
    valueFormatter?: ChartValueFormatter;
    /** Formats value-axis ticks. Defaults to `valueFormatter`. */
    tickFormatter?: ChartValueFormatter;
    /** Rewrites the tooltip heading — e.g. a week key into a full date range. */
    labelFormatter?: (label: string | number) => string;
    /**
     * Replaces the tooltip body, inside the standard tooltip shell, with your own
     * — e.g. the names behind a count. Gets the hovered category and each visible
     * series' value, color and full data row.
     */
    tooltipContent?: ChartTooltipRenderer;
    /** Name for the category dimension, used in the accessible table. */
    categoryLabel?: string;
    /** Caption for the accessible table. Falls back to a generic description. */
    tableCaption?: string;
    /** Fired when a bar is clicked — for drill-down. */
    onBarClick?: (datum: ChartDatum, index: number, seriesKey: string) => void;
    className?: string;
}
/**
 * Categorical bar chart: magnitude compared across categories, or a measure
 * tracked across time buckets.
 *
 * ```tsx
 * <BarChart
 *   data={rows}
 *   categoryKey="property"
 *   series={[{ key: "leads", label: "Leads" }]}
 *   onBarClick={(row) => drillInto(row.property)}
 * />
 * ```
 *
 * Renders a visually hidden data table alongside the plot, so the values are
 * reachable by screen reader and in forced-colors mode.
 */
declare function BarChart({ data, categoryKey, series, orientation, stacked, colorBy, valueLabels, legend, toggleableSeries, height, maxBarSize, valueFormatter, tickFormatter, labelFormatter, tooltipContent, categoryLabel, tableCaption, onBarClick, loading, emptyTitle, emptyDescription, className, }: BarChartProps): react.ReactElement;

interface LineChartProps extends ChartStateProps {
    data: ChartDatum[];
    /** Field holding each row's position on the x axis — usually a time bucket. */
    categoryKey: string;
    /** One entry per plotted measure, colored from the palette in slot order. */
    series: ChartSeries[];
    /** Fills under each line at low opacity. Best with one series, or stacked. */
    area?: boolean;
    /** Stacks the areas into a part-to-whole total. Requires `area`. */
    stacked?: boolean;
    /**
     * `"linear"` (default) joins points honestly. `"monotone"` smooths the line,
     * which invents plausible-looking values between your real ones — reserve it
     * for genuinely continuous data.
     */
    curve?: "linear" | "monotone";
    /** Point markers. Defaults on for short series, off once they would crowd. */
    dots?: boolean;
    /** Legend visibility. Defaults on for 2+ series; a single series is named by the title. */
    legend?: boolean;
    /** Lets a legend click show/hide that series — for a many-line tracker. */
    toggleableSeries?: boolean;
    /** Draws a horizontal rule, e.g. a target or a portfolio average. */
    referenceValue?: number;
    /** Label for the reference rule. */
    referenceLabel?: string;
    height?: number;
    /** Formats tooltip values. */
    valueFormatter?: ChartValueFormatter;
    /** Formats y-axis ticks. Defaults to `valueFormatter`. */
    tickFormatter?: ChartValueFormatter;
    /** Rewrites the tooltip heading — e.g. a week key into a full date range. */
    labelFormatter?: (label: string | number) => string;
    /**
     * Replaces the tooltip body, inside the standard tooltip shell, with your own
     * — e.g. the names behind a count. Gets the hovered category and each visible
     * series' value, color and full data row.
     */
    tooltipContent?: ChartTooltipRenderer;
    /** Name for the x dimension, used in the accessible table. */
    categoryLabel?: string;
    tableCaption?: string;
    className?: string;
}
/**
 * Multi-series line (or area) chart: a measure tracked over time.
 *
 * ```tsx
 * <LineChart
 *   data={weeks}
 *   categoryKey="week"
 *   categoryLabel="Week"
 *   series={[
 *     { key: "leads", label: "Leads" },
 *     { key: "toursBooked", label: "Tours booked" },
 *   ]}
 * />
 * ```
 *
 * There is deliberately no second y-axis. Two measures on different scales
 * make the crossing point of the two lines meaningless — plot them as two
 * charts, or index both to a common base.
 */
declare function LineChart({ data, categoryKey, series, area, stacked, curve, dots, legend, toggleableSeries, referenceValue, referenceLabel, height, valueFormatter, tickFormatter, labelFormatter, tooltipContent, categoryLabel, tableCaption, loading, emptyTitle, emptyDescription, className, }: LineChartProps): react.ReactElement;

interface DonutChartDatum {
    label: string;
    value: number;
    /**
     * Pins this entity's color. Worth setting when the same categories appear in
     * more than one chart, or when a filter can change how many slices there are
     * — otherwise slot assignment follows render order and the survivors repaint.
     */
    color?: string;
}
interface DonutChartProps extends ChartStateProps {
    data: DonutChartDatum[];
    /**
     * Wedges to draw before folding the rest into a single neutral "Other".
     * Defaults to 6, which is where part-to-whole stops being readable at a
     * glance; past that a bar chart or a table serves the reader better.
     */
    maxSlices?: number;
    otherLabel?: string;
    /** Sorts descending by value. Off by default so a filter can't repaint entities. */
    sort?: boolean;
    /** `"donut"` (default) leaves a hole for the total; `"pie"` fills the circle. */
    variant?: "donut" | "pie";
    /** Big number in the hole. Defaults to the summed total. Donut variant only. */
    centerValue?: react.ReactNode;
    /** Caption under the center value. */
    centerLabel?: string;
    legendPosition?: "right" | "bottom";
    /** Shows each slice's share of the total in the legend. */
    showPercentages?: boolean;
    height?: number;
    valueFormatter?: ChartValueFormatter;
    /** Name for the category dimension, used in the accessible table. */
    categoryLabel?: string;
    tableCaption?: string;
    onSliceClick?: (datum: DonutChartDatum, index: number) => void;
    /**
     * Replaces the tooltip body, inside the standard tooltip shell, with your own
     * — e.g. the names behind a slice. `datum` is the slice's row as you passed
     * it (with any extra fields), or a synthetic row for the folded "Other".
     */
    tooltipContent?: (ctx: DonutTooltipContext<DonutChartDatum>) => react.ReactNode;
    className?: string;
}
/**
 * Part-to-whole breakdown — a channel mix, a spend split.
 *
 * ```tsx
 * <DonutChart
 *   data={[{ label: "Google", value: 412 }, { label: "Zillow", value: 288 }]}
 *   centerLabel="Total leads"
 * />
 * ```
 *
 * Use it for "roughly what share" at a glance. For comparing values that sit
 * close together, a bar chart is the honest form — the eye can compare bar
 * lengths far better than wedge angles.
 */
declare function DonutChart({ data, maxSlices, otherLabel, sort, variant, centerValue, centerLabel, legendPosition, showPercentages, height, valueFormatter, categoryLabel, tableCaption, onSliceClick, tooltipContent, loading, emptyTitle, emptyDescription, className, }: DonutChartProps): react.ReactElement;

interface MonthYearRange {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
}
interface DateRangePickerProps {
    value: MonthYearRange;
    onChange: (value: MonthYearRange) => void;
    /** Selectable years, e.g. [2023, 2024, 2025]. */
    years: number[];
    className?: string;
}
/**
 * Month/year range selector: a start month+year, the word "to", and an end
 * month+year. Controlled via a MonthYearRange value, used for report periods.
 */
declare function DateRangePicker({ value, onChange, years, className }: DateRangePickerProps): ReactElement;

/**
 * Calendar arithmetic — pure, zone-free, and no `Date` in any public shape.
 *
 * A calendar is not a list of instants. The 3rd of September is a Thursday
 * everywhere, and which month a grid is showing does not depend on who is
 * looking at it. Everything here works on `{ year, month, day }`, and the two
 * places a `Date` appears internally are pinned to UTC so the host's zone cannot
 * move a day.
 *
 * That is the whole reason this is not `new Date(iso)`: `new Date("2026-09-12")`
 * is midnight **UTC**, so reading `.getDate()` off it in Chicago returns 11.
 */
interface YearMonth {
    year: number;
    /** 1–12, as people write months rather than as `Date` numbers them. */
    month: number;
}
interface CalendarDate extends YearMonth {
    /** 1–31. */
    day: number;
}
/** `"2026-09-03"` — how a day is keyed wherever a calendar grid is involved. */
declare function dateKey(date: CalendarDate): string;
/**
 * Which weekday a date falls on, **0 = Monday**.
 *
 * Monday-first because that is what the grid draws. Deliberately zone-free: the
 * UTC round trip is what keeps the first column of the month from depending on
 * the reader.
 */
declare function weekdayOf(date: CalendarDate): number;
/**
 * Column headings for a calendar grid. Monday-first, like `weekdayOf` and
 * `monthWeeks`: every grid in the package starts its week on Monday, and there
 * is no option to change it.
 */
declare const WEEKDAY_LABELS: readonly ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Saturday or Sunday. */
declare function isWeekend(date: CalendarDate): boolean;
/** How many days that month has, leap years included. */
declare function daysInMonth(year: number, month: number): number;
/** The day `step` days away, rolling the month and year over in both directions. */
declare function addDays(date: CalendarDate, step: number): CalendarDate;
/** The Monday on or before `date`. */
declare function startOfWeek(date: CalendarDate): CalendarDate;
/**
 * A month as the weeks a calendar grid draws, Monday-first. Each week is seven
 * cells; the days before the 1st and after the last are `null`, so the grid
 * keeps its columns without showing the neighbouring months' days.
 *
 * This is the one grid layout in the package — `MonthCalendar`, `EventCalendar`
 * and `TimesheetTable`'s month view all draw from it.
 */
declare function monthWeeks(month: YearMonth): (CalendarDate | null)[][];
/** The month `step` months away, rolling the year over in both directions. */
declare function shiftMonth(from: YearMonth, step: number): YearMonth;
/** Negative if `a` is before `b`, positive after, zero for the same month. */
declare function compareMonths(a: YearMonth, b: YearMonth): number;
/** `"September 2026"`, for a calendar heading. */
declare function monthLabel({ year, month }: YearMonth): string;
/**
 * A `"2026-09-03"` key back as a date, or null if it is not a real day. A full
 * ISO instant (`"2026-09-03T00:00:00.000Z"`) is read by its date part.
 */
declare function parseDateKey(key: string): CalendarDate | null;
/**
 * A date written out with `Intl` options — `{ weekday: "short", month: "short",
 * day: "numeric" }` gives "Mon, Sep 14". Pinned to UTC, like everything here,
 * so the reader's zone cannot move the day.
 */
declare function formatCalendarDate(date: CalendarDate, options: Intl.DateTimeFormatOptions): string;
/**
 * A `"2026-09-03"` key (or an ISO instant, by its date part) written out with
 * `formatCalendarDate`. Anything that is not a real day comes back unchanged,
 * so a bad value shows as itself rather than as "Invalid Date".
 */
declare function formatDateKey(key: string, options: Intl.DateTimeFormatOptions): string;
/**
 * The month a `"2026-09-03"` key (or an ISO instant, by its date part) belongs
 * to, or null if it is not a real day. Read by `parseDateKey`, so the two never
 * disagree about what a key is.
 */
declare function monthOfKey(key: string): YearMonth | null;
/** Today, in the READER's zone — the only sensible place to open a picker. */
declare function todayIn(now?: Date): CalendarDate;

interface MonthCalendarProps {
    /** The month on screen. Controlled, like the selection. */
    month: YearMonth;
    onMonthChange: (next: YearMonth) => void;
    /** The chosen day as `"2026-09-03"`, or null before anything is picked. */
    selected: string | null;
    onSelect: (key: string) => void;
    /**
     * The days that may be chosen. Everything else renders disabled rather than
     * absent, so the month keeps its shape.
     *
     * Omit it and every day in the month is pickable, which is what an ordinary
     * date field wants. Pass a set when the days on offer are the point —
     * somebody's published hours, the nights a room is free.
     */
    available?: Set<string>;
    /**
     * Why a day outside `available` is closed, read after the date by a screen
     * reader ("3 September 2026, no times"). The default only says that it is;
     * a picker that closes days for a reason — nobody is free, it has not happened
     * yet — should say which, or the cell announces something vaguer than the
     * screen shows.
     */
    unavailableLabel?: string;
    /** The furthest back and forward the arrows go. */
    min: YearMonth;
    max: YearMonth;
    className?: string;
    /** Names the grid for a screen reader; it is a group, not one control. */
    "aria-label"?: string;
}
/**
 * A month grid for picking one day.
 *
 * The day-level counterpart to `DateRangePicker`, which selects a range of
 * MONTHS and is a different control. Controlled in both dimensions — the month
 * on screen and the day chosen — because the two move independently: paging to
 * December does not unpick the 3rd of September.
 *
 * Every cell is a `Button`, so keyboard and focus behaviour come from the same
 * place as everything else rather than being reimplemented on a `<div>`.
 *
 * **Every one of those buttons carries `type="button"`, and it is load-bearing.**
 * `Button` renders a bare `<button>` and sets no default type, matching HTML —
 * so inside a `<form>` an unmarked one is implicitly `type="submit"`. Without
 * this, picking a day submits the form the calendar sits in, and so does pressing
 * the month arrow. That shipped in a consuming app: on a dialog whose submit
 * marked somebody for removal, paging to the next month did it.
 */
declare function MonthCalendar({ month, onMonthChange, selected, onSelect, available, unavailableLabel, min, max, className, "aria-label": ariaLabel, }: MonthCalendarProps): ReactElement;

interface EventCalendarProps<T> {
    /** The month shown. Controlled, like `MonthCalendar`'s. */
    month: YearMonth;
    onMonthChange: (month: YearMonth) => void;
    /** Items keyed by "YYYY-MM-DD", each list already in display order. */
    itemsByDate: ReadonlyMap<string, T[]>;
    renderItem: (item: T, isoDate: string) => ReactNode;
    itemKey: (item: T, isoDate: string) => string | number;
    /** Items shown in a day before the rest fold into "+N more". Defaults to 3. */
    maxVisibleItems?: number;
    /** Dims the grid under a spinner and disables the month controls. */
    loading?: boolean;
    /** Heading of the "+N more" list. Defaults to "Tue, Jul 14 — 5 items". */
    overflowPopoverTitle?: (isoDate: string, count: number) => ReactNode;
    /**
     * Accessible name of the "+N more" button; `count` is the hidden items.
     * Defaults to "Show 2 more items on July 14".
     */
    overflowAriaLabel?: (isoDate: string, count: number) => string;
    /** Accessible name of the table. Defaults to "Calendar, July 2026". */
    ariaLabel?: string;
    className?: string;
}
/**
 * A month of days with items in them — who is off, what is due — drawn as a
 * Monday-first grid. Each day shows up to `maxVisibleItems`, then a "+N more"
 * button that lists all of that day's items in a popover. Items are whatever
 * `renderItem` draws, usually a `CategoryChip` or a `Badge`.
 *
 * The grid is `monthWeeks` from `lib/calendar`, the same layout `MonthCalendar`
 * draws, so it does not depend on the reader's zone. Use `MonthCalendar`
 * instead to PICK a day.
 */
declare function EventCalendar<T>({ month, onMonthChange, itemsByDate, renderItem, itemKey, maxVisibleItems, loading, overflowPopoverTitle, overflowAriaLabel, ariaLabel, className, }: EventCalendarProps<T>): ReactElement;

/**
 * The data contract behind `TimesheetTable`: what it is given, what it fetches
 * and saves, and the fetch-based API it uses when the caller supplies none.
 *
 * Ported unchanged from the Backstage design system, so an app moving off it
 * keeps its call sites and its server routes. Dates are `YYYY-MM-DD` strings
 * (or ISO instants, of which only the date part is read) and are handled in UTC
 * throughout, so the host's zone never moves a day.
 */
interface TimesheetContract {
    id: number;
    name: string;
    projectName: string;
    customerName: string;
    /** ISO date. */
    startDate: string;
    /** ISO date. */
    endDate: string;
    /** Contracts on an inactive project are never shown. */
    projectActive: boolean;
}
/** One cell's change, as sent to `saveTimesheet`. `null` hours deletes it. */
interface TimesheetEntry {
    contractId: number;
    /** YYYY-MM-DD. */
    date: string;
    hours: number | null;
}
interface TimesheetTimeOff {
    id: number;
    type: string;
    startsAt: string;
    /** Exclusive: the day the person is back. */
    endsAt: string;
}
interface TimeEntryResponse {
    timeEntries: {
        id: number;
        date: string;
        hours: number;
        userId: number;
        contractId: number;
    }[];
}
interface ExpectedHoursResponse {
    expectedHours: number;
    ptoHours: number;
    timeOffs: TimesheetTimeOff[];
}
interface SaveResponse {
    success: boolean;
    upserted: number;
    deleted: number;
    error?: string;
}
interface TimesheetApi {
    fetchTimeEntries(params: {
        userId: number;
        startDate: string;
        endDate: string;
    }): Promise<TimeEntryResponse>;
    fetchExpectedHours(params: {
        startDate: string;
        endDate: string;
    }): Promise<ExpectedHoursResponse>;
    saveTimesheet(entries: TimesheetEntry[]): Promise<SaveResponse>;
}
type TimesheetViewMode = "weekly" | "monthly";
/** Hours by cell, keyed `${contractId}::${date}`. */
type TimesheetGridData = Record<string, number | null>;
/**
 * The API `TimesheetTable` uses for any method the caller does not override:
 * `GET {baseUrl}/api/my-timesheets/entries`, `GET …/expected-hours` (both with
 * `startDate` and `endDate` query params) and `POST …/save` with `{ entries }`.
 * `extraHeaders` go on every request — an `Authorization` header, say.
 *
 * A failed save throws the response's `error` field when it has one.
 */
declare function createDefaultApi(baseUrl?: string, extraHeaders?: Record<string, string>): TimesheetApi;

interface TimesheetTableProps {
    userId: number;
    userFullName: string;
    contracts: TimesheetContract[];
    /**
     * Overrides for any of the API methods; the rest use `createDefaultApi`.
     * Read on each call, so an inline object is fine: a new one never refetches.
     */
    api?: Partial<TimesheetApi>;
    /** Passed to `createDefaultApi`. Changing it refetches the period. */
    baseUrl?: string;
    /**
     * Passed to `createDefaultApi`, so they go on every default request. Read on
     * each call, like `api`.
     */
    apiHeaders?: Record<string, string>;
    defaultView?: TimesheetViewMode;
    onViewChange?: (view: TimesheetViewMode) => void;
    /**
     * Called with `{ view, week }` or `{ view, month }` whenever the period
     * shown changes — on mount too — so the page can mirror it in the URL.
     */
    onNavigate?: (params: Record<string, string>) => void;
    /** YYYY-MM-DD; the week containing it is shown first. */
    initialWeek?: string;
    /** YYYY-MM. */
    initialMonth?: string;
    title?: string;
    className?: string;
}
/**
 * A person's timesheet: hours per contract per day, in a weekly grid or a
 * monthly calendar, with expected hours and time off from the API.
 *
 * Edits save themselves 15 seconds after the last change, or straight away
 * with Save, on navigation, or on switching view. Only the changed cells are
 * sent. After a save, "Revert" puts the previous values back for 5 seconds.
 *
 * Data comes from `api`; any method not given falls back to
 * `createDefaultApi(baseUrl, apiHeaders)`, which calls the `/api/my-timesheets`
 * routes. A failed load shows inline with a retry and a failed save as an
 * error toast — mount a `ToastProvider` to see it.
 */
declare function TimesheetTable({ userId, userFullName, contracts, api: apiOverrides, baseUrl, apiHeaders, defaultView, onViewChange, onNavigate, initialWeek, initialMonth, title, className, }: TimesheetTableProps): ReactElement;

type Theme = "light" | "dark";
interface ThemeScriptOptions {
    /**
     * The theme to use when nothing valid is saved in localStorage. Defaults to
     * `"dark"`, the design system's default.
     */
    defaultTheme?: Theme;
}
/**
 * Builds the inline script to drop into <head> so the saved theme is applied
 * before the first paint. It always sets an explicit `light`/`dark` class so
 * consumers can read it back on hydration; with nothing saved it uses
 * `defaultTheme`. Without it, a saved light preference would flash dark on load.
 *
 * Pair it with `<ThemeProvider defaultTheme={...}>` using the same value.
 *
 * Usage (Next.js app root):
 *   <head><script dangerouslySetInnerHTML={{ __html: themeScript({ defaultTheme: "light" }) }} /></head>
 */
declare function themeScript({ defaultTheme }?: ThemeScriptOptions): string;
/**
 * `themeScript()` with the default (dark) fallback. Kept for compatibility;
 * use `themeScript({ defaultTheme })` to pick the default.
 *
 * Usage (Next.js app root):
 *   <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
 */
declare const THEME_SCRIPT: string;
interface ThemeContextValue {
    theme: Theme;
    /**
     * True when `theme` is right from the first render (the provider was given a
     * concrete `initialTheme`), so a toggle can draw its icon without waiting
     * for mount.
     */
    resolved: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}
interface ThemeProviderProps {
    children: ReactNode;
    /**
     * The theme to start from, for apps that store the choice themselves (e.g.
     * on the user's account) and render it on the server. `"system"` follows the
     * OS `prefers-color-scheme` once mounted, dark when there is no preference.
     * It wins over a saved choice. Omitted, the provider reads back the class
     * `THEME_SCRIPT` / `themeScript()` set.
     */
    initialTheme?: Theme | "system";
    /**
     * The theme to fall back to when `initialTheme` is omitted and nothing has
     * chosen one yet. Unlike `initialTheme`, it never overrides the user's
     * choice: on mount the provider uses the class `themeScript()` set, else the
     * saved theme (when `persist`), else this. Server and first client render
     * assume it, so pass the same value as `themeScript({ defaultTheme })`.
     * Omitted, the provider keeps its old behaviour (dark, nothing applied).
     */
    defaultTheme?: Theme;
    /** Save the choice to localStorage. Defaults to true; false never touches it. */
    persist?: boolean;
    /** Called with the new theme after `setTheme` or `toggleTheme`, never on mount. */
    onThemeChange?: (theme: Theme) => void;
}
declare function ThemeProvider({ children, initialTheme, defaultTheme, persist, onThemeChange, }: ThemeProviderProps): react.JSX.Element;
declare function useTheme(): ThemeContextValue;
/**
 * Sun/moon button that toggles light/dark. Shows a filled orange sun while dark
 * (click → light) and a filled indigo moon while light (click → dark).
 */
declare function ThemeToggle({ className }: {
    className?: string;
}): react.JSX.Element;

interface AccountOption {
    id: string;
    accountNumber: string;
    name: string;
}
interface AccountComboboxProps {
    accounts: AccountOption[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    /**
     * "default" renders a bordered form field (reports, filters).
     * "inline" renders a borderless, transparent field that sits inside a
     * dense table cell (journal-entry line items).
     */
    variant?: "default" | "inline";
    /** Show a clear (X) affordance when a value is selected. */
    clearable?: boolean;
    disabled?: boolean;
    id?: string;
    className?: string;
}
/**
 * Type-to-search account picker. Filters the full chart of accounts by account
 * number OR name (e.g. "5730" or "prepaid"), is keyboard navigable, and renders
 * "1-5730-0000 — Plus: Prepaid Rent" style rows. Client-side filtering only —
 * pass the already-loaded account list. Replaces the unusable native <select>
 * over ~240 accounts.
 */
declare function AccountCombobox({ accounts, value, onChange, placeholder, variant, clearable, disabled, id, className, }: AccountComboboxProps): react.JSX.Element;

interface StatusOption {
    value: string;
    label: string;
}
interface MultiStatusFilterProps {
    /** Prefix shown on the trigger, e.g. "Status". */
    label?: string;
    options: StatusOption[];
    /** Currently-selected status values. Empty array = no filter (all statuses). */
    selected: string[];
    onChange: (next: string[]) => void;
    className?: string;
}
/**
 * Checkbox-dropdown multi-select for list status filters. Empty selection means
 * "all statuses" (the caller sends no status param). The trigger summarizes the
 * active set so which statuses are filtered is always visible without opening it.
 */
declare function MultiStatusFilter({ label, options, selected, onChange, className, }: MultiStatusFilterProps): react.JSX.Element;

/**
 * Provider-neutral US postal address shape. The `Draft` variant keeps every field
 * as a controlled string (line 2 is "" rather than null) so it can drive form
 * inputs directly; `PostalAddress` is the normalized, submit-ready shape.
 */
interface PostalAddress {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
interface PostalAddressDraft {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
declare const EMPTY_POSTAL_ADDRESS: PostalAddressDraft;
declare function postalAddressToDraft(address?: PostalAddress | null): PostalAddressDraft;
declare function postalAddressFromDraft(address: PostalAddressDraft): PostalAddress | null;
declare function isPostalAddressDraftComplete(address: PostalAddressDraft): boolean;
/** Convert a Places API New result into Carbon's provider-neutral address shape. */
declare function parseGooglePlaceAddress(place: Pick<google.maps.places.Place, "addressComponents">): PostalAddressDraft | null;

interface StructuredAddressInputProps {
    value: PostalAddressDraft;
    onChange: (value: PostalAddressDraft) => void;
    variant?: "staff" | "vendor";
    idPrefix: string;
    required?: boolean;
}
/**
 * Full US postal-address form: a Places-backed street field that fills the rest
 * of the fields on selection, plus manual inputs for line 2, city, state, and
 * ZIP. Fully controlled via a {@link PostalAddressDraft}. The "staff" variant
 * follows the app's theme; "vendor" is always the light portal scheme (the
 * theme's light tokens, scoped by the `light` class).
 *
 * Each field is a `FormField`, so a required one carries the marker beside its
 * label, hidden from screen readers, and `required` on the input, which they
 * announce instead.
 */
declare function StructuredAddressInput({ value, onChange, variant, idPrefix, required, }: StructuredAddressInputProps): ReactElement;

type AddressComboboxStatus = "idle" | "loading" | "ready" | "unavailable";
interface AddressSuggestion {
    id: string;
    address: string;
    secondaryText?: string;
}
type AddressSuggestionProvider = (query: string, options: {
    signal: AbortSignal;
}) => Promise<readonly AddressSuggestion[]>;
interface AddressComboboxProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onAddressSelect?: (address: PostalAddressDraft) => void;
    onSelect?: (formattedAddress: string) => void;
    onStatusChange?: (status: AddressComboboxStatus) => void;
    fetchSuggestions?: AddressSuggestionProvider;
    /** Hide per-field copy when the host presents one shared status message. */
    showStatus?: boolean;
    /** Optional attribution supplied by a custom provider. */
    attribution?: ReactNode;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    variant?: "staff" | "public" | "vendor";
    ariaLabel?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
}

/**
 * Google Places (New API) address autocomplete. Debounces input, streams
 * suggestions, and — when `onAddressSelect` is provided — resolves the chosen
 * prediction into a structured {@link PostalAddressDraft}. Degrades to manual
 * entry (with a retry affordance) when Places is unconfigured or unreachable.
 * Three visual variants cover the dark staff app, the public marketing site,
 * and the light vendor portal.
 */
declare function AddressAutocomplete({ id, value, onChange, onAddressSelect, onSelect, onStatusChange, fetchSuggestions, attribution, showStatus, disabled, onBlur, placeholder, className, variant, ariaLabel, required, autoComplete, }: AddressComboboxProps): react.JSX.Element;

export { AccountCombobox, type AccountOption, AddressAutocomplete$1 as AddressAutocomplete, AddressAutocomplete as AddressCombobox, type AddressComboboxProps, type AddressComboboxStatus, type AddressSuggestion, type AddressSuggestionProvider, Alert, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, BarChart, type BarChartProps, Button, CHART_GRID_COLOR, CHART_LABEL_STYLE, CHART_NEUTRAL_COLOR, CHART_SERIES_LIMIT, CHART_TICK_CATEGORY, CHART_TICK_VALUE, type CalendarDate, Card, CardHeader, type CardHeaderProps, CategoryChip, type CategoryChipProps, type CategoryChipSegment, ChartCard, type ChartCardProps, ChartDataTable, type ChartDataTableProps, type ChartDatum, ChartEmpty, ChartLegend, type ChartLegendItem, type ChartLegendProps, type ChartSeries, ChartSkeleton, ChartSliceTooltipContent, type ChartStateProps, ChartTooltipContent, type ChartTooltipContentProps, type ChartTooltipContext, type ChartTooltipEntry, type ChartTooltipRenderer, type ChartValueFormatter, Checkbox, CheckboxGroup, type CheckboxGroupOption, type CheckboxGroupProps, type CommandFilter, CommandGroup, CommandItem, CommandPalette, type ConfirmOptions, ConfirmProvider, DataTable, DateRangePicker, DefinitionItem, DefinitionList, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DonutChart, type DonutChartDatum, type DonutChartProps, type DonutTooltipContext, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, EMPTY_POSTAL_ADDRESS, EmptyState, EventCalendar, type EventCalendarProps, type ExpectedHoursResponse, FileViewer, type FileViewerFallback, type FileViewerFallbackContent, type FileViewerFallbackReason, type FileViewerFallbackRequest, type FileViewerProps, FilterBar, FormField, HoverCard, HoverCardContent, type HoverCardProps, HoverCardTrigger, Input, Label, LineChart, type LineChartProps, Money, MoneyInput, MonthCalendar, type MonthCalendarProps, type MonthYearRange, MultiSelect, type MultiSelectOption, MultiStatusFilter, PageHeader, type PageHeaderBack, Pagination, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, type PostalAddress, type PostalAddressDraft, Progress, type ProgressTone, RichTextEditor, type RichTextEditorHandle, type RichTextEditorProps, RichTextFormatting, type RichTextInsertAction, type RichTextLinkPanelOptions, type RichTextLinkTarget, type SaveResponse, ScrollArea, SearchSelect, type SearchSelectOption, SegmentedControl, type SegmentedControlOption, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Separator, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, Spinner, StatCard, StatusBadge, StatusIndicator, type StatusIndicatorProps, type StatusOption, StructuredAddressInput, Swatch, type SwatchProps, Switch, THEME_SCRIPT, Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Tag, TextLink, Textarea, type Theme, ThemeProvider, type ThemeProviderProps, type ThemeScriptOptions, ThemeToggle, type TimeEntryResponse, type TimesheetApi, type TimesheetContract, type TimesheetEntry, type TimesheetGridData, TimesheetTable, type TimesheetTableProps, type TimesheetTimeOff, type TimesheetViewMode, ToastProvider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, WEEKDAY_LABELS, type YearMonth, addDays, alertVariants, badgeVariants, buttonVariants, capSeries, cardVariants, compareMonths, createDefaultApi, dateKey, daysInMonth, formatCalendarDate, formatChartValue, formatDateKey, isPostalAddressDraftComplete, isWeekend, monthLabel, monthOfKey, monthWeeks, parseDateKey, parseGooglePlaceAddress, postalAddressFromDraft, postalAddressToDraft, resolveSeriesColors, seriesColor, shiftMonth, startOfWeek, themeScript, toast, todayIn, useConfirm, useTheme, useToast, weekdayOf };
