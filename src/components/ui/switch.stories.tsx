import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./switch";

/**
 * Switch is a Radix-based on/off control for immediate settings toggles —
 * autopay, late-fee waivers, statement delivery preferences.
 */
const meta: Meta<typeof Switch> = {
  title: "Components/Forms/Switch",
  component: Switch,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof Switch> = {
  render: () => <Switch aria-label="Toggle setting" />,
};

export const Checked: StoryObj<typeof Switch> = {
  render: () => <Switch defaultChecked aria-label="Setting enabled" />,
};

export const Disabled: StoryObj<typeof Switch> = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch disabled aria-label="Disabled off" />
      <Switch disabled defaultChecked aria-label="Disabled on" />
    </div>
  ),
};

export const WithLabel: StoryObj<typeof Switch> = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="late-fee" defaultChecked />
      <label htmlFor="late-fee" className="text-sm text-text-primary">
        Auto-apply late fees after grace period
      </label>
    </div>
  ),
};

export const Controlled: StoryObj<typeof Switch> = {
  render: () => {
    const [enabled, setEnabled] = useState(true);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Switch id="statements" checked={enabled} onCheckedChange={setEnabled} />
          <label htmlFor="statements" className="text-sm text-text-primary">
            Email monthly statements
          </label>
        </div>
        <p className="text-xs text-text-muted">
          Statements are {enabled ? "on" : "off"}.
        </p>
      </div>
    );
  },
};
