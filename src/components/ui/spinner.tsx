import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  /**
   * Text shown under the spinner. Also its accessible name; without one the
   * spinner is announced as "Loading".
   */
  label?: string;
  className?: string;
}

/**
 * An indeterminate loading indicator, for work whose length is unknown. Prefer
 * `Skeleton` when the shape of the content that is coming is known.
 */
export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block animate-spin rounded-full border-accent border-r-transparent",
          sizeClasses[size],
        )}
      />
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </div>
  );
}
