"use client";

import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Grip } from "lucide-react";
import { cn } from "@/lib/cn";
import { headerIconButtonClass, optionRowClass } from "@/lib/ui-classes";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { useAppLogos, type AppLauncherLogos } from "./app-logos";
import { Monogram } from "./monogram";
import { NewTabHint, newTabRel } from "./new-tab";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

export type { AppLauncherLogos } from "./app-logos";

export interface AppLauncherApp {
  name: string;
  /**
   * Its access key in Gatekeeper (`apps[].key` from `GET /api/me`). With `logos`, the
   * launcher fetches this app's logo by it.
   */
  key?: string;
  /** Where the app lives. `null` when its link is unknown: shown, not linked. */
  href: string | null;
  /** The app this launcher sits in: highlighted, not linked. */
  current?: boolean;
  /**
   * Its logo, when the app already has one. Wins over `logos`. Missing or broken: its initials.
   */
  iconSrc?: string | null;
}

export interface AppLauncherSection {
  /** @deprecated Not shown: every section's apps are merged into one alphabetical list. */
  heading: string;
  apps: AppLauncherApp[];
}

export interface AppLauncherProps {
  /** Merged into one list sorted by name; when every section is empty the panel says so. */
  sections: AppLauncherSection[];
  /** A link under the list to the full catalog of the person's tools. */
  moreHref?: string;
  moreLabel?: string;
  /**
   * Where to get each app's logo, so the launcher owns it: given Gatekeeper's origin and the
   * person's session token, it fetches the logo of every app with a `key` when the panel opens.
   * No `logos`, or an app with none: its `iconSrc`, else its initials.
   */
  logos?: AppLauncherLogos;
  /**
   * A tile before each app's name: its logo, or its initials (`Monogram`). On unless
   * `false`; all apps or none, so the names stay aligned.
   */
  icons?: boolean;
  /** One line over the list, e.g. when the app links could not load. */
  notice?: ReactNode;
  /** The trigger's accessible name and tooltip, and the panel's name. */
  label?: string;
  /**
   * Screen-reader text after the current app's name, wrapped in parentheses. Nothing
   * visible: the row is marked by its highlight and a heavier weight.
   */
  currentLabel?: string;
  unavailableLabel?: string;
  /** Screen-reader text after each link's name. Starts with a space. */
  newTabLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Applied to the trigger. */
  className?: string;
}

/** An app's row: an option row whose name wraps instead of clipping, and can be selected to copy. */
const appRowClass = cn(optionRowClass, "h-full select-text items-start break-words");

const appLinkClass =
  "text-text-primary hover:bg-surface-overlay focus-visible:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent/50";

/**
 * The grid-icon button that lists the apps and tools a person can open, in
 * one alphabetical list. Links open in a new tab, said only to screen readers: the panel
 * is all links, so a per-row icon is noise. Purely presentational: the app fetches
 * the list and passes it in.
 */
export function AppLauncher({
  sections,
  moreHref,
  moreLabel = "All your tools",
  icons = true,
  logos,
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
  const listRef = useRef<HTMLDivElement>(null);

  const apps = sections.flatMap((section) => section.apps).sort((a, b) => a.name.localeCompare(b.name));
  const hasLinks = apps.some((app) => app.href && !app.current);
  const fetched = useAppLogos(
    logos,
    apps.flatMap((app) => (app.key && !app.iconSrc ? [app.key] : [])),
    icons && open,
  );

  return (
    // Modal: Tab stays in the panel, and closing it any way returns focus to the trigger.
    <Popover modal open={open} onOpenChange={setOpen}>
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
        {notice && <div className="border-b border-border px-3 py-2 text-xs text-text-muted">{notice}</div>}
        {/* Not ScrollArea: its viewport cannot scroll inside a max height. */}
        <div
          ref={listRef}
          tabIndex={hasLinks ? undefined : 0}
          className="max-h-[min(32rem,calc(var(--radix-popover-content-available-height)-1rem))] min-h-0 overflow-y-auto p-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
        >
          {apps.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} className="py-8" />
          ) : (
            <ul className="grid grid-cols-1 gap-1 min-[360px]:grid-cols-2">
              {apps.map((app, i) => (
                <li key={`${i}-${app.name}`}>
                  <AppItem
                    app={app}
                    iconSrc={app.iconSrc ?? (app.key ? fetched.get(app.key) : undefined)}
                    icon={icons}
                    currentLabel={currentLabel}
                    unavailableLabel={unavailableLabel}
                    newTabLabel={newTabLabel}
                    onOpen={() => setOpen(false)}
                  />
                </li>
              ))}
            </ul>
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
                <NewTabHint label={newTabLabel} icon={false} />
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
  iconSrc,
  icon,
  currentLabel,
  unavailableLabel,
  newTabLabel,
  onOpen,
}: {
  app: AppLauncherApp;
  iconSrc: string | null | undefined;
  icon: boolean;
  currentLabel: string;
  unavailableLabel: string;
  newTabLabel: string;
  onOpen: () => void;
}): ReactElement {
  const tile = icon ? <Monogram name={app.name} src={iconSrc} size="xs" className="mt-px" /> : null;
  if (app.current) {
    return (
      // font-medium as well as the fill, so the row is not marked by colour alone.
      <div aria-current="true" className={cn(appRowClass, "cursor-default bg-accent-muted font-medium text-accent-text")}>
        {tile}
        <span className="min-w-0 flex-1">
          {app.name}
          {/* select-none: copying the name does not pick up the hidden label. */}
          <span className="sr-only select-none"> ({currentLabel})</span>
        </span>
      </div>
    );
  }
  if (!app.href) {
    return (
      <div className={cn(appRowClass, "cursor-default text-text-muted")}>
        {tile}
        <span className="flex min-w-0 flex-1 flex-col">
          <span>{app.name}</span>
          <span className="text-xs">{unavailableLabel}</span>
        </span>
      </div>
    );
  }
  return (
    <a href={app.href} target="_blank" rel={newTabRel()} onClick={onOpen} className={cn(appRowClass, appLinkClass)}>
      {tile}
      <span className="min-w-0 flex-1">{app.name}</span>
      <NewTabHint label={newTabLabel} icon={false} />
    </a>
  );
}
