import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// src/lib/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/lib/format.ts
function formatMoney(value) {
  if (value == null || value === "") return "$0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (num < 0) return `($${formatted})`;
  return `$${formatted}`;
}
function formatDate(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatPeriodLabel(month, year) {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[month - 1]} ${year}`;
}

// src/lib/rich-text.ts
var TAG_ALIASES = {
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
  a: "a"
};
var RICH_TEXT_TAGS = ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a"];
var RICH_TEXT_EXTENDED_TAGS = [
  ...RICH_TEXT_TAGS,
  "h1",
  "h2",
  "h3",
  "blockquote",
  "code",
  "pre"
];
var RICH_TEXT_IMAGE_TAGS = ["img"];
function richTextTags(options = {}) {
  return [
    ...options.formatting === "extended" ? RICH_TEXT_EXTENDED_TAGS : RICH_TEXT_TAGS,
    ...options.images ? RICH_TEXT_IMAGE_TAGS : []
  ];
}
var EXTENDED_ALIASES = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "p",
  h5: "p",
  h6: "p",
  blockquote: "blockquote",
  code: "code",
  pre: "pre"
};
var VOID_TAGS = /* @__PURE__ */ new Set(["br", "img"]);
function grammarFor(options) {
  const extended = options?.formatting === "extended";
  if (!extended && !options?.images) return DEFAULT_GRAMMAR;
  const aliases = {
    ...TAG_ALIASES,
    ...extended ? EXTENDED_ALIASES : {},
    ...options?.images ? { img: "img" } : {}
  };
  const collapsible = richTextTags(options).filter((tag) => !VOID_TAGS.has(tag));
  return { aliases, empty: emptyElement(collapsible) };
}
function emptyElement(tags) {
  return new RegExp(`<(${tags.join("|")})\\b[^>]*><\\/\\1>`, "g");
}
var DEFAULT_GRAMMAR = {
  aliases: TAG_ALIASES,
  empty: emptyElement(RICH_TEXT_TAGS.filter((tag) => !VOID_TAGS.has(tag)))
};
var DROP_CONTENT = /* @__PURE__ */ new Set([
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
  "textarea"
]);
var SAFE_SCHEMES = ["http:", "https:", "mailto:"];
var NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\xA0",
  // Here for one reason: it is the entity used to hide a scheme, as in
  // `javascript&colon;alert(1)`. safeHref compares against decoded text, so it
  // has to be decoded to be caught.
  colon: ":"
};
function decodeEntities(input) {
  return input.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);?/g, (match, body) => {
    if (body.startsWith("#")) {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      if (!Number.isFinite(code) || code <= 0 || code > 1114111) return match;
      if (code >= 55296 && code <= 57343) return match;
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}
function escapeText(text) {
  return decodeEntities(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00a0/g, "&#160;");
}
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safeHref(raw) {
  const cleaned = decodeEntities(raw).replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (cleaned === "") return null;
  const scheme = cleaned.slice(0, cleaned.indexOf(":") + 1).toLowerCase();
  if (!SAFE_SCHEMES.includes(scheme)) return null;
  return cleaned.replace(/ /g, "%20");
}
function safeImageSrc(raw) {
  const src = safeHref(raw);
  return src !== null && /^https?:/i.test(src) ? src : null;
}
function readTag(html, from) {
  const attrs = {};
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
        i++;
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
function skipContent(html, from, name) {
  const pattern = new RegExp(`</${name}`, "i");
  const match = pattern.exec(html.slice(from));
  if (!match) return html.length;
  const gt = html.indexOf(">", from + match.index);
  return gt === -1 ? html.length : gt + 1;
}
function sanitizeRichText(html, options) {
  if (!html) return "";
  const { aliases, empty } = grammarFor(options);
  const out = [];
  const stack = [];
  let i = 0;
  const closeThrough = (name) => {
    let depth = -1;
    for (let d = stack.length - 1; d >= 0; d--) {
      if (stack[d].name === name) {
        depth = d;
        break;
      }
    }
    if (depth === -1) return;
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
    if (html.startsWith("<!--", lt)) {
      const close = html.indexOf("-->", lt + 4);
      i = close === -1 ? html.length : close + 3;
      continue;
    }
    if (next === "!" || next === "?") {
      const gt = html.indexOf(">", lt);
      i = gt === -1 ? html.length : gt + 1;
      continue;
    }
    if (next === "/") {
      const nameStart = lt + 2;
      let j2 = nameStart;
      while (j2 < html.length && /[a-zA-Z0-9]/.test(html[j2])) j2++;
      const raw2 = html.slice(nameStart, j2).toLowerCase();
      const gt = html.indexOf(">", j2);
      i = gt === -1 ? html.length : gt + 1;
      const canonical2 = aliases[raw2];
      if (canonical2 && !VOID_TAGS.has(canonical2)) closeThrough(canonical2);
      continue;
    }
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
    const canonical = aliases[raw];
    if (!canonical) continue;
    if (canonical === "img") {
      const src = safeImageSrc(attrs.src ?? "");
      if (src === null) continue;
      const alt = escapeAttribute(decodeEntities(attrs.alt ?? ""));
      out.push(`<img src="${escapeAttribute(src)}" alt="${alt}" />`);
      continue;
    }
    if (VOID_TAGS.has(canonical)) {
      out.push(`<${canonical} />`);
      continue;
    }
    if (canonical === "a") {
      if (stack.some((tag) => tag.name === "a")) closeThrough("a");
      const href = safeHref(attrs.href ?? "");
      if (href === null) continue;
      out.push(`<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">`);
      stack.push({ name: "a" });
      continue;
    }
    if (canonical === "li" && stack.at(-1)?.name === "li") closeThrough("li");
    if (canonical === "p" && stack.some((tag) => tag.name === "p")) closeThrough("p");
    if (CLOSES_PARAGRAPH.has(canonical) && stack.some((tag) => tag.name === "p")) closeThrough("p");
    out.push(`<${canonical}>`);
    stack.push({ name: canonical });
  }
  for (let d = stack.length - 1; d >= 0; d--) out.push(`</${stack[d].name}>`);
  return collapseEmpty(out.join(""), empty);
}
var CLOSES_PARAGRAPH = /* @__PURE__ */ new Set(["blockquote", "pre", "h1", "h2", "h3"]);
function collapseEmpty(html, empty) {
  let previous;
  let current = html;
  do {
    previous = current;
    current = current.replace(empty, "");
  } while (current !== previous);
  return current;
}
function isRichTextEmpty(html) {
  if (!html) return true;
  const stored = sanitizeRichText(html, { formatting: "extended", images: true });
  if (/<img\b/.test(stored)) return false;
  const text = decodeEntities(stored.replace(/<[^>]*>/g, ""));
  return text.replace(/[\s\u00a0]/g, "") === "";
}

