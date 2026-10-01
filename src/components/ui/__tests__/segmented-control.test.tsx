import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../segmented-control";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function Harness({ initial = null, onChange }: { initial?: string | null; onChange?: (v: string) => void }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <form data-testid="form">
      <SegmentedControl
        aria-label="Letter"
        name="letter"
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

describe("SegmentedControl", () => {
  it("is a radio group with the chosen option checked", () => {
    render(<Harness initial="b" />);
    expect(screen.getByRole("radiogroup", { name: "Letter" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveAttribute("aria-checked", "false");
  });

  it("has one Tab stop, the first segment when nothing is chosen", () => {
    render(<Harness />);
    const tabbable = screen.getAllByRole("radio").filter((r) => r.tabIndex === 0);
    expect(tabbable.map((r) => r.textContent)).toEqual(["Alpha"]);
  });

  it("chooses on click, and not again for the current value", () => {
    const onChange = vi.fn();
    render(<Harness initial="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Alpha" }));
    fireEvent.click(screen.getByRole("radio", { name: "Gamma" }));
    expect(onChange.mock.calls).toEqual([["c"]]);
  });

  it("moves the choice with the arrow keys, wrapping", () => {
    const onChange = vi.fn();
    render(<Harness initial="c" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radio", { name: "Gamma" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("a");
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveFocus();
  });

  it("submits the value through a hidden input", () => {
    render(<Harness initial="b" />);
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("letter")).toBe("b");
  });

  it("keeps every label whole: a segment never shrinks below its text", () => {
    // jsdom has no layout, so this pins the class that does it. Button lets a
    // label truncate; a segment must not.
    render(<Harness />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.className.split(/\s+/)).toContain("min-w-max");
      expect(radio.className.split(/\s+/)).not.toContain("min-w-0");
    }
  });
});
