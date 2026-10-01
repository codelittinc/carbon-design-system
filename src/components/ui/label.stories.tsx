import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

/** Label names a form control, styled to match FormField. */
const meta: Meta<typeof Label> = {
  title: "Components/Forms/Label",
  component: Label,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => (
    <div className="w-64 space-y-1">
      <Label htmlFor="username" required>
        Username
      </Label>
      <Input id="username" />
    </div>
  ),
};
