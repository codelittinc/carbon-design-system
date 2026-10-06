import { forwardRef } from "react";
import { cn } from "@/lib/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Appends a required marker. */
  required?: boolean;
}

/**
 * A form control's label, the one `FormField` draws. Use it on its own when
 * the control's layout does not fit `FormField`'s label-above-control stack.
 */
const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-xs font-medium text-text-muted", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-error" aria-hidden="true">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = "Label";

export { Label };
