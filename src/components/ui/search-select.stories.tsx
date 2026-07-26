import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { SearchSelect } from "./search-select";

i18n.addResourceBundle(
  "en",
  "searchSelect",
  {
    searchPlaceholder: "Search tenants…",
    selectedLabel: "Selected: {{value}}",
    none: "none",
    unit: "Unit",
    loft: "Loft",
    poLabel: "Purchase order",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "searchSelect",
  {
    searchPlaceholder: "Buscar inquilinos…",
    selectedLabel: "Seleccionado: {{value}}",
    none: "ninguno",
    unit: "Unidad",
    loft: "Loft",
    poLabel: "Orden de compra",
  },
  true,
  true,
);

/**
 * SearchSelect is a presentational async picker for large lists — selecting a
 * tenant, unit, or vendor by typing. It is fully controlled: the parent owns the
 * selected value, the option list, and filtering. onSearch fires (debounced)
 * with the query so the parent can fetch or filter; this component never
 * filters on its own.
 */
const meta: Meta<typeof SearchSelect> = {
  title: "Components/Forms/SearchSelect",
  component: SearchSelect,
  tags: ["autodocs"],
};
export default meta;

function StatefulSearchSelect({
  initialValue = null,
  loading = false,
}: {
  initialValue?: string | null;
  loading?: boolean;
}) {
  const { t } = useTranslation("searchSelect");

  const TENANTS = [
    { value: "t-001", label: "Jordan Rivera", sublabel: `Maple Court · ${t("unit")} 204` },
    { value: "t-002", label: "Priya Nair", sublabel: `Oak Ridge · ${t("unit")} 11B` },
    { value: "t-003", label: "Marcus Chen", sublabel: `Birch Hollow · ${t("unit")} 7` },
    { value: "t-004", label: "Sofia Alvarez", sublabel: `Cedar Point · ${t("loft")} 302` },
    { value: "t-005", label: "Daniel O'Brien", sublabel: `Maple Court · ${t("unit")} 118` },
    { value: "t-006", label: "Aisha Khan", sublabel: `Oak Ridge · ${t("unit")} 22A` },
  ];

  const [value, setValue] = useState<string | null>(initialValue);
  const [options, setOptions] = useState(TENANTS);

  const handleSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setOptions(TENANTS);
      return;
    }
    setOptions(
      TENANTS.filter(
        (tenant) =>
          tenant.label.toLowerCase().includes(q) ||
          tenant.sublabel?.toLowerCase().includes(q),
      ),
    );
  };

  return (
    <div className="flex w-72 flex-col gap-2">
      <SearchSelect
        value={value}
        onChange={setValue}
        onSearch={handleSearch}
        options={options}
        loading={loading}
        placeholder={t("searchPlaceholder")}
      />
      <p className="text-xs text-text-muted">
        {t("selectedLabel", { value: value ?? t("none") })}
      </p>
    </div>
  );
}

export const Default: StoryObj<typeof SearchSelect> = {
  render: () => <StatefulSearchSelect />,
};

export const Preselected: StoryObj<typeof SearchSelect> = {
  render: () => <StatefulSearchSelect initialValue="t-003" />,
};

/**
 * Sublabels (unit numbers) are part of the option data, so they appear by
 * default — this story makes the behavior explicit.
 */
export const WithSublabels: StoryObj<typeof SearchSelect> = {
  render: () => <StatefulSearchSelect initialValue="t-001" />,
};

export const Loading: StoryObj<typeof SearchSelect> = {
  render: () => <StatefulSearchSelect loading />,
};

/**
 * The trigger, dropdown panel, and options can each be restyled via
 * `triggerClassName` / `contentClassName` / `optionClassName` (merged after the
 * defaults with `cn`), so the control fits a differently themed surface — here a
 * light slate/emerald public page — without forking the component. Keyboard
 * navigation (ArrowUp/Down, Enter, Escape) works the same on any surface.
 *
 * It also shows the labeling and invalidation props: `id` binds an external
 * `<label htmlFor>` to the trigger, `ariaLabel` names both the trigger and the
 * opened combobox input (so it isn't announced as "Search…"), and `required`
 * marks the combobox input `aria-required`; `onQueryChange` fires immediately
 * (before the debounced `onSearch`) so a prior selection is cleared the instant
 * the user edits the query — no stale value can survive the debounce window.
 */
export const LightSurfaceOverride: StoryObj<typeof SearchSelect> = {
  render: () => <LightThemedSearchSelect />,
};

function LightThemedSearchSelect() {
  const { t } = useTranslation("searchSelect");

  const POS = [
    { value: "po-1041", label: "PO-1041", sublabel: "Northwind Logistics · $12,400" },
    { value: "po-1042", label: "PO-1042", sublabel: "Evergreen Supply · $3,150" },
    { value: "po-1043", label: "PO-1043", sublabel: "Summit Freight · $8,900" },
    { value: "po-1044", label: "PO-1044", sublabel: "Harbor Point Co · $21,000" },
  ];

  const [value, setValue] = useState<string | null>(null);
  const [options, setOptions] = useState(POS);

  const handleSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    setOptions(
      !q
        ? POS
        : POS.filter(
            (po) =>
              po.label.toLowerCase().includes(q) ||
              po.sublabel?.toLowerCase().includes(q),
          ),
    );
  };

  return (
    <div className="flex w-72 flex-col gap-2 rounded-lg bg-slate-50 p-6">
      <label htmlFor="story-po" className="text-sm font-medium text-slate-700">
        {t("poLabel")} *
      </label>
      <SearchSelect
        id="story-po"
        ariaLabel={t("poLabel")}
        required
        value={value}
        onChange={setValue}
        onSearch={handleSearch}
        // Editing the query drops the prior selection at once, not after the debounce.
        onQueryChange={() => setValue(null)}
        options={options}
        placeholder={t("searchPlaceholder")}
        triggerClassName="border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:ring-emerald-500/40"
        contentClassName="border-slate-200 bg-white shadow-slate-200"
        optionClassName="text-slate-900 hover:bg-slate-100"
      />
      <p className="text-xs text-slate-500">
        {t("selectedLabel", { value: value ?? t("none") })}
      </p>
    </div>
  );
}
