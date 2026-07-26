import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("renders with the base pulse classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("animate-pulse");
  });

  it("merges a custom className with the base classes", () => {
    const { container } = render(<Skeleton className="h-7 w-24" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("h-7");
    expect(el).toHaveClass("w-24");
    expect(el).toHaveClass("animate-pulse");
  });

  it("forwards arbitrary props to the underlying element", () => {
    render(<Skeleton data-testid="sk" aria-label="loading" />);
    const el = screen.getByTestId("sk");
    expect(el).toHaveAttribute("aria-label", "loading");
  });
});
