"use client";

import { AddressAutocomplete } from "./address-combobox";
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
 * uses the dark design tokens; "vendor" uses the light portal palette.
 */
export function StructuredAddressInput({
  value,
  onChange,
  variant = "staff",
  idPrefix,
  required = false,
}: StructuredAddressInputProps) {
  const vendor = variant === "vendor";
  const inputClass = vendor
    ? "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
    : "h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = vendor
    ? "mb-1 block text-xs font-medium text-slate-600"
    : "mb-1 block text-xs font-medium text-text-muted";
  const update = (field: keyof PostalAddressDraft, next: string) =>
    onChange({ ...value, [field]: next });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
      <div className="sm:col-span-4">
        <label className={labelClass} htmlFor={`${idPrefix}-line1`}>
          Street address{required ? " *" : ""}
        </label>
        <AddressAutocomplete
          id={`${idPrefix}-line1`}
          value={value.addressLine1}
          onChange={(next) => update("addressLine1", next)}
          onAddressSelect={onChange}
          variant={vendor ? "vendor" : "staff"}
          ariaLabel={`Street address${required ? " *" : ""}`}
          placeholder="Start typing or enter manually"
          required={required}
          autoComplete="address-line1"
        />
      </div>
      <label className="sm:col-span-2" htmlFor={`${idPrefix}-line2`}>
        <span className={labelClass}>Apartment or suite</span>
        <input
          id={`${idPrefix}-line2`}
          className={inputClass}
          value={value.addressLine2}
          onChange={(event) => update("addressLine2", event.target.value)}
          autoComplete="address-line2"
        />
      </label>
      <label className="sm:col-span-3" htmlFor={`${idPrefix}-city`}>
        <span className={labelClass}>City{required ? " *" : ""}</span>
        <input
          id={`${idPrefix}-city`}
          className={inputClass}
          value={value.city}
          onChange={(event) => update("city", event.target.value)}
          autoComplete="address-level2"
          required={required}
        />
      </label>
      <label className="sm:col-span-1" htmlFor={`${idPrefix}-state`}>
        <span className={labelClass}>State{required ? " *" : ""}</span>
        <input
          id={`${idPrefix}-state`}
          className={inputClass}
          value={value.state}
          onChange={(event) => update("state", event.target.value.toUpperCase())}
          autoComplete="address-level1"
          maxLength={2}
          required={required}
        />
      </label>
      <label className="sm:col-span-2" htmlFor={`${idPrefix}-postal`}>
        <span className={labelClass}>ZIP code{required ? " *" : ""}</span>
        <input
          id={`${idPrefix}-postal`}
          className={inputClass}
          value={value.postalCode}
          onChange={(event) => update("postalCode", event.target.value)}
          autoComplete="postal-code"
          inputMode="numeric"
          required={required}
        />
      </label>
      <input type="hidden" name="country" value={value.country || "US"} />
    </div>
  );
}
