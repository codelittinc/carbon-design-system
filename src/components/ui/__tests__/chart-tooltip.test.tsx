import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChartSliceTooltipContent, ChartTooltipContent } from "../chart";

/*
 * jsdom cannot measure ResponsiveContainer, so no chart ever reaches its
 * tooltip. Recharts is stubbed down to the one part under test: `Tooltip`
 * renders its `content` element as if the pointer were over the first row (or
 * slice), with the payload Recharts would hand it.
 */
const hovered = vi.hoisted(() => ({ props: {} as Record<string, unknown> }));
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    ...actual,
    ResponsiveContainer: Pass,
    AreaChart: Pass,
    BarChart: Pass,
    PieChart: Pass,
    Pie: () => null,
    Area: () => null,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: ({ content }: { content: ReactElement }) =>
      isValidElement(content) ? cloneElement(content, hovered.props) : null,
  };
});

const { LineChart } = await import("../line-chart");
const { BarChart } = await import("../bar-chart");
const { DonutChart } = await import("../donut-chart");

const ROW = { month: "Jan", count: 3 };
const PAYLOAD = [{ name: "Active", dataKey: "count", value: 3, color: "var(--color-chart-1)", payload: ROW }];

describe("ChartTooltipContent render", () => {
  it("hands the body the category and each series' value, color and row", () => {
    const renderBody = vi.fn(() => <p>custom body</p>);
    const { container } = render(
      <ChartTooltipContent active label="Jan" payload={PAYLOAD} render={renderBody} />,
    );
    expect(renderBody).toHaveBeenCalledWith({
      label: "Jan",
      payload: [{ key: "count", label: "Active", value: 3, color: "var(--color-chart-1)", datum: ROW }],
    });
    // In the standard shell, in place of the default rows.
    expect(screen.getByText("custom body").parentElement).toHaveClass("bg-surface-overlay", "border-border");
    expect(container.querySelector("ul")).toBeNull();
  });

  it("shows no tooltip when the body is null, or while inactive", () => {
    const { container, rerender } = render(
      <ChartTooltipContent active label="Jan" payload={PAYLOAD} render={() => null} />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<ChartTooltipContent label="Jan" payload={PAYLOAD} render={() => "x"} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ChartSliceTooltipContent", () => {
  it("hands the body the slice's row, value and color", () => {
    const slice = { label: "Acme", value: 4, color: "var(--color-chart-2)", names: ["Ana"] };
    const renderBody = vi.fn(() => "slice body");
    render(
      <ChartSliceTooltipContent active payload={[{ name: "Acme", value: 4, payload: slice }]} render={renderBody} />,
    );
    expect(renderBody).toHaveBeenCalledWith({ datum: slice, value: 4, color: "var(--color-chart-2)" });
    expect(screen.getByText("slice body")).toBeInTheDocument();
  });
});

describe("chart tooltipContent props", () => {
  hovered.props = { active: true, label: "Jan", payload: PAYLOAD };

  it("LineChart and BarChart pass it to the tooltip", () => {
    const series = [{ key: "count", label: "Active" }];
    const { unmount } = render(
      <LineChart
        data={[ROW]}
        categoryKey="month"
        series={series}
        tooltipContent={({ label, payload }) => `${label}: ${payload[0].value} contracts`}
      />,
    );
    expect(screen.getByText("Jan: 3 contracts")).toBeInTheDocument();
    unmount();

    render(
      <BarChart
        data={[ROW]}
        categoryKey="month"
        series={series}
        tooltipContent={({ payload }) => `bar ${payload[0].key}`}
      />,
    );
    expect(screen.getByText("bar count")).toBeInTheDocument();
  });

  it("leaves the default tooltip alone without it", () => {
    render(<LineChart data={[ROW]} categoryKey="month" series={[{ key: "count", label: "Active" }]} />);
    // The default body lists the series by name.
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
  });

  it("DonutChart passes it the slice", () => {
    const data = [{ label: "Acme", value: 4 }];
    hovered.props = { active: true, payload: [{ name: "Acme", value: 4, payload: { ...data[0], color: "var(--color-chart-1)" } }] };
    render(
      <DonutChart data={data} tooltipContent={({ datum, value }) => `${datum.label} has ${value}`} />,
    );
    expect(screen.getByText("Acme has 4")).toBeInTheDocument();
  });
});
