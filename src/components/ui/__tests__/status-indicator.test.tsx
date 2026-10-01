import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusIndicator, StatusLegend } from "../status-indicator";

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
    expect(screen.getByRole("img")).toHaveClass("h-3", "w-3");
  });
});

describe("StatusLegend", () => {
  it("lists one swatch and label per item", () => {
    render(
      <StatusLegend
        items={[
          { color: "var(--color-chart-1)", label: "Started hiring" },
          { color: "var(--color-chart-3)", label: "Completed hiring" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["Started hiring", "Completed hiring"]);
    expect((items[1].firstChild as HTMLElement).style.backgroundColor).toBe("var(--color-chart-3)");
  });
});
