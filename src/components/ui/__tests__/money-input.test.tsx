import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MoneyInput } from "../money-input";

function Harness({
  initial = "",
  onChangeSpy,
}: {
  initial?: string;
  onChangeSpy?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <MoneyInput
      value={value}
      onChange={(v) => {
        onChangeSpy?.(v);
        setValue(v);
      }}
    />
  );
}

describe("MoneyInput", () => {
  it("renders the $ prefix", () => {
    render(<Harness />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("strips a lingering leading zero while typing (05 -> 5)", async () => {
    const onChange = vi.fn();
    render(<Harness onChangeSpy={onChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "05");
    expect(input).toHaveValue("5");
    expect(onChange).toHaveBeenLastCalledWith("5");
  });

  it("keeps a multi-digit whole number intact (150 stays 150)", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "150");
    expect(input).toHaveValue("150");
  });

  it("keeps a lone zero", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "0");
    expect(input).toHaveValue("0");
  });

  it("keeps the leading zero in 0.50", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "0.50");
    expect(input).toHaveValue("0.50");
  });

  it("handles a negative raw value", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "-5");
    expect(input).toHaveValue("-5");
  });

  it("shows the raw value while focused and formats to two decimals on blur", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "1234.5");
    // still focused -> raw
    expect(input).toHaveValue("1234.5");
    await userEvent.tab();
    // blurred -> formatted
    expect(input).toHaveValue("1,234.50");
  });

  it("formats a negative value into parentheses on blur", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "-5");
    expect(input).toHaveValue("-5");
    await userEvent.tab();
    expect(input).toHaveValue("(5.00)");
  });
});
