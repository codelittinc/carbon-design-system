"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

interface HoverControls {
  pinned: boolean;
  onTriggerEnter: () => void;
  onLeave: () => void;
  onContentEnter: () => void;
  onTriggerClick: () => void;
}

/** Set only under `<Popover openOnHover>`; the trigger and content read it. */
const HoverContext = createContext<HoverControls | null>(null);

/**
 * The hover popover that is currently PINNED, app-wide. Hover never opens a
 * popover while another one is pinned — pointing across a calendar of chips
 * on the way to the pinned one's content must not replace it.
 */
let pinnedPopover: symbol | null = null;

interface PopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  /**
   * Opens on hover as a preview, and a click on the trigger pins it open until
   * a second click, Escape or a click outside. A hover preview does not take
   * focus. Without this, the popover opens and closes on click, as before.
   */
  openOnHover?: boolean;
  /** Hover delay before opening. Defaults to 150ms. */
  hoverOpenDelayMs?: number;
  /** Delay before a hover preview closes once the pointer leaves. Defaults to 120ms. */
  hoverCloseDelayMs?: number;
}

/**
 * Radix's popover root. Pass `open` / `onOpenChange` to control it, or
 * `openOnHover` for a hover preview that a click pins.
 */
function Popover({
  openOnHover = false,
  hoverOpenDelayMs = 150,
  hoverCloseDelayMs = 120,
  ...props
}: PopoverProps): ReactElement {
  if (!openOnHover) return <PopoverPrimitive.Root {...props} />;
  return (
    <HoverPopover hoverOpenDelayMs={hoverOpenDelayMs} hoverCloseDelayMs={hoverCloseDelayMs} {...props} />
  );
}

function HoverPopover({
  hoverOpenDelayMs,
  hoverCloseDelayMs,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: Omit<PopoverProps, "openOnHover"> & { hoverOpenDelayMs: number; hoverCloseDelayMs: number }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const [pinned, setPinned] = useState(false);
  const id = useRef(Symbol("popover")).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const pin = (next: boolean) => {
    setPinned(next);
    if (next) pinnedPopover = id;
    else if (pinnedPopover === id) pinnedPopover = null;
  };

  // Release the pin when closed from outside (Escape, outside click) or unmounted.
  useEffect(() => {
    if (!open && pinned) pin(false);
  });
  useEffect(
    () => () => {
      clearTimer();
      if (pinnedPopover === id) pinnedPopover = null;
    },
    [id],
  );

  const controls: HoverControls = {
    pinned,
    onTriggerEnter: () => {
      if (pinned || (pinnedPopover && pinnedPopover !== id)) return;
      clearTimer();
      timer.current = setTimeout(() => setOpen(true), hoverOpenDelayMs);
    },
    onLeave: () => {
      clearTimer();
      if (pinned || !open) return;
      timer.current = setTimeout(() => setOpen(false), hoverCloseDelayMs);
    },
    onContentEnter: clearTimer,
    onTriggerClick: () => {
      clearTimer();
      if (pinned) {
        pin(false);
        setOpen(false);
      } else {
        pin(true);
        setOpen(true);
      }
    },
  };

  return (
    <HoverContext.Provider value={controls}>
      <PopoverPrimitive.Root
        {...props}
        open={open}
        onOpenChange={(next) => {
          if (!next) pin(false);
          setOpen(next);
        }}
      />
    </HoverContext.Provider>
  );
}

/**
 * Radix's trigger. Under `openOnHover` it also carries the hover handlers, and
 * its click pins instead of toggling. Use `asChild` to make your own button —
 * a `SegmentedChip`, say — the trigger.
 */
const PopoverTrigger = forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ onClick, onPointerEnter, onPointerLeave, ...props }, ref) => {
  const hover = useContext(HoverContext);
  if (!hover) {
    return (
      <PopoverPrimitive.Trigger
        ref={ref}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        {...props}
      />
    );
  }
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // Stops Radix's own toggle, which would close a hover preview on the
        // click that is meant to pin it.
        e.preventDefault();
        hover.onTriggerClick();
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType !== "touch") hover.onTriggerEnter();
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        hover.onLeave();
      }}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    { className, align = "center", sideOffset = 4, onOpenAutoFocus, onPointerEnter, onPointerLeave, ...props },
    ref,
  ) => {
    const hover = useContext(HoverContext);
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          onOpenAutoFocus={(e) => {
            onOpenAutoFocus?.(e);
            // A hover preview must not pull focus away from where the reader is.
            if (hover && !hover.pinned) e.preventDefault();
          }}
          onPointerEnter={(e) => {
            onPointerEnter?.(e);
            hover?.onContentEnter();
          }}
          onPointerLeave={(e) => {
            onPointerLeave?.(e);
            hover?.onLeave();
          }}
          className={cn(
            "z-50 w-72 rounded-lg border border-border bg-surface-raised p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
export type { PopoverProps };
