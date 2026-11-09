"use client";

import { forwardRef, useMemo, type ClipboardEvent, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { sanitizeRichText, type RichTextFormatting } from "@/lib/rich-text";
import { RICH_TEXT_PROSE } from "@/lib/rich-text-prose";

export { RICH_TEXT_PROSE } from "@/lib/rich-text-prose";

export interface RichTextViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML" | "onCopy"> {
  /** Stored rich text. Sanitized here, with the options below, before it renders. */
  html: string;
  /** The editor configuration that wrote it. Default `extended`. */
  formatting?: RichTextFormatting;
  /** Keep images. Default `true`. */
  images?: boolean;
  /**
   * Keep root-relative links and image sources (`/handbook/…`, `/api/files/…`),
   * for markup an app sanitized on its server and resolved to its own routes.
   * See `RichTextSanitizeOptions.rootRelative`. Default `false`.
   */
  rootRelative?: boolean;
  /**
   * Copy a selection inside the document as its sanitized HTML, with absolute
   * image and link URLs, instead of the browser's computed styles. Pasting into
   * an email then carries the document's formatting and image alignment, not
   * the page's light or dark theme. Selections that leave the document copy
   * as the browser normally does.
   */
  cleanCopy?: boolean;
}

/**
 * The selection as markup, wrapped in the elements it sits inside up to (not
 * including) `root`. `cloneContents` alone drops them: half of a bold name
 * would copy without its `<strong>`, two list items without their `<ul>`.
 */
function selectionHtml(range: Range, root: HTMLElement): string {
  let fragment: Node = range.cloneContents();
  for (let node: Node | null = range.commonAncestorContainer; node && node !== root; node = node.parentNode) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const shell = (node as Element).cloneNode(false);
    shell.appendChild(fragment);
    fragment = shell;
  }
  const holder = document.createElement("div");
  holder.append(fragment);
  // Clipboard HTML is opened at the destination's origin, not this page's.
  for (const image of holder.querySelectorAll<HTMLImageElement>("img[src]")) image.setAttribute("src", image.src);
  for (const link of holder.querySelectorAll<HTMLAnchorElement>("a[href]")) link.setAttribute("href", link.href);
  return holder.innerHTML;
}

/**
 * Read-only stored rich text: the counterpart of `RichTextEditor`. Sanitizes
 * `html` itself (`sanitizeRichText` is idempotent, so markup an app already
 * cleaned on its server comes through unchanged), styles it with
 * `RICH_TEXT_PROSE`, and is a `flow-root` so an image wrapped with text
 * (`data-align="left-wrap"`) never spills past the end of the document.
 *
 * Size and colour of the body text are the caller's, through `className`.
 */
export const RichTextView = forwardRef<HTMLDivElement, RichTextViewProps>(
  ({ html, formatting = "extended", images = true, rootRelative = false, cleanCopy = false, className, ...props }, ref) => {
    const options = useMemo(() => ({ formatting, images, rootRelative }), [formatting, images, rootRelative]);
    const clean = useMemo(() => sanitizeRichText(html, options), [html, options]);

    function copy(event: ClipboardEvent<HTMLDivElement>) {
      const root = event.currentTarget;
      const selection = window.getSelection();
      if (
        selection?.rangeCount !== 1 ||
        selection.isCollapsed ||
        !root.contains(selection.anchorNode) ||
        !root.contains(selection.focusNode)
      )
        return;
      // Absolute URLs by now, so the copy is sanitized without `rootRelative`.
      const markup = selectionHtml(selection.getRangeAt(0), root);
      event.clipboardData.setData("text/html", sanitizeRichText(markup, { formatting, images }));
      event.clipboardData.setData("text/plain", selection.toString());
      event.preventDefault();
    }

    return (
      <div
        ref={ref}
        {...props}
        className={cn("flow-root", RICH_TEXT_PROSE, className)}
        onCopy={cleanCopy ? copy : undefined}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  },
);
RichTextView.displayName = "RichTextView";
