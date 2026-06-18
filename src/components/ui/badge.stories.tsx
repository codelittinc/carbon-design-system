import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

/**
 * Badge renders a small pill-shaped label. Use it for inline status hints,
 * counts, and categorical tags throughout the property-management UI.
 */
const meta: Meta<typeof Badge> = {
  title: "Components/Data Display/Badge",
  component: Badge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Current Resident",
  },
};

const variants = [
  { variant: "default", label: "Draft" },
  { variant: "accent", label: "Featured" },
  { variant: "success", label: "Paid" },
  { variant: "warning", label: "Pending" },
  { variant: "error", label: "Past Due" },
  { variant: "info", label: "Partially Paid" },
] as const;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {variants.map(({ variant, label }) => (
        <Badge key={variant} variant={variant}>
          {label}
        </Badge>
      ))}
    </div>
  ),
};
