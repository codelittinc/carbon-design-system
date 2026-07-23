"use client";

import { useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/cn";

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

  const toggle = (value: string) => {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label} filter`}
          className={cn(
            "flex h-8 items-center gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary hover:border-amber-500/50",
            className,
          )}
        >
          <span className="text-text-muted">{label}:</span>
          <span className="max-w-[12rem] truncate">{summary}</span>
          {selected.length > 0 && selected.length < options.length && (
            <span className="rounded-full bg-amber-500/20 px-1.5 text-xs tabular-nums text-amber-400">
              {selected.length}
            </span>
          )}
          <ChevronDown size={14} className="text-text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-2">
        <div className="mb-1 flex items-center justify-between px-1 pb-1">
          <span className="text-xs font-medium text-text-muted">{label}</span>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className="text-amber-400 hover:underline disabled:opacity-40"
              disabled={selected.length === options.length}
              onClick={() => onChange(options.map((o) => o.value))}
            >
              All
            </button>
            <button
              type="button"
              className="text-text-muted hover:underline disabled:opacity-40"
              disabled={selected.length === 0}
              onClick={() => onChange([])}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {options.map((opt) => {
            const checked = selectedSet.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(opt.value)}
                className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-sm text-text-primary hover:bg-surface-overlay"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-amber-500 bg-amber-500 text-carbon-950"
                      : "border-border bg-surface-raised",
                  )}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="flex-1">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
