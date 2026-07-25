import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog";
import { StructuredAddressInput } from "../structured-address-input";
import {
  EMPTY_POSTAL_ADDRESS,
  parseGooglePlaceAddress,
  type PostalAddressDraft,
} from "../postal-address";

const loadGooglePlacesLibrary = vi.hoisted(() => vi.fn());
vi.mock("@/lib/google-places", () => ({ loadGooglePlacesLibrary }));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function addressComponents(streetNumber: string, route: string) {
  return [
    { longText: streetNumber, shortText: streetNumber, types: ["street_number"] },
    { longText: route, shortText: route, types: ["route"] },
    { longText: "Austin", shortText: "Austin", types: ["locality"] },
    {
      longText: "Texas",
      shortText: "TX",
      types: ["administrative_area_level_1"],
    },
    { longText: "78701", shortText: "78701", types: ["postal_code"] },
    { longText: "United States", shortText: "US", types: ["country"] },
  ] as unknown as google.maps.places.AddressComponent[];
}

function makeSuggestion(street = "409 Main Street") {
  const place = {
    addressComponents: addressComponents(
      street.split(" ")[0] ?? "",
      street.split(" ").slice(1).join(" "),
    ),
    formattedAddress: `${street}, Austin, TX 78701`,
    fetchFields: vi.fn().mockResolvedValue(undefined),
  };
  const prediction = {
    placeId: street,
    mainText: { toString: () => street },
    secondaryText: { toString: () => "Austin, TX" },
    text: { toString: () => `${street}, Austin, TX` },
    toPlace: () => place,
  };
  return {
    suggestion: {
      placePrediction: prediction,
    } as unknown as google.maps.places.AutocompleteSuggestion,
    place,
  };
}

function library(fetchSuggestions = vi.fn()) {
  class SessionToken {}
  return {
    AutocompleteSessionToken: SessionToken,
    AutocompleteSuggestion: { fetchAutocompleteSuggestions: fetchSuggestions },
  } as unknown as google.maps.PlacesLibrary;
}

function AddressHarness({ inDialog = false }: { inDialog?: boolean }) {
  const [address, setAddress] = useState<PostalAddressDraft>({ ...EMPTY_POSTAL_ADDRESS });
  const fields = (
    <StructuredAddressInput
      idPrefix="test-address"
      value={address}
      onChange={setAddress}
      required
    />
  );
  return inDialog ? (
    <Dialog open>
      <DialogContent>
        <DialogTitle>Return deposit</DialogTitle>
        <DialogDescription>Enter the tenant forwarding address.</DialogDescription>
        {fields}
      </DialogContent>
    </Dialog>
  ) : (
    fields
  );
}

