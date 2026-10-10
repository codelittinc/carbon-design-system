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
// A data URI, so the story needs no network.
const LOGO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%234A154B'/><circle cx='20' cy='20' r='9' fill='%23ECB22E'/></svg>";
export const WithLogo: Story = { args: { name: "Slack", src: LOGO } };
export const BrokenLogo: Story = { args: { name: "Slack", src: "https://example.invalid/missing.png" } };
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Monogram {...args} size="xs" />
      <Monogram {...args} size="sm" />
      <Monogram {...args} size="md" />
      <Monogram {...args} size="lg" />
    </div>
  ),
};
