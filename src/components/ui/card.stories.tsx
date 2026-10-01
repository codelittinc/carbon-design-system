import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./card";

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
