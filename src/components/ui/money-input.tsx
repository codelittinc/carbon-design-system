"use client";

import { forwardRef, useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import { Input } from "./input";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

/** Strip to a raw decimal string (digits, at most one dot, optional leading -). */
function clean(raw: string): string {
  const neg = raw.trim().startsWith("-");
  const digits = raw.replace(/[^0-9.]/g, "");
  const parts = digits.split(".");
  const hasDot = parts.length > 1;
  // Strip leading zeros so a default "0" doesn't linger when typing ("05" -> "5"),
  // while keeping a lone "0" and the "0" in "0.50".
  const intPart = (parts[0] ?? "").replace(/^0+(?=\d)/, "");
  const joined = hasDot ? `${intPart}.${parts.slice(1).join("")}` : intPart;
  return (neg ? "-" : "") + joined;
}

/**
 * Pretty 2-decimal display, used ONLY when the field is not focused: `Money`'s
 * format without the `$`, which the field draws itself. A value that is not a
 * number yet ("", "-", ".") shows as typed.
 */
function formatForDisplay(value: string): string {
  if (!value || value === "-" || value === ".") return value;
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())
    ? formatAmount(value, { symbol: false })
    : value;
}

/**
 * Money input. CRITICAL: while the field is focused we render the RAW typed value
 * (so multi-digit entry works — typing "150" stays "150"); we only apply 2-decimal
 * formatting on blur. Reformatting on every keystroke (the previous bug) fought the
 * caret and mangled input (e.g. "150" -> "1.01"). The value handed to onChange is
 * always the raw decimal string (never a float) so money stays Decimal-safe.
 */
const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onChange(clean(e.target.value)),
      [onChange],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        e.target.select();
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
          $
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn("pl-7 text-right font-[family-name:var(--font-mono)] tabular-nums", className)}
          value={focused ? value : formatForDisplay(value)}
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
