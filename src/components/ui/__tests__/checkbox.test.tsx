import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  it("renders with the checkbox role", () => {
    render(<Checkbox aria-label="Accept" />);
    expect(screen.getByRole("checkbox", { name: "Accept" })).toBeInTheDocument();
  });

  it("toggles aria-checked and data-state on click", () => {
    render(<Checkbox aria-label="Accept" />);
    const checkbox = screen.getByRole("checkbox", { name: "Accept" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("fires onCheckedChange with the new state", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Accept" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects the controlled checked prop", () => {
    render(<Checkbox aria-label="Accept" checked onCheckedChange={() => {}} />);
    const checkbox = screen.getByRole("checkbox", { name: "Accept" });
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("disables the checkbox", () => {
    render(<Checkbox aria-label="Accept" disabled />);
    expect(screen.getByRole("checkbox", { name: "Accept" })).toBeDisabled();
  });

  it("forwards className", () => {
    render(<Checkbox aria-label="Accept" className="custom-checkbox" />);
    expect(screen.getByRole("checkbox", { name: "Accept" })).toHaveClass(
      "custom-checkbox",
    );
  });
});
