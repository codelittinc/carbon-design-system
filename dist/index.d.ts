import { ClassValue } from 'clsx';
import * as react from 'react';
import { ReactNode } from 'react';
export { Button, buttonVariants } from './button.js';
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
    options: SearchSelectOption[];
    loading?: boolean;
    placeholder?: string;
    className?: string;
    clearable?: boolean;
    renderOption?: (option: SearchSelectOption) => React.ReactNode;
}
declare function SearchSelect({ value, onChange, onSearch, options, loading, placeholder, className, clearable, renderOption, }: SearchSelectProps): react.JSX.Element;

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

export { AccountCombobox, type AccountOption, AddressAutocomplete$1 as AddressAutocomplete, AddressAutocomplete as AddressCombobox, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, Checkbox, CommandGroup, CommandItem, CommandPalette, DataTable, DateRangePicker, DefinitionItem, DefinitionList, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, EMPTY_POSTAL_ADDRESS, EmptyState, FilterBar, FormField, Input, Money, MoneyInput, type MonthYearRange, MultiStatusFilter, PageHeader, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, type PostalAddress, type PostalAddressDraft, Progress, ScrollArea, SearchSelect, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Separator, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, StatCard, StatusBadge, type StatusOption, StructuredAddressInput, Switch, THEME_SCRIPT, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, type Theme, ThemeProvider, ThemeToggle, ToastProvider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, badgeVariants, cn, formatDate, formatMoney, formatPeriodLabel, isPostalAddressDraftComplete, parseGooglePlaceAddress, postalAddressFromDraft, postalAddressToDraft, useTheme, useToast };
