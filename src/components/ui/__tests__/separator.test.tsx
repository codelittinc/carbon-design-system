import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "../separator";

describe("Separator", () => {
  it("is decorative by default (role none, no separator role)", () => {
    const { container } = render(<Separator />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    // Decorative separators expose role="none".
    expect(container.querySelector('[role="none"]')).toBeInTheDocument();
  });

  it("exposes the separator role when not decorative", () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("defaults to horizontal orientation", () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("reflects vertical orientation", () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("forwards className", () => {
    render(<Separator decorative={false} className="custom-separator" />);
    expect(screen.getByRole("separator")).toHaveClass("custom-separator");
  });
});
