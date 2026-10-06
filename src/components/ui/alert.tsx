"use client";

import type { ReactElement } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { toneBorderClass, toneFillClass } from "@/lib/ui-classes";
import { DismissButton } from "./dismiss-button";

// The status tones are shared with Toast and Badge (lib/ui-classes).
const alertVariants = cva("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    variant: {
      error: cn(toneBorderClass.error, toneFillClass.error),
      success: cn(toneBorderClass.success, toneFillClass.success),
      info: cn(toneBorderClass.info, toneFillClass.info),
      warning: cn(toneBorderClass.warning, toneFillClass.warning),
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
export function Alert({ variant, title, children, onDismiss, className }: AlertProps): ReactElement {
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
      {onDismiss && <DismissButton label="Dismiss" onClick={onDismiss} className="-mr-1 -mt-0.5" />}
    </div>
  );
}

export { alertVariants };
