"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Compose a folder or page path. Keep router links inside a client component. */
export function Breadcrumb({ className, ...props }: ComponentPropsWithoutRef<"nav">) {
  return <nav aria-label="Breadcrumb" className={className} {...props} />;
}

export function BreadcrumbList({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return <ol className={cn("flex flex-wrap items-center gap-2 text-sm text-text-muted", className)} {...props} />;
}

export function BreadcrumbItem({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li className={cn("inline-flex min-w-0 max-w-full items-center gap-2", className)} {...props} />;
}

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
export function BreadcrumbPage({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return <span aria-current="page" className={cn("min-w-0 [overflow-wrap:anywhere] text-text-primary", className)} {...props} />;
}

export function BreadcrumbSeparator({ children, className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li role="presentation" aria-hidden="true" className={cn("shrink-0", className)} {...props}>
    {children ?? <ChevronRight size={14} />}
  </li>;
}
