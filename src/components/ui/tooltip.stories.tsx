import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
import { Button } from "./button";
import { Info } from "lucide-react";

/**
 * Hover/focus hint built on Radix Tooltip. Usage MUST be wrapped in a
 * `TooltipProvider`, and the trigger should use `asChild` so the tooltip
 * attaches to a real focusable element.
 */
const meta: Meta = {
  title: "Components/Tooltip",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for details</Button>
        </TooltipTrigger>
        <TooltipContent>Posts to GL account 5790 during the month</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const OnIconButton: StoryObj = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Vacancy loss info">
            <Info size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Vacancy Loss = GPR − Loss to Lease − actual rent charged
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Sides: StoryObj = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">Lease starts Jul 1</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open balance $0.00</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Period is OPEN</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
