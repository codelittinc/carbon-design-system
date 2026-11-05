"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Compose an ordered path from ancestor locations to the current page. */
export const Breadcrumb = forwardRef<HTMLElement, ComponentPropsWithoutRef<"nav">>(
  ({ className, ...props }, ref) => {
    return <nav ref={ref} aria-label="Breadcrumb" className={className} {...props} />;
  },
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = forwardRef<HTMLOListElement, ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => {
    return <ol ref={ref} className={cn("flex flex-wrap items-center gap-2 text-sm text-text-muted", className)} {...props} />;
  },
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = forwardRef<HTMLLIElement, ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => {
    return <li ref={ref} className={cn("inline-flex min-w-0 max-w-full items-center gap-2", className)} {...props} />;
  },
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends ComponentPropsWithoutRef<"a"> {
  /** Style a router link instead of rendering another anchor. */
  asChild?: boolean;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return <Comp ref={ref} className={cn(
      "min-w-0 rounded-sm [overflow-wrap:anywhere] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
      className,
    )} {...props} />;
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

/** The current location is text, so it does not add a redundant link or tab stop. */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} aria-current="page" className={cn("min-w-0 [overflow-wrap:anywhere] text-text-primary", className)} {...props} />;
  },
);
BreadcrumbPage.displayName = "BreadcrumbPage";

/** Place inside the preceding BreadcrumbItem so it stays with its link when wrapping. */
export const BreadcrumbSeparator = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<"span">>(
  ({ children, className, ...props }, ref) => (
    <span ref={ref} aria-hidden="true" className={cn("shrink-0", className)} {...props}>
      {children ?? <ChevronRight size={14} />}
    </span>
  ),
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
