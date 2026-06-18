import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./checkbox";

/**
 * Checkbox is a Radix-based binary toggle used for opt-ins and bulk selection —
 * "send receipt", "include in rent roll", row selection in tables.
 */
const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof Checkbox> = {
  render: () => <Checkbox aria-label="Select tenant" />,
};

export const Checked: StoryObj<typeof Checkbox> = {
  render: () => <Checkbox defaultChecked aria-label="Selected tenant" />,
};

export const Disabled: StoryObj<typeof Checkbox> = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox disabled aria-label="Disabled unchecked" />
      <Checkbox disabled defaultChecked aria-label="Disabled checked" />
    </div>
  ),
};

export const WithLabel: StoryObj<typeof Checkbox> = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="email-receipt" defaultChecked />
      <label htmlFor="email-receipt" className="text-sm text-text-primary">
        Email payment receipt to tenant
      </label>
    </div>
  ),
};

export const Controlled: StoryObj<typeof Checkbox> = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="autopay"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
          />
          <label htmlFor="autopay" className="text-sm text-text-primary">
            Enroll tenant in autopay
          </label>
        </div>
        <p className="text-xs text-text-muted">
          Autopay is {checked ? "enabled" : "disabled"}.
        </p>
      </div>
    );
  },
};
