import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect, type MultiSelectOption } from "../multi-select";

const OPTIONS: MultiSelectOption[] = [
  { value: "ana", label: "Ana" },
  { value: "bruno", label: "Bruno" },
  { value: "carla", label: "Carla", disabled: true },
];

function Harness({ onChange }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelect
      ariaLabel="People"
      value={value}
      options={OPTIONS}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("MultiSelect", () => {
  it("opens on focus and lists the options", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "People" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.focus(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters by the search text", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "br" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Bruno"]);
  });

  it("shows the empty message when nothing matches", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("toggles values and stays open", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Ana" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Bruno" }));
    expect(screen.getByRole("option", { name: "Ana" })).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseDown(screen.getByRole("option", { name: "Ana" }));
    expect(onChange.mock.calls).toEqual([[["ana"]], [["ana", "bruno"]], [["bruno"]]]);
  });

  it("ignores disabled options", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Carla" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("picks with the keyboard and removes the last value with Backspace", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange.mock.calls).toEqual([[["ana"]], [[]]]);
  });

  it("closes on Escape", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
