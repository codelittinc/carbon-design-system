import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Inbox, Plus } from "lucide-react";
import { EmptyState } from "./empty-state";
import { Button } from "./button";

/**
 * EmptyState is a centered placeholder for empty lists and zero-result views.
 * Supports an optional icon, description, and action node (typically a Button).
 */
const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "No charges posted",
    description: "Recurring charges for this period have not been generated yet.",
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Inbox size={40} strokeWidth={1.5} />,
    title: "Inbox zero",
    description: "There are no pending applications awaiting your review.",
  },
};

export const WithAction: Story = {
  args: {
    icon: <FileText size={40} strokeWidth={1.5} />,
    title: "No leases yet",
    description: "Create a lease to move an approved applicant into a unit.",
    action: (
      <Button>
        <Plus size={14} />
        New Lease
      </Button>
    ),
  },
};
