import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { eyebrowClass } from "@/lib/ui-classes";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional sub-line, e.g. a delta or context. Colored by trend. */
  sub?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
  className?: string;
}

/**
 * KPI/metric tile: an uppercase label, a large monospace value, and an optional
 * trend-colored sub-line. Shows a skeleton in place of the value while loading.
 */
export function StatCard({ label, value, sub, trend, loading, className }: StatCardProps): ReactElement {
  return (
    <Card padding="none" className={cn("p-4", className)}>
      <p className={eyebrowClass}>{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className="mt-1 font-[family-name:var(--font-mono)] text-2xl font-semibold tracking-tight text-text-primary">
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
    </Card>
  );
}
