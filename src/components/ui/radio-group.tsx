"use client";

import { forwardRef, useId, type ReactElement, type ReactNode } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";
import { Label } from "./label";

/**
 * One radio button. Use it inside `RadioGroup` when a row needs more than a
 * text label — an answer the author is typing, say — and give it an
 * `aria-label` or a `Label` of its own.
 */
const RadioGroupItem = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-accent" />
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** The chosen option's value; `""` (or undefined) when nothing is chosen yet. */
  value?: string;
  onChange: (value: string) => void;
  /**
   * Labelled options, laid out like `CheckboxGroup`'s. Leave it out and pass
   * `RadioGroupItem`s as `children` for rows that need more than a label.
   */
  options?: RadioGroupOption[];
  children?: ReactNode;
  /** Submits the chosen value under this name with a surrounding form. */
  name?: string;
  orientation?: "horizontal" | "vertical";
  /** Disables every option. */
  disabled?: boolean;
  /** A form will not submit until one option is chosen. */
  required?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * Exactly one of a few options, all visible: an answer to a multiple-choice
 * question, or which of a question's answers is the correct one. Use `Select`
 * when there are too many options to show at once, and `SegmentedControl` for
 * a view switch.
 */
export function RadioGroup({
  value,
  onChange,
  options,
  children,
  name,
  orientation = "vertical",
  disabled = false,
  required = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: RadioGroupProps): ReactElement {
  const baseId = useId();
  const vertical = orientation === "vertical";

  return (
    <RadioGroupPrimitive.Root
      value={value ?? ""}
      onValueChange={onChange}
      name={name}
      orientation={orientation}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(vertical ? "flex flex-col" : "flex flex-wrap items-center gap-4", className)}
    >
      {options
        ? options.map((option, index) => {
            const id = `${baseId}-${index}`;
            const isDisabled = disabled || option.disabled;
            return (
              <div
                key={option.value}
                className={cn(
                  "inline-flex items-center gap-2",
                  vertical && "w-full rounded px-1 py-1.5 hover:bg-surface-overlay",
                )}
              >
                <RadioGroupItem id={id} value={option.value} disabled={option.disabled} />
                <Label
                  htmlFor={id}
                  className={cn(
                    "text-sm text-text-secondary",
                    vertical && "flex-1",
                    isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  )}
                >
                  {option.label}
                </Label>
              </div>
            );
          })
        : children}
    </RadioGroupPrimitive.Root>
  );
}

export { RadioGroupItem };
