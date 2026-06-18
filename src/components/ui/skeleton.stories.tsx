import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

/**
 * Skeleton is a pulsing placeholder. Compose it with Tailwind sizing classes to
 * mirror the shape of content while it loads (tenant cards, ledger rows, etc.).
 */
const meta: Meta<typeof Skeleton> = {
  title: "Components/Data Display/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex w-80 items-center gap-4 rounded-lg border border-border p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  ),
};

export const TableRows: Story = {
  render: () => (
    <div className="w-[480px] rounded-lg border border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border-subtle px-3 py-3 last:border-0"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  ),
};
