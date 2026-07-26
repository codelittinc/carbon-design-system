import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../switch";

describe("Switch", () => {
  it("renders with the switch role", () => {
    render(<Switch aria-label="Wifi" />);
    expect(screen.getByRole("switch", { name: "Wifi" })).toBeInTheDocument();
  });

  it("toggles aria-checked on click", () => {
    render(<Switch aria-label="Wifi" />);
    const toggle = screen.getByRole("switch", { name: "Wifi" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("fires onCheckedChange with the new state", () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wifi" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Wifi" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects the controlled checked prop", () => {
    render(<Switch aria-label="Wifi" checked onCheckedChange={() => {}} />);
    const toggle = screen.getByRole("switch", { name: "Wifi" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("disables the switch", () => {
    render(<Switch aria-label="Wifi" disabled />);
    expect(screen.getByRole("switch", { name: "Wifi" })).toBeDisabled();
  });

  it("forwards className", () => {
    render(<Switch aria-label="Wifi" className="custom-switch" />);
    expect(screen.getByRole("switch", { name: "Wifi" })).toHaveClass(
      "custom-switch",
    );
  });
});
