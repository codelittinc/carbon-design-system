import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BarChart } from "../bar-chart";

/**
 * jsdom gives ResponsiveContainer no measurable width, so the SVG plot itself
 * does not render here. These tests cover what the component owns around the
 * plot — the accessible table, the legend, the loading and empty states — which
 * is also the part that must hold when the chart cannot be seen at all.
 */
const DATA = [
  { property: "Maple Court", leads: 412, leases: 12 },
  { property: "Harbor Point", leads: 388, leases: 9 },
];

const SINGLE = [{ key: "leads", label: "Leads" }];
const MULTI = [
  { key: "leads", label: "Leads" },
  { key: "leases", label: "Leases" },
];

describe("BarChart", () => {
  it("renders an accessible table carrying every plotted value", () => {
    render(
      <BarChart data={DATA} categoryKey="property" categoryLabel="Property" series={MULTI} />,
    );
    const table = screen.getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "Maple Court" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "412" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "12" })).toBeInTheDocument();
  });

  it("captions the table from the series and category names", () => {
    render(
      <BarChart data={DATA} categoryKey="property" categoryLabel="Property" series={SINGLE} />,
    );
    expect(screen.getByRole("table", { name: "Leads by Property" })).toBeInTheDocument();
  });

  it("uses an explicit table caption when given one", () => {
    render(
      <BarChart
        data={DATA}
        categoryKey="property"
        series={SINGLE}
        tableCaption="Weekly leads per property"
      />,
    );
    expect(screen.getByRole("table", { name: "Weekly leads per property" })).toBeInTheDocument();
  });

  it("shows a legend for multiple series", () => {
    render(<BarChart data={DATA} categoryKey="property" series={MULTI} />);
    const legend = screen.getByRole("list");
    expect(within(legend).getByText("Leads")).toBeInTheDocument();
    expect(within(legend).getByText("Leases")).toBeInTheDocument();
  });

  it("omits the legend for a single series, which the title already names", () => {
    render(<BarChart data={DATA} categoryKey="property" series={SINGLE} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("can be forced to show a legend for a single series", () => {
    render(<BarChart data={DATA} categoryKey="property" series={SINGLE} legend />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("hides a series when its legend entry is clicked in toggleable mode", async () => {
    render(<BarChart data={DATA} categoryKey="property" series={MULTI} toggleableSeries />);
    const leases = screen.getByRole("button", { name: "Leases" });
    expect(leases).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(leases);
    expect(screen.getByRole("button", { name: "Leases" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps at least one series plotted", async () => {
    render(<BarChart data={DATA} categoryKey="property" series={MULTI} toggleableSeries />);
    await userEvent.click(screen.getByRole("button", { name: "Leases" }));
    await userEvent.click(screen.getByRole("button", { name: "Leads" }));

    // The second toggle is refused — an empty chart is not a useful state.
    expect(screen.getByRole("button", { name: "Leads" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a skeleton while loading and no table", () => {
    const { container } = render(
      <BarChart data={DATA} categoryKey="property" series={SINGLE} loading />,
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no rows", () => {
    render(
      <BarChart
        data={[]}
        categoryKey="property"
        series={SINGLE}
        emptyTitle="No leads this period"
        emptyDescription="Widen the date range."
      />,
    );
    expect(screen.getByText("No leads this period")).toBeInTheDocument();
    expect(screen.getByText("Widen the date range.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are rows but no series", () => {
    render(<BarChart data={DATA} categoryKey="property" series={[]} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("formats table values with the supplied formatter", () => {
    render(
      <BarChart
        data={[{ property: "Maple Court", leads: 0.342 }]}
        categoryKey="property"
        series={SINGLE}
        valueFormatter={(v) => `${(v * 100).toFixed(1)}%`}
      />,
    );
    expect(screen.getByRole("cell", { name: "34.2%" })).toBeInTheDocument();
  });
});
