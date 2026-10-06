import type { ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { toneFillClass } from "@/lib/ui-classes";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-surface-overlay text-text-secondary",
        // `accent` and `warning` render the same: the warning tone borrows the
        // accent's amber (there is no separate warning tint). Both names stay,
        // because they mean different things at the call site.
        accent: toneFillClass.warning,
        success: toneFillClass.success,
        warning: toneFillClass.warning,
        error: toneFillClass.error,
        info: toneFillClass.info,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): ReactElement {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
