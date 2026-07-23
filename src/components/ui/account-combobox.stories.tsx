import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AccountCombobox, type AccountOption } from "./account-combobox";

/**
 * AccountCombobox is a type-to-search picker for a large chart of accounts.
 * It filters the passed-in list by account number OR name and is fully keyboard
 * navigable. Client-side filtering only — pass the already-loaded account list.
 */
const meta: Meta<typeof AccountCombobox> = {
  title: "Components/Forms/AccountCombobox",
  component: AccountCombobox,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof AccountCombobox>;

const ACCOUNTS: AccountOption[] = [
  { id: "a1", accountNumber: "1-1000-0000", name: "Operating Cash" },
  { id: "a2", accountNumber: "1-1200-0000", name: "Accounts Receivable" },
  { id: "a3", accountNumber: "1-5730-0000", name: "Prepaid Rent" },
  { id: "a4", accountNumber: "2-2000-0000", name: "Accounts Payable" },
  { id: "a5", accountNumber: "4-4000-0000", name: "Rental Income" },
  { id: "a6", accountNumber: "5-6100-0000", name: "Repairs & Maintenance" },
  { id: "a7", accountNumber: "5-6200-0000", name: "Utilities Expense" },
];

function Stateful({
  variant,
  clearable,
  initial = "",
}: {
  variant?: "default" | "inline";
  clearable?: boolean;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-80">
      <AccountCombobox
        accounts={ACCOUNTS}
        value={value}
        onChange={setValue}
        variant={variant}
        clearable={clearable}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Stateful /> };

export const Preselected: Story = { render: () => <Stateful initial="a3" /> };

export const Clearable: Story = { render: () => <Stateful initial="a5" clearable /> };

/** The inline variant is borderless for use inside dense table cells. */
export const Inline: Story = {
  render: () => (
    <div className="w-64 rounded-md border border-border bg-surface p-2">
      <Stateful variant="inline" initial="a1" />
    </div>
  ),
};
