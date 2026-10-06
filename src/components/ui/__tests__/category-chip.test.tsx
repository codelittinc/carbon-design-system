import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryChip } from "../category-chip";

const SEGMENTS = [{ color: "var(--color-category-1)" }, { color: "var(--color-category-2)" }];

describe("CategoryChip", () => {
  it("is a button named by its aria-label, with the label as text", () => {
    render(<CategoryChip segments={SEGMENTS} label="Jane D." aria-label="Jane Doe, two projects" />);
    const chip = screen.getByRole("button", { name: "Jane Doe, two projects" });
    expect(chip).toHaveTextContent("Jane D.");
    expect(chip).toHaveAttribute("type", "button");
  });

  it("draws one band per segment, hidden from assistive tech", () => {
    const { container } = render(<CategoryChip segments={SEGMENTS} label="Jane" />);
    const bands = container.querySelectorAll<HTMLElement>("[aria-hidden='true'] > span");
    expect(bands).toHaveLength(2);
    expect(bands[0].style.backgroundColor).toBe("var(--color-category-1)");
  });

  it("forwards the ref and button attributes", () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(<CategoryChip ref={ref} segments={SEGMENTS} label="Jane" onClick={onClick} aria-expanded />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("is a Button, so it takes Button's focus ring and disabled state", () => {
    render(<CategoryChip segments={SEGMENTS} label="Jane" disabled />);
    const chip = screen.getByRole("button");
    expect(chip.className).toContain("focus-visible:ring-accent/50");
    expect(chip).toBeDisabled();
  });
});
