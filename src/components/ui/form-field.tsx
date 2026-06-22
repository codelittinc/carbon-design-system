import { cn } from "@/lib/cn";

interface FormFieldProps {
  label: React.ReactNode;
  /** Associates the label with a control via its id. */
  htmlFor?: string;
  required?: boolean;
  /** Error message; takes precedence over hint and colors the field error. */
  error?: string;
  /** Helper text shown below the control when there is no error. */
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Labelled form control wrapper: a small muted label above the control with
 * optional required marker, error, and hint text below. Pairs with the Input,
 * Select, Textarea, and MoneyInput primitives.
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-text-muted">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-faint">{hint}</p>
      ) : null}
    </div>
  );
}
