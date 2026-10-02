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
 * `RichTextEditor` emits its document's HTML as is. It does not sanitize, on purpose:
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
 * the output: the exceptions are `<a href>`, whose value must survive
 * `safeHref` before it is re-escaped, and, when images are on, `<img src>` (the
 * same check, http and https only) and `alt`. Every text run is escaped. The output tree
 * is balanced by construction, because open tags come off a stack.
 *
 * The consequence is that an unrecognised tag cannot smuggle anything through,
 * because nothing about it is reproduced — the parser only has to be good enough
 * to find where the tag ends, not good enough to reason about what it means.
 */
/** The canonical tag set, for consumers writing CSS or a `prose` allow-list. */
declare const RICH_TEXT_TAGS: readonly ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a"];
/**
 * What `RichTextEditor` can produce with `formatting="extended"`: the default
 * set plus three heading levels, quotes, inline code and code blocks.
 */
declare const RICH_TEXT_EXTENDED_TAGS: readonly ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "h1", "h2", "h3", "blockquote", "code", "pre"];
/** What `RichTextEditor` adds when it is given `uploadImage`. */
declare const RICH_TEXT_IMAGE_TAGS: readonly ["img"];
/**
 * Which editor configuration a call is sanitizing for. `basic` (the default) is
 * `RichTextEditor` with no opt-ins; `extended` matches `formatting="extended"`.
 */
type RichTextFormatting = "basic" | "extended";
/**
 * Match the sanitizer to the editor that wrote the markup. With no options, or
 * `{}`, `sanitizeRichText` is exactly what it always was.
 */
interface RichTextSanitizeOptions {
    /** `extended` also keeps h1–h3, blockquote, code and pre. Default `basic`. */
    formatting?: RichTextFormatting;
    /** Keeps `<img>`, with an http(s) `src` and an `alt` and nothing else. */
    images?: boolean;
}
/**
 * The tags one editor configuration can produce, for CSS or an app's own
 * allow-list. `richTextTags()` is `RICH_TEXT_TAGS`.
 */
declare function richTextTags(options?: RichTextSanitizeOptions): readonly string[];
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
 * pinning that, for every set of options.
 *
 * Pass the options that match the editor's configuration, so nothing the editor
 * can produce is lost on save: `{ formatting: "extended" }` for an extended
 * editor, `images: true` for one with `uploadImage`.
 *
 * A link target that is not a URL (`RichTextEditor`'s `linkPanel.targets`, such
 * as `{{booking_link}}`) fails `safeHref`, so its anchor is dropped and its text
 * kept. That is deliberate: such an href only means something to the app that
 * fills it in, so an app that turns link targets on sanitizes that markup with
 * its own allow-list.
 */
declare function sanitizeRichText(html: string | null | undefined, options?: RichTextSanitizeOptions): string;
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

/**
 * What `RichTextEditor`'s link UI accepts as an href.
 *
 * Pure functions with no React and no browser globals, exported from the
 * server-safe `/utils` entry as well as the root, so an app can check an href
 * the same way on its server.
 *
 * Two different questions, kept apart on purpose.
 *
 * `normalizeLinkHref` answers "may the person TYPE this into the full link
 * panel?", and is where an app's extra link targets apply. It is for usability
 * only: the app's sanitizer remains the boundary.
 *
 * `isAllowedEditorHref` answers "may the editor keep this href?" for parse,
 * paste, autolink and setLink alike, and is the same in every editor. It cannot
 * depend on the targets an editor declares: an app can load markup that already
 * holds `<a href="{{booking_link}}">` into an editor that does not let anyone
 * type it, and dropping the href there would hide the target from whatever
 * fills it in later.
 */
