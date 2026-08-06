import type { Meta, StoryObj } from "@storybook/react";
import { DonutChart } from "./donut-chart";
import { ChartCard } from "./chart";

/**
 * DonutChart shows a part-to-whole split — a channel mix, a spend allocation.
 *
 * It answers "roughly what share", and nothing finer: the eye compares bar
 * lengths far better than wedge angles, so values that sit close together
 * belong in a BarChart. Slices are capped at six by default; the tail folds
 * into a neutral "Other" rather than reusing a palette hue.
 */
const meta: Meta<typeof DonutChart> = {
  title: "Components/Charts/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DonutChart>;

const LEAD_MIX = [
  { label: "Google Ads", value: 684 },
  { label: "Zillow", value: 512 },
  { label: "Apartments.com", value: 341 },
  { label: "Walk-in", value: 188 },
  { label: "Referral", value: 96 },
];

/** The hole carries the total, so the donut doubles as a stat tile. */
export const Default: Story = {
  args: {
    data: LEAD_MIX,
    categoryLabel: "Channel",
    centerLabel: "Total leads",
  },
  render: (args) => (
    <ChartCard title="Lead mix" subtitle="Jul 27 – Aug 2, 2026">
      <DonutChart {...args} />
    </ChartCard>
  ),
};

/** Money formatting flows through the center total, legend, and tooltip alike. */
export const SpendMix: Story = {
  args: {
    data: [
      { label: "Google Ads", value: 18400 },
      { label: "Zillow", value: 12250 },
      { label: "Apartments.com", value: 8900 },
      { label: "Signage", value: 3100 },
      { label: "Events", value: 1750 },
    ],
    categoryLabel: "Channel",
    centerLabel: "Total spend",
    showPercentages: false,
    valueFormatter: (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value),
  },
  render: (args) => (
    <ChartCard title="Spend mix by channel" subtitle="Month to date">
      <DonutChart {...args} />
    </ChartCard>
  ),
};

/**
 * Given more categories than `maxSlices`, the smallest fold into one neutral
 * "Other" wedge. The survivors keep their input order, so a filter change does
 * not repaint the categories the reader has already learned.
 */
export const WithOtherFolding: Story = {
  args: {
    data: [
      ...LEAD_MIX,
      { label: "Craigslist", value: 62 },
      { label: "Facebook", value: 48 },
      { label: "Locator service", value: 31 },
      { label: "Drive-by", value: 22 },
    ],
    categoryLabel: "Channel",
    centerLabel: "Total leads",
    maxSlices: 5,
  },
  render: (args) => (
    <ChartCard title="Lead mix" subtitle="Nine channels, five wedges plus Other">
      <DonutChart {...args} />
    </ChartCard>
  ),
};

/** A full pie, with the legend beneath — for narrow columns. */
export const PieWithBottomLegend: Story = {
  args: {
    data: LEAD_MIX,
    categoryLabel: "Channel",
    variant: "pie",
    legendPosition: "bottom",
    height: 220,
  },
  render: (args) => (
    <ChartCard className="max-w-xs" title="Lead mix">
      <DonutChart {...args} />
    </ChartCard>
  ),
};

/** Clicking a wedge filters the rest of the dashboard. */
export const Clickable: Story = {
  args: {
    data: LEAD_MIX,
    categoryLabel: "Channel",
    centerLabel: "Total leads",
    onSliceClick: (slice) => window.alert(`Filter to ${slice.label}`),
  },
  render: (args) => (
    <ChartCard title="Lead mix" subtitle="Click a wedge to filter">
      <DonutChart {...args} />
    </ChartCard>
  ),
};

export const Loading: Story = {
  args: { data: [], loading: true },
  render: (args) => (
    <ChartCard title="Lead mix">
      <DonutChart {...args} />
    </ChartCard>
  ),
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No leads to break down",
    emptyDescription: "No channel recorded any lead in this period.",
  },
  render: (args) => (
    <ChartCard title="Lead mix">
      <DonutChart {...args} />
    </ChartCard>
  ),
};
