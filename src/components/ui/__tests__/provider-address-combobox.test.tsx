import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddressAutocomplete } from "../address-combobox";
import type {
  AddressComboboxProps,
  AddressSuggestion,
  AddressSuggestionProvider,
} from "../address-combobox-types";
const loadGooglePlacesLibrary = vi.hoisted(() => vi.fn());
vi.mock("@/lib/google-places", () => ({ loadGooglePlacesLibrary }));
function Field(props: Omit<AddressComboboxProps, "value" | "onChange">) {
  const [value, setValue] = useState("");
  return <AddressAutocomplete {...props} value={value} onChange={setValue} />;
}
async function advance(ms = 250) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
describe("provider-backed addresses", () => {
  it("debounces after three characters, selects by keyboard and never loads Google scripts", async () => {
    let resolve!: (value: AddressSuggestion[]) => void;
    const provider = vi.fn(
      () =>
        new Promise<AddressSuggestion[]>((r) => {
          resolve = r;
        }),
    );
    const selected = vi.fn(),
      status = vi.fn();
    render(
      <Field
        fetchSuggestions={provider}
        onSelect={selected}
        onStatusChange={status}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Ma" } });
    await advance();
    expect(provider).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "Main" } });
    await advance(249);
    expect(provider).not.toHaveBeenCalled();
    await advance(1);
    expect(status).toHaveBeenCalledWith("loading");
    await act(async () =>
      resolve([
        { id: "one", address: "100 Main St", secondaryText: "Chicago" },
      ]),
    );
    expect(screen.getByRole("option")).toHaveTextContent("100 Main St");
    expect(status).toHaveBeenCalledWith("ready");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("100 Main St");
    expect(selected).toHaveBeenCalledWith("100 Main St");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(
      document.querySelector('script[src*="maps.googleapis.com"]'),
    ).toBeNull();
    expect(loadGooglePlacesLibrary).not.toHaveBeenCalled();
  });
  it("aborts stale requests and ignores an old response arriving after a newer query", async () => {
    let resolveOld!: (value: AddressSuggestion[]) => void;
    const provider = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValue([{ id: "new", address: "New address" }]);
    render(<Field fetchSuggestions={provider} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Old" } });
    await advance();
    const signal = provider.mock.calls[0][1].signal as AbortSignal;
    fireEvent.change(input, { target: { value: "New" } });
    expect(signal.aborted).toBe(true);
    await advance();
    await act(async () => resolveOld([{ id: "old", address: "Old address" }]));
    expect(screen.getByRole("option")).toHaveTextContent("New address");
    expect(screen.queryByText("Old address")).toBeNull();
  });
  it("keeps manual entry available after failure and Retry reruns the provider", async () => {
    const provider = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);
    render(<Field fetchSuggestions={provider} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Manual address" } });
    await advance();
    expect(input).toHaveValue("Manual address");
    expect(screen.getByRole("status")).toHaveTextContent("unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await advance();
    expect(provider).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("No matches");
  });
  it("times out even a provider ignoring AbortSignal, reports status, and supports shared host copy", async () => {
    const provider = vi.fn<AddressSuggestionProvider>(
        () => new Promise<readonly AddressSuggestion[]>(() => {}),
      ),
      status = vi.fn();
    render(
      <Field
        fetchSuggestions={provider}
        onStatusChange={status}
        showStatus={false}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Main" } });
    await advance();
    await advance(10000);
    expect(status).toHaveBeenCalledWith("unavailable");
    expect(provider.mock.calls[0][1].signal.aborted).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();
    expect(input).toHaveValue("Main");
  });
  it("blur/unmount cancel lookups and disabled inputs do not search", async () => {
    const provider = vi.fn(async () => [{ id: "one", address: "Address" }]);
    const { unmount } = render(<Field fetchSuggestions={provider} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Main" } });
    fireEvent.blur(input);
    await advance();
    expect(provider).not.toHaveBeenCalled();
    fireEvent.focus(input);
    unmount();
    await advance();
    expect(provider).not.toHaveBeenCalled();
    render(<Field disabled fetchSuggestions={provider} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});

it("the default Google mode preserves structured callbacks and adds formatted selection/status callbacks", async () => {
  const place = {
    addressComponents: [],
    formattedAddress: "100 Main St, Chicago, IL",
    fetchFields: vi.fn(async () => {}),
  };
  const prediction = {
    placeId: "one",
    text: { toString: () => "100 Main St" },
    toPlace: () => place,
  };
  loadGooglePlacesLibrary.mockResolvedValue({
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: async () => ({
        suggestions: [{ placePrediction: prediction }],
      }),
    },
  });
  const selected = vi.fn(),
    status = vi.fn();
  render(<Field onSelect={selected} onStatusChange={status} />);
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "Main" } });
  await advance();
  fireEvent.click(screen.getByRole("option"));
  await advance(0);
  expect(input).toHaveValue("100 Main St, Chicago, IL");
  expect(selected).toHaveBeenCalledWith("100 Main St, Chicago, IL");
  expect(status).toHaveBeenCalledWith("ready");
  expect(place.fetchFields).toHaveBeenCalledWith({
    fields: ["addressComponents", "formattedAddress"],
  });
});
