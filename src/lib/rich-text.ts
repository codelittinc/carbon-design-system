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

/**
 * Tags the output may contain, each mapped from every spelling that means it.
 *
 * The normalisation is not cosmetic. `document.execCommand("bold")` emits `<b>`
 * in Chrome and Safari and `<strong>` in some Firefox configurations, and a
 * paste can carry `<strike>` from a decade-old CMS. Mapping them to one spelling
 * means stored markup does not record which browser typed it, and a diff between
 * two saves shows what somebody changed rather than what they were using.
 *
 * `div` folds to `p` for the same reason: contenteditable produces `<div>` per
 * line in Chrome and `<p>` in Firefox, and they are the same paragraph.
 */
const TAG_ALIASES: Record<string, string> = {
  p: "p",
  div: "p",
  br: "br",
  b: "strong",
  strong: "strong",
  i: "em",
  em: "em",
  u: "u",
  s: "s",
  strike: "s",
  del: "s",
  ul: "ul",
  ol: "ol",
  li: "li",
  a: "a",
};

/** The canonical tag set, for consumers writing CSS or a `prose` allow-list. */
export const RICH_TEXT_TAGS = ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a"] as const;

/** Emitted self-closing and never pushed onto the open-tag stack. */
const VOID_TAGS = new Set(["br"]);

/**
 * Elements whose *content* is dropped along with the tag, rather than kept as
 * text.
 *
 * Everything else that is not allow-listed keeps its children — dropping
 * `<span>` should not delete the sentence inside it. But these elements do not
 * hold prose. Keeping their content would be safe (it gets escaped like any
 * other text) and would look absurd: a pasted `<style>` block would render its
 * CSS as a paragraph, and a `<script>` would display its source.
 */
const DROP_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "noscript",
  "svg",
  "math",
  "template",
  "object",
  "embed",
  "head",
  "title",
  "textarea",
]);

/** Schemes a link may use. Anything else loses the anchor and keeps its text. */
const SAFE_SCHEMES = ["http:", "https:", "mailto:"];

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  // Here for one reason: it is the entity used to hide a scheme, as in
  // `javascript&colon;alert(1)`. safeHref compares against decoded text, so it
  // has to be decoded to be caught.
  colon: ":",
};

/**
 * Resolve character references so a scheme cannot hide behind them.
 *
 * `<a href="javascript&colon;alert(1)">` and `&#106;avascript:` are the same URL
 * to a browser and different strings to a naive prefix test, so `safeHref` has
 * to compare against the decoded form. Text runs are decoded through here too,
 * so that re-escaping them cannot double-encode an `&` that was already an
 * entity — which is what makes this function idempotent.
 */
