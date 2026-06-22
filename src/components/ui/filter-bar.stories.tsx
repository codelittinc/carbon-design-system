import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterBar } from "./filter-bar";

/**
 * FilterBar is the toolbar above a list or table: a search input plus a slot
 * for filter controls passed as children.
 */
const meta: Meta<typeof FilterBar> = {
  title: "Components/Forms/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

const filterSelectClass =
  "flex h-8 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary";

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search tenants...">
        <select className={filterSelectClass} defaultValue="">
          <option value="">All Statuses</option>
          <option value="CURRENT_RESIDENT">Current</option>
          <option value="PAST_RESIDENT">Past</option>
        </select>
      </FilterBar>
    );
  },
};
