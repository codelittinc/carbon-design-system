"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { AddressAutocomplete, STAFF_INPUT_CLASS, VENDOR_INPUT_CLASS } from "./address-combobox";
import { FormField } from "./form-field";
import { Input } from "./input";
import type { PostalAddressDraft } from "./postal-address";

interface StructuredAddressInputProps {
  value: PostalAddressDraft;
  onChange: (value: PostalAddressDraft) => void;
  variant?: "staff" | "vendor";
  idPrefix: string;
  required?: boolean;
}

/**
 * Full US postal-address form: a Places-backed street field that fills the rest
 * of the fields on selection, plus manual inputs for line 2, city, state, and
 * ZIP. Fully controlled via a {@link PostalAddressDraft}. The "staff" variant
 * follows the app's theme; "vendor" is always the light portal scheme (the
 * theme's light tokens, scoped by the `light` class).
 *
 * Each field is a `FormField`, so a required one carries the marker beside its
 * label, hidden from screen readers, and `required` on the input, which they
 * announce instead.
 */
export function StructuredAddressInput({
  value,
  onChange,
  variant = "staff",
  idPrefix,
  required = false,
}: StructuredAddressInputProps): ReactElement {
  const vendor = variant === "vendor";
  // Matches the street field's height for each variant.
  const inputClass = vendor ? VENDOR_INPUT_CLASS : STAFF_INPUT_CLASS;
  const update = (field: keyof PostalAddressDraft, next: string) =>
    onChange({ ...value, [field]: next });

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-6", vendor && "light")}>
      <FormField
        className="sm:col-span-4"
        label="Street address"
        htmlFor={`${idPrefix}-line1`}
        required={required}
      >
        <AddressAutocomplete
          id={`${idPrefix}-line1`}
          value={value.addressLine1}
          onChange={(next) => update("addressLine1", next)}
          onAddressSelect={onChange}
          variant={vendor ? "vendor" : "staff"}
          ariaLabel="Street address"
          placeholder="Start typing or enter manually"
          required={required}
          autoComplete="address-line1"
        />
      </FormField>
      <FormField className="sm:col-span-2" label="Apartment or suite" htmlFor={`${idPrefix}-line2`}>
        <Input
          id={`${idPrefix}-line2`}
          className={inputClass}
          value={value.addressLine2}
          onChange={(event) => update("addressLine2", event.target.value)}
          autoComplete="address-line2"
        />
      </FormField>
      <FormField className="sm:col-span-3" label="City" htmlFor={`${idPrefix}-city`} required={required}>
        <Input
          id={`${idPrefix}-city`}
          className={inputClass}
          value={value.city}
          onChange={(event) => update("city", event.target.value)}
          autoComplete="address-level2"
          required={required}
        />
      </FormField>
      <FormField className="sm:col-span-1" label="State" htmlFor={`${idPrefix}-state`} required={required}>
        <Input
          id={`${idPrefix}-state`}
          className={inputClass}
          value={value.state}
          onChange={(event) => update("state", event.target.value.toUpperCase())}
          autoComplete="address-level1"
          maxLength={2}
          required={required}
        />
      </FormField>
      <FormField className="sm:col-span-2" label="ZIP code" htmlFor={`${idPrefix}-postal`} required={required}>
        <Input
          id={`${idPrefix}-postal`}
          className={inputClass}
          value={value.postalCode}
          onChange={(event) => update("postalCode", event.target.value)}
          autoComplete="postal-code"
          inputMode="numeric"
          required={required}
        />
      </FormField>
      <input type="hidden" name="country" value={value.country || "US"} />
    </div>
  );
}
