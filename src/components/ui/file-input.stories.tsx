import type { Meta, StoryObj } from "@storybook/react";
import { FileInput } from "./file-input";
import { Label } from "./label";

/**
 * FileInput picks one file for a form. The native input stays in the form, so
 * it submits like any other field; the button, file name and Remove action are
 * drawn by the design system.
 */
const meta: Meta<typeof FileInput> = {
  title: "Components/Forms/FileInput",
  component: FileInput,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FileInput>;

export const Default: Story = {
  render: () => (
    <div className="max-w-md">
      <Label htmlFor="lease" className="mb-1">
        Signed lease
      </Label>
      <FileInput id="lease" name="lease" accept="application/pdf" describedBy="lease-hint" />
      <p id="lease-hint" className="mt-1 text-xs text-text-muted">
        PDF, up to 10 MB.
      </p>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="max-w-md">
      <Label htmlFor="lease-invalid" required className="mb-1">
        Signed lease
      </Label>
      <FileInput id="lease-invalid" name="lease" invalid describedBy="lease-error" />
      <p id="lease-error" className="mt-1 text-xs text-error-text">
        Attach the signed lease
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <FileInput id="lease-disabled" name="lease" disabled />,
};
