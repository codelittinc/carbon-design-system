"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { Check, Unlink, X } from "lucide-react";
import { safeHref } from "@/lib/rich-text";
import { Input } from "./input";
import { ToolbarButton } from "./rich-text-toolbar-button";

/**
 * The default editor's link UI: one row that replaces the toolbar while it is
 * open, as it always has.
 *
 * It only accepts a URL `safeHref` accepts, deliberately: a URL this took but
 * the sanitizer refused would be a link that worked until it was saved and then
 * quietly turned back into plain text.
 */
export function RichTextLinkRow({
  editor,
  onClose,
  apple,
}: {
  editor: Editor;
  onClose: () => void;
  apple: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // Read once, when the row opens: typing in the field moves the document's
  // focus, not its selection, but the selection is what Apply acts on.
  const [opened] = useState(() => {
    const { from, to, empty } = editor.state.selection;
    const href = editor.getAttributes("link").href as string | undefined;
    return { from, to, empty, href };
  });
  const [linkValue, setLinkValue] = useState(opened.href ?? "https://");
  const pendingHref = useMemo(() => safeHref(linkValue), [linkValue]);

  /** Close and hand the caret back. focus() restores the selection TipTap kept. */
  const close = useCallback(() => {
    onClose();
    editor.commands.focus();
  }, [editor, onClose]);

  // Escape is caught on window, in the capture phase, before a host Dialog's
  // own listener on document sees it. Radix dismisses a Dialog on Escape only
  // when nobody has prevented the event, so preventing it here closes the row
  // and leaves the Dialog — and its draft — open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!rowRef.current?.contains(event.target as Node)) return;
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [close]);

  const apply = () => {
    if (pendingHref === null) return;
    const href = pendingHref;
    const chain = editor.chain().focus();
    if (opened.href !== undefined) {
      // The caret or selection is in a link: change that link's address.
      chain.setTextSelection({ from: opened.from, to: opened.to }).extendMarkRange("link").setLink({ href });
    } else if (opened.empty) {
      // Nothing to wrap, so the URL becomes its own link text. A JSON node,
      // never an HTML string, so the URL cannot be parsed as markup.
      chain.setTextSelection(opened.from).insertContent({
        type: "text",
        text: href,
        marks: [{ type: "link", attrs: { href } }],
      });
    } else {
      chain.setTextSelection({ from: opened.from, to: opened.to }).setLink({ href }).setTextSelection(opened.to);
    }
    chain.unsetMark("link").run();
    onClose();
  };

  const remove = () => {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: opened.from, to: opened.to })
      .extendMarkRange("link")
      .unsetLink()
      .run();
    onClose();
  };

  return (
    <div ref={rowRef} className="flex w-full items-center gap-1.5 py-0.5">
      <Input
        // Autofocus is right here: the row appeared because somebody asked for
        // it, and it exists only to be typed in.
        autoFocus
        value={linkValue}
        aria-label="Link address"
        aria-invalid={pendingHref === null}
        placeholder="https://"
        className="h-7 text-xs"
        onChange={(event) => setLinkValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            apply();
          }
        }}
      />
      <ToolbarButton
        label="Apply link"
        icon={Check}
        shortcut={{ key: "Enter" }}
        apple={apple}
        disabled={pendingHref === null}
        onClick={apply}
      />
      <ToolbarButton
        label="Remove link"
        icon={Unlink}
        apple={apple}
        disabled={opened.href === undefined}
        onClick={remove}
      />
      <ToolbarButton
        label="Cancel link"
        tooltip="Cancel"
        icon={X}
        shortcut={{ key: "Esc" }}
        apple={apple}
        onClick={close}
      />
    </div>
  );
}