// src/lib/link-href.ts
var TARGET_ONLY = /^\{\{\s*([a-z0-9_]+)\s*\}\}$/i;
var SCHEME = /^[a-z][a-z0-9+-]*:/i;
var ANY_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
var HOST_PORT = /^[a-z0-9-]+(\.[a-z0-9-]+)+:\d+(?:[/?#]|$)/i;
function parses(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
function normalizeLinkHref(input, { targets = [] } = {}) {
  const s = input.trim();
  if (s === "") return { ok: false, reason: "empty" };
  if (s.includes("{{") || s.includes("}}")) {
    const name = TARGET_ONLY.exec(s)?.[1].toLowerCase();
    const canonical = name === void 0 ? void 0 : `{{${name}}}`;
    if (canonical !== void 0 && targets.includes(canonical)) {
      return { ok: true, href: canonical };
    }
    return { ok: false, reason: targets.length > 0 ? "placeholder" : "scheme" };
  }
  if (/\s/.test(s)) return { ok: false, reason: "scheme" };
  if (/^mailto:./i.test(s)) return { ok: true, href: s };
  if (/^https?:\/\//i.test(s)) {
    return parses(s)?.hostname ? { ok: true, href: s } : { ok: false, reason: "scheme" };
  }
  if (SCHEME.test(s)) return { ok: false, reason: "scheme" };
  if (/^[^@/]+@[^@/]+\.[^@/]+$/.test(s)) return { ok: true, href: `mailto:${s}` };
  if (s.startsWith("/")) return { ok: false, reason: "scheme" };
  const href = `https://${s}`;
  return parses(href)?.hostname.includes(".") ? { ok: true, href } : { ok: false, reason: "scheme" };
}
var INVISIBLE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;
function isAllowedEditorHref(url) {
  const s = (url ?? "").replace(INVISIBLE, "");
  if (s === "") return true;
  if (/^(https?|mailto):/i.test(s)) return true;
  return !ANY_SCHEME.test(s) || HOST_PORT.test(s);
}
function orList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
function linkHrefErrorMessage(reason, { targets = [] } = {}) {
  if (reason === "empty") return "Enter a URL.";
  if (targets.length === 0) {
    return "Use a web address, including https://, or an email link (mailto:\u2026).";
  }
  const list = orList(targets);
  if (reason === "placeholder") {
    return `Only ${list} can be used as a link. Use it on its own, or enter a web address.`;
  }
  return `Use a web address, including https://, an email link (mailto:\u2026) or ${list}.`;
}

export { RICH_TEXT_EXTENDED_TAGS, RICH_TEXT_IMAGE_TAGS, RICH_TEXT_TAGS, cn, formatDate, formatMoney, formatPeriodLabel, isAllowedEditorHref, isRichTextEmpty, linkHrefErrorMessage, normalizeLinkHref, richTextTags, safeHref, sanitizeRichText };
