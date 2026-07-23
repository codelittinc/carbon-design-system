import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AddressAutocomplete as AddressCombobox } from "./address-combobox";
import { EMPTY_POSTAL_ADDRESS, type PostalAddressDraft } from "./postal-address";

/**
 * AddressCombobox is the Google Places (New API) address picker. Unlike the
 * simpler AddressAutocomplete, it resolves the selected prediction into a
 * structured PostalAddressDraft via `onAddressSelect`, debounces requests, and
 * degrades to manual entry (with a retry affordance) when Places is unconfigured
 * or unreachable.
 *
 * Live suggestions require a Google Maps key (VITE_GOOGLE_MAPS_API_KEY). Without
 * one you'll see the "unavailable — enter manually" state, which is expected.
 */
const meta: Meta<typeof AddressCombobox> = {
  title: "Components/Forms/AddressCombobox",
  component: AddressCombobox,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof AddressCombobox>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const [parsed, setParsed] = useState<PostalAddressDraft>(EMPTY_POSTAL_ADDRESS);
    return (
      <div className="w-96 space-y-3">
        <label className="block text-xs font-medium text-text-secondary">Street address</label>
        <AddressCombobox
          value={value}
          onChange={setValue}
          onAddressSelect={(address) => {
            setParsed(address);
            setValue(address.addressLine1);
          }}
          placeholder="Start typing an address…"
        />
        <pre className="rounded-md bg-surface-overlay p-3 text-[11px] leading-relaxed text-text-muted">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    );
  },
};

/** The vendor variant uses the light portal palette. */
export const Vendor: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-96 rounded-lg bg-white p-4">
        <AddressCombobox
          value={value}
          onChange={setValue}
          variant="vendor"
          placeholder="Start typing an address…"
        />
      </div>
    );
  },
};
