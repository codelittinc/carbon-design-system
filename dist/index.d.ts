import { ClassValue } from 'clsx';
import * as react from 'react';
import { ReactNode } from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
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
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ColumnDef } from '@tanstack/react-table';
export { ColumnDef } from '@tanstack/react-table';

declare function cn(...inputs: ClassValue[]): string;

declare function formatMoney(value: string | number | null | undefined): string;
declare function formatDate(iso: string | null | undefined): string;
declare function formatPeriodLabel(month: number, year: number): string;

interface AddressAutocompleteProps$1 {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    variant?: "staff" | "public";
}
declare function AddressAutocomplete$1({ value, onChange, onBlur, placeholder, className, variant }: AddressAutocompleteProps$1): react.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

declare const badgeVariants: (props?: ({
    variant?: "default" | "accent" | "success" | "warning" | "error" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
}
declare function Badge({ className, variant, ...props }: BadgeProps): react.JSX.Element;

interface StatusBadgeProps {
    status: string;
    className?: string;
}
declare function StatusBadge({ status, className }: StatusBadgeProps): react.JSX.Element;

declare const Input: react.ForwardRefExoticComponent<react.InputHTMLAttributes<HTMLInputElement> & react.RefAttributes<HTMLInputElement>>;

declare const Textarea: react.ForwardRefExoticComponent<react.TextareaHTMLAttributes<HTMLTextAreaElement> & react.RefAttributes<HTMLTextAreaElement>>;

declare const Checkbox: react.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const Switch: react.ForwardRefExoticComponent<Omit<SwitchPrimitive.SwitchProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const Select: react.FC<SelectPrimitive.SelectProps>;
declare const SelectGroup: react.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & react.RefAttributes<HTMLDivElement>>;
declare const SelectValue: react.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & react.RefAttributes<HTMLSpanElement>>;
declare const SelectTrigger: react.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;
declare const SelectContent: react.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const SelectItem: react.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const Dialog: react.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: react.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const DialogClose: react.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;
declare const DialogContent: react.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
declare function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>): react.JSX.Element;
declare function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;

declare const AlertDialog: react.FC<AlertDialogPrimitive.AlertDialogProps>;
declare const AlertDialogTrigger: react.ForwardRefExoticComponent<AlertDialogPrimitive.AlertDialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogContent: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare const AlertDialogTitle: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTitleProps & react.RefAttributes<HTMLHeadingElement>, "ref"> & react.RefAttributes<HTMLHeadingElement>>;
declare const AlertDialogDescription: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogDescriptionProps & react.RefAttributes<HTMLParagraphElement>, "ref"> & react.RefAttributes<HTMLParagraphElement>>;
declare function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare const AlertDialogAction: react.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogActionProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;
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
declare function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
declare function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;

declare const Separator: react.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react.JSX.Element;

declare const Progress: react.ForwardRefExoticComponent<Omit<ProgressPrimitive.ProgressProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

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

declare const ScrollArea: react.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "success" | "error";
}
interface ToastContextValue {
    toast: (t: Omit<Toast, "id">) => void;
}
declare function useToast(): ToastContextValue;
declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): react.JSX.Element;

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}
declare function EmptyState({ icon, title, description, action, className }: EmptyStateProps): react.JSX.Element;

interface PageHeaderProps {
    title: React.ReactNode;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}
declare function PageHeader({ title, description, actions, className }: PageHeaderProps): react.JSX.Element;

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onRowClick?: (row: TData) => void;
    pageSize?: number;
    enableSelection?: boolean;
    emptyMessage?: string;
}
declare function DataTable<TData, TValue>({ columns, data, onRowClick, pageSize, enableSelection, emptyMessage, }: DataTableProps<TData, TValue>): react.JSX.Element;

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

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}
declare function CommandPalette({ open, onOpenChange, children }: CommandPaletteProps): react.JSX.Element | null;
declare function CommandGroup({ heading, children }: {
    heading: string;
    children: React.ReactNode;
}): react.JSX.Element;
interface CommandItemProps {
    onSelect: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
}
declare function CommandItem({ onSelect, icon, children }: CommandItemProps): react.JSX.Element;

