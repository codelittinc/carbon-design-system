import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "./dropdown-menu";
import { Button } from "./button";
import { Eye, Pencil, Copy, FileText, Ban, Trash2 } from "lucide-react";

/**
 * Contextual action menu built on Radix. Common for table row actions
 * (view / edit / delete) in tenant, lease, and charge lists.
 */
const meta: Meta = {
  title: "Components/DropdownMenu",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>View tenant</DropdownMenuItem>
        <DropdownMenuItem>Edit details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-400 focus:text-red-300">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithLabelAndGroups: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Lease #L-2049</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[12rem]">
        <DropdownMenuLabel>Lease actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Open lease</DropdownMenuItem>
          <DropdownMenuItem>Create amendment</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Ledger</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Post charge</DropdownMenuItem>
          <DropdownMenuItem>Record payment</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIcons: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Charge actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[12rem]">
        <DropdownMenuItem>
          <Eye size={14} /> View charge
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil size={14} /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy size={14} /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText size={14} /> View journal entry
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-amber-400 focus:text-amber-300">
          <Ban size={14} /> Void charge
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-400 focus:text-red-300">
          <Trash2 size={14} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
