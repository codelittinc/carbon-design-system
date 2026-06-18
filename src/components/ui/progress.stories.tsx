import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

/**
 * Progress is a Radix progress bar. It renders a determinate fill based on the
 * `value` prop (0–100). There is no indeterminate mode — `value` is required to
 * show any fill (defaults to 0). Used for things like rent-collection rate or
 * lease-renewal completion.
 */
const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={60} />
    </div>
  ),
};

const steps = [
  { value: 0, label: "Not started" },
  { value: 25, label: "Application received" },
  { value: 50, label: "Screening in progress" },
  { value: 75, label: "Lease drafted" },
  { value: 100, label: "Move-in complete" },
];

export const Values: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      {steps.map(({ value, label }) => (
        <div key={value} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{label}</span>
            <span className="tabular-nums">{value}%</span>
          </div>
          <Progress value={value} />
        </div>
      ))}
    </div>
  ),
};