interface SearchSelectOption {
    value: string;
    label: string;
    sublabel?: string;
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
    loading?: boolean;
    placeholder?: string;
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
}
declare function SearchSelect({ value, onChange, onSearch, onQueryChange, options, loading, placeholder, className, id, ariaLabel, required, requiredLabel, triggerClassName, contentClassName, optionClassName, clearable, renderOption, autoFocus, }: SearchSelectProps): react.JSX.Element;

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
 * Labelled form control wrapper: a small muted label above the control with
 * optional required marker, error, and hint text below. Pairs with the Input,
 * Select, Textarea, and MoneyInput primitives.
 */
declare function FormField({ label, htmlFor, required, error, hint, className, children, }: FormFieldProps): react.JSX.Element;

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
    /** Filter controls (selects, toggles) rendered to the right of the search box. */
    children?: React.ReactNode;
    className?: string;
}
/**
 * Toolbar above a list/table: a search input with a leading icon plus a slot
 * for filter controls. Pass filter <select>s or DS Selects as children.
 */
declare function FilterBar({ search, onSearchChange, searchPlaceholder, children, className, }: FilterBarProps): react.JSX.Element;

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    /** Optional sub-line, e.g. a delta or context. Colored by trend. */
    sub?: string;
    trend?: "up" | "down" | "neutral";
    loading?: boolean;
    className?: string;
}
/**
 * KPI/metric tile: an uppercase label, a large monospace value, and an optional
 * trend-colored sub-line. Shows a skeleton in place of the value while loading.
 */
declare function StatCard({ label, value, sub, trend, loading, className }: StatCardProps): react.JSX.Element;

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
declare function ChartCard({ title, subtitle, action, footer, className, children, }: ChartCardProps): react.JSX.Element;
interface ChartLegendItem {
    label: string;
    color: string;
    /** Renders the swatch dimmed — for a series toggled off. */
    inactive?: boolean;
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
declare function ChartLegend({ items, onItemClick, className }: ChartLegendProps): react.JSX.Element;
interface TooltipPayloadItem {
    name?: string | number;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
    payload?: Record<string, unknown>;
}
interface ChartTooltipContentProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string | number;
    valueFormatter?: ChartValueFormatter;
    /** Rewrites the tooltip heading — e.g. a short week key into a full date. */
    labelFormatter?: (label: string | number) => string;
}
/**
 * Tooltip body. Values are monospaced so they stay column-aligned across rows,
 * matching the tabular-nums treatment used in tables.
 */
declare function ChartTooltipContent({ active, payload, label, valueFormatter, labelFormatter, }: ChartTooltipContentProps): react.JSX.Element | null;
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
declare function ChartDataTable({ caption, categoryLabel, categories, series, data, valueFormatter, }: ChartDataTableProps): react.JSX.Element;
interface ChartStateProps {
    loading?: boolean;
    /** Heading for the empty state shown when `data` has no rows. */
    emptyTitle?: string;
    emptyDescription?: string;
}
/** Skeleton stand-in sized to the chart's own height, to avoid layout shift. */
declare function ChartSkeleton({ height }: {
    height: number;
}): react.JSX.Element;
declare function ChartEmpty({ height, title, description, }: {
    height: number;
    title?: string;
    description?: string;
}): react.JSX.Element;
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
declare function BarChart({ data, categoryKey, series, orientation, stacked, colorBy, valueLabels, legend, toggleableSeries, height, maxBarSize, valueFormatter, tickFormatter, labelFormatter, categoryLabel, tableCaption, onBarClick, loading, emptyTitle, emptyDescription, className, }: BarChartProps): react.JSX.Element;

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
declare function LineChart({ data, categoryKey, series, area, stacked, curve, dots, legend, toggleableSeries, referenceValue, referenceLabel, height, valueFormatter, tickFormatter, labelFormatter, categoryLabel, tableCaption, loading, emptyTitle, emptyDescription, className, }: LineChartProps): react.JSX.Element;

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
declare function DonutChart({ data, maxSlices, otherLabel, sort, variant, centerValue, centerLabel, legendPosition, showPercentages, height, valueFormatter, categoryLabel, tableCaption, onSliceClick, loading, emptyTitle, emptyDescription, className, }: DonutChartProps): react.JSX.Element;

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
declare function DateRangePicker({ value, onChange, years, className }: DateRangePickerProps): react.JSX.Element;