function decodeEntities(input: string): string {
  return input.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);?/g, (match, body: string) => {
    if (body.startsWith("#")) {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      // Lone surrogates and out-of-range code points would throw; leaving the
      // reference as literal text is both safe and honest about the input.
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
      if (code >= 0xd800 && code <= 0xdfff) return match;
      return String.fromCodePoint(code);
    }
    // Anything unrecognised stays literal, which is the safe direction: an
    // entity this does not know cannot become a delimiter, and in an href it
    // breaks the scheme match, so the link is refused rather than trusted.
    // `&Tab;` and `&NewLine;` reach a browser undecoded for that reason and are
    // harmless — the anchor is already gone.
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Escape a text run for element content. */
function escapeText(text: string): string {
  return decodeEntities(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u00a0/g, "&#160;");
}

/** Escape a value for a double-quoted attribute. */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
export function safeHref(raw: string): string | null {
  // Explicit escapes, not literal characters: this class is the whole defence
  // against `java\tscript:` and `java\0script:`, and a control character written
  // literally in the source is invisible to whoever reads it next.
  // eslint-disable-next-line no-control-regex
  const cleaned = decodeEntities(raw).replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (cleaned === "") return null;

  const scheme = cleaned.slice(0, cleaned.indexOf(":") + 1).toLowerCase();
  if (!SAFE_SCHEMES.includes(scheme)) return null;

  // Encoded, not stripped, so the URL that comes out is the URL that went in.
  return cleaned.replace(/ /g, "%20");
}

interface OpenTag {
  /** The canonical name that was emitted. */
  name: string;
}

/**
 * Read the attributes of an open tag, returning where the tag ends.
 *
 * Only `href` is ever wanted, but every attribute has to be *walked* regardless:
 * the closing `>` of `<a title="a > b" href="…">` is not the first `>` in the
 * string, and treating it as one is how a filter comes to leave half a tag in
 * its output.
 */
function readTag(
  html: string,
  from: number,
): { attrs: Record<string, string>; end: number; selfClosing: boolean } {
  const attrs: Record<string, string> = {};
  let i = from;
  let selfClosing = false;

  while (i < html.length) {
    while (i < html.length && /\s/.test(html[i])) i++;
    if (i >= html.length) break;

    if (html[i] === ">") {
      i++;
      break;
    }
    if (html[i] === "/" && html[i + 1] === ">") {
      selfClosing = true;
      i += 2;
      break;
    }
    // A stray `<` means the tag was never closed. Stop here and let the scanner
    // re-read from this position as a new tag rather than swallowing the rest of
    // the document looking for a `>` that does not exist.
    if (html[i] === "<") break;

    const nameStart = i;
    while (i < html.length && !/[\s=>/]/.test(html[i])) i++;
    const name = html.slice(nameStart, i).toLowerCase();

    while (i < html.length && /\s/.test(html[i])) i++;

    let value = "";
    if (html[i] === "=") {
      i++;
      while (i < html.length && /\s/.test(html[i])) i++;
      const quote = html[i];
      if (quote === '"' || quote === "'") {
        i++;
        const valueStart = i;
        while (i < html.length && html[i] !== quote) i++;
        value = html.slice(valueStart, i);
        i++; // past the closing quote
      } else {
        const valueStart = i;
        while (i < html.length && !/[\s>]/.test(html[i])) i++;
        value = html.slice(valueStart, i);
      }
    }

    if (name !== "") attrs[name] = value;
  }

  return { attrs, end: i, selfClosing };
}

/**
 * Skip past `</name>` (or the end of input) for a content-dropping element.
 *
 * Searched with a case-insensitive regex rather than by lowercasing the
 * document: this is called once per dropped element, and `html.toLowerCase()`
 * inside it made a paste full of `<script>` tags quadratic in their number.
 */
function skipContent(html: string, from: number, name: string): number {
  const pattern = new RegExp(`</${name}`, "i");
  const match = pattern.exec(html.slice(from));
  if (!match) return html.length;
  const gt = html.indexOf(">", from + match.index);
  return gt === -1 ? html.length : gt + 1;
}

/**
 * Reduce arbitrary HTML to the rich-text subset, by re-emitting it.
 *
 * Safe to call on anything, including a string that has already been through it
 * — `sanitizeRichText(sanitizeRichText(x)) === sanitizeRichText(x)`, which is
 * what makes the sanitize-on-write-and-on-read rule above cheap. There is a test
 * pinning that.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";

  const out: string[] = [];
  const stack: OpenTag[] = [];
  let i = 0;

  const closeThrough = (name: string): void => {
    // Scanned by hand rather than with `findLastIndex`, which needs a newer
    // `lib` than this package targets.
    let depth = -1;
    for (let d = stack.length - 1; d >= 0; d--) {
      if (stack[d].name === name) {
        depth = d;
        break;
      }
    }
    if (depth === -1) return; // A close with no open: drop it.
    for (let d = stack.length - 1; d >= depth; d--) {
      out.push(`</${stack[d].name}>`);
    }
    stack.length = depth;
  };

  while (i < html.length) {
    const lt = html.indexOf("<", i);

    if (lt === -1) {
      out.push(escapeText(html.slice(i)));
      break;
    }
    if (lt > i) out.push(escapeText(html.slice(i, lt)));

    const next = html[lt + 1];

    // `<!--` … `-->`. Dropped whole: a comment can hold a conditional block that
    // some browsers resolve into live markup.
    if (html.startsWith("<!--", lt)) {
      const close = html.indexOf("-->", lt + 4);
      i = close === -1 ? html.length : close + 3;
      continue;
    }
    // Doctype, CDATA, processing instruction — no prose, dropped to the `>`.
    if (next === "!" || next === "?") {
      const gt = html.indexOf(">", lt);
      i = gt === -1 ? html.length : gt + 1;
      continue;
    }

    if (next === "/") {
      const nameStart = lt + 2;
      let j = nameStart;
      while (j < html.length && /[a-zA-Z0-9]/.test(html[j])) j++;
      const raw = html.slice(nameStart, j).toLowerCase();
      const gt = html.indexOf(">", j);
      i = gt === -1 ? html.length : gt + 1;

      const canonical = TAG_ALIASES[raw];
      if (canonical && !VOID_TAGS.has(canonical)) closeThrough(canonical);
      continue;
    }

    // `<` followed by anything that cannot start a tag name is literal text —
    // "a < b" is prose, not a broken element.
    if (!next || !/[a-zA-Z]/.test(next)) {
      out.push(escapeText("<"));
      i = lt + 1;
      continue;
    }

    let j = lt + 1;
    while (j < html.length && /[a-zA-Z0-9]/.test(html[j])) j++;
    const raw = html.slice(lt + 1, j).toLowerCase();

    const { attrs, end } = readTag(html, j);
    i = end;

    if (DROP_CONTENT.has(raw)) {
      i = skipContent(html, end, raw);
      continue;
    }

    const canonical = TAG_ALIASES[raw];
    // Not allow-listed: the tag goes, its children stay. `<span>`, `<font>` and
    // `<table>` all reach here, and deleting the words inside them would lose
    // the note rather than clean it.
    if (!canonical) continue;

    if (VOID_TAGS.has(canonical)) {
      out.push(`<${canonical} />`);
      continue;
    }

    if (canonical === "a") {
      // An anchor cannot contain an anchor. A browser closes the outer one when
      // it meets the inner, so leaving both open would store a string whose DOM
      // is not the tree it describes — and a later `closeThrough("a")` would
      // then close the wrong one.
      if (stack.some((tag) => tag.name === "a")) closeThrough("a");

      const href = safeHref(attrs.href ?? "");
      // No usable href: keep the words, drop the anchor. A link to
      // `javascript:…` is the one case where preserving the element would be
      // preserving the attack.
      if (href === null) continue;
      // target and rel are composed here rather than carried over from the
      // input, so a stored `target` cannot be turned into something else and
      // `noopener` is never missing from a `_blank`.
      out.push(`<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">`);
      stack.push({ name: "a" });
      continue;
    }

    // `<li>` implicitly closes an open `<li>`: browsers allow the shorthand and
    // a paste is full of it, and nesting them would indent every line one step
    // further than the last.
    if (canonical === "li" && stack.at(-1)?.name === "li") closeThrough("li");
    // Likewise a paragraph cannot contain a paragraph.
    if (canonical === "p" && stack.some((tag) => tag.name === "p")) closeThrough("p");

    out.push(`<${canonical}>`);
    stack.push({ name: canonical });
  }

  // Anything still open was never closed by the input. Closing it here is what
  // makes the output well-formed regardless of what came in.
  for (let d = stack.length - 1; d >= 0; d--) out.push(`</${stack[d].name}>`);

  return collapseEmpty(out.join(""));
}

/**
 * Drop elements left holding nothing.
 *
 * Stripping a `<span>` or a `<font>` routinely leaves the `<p>` that contained
 * it empty, and an empty paragraph is a blank line somebody did not type. Run to
 * a fixed point, because emptying an inner element can empty its parent.
 */
function collapseEmpty(html: string): string {
  const empty = /<(p|strong|em|u|s|ul|ol|li|a)\b[^>]*><\/\1>/g;
  let previous: string;
  let current = html;
  do {
    previous = current;
    current = current.replace(empty, "");
  } while (current !== previous);
  return current;
}

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
export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = decodeEntities(html.replace(/<[^>]*>/g, ""));
  return text.replace(/[\s\u00a0]/g, "") === "";
}
