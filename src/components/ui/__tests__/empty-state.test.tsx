import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("always renders the title", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<EmptyState title="Nothing here" description="Add your first item" />);
    expect(screen.getByText("Add your first item")).toBeInTheDocument();
  });

  it("omits the description when absent", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.queryByText("Add your first item")).not.toBeInTheDocument();
  });

  it("renders the icon when provided", () => {
    render(<EmptyState title="Nothing here" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders the action when provided", () => {
    render(<EmptyState title="Nothing here" action={<button>Create</button>} />);
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("merges a custom className onto the wrapper", () => {
    const { container } = render(<EmptyState title="Nothing here" className="py-4" />);
    expect(container.firstChild).toHaveClass("py-4");
  });
});
