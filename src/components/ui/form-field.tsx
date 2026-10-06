import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./label";
import { Select, SelectTrigger } from "./select";

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
  "aria-required"?: React.AriaAttributes["aria-required"];
  required?: boolean;
  children?: ReactNode;
}

interface ControlState {
  messageId: string | undefined;
  error: boolean;
  required: boolean;
}

/** The ARIA a control gets from its field: description, invalid, required. */
function withFieldState(
  control: ReactElement<DescribableProps>,
  { messageId, error, required }: ControlState,
  // A Select's `required` is on its Root, not on the trigger that gets the ARIA.
  ownRequired: boolean | undefined = control.props.required,
): ReactElement<DescribableProps> {
  const own = control.props["aria-describedby"];
  const ownAriaRequired = control.props["aria-required"];
  return cloneElement(control, {
    ...(messageId ? { "aria-describedby": own ? `${own} ${messageId}` : messageId } : {}),
    ...(error ? { "aria-invalid": control.props["aria-invalid"] ?? true } : {}),
    // A native `required` is already announced, and a control that states its
    // own `aria-required` keeps it.
    ...(required && ownAriaRequired === undefined && !ownRequired ? { "aria-required": true } : {}),
  });
}

/**
 * Labelled form control wrapper: a `Label` above the control with an optional
 * required marker, and an error or a hint below it. Pairs with the Input,
 * Select, Textarea, and MoneyInput primitives.
 *
 * When `children` is a single element, the field's state reaches the control
 * itself, so a screen reader reads it with the field rather than leaving it
 * stranded around it: `aria-describedby` pointing at the error or hint (added to
 * any it already has), `aria-invalid` while there is an error, and
 * `aria-required` when `required` (unless the control already sets `required`
 * or `aria-required`).
 *
 * A `Select` renders no element of its own (it wraps Radix's Root), so the
 * props go to the `SelectTrigger` among its direct children instead. A trigger
 * nested deeper (inside a wrapper of your own) is not found: pass it
 * `aria-describedby`, `aria-invalid` and `aria-required` yourself.
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

  const state: ControlState = { messageId, error: Boolean(error), required: Boolean(required) };
  let control = children;
  if ((messageId || required) && isValidElement<DescribableProps>(children)) {
    if (children.type === Select) {
      const selectRequired = children.props.required;
      control = cloneElement(
        children,
        undefined,
        Children.map(children.props.children, (child) =>
          isValidElement<DescribableProps>(child) && child.type === SelectTrigger
            ? withFieldState(child, state, selectRequired)
            : child,
        ),
      );
    } else {
      control = withFieldState(children, state);
    }
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
