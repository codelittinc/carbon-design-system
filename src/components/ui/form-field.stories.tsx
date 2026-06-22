import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./form-field";
import { Input } from "./input";

/**
 * FormField wraps a labelled control with optional required marker, error, and
 * hint text. Compose it around Input, Select, Textarea, or MoneyInput.
 */
const meta: Meta<typeof FormField> = {
  title: "Components/Forms/FormField",
  component: FormField,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: () => (
    <FormField label="Legal name" htmlFor="name">
      <Input id="name" placeholder="Acme Property Co." />
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField label="Email" htmlFor="email" required hint="Used for invoice delivery.">
      <Input id="email" type="email" placeholder="ap@acme.com" />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField label="Tax ID" htmlFor="tin" error="A valid 9-digit TIN is required.">
      <Input id="tin" defaultValue="12-34" />
    </FormField>
  ),
};
