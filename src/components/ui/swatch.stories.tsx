import type { Meta, StoryObj } from "@storybook/react";
import { Swatch } from "./swatch";

/**
 * Swatch is the round color key the chart legends, chart tooltips and
 * StatusIndicator draw. Color never carries meaning alone: put text beside it,
 * or give it a `label`.
 */
const meta: Meta<typeof Swatch> = {
  title: "Components/Data Display/Swatch",
  component: Swatch,
  tags: ["autodocs"],
  args: { color: "var(--color-chart-1)" },
};
export default meta;

type Story = StoryObj<typeof Swatch>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Swatch {...args} size="xs" />
      <Swatch {...args} size="sm" />
      <Swatch {...args} size="md" />
    </div>
  ),
};

/** A series toggled off in a legend. */
export const Dimmed: Story = { args: { dimmed: true, size: "md" } };

/** Named for a screen reader when no text beside it says what it means. */
export const Labelled: Story = { args: { label: "Overdue", color: "var(--color-chart-8)", size: "md" } };
