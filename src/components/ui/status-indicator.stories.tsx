import type { Meta, StoryObj } from "@storybook/react";
import { StatusIndicator, StatusLegend } from "./status-indicator";

/**
 * StatusIndicator is a colored dot for a status, named by its label. The app
 * owns which color means what; StatusLegend explains the mapping once.
 */
const meta: Meta<typeof StatusIndicator> = {
  title: "Components/Data Display/StatusIndicator",
  component: StatusIndicator,
  tags: ["autodocs"],
  args: { color: "var(--color-chart-2)", label: "Currently working" },
};
export default meta;

type Story = StoryObj<typeof StatusIndicator>;

const STATUSES = [
  { color: "var(--color-chart-2)", label: "Currently working" },
  { color: "var(--color-chart-3)", label: "Completed hiring process" },
  { color: "var(--color-chart-1)", label: "Started hiring process" },
  { color: "var(--color-chart-7)", label: "Already worked with us" },
  { color: "var(--color-chart-8)", label: "Blocked from future work" },
  { color: "var(--color-chart-4)", label: "Incomplete profile" },
];

export const Default: Story = {};

export const WithLabel: Story = { args: { showLabel: true } };

export const Small: Story = { args: { size: "sm", showLabel: true } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {STATUSES.map((s) => (
        <StatusIndicator key={s.label} {...s} showLabel />
      ))}
    </div>
  ),
};

export const Legend: Story = {
  render: () => <StatusLegend items={STATUSES} />,
};
