import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterBar } from "./filter-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

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

function StatusFilter() {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="sm:w-[160px]" aria-label="Status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="CURRENT_RESIDENT">Current</SelectItem>
        <SelectItem value="PAST_RESIDENT">Past</SelectItem>
      </SelectContent>
    </Select>
  );
}

/**
 * On a phone-width viewport the search box takes the full width and the
 * filters stack below it. From `sm` (640px) up it is the usual single row.
 */
export const MobileStacking: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search tenants...">
        <StatusFilter />
      </FilterBar>
    );
  },
};

/**
 * `size="touch"`: the search input is 44px tall below `sm`, for a finger, and
 * the default 32px from `sm` up. View it at a phone width to see the change.
 */
export const TouchSize: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tenants..."
        size="touch"
      >
        <StatusFilter />
      </FilterBar>
    );
  },
};

/** `stackOnMobile={false}` keeps the single row at every width. */
export const SingleRowOnMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tenants..."
        stackOnMobile={false}
      >
        <StatusFilter />
      </FilterBar>
    );
  },
};
