"use client";

import { forwardRef, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/** A keyboard shortcut, written once and shown per platform. */
export interface Shortcut {
  /** Cmd on Apple platforms, Ctrl elsewhere. */
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
}

const subscribeNever = () => () => {};

/**
 * Whether to show Apple modifiers. Read on the client only: the server and the
 * hydrating render both say "not Apple", and the client corrects it after, so
 * the markup matches and there is no hydration warning.
 */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

/** "⌘⇧S" on Apple platforms, "Ctrl+Shift+S" elsewhere. */
export function shortcutLabel(shortcut: Shortcut, apple: boolean): string {
  if (apple) {
    return `${shortcut.mod ? "⌘" : ""}${shortcut.shift ? "⇧" : ""}${shortcut.alt ? "⌥" : ""}${shortcut.key}`;
  }
  return [shortcut.mod && "Ctrl", shortcut.shift && "Shift", shortcut.alt && "Alt", shortcut.key]
    .filter(Boolean)
    .join("+");
}

/** The `aria-keyshortcuts` value: "Meta+Shift+S" or "Control+Shift+S". */
export function ariaShortcut(shortcut: Shortcut, apple: boolean): string | undefined {
  if (!shortcut.mod && !shortcut.shift && !shortcut.alt) return undefined;
  return [
    shortcut.mod && (apple ? "Meta" : "Control"),
    shortcut.shift && "Shift",
    shortcut.alt && "Alt",
    shortcut.key,
  ]
    .filter(Boolean)
    .join("+");
}

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The accessible name, and the tooltip unless `tooltip` is given. */
  label: string;
  tooltip?: string;
  icon: LucideIcon;
  iconClassName?: string;
  shortcut?: Shortcut;
  /** A toggle. Left undefined, the button is not a toggle and has no `aria-pressed`. */
  pressed?: boolean;
  apple: boolean;
}

/**
 * One icon control in the editor's toolbar: a ghost `Button` with a tooltip
 * that repeats its name and adds the shortcut.
 *
 * Forwards its ref and any extra props to the button, so a Radix trigger
 * (`PopoverTrigger asChild`) can sit around it.
 *
 * `onMouseDown` is prevented: without it the button takes focus on press and
 * the editor's selection collapses, so the command has nothing to act on.
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    { label, tooltip, icon: Icon, iconClassName, shortcut, pressed, apple, className, onMouseDown, ...props },
    ref,
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={pressed}
          aria-keyshortcuts={shortcut ? ariaShortcut(shortcut, apple) : undefined}
          onMouseDown={(event) => {
            event.preventDefault();
            onMouseDown?.(event);
          }}
          // Carbon's Button has no pressed variant, so the pressed look is
          // composed here. The border is the cue that is not only colour.
          className={cn(
            "h-7 w-7 border border-transparent",
            pressed && "border-accent/40 bg-accent-muted text-accent-text hover:bg-accent-muted hover:text-accent-text",
            className,
          )}
          {...props}
        >
          <Icon size={13} aria-hidden className={iconClassName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {tooltip ?? label}
        {shortcut && <span className="ml-2 text-text-faint">{shortcutLabel(shortcut, apple)}</span>}
      </TooltipContent>
    </Tooltip>
  ),
);
ToolbarButton.displayName = "ToolbarButton";
