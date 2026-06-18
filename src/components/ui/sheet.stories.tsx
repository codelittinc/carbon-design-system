import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "./sheet";
import { Button } from "./button";
import { Input } from "./input";

/**
 * Slide-over panel built on Radix Dialog. `SheetContent` accepts a `side` prop
 * that supports only `"right"` (default) and `"left"`. Used for detail views and
 * quick-edit panels (e.g. tenant details) that should not interrupt the page.
 */
const meta: Meta = {
  title: "Components/Overlays/Sheet",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Tenant details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Jordan Avery · Unit 4B</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Email</label>
            <Input defaultValue="jordan.avery@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Phone</label>
            <Input defaultValue="(555) 014-9920" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <Input defaultValue="CURRENT_RESIDENT" readOnly />
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Right: StoryObj = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open from right</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Lease ledger</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <p className="text-sm text-text-secondary">
            Open balance: $0.00. All charges current through Jun 2026.
          </p>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: StoryObj = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open from left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Property</label>
            <Input placeholder="All properties" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <Input placeholder="Any status" />
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Reset</Button>
          </SheetClose>
          <Button>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