type Theme = "light" | "dark";
/**
 * Inline script to drop into <head> so the saved theme is applied before the
 * first paint. The design system is dark by default (no class); this always
 * sets an explicit `light`/`dark` class so consumers can read it back on
 * hydration. Without it, a saved light preference would flash dark on load.
 *
 * Usage (Next.js app root):
 *   <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
 */
declare const THEME_SCRIPT = "(function(){try{var t=localStorage.getItem(\"carbon-theme\");if(t!==\"light\"&&t!==\"dark\")t=\"dark\";var c=document.documentElement.classList;c.remove(\"light\",\"dark\");c.add(t);}catch(e){}})();";
interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}
declare function ThemeProvider({ children }: {
    children: ReactNode;
}): react.JSX.Element;
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
 * uses the dark design tokens; "vendor" uses the light portal palette.
 */
declare function StructuredAddressInput({ value, onChange, variant, idPrefix, required, }: StructuredAddressInputProps): react.JSX.Element;

interface AddressAutocompleteProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onAddressSelect?: (address: PostalAddressDraft) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    variant?: "staff" | "public" | "vendor";
    ariaLabel?: string;
    required?: boolean;
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
declare function AddressAutocomplete({ id, value, onChange, onAddressSelect, onBlur, placeholder, className, variant, ariaLabel, required, autoComplete, }: AddressAutocompleteProps): react.JSX.Element;

export { AccountCombobox, type AccountOption, AddressAutocomplete$1 as AddressAutocomplete, AddressAutocomplete as AddressCombobox, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, BarChart, type BarChartProps, Button, CHART_GRID_COLOR, CHART_LABEL_STYLE, CHART_NEUTRAL_COLOR, CHART_SERIES_LIMIT, CHART_TICK_CATEGORY, CHART_TICK_VALUE, ChartCard, type ChartCardProps, ChartDataTable, type ChartDataTableProps, type ChartDatum, ChartEmpty, ChartLegend, type ChartLegendItem, type ChartLegendProps, type ChartSeries, ChartSkeleton, type ChartStateProps, ChartTooltipContent, type ChartTooltipContentProps, type ChartValueFormatter, Checkbox, CommandGroup, CommandItem, CommandPalette, DataTable, DateRangePicker, DefinitionItem, DefinitionList, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DonutChart, type DonutChartDatum, type DonutChartProps, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, EMPTY_POSTAL_ADDRESS, EmptyState, FilterBar, FormField, Input, LineChart, type LineChartProps, Money, MoneyInput, type MonthYearRange, MultiStatusFilter, PageHeader, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, type PostalAddress, type PostalAddressDraft, Progress, ScrollArea, SearchSelect, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Separator, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, StatCard, StatusBadge, type StatusOption, StructuredAddressInput, Switch, THEME_SCRIPT, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, type Theme, ThemeProvider, ThemeToggle, ToastProvider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, badgeVariants, buttonVariants, capSeries, cn, formatChartValue, formatDate, formatMoney, formatPeriodLabel, isPostalAddressDraftComplete, parseGooglePlaceAddress, postalAddressFromDraft, postalAddressToDraft, resolveSeriesColors, seriesColor, useTheme, useToast };
