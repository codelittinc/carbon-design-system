import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

/**
 * Textarea is the multi-line field for longer free-form text — eviction notes,
 * lease memos, maintenance descriptions. It forwards all native textarea props.
 */
const meta: Meta<typeof Textarea> = {
  title: "Components/Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof Textarea> = {
  render: () => (
    <div className="w-96">
      <Textarea placeholder="Add a note about this tenant…" />
    </div>
  ),
};

export const WithValue: StoryObj<typeof Textarea> = {
  render: () => (
    <div className="w-96">
      <Textarea defaultValue="Tenant requested a payment plan after a late rent notice. Promise-to-pay agreed for the 15th." />
    </div>
  ),
};

export const Disabled: StoryObj<typeof Textarea> = {
  render: () => (
    <div className="w-96">
      <Textarea
        defaultValue="Lease memo locked after period close."
        disabled
      />
    </div>
  ),
};

export const WithLabel: StoryObj<typeof Textarea> = {
  render: () => (
    <div className="flex w-96 flex-col gap-1.5">
      <label htmlFor="eviction-notes" className="text-sm font-medium text-text-primary">
        Eviction case notes
      </label>
      <Textarea id="eviction-notes" placeholder="Document the timeline and any communications…" />
      <p className="text-xs text-text-muted">Visible to staff with case access only.</p>
    </div>
  ),
};
