"use client";

import { forwardRef, useEffect, useRef, useState, type DragEvent, type ReactElement } from "react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "./button";
import { DismissButton } from "./dismiss-button";
import { Label } from "./label";

export interface FileInputProps {
  /** The native input's id, so a `FormField htmlFor` labels it and its label opens the picker. */
  id: string;
  /** The native `accept`: extensions and MIME types, `".csv,text/csv"`. A dropped file is held to it too. */
  accept?: string;
  /** The chosen file, or null. Controlled: the component never holds one of its own. */
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  /** Draws the error border. `aria-invalid` (which `FormField` passes with an error) does the same. */
  invalid?: boolean;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
  /** The button's words. */
  buttonLabel?: string;
  /** What shows while no file is chosen. */
  emptyLabel?: string;
  /** The accessible name of the X that clears the file. */
  removeLabel?: string;
  className?: string;
}

/** "883 KB", "1.2 MB", "512 B": a file's size as a person reads it. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Whether `file` is one `accept` lets through: an extension (`.csv`, any
 * case), a MIME type (`text/csv`) or a family (`image/*`). No `accept` lets
 * everything through, as the native picker does.
 */
export function acceptsFile(file: Pick<File, "name" | "type">, accept: string | undefined): boolean {
  const rules = (accept ?? "")
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/**
 * Choose one file: a "Choose file" button, the chosen file's name and size,
 * and an X that clears it. A file dropped on the row is taken too, when
 * `accept` allows it.
 *
 * The control is the native `<input type="file">`, visually hidden but still
 * focusable, so the keyboard and screen readers get the browser's own picker:
 * Enter or Space opens it. The button is its `<label>`, drawn as an outline
 * `Button`, and shows the input's focus ring. It is hidden from assistive
 * technology, which reads the input under the field's own label instead.
 */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      id,
      accept,
      value,
      onChange,
      disabled = false,
      invalid = false,
      "aria-invalid": ariaInvalid,
      "aria-describedby": describedBy,
      buttonLabel = "Choose file",
      emptyLabel = "No file chosen",
      removeLabel = "Remove file",
      className,
    },
    ref,
  ): ReactElement => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const isInvalid = invalid || (ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false");

    // Cleared by the app: the native input lets go of its file too, so picking
    // the same one again is a change.
    useEffect(() => {
      if (value === null && inputRef.current) inputRef.current.value = "";
    }, [value]);

    function setRefs(node: HTMLInputElement | null) {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }

    function onDragOver(event: DragEvent<HTMLDivElement>) {
      if (disabled) return;
      event.preventDefault();
      setDragging(true);
    }

    function onDrop(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = event.dataTransfer.files[0];
      if (!file || !acceptsFile(file, accept)) return;
      onChange(file);
    }

    return (
      <div
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-md border border-dashed border-border bg-surface-raised p-1.5 pr-2 text-text-secondary transition-colors",
          dragging && "border-accent bg-surface-overlay",
          isInvalid && "border-error-border",
          disabled && "opacity-50",
          className,
        )}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={setRefs}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className="peer sr-only"
          onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)}
        />
        <Label
          htmlFor={id}
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "text-text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50",
            disabled && "pointer-events-none",
          )}
        >
          {buttonLabel}
        </Label>
        <span className="min-w-0 flex-1 truncate text-sm text-text-secondary" title={value?.name}>
          {value ? (
            <>
              <span className="text-text-primary">{value.name}</span>
              <span className="text-text-muted"> · {formatFileSize(value.size)}</span>
            </>
          ) : (
            <span className="text-text-muted">{emptyLabel}</span>
          )}
        </span>
        {value && !disabled && <DismissButton label={removeLabel} onClick={() => onChange(null)} />}
      </div>
    );
  },
);
FileInput.displayName = "FileInput";
