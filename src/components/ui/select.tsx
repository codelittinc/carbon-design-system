"use client";

import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

/**
 * THE VALUE TRUNCATES; THE CHEVRON DOES NOT MOVE.
 *
 * `SelectValue` renders a `<span>` that sits here as a flex item, and a flex item's default
 * `min-width: auto` means it will not shrink below its own text width. So a trigger with a
 * bounded width and an option longer than it did not clip — the span kept its full width and
 * pushed the chevron out through the right border. Nothing about that is opt-in-able: an
 * option list whose longest label overflows is the normal case for any data-driven select
 * (a charge code, an account name, a vendor), and the consumer cannot fix it from outside
 * without knowing this component's internal DOM.
 *
 * Three classes, each load-bearing:
 *
 * - `min-w-0` on the trigger, so the trigger itself can shrink when a consumer puts it in a
 *   flex row rather than a fixed-width box.
 * - `[&>span]:min-w-0 [&>span]:truncate` on the value span. It has to be the child selector
 *   rather than a wrapper element: wrapping `{children}` would change the DOM every consumer
 *   already styles against. `truncate` needs the span blockified to apply `text-overflow`,
 *   which being a flex item already does for it.
 * - `shrink-0` on the chevron, so it keeps its 14px even when the label is what has to give.
 *
 * `[&>span]` matches the value and nothing else — the icon below is `asChild`, so it renders
 * as the `<svg>`, not as a span.
 */
const SelectTrigger = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:min-w-0 [&>span]:truncate",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown size={14} className="shrink-0 text-text-muted" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-text-secondary outline-none focus:bg-surface-overlay focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check size={12} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
