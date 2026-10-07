import { safeHref } from "@/lib/rich-text";

/**
 * The HTML an app's `loadFallback` returns for `FileViewer`, rebuilt from an
 * allowlist before it reaches the page. Internal: not exported.
 *
 * Sanitised here even when the app has sanitised it already: it comes from a
 * converted document (mammoth, a server's extract), which is untrusted, and the
 * viewer renders inside the app's authenticated origin.
 *
 * `sanitizeRichText` is not used. It is sized to what the editor writes (no
 * tables, no h4–h6, http(s) images only), and widening it would change the
 * contract of a helper apps call on the server.
 *
 * The input is parsed into an inert document (`DOMParser`: no script runs, no
 * image loads) and walked. Fresh elements are created in the live document for
 * allowlisted tags only, with only the attributes composed below; text becomes
 * text nodes. Nothing from the input is assigned as markup and nothing is
 * re-serialised, so there is no parse/serialise round trip to mutate.
 */

const HTML_NS = "http://www.w3.org/1999/xhtml";

const ALLOWED = new Set([
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "a",
  "img",
  "hr",
]);

/**
 * Removed together with everything inside them: they hold code, controls or
 * embedded documents, not prose. Any other unknown tag is unwrapped and keeps
 * its children.
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
  "form",
  "button",
  "select",
  "link",
  "meta",
  "base",
]);

/** Raster images inlined by a converter. No SVG: it can carry script. */
const DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp|bmp|avif);base64,[a-z0-9+/=]+$/i;

function imageSrc(raw: string): string | null {
  if (DATA_IMAGE.test(raw.trim())) return raw.trim();
  const src = safeHref(raw);
  return src !== null && /^https:/i.test(src) ? src : null;
}

function span(raw: string | null): string | null {
  if (raw === null || !/^\d{1,4}$/.test(raw.trim())) return null;
  const n = Number(raw.trim());
  return n >= 1 && n <= 1000 ? String(n) : null;
}

/** A fresh element for an allowlisted source element, or null to drop it. */
function rebuild(source: Element, tag: string, doc: Document): Element | null {
  const el = doc.createElement(tag);
  if (tag === "a") {
    const href = safeHref(source.getAttribute("href") ?? "");
    if (href !== null) {
      el.setAttribute("href", href);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  } else if (tag === "img") {
    const src = imageSrc(source.getAttribute("src") ?? "");
    if (src === null) return null;
    el.setAttribute("src", src);
    el.setAttribute("alt", source.getAttribute("alt") ?? "");
  } else if (tag === "td" || tag === "th") {
    for (const name of ["colspan", "rowspan"]) {
      const value = span(source.getAttribute(name));
      if (value !== null) el.setAttribute(name, value);
    }
  }
  return el;
}

function appendClean(source: Node, target: Node, doc: Document): void {
  for (const node of Array.from(source.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(doc.createTextNode(node.nodeValue ?? ""));
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const element = node as Element;
    // SVG and MathML content parses into foreign namespaces; none of it is kept.
    if (element.namespaceURI !== HTML_NS) continue;
    const tag = element.localName;
    if (DROP_CONTENT.has(tag)) continue;
    if (!ALLOWED.has(tag)) {
      appendClean(element, target, doc);
      continue;
    }
    const clean = rebuild(element, tag, doc);
    if (clean === null) continue;
    appendClean(element, clean, doc);
    target.appendChild(clean);
  }
}

/** The allowlisted content of `html`, as nodes owned by `doc`. */
export function sanitizePreviewHtml(html: string, doc: Document): DocumentFragment {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const fragment = doc.createDocumentFragment();
  appendClean(parsed.body, fragment, doc);
  return fragment;
}
