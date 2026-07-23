/**
 * CarbonOS Design System — public entry point.
 *
 * Import design tokens once at your app root:
 *   import "@codelittinc/carbon-design-system/styles";
 *
 * Then import components:
 *   import { Button, Badge, Dialog } from "@codelittinc/carbon-design-system";
 */

// ── Utilities ──
export { cn } from "./lib/cn";
export { formatMoney, formatDate, formatPeriodLabel } from "./lib/format";

// ── Components ──
export * from "./components/ui/address-autocomplete";
export * from "./components/ui/button";
export * from "./components/ui/badge";
export * from "./components/ui/status-badge";
export * from "./components/ui/input";
export * from "./components/ui/textarea";
export * from "./components/ui/checkbox";
export * from "./components/ui/switch";
export * from "./components/ui/select";
export * from "./components/ui/dialog";
export * from "./components/ui/alert-dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/sheet";
export * from "./components/ui/separator";
export * from "./components/ui/skeleton";
export * from "./components/ui/progress";
export * from "./components/ui/tabs";
export * from "./components/ui/tooltip";
export * from "./components/ui/popover";
export * from "./components/ui/scroll-area";
export * from "./components/ui/toast";
export * from "./components/ui/empty-state";
export * from "./components/ui/page-header";
export * from "./components/ui/data-table";
export * from "./components/ui/money-input";
export * from "./components/ui/command-palette";
export * from "./components/ui/search-select";
export * from "./components/ui/money";
export * from "./components/ui/form-field";
export * from "./components/ui/definition-list";
export * from "./components/ui/filter-bar";
export * from "./components/ui/stat-card";
export * from "./components/ui/date-range-picker";
export * from "./components/ui/theme";
export * from "./components/ui/account-combobox";
export * from "./components/ui/multi-status-filter";
export * from "./components/ui/structured-address-input";
// `address-combobox` exports an `AddressAutocomplete` that returns a structured
// address (via Google Places New API). It's aliased to `AddressCombobox` so it
// coexists with the simpler string-only `address-autocomplete` above.
export { AddressAutocomplete as AddressCombobox } from "./components/ui/address-combobox";
export * from "./components/ui/postal-address";
