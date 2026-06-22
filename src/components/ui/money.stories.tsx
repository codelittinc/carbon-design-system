import type { Meta, StoryObj } from "@storybook/react";
import { Money } from "./money";

/**
 * Money renders a dollar amount in the monospace font with tabular figures so
 * columns of numbers align on the decimal. Negative values format with
 * parentheses and can optionally be colored.
 */
const meta: Meta<typeof Money> = {
  title: "Components/Data Display/Money",
  component: Money,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Money>;

export const Positive: Story = {
  args: { value: "1234.56" },
};

export const Negative: Story = {
  args: { value: "-1234.56", colorNegative: true },
};

export const Column: Story = {
  render: () => (
    <div className="flex flex-col items-end gap-1">
      <Money value="1234.56" />
      <Money value="89.00" />
      <Money value="-450.20" colorNegative />
      <Money value="10500.00" />
    </div>
  ),
};
