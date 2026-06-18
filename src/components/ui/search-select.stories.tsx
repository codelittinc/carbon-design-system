import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchSelect } from "./search-select";

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

const TENANTS = [
  { value: "t-001", label: "Jordan Rivera", sublabel: "Maple Court · Unit 204" },
  { value: "t-002", label: "Priya Nair", sublabel: "Oak Ridge · Unit 11B" },
  { value: "t-003", label: "Marcus Chen", sublabel: "Birch Hollow · Unit 7" },
  { value: "t-004", label: "Sofia Alvarez", sublabel: "Cedar Point · Loft 302" },
  { value: "t-005", label: "Daniel O'Brien", sublabel: "Maple Court · Unit 118" },
  { value: "t-006", label: "Aisha Khan", sublabel: "Oak Ridge · Unit 22A" },
];

function StatefulSearchSelect({
  initialValue = null,
  loading = false,
}: {
  initialValue?: string | null;
  loading?: boolean;
}) {
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
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.sublabel?.toLowerCase().includes(q),
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
        placeholder="Search tenants…"
      />
      <p className="text-xs text-text-muted">Selected: {value ?? "none"}</p>
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
