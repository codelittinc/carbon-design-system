import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./status-badge";

/**
 * StatusBadge maps a domain status string (lease, tenant, charge, period,
 * eviction, etc.) to a colored Badge variant. Underscores are rendered as
 * spaces. Unrecognized statuses fall back to the neutral "default" variant.
 */
const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: {
    status: "ACTIVE",
  },
};

// Every status key recognized by the STATUS_MAP in status-badge.tsx.
const allStatuses = [
  "OPEN",
  "ACTIVE",
  "APPROVED",
  "POSTED",
  "CURRENT",
  "PAID",
  "COMPLETED",
  "CLOSED",
  "VOIDED",
  "CANCELLED",
  "REJECTED",
  "PAST_RESIDENT",
  "SOFT_CLOSED",
  "PENDING",
  "PENDING_APPROVAL",
  "DRAFT",
  "NOTICE",
  "PARTIALLY_PAID",
  "PARTIALLY_FULFILLED",
  "IN_PROGRESS",
  "APPLICANT",
];

export const AllStatuses: Story = {
  render: () => (
    <div className="flex max-w-xl flex-wrap items-center gap-2">
      {allStatuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};

export const UnknownStatus: Story = {
  args: {
    status: "ESCALATED_TO_LEGAL",
  },
};
