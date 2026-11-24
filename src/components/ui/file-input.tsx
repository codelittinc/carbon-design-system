"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button, buttonVariants } from "./button";
import { FileIcon, XIcon } from "./icons";
import { Label } from "./label";

interface FileInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange" | "multiple" | "children"
  > {
  id: string;
  /** Marks the field invalid: `aria-invalid` on the input and an error border on its button. */
  invalid?: boolean;
  /** Ids of the help or error text describing the field, joined into `aria-describedby`. */
  describedBy?: string;
  /** Called with the chosen file, or null once it is removed. */
  onFileChange?: (file: File | null) => void;
  buttonLabel?: string;
  emptyLabel?: string;
  removeLabel?: string;
}

/** "820 KB", "1.4 MB": a file's size the way a person reads it. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A single-file picker drawn like the rest of the form. The native file input
 * stays in the DOM (visually hidden, still focusable), so it submits with its
 * form, the browser's own dialog and keyboard handling apply, and a `<label>`
 * elsewhere still names it. Its visible button is a label for it.
 *
 * Shows the chosen file's name and size, truncated with the full name in
 * `title`, and a Remove button that clears the input.
 */
const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      id,
      className,
      invalid = false,
      describedBy,
      onFileChange,
      disabled,
      buttonLabel = "Choose file",
      emptyLabel = "No file chosen",
      removeLabel = "Remove",
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const [file, setFile] = useState<File | null>(null);

    const choose = (next: File | null) => {
      setFile(next);
      onFileChange?.(next);
    };

    const remove = () => {
      if (inputRef.current) inputRef.current.value = "";
      choose(null);
      inputRef.current?.focus();
    };

    return (
      <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="peer sr-only"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
          {...props}
        />
        <Label
          htmlFor={id}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50",
            invalid && "border-error-border",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          {buttonLabel}
        </Label>
        {file ? (
          <>
            <span className="flex min-w-0 items-center gap-1.5 text-sm text-text-primary" title={file.name}>
              <FileIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
              <span className="min-w-0 truncate">{file.name}</span>
              <span className="shrink-0 text-text-muted">· {formatFileSize(file.size)}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              aria-label={`${removeLabel} ${file.name}`}
              onClick={remove}
            >
              <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {removeLabel}
            </Button>
          </>
        ) : (
          <span className="text-sm text-text-muted">{emptyLabel}</span>
        )}
      </div>
    );
  },
);
FileInput.displayName = "FileInput";

export { FileInput };
export type { FileInputProps };
