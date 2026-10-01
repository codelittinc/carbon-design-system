"use client";

import { forwardRef, useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import type { RichTextEditorHandle, RichTextEditorProps } from "./rich-text-editor-impl";
import { loadRichTextEditor, loadedRichTextEditor, subscribeRichTextEditor } from "./rich-text-editor-loader";

export type {
  RichTextEditorHandle,
  RichTextEditorProps,
  RichTextFormatting,
  RichTextInsertAction,
  RichTextLinkPanelOptions,
  RichTextLinkTarget,
} from "./rich-text-editor-impl";

/**
 * A WYSIWYG editor for a paragraph or two of prose. The full contract — what it
 * emits, how to sanitize it, each opt-in — is on the props and in
 * rich-text-editor-impl.tsx.
 *
 * TipTap is loaded the first time an editor renders, not when the package is
 * imported (see rich-text-editor-loader.ts). Until it arrives this draws the
 * same bordered box with an empty toolbar strip, so the page does not jump. The
 * server render and hydration always draw that box, so they agree whether or
 * not the editor has already loaded in this tab. A failed load throws to the
 * nearest error boundary.
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(props, ref) {
    const Impl = useSyncExternalStore(subscribeRichTextEditor, loadedRichTextEditor, () => null);
    const [failure, setFailure] = useState<{ cause: unknown } | null>(null);

    useEffect(() => {
      if (Impl) return;
      loadRichTextEditor().catch((cause: unknown) => setFailure({ cause }));
    }, [Impl]);

    if (failure) throw failure.cause;
    if (Impl) return <Impl ref={ref} {...props} />;

    return (
      <div
        aria-busy="true"
        className={cn(
          "overflow-hidden rounded-md border bg-surface-raised shadow-sm",
          props.invalid ? "border-error-border" : "border-border",
          props.disabled && "opacity-50",
        )}
      >
        <div className="h-9 border-b border-border-subtle bg-surface" />
        <div className={cn("min-h-24 w-full", props.className)} />
      </div>
    );
  },
);
