"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";
import { Button } from "./button";
import { CheckboxGroup } from "./checkbox-group";

export interface StatusOption {
  value: string;
  label: string;
}

interface MultiStatusFilterProps {
  /** Prefix shown on the trigger, e.g. "Status". */
  label?: string;
  options: StatusOption[];
  /** Currently-selected status values. Empty array = no filter (all statuses). */
  selected: string[];
  onChange: (next: string[]) => void;
  className?: string;
}

/**
 * Checkbox-dropdown multi-select for list status filters. Empty selection means
 * "all statuses" (the caller sends no status param). The trigger summarizes the
 * active set so which statuses are filtered is always visible without opening it.
 */
export function MultiStatusFilter({
  label = "Status",
  options,
  selected,
  onChange,
  className,
}: MultiStatusFilterProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const summary = useMemo(() => {
    if (selected.length === 0) return "All statuses";
    if (selected.length === options.length) return "All statuses";
    const labels = options
      .filter((o) => selectedSet.has(o.value))
      .map((o) => o.label);
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.length} selected`;
  }, [selected.length, options, selectedSet]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`${label} filter`}
          className={cn(
            "justify-start bg-surface-raised font-normal hover:border-accent/50 hover:bg-surface-raised",
            className,
          )}
        >
          <span className="text-text-muted">{label}:</span>
          <span className="max-w-[12rem] truncate">{summary}</span>
          {selected.length > 0 && selected.length < options.length && (
            <Badge variant="accent" className="px-1.5 py-0 text-xs tabular-nums">
              {selected.length}
            </Badge>
          )}
          <ChevronDown size={14} className="text-text-muted" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-2">
        <div className="mb-1 flex items-center justify-between px-1 pb-1">
          <span className="text-xs font-medium text-text-muted">{label}</span>
          <div className="flex gap-2 text-xs">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs font-normal disabled:opacity-40"
              disabled={selected.length === options.length}
              onClick={() => onChange(options.map((o) => o.value))}
            >
              All
            </Button>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs font-normal text-text-muted disabled:opacity-40"
              disabled={selected.length === 0}
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
        </div>
        <CheckboxGroup
          aria-label={label}
          orientation="vertical"
          options={options}
          value={selected}
          onChange={onChange}
          className="max-h-72 overflow-y-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
