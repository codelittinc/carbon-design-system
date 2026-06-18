import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

/**
 * Input is the base single-line text field used throughout forms — tenant
 * names, emails, unit numbers. It forwards all native input props and a ref.
 */
const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof Input> = {
  render: () => (
    <div className="w-72">
      <Input placeholder="Tenant full name" />
    </div>
  ),
};

export const WithValue: StoryObj<typeof Input> = {
  render: () => (
    <div className="w-72">
      <Input defaultValue="Jordan Rivera" />
    </div>
  ),
};

export const Disabled: StoryObj<typeof Input> = {
  render: () => (
    <div className="w-72">
      <Input defaultValue="Maple Court — Unit 204" disabled />
    </div>
  ),
};

export const Types: StoryObj<typeof Input> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input type="text" placeholder="Tenant name" />
      <Input type="email" placeholder="tenant@example.com" />
      <Input type="number" placeholder="Unit number" />
    </div>
  ),
};

export const WithLabel: StoryObj<typeof Input> = {
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <label htmlFor="tenant-email" className="text-sm font-medium text-text-primary">
        Email address
      </label>
      <Input id="tenant-email" type="email" placeholder="tenant@example.com" />
      <p className="text-xs text-text-muted">Used for rent reminders and receipts.</p>
    </div>
  ),
};
