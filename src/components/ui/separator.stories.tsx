import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

/**
 * Separator is a Radix divider. It defaults to a horizontal rule; pass
 * `orientation="vertical"` (inside a flex container with a defined height) to
 * divide inline items such as account summary metrics.
 */
const meta: Meta<typeof Separator> = {
  title: "Components/Data Display/Separator",
  component: Separator,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <div className="text-sm text-text-primary">Lease #L-2041</div>
      <p className="text-xs text-text-muted">Unit 204B — Ava Thompson</p>
      <Separator className="my-3" />
      <div className="text-sm text-text-secondary">
        Balance due: <span className="text-text-primary">$0.00</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4 text-sm">
      <div className="text-text-secondary">
        Occupied <span className="text-text-primary">142</span>
      </div>
      <Separator orientation="vertical" />
      <div className="text-text-secondary">
        Vacant <span className="text-text-primary">8</span>
      </div>
      <Separator orientation="vertical" />
      <div className="text-text-secondary">
        Notice <span className="text-text-primary">3</span>
      </div>
    </div>
  ),
};
