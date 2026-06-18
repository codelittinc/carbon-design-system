import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MoneyInput } from "./money-input";

/**
 * MoneyInput is a controlled currency field with a fixed "$" prefix and
 * right-aligned, comma-grouped display. It holds the raw numeric string in
 * state (e.g. "1250.00") while showing a formatted value, and renders negatives
 * in parentheses. Always drive it with useState.
 */
const meta: Meta<typeof MoneyInput> = {
  title: "Components/Forms/MoneyInput",
  component: MoneyInput,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof MoneyInput> = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="flex w-72 flex-col gap-2">
        <MoneyInput value={value} onChange={setValue} placeholder="0.00" />
        <p className="text-xs text-text-muted">Raw value: {JSON.stringify(value)}</p>
      </div>
    );
  },
};

export const WithValue: StoryObj<typeof MoneyInput> = {
  render: () => {
    const [value, setValue] = useState("1250.00");
    return (
      <div className="flex w-72 flex-col gap-2">
        <MoneyInput value={value} onChange={setValue} />
        <p className="text-xs text-text-muted">Raw value: {JSON.stringify(value)}</p>
      </div>
    );
  },
};

export const Disabled: StoryObj<typeof MoneyInput> = {
  render: () => {
    const [value, setValue] = useState("3400.00");
    return (
      <div className="flex w-72 flex-col gap-2">
        <MoneyInput value={value} onChange={setValue} disabled />
        <p className="text-xs text-text-muted">Raw value: {JSON.stringify(value)}</p>
      </div>
    );
  },
};
