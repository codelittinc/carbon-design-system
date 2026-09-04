"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Command } from "cmdk";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";

/**
 * How cmdk decides what a search matches: a score, where 0 means "no match" and
 * anything above it ranks. Mirrors cmdk's own filter signature so a consumer can
 * pass `defaultFilter`, their own matcher, or nothing at all.
 */
export type CommandFilter = (value: string, search: string, keywords?: string[]) => number;

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /**
   * Makes the query controlled, so the consumer owns it.
   *
   * Needed to render only the rows that will be shown. cmdk filters whatever is
   * rendered, so "show me the best five" is only possible if the consumer can
   * see the query and decide what to render — and that matters more than it
   * sounds: mounting every row is superlinear in cmdk (each registration
   * reschedules the filter and the sort), so a few hundred rows makes opening
   * the palette take seconds. Pair with `shouldFilter={false}`.
   */
  value?: string;
  /** Fires on every keystroke when `value` is supplied. */
  onValueChange?: (value: string) => void;
  /**
   * Whether cmdk filters and sorts the rows. Default `true`.
   *
   * Set `false` when the consumer has already narrowed and ordered them. It also
   * side-steps cmdk's most surprising behaviour: a row that does not match is
   * rendered as `null`, and cmdk resolves a row's search value from that row's
   * DOM NODE — so a row that first mounts while a search is already active has
   * no node to read, caches an empty value, scores 0, and stays invisible for as
   * long as the palette is open. With filtering off, rows always render, so rows
   * that arrive late (or change as the query changes) behave.
   */
  shouldFilter?: boolean;
  /** Replaces cmdk's default fuzzy scorer. Ignored when `shouldFilter` is false. */
  filter?: CommandFilter;
  /**
   * Whether ArrowUp/ArrowDown wrap around at the ends. Default `true`, which is
   * what this component has always done — pass `false` for a long list, where
   * one ArrowUp at the top jumping to the last row reads as a scroll bug.
   */
  loop?: boolean;
  placeholder?: string;
  /** Shown when nothing matches. Ignored when `shouldFilter` is false. */
  emptyMessage?: React.ReactNode;
  /** Names the dialog for assistive technology. */
  label?: string;
}

/**
 * A ⌘K command palette.
 *
 * Binds ⌘K / Ctrl+K on `document` while mounted, closes on Escape and on a click
 * outside, and **renders into `document.body`** — the last of those is not
 * cosmetic. The panel positions itself with `fixed`, and a `backdrop-filter`
 * anywhere in its ancestry (a translucent app header, say) makes that ancestor
 * the containing block for fixed descendants, so an in-place palette silently
 * sizes itself to the header instead of the viewport.
 */
export function CommandPalette({
  open,
  onOpenChange,
  children,
  value,
  onValueChange,
  shouldFilter = true,
  filter,
  loop = true,
  placeholder = "Search or type a command...",
  emptyMessage = "No results found.",
  label = "Command palette",
}: CommandPaletteProps) {
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
  // No document to portal into while server-rendering. A palette is opened by
  // an interaction, so `open` is not true on the server in practice.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <Command
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl"
          loop={loop}
          shouldFilter={shouldFilter}
          filter={filter}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            // Handled here and stopped, so one press is not also read as
            // "dismiss the dialog underneath" by whatever else is listening.
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(false);
          }}
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search size={16} className="shrink-0 text-text-muted" />
            <Command.Input
              value={value}
              onValueChange={onValueChange}
              // Focused on open: a palette you have to click into before typing
              // is a palette that loses the first thing you type.
              autoFocus
              placeholder={placeholder}
              className="flex-1 bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {shouldFilter && (
              <Command.Empty className="py-6 text-center text-sm text-text-muted">
                {emptyMessage}
              </Command.Empty>
            )}
            {children}
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body,
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
  /**
   * What this row is matched and identified by. Defaults to the row's rendered
   * text, which is cmdk's behaviour and is usually right.
   *
   * Supply it when two rows can read identically — two employees with the same
   * name, say. cmdk keys SELECTION on this value, not on the element, so
   * duplicates come out both highlighted, unreachable from one another by
   * ArrowDown, and Enter always takes the first of them.
   *
   * It also decouples matching from the DOM: cmdk otherwise reads the value off
   * the rendered node, which a row cannot do while it is filtered out.
   */
  value?: string;
  /** Extra terms this row should match on, beyond its text. */
  keywords?: string[];
  /** Keeps the row rendered even when it does not match the current search. */
  forceMount?: boolean;
  /** Skipped by keyboard navigation and not selectable. */
  disabled?: boolean;
}

export function CommandItem({
  onSelect,
  icon,
  children,
  value,
  keywords,
  forceMount,
  disabled,
}: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={value}
      keywords={keywords}
      forceMount={forceMount}
      disabled={disabled}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors",
        "data-[selected=true]:bg-surface-overlay data-[selected=true]:text-text-primary",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {icon && <span className="text-text-muted">{icon}</span>}
      {children}
    </Command.Item>
  );
}
