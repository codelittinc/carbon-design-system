import { cn } from "@/lib/cn";
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
export function StatCard({ label, value, sub, trend, loading, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border-subtle bg-surface p-4", className)}>
      <p className="text-[11px] font-medium uppercase tracking-widest text-text-faint">{label}</p>
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
    </div>
  );
}
