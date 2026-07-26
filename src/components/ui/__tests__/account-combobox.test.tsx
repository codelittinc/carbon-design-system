import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AccountCombobox, type AccountOption } from "../account-combobox";

const ACCOUNTS: AccountOption[] = [
  { id: "1", accountNumber: "1-5730-0000", name: "Prepaid Rent" },
  { id: "2", accountNumber: "2-4000-0000", name: "Revenue" },
  { id: "3", accountNumber: "3-6000-0000", name: "Prepaid Insurance" },
];

function Harness(props: {
  onChange?: (id: string) => void;
  clearable?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(props.initialValue ?? "");
  return (
    <AccountCombobox
      accounts={ACCOUNTS}
      value={value}
      onChange={(id) => {
        setValue(id);
        props.onChange?.(id);
      }}
      clearable={props.clearable}
    />
  );
}

describe("AccountCombobox", () => {
  it("exposes a combobox whose aria-expanded reflects open state", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.focus(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("filters accounts by name (case-insensitive)", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "prepaid" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(screen.getByText("Prepaid Rent")).toBeInTheDocument();
    expect(screen.getByText("Prepaid Insurance")).toBeInTheDocument();
    expect(screen.queryByText("Revenue")).not.toBeInTheDocument();
  });

  it("filters accounts by account number", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "4000" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("supports ArrowDown keyboard navigation then Enter to select", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    // highlight starts at index 0; move to index 1 then select.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("selecting an option via click calls onChange(id)", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.click(screen.getByText("Prepaid Insurance"));
    expect(onChange).toHaveBeenCalledWith("3");
  });

  it("renders the selected account as '{number} — {name}' when closed", () => {
    render(<Harness initialValue="1" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("1-5730-0000 — Prepaid Rent");
  });

  it("shows a clear button that calls onChange('')", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} clearable initialValue="1" />);
    fireEvent.click(screen.getByRole("button", { name: "Clear account" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("closes 150ms after blur", () => {
    vi.useFakeTimers();
    try {
      render(<Harness />);
      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      expect(input).toHaveAttribute("aria-expanded", "true");
      fireEvent.blur(input);
      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(input).toHaveAttribute("aria-expanded", "true");
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(input).toHaveAttribute("aria-expanded", "false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows 'No matching accounts' when nothing matches the filter", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzzzz" } });
    expect(screen.getByText("No matching accounts")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
