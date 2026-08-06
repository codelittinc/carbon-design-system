import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LineChart } from "../line-chart";

/**
 * As with BarChart, jsdom cannot measure ResponsiveContainer, so the SVG plot
 * is absent. These cover the surrounding contract: the accessible table, the
 * legend and its toggling, and the loading and empty states.
 */
const DATA = [
  { week: "Jul 20", leads: 393, leases: 10 },
  { week: "Jul 27", leads: 413, leases: 14 },
];

const SINGLE = [{ key: "leads", label: "Leads" }];
const MULTI = [
  { key: "leads", label: "Leads" },
  { key: "leases", label: "Leases" },
];

describe("LineChart", () => {
  it("renders an accessible table carrying every plotted value", () => {
    render(<LineChart data={DATA} categoryKey="week" categoryLabel="Week" series={MULTI} />);
    const table = screen.getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "Jul 27" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "413" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "10" })).toBeInTheDocument();
  });

  it("defaults the category column to Period", () => {
    render(<LineChart data={DATA} categoryKey="week" series={SINGLE} />);
    expect(screen.getByRole("columnheader", { name: "Period" })).toBeInTheDocument();
  });

  it("shows a legend for multiple series and omits it for one", () => {
    const { unmount } = render(<LineChart data={DATA} categoryKey="week" series={MULTI} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    unmount();

    render(<LineChart data={DATA} categoryKey="week" series={SINGLE} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("hides a line when its legend entry is clicked in toggleable mode", async () => {
    render(<LineChart data={DATA} categoryKey="week" series={MULTI} toggleableSeries />);
    await userEvent.click(screen.getByRole("button", { name: "Leases" }));
    expect(screen.getByRole("button", { name: "Leases" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps at least one line plotted", async () => {
    render(<LineChart data={DATA} categoryKey="week" series={MULTI} toggleableSeries />);
    await userEvent.click(screen.getByRole("button", { name: "Leases" }));
    await userEvent.click(screen.getByRole("button", { name: "Leads" }));
    expect(screen.getByRole("button", { name: "Leads" })).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the hidden series listed in the table", async () => {
    render(<LineChart data={DATA} categoryKey="week" series={MULTI} toggleableSeries />);
    await userEvent.click(screen.getByRole("button", { name: "Leases" }));
    // Toggling is a view control, not a data filter — the table stays complete.
    expect(screen.getByRole("columnheader", { name: "Leases" })).toBeInTheDocument();
  });

  it("shows a skeleton while loading", () => {
    const { container } = render(
      <LineChart data={DATA} categoryKey="week" series={SINGLE} loading />,
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no rows", () => {
    render(
      <LineChart
        data={[]}
        categoryKey="week"
        series={SINGLE}
        emptyTitle="No activity in this range"
      />,
    );
    expect(screen.getByText("No activity in this range")).toBeInTheDocument();
  });

  it("formats table values with the supplied formatter", () => {
    render(
      <LineChart
        data={[{ week: "Jul 27", leads: 3.42 }]}
        categoryKey="week"
        series={SINGLE}
        valueFormatter={(v) => `${v.toFixed(1)}%`}
      />,
    );
    expect(screen.getByRole("cell", { name: "3.4%" })).toBeInTheDocument();
  });
});
