import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";
import { StatusBadge } from "./status-badge";

/**
 * ScrollArea is a Radix custom-scrollbar container. Constrain its height via
 * className (e.g. `h-72`) and overflow content scrolls with a styled thumb.
 * Useful for long tenant lists and ledger feeds inside fixed panels.
 */
const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-80 rounded-lg border border-border">
      <div className="p-3">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-border-subtle py-2 text-sm text-text-secondary last:border-0"
          >
            Journal Entry #JE-{(1000 + i).toString()}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

const TENANTS = [
  "Ava Thompson",
  "Marcus Lee",
  "Priya Nair",
  "Diego Ramirez",
  "Sophie Müller",
  "Jamal Carter",
];
const STATUSES = ["CURRENT", "PARTIALLY_PAID", "PENDING", "PAST_RESIDENT", "APPLICANT"];

export const TenantList: Story = {
  render: () => (
    <ScrollArea className="h-72 w-96 rounded-lg border border-border bg-surface-overlay/40">
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-text-primary">
                {TENANTS[i % TENANTS.length]}
              </div>
              <div className="text-xs text-text-muted">
                Unit {100 + (i % 6)}
                {String.fromCharCode(65 + (i % 4))}
              </div>
            </div>
            <StatusBadge status={STATUSES[i % STATUSES.length]} />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
