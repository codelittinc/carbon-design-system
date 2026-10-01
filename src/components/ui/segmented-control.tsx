"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  /** `null` when nothing is chosen yet. */
  value: string | null;
  onChange: (value: string) => void;
  /** Submits the value with a surrounding form, via a hidden input. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  /** Marks the group invalid and draws an error border. */
  error?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 px-2.5 text-xs",
  md: "h-7 px-3 text-sm",
};

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];

/**
 * A choice of one from a few options, all of them visible. It is a radio group:
 * one Tab stop, and the arrow keys move the choice. Use `Tabs` when the options
 * switch what is shown, and `Select` when there are more than about four.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  name,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
  error = false,
  disabled = false,
  size = "md",
  className,
}: SegmentedControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);
  // With nothing chosen, the first segment takes the Tab stop.
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex;

  function select(next: string) {
    if (next !== value) onChange(next);
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const step = NEXT_KEYS.includes(e.key) ? 1 : PREVIOUS_KEYS.includes(e.key) ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const nextIndex = (index + step + options.length) % options.length;
    select(options[nextIndex].value);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired}
      aria-invalid={error || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex gap-0.5 rounded-md border bg-surface-raised p-0.5",
        error ? "border-error" : "border-border",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        return (
          <Button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            variant="ghost"
            role="radio"
            aria-checked={selected}
            tabIndex={index === tabbableIndex ? 0 : -1}
            disabled={disabled}
            onClick={() => select(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              // `min-w-max`: Button lets its label shrink and truncate, and a
              // segment must always show its whole label instead.
              "min-w-max flex-1 rounded",
              sizeClasses[size],
              // Selected is the solid accent, and stays it on hover.
              selected && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {option.label}
          </Button>
        );
      })}
      {name && <input type="hidden" name={name} value={value ?? ""} disabled={disabled} />}
    </div>
  );
}
