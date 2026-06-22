import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./stat-card";

/**
 * StatCard is a KPI tile with an uppercase label, a large monospace value, and
 * an optional trend-colored sub-line. Renders a skeleton while loading.
 */
const meta: Meta<typeof StatCard> = {
  title: "Components/Data Display/StatCard",
  component: StatCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: { label: "Occupancy", value: "94.2%", sub: "+1.4% vs last month", trend: "up" },
};

export const Loading: Story = {
  args: { label: "Open AR", value: "", loading: true },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Properties" value="12" />
      <StatCard label="Units" value="1,204" sub="1,134 occupied" trend="neutral" />
      <StatCard label="Open AR" value="$48,210.00" sub="-3.1% vs last month" trend="down" />
    </div>
  ),
};
