import { cloneElement, isValidElement, useId, type ReactElement } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./label";

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

interface DescribableProps {
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}

/**
 * Labelled form control wrapper: a `Label` above the control with an optional
 * required marker, and an error or a hint below it. Pairs with the Input,
 * Select, Textarea, and MoneyInput primitives.
 *
 * The error or hint describes the control: when `children` is a single
 * element, it gets `aria-describedby` pointing at the message (added to any it
 * already has), and `aria-invalid` while there is an error, so a screen reader
 * reads the message with the field rather than leaving it stranded below.
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps): ReactElement {
  const generatedId = useId();
  const baseId = htmlFor ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${baseId}-${error ? "error" : "hint"}` : undefined;

  let control = children;
  if (messageId && isValidElement<DescribableProps>(children)) {
    const own = children.props["aria-describedby"];
    control = cloneElement(children, {
      "aria-describedby": own ? `${own} ${messageId}` : messageId,
      ...(error ? { "aria-invalid": children.props["aria-invalid"] ?? true } : {}),
    });
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {control}
      {error ? (
        <p id={messageId} role="alert" className="break-words text-xs text-error-text">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="break-words text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
