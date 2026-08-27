import { ClassValue } from 'clsx';

declare function cn(...inputs: ClassValue[]): string;

declare function formatMoney(value: string | number | null | undefined): string;
declare function formatDate(iso: string | null | undefined): string;
declare function formatPeriodLabel(month: number, year: number): string;

/**
 * The rich-text contract: what `RichTextEditor` may produce, and the only thing
 * a consumer may render.
 *
 * These are pure functions with no React and no browser globals, so they live
 * here and are re-exported from the server-safe `/utils` entry — the code that
 * renders stored rich text is usually a *server* component, and importing a
 * value from the package root would hand it a client reference. See src/utils.ts.
 *
 * ## Why sanitizing is the consumer's job and not the editor's
 *
 * `RichTextEditor` emits `innerHTML` verbatim. It does not sanitize, on purpose:
 * the editor is a client, and a client is never the trust boundary. Whatever it
 * emits reaches your server as a string in a form post, and a string in a form
 * post can say anything at all regardless of what the editor would have done.
 *
 * So the rule for storing rich text is:
 *
 *   1. `sanitizeRichText` on the way IN, so the database holds clean markup.
 *   2. `sanitizeRichText` again on the way OUT, before `dangerouslySetInnerHTML`.
 *
 * Step 2 is not redundant. It covers rows written before the allow-list
 * tightened, rows edited by hand in a SQL client, and rows imported from
 * somewhere else. The database is storage, not a trust boundary either.
 * `sanitizeRichText` is idempotent, so running it twice costs nothing.
 *
 * ## Why this is a re-serializer and not a filter
 *
 * The classic way to write this is to take the input markup and strip the bad
 * parts out. That is the approach that keeps producing bypasses, because it
 * leaves attacker-controlled markup in the output and relies on having thought
 * of every way to hide something in it — `<img src=x onerror=alert(1)>`,
 * `<svg><script>`, mutation XSS from unbalanced quoting, `javascript:` behind
 * entity encoding, and so on indefinitely.
 *
 * This does the opposite. It parses the input into tokens and then **emits
 * fresh markup from scratch**, writing only tags from ALLOWED and only
 * attributes it composes itself. No attribute from the input is ever copied to
 * the output: the single exception is `<a href>`, whose value must survive
 * `safeHref` before it is re-escaped. Every text run is escaped. The output tree
 * is balanced by construction, because open tags come off a stack.
 *
 * The consequence is that an unrecognised tag cannot smuggle anything through,
 * because nothing about it is reproduced — the parser only has to be good enough
 * to find where the tag ends, not good enough to reason about what it means.
 */
/** The canonical tag set, for consumers writing CSS or a `prose` allow-list. */
declare const RICH_TEXT_TAGS: readonly ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a"];
/**
 * The decoded, control-character-free URL if it uses a safe scheme, else null.
 *
 * Control characters are stripped rather than rejected because browsers strip
 * them before resolving a URL: `java\tscript:alert(1)` and `java\0script:` both
 * navigate, so a prefix test on the raw string sees a scheme that is not there.
 *
 * A space is NOT a control character for this purpose, and the distinction
 * matters twice. Removing internal spaces would silently rewrite
 * `https://host/a b` to `https://host/ab` — a different URL — and browsers do not
 * do that; they percent-encode, which is what happens below. And an internal
 * space cannot hide a scheme, because it breaks the scheme match instead:
 * `java script:` is not `javascript:` to this function or to a browser, so the
 * link is refused either way.
 *
 * Relative URLs are refused as well — a note's link is to a console or a document
 * elsewhere, and `/products/…` in stored markup is far more likely to be someone
 * probing than someone linking.
 */
declare function safeHref(raw: string): string | null;
/**
 * Reduce arbitrary HTML to the rich-text subset, by re-emitting it.
 *
 * Safe to call on anything, including a string that has already been through it
 * — `sanitizeRichText(sanitizeRichText(x)) === sanitizeRichText(x)`, which is
 * what makes the sanitize-on-write-and-on-read rule above cheap. There is a test
 * pinning that.
 */
declare function sanitizeRichText(html: string | null | undefined): string;
/**
 * Whether this rich text has anything in it.
 *
 * A contenteditable that somebody typed in and then cleared is not `""` — it is
 * `<p><br></p>` or `<div><br></div>` depending on the browser. So "is the notes
 * field empty" cannot be answered by comparing against the empty string, and
 * every consumer needs this to decide between rendering the note and rendering
 * the empty state. `&nbsp;` counts as blank for the same reason: it is what a
 * browser leaves behind, not something anybody meant to write.
 */
declare function isRichTextEmpty(html: string | null | undefined): boolean;

export { RICH_TEXT_TAGS, cn, formatDate, formatMoney, formatPeriodLabel, isRichTextEmpty, safeHref, sanitizeRichText };
