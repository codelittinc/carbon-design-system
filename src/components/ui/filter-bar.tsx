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
  /**
   * `touch` makes the search input 44px tall below the `sm` breakpoint (a
   * touch target) and the default 32px from `sm` up.
   */
  size?: "default" | "touch";
  /**
   * Below the `sm` breakpoint, stack the search box (full width) above the
   * filter controls. From `sm` up the bar is one row either way, and its
   * controls wrap instead of overflowing. Pass `false` for the single row at
   * every width.
   */
  stackOnMobile?: boolean;
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
  size = "default",
  stackOnMobile = true,
  children,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex",
        stackOnMobile
          ? "flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
          : "items-center gap-3",
        className,
      )}
    >
      {onSearchChange && (
        <div
          className={cn(
            "relative",
            stackOnMobile ? "w-full sm:w-auto sm:max-w-sm sm:flex-1" : "max-w-sm flex-1",
          )}
        >
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
            className={cn("pl-9", size === "touch" && "h-11 sm:h-8", searchInputProps?.className)}
          />
        </div>
      )}
      {children}
    </div>
  );
}
