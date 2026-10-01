import { isRichTextEmpty } from "@/lib/rich-text";

/**
 * The translation between the HTML an app stores and the HTML TipTap holds.
 * Internal to `RichTextEditor`; pure, so it is tested without an editor.
 */

/** Anything that looks like an element. A string without one is plain text. */
const HAS_TAG = /<[a-z][\s\S]*>/i;

/**
 * A `<br>` that is the last thing in its block. A browser puts one there so an
 * empty line has height, and it renders as nothing — so `<p><br /></p>`, which
 * is how the old editor stored a blank line, loads as an empty paragraph rather
 * than a paragraph holding a line break.
 */
const PLACEHOLDER_BREAK = /<br\s*\/?>(?=\s*<\/(p|li|h[1-3]|blockquote)>)/gi;

/** Plain text as the editor would hold it: escaped, blank lines between paragraphs. */
export function plainTextToHtml(text: string): string {
  if (!text) return "";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function dropPlaceholderBreaks(html: string): string {
  return html.replace(PLACEHOLDER_BREAK, "");
}

/** What to load into TipTap for a stored `value`. */
export function toEditorHtml(value: string, acceptPlainText: boolean): string {
  const html = acceptPlainText && !HAS_TAG.test(value) ? plainTextToHtml(value) : value;
  return dropPlaceholderBreaks(html);
}

/**
 * What to emit for TipTap's HTML.
 *
 * TipTap writes a blank line as `<p></p>`, and `sanitizeRichText` deletes an
 * empty paragraph — so every blank line would be lost on save. `<p><br></p>` is
 * what a browser writes for one, and what the sanitizer keeps. A document with
 * nothing in it is `""`, so `isRichTextEmpty` of what this emits always matches
 * what the person sees.
 */
export function fromEditorHtml(html: string): string {
  const out = html.replace(/<p><\/p>/g, "<p><br></p>");
  return isRichTextEmpty(out) ? "" : out;
}
