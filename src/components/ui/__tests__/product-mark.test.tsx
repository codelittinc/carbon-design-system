import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductMark } from "../product-mark";

describe("ProductMark", () => {
  it("draws the initial in the accent square and the name beside it", () => {
    const { container } = render(<ProductMark name="Reimbursements" />);
    const square = container.querySelector('[aria-hidden="true"]');
    expect(square).toHaveTextContent("R");
    expect(square).toHaveClass("bg-accent", "text-accent-foreground");
    expect(screen.getByText("Reimbursements")).not.toHaveClass("sr-only");
  });

  it("takes an explicit initial", () => {
    const { container } = render(<ProductMark name="Delinquency Center" initial="d" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("D");
  });

  it("keeps the name for screen readers when compact", () => {
    render(
      <a href="/">
        <ProductMark name="Reimbursements" compact />
      </a>,
    );
    expect(screen.getByText("Reimbursements")).toHaveClass("sr-only");
    expect(screen.getByRole("link", { name: "Reimbursements" })).toBeInTheDocument();
  });
});
