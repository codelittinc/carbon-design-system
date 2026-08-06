import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "./bar-chart";
import { ChartCard } from "./chart";

/**
 * BarChart compares magnitude across categories. It renders the plot, an
 * optional legend, and a visually hidden data table carrying the same numbers
 * for screen readers.
 *
 * Colors come from the eight `--color-chart-*` tokens in fixed slot order. A
 * ninth series is dropped rather than recolored — the slot order is what keeps
 * adjacent series distinguishable under protanopia and deuteranopia, and a
 * repeated hue reads as a repeated entity.
 */
const meta: Meta<typeof BarChart> = {
  title: "Components/Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof BarChart>;

const LEADS_BY_PROPERTY = [
  { property: "Maple Court", leads: 412, booked: 88, attended: 61, leases: 12 },
  { property: "Harbor Point", leads: 388, booked: 71, attended: 44, leases: 9 },
  { property: "The Wren", leads: 301, booked: 64, attended: 49, leases: 11 },
  { property: "Cedar Row", leads: 244, booked: 40, attended: 22, leases: 5 },
  { property: "Iron Works", leads: 198, booked: 33, attended: 25, leases: 6 },
  { property: "Lakeside", leads: 143, booked: 21, attended: 12, leases: 3 },
];

/**
 * A single measure across categories. One hue for the whole series: bar length
 * already encodes the value, so color is not asked to repeat it. Values are
 * printed at each bar end by default.
 */
export const Default: Story = {
  args: {
    data: LEADS_BY_PROPERTY,
    categoryKey: "property",
    categoryLabel: "Property",
    series: [{ key: "leads", label: "Leads" }],
  },
  render: (args) => (
    <ChartCard title="Leads by property" subtitle="Jul 27 – Aug 2, 2026">
      <BarChart {...args} />
    </ChartCard>
  ),
};

/**
 * Long category names get a real label column instead of rotated ticks. This
 * is the better default any time names are more than a word or two.
 */
export const Horizontal: Story = {
  args: {
    data: [
      { reason: "Price too high", count: 142 },
      { reason: "Chose another property", count: 118 },
      { reason: "No response after tour", count: 87 },
      { reason: "Move-in date mismatch", count: 64 },
      { reason: "Pet policy", count: 39 },
      { reason: "Credit / income screening", count: 28 },
    ],
    categoryKey: "reason",
    categoryLabel: "Reason",
    series: [{ key: "count", label: "Lost leads" }],
    orientation: "horizontal",
    height: 240,
  },
  render: (args) => (
    <ChartCard title="Top cancellation reasons" subtitle="Last 6 weeks">
      <BarChart {...args} />
    </ChartCard>
  ),
};

/**
 * Several measures per category, side by side. Direct labels switch off
 * automatically here — a number on every bar would be unreadable — and the
 * legend carries series identity instead.
 *
 * Grouped bars only work when the measures share a scale. Plotting leads (in
 * the hundreds) beside leases (in the single digits) would flatten the leases
 * bar to nothing; that pair belongs in two charts, or as a conversion rate.
 */
export const Grouped: Story = {
  args: {
    data: LEADS_BY_PROPERTY,
    categoryKey: "property",
    categoryLabel: "Property",
    series: [
      { key: "booked", label: "Tours booked" },
      { key: "attended", label: "Tours attended" },
    ],
  },
  render: (args) => (
    <ChartCard title="Tours by property" subtitle="Jul 27 – Aug 2, 2026">
      <BarChart {...args} />
    </ChartCard>
  ),
};

/**
 * Stacked bars for a part-to-whole per category. Segments carry a 2px surface
 * ring so neighboring fills never touch, and only the top of the stack takes
 * the rounded cap.
 */
export const Stacked: Story = {
  args: {
    data: [
      { week: "Jun 29", google: 180, zillow: 140, walkIn: 60 },
      { week: "Jul 6", google: 210, zillow: 132, walkIn: 55 },
      { week: "Jul 13", google: 168, zillow: 155, walkIn: 71 },
      { week: "Jul 20", google: 224, zillow: 121, walkIn: 48 },
      { week: "Jul 27", google: 198, zillow: 149, walkIn: 66 },
    ],
    categoryKey: "week",
    categoryLabel: "Week",
    series: [
      { key: "google", label: "Google Ads" },
      { key: "zillow", label: "Zillow" },
      { key: "walkIn", label: "Walk-in" },
    ],
    stacked: true,
  },
  render: (args) => (
    <ChartCard title="Leads by channel" subtitle="Last 5 weeks">
      <BarChart {...args} />
    </ChartCard>
  ),
};

/** Clicking a bar drills into that category. The cursor changes when a handler is set. */
export const Clickable: Story = {
  args: {
    data: LEADS_BY_PROPERTY,
    categoryKey: "property",
    categoryLabel: "Property",
    series: [{ key: "leads", label: "Leads" }],
    onBarClick: (datum) => window.alert(`Drill into ${datum.property}`),
  },
  render: (args) => (
    <ChartCard title="Leads by property" subtitle="Click a bar to drill down">
      <BarChart {...args} />
    </ChartCard>
  ),
};

/**
 * `colorBy="category"` gives each bar its own palette slot. Use it only when
 * the bar colors are load-bearing elsewhere on the page — a donut of the same
 * categories beside it, say. On its own it re-encodes what bar length already
 * shows and spends the identity channel for nothing.
 */
export const ColorByCategory: Story = {
  args: {
    data: LEADS_BY_PROPERTY,
    categoryKey: "property",
    categoryLabel: "Property",
    series: [{ key: "leads", label: "Leads" }],
    colorBy: "category",
  },
  render: (args) => (
    <ChartCard title="Leads by property" subtitle="Colors shared with the channel mix donut">
      <BarChart {...args} />
    </ChartCard>
  ),
};

/** Skeleton stands in at the chart's own height, so nothing shifts on load. */
export const Loading: Story = {
  args: {
    data: [],
    categoryKey: "property",
    series: [{ key: "leads", label: "Leads" }],
    loading: true,
  },
  render: (args) => (
    <ChartCard title="Leads by property">
      <BarChart {...args} />
    </ChartCard>
  ),
};

export const Empty: Story = {
  args: {
    data: [],
    categoryKey: "property",
    series: [{ key: "leads", label: "Leads" }],
    emptyTitle: "No leads this period",
    emptyDescription: "Try widening the date range or clearing the property filter.",
  },
  render: (args) => (
    <ChartCard title="Leads by property">
      <BarChart {...args} />
    </ChartCard>
  ),
};
