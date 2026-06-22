import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric value or decimal string. Formatted via formatMoney. */
  value: string | number | null | undefined;
  /** Render negative values in the error color (parentheses already signal sign). */
  colorNegative?: boolean;
}

/**
 * Monospace, tabular-aligned currency display. Use anywhere a dollar amount is
 * shown in a table cell, ledger row, or detail panel so figures line up on the
 * decimal. Wraps formatMoney for consistent $ / (parentheses) formatting.
 */
export function Money({ value, colorNegative, className, ...props }: MoneyProps) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isNegative = typeof num === "number" && !isNaN(num) && num < 0;

  return (
    <span
      className={cn(
        "font-[family-name:var(--font-mono)] tabular-nums",
        colorNegative && isNegative && "text-error",
        className,
      )}
      {...props}
    >
      {formatMoney(value)}
    </span>
  );
}
