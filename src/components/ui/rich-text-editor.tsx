"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bold, Check, Italic, Link2, List, ListOrdered, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { isRichTextEmpty, safeHref } from "@/lib/rich-text";
import { Button } from "./button";
import { Input } from "./input";

export interface RichTextEditorProps {
  /** The current HTML. See the note on `onChange` about what may be fed back. */
  value: string;
  /**
   * Called with the editor's raw `innerHTML` on every edit.
   *
   * **Store this through `sanitizeRichText`, but do not sanitize it here.** The
   * value handed back through `value` has to be the same string this emitted, or
   * the sync effect treats it as an external change, rewrites the DOM, and drops
   * the caret to the start of the field on every keystroke. Sanitize where the
   * value is *stored* and again where it is *rendered* — see src/lib/rich-text.ts.
   */
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Applied to the editable surface, e.g. `min-h-40` to make the box taller. */
  className?: string;
  id?: string;
  ariaLabel?: string;
  /** Marks the surface invalid for assistive tech and draws the error border. */
  invalid?: boolean;
}

/**
 * A WYSIWYG editor for a paragraph or two of prose: bold, italic, two kinds of
 * list, and links.
 *
 * ## It emits HTML and does not sanitize it
 *
 * This is a client. Whatever it produces reaches a server as a string in a form
 * post, and that string can say anything regardless of what this component would
 * have done — so this component is not, and cannot be, the place the markup is
 * made safe. `sanitizeRichText` in `@codelittinc/carbon-design-system/utils` is,
 * and it is a separate server-safe entry precisely so the *server* can call it.
 * The full contract is documented there. The one thing to carry over here: the
 * toolbar produces exactly the tags that sanitizer allows, so nothing a user
 * types through this UI is lost on the way to the database.
 *
 * ## Why `document.execCommand`
 *
 * It is deprecated and it is still the only formatting API every browser
 * implements. The alternative is a document model of one's own — a Tiptap or a
 * Lexical — which is the right answer for a real document editor and several
 * hundred kilobytes to let somebody bold a word in a notes field. When this
 * component starts needing tables, images or collaborative editing, that is the
 * signal to replace it wholesale rather than to grow it.
 *
 * Two consequences worth knowing. `styleWithCSS` is turned off before every
 * command, because the default in some browsers is to emit
 * `<span style="font-weight:bold">` rather than `<b>` — and a style attribute is
 * stripped by the sanitizer, so the formatting would survive the click and
 * vanish on save. And pasted content is inserted as plain text on purpose:
 * pasting from Word or a web page otherwise carries in a document's worth of
 * markup that the sanitizer then reduces to unstyled prose anyway, with the
 * paragraph breaks in surprising places.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  id,
  ariaLabel,
  invalid = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  /**
   * The last HTML this component emitted. The sync effect compares against it to
   * tell its own edits (do nothing — the DOM is already right) from an external
   * change such as a form reset (rewrite the DOM). Without this, every keystroke
   * round-trips through the parent and comes back as "new" innerHTML, which
   * resets the caret to the top of the field.
   */
  const lastEmitted = useRef<string | null>(null);

  const [active, setActive] = useState({
    bold: false,
    italic: false,
    unordered: false,
    ordered: false,
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  /**
   * The selection as it was before the link input took focus. Opening the input
   * collapses the document selection, so the range has to be put back before
   * `createLink` runs or there is nothing for it to wrap.
   */
  const savedRange = useRef<Range | null>(null);

  const empty = isRichTextEmpty(value);

  /**
   * jsdom implements neither `execCommand` nor `queryCommandState`, and a server
   * render has no `document` at all, so both are reached through guards. A
   * component test asserts the surrounding behaviour — what renders, what
   * `onChange` receives — and leaves the formatting itself to a browser.
   */
  const exec = useCallback((command: string, argument?: string): boolean => {
    if (typeof document === "undefined" || typeof document.execCommand !== "function") {
      return false;
    }
    try {
      // Off before every command, not once at mount: some browsers reset it.
      document.execCommand("styleWithCSS", false, "false");
      return document.execCommand(command, false, argument);
    } catch {
      return false;
    }
  }, []);

  const queryState = useCallback((command: string): boolean => {
    if (typeof document === "undefined" || typeof document.queryCommandState !== "function") {
      return false;
    }
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  /** Read the DOM back out and hand it up. The single place `onChange` is called. */
  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }, [onChange]);

  /** Is the document selection currently inside this editor? */
  const selectionInside = useCallback((): boolean => {
    const el = editorRef.current;
    const selection = typeof window === "undefined" ? null : window.getSelection();
    if (!el || !selection || selection.rangeCount === 0) return false;
    return el.contains(selection.anchorNode);
  }, []);

  const refreshActive = useCallback(() => {
    if (!selectionInside()) return;
    setActive({
      bold: queryState("bold"),
      italic: queryState("italic"),
      unordered: queryState("insertUnorderedList"),
      ordered: queryState("insertOrderedList"),
    });
  }, [queryState, selectionInside]);

  // Push `value` into the DOM only when it did not come from here.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    if (el.innerHTML !== value) el.innerHTML = value;
    lastEmitted.current = value;
  }, [value]);

  // The toolbar's pressed states follow the caret, so they have to track
  // selection changes and not just clicks and typing.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);

  const runCommand = useCallback(
    (command: string) => {
      editorRef.current?.focus();
      exec(command);
      emit();
      refreshActive();
    },
    [emit, exec, refreshActive],
  );

  /** The href of the anchor the caret sits in, so editing a link prefills it. */
  const hrefAtCaret = useCallback((): string | null => {
    const selection = typeof window === "undefined" ? null : window.getSelection();
    let node = selection?.anchorNode ?? null;
    while (node && node !== editorRef.current) {
      if (node instanceof HTMLAnchorElement) return node.getAttribute("href");
      node = node.parentNode;
    }
    return null;
  }, []);

  const openLink = useCallback(() => {
    const selection = typeof window === "undefined" ? null : window.getSelection();
    savedRange.current =
      selectionInside() && selection ? selection.getRangeAt(0).cloneRange() : null;
    setLinkValue(hrefAtCaret() ?? "https://");
    setLinkOpen(true);
  }, [hrefAtCaret, selectionInside]);

  const closeLink = useCallback(() => {
    setLinkOpen(false);
    setLinkValue("");
    savedRange.current = null;
    editorRef.current?.focus();
  }, []);

  /**
   * The typed URL, or null if it is not one this can produce a working link
   * from. `safeHref` is the sanitizer's own check, deliberately: a URL this
   * accepted but the sanitizer refused would be a link that worked until it was
   * saved and then quietly turned back into plain text.
   */
  const pendingHref = useMemo(() => safeHref(linkValue), [linkValue]);

  const applyLink = useCallback(() => {
    if (pendingHref === null) return;

    const el = editorRef.current;
    if (!el) return;
    el.focus();

    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }

    // With nothing selected there is no text for `createLink` to wrap, so the
    // URL becomes its own link text — which is what somebody clicking "link"
    // with no selection is asking for.
    if (selection?.isCollapsed !== false) {
      const escaped = pendingHref
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      exec("insertHTML", `<a href="${escaped}">${escaped}</a>`);
    } else {
      exec("createLink", pendingHref);
    }

    emit();
    setLinkOpen(false);
    setLinkValue("");
    savedRange.current = null;
  }, [emit, exec, pendingHref]);

  const removeLink = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
    exec("unlink");
    emit();
    closeLink();
  }, [closeLink, emit, exec]);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      if (text) exec("insertText", text);
      emit();
    },
    [emit, exec],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Cmd/Ctrl+K for a link, the shortcut every other editor uses. Bold and
      // italic are handled by the browser natively inside a contenteditable, so
      // they are deliberately not intercepted here — `onInput` picks up the
      // result the same way it picks up typing.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openLink();
      }
    },
    [openLink],
  );

  const toolbarButtons = [
    { key: "bold", label: "Bold", icon: Bold, command: "bold", on: active.bold },
    { key: "italic", label: "Italic", icon: Italic, command: "italic", on: active.italic },
    {
      key: "unordered",
      label: "Bulleted list",
      icon: List,
      command: "insertUnorderedList",
      on: active.unordered,
    },
    {
      key: "ordered",
      label: "Numbered list",
      icon: ListOrdered,
      command: "insertOrderedList",
      on: active.ordered,
    },
  ] as const;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-surface-raised shadow-sm transition-colors focus-within:ring-2 focus-within:ring-accent/50",
        invalid ? "border-error-border" : "border-border",
        disabled && "opacity-50",
      )}
    >
      <div
        role="toolbar"
        aria-label="Formatting"
        aria-controls={id}
        className="flex items-center gap-0.5 border-b border-border-subtle bg-surface px-1.5 py-1"
      >
        {linkOpen ? (
          <div className="flex w-full items-center gap-1.5 py-0.5">
            <Input
              // Autofocus is right here: the row appeared because somebody asked
              // for it, and it exists only to be typed in.
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
                  applyLink();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeLink();
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Apply link"
              disabled={pendingHref === null}
              onMouseDown={(event) => event.preventDefault()}
              onClick={applyLink}
            >
              <Check size={13} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove link"
              onMouseDown={(event) => event.preventDefault()}
              onClick={removeLink}
            >
              <Link2 size={13} className="text-text-muted" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cancel link"
              onMouseDown={(event) => event.preventDefault()}
              onClick={closeLink}
            >
              <X size={13} />
            </Button>
          </div>
        ) : (
          <>
            {toolbarButtons.map(({ key, label, icon: Icon, command, on }) => (
              <Button
                key={key}
                type="button"
                variant="ghost"
                size="icon"
                aria-label={label}
                aria-pressed={on}
                disabled={disabled}
                // Without this the button takes focus on press and the selection
                // in the editor collapses, so the command has nothing to act on.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => runCommand(command)}
                className={cn("h-7 w-7", on && "bg-accent-muted text-accent-text")}
              >
                <Icon size={13} />
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Link"
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={openLink}
              className="h-7 w-7"
            >
              <Link2 size={13} />
            </Button>
          </>
        )}
      </div>

      <div className="relative">
        {empty && placeholder && (
          // The usual `:empty::before` trick does not work: a contenteditable
          // somebody has typed in and cleared holds `<p><br></p>`, which is not
          // empty. `isRichTextEmpty` is the same check the consumer uses to
          // decide between the note and its empty state.
          <p
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-2 text-sm text-text-muted"
          >
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-label={ariaLabel}
          aria-multiline="true"
          aria-invalid={invalid || undefined}
          contentEditable={!disabled}
          suppressContentEditableWarning
          // React never renders children here: the DOM is owned by the sync
          // effect above, because re-rendering the markup would move the caret.
          onInput={emit}
          onBlur={emit}
          onPaste={handlePaste}
          onKeyUp={refreshActive}
          onMouseUp={refreshActive}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-24 w-full px-3 py-2 text-sm leading-relaxed text-text-primary focus-visible:outline-none",
            // The editable surface styles its own output. These match the
            // renderer a consumer writes for stored rich text, so what somebody
            // types looks like what they get.
            "[&_a]:text-accent-text [&_a]:underline",
            "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_li]:my-0.5",
            "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
            disabled && "cursor-not-allowed",
            className,
          )}
        />
      </div>
    </div>
  );
}
