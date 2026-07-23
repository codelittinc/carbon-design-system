import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiStatusFilter, type StatusOption } from "./multi-status-filter";

/**
 * MultiStatusFilter is a checkbox-dropdown multi-select for list status filters.
 * An empty selection means "all statuses" (the caller sends no status param).
 * The trigger summarizes the active set so the current filter is always visible.
 */
const meta: Meta<typeof MultiStatusFilter> = {
  title: "Components/Forms/MultiStatusFilter",
  component: MultiStatusFilter,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MultiStatusFilter>;

const OPTIONS: StatusOption[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "PARTIAL", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "VOID", label: "Void" },
];

function Stateful({ initial = [] }: { initial?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  return (
    <div className="flex flex-col gap-3">
      <MultiStatusFilter options={OPTIONS} selected={selected} onChange={setSelected} />
      <p className="text-xs text-text-muted">
        Selected: {selected.length ? selected.join(", ") : "all statuses"}
      </p>
    </div>
  );
}

export const Default: Story = { render: () => <Stateful /> };

export const WithSelection: Story = { render: () => <Stateful initial={["OPEN", "PARTIAL"]} /> };

/** More than two selected collapses to a count on the trigger. */
export const CountSummary: Story = {
  render: () => <Stateful initial={["DRAFT", "OPEN", "PARTIAL"]} />,
};
