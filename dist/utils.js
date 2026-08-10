import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// src/lib/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/lib/format.ts
function formatMoney(value) {
  if (value == null || value === "") return "$0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (num < 0) return `($${formatted})`;
  return `$${formatted}`;
}
function formatDate(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatPeriodLabel(month, year) {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[month - 1]} ${year}`;
}

export { cn, formatDate, formatMoney, formatPeriodLabel };
