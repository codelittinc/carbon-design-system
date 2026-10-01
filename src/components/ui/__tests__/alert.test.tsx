import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "../alert";

describe("Alert", () => {
  it("is an alert by default, with error styling", () => {
    render(<Alert>Could not load</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not load");
    expect(alert.className).toContain("bg-error-soft");
  });

  it("is a status for non-error variants", () => {
    render(<Alert variant="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("renders a title", () => {
    render(<Alert title="Heads up">Body</Alert>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("shows a dismiss button only with onDismiss", () => {
    const { rerender } = render(<Alert>Body</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    const onDismiss = vi.fn();
    rerender(<Alert onDismiss={onDismiss}>Body</Alert>);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
