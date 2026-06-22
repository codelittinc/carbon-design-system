import { cn } from "@/lib/cn";

interface DefinitionListProps {
  /** Number of columns in the grid. Defaults to 2. */
  columns?: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}

/**
 * Grid of label/value pairs for detail panels and summary sections. Wrap
 * DefinitionItem children. Defaults to a 2-column layout matching the detail
 * sheets used throughout the app.
 */
export function DefinitionList({ columns = 2, className, children }: DefinitionListProps) {
  return (
    <div
      className={cn(
        "grid gap-4 text-sm",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface DefinitionItemProps {
  label: React.ReactNode;
  /** The value. Accepts text, a Badge, or any node. */
  children: React.ReactNode;
  className?: string;
}

/** A single label-over-value pair inside a DefinitionList. */
export function DefinitionItem({ label, children, className }: DefinitionItemProps) {
  return (
    <div className={className}>
      <p className="text-text-muted">{label}</p>
      <div className="text-text-primary">{children}</div>
    </div>
  );
}
