"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "./input";

interface FilterBarProps {
  /** Current search value. When provided with onSearchChange, renders the search box. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /**
   * Accessible name for the search input (its `aria-label`). Defaults to
   * `searchPlaceholder`, since a placeholder alone is not a name.
   */
  searchLabel?: string;
  /** Filter controls (selects, toggles) rendered to the right of the search box. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Toolbar above a list/table: a search input with a leading icon plus a slot
 * for filter controls. Pass DS `Select`s (or `MultiStatusFilter`) as children.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchLabel,
  children,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("mb-4 flex items-center gap-3", className)}>
      {onSearchChange && (
        <div className="relative max-w-sm flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchLabel ?? searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}
      {children}
    </div>
  );
}
