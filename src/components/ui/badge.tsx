import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-carbon-800 text-text-secondary",
        accent: "bg-amber-500/15 text-amber-400",
        success: "bg-green-500/15 text-green-400",
        warning: "bg-amber-500/15 text-amber-400",
        error: "bg-red-500/15 text-red-400",
        info: "bg-blue-500/15 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
