"use client";

import { useId, type ReactElement } from "react";
import { cn } from "@/lib/cn";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** The checked options' values, in the order they were checked. */
  value: string[];
  onChange: (value: string[]) => void;
  options: CheckboxGroupOption[];
  /**
   * Submits each checked value under this name with a surrounding form — the
   * same shape as a group of native checkboxes sharing a name.
   */
  name?: string;
  orientation?: "horizontal" | "vertical";
  /** Disables every option. */
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * A set of labelled checkboxes for choosing any number of a few options, all
 * visible — a filter's "Active / Inactive", a user's roles. Use `MultiSelect`
 * when there are too many options to show at once.
 */
export function CheckboxGroup({
  value,
  onChange,
  options,
  name,
  orientation = "horizontal",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: CheckboxGroupProps): ReactElement {
  const baseId = useId();

  function toggle(optionValue: string, checked: boolean) {
    if (checked) {
      if (!value.includes(optionValue)) onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        orientation === "vertical" ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-4",
        className,
      )}
    >
      {options.map((option, index) => {
        const id = `${baseId}-${index}`;
        const isDisabled = disabled || option.disabled;
        return (
          <div key={option.value} className="inline-flex items-center gap-2">
            <Checkbox
              id={id}
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              disabled={isDisabled}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
            />
            <Label
              htmlFor={id}
              className={cn(
                "text-sm text-text-secondary",
                isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
            >
              {option.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
