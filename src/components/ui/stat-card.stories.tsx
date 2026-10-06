import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Progress } from "./progress";
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

/** An action beside the label, a tone on the value, and more under it. */
export const WithActionAndChildren: Story = {
  render: () => (
    <StatCard
      className="w-64"
      label="Needs review"
      value={4}
      valueClassName="text-error-text"
      action={
        <Button variant="link" size="sm" className="h-auto p-0">
          View
        </Button>
      }
    >
      <Progress value={40} tone="error" aria-label="Reviewed" />
    </StatCard>
  ),
};
