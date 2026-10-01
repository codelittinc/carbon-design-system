"use client";

import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const alertVariants = cva("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    variant: {
      error: "border-error-border bg-error-soft text-error-text",
      success: "border-success-border bg-success-soft text-success-text",
      info: "border-border bg-info-soft text-info-text",
      warning: "border-border bg-accent-muted text-accent-text",
    },
  },
  defaultVariants: {
    variant: "error",
  },
});

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
};

interface AlertProps extends VariantProps<typeof alertVariants> {
  /** Optional bold first line. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Shows a dismiss button when given. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * An inline, persistent message about the surrounding content — a form that
 * failed to save, a section that could not load. For a transient confirmation
 * use `toast`.
 */
export function Alert({ variant, title, children, onDismiss, className }: AlertProps) {
  const Icon = icons[variant ?? "error"];
  return (
    <div
      role={variant === "error" || variant == null ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export { alertVariants };
