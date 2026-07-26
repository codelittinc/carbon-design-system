import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "../badge";

describe("Badge", () => {
  it("applies the default variant classes when none is passed", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-surface-overlay");
    expect(badge).toHaveClass("text-text-secondary");
  });

  it("maps each variant to its class fragment", () => {
    const { rerender } = render(<Badge variant="success">S</Badge>);
    expect(screen.getByText("S")).toHaveClass("bg-green-500/15");

    rerender(<Badge variant="error">E</Badge>);
    expect(screen.getByText("E")).toHaveClass("bg-red-500/15");

    rerender(<Badge variant="info">I</Badge>);
    expect(screen.getByText("I")).toHaveClass("bg-blue-500/15");

    rerender(<Badge variant="accent">A</Badge>);
    expect(screen.getByText("A")).toHaveClass("text-accent-text");
  });

  it("forwards className and span props", () => {
    render(
      <Badge className="extra" id="my-badge" data-testid="badge">
        Tagged
      </Badge>,
    );
    const badge = screen.getByTestId("badge");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveClass("extra");
    expect(badge).toHaveAttribute("id", "my-badge");
  });

  it("exposes badgeVariants returning a string containing the variant class", () => {
    const result = badgeVariants({ variant: "success" });
    expect(typeof result).toBe("string");
    expect(result).toContain("bg-green-500/15");
    expect(badgeVariants()).toContain("bg-surface-overlay");
  });
});