async function finishDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(300);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("structured address input", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    loadGooglePlacesLibrary.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("maps Places API New address components into separate postal fields", () => {
    const address = parseGooglePlaceAddress({
      addressComponents: [
        ...addressComponents("123", "Main Street"),
        { longText: "4B", shortText: "4B", types: ["subpremise"] },
      ] as unknown as google.maps.places.AddressComponent[],
    } as google.maps.places.Place);

    expect(address).toEqual({
      addressLine1: "123 Main Street",
      addressLine2: "4B",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US",
    });
  });

  it("uses Street address as the only manual and search input", () => {
    render(<AddressHarness />);

    const street = screen.getByRole("combobox", { name: "Street address *" });
    fireEvent.change(street, { target: { value: "409" } });

    expect(street).toHaveValue("409");
    expect(screen.queryByLabelText(/Find address/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("City *")).toBeEnabled();
    expect(screen.getByLabelText("ZIP code *")).toBeEnabled();
  });

  it("requests suggestions after 409 and fills every field with keyboard selection", async () => {
    const { suggestion, place } = makeSuggestion();
    const fetchSuggestions = vi.fn().mockResolvedValue({ suggestions: [suggestion] });
    loadGooglePlacesLibrary.mockResolvedValue(library(fetchSuggestions));
    render(<AddressHarness />);

    const street = screen.getByRole("combobox", { name: "Street address *" });
    fireEvent.change(street, { target: { value: "409" } });
    await finishDebounce();

    expect(fetchSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({ input: "409", includedRegionCodes: ["us"], region: "us" }),
    );
    expect(screen.getByRole("option", { name: /409 Main Street/i })).toBeInTheDocument();
    fireEvent.keyDown(street, { key: "ArrowDown" });
    expect(street).toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(street, { key: "Enter" });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(place.fetchFields).toHaveBeenCalledWith({
      fields: ["addressComponents", "formattedAddress"],
    });
    expect(street).toHaveValue("409 Main Street");
    expect(screen.getByLabelText("City *")).toHaveValue("Austin");
    expect(screen.getByLabelText("State *")).toHaveValue("TX");
    expect(screen.getByLabelText("ZIP code *")).toHaveValue("78701");
    expect(street).not.toHaveAttribute("aria-activedescendant");
    expect(street).toHaveAttribute("aria-expanded", "false");
  });

  it("does not send an obsolete request after a delayed library load", async () => {
    const loading = deferred<google.maps.PlacesLibrary>();
    const fetchSuggestions = vi.fn().mockResolvedValue({ suggestions: [] });
    loadGooglePlacesLibrary.mockReturnValue(loading.promise);
    render(<AddressHarness />);

    const street = screen.getByRole("combobox", { name: "Street address *" });
    fireEvent.change(street, { target: { value: "409" } });
    await finishDebounce();
    expect(loadGooglePlacesLibrary).toHaveBeenCalledTimes(1);

    fireEvent.change(street, { target: { value: "409 Main" } });
    await act(async () => loading.resolve(library(fetchSuggestions)));
    expect(fetchSuggestions).not.toHaveBeenCalled();

    await finishDebounce();
    expect(fetchSuggestions).toHaveBeenCalledTimes(1);
    expect(fetchSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({ input: "409 Main" }),
    );
  });

  it("ignores stale suggestion responses", async () => {
    const first = deferred<{ suggestions: google.maps.places.AutocompleteSuggestion[] }>();
    const second = deferred<{ suggestions: google.maps.places.AutocompleteSuggestion[] }>();
    const firstSuggestion = makeSuggestion("409 Old Road").suggestion;
    const secondSuggestion = makeSuggestion("409 Main Street").suggestion;
    const fetchSuggestions = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    loadGooglePlacesLibrary.mockResolvedValue(library(fetchSuggestions));
    render(<AddressHarness />);

    const street = screen.getByRole("combobox", { name: "Street address *" });
    fireEvent.change(street, { target: { value: "409" } });
    await finishDebounce();
    fireEvent.change(street, { target: { value: "409 Main" } });
    await finishDebounce();

    await act(async () => second.resolve({ suggestions: [secondSuggestion] }));
    expect(screen.getByRole("option", { name: /409 Main Street/i })).toBeInTheDocument();
    await act(async () => first.resolve({ suggestions: [firstSuggestion] }));
    expect(screen.queryByRole("option", { name: /409 Old Road/i })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /409 Main Street/i })).toBeInTheDocument();
  });

  it("keeps manual entry usable after denial and retries the provider", async () => {
    const suggestion = makeSuggestion().suggestion;
    const fetchSuggestions = vi.fn().mockResolvedValue({ suggestions: [suggestion] });
    loadGooglePlacesLibrary
      .mockRejectedValueOnce(new Error("denied"))
      .mockResolvedValueOnce(library(fetchSuggestions));
    render(<AddressHarness />);

    const street = screen.getByRole("combobox", { name: "Street address *" });
    fireEvent.change(street, { target: { value: "409" } });
    await finishDebounce();

    expect(street).toHaveValue("409");
    expect(screen.getByText(/Address suggestions are unavailable/i)).toBeInTheDocument();
    expect(screen.getByLabelText("City *")).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await finishDebounce();

    expect(loadGooglePlacesLibrary).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("option", { name: /409 Main Street/i })).toBeInTheDocument();
  });

  it("keeps the owned suggestions interactive inside a modal dialog", async () => {
    const suggestion = makeSuggestion().suggestion;
    loadGooglePlacesLibrary.mockResolvedValue(
      library(vi.fn().mockResolvedValue({ suggestions: [suggestion] })),
    );
    render(<AddressHarness inDialog />);

    const dialog = screen.getByRole("dialog");
    const street = within(dialog).getByRole("combobox", { name: "Street address *" });
    fireEvent.change(street, { target: { value: "409" } });
    await finishDebounce();

    const option = within(dialog).getByRole("option", { name: /409 Main Street/i });
    fireEvent.mouseDown(option);
    fireEvent.click(option);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(street).toHaveValue("409 Main Street");
  });
});
