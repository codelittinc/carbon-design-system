import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Card, CardHeader } from "./card";

/** Card groups related content on a bordered surface. */
const meta: Meta<typeof Card> = {
  title: "Components/Data Display/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <h3 className="text-sm font-medium text-text-primary">Senior Engineer</h3>
      <p className="mt-1 text-sm text-text-muted">12 candidates · 3 in final round</p>
    </Card>
  ),
};

export const Paddings: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["none", "sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} padding={padding} className="w-80 text-sm text-text-secondary">
          padding=&quot;{padding}&quot;
        </Card>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Card asChild hoverable className="block w-80">
      <a href="#card">
        <h3 className="text-sm font-medium text-text-primary">Clickable card</h3>
        <p className="mt-1 text-sm text-text-muted">Rendered as an anchor via asChild.</p>
      </a>
    </Card>
  ),
};

/** CardHeader: a section's title, description and actions. PageHeader stays the page's h1. */
export const WithHeader: Story = {
  render: () => (
    <Card className="w-[28rem]">
      <CardHeader
        title="Active contracts"
        description="12 contracts across 4 customers"
        actions={<Button size="sm">Add contract</Button>}
      />
      <p className="text-sm text-text-secondary">Card content.</p>
    </Card>
  ),
};

export const CompactHeader: Story = {
  render: () => (
    <Card className="w-[28rem]" padding="sm">
      <CardHeader as="h3" size="sm" title="Time off this week" />
      <p className="text-sm text-text-secondary">Card content.</p>
    </Card>
  ),
};
