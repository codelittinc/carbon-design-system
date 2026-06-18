import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./select";

/**
 * Select is a Radix-based dropdown for choosing a single option from a known
 * list — picking a property, charge code, or lease status. Composed from
 * Trigger / Value / Content / Item primitives.
 */
const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a property" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="maple">Maple Court</SelectItem>
        <SelectItem value="oak">Oak Ridge Apartments</SelectItem>
        <SelectItem value="birch">Birch Hollow</SelectItem>
        <SelectItem value="cedar">Cedar Point Lofts</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a charge code" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="rent">Base Rent</SelectItem>
          <SelectItem value="parking">Parking</SelectItem>
          <SelectItem value="pet">Pet Rent</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectItem value="late">Late Fee</SelectItem>
          <SelectItem value="nsf">NSF Fee</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Controlled: StoryObj<typeof Select> = {
  render: () => {
    const [value, setValue] = useState<string>("");
    return (
      <div className="flex flex-col gap-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select lease status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Resident</SelectItem>
            <SelectItem value="notice">On Notice</SelectItem>
            <SelectItem value="past">Past Resident</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-muted">
          Selected: {value || "none"}
        </p>
      </div>
    );
  },
};

export const Disabled: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]" disabled>
        <SelectValue placeholder="Select a property" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="maple">Maple Court</SelectItem>
      </SelectContent>
    </Select>
  ),
};
