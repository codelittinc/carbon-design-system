import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

/**
 * HoverCard previews content while the pointer rests on the trigger or the
 * trigger has focus. A click pins it open until a second click, Escape, or a
 * click outside — and is how a touch screen opens it.
 */
const meta: Meta<typeof HoverCard> = {
  title: "Components/Overlays/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex gap-3">
      {["Jane Doe", "John Smith"].map((name) => (
        <HoverCard key={name}>
          <HoverCardTrigger asChild>
            <Button type="button" variant="outline">
              {name}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent aria-label={name} className="w-56 text-sm">
            <p className="font-semibold text-text-primary">{name}</p>
            <p className="mt-1 text-text-muted">Vacation, July 14 to July 18</p>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  ),
};
