import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CHART_SERIES_LIMIT,
  ChartCard,
  ChartDataTable,
  ChartLegend,
  ChartTooltipContent,
  capSeries,
  formatChartValue,
  resolveSeriesColors,
  seriesColor,
} from "../chart";

describe("seriesColor", () => {
  it("maps slot index to the matching chart token", () => {
    expect(seriesColor(0)).toBe("var(--color-chart-1)");
    expect(seriesColor(7)).toBe("var(--color-chart-8)");
  });

  it("clamps past the last slot instead of cycling back to slot 1", () => {
    // Cycling would give two entities the same hue, which reads as one entity.
    expect(seriesColor(8)).toBe("var(--color-chart-8)");
    expect(seriesColor(99)).toBe("var(--color-chart-8)");
  });

  it("clamps a negative index to the first slot", () => {
    expect(seriesColor(-3)).toBe("var(--color-chart-1)");
  });
});

describe("resolveSeriesColors", () => {
  it("assigns palette slots in order", () => {
    expect(
      resolveSeriesColors([
        { key: "a", label: "A" },
        { key: "b", label: "B" },
      ]),
    ).toEqual(["var(--color-chart-1)", "var(--color-chart-2)"]);
  });

  it("honors an explicit color override", () => {
    expect(
      resolveSeriesColors([
        { key: "a", label: "A", color: "var(--color-chart-5)" },
        { key: "b", label: "B" },
      ]),
    ).toEqual(["var(--color-chart-5)", "var(--color-chart-2)"]);
  });
});

describe("capSeries", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ key: `s${i}`, label: `S${i}` }));

  it("passes through a list within the palette limit", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const series = many.slice(0, CHART_SERIES_LIMIT);
    expect(capSeries(series, "BarChart")).toBe(series);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("truncates past the limit and warns rather than truncating silently", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(capSeries(many, "BarChart")).toHaveLength(CHART_SERIES_LIMIT);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toMatch(/BarChart/);
    warn.mockRestore();
  });
});

describe("formatChartValue", () => {
  it("groups thousands", () => {
    expect(formatChartValue(1234567)).toBe("1,234,567");
  });

  it("does not pad integers with decimals", () => {
    expect(formatChartValue(12)).toBe("12");
  });
});

describe("ChartCard", () => {
  it("renders the title, subtitle, action, and footer around its children", () => {
    render(
      <ChartCard
        title="Leads by property"
        subtitle="Last 6 weeks"
        action={<button type="button">Export</button>}
        footer="Source: Raw Data"
      >
        <div>plot</div>
      </ChartCard>,
    );
    expect(screen.getByRole("heading", { name: "Leads by property" })).toBeInTheDocument();
    expect(screen.getByText("Last 6 weeks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(screen.getByText("Source: Raw Data")).toBeInTheDocument();
    expect(screen.getByText("plot")).toBeInTheDocument();
  });

  it("omits the header entirely when given no title, subtitle, or action", () => {
    render(
      <ChartCard>
        <div>plot</div>
      </ChartCard>,
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("ChartLegend", () => {
  const items = [
    { label: "Leads", color: "var(--color-chart-1)" },
    { label: "Leases", color: "var(--color-chart-2)" },
  ];

  it("labels every swatch in text, so identity is never color-alone", () => {
    render(<ChartLegend items={items} />);
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByText("Leases")).toBeInTheDocument();
  });

  it("renders static entries when no click handler is given", () => {
    render(<ChartLegend items={items} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders buttons that report pressed state when clickable", async () => {
    const onItemClick = vi.fn();
    render(<ChartLegend items={[items[0], { ...items[1], inactive: true }]} onItemClick={onItemClick} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(buttons[1]);
    expect(onItemClick).toHaveBeenCalledWith(1);
  });
});

describe("ChartTooltipContent", () => {
  const payload = [{ name: "Leads", value: 1200, color: "var(--color-chart-1)" }];

  it("renders nothing while inactive", () => {
    const { container } = render(<ChartTooltipContent payload={payload} label="Jul 27" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing with an empty payload", () => {
    const { container } = render(<ChartTooltipContent active payload={[]} label="Jul 27" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the label, series name, and formatted value when active", () => {
    render(<ChartTooltipContent active payload={payload} label="Jul 27" />);
    expect(screen.getByText("Jul 27")).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("applies a custom value formatter and label formatter", () => {
    render(
      <ChartTooltipContent
        active
        payload={[{ name: "Lease %", value: 3.4, color: "var(--color-chart-3)" }]}
        label="w27"
        valueFormatter={(v) => `${v.toFixed(1)}%`}
        labelFormatter={(l) => `Week of ${l}`}
      />,
    );
    expect(screen.getByText("Week of w27")).toBeInTheDocument();
    expect(screen.getByText("3.4%")).toBeInTheDocument();
  });
});

describe("ChartDataTable", () => {
  it("exposes every plotted value as table text", () => {
    render(
      <ChartDataTable
        caption="Leads by property"
        categoryLabel="Property"
        categories={["Maple Court", "Harbor Point"]}
        series={[
          { key: "leads", label: "Leads" },
          { key: "leases", label: "Leases" },
        ]}
        data={[
          { property: "Maple Court", leads: 412, leases: 12 },
          { property: "Harbor Point", leads: 388, leases: 9 },
        ]}
      />,
    );

    const table = screen.getByRole("table", { name: "Leads by property" });
    expect(within(table).getByRole("columnheader", { name: "Property" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "Maple Court" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "412" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "9" })).toBeInTheDocument();
  });

  it("renders an em dash for a missing value", () => {
    render(
      <ChartDataTable
        caption="Leads"
        categoryLabel="Property"
        categories={["Cedar Row"]}
        series={[{ key: "leads", label: "Leads" }]}
        data={[{ property: "Cedar Row", leads: null }]}
      />,
    );
    expect(screen.getByRole("cell", { name: "—" })).toBeInTheDocument();
  });
});
