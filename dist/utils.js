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
var VOID_TAGS = /* @__PURE__ */ new Set(["br"]);
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
function sanitizeRichText(html) {
  if (!html) return "";
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
      const canonical2 = TAG_ALIASES[raw2];
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
    const canonical = TAG_ALIASES[raw];
    if (!canonical) continue;
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
    out.push(`<${canonical}>`);
    stack.push({ name: canonical });
  }
  for (let d = stack.length - 1; d >= 0; d--) out.push(`</${stack[d].name}>`);
  return collapseEmpty(out.join(""));
}
function collapseEmpty(html) {
  const empty = /<(p|strong|em|u|s|ul|ol|li|a)\b[^>]*><\/\1>/g;
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
  const text = decodeEntities(html.replace(/<[^>]*>/g, ""));
  return text.replace(/[\s\u00a0]/g, "") === "";
}

export { RICH_TEXT_TAGS, cn, formatDate, formatMoney, formatPeriodLabel, isRichTextEmpty, safeHref, sanitizeRichText };
