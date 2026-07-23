"use client";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef, createContext, useState, useCallback, useRef, useEffect, useContext, useMemo, useId } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, ChevronDown, X, ArrowUpDown, ChevronLeft, ChevronRight, Search, Sun, Moon } from 'lucide-react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Command } from 'cmdk';

// src/lib/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/lib/format.ts
function formatMoney(value) {
  if (value == null || value === "") return "$0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (num < 0) return `($${formatted})`;
  return `$${formatted}`;
}
function formatDate(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatPeriodLabel(month, year) {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[month - 1]} ${year}`;
}
var loadPromise = null;
function getApiKey() {
  const viteEnv = import.meta.env;
  const nodeEnv = globalThis.process?.env;
  return viteEnv?.VITE_GOOGLE_MAPS_API_KEY ?? nodeEnv?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}
function loadGoogleMaps() {
  if (loadPromise) return loadPromise;
  const key = getApiKey();
  if (!key || typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return loadPromise;
}
function AddressAutocomplete({ value, onChange, onBlur, placeholder = "Start typing an address...", className, variant = "staff" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address) {
      onChange(place.formatted_address);
    }
  }, [onChange]);
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps().then(() => {
      if (!mounted || !inputRef.current || !window.google?.maps?.places) return;
      if (autocompleteRef.current) return;
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"]
      });
      ac.addListener("place_changed", handlePlaceSelect);
      autocompleteRef.current = ac;
    });
    return () => {
      mounted = false;
    };
  }, [handlePlaceSelect]);
  const baseClass = variant === "public" ? "flex h-9 w-full rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500" : "flex h-8 w-full rounded-md border border-border bg-surface-raised px-3 py-1 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50";
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value,
      onChange: (e) => onChange(e.target.value),
      onBlur,
      placeholder,
      className: cn(baseClass, className)
    }
  );
}
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-amber-500 text-carbon-950 hover:bg-amber-400",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
        link: "text-accent-text underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
        icon: "h-8 w-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
var badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-surface-overlay text-text-secondary",
        accent: "bg-amber-500/15 text-accent-text",
        success: "bg-green-500/15 text-success-text",
        warning: "bg-amber-500/15 text-accent-text",
        error: "bg-red-500/15 text-error-text",
        info: "bg-blue-500/15 text-info-text"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("span", { className: cn(badgeVariants({ variant }), className), ...props });
}
var STATUS_MAP = {
  OPEN: "success",
  ACTIVE: "success",
  APPROVED: "success",
  POSTED: "success",
  CURRENT: "success",
  PAID: "success",
  COMPLETED: "success",
  CLOSED: "error",
  VOIDED: "error",
  CANCELLED: "error",
  REJECTED: "error",
  PAST_RESIDENT: "error",
  SOFT_CLOSED: "warning",
  PENDING: "warning",
  PENDING_APPROVAL: "warning",
  DRAFT: "default",
  NOTICE: "warning",
  PARTIALLY_PAID: "info",
  PARTIALLY_FULFILLED: "info",
  IN_PROGRESS: "info",
  APPLICANT: "info"
};
function StatusBadge({ status, className }) {
  const variant = STATUS_MAP[status] ?? "default";
  const label = status.replace(/_/g, " ");
  return /* @__PURE__ */ jsx(Badge, { variant, className, children: label });
}
var Input = forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-8 w-full rounded-md border border-border bg-surface-raised px-3 py-1 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
var Textarea = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
var Checkbox = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded border border-border bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-carbon-950",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 }) })
  }
));
Checkbox.displayName = "Checkbox";
var Switch = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitive.Root,
  {
    ref,
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-border",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitive.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = "Switch";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
var SelectContent = forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: /* @__PURE__ */ jsx(
      SelectPrimitive.Viewport,
      {
        className: cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        ),
        children
      }
    )
  }
) }));
SelectContent.displayName = "SelectContent";
var SelectItem = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-text-secondary outline-none focus:bg-surface-overlay focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { size: 12 }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = "SelectItem";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogClose = DialogPrimitive.Close;
var DialogPortal = DialogPrimitive.Portal;
var DialogOverlay = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
      ]
    }
  )
] }));
DialogContent.displayName = "DialogContent";
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mb-4 space-y-1", className), ...props });
}
function DialogTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx("h2", { className: cn("text-lg font-semibold text-text-primary", className), ...props });
}
function DialogDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx("p", { className: cn("text-sm text-text-muted", className), ...props });
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mt-6 flex justify-end gap-2", className), ...props });
}
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPrimitive.Portal, { children: [
  /* @__PURE__ */ jsx(AlertDialogPrimitive.Overlay, { className: "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = "AlertDialogContent";
function AlertDialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mb-4 space-y-1", className), ...props });
}
var AlertDialogTitle = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-text-primary", className),
    ...props
  }
));
AlertDialogTitle.displayName = "AlertDialogTitle";
var AlertDialogDescription = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-text-muted", className),
    ...props
  }
));
AlertDialogDescription.displayName = "AlertDialogDescription";
function AlertDialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mt-6 flex justify-end gap-2", className), ...props });
}
var AlertDialogAction = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = "AlertDialogAction";
var AlertDialogCancel = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), className),
    ...props
  }
));
AlertDialogCancel.displayName = "AlertDialogCancel";
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuContent = forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface-raised p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = "DropdownMenuContent";
var DropdownMenuItem = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary outline-none transition-colors focus:bg-surface-overlay focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = "DropdownMenuItem";
var DropdownMenuSeparator = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-border", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
var DropdownMenuLabel = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-xs font-medium text-text-muted", className),
    ...props
  }
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";
var Sheet = DialogPrimitive.Root;
var SheetTrigger = DialogPrimitive.Trigger;
var SheetClose = DialogPrimitive.Close;
var SheetPortal = DialogPrimitive.Portal;
var SheetOverlay = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
SheetOverlay.displayName = "SheetOverlay";
var SheetContent = forwardRef(
  ({ className, children, side = "right", ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        ref,
        className: cn(
          "fixed z-50 flex h-full flex-col border-border bg-surface-raised shadow-lg transition duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right" && "inset-y-0 right-0 w-full max-w-lg border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" && "inset-y-0 left-0 w-full max-w-lg border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsx(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
        ]
      }
    )
  ] })
);
SheetContent.displayName = "SheetContent";
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("border-b border-border px-6 py-4", className), ...props });
}
function SheetTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx("h2", { className: cn("text-lg font-semibold text-text-primary", className), ...props });
}
function SheetBody({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex-1 overflow-y-auto px-6 py-4", className), ...props });
}
function SheetFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex justify-end gap-2 border-t border-border px-6 py-4", className), ...props });
}
var Separator2 = forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    ),
    ...props
  }
));
Separator2.displayName = "Separator";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-surface-overlay", className),
      ...props
    }
  );
}
var Progress = forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-overlay", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full bg-amber-500 transition-all",
        style: { width: `${value ?? 0}%` }
      }
    )
  }
));
Progress.displayName = "Progress";
var Tabs = TabsPrimitive.Root;
var TabsList = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex items-center gap-1 border-b border-border",
      className
    ),
    ...props
  }
));
TabsList.displayName = "TabsList";
var TabsTrigger = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center px-3 pb-2 pt-1 text-sm font-medium text-text-muted transition-colors hover:text-text-secondary data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-accent-text data-[state=active]:-mb-px",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn("mt-4 focus-visible:outline-none", className),
    ...props
  }
));
TabsContent.displayName = "TabsContent";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-surface-overlay px-2.5 py-1 text-xs text-text-secondary shadow-md animate-in fade-in-0 zoom-in-95",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = "TooltipContent";
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverAnchor = PopoverPrimitive.Anchor;
var PopoverContent = forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-lg border border-border bg-surface-raised p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = "PopoverContent";
var ScrollArea = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(ScrollAreaPrimitive.Root, { ref, className: cn("relative overflow-hidden", className), ...props, children: [
  /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
  /* @__PURE__ */ jsx(
    ScrollAreaPrimitive.ScrollAreaScrollbar,
    {
      orientation: "vertical",
      className: "flex h-full w-2 touch-none select-none border-l border-l-transparent p-px transition-colors",
      children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
    }
  ),
  /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
] }));
ScrollArea.displayName = "ScrollArea";
var ToastContext = createContext({ toast: () => {
} });
function useToast() {
  return useContext(ToastContext);
}
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((t) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4e3);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { toast: addToast }, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2", children: toasts.map((t) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex w-80 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right",
          t.variant === "error" ? "border-red-500/30 bg-red-500/10" : t.variant === "success" ? "border-green-500/30 bg-green-500/10" : "border-border bg-surface-raised"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-text-primary", children: t.title }),
            t.description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-text-muted", children: t.description })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => removeToast(t.id),
              className: "text-text-muted hover:text-text-primary",
              children: /* @__PURE__ */ jsx(X, { size: 14 })
            }
          )
        ]
      },
      t.id
    )) })
  ] });
}
function EmptyState({ icon, title, description, action, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center py-16 text-center", className), children: [
    icon && /* @__PURE__ */ jsx("div", { className: "mb-4 text-text-faint", children: icon }),
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-primary", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-sm text-sm text-text-muted", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4", children: action })
  ] });
}
function PageHeader({ title, description, actions, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-6 flex items-start justify-between", className), children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-[family-name:var(--font-display)] text-2xl text-text-primary", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-text-muted", children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: actions })
  ] });
}
function DataTable({
  columns,
  data,
  onRowClick,
  pageSize = 25,
  enableSelection = false,
  emptyMessage = "No results."
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    state: { sorting, columnFilters, rowSelection },
    initialState: { pagination: { pageSize } }
  });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx("tr", { className: "border-b border-border", children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
        "th",
        {
          className: cn(
            "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted",
            header.column.getCanSort() && "cursor-pointer select-none"
          ),
          onClick: header.column.getToggleSortingHandler(),
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()),
            header.column.getCanSort() && /* @__PURE__ */ jsx(ArrowUpDown, { size: 12, className: "text-text-faint" })
          ] })
        },
        header.id
      )) }, headerGroup.id)) }),
      /* @__PURE__ */ jsx("tbody", { children: table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
        "tr",
        {
          className: cn(
            "border-b border-border-subtle transition-colors last:border-0",
            onRowClick && "cursor-pointer hover:bg-surface-overlay",
            row.getIsSelected() && "bg-amber-500/5"
          ),
          onClick: () => onRowClick?.(row.original),
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-text-secondary", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
        },
        row.id
      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length, className: "px-3 py-8 text-center text-text-muted", children: emptyMessage }) }) })
    ] }) }),
    table.getPageCount() > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1 pt-3", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-text-muted", children: [
        table.getFilteredRowModel().rows.length,
        " row(s)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "px-2 text-xs text-text-secondary", children: [
          table.getState().pagination.pageIndex + 1,
          " / ",
          table.getPageCount()
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => table.nextPage(),
            disabled: !table.getCanNextPage(),
            children: /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
          }
        )
      ] })
    ] })
  ] });
}
function clean(raw) {
  const neg = raw.trim().startsWith("-");
  const digits = raw.replace(/[^0-9.]/g, "");
  const parts = digits.split(".");
  const joined = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : digits;
  return (neg ? "-" : "") + joined;
}
function formatForDisplay(value) {
  if (!value || value === "-" || value === ".") return value;
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  const abs = Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `(${abs})` : abs;
}
var MoneyInput = forwardRef(
  ({ className, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const handleChange = useCallback(
      (e) => onChange(clean(e.target.value)),
      [onChange]
    );
    const handleFocus = useCallback(
      (e) => {
        setFocused(true);
        e.target.select();
        onFocus?.(e);
      },
      [onFocus]
    );
    const handleBlur = useCallback(
      (e) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted", children: "$" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref,
          type: "text",
          inputMode: "decimal",
          className: cn(
            "flex h-8 w-full rounded-md border border-border bg-surface-raised py-1 pl-7 pr-3 text-right font-[family-name:var(--font-mono)] text-sm tabular-nums text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50",
            className
          ),
          value: focused ? value : formatForDisplay(value),
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...props
        }
      )
    ] });
  }
);
MoneyInput.displayName = "MoneyInput";
function CommandPalette({ open, onOpenChange, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", children: [
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60", onClick: () => onOpenChange(false) }),
    /* @__PURE__ */ jsx("div", { className: "fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2", children: /* @__PURE__ */ jsxs(
      Command,
      {
        className: "overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl",
        loop: true,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3", children: [
            /* @__PURE__ */ jsx(Search, { size: 16, className: "text-text-muted" }),
            /* @__PURE__ */ jsx(
              Command.Input,
              {
                placeholder: "Search or type a command...",
                className: "flex-1 bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Command.List, { className: "max-h-80 overflow-y-auto p-2", children: [
            /* @__PURE__ */ jsx(Command.Empty, { className: "py-6 text-center text-sm text-text-muted", children: "No results found." }),
            children
          ] })
        ]
      }
    ) })
  ] });
}
function CommandGroup({ heading, children }) {
  return /* @__PURE__ */ jsx(
    Command.Group,
    {
      heading,
      className: "[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-faint",
      children
    }
  );
}
function CommandItem({ onSelect, icon, children }) {
  return /* @__PURE__ */ jsxs(
    Command.Item,
    {
      onSelect,
      className: cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors",
        "data-[selected=true]:bg-surface-overlay data-[selected=true]:text-text-primary"
      ),
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "text-text-muted", children: icon }),
        children
      ]
    }
  );
}
function SearchSelect({
  value,
  onChange,
  onSearch,
  options,
  loading = false,
  placeholder = "Search...",
  className,
  clearable = true,
  renderOption
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(void 0);
  const selectedOption = options.find((o) => o.value === value);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleQueryChange = useCallback(
    (q) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(q), 300);
    },
    [onSearch]
  );
  const handleSelect = useCallback(
    (val) => {
      onChange(val);
      setOpen(false);
      setQuery("");
    },
    [onChange]
  );
  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange(null);
      setQuery("");
    },
    [onChange]
  );
  return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        },
        className: "flex h-8 w-full items-center justify-between rounded-md border border-border bg-surface-raised px-3 text-sm transition-colors hover:border-text-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50",
        children: [
          /* @__PURE__ */ jsx("span", { className: selectedOption ? "text-text-primary" : "text-text-muted", children: selectedOption?.label ?? placeholder }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            clearable && value && /* @__PURE__ */ jsx(
              "span",
              {
                role: "button",
                tabIndex: -1,
                onClick: handleClear,
                className: "rounded p-0.5 text-text-muted hover:text-text-primary",
                children: /* @__PURE__ */ jsx(X, { size: 12 })
              }
            ),
            /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] rounded-lg border border-border bg-surface-raised shadow-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
        /* @__PURE__ */ jsx(Search, { size: 14, className: "text-text-muted" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "text",
            value: query,
            onChange: (e) => handleQueryChange(e.target.value),
            placeholder,
            className: "flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto py-1", children: loading ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-text-muted", children: "Searching..." }) : options.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-text-muted", children: "No results" }) : options.map((option) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => handleSelect(option.value),
          className: cn(
            "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-surface-overlay",
            option.value === value && "bg-amber-500/10 text-accent-text"
          ),
          children: renderOption ? renderOption(option) : /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-text-primary", children: option.label }),
            option.sublabel && /* @__PURE__ */ jsx("div", { className: "text-xs text-text-muted", children: option.sublabel })
          ] })
        },
        option.value
      )) })
    ] })
  ] });
}
function Money({ value, colorNegative, className, ...props }) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isNegative = typeof num === "number" && !isNaN(num) && num < 0;
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "font-[family-name:var(--font-mono)] tabular-nums",
        colorNegative && isNegative && "text-error",
        className
      ),
      ...props,
      children: formatMoney(value)
    }
  );
}
function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-1", className), children: [
    /* @__PURE__ */ jsxs("label", { htmlFor, className: "block text-xs font-medium text-text-muted", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "ml-0.5 text-error", children: "*" })
    ] }),
    children,
    error ? /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error }) : hint ? /* @__PURE__ */ jsx("p", { className: "text-xs text-text-faint", children: hint }) : null
  ] });
}
function DefinitionList({ columns = 2, className, children }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "grid gap-4 text-sm",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        className
      ),
      children
    }
  );
}
function DefinitionItem({ label, children, className }) {
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx("p", { className: "text-text-muted", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-text-primary", children })
  ] });
}
function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-4 flex items-center gap-3", className), children: [
    onSearchChange && /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1", children: [
      /* @__PURE__ */ jsx(
        Search,
        {
          size: 14,
          className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          value: search ?? "",
          onChange: (e) => onSearchChange(e.target.value),
          placeholder: searchPlaceholder,
          className: "pl-9"
        }
      )
    ] }),
    children
  ] });
}
function StatCard({ label, value, sub, trend, loading, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("rounded-lg border border-border-subtle bg-surface p-4", className), children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium uppercase tracking-widest text-text-faint", children: label }),
    loading ? /* @__PURE__ */ jsx(Skeleton, { className: "mt-2 h-7 w-24" }) : /* @__PURE__ */ jsx("p", { className: "mt-1 font-[family-name:var(--font-mono)] text-2xl font-semibold tracking-tight text-text-primary", children: value }),
    sub && /* @__PURE__ */ jsx(
      "p",
      {
        className: cn(
          "mt-1 text-xs",
          trend === "up" && "text-success",
          trend === "down" && "text-error",
          (!trend || trend === "neutral") && "text-text-muted"
        ),
        children: sub
      }
    )
  ] });
}
var MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
var selectClass = "h-7 rounded border border-border bg-surface-raised px-1.5 text-xs text-text-primary";
function DateRangePicker({ value, onChange, years, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1.5 text-xs", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.startMonth,
          onChange: (e) => onChange({ ...value, startMonth: Number(e.target.value) }),
          className: selectClass,
          children: MONTH_NAMES.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i))
        }
      ),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.startYear,
          onChange: (e) => onChange({ ...value, startYear: Number(e.target.value) }),
          className: selectClass,
          children: years.map((y) => /* @__PURE__ */ jsx("option", { value: y, children: y }, y))
        }
      )
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-text-muted", children: "to" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.endMonth,
          onChange: (e) => onChange({ ...value, endMonth: Number(e.target.value) }),
          className: selectClass,
          children: MONTH_NAMES.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i))
        }
      ),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.endYear,
          onChange: (e) => onChange({ ...value, endYear: Number(e.target.value) }),
          className: selectClass,
          children: years.map((y) => /* @__PURE__ */ jsx("option", { value: y, children: y }, y))
        }
      )
    ] })
  ] });
}
var STORAGE_KEY = "carbon-theme";
var THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark")t="dark";var c=document.documentElement.classList;c.remove("light","dark");c.add(t);}catch(e){}})();`;
function applyTheme(theme) {
  const classList = document.documentElement.classList;
  classList.remove("light", "dark");
  classList.add(theme);
}
var ThemeContext = createContext(null);
function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  useEffect(() => {
    setThemeState(
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );
  }, []);
  const setTheme = useCallback((next) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
    }
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, setTheme, toggleTheme }, children });
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: toggleTheme,
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      title: isDark ? "Switch to light mode" : "Switch to dark mode",
      className: cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised transition-colors hover:border-carbon-600",
        className
      ),
      children: mounted ? isDark ? /* @__PURE__ */ jsx(Sun, { size: 16, className: "text-amber-500", fill: "currentColor" }) : /* @__PURE__ */ jsx(Moon, { size: 16, className: "text-indigo-400", fill: "currentColor" }) : /* @__PURE__ */ jsx("span", { className: "h-4 w-4" })
    }
  );
}
function AccountCombobox({
  accounts,
  value,
  onChange,
  placeholder = "Search account\u2026",
  variant = "default",
  clearable = false,
  disabled = false,
  id,
  className
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const selected = accounts.find((a) => a.id === value);
  const filtered = useMemo(() => {
    if (!query) return accounts;
    const q = query.toLowerCase();
    return accounts.filter(
      (a) => a.accountNumber.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [accounts, query]);
  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);
  useEffect(() => {
    const el = listRef.current?.children[highlightIdx];
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);
  const selectAccount = useCallback(
    (accountId) => {
      onChange(accountId);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );
  const clear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange("");
      setQuery("");
      setIsOpen(false);
    },
    [onChange]
  );
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightIdx((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filtered[highlightIdx]) selectAccount(filtered[highlightIdx].id);
      e.preventDefault();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      setQuery("");
    }
  };
  const inputClasses = variant === "inline" ? cn(
    "h-7 w-full rounded border-0 bg-transparent px-1 text-xs focus:ring-1 focus:ring-amber-500/50",
    selected ? "text-text-primary" : "text-text-faint"
  ) : cn(
    "h-8 w-full rounded-md border border-border bg-surface-raised px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/50",
    clearable && selected ? "pr-8" : "",
    selected ? "text-text-primary" : "text-text-muted"
  );
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        id,
        ref: inputRef,
        type: "text",
        role: "combobox",
        "aria-expanded": isOpen,
        "aria-autocomplete": "list",
        "data-1p-ignore": true,
        autoComplete: "off",
        disabled,
        value: isOpen ? query : selected ? `${selected.accountNumber} \u2014 ${selected.name}` : "",
        placeholder,
        onChange: (e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        },
        onFocus: () => {
          setIsOpen(true);
          setQuery("");
        },
        onBlur: () => setTimeout(() => setIsOpen(false), 150),
        onKeyDown: handleKeyDown,
        className: inputClasses
      }
    ),
    clearable && selected && !isOpen && variant === "default" && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": "Clear account",
        onClick: clear,
        className: "absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted hover:text-text-primary",
        children: /* @__PURE__ */ jsx(X, { size: 14 })
      }
    ),
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        ref: listRef,
        role: "listbox",
        className: "absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[18rem] overflow-y-auto rounded-md border border-border bg-surface-raised shadow-lg",
        children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-2 py-1.5 text-xs text-text-faint", children: "No matching accounts" }) : filtered.slice(0, 50).map((a, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": a.id === value,
            onMouseDown: (e) => e.preventDefault(),
            onClick: () => selectAccount(a.id),
            className: cn(
              "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-surface-overlay",
              i === highlightIdx && "bg-surface-overlay",
              a.id === value && "text-amber-400"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { className: "shrink-0 font-[family-name:var(--font-mono)] text-amber-400", children: a.accountNumber }),
              /* @__PURE__ */ jsx("span", { className: "truncate text-text-primary", children: a.name })
            ]
          },
          a.id
        ))
      }
    )
  ] });
}
function MultiStatusFilter({
  label = "Status",
  options,
  selected,
  onChange,
  className
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const summary = useMemo(() => {
    if (selected.length === 0) return "All statuses";
    if (selected.length === options.length) return "All statuses";
    const labels = options.filter((o) => selectedSet.has(o.value)).map((o) => o.label);
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.length} selected`;
  }, [selected.length, options, selectedSet]);
  const toggle = (value) => {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-label": `${label} filter`,
        className: cn(
          "flex h-8 items-center gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary hover:border-amber-500/50",
          className
        ),
        children: [
          /* @__PURE__ */ jsxs("span", { className: "text-text-muted", children: [
            label,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "max-w-[12rem] truncate", children: summary }),
          selected.length > 0 && selected.length < options.length && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-amber-500/20 px-1.5 text-xs tabular-nums text-amber-400", children: selected.length }),
          /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(PopoverContent, { align: "end", className: "w-60 p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between px-1 pb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-text-muted", children: label }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "text-amber-400 hover:underline disabled:opacity-40",
              disabled: selected.length === options.length,
              onClick: () => onChange(options.map((o) => o.value)),
              children: "All"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "text-text-muted hover:underline disabled:opacity-40",
              disabled: selected.length === 0,
              onClick: () => onChange([]),
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-72 overflow-y-auto", children: options.map((opt) => {
        const checked = selectedSet.has(opt.value);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "checkbox",
            "aria-checked": checked,
            onClick: () => toggle(opt.value),
            className: "flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-sm text-text-primary hover:bg-surface-overlay",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": "true",
                  className: cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked ? "border-amber-500 bg-amber-500 text-carbon-950" : "border-border bg-surface-raised"
                  ),
                  children: checked && /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 })
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: opt.label })
            ]
          },
          opt.value
        );
      }) })
    ] })
  ] });
}

// src/lib/google-places.ts
var GOOGLE_MAPS_SCRIPT_ID = "carbon-google-maps";
var GOOGLE_MAPS_LOAD_TIMEOUT_MS = 1e4;
var placesLibraryPromise = null;
function getApiKey2() {
  const viteEnv = import.meta.env;
  const nodeEnv = globalThis.process?.env;
  return viteEnv?.VITE_GOOGLE_MAPS_API_KEY ?? nodeEnv?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}
function hasGoogleImporter() {
  const maps = window.google?.maps;
  return typeof maps?.importLibrary === "function";
}
function removeOwnedScript() {
  const script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
  if (script?.dataset.carbonOwned === "true") script.remove();
}
function waitForGoogleMaps() {
  if (hasGoogleImporter()) return Promise.resolve();
  const key = getApiKey2();
  if (!key) return Promise.reject(new Error("Google address suggestions are not configured"));
  return new Promise((resolve, reject) => {
    let script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      if (error) {
        removeOwnedScript();
        reject(error);
      } else {
        resolve();
      }
    };
    const handleLoad = () => {
      if (hasGoogleImporter()) finish();
      else finish(new Error("Google Maps loaded without the Places library"));
    };
    const handleError = () => finish(new Error("Google Maps could not be loaded"));
    const timeout = window.setTimeout(
      () => finish(new Error("Google Maps took too long to load")),
      GOOGLE_MAPS_LOAD_TIMEOUT_MS
    );
    if (!script) {
      script = document.createElement("script");
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.dataset.carbonOwned = "true";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
      script.async = true;
    }
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!script.isConnected) document.head.appendChild(script);
    if (hasGoogleImporter()) finish();
  });
}
function loadGooglePlacesLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Places is only available in a browser"));
  }
  if (placesLibraryPromise) return placesLibraryPromise;
  placesLibraryPromise = waitForGoogleMaps().then(() => window.google.maps.importLibrary("places")).catch((error) => {
    placesLibraryPromise = null;
    throw error;
  });
  return placesLibraryPromise;
}

// src/components/ui/postal-address.ts
var EMPTY_POSTAL_ADDRESS = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US"
};
function postalAddressToDraft(address) {
  return address ? { ...address, addressLine2: address.addressLine2 ?? "" } : { ...EMPTY_POSTAL_ADDRESS };
}
function postalAddressFromDraft(address) {
  if (!address.addressLine1.trim()) return null;
  return {
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim() || null,
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim().toUpperCase() || "US"
  };
}
function isPostalAddressDraftComplete(address) {
  return Boolean(
    address.addressLine1.trim() && address.city.trim() && /^[A-Za-z]{2}$/.test(address.state.trim()) && /^\d{5}(?:-\d{4})?$/.test(address.postalCode.trim()) && address.country.trim()
  );
}
function component(components, type, short = false) {
  const found = components.find((item) => item.types.includes(type));
  return (short ? found?.shortText : found?.longText) ?? "";
}
function parseGooglePlaceAddress(place) {
  const components = place.addressComponents;
  if (!components) return null;
  const street = [component(components, "street_number"), component(components, "route")].filter(Boolean).join(" ");
  const city = component(components, "locality") || component(components, "postal_town") || component(components, "sublocality_level_1");
  const postalCode = component(components, "postal_code");
  const postalSuffix = component(components, "postal_code_suffix");
  return {
    addressLine1: street,
    addressLine2: component(components, "subpremise"),
    city,
    state: component(components, "administrative_area_level_1", true),
    postalCode: postalSuffix ? `${postalCode}-${postalSuffix}` : postalCode,
    country: component(components, "country", true) || "US"
  };
}
var SEARCH_DELAY_MS = 250;
var MIN_QUERY_LENGTH = 3;
function predictionText(prediction) {
  return {
    main: prediction.mainText?.toString() || prediction.text.toString(),
    secondary: prediction.secondaryText?.toString() || ""
  };
}
function AddressAutocomplete2({
  id,
  value,
  onChange,
  onAddressSelect,
  onBlur,
  placeholder = "Start typing an address...",
  className,
  variant = "staff",
  ariaLabel = "Address search",
  required = false,
  autoComplete = "street-address"
}) {
  const generatedId = useId().replaceAll(":", "");
  const inputId = id ?? `address-${generatedId}`;
  const listId = `${inputId}-suggestions`;
  const statusId = `${inputId}-status`;
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchActive, setSearchActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const requestSequence = useRef(0);
  const sessionToken = useRef(null);
  const suppressNextSearch = useRef(false);
  const blurTimer = useRef(null);
  useEffect(
    () => () => {
      requestSequence.current += 1;
      if (blurTimer.current !== null) window.clearTimeout(blurTimer.current);
    },
    []
  );
  useEffect(() => {
    const query = value.trim();
    const sequence = ++requestSequence.current;
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false;
      setSuggestions([]);
      setStatus("idle");
      return;
    }
    if (!searchActive || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setActiveIndex(-1);
      setStatus("idle");
      return;
    }
    const timer = window.setTimeout(() => {
      setStatus("loading");
      void loadGooglePlacesLibrary().then(async (places) => {
        if (requestSequence.current !== sequence) return;
        if (!sessionToken.current) sessionToken.current = new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ["us"],
          region: "us",
          sessionToken: sessionToken.current
        });
        if (requestSequence.current !== sequence) return;
        setSuggestions(response.suggestions.filter((item) => item.placePrediction));
        setActiveIndex(-1);
        setStatus("ready");
      }).catch(() => {
        if (requestSequence.current !== sequence) return;
        setSuggestions([]);
        setActiveIndex(-1);
        setStatus("unavailable");
      });
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [retryAttempt, searchActive, value]);
  const selectSuggestion = async (suggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    const sequence = ++requestSequence.current;
    setSuggestions([]);
    setActiveIndex(-1);
    setStatus("loading");
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
      if (requestSequence.current !== sequence) return;
      const parsed = parseGooglePlaceAddress(place);
      suppressNextSearch.current = true;
      if (parsed && onAddressSelect) onAddressSelect(parsed);
      else onChange(place.formattedAddress || prediction.text.toString());
      sessionToken.current = null;
      setSearchActive(false);
      setStatus("idle");
    } catch {
      if (requestSequence.current !== sequence) return;
      setStatus("unavailable");
    }
  };
  const handleKeyDown = (event) => {
    if (!suggestions.length) {
      if (event.key === "Escape") setSearchActive(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSuggestions([]);
      setActiveIndex(-1);
      setSearchActive(false);
    }
  };
  const baseClass = variant === "public" ? "flex h-9 w-full rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" : variant === "vendor" ? "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" : "flex h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50";
  const optionsVisible = searchActive && suggestions.length > 0;
  const mutedClass = variant === "vendor" ? "text-slate-500" : "text-text-muted";
  const optionClass = variant === "public" ? "border-gray-700 bg-gray-900 text-white" : variant === "vendor" ? "border-slate-200 bg-white text-slate-900" : "border-border bg-surface-raised text-text-primary";
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        id: inputId,
        type: "text",
        value,
        onChange: (event) => {
          requestSequence.current += 1;
          onChange(event.target.value);
          setSearchActive(true);
        },
        onFocus: () => setSearchActive(true),
        onBlur: () => {
          onBlur?.();
          blurTimer.current = window.setTimeout(() => {
            setSearchActive(false);
            setSuggestions([]);
            setActiveIndex(-1);
            sessionToken.current = null;
            requestSequence.current += 1;
          }, 0);
        },
        onKeyDown: handleKeyDown,
        placeholder,
        "aria-label": ariaLabel,
        "aria-autocomplete": "list",
        "aria-controls": listId,
        "aria-describedby": status === "idle" ? void 0 : statusId,
        "aria-expanded": optionsVisible,
        "aria-activedescendant": optionsVisible && activeIndex >= 0 ? `${listId}-${activeIndex}` : void 0,
        role: "combobox",
        required,
        autoComplete,
        className: cn(baseClass, className)
      }
    ),
    optionsVisible && /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "absolute left-0 right-0 top-full z-[70] mt-1 overflow-hidden rounded-md border shadow-xl",
          optionClass
        ),
        children: [
          /* @__PURE__ */ jsx(
            "ul",
            {
              id: listId,
              role: "listbox",
              "aria-label": "Address suggestions",
              className: "max-h-60 overflow-y-auto py-1",
              children: suggestions.map((suggestion, index) => {
                const prediction = suggestion.placePrediction;
                const text = predictionText(prediction);
                return /* @__PURE__ */ jsxs(
                  "li",
                  {
                    id: `${listId}-${index}`,
                    role: "option",
                    "aria-selected": activeIndex === index,
                    className: cn(
                      "cursor-pointer px-3 py-2 text-sm",
                      activeIndex === index && (variant === "vendor" ? "bg-emerald-50" : variant === "public" ? "bg-gray-800" : "bg-surface-overlay")
                    ),
                    onMouseDown: (event) => event.preventDefault(),
                    onMouseEnter: () => setActiveIndex(index),
                    onClick: () => void selectSuggestion(suggestion),
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "block font-medium", children: text.main }),
                      text.secondary && /* @__PURE__ */ jsx("span", { className: cn("mt-0.5 block text-xs", mutedClass), children: text.secondary })
                    ]
                  },
                  prediction.placeId
                );
              })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end border-t px-3 py-1.5", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: "https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png",
              alt: "Powered by Google",
              className: "h-[14px] w-auto"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: statusId,
        role: "status",
        "aria-live": "polite",
        className: cn("mt-1 text-xs", mutedClass),
        children: [
          status === "loading" && "Finding addresses\u2026",
          status === "ready" && !suggestions.length && value.trim().length >= MIN_QUERY_LENGTH && "No matches. Continue entering the address manually.",
          status === "unavailable" && /* @__PURE__ */ jsxs("span", { children: [
            "Address suggestions are unavailable. Continue entering the address manually.",
            " ",
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: cn(
                  "font-medium underline underline-offset-2",
                  variant === "vendor" ? "text-emerald-700" : "text-accent"
                ),
                onMouseDown: (event) => event.preventDefault(),
                onClick: () => {
                  sessionToken.current = null;
                  setSearchActive(true);
                  setRetryAttempt((attempt) => attempt + 1);
                },
                children: "Retry"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function StructuredAddressInput({
  value,
  onChange,
  variant = "staff",
  idPrefix,
  required = false
}) {
  const vendor = variant === "vendor";
  const inputClass = vendor ? "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" : "h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = vendor ? "mb-1 block text-xs font-medium text-slate-600" : "mb-1 block text-xs font-medium text-text-muted";
  const update = (field, next) => onChange({ ...value, [field]: next });
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "sm:col-span-4", children: [
      /* @__PURE__ */ jsxs("label", { className: labelClass, htmlFor: `${idPrefix}-line1`, children: [
        "Street address",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        AddressAutocomplete2,
        {
          id: `${idPrefix}-line1`,
          value: value.addressLine1,
          onChange: (next) => update("addressLine1", next),
          onAddressSelect: onChange,
          variant: vendor ? "vendor" : "staff",
          ariaLabel: `Street address${required ? " *" : ""}`,
          placeholder: "Start typing or enter manually",
          required,
          autoComplete: "address-line1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2", htmlFor: `${idPrefix}-line2`, children: [
      /* @__PURE__ */ jsx("span", { className: labelClass, children: "Apartment or suite" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-line2`,
          className: inputClass,
          value: value.addressLine2,
          onChange: (event) => update("addressLine2", event.target.value),
          autoComplete: "address-line2"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-3", htmlFor: `${idPrefix}-city`, children: [
      /* @__PURE__ */ jsxs("span", { className: labelClass, children: [
        "City",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-city`,
          className: inputClass,
          value: value.city,
          onChange: (event) => update("city", event.target.value),
          autoComplete: "address-level2",
          required
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-1", htmlFor: `${idPrefix}-state`, children: [
      /* @__PURE__ */ jsxs("span", { className: labelClass, children: [
        "State",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-state`,
          className: inputClass,
          value: value.state,
          onChange: (event) => update("state", event.target.value.toUpperCase()),
          autoComplete: "address-level1",
          maxLength: 2,
          required
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2", htmlFor: `${idPrefix}-postal`, children: [
      /* @__PURE__ */ jsxs("span", { className: labelClass, children: [
        "ZIP code",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-postal`,
          className: inputClass,
          value: value.postalCode,
          onChange: (event) => update("postalCode", event.target.value),
          autoComplete: "postal-code",
          inputMode: "numeric",
          required
        }
      )
    ] }),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "country", value: value.country || "US" })
  ] });
}

export { AccountCombobox, AddressAutocomplete, AddressAutocomplete2 as AddressCombobox, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, Button, Checkbox, CommandGroup, CommandItem, CommandPalette, DataTable, DateRangePicker, DefinitionItem, DefinitionList, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, EMPTY_POSTAL_ADDRESS, EmptyState, FilterBar, FormField, Input, Money, MoneyInput, MultiStatusFilter, PageHeader, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, Progress, ScrollArea, SearchSelect, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Separator2 as Separator, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, StatCard, StatusBadge, StructuredAddressInput, Switch, THEME_SCRIPT, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, ThemeProvider, ThemeToggle, ToastProvider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, badgeVariants, buttonVariants, cn, formatDate, formatMoney, formatPeriodLabel, isPostalAddressDraftComplete, parseGooglePlaceAddress, postalAddressFromDraft, postalAddressToDraft, useTheme, useToast };
