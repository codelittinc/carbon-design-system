import type { Meta, StoryObj } from "@storybook/react";
import { Monogram } from "./monogram";

const meta: Meta<typeof Monogram> = {
  title: "UI/Monogram",
  component: Monogram,
  args: { name: "Google Suite" },
};
export default meta;

type Story = StoryObj<typeof Monogram>;

export const Default: Story = {};
export const SingleWord: Story = { args: { name: "Slack" } };
export const CustomInitials: Story = { args: { name: "Carbon Gatekeeper Admin", initials: "GK" } };
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Monogram {...args} size="sm" />
      <Monogram {...args} size="md" />
      <Monogram {...args} size="lg" />
    </div>
  ),
};
