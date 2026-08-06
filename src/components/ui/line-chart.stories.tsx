import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./line-chart";
import { ChartCard } from "./chart";

/**
 * LineChart tracks measures over time. Multiple series share one y-axis by
 * design — there is no second axis, because where two differently-scaled lines
 * cross is an artifact of the scaling, not a fact about the data. Two measures
 * of different magnitude belong in two charts, or indexed to a common base.
 */
const meta: Meta<typeof LineChart> = {
  title: "Components/Charts/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof LineChart>;

const WEEKLY_FUNNEL = [
  { week: "Jun 22", leads: 366, booked: 74, attended: 51, leases: 8 },
  { week: "Jun 29", leads: 380, booked: 81, attended: 60, leases: 11 },
  { week: "Jul 6", leads: 397, booked: 69, attended: 47, leases: 7 },
  { week: "Jul 13", leads: 394, booked: 92, attended: 66, leases: 13 },
  { week: "Jul 20", leads: 393, booked: 85, attended: 58, leases: 10 },
  { week: "Jul 27", leads: 413, booked: 97, attended: 72, leases: 14 },
];

/** Several measures on one scale, with a legend and a hover tooltip. */
export const Default: Story = {
  args: {
    data: WEEKLY_FUNNEL,
    categoryKey: "week",
    categoryLabel: "Week",
    series: [
      { key: "leads", label: "Leads" },
      { key: "booked", label: "Tours booked" },
      { key: "attended", label: "Tours attended" },
      { key: "leases", label: "Leases" },
    ],
  },
  render: (args) => (
    <ChartCard title="Weekly trend" subtitle="Last 6 weeks">
      <LineChart {...args} />
    </ChartCard>
  ),
};

/**
 * A single series needs no legend — the card title names the measure. Here the
 * y-axis and tooltip are formatted as percentages, and a reference rule marks
 * the portfolio target.
 */
export const ConversionRates: Story = {
  args: {
    data: [
      { week: "Jun 22", bookedPct: 20.2, attendedPct: 13.9, leasePct: 2.2 },
      { week: "Jun 29", bookedPct: 21.3, attendedPct: 15.8, leasePct: 2.9 },
      { week: "Jul 6", bookedPct: 17.4, attendedPct: 11.8, leasePct: 1.8 },
      { week: "Jul 13", bookedPct: 23.4, attendedPct: 16.8, leasePct: 3.3 },
      { week: "Jul 20", bookedPct: 21.6, attendedPct: 14.8, leasePct: 2.5 },
      { week: "Jul 27", bookedPct: 23.5, attendedPct: 17.4, leasePct: 3.4 },
    ],
    categoryKey: "week",
    categoryLabel: "Week",
    series: [
      { key: "bookedPct", label: "Booked %" },
      { key: "attendedPct", label: "Attended %" },
      { key: "leasePct", label: "Lease %" },
    ],
    valueFormatter: (value: number) => `${value.toFixed(1)}%`,
    referenceValue: 15,
    referenceLabel: "Target",
  },
  render: (args) => (
    <ChartCard title="Weekly conversion rates" subtitle="Cohort-tracked, last 6 weeks">
      <LineChart {...args} />
    </ChartCard>
  ),
};

/** A filled area suits a single volume series where the magnitude is the story. */
export const Area: Story = {
  args: {
    data: WEEKLY_FUNNEL,
    categoryKey: "week",
    categoryLabel: "Week",
    series: [{ key: "leads", label: "Leads" }],
    area: true,
  },
  render: (args) => (
    <ChartCard title="Weekly lead volume" subtitle="Last 6 weeks">
      <LineChart {...args} />
    </ChartCard>
  ),
};

/** Stacked areas read as a part-to-whole total over time. */
export const StackedArea: Story = {
  args: {
    data: WEEKLY_FUNNEL,
    categoryKey: "week",
    categoryLabel: "Week",
    series: [
      { key: "booked", label: "Tours booked" },
      { key: "attended", label: "Tours attended" },
      { key: "leases", label: "Leases" },
    ],
    area: true,
    stacked: true,
  },
  render: (args) => (
    <ChartCard title="Weekly funnel volume" subtitle="Last 6 weeks">
      <LineChart {...args} />
    </ChartCard>
  ),
};

/**
 * With `toggleableSeries`, clicking a legend entry hides that line — the way to
 * read a many-property tracker without eight lines fighting each other. At
 * least one series always stays plotted.
 */
export const ToggleableSeries: Story = {
  args: {
    data: [
      { week: "Jun 22", maple: 3.1, harbor: 2.2, wren: 1.4, cedar: 0.9 },
      { week: "Jun 29", maple: 3.4, harbor: 1.8, wren: 2.1, cedar: 1.2 },
      { week: "Jul 6", maple: 2.6, harbor: 2.6, wren: 1.9, cedar: 1.6 },
      { week: "Jul 13", maple: 4.0, harbor: 2.1, wren: 2.8, cedar: 1.1 },
      { week: "Jul 20", maple: 3.2, harbor: 2.9, wren: 2.2, cedar: 1.8 },
      { week: "Jul 27", maple: 3.8, harbor: 3.1, wren: 2.6, cedar: 2.0 },
    ],
    categoryKey: "week",
    categoryLabel: "Week",
    series: [
      { key: "maple", label: "Maple Court" },
      { key: "harbor", label: "Harbor Point" },
      { key: "wren", label: "The Wren" },
      { key: "cedar", label: "Cedar Row" },
    ],
    toggleableSeries: true,
    valueFormatter: (value: number) => `${value.toFixed(1)}%`,
  },
  render: (args) => (
    <ChartCard title="Close rate tracker" subtitle="Click a legend entry to show or hide a property">
      <LineChart {...args} />
    </ChartCard>
  ),
};

/**
 * `curve="monotone"` smooths the line. It looks calmer but invents plausible
 * values between the real points — keep it for genuinely continuous data.
 */
export const SmoothedCurve: Story = {
  args: {
    data: WEEKLY_FUNNEL,
    categoryKey: "week",
    categoryLabel: "Week",
    series: [{ key: "leads", label: "Leads" }],
    curve: "monotone",
    area: true,
  },
  render: (args) => (
    <ChartCard title="Weekly lead volume" subtitle="Smoothed">
      <LineChart {...args} />
    </ChartCard>
  ),
};

export const Loading: Story = {
  args: {
    data: [],
    categoryKey: "week",
    series: [{ key: "leads", label: "Leads" }],
    loading: true,
  },
  render: (args) => (
    <ChartCard title="Weekly trend">
      <LineChart {...args} />
    </ChartCard>
  ),
};

export const Empty: Story = {
  args: {
    data: [],
    categoryKey: "week",
    series: [{ key: "leads", label: "Leads" }],
    emptyTitle: "No activity in this range",
    emptyDescription: "Pick a wider period to see the trend.",
  },
  render: (args) => (
    <ChartCard title="Weekly trend">
      <LineChart {...args} />
    </ChartCard>
  ),
};
