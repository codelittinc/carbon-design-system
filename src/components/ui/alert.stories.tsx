import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./alert";

/** Alert is an inline, persistent message. For a transient one use `toast`. */
const meta: Meta<typeof Alert> = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Variants: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-3">
      <Alert variant="error">Scheduled emails couldn&apos;t be loaded.</Alert>
      <Alert variant="success" title="Connected">The inbox is syncing.</Alert>
      <Alert variant="info">Runs every 15 minutes.</Alert>
      <Alert variant="warning" onDismiss={() => {}}>
        Two interviewers haven&apos;t connected a calendar.
      </Alert>
    </div>
  ),
};
