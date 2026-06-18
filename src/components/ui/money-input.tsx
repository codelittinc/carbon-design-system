"use client";

import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/cn";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

function formatMoney(raw: string): string {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts.slice(0, 2).join(".");
  return cleaned;
}

function displayMoney(value: string): string {
  if (!value || value === "" || value === "-") return value;
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `(${formatted})` : formatted;
}

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(formatMoney(e.target.value));
      },
      [onChange],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.value = value;
        e.target.select();
        onFocus?.(e);
      },
      [value, onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);
      },
      [onBlur],
    );

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
          $
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-8 w-full rounded-md border border-border bg-surface-raised py-1 pl-7 pr-3 text-right font-[family-name:var(--font-mono)] text-sm tabular-nums text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          value={displayMoney(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
