import type { ReactNode } from "react";
import type { PostalAddressDraft } from "./postal-address";
export type AddressComboboxStatus =
  "idle" | "loading" | "ready" | "unavailable";
export interface AddressSuggestion {
  id: string;
  address: string;
  secondaryText?: string;
}
export type AddressSuggestionProvider = (
  query: string,
  options: { signal: AbortSignal },
) => Promise<readonly AddressSuggestion[]>;
export interface AddressComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: PostalAddressDraft) => void;
  onSelect?: (formattedAddress: string) => void;
  onStatusChange?: (status: AddressComboboxStatus) => void;
  fetchSuggestions?: AddressSuggestionProvider;
  /** Hide per-field copy when the host presents one shared status message. */
  showStatus?: boolean;
  /** Optional attribution supplied by a custom provider. */
  attribution?: ReactNode;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  variant?: "staff" | "public" | "vendor";
  ariaLabel?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}
