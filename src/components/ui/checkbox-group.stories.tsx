import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CheckboxGroup } from "./checkbox-group";

/** CheckboxGroup picks any number of a few options, all visible. */
const meta: Meta<typeof CheckboxGroup> = {
  title: "Components/Forms/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const FEATURE_OPTIONS = [
  { value: "billing", label: "Billing" },
  { value: "analytics", label: "Analytics" },
  { value: "exports", label: "Exports" },
  { value: "api", label: "API access" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["true"]);
    return (
      <div>
        <CheckboxGroup aria-label="Status" value={value} onChange={setValue} options={STATUS_OPTIONS} />
        <p className="mt-4 text-sm text-text-muted">
          Selected: {value.length === 0 ? "(none)" : value.join(", ")}
        </p>
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["billing", "analytics"]);
    return (
      <CheckboxGroup
        aria-label="Features"
        orientation="vertical"
        value={value}
        onChange={setValue}
        options={FEATURE_OPTIONS}
      />
    );
  },
};

export const DisabledOption: Story = {
  args: {
    value: ["true"],
    onChange: () => {},
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive", disabled: true },
    ],
  },
};

export const AllDisabled: Story = {
  args: { value: ["true"], onChange: () => {}, options: STATUS_OPTIONS, disabled: true },
};
