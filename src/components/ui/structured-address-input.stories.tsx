import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StructuredAddressInput } from "./structured-address-input";
import { EMPTY_POSTAL_ADDRESS, type PostalAddressDraft } from "./postal-address";

/**
 * StructuredAddressInput is a full US postal-address form. The street field is
 * Google Places–backed (see AddressCombobox) and fills city/state/ZIP on
 * selection; the remaining fields are manual. Fully controlled via a
 * PostalAddressDraft.
 *
 * Address suggestions require a Google Maps key (VITE_GOOGLE_MAPS_API_KEY);
 * without one, the street field degrades gracefully to manual entry.
 */
const meta: Meta<typeof StructuredAddressInput> = {
  title: "Components/Forms/StructuredAddressInput",
  component: StructuredAddressInput,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StructuredAddressInput>;

function Stateful({
  variant = "staff",
  initial = EMPTY_POSTAL_ADDRESS,
}: {
  variant?: "staff" | "vendor";
  initial?: PostalAddressDraft;
}) {
  const [value, setValue] = useState<PostalAddressDraft>(initial);
  return (
    <div className={variant === "vendor" ? "w-[36rem] rounded-lg bg-white p-4" : "w-[36rem]"}>
      <StructuredAddressInput
        value={value}
        onChange={setValue}
        variant={variant}
        idPrefix="demo"
      />
    </div>
  );
}

export const Staff: Story = { render: () => <Stateful /> };

export const Prefilled: Story = {
  render: () => (
    <Stateful
      initial={{
        addressLine1: "123 Maple Court",
        addressLine2: "Apt 4B",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        country: "US",
      }}
    />
  ),
};

/** The vendor variant uses the light portal palette. */
export const Vendor: Story = { render: () => <Stateful variant="vendor" /> };
