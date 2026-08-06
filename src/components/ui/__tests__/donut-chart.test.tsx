import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DonutChart } from "../donut-chart";

const MIX = [
  { label: "Google Ads", value: 600 },
  { label: "Zillow", value: 300 },
  { label: "Walk-in", value: 100 },
];

describe("DonutChart", () => {
  it("lists each slice with its share of the total", () => {
    render(<DonutChart data={MIX} />);
    const legend = screen.getByRole("list");
    expect(within(legend).getByText("Google Ads")).toBeInTheDocument();
    expect(within(legend).getByText("60.0%")).toBeInTheDocument();
    expect(within(legend).getByText("30.0%")).toBeInTheDocument();
    expect(within(legend).getByText("10.0%")).toBeInTheDocument();
  });

  it("shows values instead of shares when percentages are turned off", () => {
    render(<DonutChart data={MIX} showPercentages={false} />);
    const legend = screen.getByRole("list");
    expect(within(legend).getByText("600")).toBeInTheDocument();
    expect(within(legend).queryByText("60.0%")).not.toBeInTheDocument();
  });

  it("puts the total in the hole by default", () => {
    render(<DonutChart data={MIX} centerLabel="Total leads" />);
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("Total leads")).toBeInTheDocument();
  });

  it("accepts an explicit center value", () => {
    render(<DonutChart data={MIX} centerValue="4 channels" centerLabel="Mix" />);
    expect(screen.getByText("4 channels")).toBeInTheDocument();
    expect(screen.queryByText("1,000")).not.toBeInTheDocument();
  });

  it("omits the center readout for the pie variant", () => {
    render(<DonutChart data={MIX} variant="pie" centerLabel="Total leads" />);
    expect(screen.queryByText("Total leads")).not.toBeInTheDocument();
  });

  it("folds the smallest categories into a single Other wedge", () => {
    render(
      <DonutChart
        data={[
          { label: "A", value: 50 },
          { label: "B", value: 30 },
          { label: "C", value: 10 },
          { label: "D", value: 6 },
          { label: "E", value: 4 },
        ]}
        maxSlices={3}
      />,
    );
    const legend = screen.getByRole("list");
    expect(within(legend).getByText("A")).toBeInTheDocument();
    expect(within(legend).getByText("B")).toBeInTheDocument();
    expect(within(legend).queryByText("C")).not.toBeInTheDocument();
    // C + D + E = 20 of 100.
    expect(within(legend).getByText("Other")).toBeInTheDocument();
    expect(within(legend).getByText("20.0%")).toBeInTheDocument();
  });

  it("keeps input order by default so a filter cannot repaint entities", () => {
    render(<DonutChart data={[...MIX].reverse()} />);
    const labels = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(labels[0]).toContain("Walk-in");
    expect(labels[2]).toContain("Google Ads");
  });

  it("sorts descending when asked", () => {
    render(<DonutChart data={[...MIX].reverse()} sort />);
    const labels = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(labels[0]).toContain("Google Ads");
    expect(labels[2]).toContain("Walk-in");
  });

  it("renders an accessible table of values and shares", () => {
    render(<DonutChart data={MIX} categoryLabel="Channel" />);
    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Channel" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "Zillow" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "300" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "30.0%" })).toBeInTheDocument();
  });

  it("shows a skeleton while loading", () => {
    const { container } = render(<DonutChart data={MIX} loading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an empty state with no data", () => {
    render(<DonutChart data={[]} emptyTitle="No leads to break down" />);
    expect(screen.getByText("No leads to break down")).toBeInTheDocument();
  });

  it("shows an empty state when every value is zero", () => {
    // A zero total has no parts to divide — a donut of nothing is misleading.
    render(<DonutChart data={[{ label: "A", value: 0 }]} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});
