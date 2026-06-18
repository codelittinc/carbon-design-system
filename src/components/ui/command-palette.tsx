"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CommandPalette({ open, onOpenChange, children }: CommandPaletteProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <Command
          className="overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl"
          loop
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search size={16} className="text-text-muted" />
            <Command.Input
              placeholder="Search or type a command..."
              className="flex-1 bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-text-muted">
              No results found.
            </Command.Empty>
            {children}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

export function CommandGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-faint"
    >
      {children}
    </Command.Group>
  );
}

interface CommandItemProps {
  onSelect: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function CommandItem({ onSelect, icon, children }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors",
        "data-[selected=true]:bg-surface-overlay data-[selected=true]:text-text-primary",
      )}
    >
      {icon && <span className="text-text-muted">{icon}</span>}
      {children}
    </Command.Item>
  );
}
