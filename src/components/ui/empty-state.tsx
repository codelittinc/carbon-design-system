import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  /**
   * The title's heading element. `h3` (default) for a gap inside a page; `h1`
   * when the empty state is the whole page ("Access denied", "Not found").
   */
  as?: "h1" | "h2" | "h3" | "h4";
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  as: Heading = "h3",
  description,
  action,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && <div className="mb-4 text-text-faint">{icon}</div>}
      <Heading className="text-sm font-medium text-text-primary">{title}</Heading>
      {description && <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
