import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem, type RadioGroupOption } from "../radio-group";

const OPTIONS: RadioGroupOption[] = [
  { value: "a", label: "Yardi" },
  { value: "b", label: "EliseAI" },
  { value: "c", label: "Gusto", disabled: true },
];

function Harness({ initial = "", onChange }: { initial?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <form data-testid="form">
      <RadioGroup
        aria-label="Answer"
        name="answer"
        options={OPTIONS}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
      />
    </form>
  );
}

describe("RadioGroup", () => {
  it("is a radiogroup of radios named by their labels", () => {
    render(<Harness initial="b" />);
    expect(screen.getByRole("radiogroup", { name: "Answer" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Yardi" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "EliseAI" })).toHaveAttribute("aria-checked", "true");
  });

  it("chooses one value at a time, from the radio or its label", () => {
    const onChange = vi.fn();
    render(<Harness initial="b" onChange={onChange} />);
    fireEvent.click(screen.getByText("Yardi"));
    expect(onChange).toHaveBeenLastCalledWith("a");
    expect(screen.getByRole("radio", { name: "Yardi" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "EliseAI" })).toHaveAttribute("aria-checked", "false");
  });

  it("starts with nothing chosen", () => {
    render(<Harness />);
    screen.getAllByRole("radio").forEach((r) => expect(r).toHaveAttribute("aria-checked", "false"));
  });

  it("disables one option, or all of them", () => {
    const { unmount } = render(<Harness />);
    expect(screen.getByRole("radio", { name: "Gusto" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Yardi" })).toBeEnabled();
    unmount();

    render(<RadioGroup options={OPTIONS} value="" onChange={() => {}} disabled />);
    screen.getAllByRole("radio").forEach((r) => expect(r).toBeDisabled());
  });

  it("takes RadioGroupItem children for rows that need more than a label", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Correct answer" value="0" onChange={onChange}>
        {["First", "Second"].map((text, i) => (
          <div key={text}>
            <RadioGroupItem value={String(i)} aria-label={`${text} is correct`} />
            <input defaultValue={text} />
          </div>
        ))}
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "First is correct" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Second is correct" }));
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("lays out vertically by default", () => {
    render(<RadioGroup options={OPTIONS} value="" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup")).toHaveClass("flex-col");
  });
});
