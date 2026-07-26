import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Money } from "../money";

describe("Money", () => {
  it("renders the formatMoney output for a number", () => {
    render(<Money value={1234.5} />);
    expect(screen.getByText("$1,234.50")).toBeInTheDocument();
  });

  it("renders the formatMoney output for a decimal string", () => {
    render(<Money value="12.5" />);
    expect(screen.getByText("$12.50")).toBeInTheDocument();
  });

  it("renders $0.00 for null and undefined", () => {
    const { rerender } = render(<Money value={null} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    rerender(<Money value={undefined} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("applies text-error for negative values only when colorNegative is set", () => {
    render(<Money value={-5} colorNegative data-testid="neg" />);
    expect(screen.getByTestId("neg")).toHaveTextContent("($5.00)");
    expect(screen.getByTestId("neg")).toHaveClass("text-error");
  });

  it("does not apply text-error to positive values even with colorNegative", () => {
    render(<Money value={5} colorNegative data-testid="pos" />);
    expect(screen.getByTestId("pos")).not.toHaveClass("text-error");
  });

  it("does not apply text-error to negative values without colorNegative", () => {
    render(<Money value={-5} data-testid="plain" />);
    expect(screen.getByTestId("plain")).toHaveTextContent("($5.00)");
    expect(screen.getByTestId("plain")).not.toHaveClass("text-error");
  });

  it("forwards className and span props", () => {
    render(<Money value={1} className="extra" id="amount" data-testid="m" />);
    const span = screen.getByTestId("m");
    expect(span.tagName).toBe("SPAN");
    expect(span).toHaveClass("extra");
    expect(span).toHaveAttribute("id", "amount");
  });
});
