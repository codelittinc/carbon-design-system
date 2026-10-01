import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

/** Spinner is an indeterminate loading indicator. */
const meta: Meta<typeof Spinner> = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = { args: { label: "Loading…" } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
