import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BarChart } from "../bar-chart";
import { LineChart } from "../line-chart";
import { DonutChart } from "../donut-chart";

/**
 * Guards the data-isolation contract: a chart must not let its rendering
 * library take ownership of the array the consumer passed in.
 *
 * Recharts keeps chart data in a Redux store, and Redux Toolkit's immer
 * deep-freezes store state in development. Handing it the caller's array
 * directly therefore freezes that array *and its row objects* in place — a
 * mutation of the consumer's own props. It broke Storybook (whose arg
 * processing writes into array args, throwing "Cannot assign to read only
 * property '0' of object '[object Array]'"), and would equally break any app
 * that reuses or mutates its data after rendering.
 *
 * The other chart test files cannot catch this: jsdom gives ResponsiveContainer
 * zero size, so Recharts never mounts and never reaches its store. Here
 * ResponsiveContainer is replaced with a passthrough that injects real
 * dimensions into the chart element, so the chart mounts for real and the
 * freeze would actually happen if the data were passed through directly.
 */
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 300 } as never),
  };
});

const SERIES = [{ key: "leads", label: "Leads" }];

describe("charts do not freeze the caller's data", () => {
  it("BarChart leaves the input array and rows mutable", () => {
    const rows = [
      { property: "Maple Court", leads: 412 },
      { property: "Harbor Point", leads: 388 },
    ];
    render(<BarChart data={rows} categoryKey="property" series={SERIES} />);

    expect(Object.isFrozen(rows)).toBe(false);
    expect(Object.isFrozen(rows[0])).toBe(false);
    // The consumer still owns these objects.
    rows[0].leads = 999;
    expect(rows[0].leads).toBe(999);
  });

  it("LineChart leaves the input array and rows mutable", () => {
    const rows = [
      { week: "Jul 20", leads: 393 },
      { week: "Jul 27", leads: 413 },
    ];
    render(<LineChart data={rows} categoryKey="week" series={SERIES} />);

    expect(Object.isFrozen(rows)).toBe(false);
    expect(Object.isFrozen(rows[0])).toBe(false);
  });

  it("DonutChart leaves the input array and rows mutable", () => {
    const rows = [
      { label: "Google Ads", value: 600 },
      { label: "Zillow", value: 300 },
    ];
    render(<DonutChart data={rows} />);

    expect(Object.isFrozen(rows)).toBe(false);
    expect(Object.isFrozen(rows[0])).toBe(false);
  });
});
