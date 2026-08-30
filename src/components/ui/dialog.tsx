"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

/**
 * The dialog itself: capped at `85dvh`, and a flex column so a `DialogBody`
 * inside it can be the thing that scrolls.
 *
 * `dvh` and not `vh`: on a phone `vh` measures the viewport with the browser
 * chrome retracted, so an `85vh` dialog is taller than the screen it is on for
 * as long as the address bar is showing — exactly when somebody is reaching for
 * its buttons. The cap is overridable: `cn` is tailwind-merge, so a `max-h-*` in
 * `className` replaces it rather than fighting it.
 *
 * **It is a scroll container, so it CLIPS.** Anything absolutely positioned
 * inside a dialog that used to spill past its edge — `SearchSelect`'s dropdown
 * is the one in this package — is now cut off at the boundary. Radix-based
 * `Select`, `Popover` and `Tooltip` portal out and are unaffected. A consumer
 * that needs the old behaviour more than it needs the cap can pass
 * `overflow-visible`, which tailwind-merge will honour.
 */

const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50">
        <X size={16} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

/**
 * The scrolling middle of a dialog, between a pinned header and footer.
 *
 * **Use this whenever a dialog can get long.** `DialogContent` caps itself and
 * will scroll as a whole without it, which keeps a tall dialog reachable — but
 * scrolling the whole dialog takes the footer with it, so the primary action ends
 * up below the fold of its own dialog, and it takes the close X too, which is
 * positioned against the content box and scrolls out of view with everything
 * else. Wrapping the body in this keeps all three still and moves only the part
 * that is actually long.
 *
 * `min-h-0` is the load-bearing class and the reason this is a component rather
 * than a line in a consumer's `className`: a flex child defaults to
 * `min-height: auto` and refuses to shrink below its content, so `overflow-y-auto`
 * never engages without it. It is an easy thing to write out by hand and get
 * subtly wrong.
 */
function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto", className)} {...props} />;
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // `shrink-0` so the header keeps its height when a `DialogBody` beside it is
  // competing for the same capped space.
  return <div className={cn("mb-4 shrink-0 space-y-1", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-text-primary", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-muted", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // `shrink-0` for the same reason as the header, and it matters more here: this
  // is where the button somebody is looking for lives.
  return <div className={cn("mt-6 flex shrink-0 justify-end gap-2", className)} {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
