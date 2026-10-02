"use client";

import { createContext, forwardRef, useContext, useRef, useState, type ReactElement } from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/cn";

interface PinControls {
  triggerRef: React.RefObject<HTMLElement | null>;
  togglePin: () => void;
  dismiss: () => void;
}

const PinContext = createContext<PinControls | null>(null);

function usePinControls(component: string): PinControls {
  const controls = useContext(PinContext);
  if (!controls) throw new Error(`<${component}> must be used inside <HoverCard>`);
  return controls;
}

type HoverCardProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>;

/**
 * A preview that opens while the pointer rests on its trigger, or while the
 * trigger has keyboard focus — a person's details behind a calendar chip. A
 * click on the trigger PINS it open until a second click, Escape or a click
 * outside, which is also how a touch screen opens it.
 *
 * Radix's hover card underneath. Use `Popover` for content that only opens on
 * click, and `Tooltip` for a line of text naming a control.
 */
function HoverCard({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 150,
  closeDelay = 120,
  ...props
}: HoverCardProps): ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const controls: PinControls = {
    triggerRef,
    togglePin: () => {
      setPinned(!pinned);
      setOpen(!pinned);
    },
    dismiss: () => {
      setPinned(false);
      setOpen(false);
    },
  };

  return (
    <PinContext.Provider value={controls}>
      <HoverCardPrimitive.Root
        {...props}
        openDelay={openDelay}
        closeDelay={closeDelay}
        open={open}
        // Leaving or blurring the trigger closes a preview, never a pinned card.
        onOpenChange={(next) => {
          if (!next && pinned) return;
          setOpen(next);
        }}
      />
    </PinContext.Provider>
  );
}

/** The trigger. Pass `asChild` to make your own `Button` or `CategoryChip` it. */
const HoverCardTrigger = forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>
>(({ onClick, ...props }, ref) => {
  const { triggerRef, togglePin } = usePinControls("HoverCardTrigger");
  return (
    <HoverCardPrimitive.Trigger
      {...props}
      ref={(el) => {
        triggerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) togglePin();
      }}
    />
  );
});
HoverCardTrigger.displayName = "HoverCardTrigger";

const HoverCardContent = forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, onEscapeKeyDown, onPointerDownOutside, ...props }, ref) => {
  const { triggerRef, dismiss } = usePinControls("HoverCardContent");
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        onEscapeKeyDown={(e) => {
          onEscapeKeyDown?.(e);
          if (!e.defaultPrevented) dismiss();
        }}
        onPointerDownOutside={(e) => {
          onPointerDownOutside?.(e);
          // A press on the trigger is the trigger's own click, which unpins it.
          if (e.defaultPrevented || triggerRef.current?.contains(e.target as Node)) return;
          dismiss();
        }}
        className={cn(
          "z-50 w-72 rounded-lg border border-border bg-surface-raised p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
});
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
export type { HoverCardProps };
