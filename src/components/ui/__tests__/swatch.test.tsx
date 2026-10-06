import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Swatch } from "../swatch";

describe("Swatch", () => {
  it("is decoration, hidden from assistive tech, without a label", () => {
    const { container } = render(<Swatch color="var(--color-chart-1)" />);
    const dot = container.firstElementChild as HTMLElement;
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass("size-2", "rounded-full");
    expect(dot.style.backgroundColor).toBe("var(--color-chart-1)");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("is a named image with a label", () => {
    render(<Swatch color="red" label="Overdue" size="md" />);
    expect(screen.getByRole("img", { name: "Overdue" })).toHaveClass("size-4");
  });

  it("dims", () => {
    const { container } = render(<Swatch color="red" dimmed />);
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.35");
  });
});
