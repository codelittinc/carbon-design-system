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
  /**
   * Extra props for the search `Input`: a `ref` to focus it, `onKeyDown`,
   * `type`, `autoComplete`, a `className` merged onto the input's own. The
   * value, change handler, placeholder and name stay with the props above.
   */
  searchInputProps?: Omit<
    React.ComponentPropsWithRef<typeof Input>,
    "value" | "defaultValue" | "onChange" | "placeholder" | "aria-label"
  >;
  /** Filter controls (selects, toggles) rendered to the right of the search box. */
  children?: React.ReactNode;
  /** Merged onto the wrapper, so `mb-0` replaces the default bottom margin. */
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
  searchInputProps,
  children,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("mb-4 flex items-center gap-3", className)}>
      {onSearchChange && (
        <div className="relative max-w-sm flex-1">
          <Search
            aria-hidden="true"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            {...searchInputProps}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchLabel ?? searchPlaceholder}
            className={cn("pl-9", searchInputProps?.className)}
          />
        </div>
      )}
      {children}
    </div>
  );
}
