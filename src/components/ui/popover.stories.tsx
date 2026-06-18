import type { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";
import { Input } from "./input";

/**
 * Floating panel anchored to a trigger, built on Radix Popover. Good for small
 * inline editors and filter controls that don't warrant a full dialog.
 */
const meta: Meta = {
  title: "Components/Popover",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Quick edit rent</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">Monthly rent</p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Amount</label>
            <Input type="number" defaultValue="1850.00" />
          </div>
          <Button className="w-full" size="sm">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FilterPanel: StoryObj = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filter charges</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">Filter charges</p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Charge code</label>
            <Input placeholder="e.g. RENT, LATE, NSF" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Min amount</label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Max amount</label>
              <Input type="number" placeholder="5000.00" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm">
              Reset
            </Button>
            <Button size="sm">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
