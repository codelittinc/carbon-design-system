"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Styles the single child instead of rendering an `<a>` — for a router's
   * link: `<TextLink asChild><Link href="/x">Open</Link></TextLink>`.
   */
  asChild?: boolean;
  /**
   * Leaves the app: opens in a new tab (`target="_blank"`, `rel="noopener
   * noreferrer"`) and shows the external icon, with "(opens in a new tab)"
   * for a screen reader.
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
        rel={external ? "noopener noreferrer" : rel}
        className={cn(
          "inline-flex items-baseline gap-1 rounded-sm font-medium text-accent-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          className,
        )}
        {...props}
      >
        <Slottable>{children}</Slottable>
        {external && (
          <>
            <ExternalLink size={12} aria-hidden="true" className="shrink-0 self-center" />
            <span className="sr-only">{" (opens in a new tab)"}</span>
          </>
        )}
      </Comp>
    );
  },
);
TextLink.displayName = "TextLink";

export { TextLink };
