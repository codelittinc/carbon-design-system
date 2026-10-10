import type { ReactElement } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * How a link that opens a new tab looks and reads, shared by `TextLink` and
 * `AppLauncher` so the two never drift apart. Internal: not exported from the
 * package.
 */

/** `rel` with `noopener noreferrer` added, keeping whatever the caller set. */
export function newTabRel(rel?: string): string {
  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return [...tokens].join(" ");
}

interface NewTabHintProps {
  /** Screen-reader text after the link's name. Starts with a space. */
  label?: string;
  /** Leave out the icon, e.g. where every row is a new-tab link and the icon is noise. */
  icon?: boolean;
  iconClassName?: string;
}

/** The 12px external icon (unless `icon={false}`), and the sr-only "(opens in a new tab)". */
export function NewTabHint({
  label = " (opens in a new tab)",
  icon = true,
  iconClassName,
}: NewTabHintProps): ReactElement {
  return (
    <>
      {icon && <ExternalLink size={12} aria-hidden="true" className={cn("shrink-0", iconClassName)} />}
      <span className="sr-only">{label}</span>
    </>
  );
}
