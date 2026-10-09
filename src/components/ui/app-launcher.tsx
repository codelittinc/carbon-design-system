"use client";

import { useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Grip } from "lucide-react";
import { cn } from "@/lib/cn";
import { eyebrowClass, headerIconButtonClass, optionRowClass } from "@/lib/ui-classes";
import { Badge } from "./badge";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { NewTabHint, newTabRel } from "./new-tab";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

export interface AppLauncherApp {
  name: string;
  /** Where the app lives. `null` when its link is unknown: shown, not linked. */
  href: string | null;
  /** The app this launcher sits in: highlighted, not linked. */
  current?: boolean;
}

export interface AppLauncherSection {
  heading: string;
  apps: AppLauncherApp[];
}

export interface AppLauncherProps {
  /** Sections without apps are left out; when all are empty the panel says so. */
  sections: AppLauncherSection[];
  /** A link under the list to the full catalog of the person's tools. */
  moreHref?: string;
  moreLabel?: string;
  /** One line over the list, e.g. when the app links could not load. */
  notice?: ReactNode;
  /** The trigger's accessible name and tooltip, and the panel's name. */
  label?: string;
  currentLabel?: string;
  unavailableLabel?: string;
  /** Screen-reader text after each link's name. Starts with a space. */
  newTabLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Applied to the trigger. */
  className?: string;
}

/** A link's row: an option row that wraps a long name instead of clipping it. */
const appRowClass = cn(optionRowClass, "h-full items-start break-words");

const appLinkClass =
  "text-text-primary hover:bg-surface-overlay focus-visible:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent/50";

/**
 * The grid-icon button that lists the apps and tools a person can open, in
 * sections. Links open in a new tab. Purely presentational: the app fetches
 * the list and passes it in.
 */
export function AppLauncher({
  sections,
  moreHref,
  moreLabel = "All your tools",
  notice,
  label = "Carbon apps",
  currentLabel = "Current",
  unavailableLabel = "Link unavailable",
  newTabLabel = " (opens in a new tab)",
  emptyTitle = "No apps to show yet",
  emptyDescription = "Apps and tools you have access to show up here once IT gives you access.",
  className,
}: AppLauncherProps): ReactElement {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const shown = sections
    .filter((section) => section.apps.length > 0)
    .map((section) => ({
      ...section,
      apps: [...section.apps].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  const hasLinks = shown.some((section) => section.apps.some((app) => app.href && !app.current));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          title={label}
          className={cn(headerIconButtonClass, className)}
        >
          <Grip size={16} aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label={label}
        // Radix focuses the panel itself when its first tabbable is a link;
        // the first app is where a keyboard user wants to land.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (listRef.current?.querySelector<HTMLElement>("a[href]") ?? listRef.current)?.focus();
        }}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-[22rem] max-w-[calc(100vw-1rem)] flex-col p-0"
      >
        {notice && <p className="border-b border-border px-3 py-2 text-xs text-text-muted">{notice}</p>}
        {/* Not ScrollArea: its viewport cannot scroll inside a max height. */}
        <div
          ref={listRef}
          tabIndex={hasLinks ? undefined : 0}
          className="max-h-[min(32rem,calc(var(--radix-popover-content-available-height)-1rem))] min-h-0 overflow-y-auto p-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
        >
          {shown.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} className="py-8" />
          ) : (
            <div className="space-y-2">
              {shown.map((section, i) => (
                <div key={`${i}-${section.heading}`} role="group" aria-labelledby={`${headingId}-${i}`}>
                  <p id={`${headingId}-${i}`} className={cn(eyebrowClass, "px-2 pb-1 pt-1")}>
                    {section.heading}
                  </p>
                  <ul className="grid grid-cols-1 gap-1 min-[360px]:grid-cols-2">
                    {section.apps.map((app, j) => (
                      <li key={`${j}-${app.name}`}>
                        <AppItem
                          app={app}
                          currentLabel={currentLabel}
                          unavailableLabel={unavailableLabel}
                          newTabLabel={newTabLabel}
                          onOpen={() => setOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        {moreHref && (
          <>
            <Separator />
            <div className="p-2">
              <a
                href={moreHref}
                target="_blank"
                rel={newTabRel()}
                onClick={() => setOpen(false)}
                className={cn(appRowClass, appLinkClass, "items-center text-accent-text")}
              >
                <span className="min-w-0 flex-1">{moreLabel}</span>
                <NewTabHint label={newTabLabel} />
              </a>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AppItem({
  app,
  currentLabel,
  unavailableLabel,
  newTabLabel,
  onOpen,
}: {
  app: AppLauncherApp;
  currentLabel: string;
  unavailableLabel: string;
  newTabLabel: string;
  onOpen: () => void;
}): ReactElement {
  if (app.current) {
    return (
      <div className={cn(appRowClass, "cursor-default flex-wrap bg-accent-muted text-accent-text")}>
        <span className="min-w-0 flex-1">{app.name}</span>
        <Badge>{currentLabel}</Badge>
      </div>
    );
  }
  if (!app.href) {
    return (
      <div className={cn(appRowClass, "cursor-default flex-col gap-0 text-text-muted")}>
        <span className="min-w-0">{app.name}</span>
        <span className="text-xs">{unavailableLabel}</span>
      </div>
    );
  }
  return (
    <a href={app.href} target="_blank" rel={newTabRel()} onClick={onOpen} className={cn(appRowClass, appLinkClass)}>
      <span className="min-w-0 flex-1">{app.name}</span>
      <NewTabHint label={newTabLabel} iconClassName="mt-1 text-text-muted" />
    </a>
  );
}
