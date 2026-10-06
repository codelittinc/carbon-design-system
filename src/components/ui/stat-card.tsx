import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { eyebrowClass } from "@/lib/ui-classes";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Optional sub-line, e.g. a delta or context. Colored by trend. */
  sub?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
  /** Top-right of the tile, level with the label: a link, a menu, an info tooltip. */
  action?: ReactNode;
  /** Anything under the value and sub-line: a breakdown, a Progress, a link. */
  children?: ReactNode;
  /** Merged onto the value, e.g. a tone (`text-error-text`) or a smaller size. */
  valueClassName?: string;
  className?: string;
}

/**
 * KPI/metric tile: an uppercase label, a large monospace value, and an optional
 * trend-colored sub-line. Shows a skeleton in place of the value while loading.
 */
export function StatCard({
  label,
  value,
  sub,
  trend,
  loading,
  action,
  children,
  valueClassName,
  className,
}: StatCardProps): ReactElement {
  return (
    <Card padding="none" className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className={eyebrowClass}>{label}</p>
        {action && <div className="-my-1 shrink-0">{action}</div>}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p
          className={cn(
            "mt-1 font-[family-name:var(--font-mono)] text-2xl font-semibold tracking-tight text-text-primary",
            valueClassName,
          )}
        >
          {value}
        </p>
      )}
      {sub && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-success",
            trend === "down" && "text-error",
            (!trend || trend === "neutral") && "text-text-muted",
          )}
        >
          {sub}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}
