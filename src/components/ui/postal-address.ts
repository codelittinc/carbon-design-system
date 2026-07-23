/**
 * Provider-neutral US postal address shape. The `Draft` variant keeps every field
 * as a controlled string (line 2 is "" rather than null) so it can drive form
 * inputs directly; `PostalAddress` is the normalized, submit-ready shape.
 */
export interface PostalAddress {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PostalAddressDraft {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const EMPTY_POSTAL_ADDRESS: PostalAddressDraft = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export function postalAddressToDraft(address?: PostalAddress | null): PostalAddressDraft {
  return address
    ? { ...address, addressLine2: address.addressLine2 ?? "" }
    : { ...EMPTY_POSTAL_ADDRESS };
}

export function postalAddressFromDraft(address: PostalAddressDraft): PostalAddress | null {
  if (!address.addressLine1.trim()) return null;
  return {
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim() || null,
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim().toUpperCase() || "US",
  };
}

export function isPostalAddressDraftComplete(address: PostalAddressDraft): boolean {
  return Boolean(
    address.addressLine1.trim() &&
      address.city.trim() &&
      /^[A-Za-z]{2}$/.test(address.state.trim()) &&
      /^\d{5}(?:-\d{4})?$/.test(address.postalCode.trim()) &&
      address.country.trim(),
  );
}

function component(
  components: google.maps.places.AddressComponent[],
  type: string,
  short = false,
): string {
  const found = components.find((item) => item.types.includes(type));
  return (short ? found?.shortText : found?.longText) ?? "";
}

/** Convert a Places API New result into Carbon's provider-neutral address shape. */
export function parseGooglePlaceAddress(
  place: Pick<google.maps.places.Place, "addressComponents">,
): PostalAddressDraft | null {
  const components = place.addressComponents;
  if (!components) return null;
  const street = [component(components, "street_number"), component(components, "route")]
    .filter(Boolean)
    .join(" ");
  const city =
    component(components, "locality") ||
    component(components, "postal_town") ||
    component(components, "sublocality_level_1");
  const postalCode = component(components, "postal_code");
  const postalSuffix = component(components, "postal_code_suffix");
  return {
    addressLine1: street,
    addressLine2: component(components, "subpremise"),
    city,
    state: component(components, "administrative_area_level_1", true),
    postalCode: postalSuffix ? `${postalCode}-${postalSuffix}` : postalCode,
    country: component(components, "country", true) || "US",
  };
}
