"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import { linkTextClass } from "@/lib/ui-classes";
import { NewTabHint, newTabRel } from "./new-tab";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Styles the single child instead of rendering an `<a>` — for a router's
   * link: `<TextLink asChild><Link href="/x">Open</Link></TextLink>`.
   */
  asChild?: boolean;
  /**
   * Leaves the app: opens in a new tab (`target="_blank"`, with `noopener
   * noreferrer` added to any `rel` you pass) and shows the external icon, with
   * "(opens in a new tab)" for a screen reader.
   */
  external?: boolean;
}

/**
 * A link inside running text or a table cell: accent-colored, underlined on
 * hover, with no button box around it. For a link that looks like a button,
 * use `<Button asChild><a/></Button>`.
 */
const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ asChild = false, external = false, className, children, target, rel, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        target={external ? "_blank" : target}
        rel={external ? newTabRel(rel) : rel}
        className={cn(
          linkTextClass,
          "inline-flex items-baseline gap-1 rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          className,
        )}
        {...props}
      >
        <Slottable>{children}</Slottable>
        {external && <NewTabHint iconClassName="self-center" />}
      </Comp>
    );
  },
);
TextLink.displayName = "TextLink";

export { TextLink };