type LinkHrefReason = "empty" | "scheme" | "placeholder";
type LinkHrefResult = {
    ok: true;
    href: string;
} | {
    ok: false;
    reason: LinkHrefReason;
};
interface LinkHrefOptions {
    /**
     * Hrefs that are not URLs but may be typed as one, in canonical form, e.g.
     * `["{{booking_link}}"]`. Matched case-insensitively and with spaces allowed
     * inside the braces.
     */
    targets?: readonly string[];
}
/**
 * The href to store for what somebody typed, or why it was refused.
 *
 * `example.com` and `www.example.com` gain `https://`, `ana@example.com` becomes
 * a `mailto:` link, and `http(s)://` and `mailto:` are kept exactly as typed.
 * Every other scheme, relative paths, text with spaces and dot-less hosts
 * without a scheme are refused, and so is any `{{…}}` that is not one of
 * `targets`.
 */
declare function normalizeLinkHref(input: string, { targets }?: LinkHrefOptions): LinkHrefResult;
/**
 * Whether the editor may keep this href at all.
 *
 * TipTap's own default allows ftp, tel, sms, cid, xmpp and more. This narrows
 * any explicit scheme to http, https and mailto, and lets everything without
 * one through, as TipTap does: that covers link targets, and also autolink,
 * which passes linkify's raw value ("example.com", not the href) to this check.
 */
declare function isAllowedEditorHref(url: string | undefined): boolean;
/** The message the link panel shows for a refused href. */
declare function linkHrefErrorMessage(reason: LinkHrefReason, { targets }?: LinkHrefOptions): string;

/**
 * Deterministic id → color identity, for an unbounded set of entities (a
 * project, a team) that each need a stable color. Colors are never stored or
 * sent over the wire: they are derived from the numeric id at render time.
 *
 * Every value is a CSS variable reference to a `--color-category-*` token in
 * theme.css, so it can go straight into a `style` (`backgroundColor`) or an SVG
 * `fill`. Those tokens are fills under WHITE text and all clear 4.5:1 against
 * it. They cycle and stay the same in both themes, which is what separates them
 * from the `chart-*` series slots (`seriesColor`): those never cycle and are
 * re-stepped per theme. The token block in theme.css has the full reasoning.
 *
 * Pure, no React — also exported from `/utils` for server components.
 */
declare const CATEGORICAL_PALETTE: readonly string[];
/** Fill for an item with no category. */
declare const NEUTRAL_CATEGORICAL_COLOR = "var(--color-category-neutral)";
/** Fill for the capped "+N more" segment. */
declare const OVERFLOW_SEGMENT_COLOR = "var(--color-category-overflow)";
/** Maximum number of color segments drawn on a `CategoryChip`. */
declare const MAX_CHIP_SEGMENTS = 4;
/** The palette fill for an integer id. Cycles; negative ids are safe. */
declare function getCategoricalColor(id: number): string;
interface CategoricalSegment {
    color: string;
    /** Present only on the capped overflow segment: how many ids it stands for. */
    overflowCount?: number;
}
/**
 * Equal-width segments for a `CategoryChip`, from ids the caller has already
 * put in display order.
 *
 * - no ids → one neutral segment
 * - up to `MAX_CHIP_SEGMENTS` ids → one segment each
 * - more → the first `MAX_CHIP_SEGMENTS − 1`, then an overflow segment whose
 *   `overflowCount` is the rest
 */
declare function getCategoricalSegments(ids: number[]): CategoricalSegment[];

export { CATEGORICAL_PALETTE, type CategoricalSegment, type LinkHrefOptions, type LinkHrefReason, type LinkHrefResult, MAX_CHIP_SEGMENTS, NEUTRAL_CATEGORICAL_COLOR, OVERFLOW_SEGMENT_COLOR, RICH_TEXT_EXTENDED_TAGS, RICH_TEXT_IMAGE_TAGS, RICH_TEXT_TAGS, type RichTextFormatting, type RichTextSanitizeOptions, cn, formatDate, formatMoney, formatPeriodLabel, getCategoricalColor, getCategoricalSegments, isAllowedEditorHref, isRichTextEmpty, linkHrefErrorMessage, normalizeLinkHref, richTextTags, safeHref, sanitizeRichText };
