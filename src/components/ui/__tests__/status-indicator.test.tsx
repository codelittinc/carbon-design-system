import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusIndicator } from "../status-indicator";

describe("StatusIndicator", () => {
  it("names the dot by its label when the label is not shown", () => {
    render(<StatusIndicator color="var(--color-chart-2)" label="Currently working" />);
    const dot = screen.getByRole("img", { name: "Currently working" });
    expect(dot).toHaveAttribute("title", "Currently working");
    expect(dot.style.backgroundColor).toBe("var(--color-chart-2)");
    expect(screen.queryByText("Currently working")).not.toBeInTheDocument();
  });

  it("shows the label as text, and hides the dot, with showLabel", () => {
    render(<StatusIndicator color="red" label="Blocked" showLabel />);
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("sizes the dot", () => {
    render(<StatusIndicator color="red" label="Blocked" size="sm" />);
    expect(screen.getByRole("img")).toHaveClass("size-3");
  });

  it("drops the native title for use inside a Tooltip, keeping the name", () => {
    render(<StatusIndicator color="red" label="Blocked" nativeTitle={false} />);
    const dot = screen.getByRole("img", { name: "Blocked" });
    expect(dot).not.toHaveAttribute("title");
  });
});
