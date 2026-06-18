import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CommandPalette, CommandGroup, CommandItem } from "./command-palette";
import { Button } from "./button";
import { Home, Users, FileText, Receipt, CreditCard, Plus } from "lucide-react";

/**
 * Command palette (cmdk) for fast navigation and actions. It binds ⌘K / Ctrl+K
 * globally to toggle `open`, so once mounted you can press ⌘K to open it as well
 * as using the button below. `open` is fully controlled by the parent.
 */
const meta: Meta = {
  title: "Components/Overlays/CommandPalette",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex flex-col items-start gap-3">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open command palette (or press ⌘K)
          </Button>
          <CommandPalette open={open} onOpenChange={setOpen}>
            <CommandGroup heading="Navigation">
              <CommandItem icon={<Home size={16} />} onSelect={() => setOpen(false)}>
                Go to dashboard
              </CommandItem>
              <CommandItem icon={<Users size={16} />} onSelect={() => setOpen(false)}>
                Go to tenants
              </CommandItem>
              <CommandItem icon={<FileText size={16} />} onSelect={() => setOpen(false)}>
                Go to leases
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem icon={<Plus size={16} />} onSelect={() => setOpen(false)}>
                New application
              </CommandItem>
              <CommandItem icon={<Receipt size={16} />} onSelect={() => setOpen(false)}>
                Post a charge
              </CommandItem>
              <CommandItem icon={<CreditCard size={16} />} onSelect={() => setOpen(false)}>
                Record a payment
              </CommandItem>
            </CommandGroup>
          </CommandPalette>
        </div>
      );
    }
    return <Demo />;
  },
};
