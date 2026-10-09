"use client";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as React from 'react';
import { forwardRef, isValidElement, createContext, useSyncExternalStore, useState, useRef, useImperativeHandle, useEffect, useContext, useLayoutEffect, useCallback, Children, useId, Fragment as Fragment$1, cloneElement, useMemo } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as DialogPrimitive2 from '@radix-ui/react-dialog';
import { X, ExternalLink, Check, ChevronDown, TriangleAlert, Info, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Plus, File, ArrowLeft, Search, Sun, Moon, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
export { AlertCircle as AlertCircleIcon, ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, ArrowUpDown as ArrowUpDownIcon, ArrowUp as ArrowUpIcon, Ban as BanIcon, Calendar as CalendarIcon, CheckCircle2 as CheckCircleIcon, Check as CheckIcon, ChevronDown as ChevronDownIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, ChevronUp as ChevronUpIcon, ClipboardCheck as ClipboardCheckIcon, Copy as CopyIcon, Download as DownloadIcon, ExternalLink as ExternalLinkIcon, Eye as EyeIcon, File as FileIcon, FileText as FileTextIcon, Info as InfoIcon, Layers as LayersIcon, LayoutDashboard as LayoutDashboardIcon, LoaderCircle as LoaderIcon, LogOut as LogOutIcon, MapPin as MapPinIcon, Menu as MenuIcon, MoreHorizontal as MoreHorizontalIcon, PanelLeftClose as PanelLeftCloseIcon, PanelLeft as PanelLeftIcon, Pencil as PencilIcon, Plus as PlusIcon, Search as SearchIcon, Settings as SettingsIcon, Trash2 as TrashIcon, Upload as UploadIcon, Users as UsersIcon, Wallet as WalletIcon, TriangleAlert as WarningIcon, X as XIcon } from 'lucide-react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { createPortal } from 'react-dom';
import { Command } from 'cmdk';
import { ResponsiveContainer, BarChart as BarChart$1, CartesianGrid, XAxis, YAxis, Tooltip as Tooltip$1, Bar, Cell, LabelList, AreaChart, ReferenceLine, Area, PieChart, Pie } from 'recharts';

// src/lib/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/lib/calendar.ts
function dateKey(date) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}
function weekdayOf(date) {
  return (new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7;
}
var WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function isWeekend(date) {
  return weekdayOf(date) >= 5;
}
function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
function addDays(date, step) {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + step));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}
function startOfWeek(date) {
  return addDays(date, -weekdayOf(date));
}
function monthWeeks(month) {
  const cells = Array(weekdayOf({ ...month, day: 1 })).fill(null);
  for (let day = 1; day <= daysInMonth(month.year, month.month); day++) {
    cells.push({ ...month, day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}
function shiftMonth(from, step) {
  const zeroBased = from.month - 1 + step;
  return {
    year: from.year + Math.floor(zeroBased / 12),
    month: (zeroBased % 12 + 12) % 12 + 1
  };
}
function compareMonths(a, b) {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}
function monthLabel({ year, month }) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric"
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
function parseDateKey(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(key);
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= daysInMonth(date.year, date.month) ? date : null;
}
function formatCalendarDate(date, options) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(date.year, date.month - 1, date.day))
  );
}
function formatDateKey(key, options) {
  const date = parseDateKey(key);
  return date ? formatCalendarDate(date, options) : key;
}
function monthOfKey(key) {
  const date = parseDateKey(key);
  return date ? { year: date.year, month: date.month } : null;
}
function todayIn(now = /* @__PURE__ */ new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
function monthKey({ year, month }) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
function parseMonthKey(key) {
  return monthOfKey(`${key}-01`);
}
function datePart(iso) {
  const date = parseDateKey(iso);
  return date ? dateKey(date) : iso.split("T")[0];
}

// src/lib/format.ts
function formatAmount(value, { symbol = true } = {}) {
  if (typeof value === "number") {
    const abs2 = Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const body2 = symbol ? `$${abs2}` : abs2;
    return value < 0 ? `(${body2})` : body2;
  }
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(value.trim());
  if (!match || !(match[2] || match[3])) return symbol ? "$0.00" : "0.00";
  const exponent = Number(match[4] || "0");
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1e3) return symbol ? "$0.00" : "0.00";
  const digits = (match[2] || "0") + (match[3] || "");
  const point = (match[2] || "0").length + exponent;
  const whole = point > 0 ? digits.slice(0, point).padEnd(point, "0") : "0";
  const fraction = point < 0 ? "0".repeat(-point) + digits : digits.slice(point);
  let cents = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
  if ((fraction[2] || "0") >= "5") cents += 1n;
  const integer = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const abs = `${integer}.${(cents % 100n).toString().padStart(2, "0")}`;
  const body = symbol ? `$${abs}` : abs;
  return match[1] === "-" && cents !== 0n ? `(${body})` : body;
}
function formatMoney(value) {
  if (value == null || value === "" || typeof value === "number" && isNaN(value)) return "$0.00";
  return formatAmount(value);
}
var DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
function formatDate(iso) {
  if (!iso) return "\u2014";
  const options = { month: "short", day: "numeric", year: "numeric" };
  if (DATE_ONLY.test(iso)) return formatDateKey(iso, options);
  return new Date(iso).toLocaleDateString("en-US", options);
}
function shortMonthName(month) {
  return formatCalendarDate({ year: 2e3, month, day: 1 }, { month: "short" });
}
function formatPeriodLabel(month, year) {
  return `${shortMonthName(month)} ${year}`;
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

// src/lib/categorical-colors.ts
var PALETTE_SIZE = 11;
var CATEGORICAL_PALETTE = Array.from(
  { length: PALETTE_SIZE },
  (_, i) => `var(--color-category-${i + 1})`
);
var NEUTRAL_CATEGORICAL_COLOR = "var(--color-category-neutral)";
var OVERFLOW_SEGMENT_COLOR = "var(--color-category-overflow)";
var MAX_CHIP_SEGMENTS = 4;
function getCategoricalColor(id) {
  const index = (id % PALETTE_SIZE + PALETTE_SIZE) % PALETTE_SIZE;
  return CATEGORICAL_PALETTE[index];
}
function getCategoricalSegments(ids) {
  if (ids.length === 0) return [{ color: NEUTRAL_CATEGORICAL_COLOR }];
  if (ids.length <= MAX_CHIP_SEGMENTS) {
    return ids.map((id) => ({ color: getCategoricalColor(id) }));
  }
  const visible = ids.slice(0, MAX_CHIP_SEGMENTS - 1);
  return [
    ...visible.map((id) => ({ color: getCategoricalColor(id) })),
    { color: OVERFLOW_SEGMENT_COLOR, overflowCount: ids.length - visible.length }
  ];
}

// src/lib/ui-classes.ts
var overlayClass = "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";
var modalSurfaceClass = "fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
var floatingSurfaceClass = "z-50 rounded-lg border border-border bg-surface-raised shadow-lg";
var floatingMotionClass = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
var optionRowClass = "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary outline-none transition-colors";
var optionRowFocusClass = "focus:bg-surface-overlay focus:text-text-primary data-[highlighted]:bg-surface-overlay data-[highlighted]:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
var optionRowActiveClass = "bg-surface-overlay text-text-primary";
var fieldChromeClass = "w-full min-w-0 rounded-md border border-border bg-surface-raised text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50";
var eyebrowClass = "text-xs font-medium uppercase tracking-wider text-text-muted";
var toneFillClass = {
  success: "bg-success-soft text-success-text",
  error: "bg-error-soft text-error-text",
  info: "bg-info-soft text-info-text",
  warning: "bg-warning-soft text-warning-text"
};
var toneBorderClass = {
  success: "border-success-border",
  error: "border-error-border",
  info: "border-info-border",
  warning: "border-warning-border"
};
var tableRowHoverClass = "hover:bg-table-row-hover";
var linkTextClass = "text-accent-text underline-offset-4 hover:underline";
var Input = forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          fieldChromeClass,
          "flex h-8 px-3 py-1",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
var loadPromise = null;
function getApiKey() {
  const viteEnv = import.meta.env;
  const nodeEnv = globalThis.process?.env;
  return viteEnv?.VITE_GOOGLE_MAPS_API_KEY ?? nodeEnv?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}
function loadGoogleMaps() {
  if (loadPromise) return loadPromise;
  const key = getApiKey();
  if (!key || typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return loadPromise;
}
var PUBLIC_CLASS = "dark h-9 py-0 shadow-none";
function AddressAutocomplete({ value, onChange, onBlur, placeholder = "Start typing an address...", className, variant = "staff" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address) {
      onChange(place.formatted_address);
    }
  }, [onChange]);
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps().then(() => {
      if (!mounted || !inputRef.current || !window.google?.maps?.places) return;
      if (autocompleteRef.current) return;
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"]
      });
      ac.addListener("place_changed", handlePlaceSelect);
      autocompleteRef.current = ac;
    });
    return () => {
      mounted = false;
    };
  }, [handlePlaceSelect]);
  return /* @__PURE__ */ jsx(
    Input,
    {
      ref: inputRef,
      type: "text",
      value,
      onChange: (e) => onChange(e.target.value),
      onBlur,
      placeholder,
      className: cn(variant === "public" && PUBLIC_CLASS, className)
    }
  );
}
var destructiveSolidClass = "bg-[var(--color-error-solid,#dc2626)] text-[color:var(--color-error-foreground,#fafafa)] hover:bg-[var(--color-error,#ef4444)]";
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-w-0 [&>svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent-hover",
        destructive: destructiveSolidClass,
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
        link: linkTextClass
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
        // A fixed square, so it never gives: min-w-0 above lets a button shrink
        // in a flex row, which is right for one carrying a label and wrong for
        // one carrying a single glyph.
        icon: "h-8 w-8 shrink-0"
      },
      /**
       * `destructive` turns an `outline`, `ghost` or `link` button red: a quiet
       * delete or remove beside other actions. The solid red button is
       * `variant="destructive"` (which `tone="destructive"` on the default
       * variant also gives).
       */
      tone: {
        default: "",
        destructive: ""
      }
    },
    compoundVariants: [
      {
        variant: "default",
        tone: "destructive",
        className: destructiveSolidClass
      },
      {
        variant: "outline",
        tone: "destructive",
        className: "border-error-border text-error-text hover:bg-error-soft hover:text-error-text"
      },
      {
        variant: "ghost",
        tone: "destructive",
        className: "text-error-text hover:bg-error-soft hover:text-error-text"
      },
      { variant: "link", tone: "destructive", className: "text-error-text" }
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      tone: "default"
    }
  }
);
function withTruncatableLabels(children) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length === 0) return;
    out.push(
      /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate", children: run.join("") }, `label-${out.length}`)
    );
    run = [];
  };
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      run.push(String(child));
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}
var Button = forwardRef(
  ({ className, variant, size, tone, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, tone, className })), ref, ...props, children: asChild && isValidElement(children) ? children : withTruncatableLabels(children) });
  }
);
Button.displayName = "Button";
var badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-surface-overlay text-text-secondary",
        accent: "bg-accent-muted text-accent-text",
        success: toneFillClass.success,
        warning: toneFillClass.warning,
        error: toneFillClass.error,
        info: toneFillClass.info
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("span", { className: cn(badgeVariants({ variant }), className), ...props });
}
var DismissButton = forwardRef(
  ({ label, size = "md", className, ...props }, ref) => /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      type: "button",
      variant: "ghost",
      size: "icon",
      "aria-label": label,
      className: cn(
        "text-current opacity-70 hover:bg-transparent hover:text-current hover:opacity-100",
        size === "sm" ? "h-4 w-4 rounded-full" : "h-6 w-6",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(X, { size: size === "sm" ? 12 : 14, "aria-hidden": "true" })
    }
  )
);
DismissButton.displayName = "DismissButton";
function CloseButton({ className }) {
  return /* @__PURE__ */ jsx(DialogPrimitive2.Close, { asChild: true, children: /* @__PURE__ */ jsx(DismissButton, { label: "Close", className: cn("absolute right-4 top-4", className) }) });
}
function Tag({
  children,
  variant,
  onRemove,
  removeLabel = "Remove",
  disabled,
  className
}) {
  return /* @__PURE__ */ jsxs("span", { className: cn(badgeVariants({ variant }), "gap-1 text-xs", className), children: [
    children,
    onRemove && // Sized to the badge's line rather than the 32px icon button.
    /* @__PURE__ */ jsx(DismissButton, { size: "sm", label: removeLabel, onClick: onRemove, disabled, className: "-mr-1" })
  ] });
}
var cardVariants = cva("rounded-lg border border-border bg-surface", {
  variants: {
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-6 sm:p-10"
    },
    hoverable: {
      true: "transition-colors hover:border-text-faint hover:bg-surface-raised",
      false: ""
    }
  },
  defaultVariants: {
    padding: "md",
    hoverable: false
  }
});
var Card = forwardRef(
  ({ className, padding, hoverable, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return /* @__PURE__ */ jsx(Comp, { ref, className: cn(cardVariants({ padding, hoverable }), className), ...props });
  }
);
Card.displayName = "Card";
function CardHeader({
  title,
  description,
  actions,
  as: Heading = "h2",
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-4 flex items-start justify-between gap-4", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      title != null && title !== false && /* @__PURE__ */ jsx(
        Heading,
        {
          className: cn(
            "text-text-primary",
            size === "sm" ? "text-sm font-medium" : "text-base font-semibold"
          ),
          children: title
        }
      ),
      description && /* @__PURE__ */ jsx("p", { className: cn("mt-0.5 text-text-secondary", size === "sm" ? "text-xs" : "text-sm"), children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-2", children: actions })
  ] });
}
var alertVariants = cva("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    variant: {
      error: cn(toneBorderClass.error, toneFillClass.error),
      success: cn(toneBorderClass.success, toneFillClass.success),
      info: cn(toneBorderClass.info, toneFillClass.info),
      warning: cn(toneBorderClass.warning, toneFillClass.warning)
    }
  },
  defaultVariants: {
    variant: "error"
  }
});
var icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert
};
function Alert({ variant, title, children, onDismiss, className }) {
  const Icon2 = icons[variant ?? "error"];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: variant === "error" || variant == null ? "alert" : "status",
      className: cn(alertVariants({ variant }), className),
      children: [
        /* @__PURE__ */ jsx(Icon2, { size: 16, className: "mt-0.5 shrink-0", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          title && /* @__PURE__ */ jsx("p", { className: "font-medium", children: title }),
          children && /* @__PURE__ */ jsx("div", { className: cn(title && "mt-0.5"), children })
        ] }),
        onDismiss && /* @__PURE__ */ jsx(DismissButton, { label: "Dismiss", onClick: onDismiss, className: "-mr-1 -mt-0.5" })
      ]
    }
  );
}
var sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]"
};
function Spinner({ size = "md", label, className }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      "aria-label": label ?? "Loading",
      className: cn("flex flex-col items-center justify-center gap-3", className),
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            "aria-hidden": "true",
            className: cn(
              "inline-block animate-spin rounded-full border-accent border-r-transparent",
              sizeClasses[size]
            )
          }
        ),
        label && /* @__PURE__ */ jsx("p", { className: "text-sm text-text-muted", children: label })
      ]
    }
  );
}
var Label = forwardRef(
  ({ className, required, children, ...props }, ref) => /* @__PURE__ */ jsxs(
    "label",
    {
      ref,
      className: cn("block text-xs font-medium text-text-muted", className),
      ...props,
      children: [
        children,
        required && /* @__PURE__ */ jsx("span", { className: "ml-0.5 text-error", "aria-hidden": "true", children: "*" })
      ]
    }
  )
);
Label.displayName = "Label";
function pageSlots(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "gap-end", totalPages];
  if (page >= totalPages - 3)
    return [1, "gap-start", ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  return [1, "gap-start", page - 1, page, page + 1, "gap-end", totalPages];
}
function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className
}) {
  if (totalPages <= 1) return null;
  return /* @__PURE__ */ jsxs(
    "nav",
    {
      "aria-label": "Pagination",
      className: cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className),
      children: [
        totalItems !== void 0 && pageSize !== void 0 ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-text-muted tabular-nums", children: [
          "Showing ",
          (page - 1) * pageSize + 1,
          "\u2013",
          Math.min(page * pageSize, totalItems),
          " of",
          " ",
          totalItems
        ] }) : /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              "aria-label": "Previous page",
              disabled: page <= 1,
              onClick: () => onPageChange(page - 1),
              children: /* @__PURE__ */ jsx(ChevronLeft, { size: 16, "aria-hidden": "true" })
            }
          ),
          pageSlots(page, totalPages).map(
            (slot) => typeof slot === "number" ? /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: slot === page ? "outline" : "ghost",
                size: "icon",
                "aria-label": `Page ${slot}`,
                "aria-current": slot === page ? "page" : void 0,
                className: cn(slot === page && "border-accent text-accent-text"),
                onClick: () => onPageChange(slot),
                children: slot
              },
              slot
            ) : /* @__PURE__ */ jsx("span", { className: "px-1 text-sm text-text-faint", "aria-hidden": "true", children: "\u2026" }, slot)
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              "aria-label": "Next page",
              disabled: page >= totalPages,
              onClick: () => onPageChange(page + 1),
              children: /* @__PURE__ */ jsx(ChevronRight, { size: 16, "aria-hidden": "true" })
            }
          )
        ] })
      ]
    }
  );
}
function useCreateOption(onCreate) {
  const inFlight = useRef(false);
  const [creating, setCreating] = useState(false);
  async function create(input, onSuccess) {
    if (!onCreate || !input || inFlight.current) return;
    inFlight.current = true;
    setCreating(true);
    let created = false;
    try {
      await onCreate(input);
      created = true;
    } catch {
    } finally {
      inFlight.current = false;
      setCreating(false);
    }
    if (created) onSuccess();
  }
  return { creating, create };
}
function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Search\u2026",
  emptyMessage = "No matches",
  disabled = false,
  id,
  ariaLabel,
  className,
  onSearchChange,
  loading = false,
  onCreate,
  createLabel = (input) => `Create "${input}"`
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = useId();
  const selected = new Set(value);
  const query = search.trim().toLowerCase();
  const filtered = query && !onSearchChange ? options.filter((o) => o.label.toLowerCase().includes(query)) : options;
  const trimmed = search.trim();
  const showCreate = !!onCreate && trimmed.length > 0 && !options.some((o) => o.label.toLowerCase() === query);
  const rowCount = filtered.length + (showCreate ? 1 : 0);
  const searchRef = useRef(search);
  function updateSearch(next) {
    setSearch(next);
    if (next !== searchRef.current) onSearchChange?.(next);
    searchRef.current = next;
  }
  function close() {
    setOpen(false);
    updateSearch("");
    setHighlighted(-1);
  }
  const { creating, create: createOption } = useCreateOption(onCreate);
  function create() {
    return createOption(trimmed, () => {
      updateSearch("");
      setHighlighted(-1);
    });
  }
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (!containerRef.current?.contains(e.target)) close();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);
  useEffect(() => {
    if (highlighted < 0) return;
    const item = listRef.current?.querySelectorAll('[role="option"]')[highlighted];
    item?.scrollIntoView?.({ block: "nearest" });
  }, [highlighted]);
  function toggle(option) {
    if (option.disabled) return;
    onChange(
      selected.has(option.value) ? value.filter((v) => v !== option.value) : [...value, option.value]
    );
  }
  function onKeyDown(e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setHighlighted((i) => Math.min(i + 1, rowCount - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (open && filtered[highlighted]) {
          e.preventDefault();
          toggle(filtered[highlighted]);
        } else if (open && showCreate && highlighted === filtered.length) {
          e.preventDefault();
          void create();
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
      case "Backspace":
        if (!search && value.length > 0) {
          e.preventDefault();
          onChange(value.slice(0, -1));
        }
        break;
    }
  }
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          id,
          type: "text",
          role: "combobox",
          "aria-label": ariaLabel,
          "aria-expanded": open,
          "aria-haspopup": "listbox",
          "aria-autocomplete": "list",
          "aria-controls": listboxId,
          value: search,
          placeholder,
          disabled,
          onChange: (e) => {
            updateSearch(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          },
          onFocus: () => setOpen(true),
          onClick: () => setOpen(true),
          onKeyDown,
          className: "pr-8"
        }
      ),
      /* @__PURE__ */ jsx(
        ChevronDown,
        {
          size: 14,
          "aria-hidden": "true",
          className: cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-transform",
            open && "rotate-180"
          )
        }
      )
    ] }),
    open && !disabled && /* @__PURE__ */ jsxs(
      "ul",
      {
        ref: listRef,
        id: listboxId,
        role: "listbox",
        "aria-multiselectable": "true",
        "aria-busy": loading || void 0,
        className: cn(floatingSurfaceClass, "absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto p-1"),
        children: [
          filtered.length === 0 && !showCreate ? /* @__PURE__ */ jsx("li", { className: "px-2 py-3 text-center text-sm text-text-muted", children: loading ? "Loading\u2026" : emptyMessage }) : filtered.map((option, index) => {
            const isSelected = selected.has(option.value);
            return /* @__PURE__ */ jsxs(
              "li",
              {
                role: "option",
                "aria-selected": isSelected,
                "aria-disabled": option.disabled || void 0,
                onMouseDown: (e) => {
                  e.preventDefault();
                  toggle(option);
                },
                onMouseEnter: () => setHighlighted(index),
                className: cn(
                  optionRowClass,
                  highlighted === index && optionRowActiveClass,
                  isSelected && "text-text-primary",
                  option.disabled && "cursor-not-allowed opacity-50"
                ),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "flex h-3.5 w-3.5 shrink-0 items-center justify-center text-accent-text", children: isSelected && /* @__PURE__ */ jsx(Check, { size: 12 }) }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block truncate", children: option.label }),
                    option.sublabel && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-text-muted", children: option.sublabel })
                  ] })
                ]
              },
              option.value
            );
          }),
          showCreate && /* @__PURE__ */ jsxs(
            "li",
            {
              role: "option",
              "aria-selected": false,
              "aria-disabled": creating || void 0,
              onMouseDown: (e) => {
                e.preventDefault();
                void create();
              },
              onMouseEnter: () => setHighlighted(filtered.length),
              className: cn(
                optionRowClass,
                "text-accent-text",
                highlighted === filtered.length && "bg-surface-overlay",
                creating && "cursor-wait opacity-50"
              ),
              children: [
                /* @__PURE__ */ jsx(Plus, { size: 12, "aria-hidden": "true", className: "shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: createLabel(trimmed) })
              ]
            }
          )
        ]
      }
    )
  ] });
}
var sizeClasses2 = {
  sm: "h-6 px-2.5 text-xs",
  md: "h-7 px-3 text-sm"
};
var NEXT_KEYS = ["ArrowRight", "ArrowDown"];
var PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];
function SegmentedControl({
  options,
  value,
  onChange,
  name,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
  error = false,
  disabled = false,
  size = "md",
  className
}) {
  const refs = useRef([]);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex;
  function select(next) {
    if (next !== value) onChange(next);
  }
  function onKeyDown(e, index) {
    const step = NEXT_KEYS.includes(e.key) ? 1 : PREVIOUS_KEYS.includes(e.key) ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const nextIndex = (index + step + options.length) % options.length;
    select(options[nextIndex].value);
    refs.current[nextIndex]?.focus();
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id,
      role: "radiogroup",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-required": ariaRequired,
      "aria-invalid": error || void 0,
      "aria-disabled": disabled || void 0,
      className: cn(
        "inline-flex gap-0.5 rounded-md border bg-surface-raised p-0.5",
        error ? "border-error" : "border-border",
        className
      ),
      children: [
        options.map((option, index) => {
          const selected = index === selectedIndex;
          return /* @__PURE__ */ jsx(
            Button,
            {
              ref: (el) => {
                refs.current[index] = el;
              },
              type: "button",
              variant: "ghost",
              role: "radio",
              "aria-checked": selected,
              tabIndex: index === tabbableIndex ? 0 : -1,
              disabled,
              onClick: () => select(option.value),
              onKeyDown: (e) => onKeyDown(e, index),
              className: cn(
                // `min-w-max`: Button lets its label shrink and truncate, and a
                // segment must always show its whole label instead.
                "min-w-max flex-1 rounded",
                sizeClasses2[size],
                // Selected is the solid accent, and stays it on hover.
                selected && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
              ),
              children: option.label
            },
            option.value
          );
        }),
        name && /* @__PURE__ */ jsx("input", { type: "hidden", name, value: value ?? "", disabled })
      ]
    }
  );
}
var CategoryChip = forwardRef(
  ({ segments, label, className, ...props }, ref) => /* @__PURE__ */ jsxs(
    Button,
    {
      ref,
      ...props,
      type: "button",
      variant: "ghost",
      size: "sm",
      className: cn(
        // The bands are the fill, so the ghost hover wash and text colours give
        // way to a brightness lift and the white category foreground.
        "relative h-6 w-full justify-start overflow-hidden px-1.5 text-category-foreground ring-1 ring-border hover:bg-transparent hover:text-category-foreground hover:brightness-110",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "absolute inset-0 flex", children: segments.map((segment, i) => /* @__PURE__ */ jsx("span", { className: "flex-1", style: { backgroundColor: segment.color } }, i)) }),
        /* @__PURE__ */ jsx("span", { className: "relative z-10 min-w-0 truncate text-xs font-medium text-shadow-xs", children: label })
      ]
    }
  )
);
CategoryChip.displayName = "CategoryChip";
var sizeClasses3 = {
  /** 8px: a legend or tooltip key beside 12px text. */
  xs: "size-2",
  /** 12px. */
  sm: "size-3",
  /** 16px. */
  md: "size-4"
};
function Swatch({ color, size = "xs", dimmed = false, label, title, className }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      ...label ? { role: "img", "aria-label": label } : { "aria-hidden": true },
      title,
      className: cn("inline-block shrink-0 rounded-full", sizeClasses3[size], className),
      style: { backgroundColor: color, opacity: dimmed ? 0.35 : void 0 }
    }
  );
}
function StatusIndicator({
  color,
  label,
  showLabel = false,
  size = "md",
  nativeTitle = true,
  className
}) {
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-2", className), children: [
    /* @__PURE__ */ jsx(
      Swatch,
      {
        color,
        size,
        label: showLabel ? void 0 : label,
        title: nativeTitle ? label : void 0
      }
    ),
    showLabel && /* @__PURE__ */ jsx("span", { className: "text-sm text-text-secondary", children: label })
  ] });
}
function externalRel(rel) {
  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return [...tokens].join(" ");
}
var TextLink = forwardRef(
  ({ asChild = false, external = false, className, children, target, rel, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return /* @__PURE__ */ jsxs(
      Comp,
      {
        ref,
        target: external ? "_blank" : target,
        rel: external ? externalRel(rel) : rel,
        className: cn(
          linkTextClass,
          "inline-flex items-baseline gap-1 rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          className
        ),
        ...props,
        children: [
          /* @__PURE__ */ jsx(Slottable, { children }),
          external && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(ExternalLink, { size: 12, "aria-hidden": "true", className: "shrink-0 self-center" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: " (opens in a new tab)" })
          ] })
        ]
      }
    );
  }
);
TextLink.displayName = "TextLink";
var Dialog = DialogPrimitive2.Root;
var DialogTrigger = DialogPrimitive2.Trigger;
var DialogClose = DialogPrimitive2.Close;
var DialogPortal = DialogPrimitive2.Portal;
var DialogOverlay = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive2.Overlay,
  {
    ref,
    className: cn(overlayClass, className),
    ...props
  }
));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive2.Content,
    {
      ref,
      className: cn(modalSurfaceClass, className),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(CloseButton, {})
      ]
    }
  )
] }));
DialogContent.displayName = "DialogContent";
function DialogBody({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("min-h-0 flex-1 overflow-y-auto", className), ...props });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mb-4 shrink-0 space-y-1", className), ...props });
}
var DialogTitle = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive2.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-text-primary", className),
    ...props
  }
));
DialogTitle.displayName = "DialogTitle";
function DialogDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx("p", { className: cn("text-sm text-text-muted", className), ...props });
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mt-6 flex shrink-0 justify-end gap-2", className), ...props });
}
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPrimitive.Portal, { children: [
  /* @__PURE__ */ jsx(AlertDialogPrimitive.Overlay, { className: overlayClass }),
  /* @__PURE__ */ jsx(AlertDialogPrimitive.Content, { ref, className: cn(modalSurfaceClass, className), ...props })
] }));
AlertDialogContent.displayName = "AlertDialogContent";
var AlertDialogHeader = DialogHeader;
var AlertDialogFooter = DialogFooter;
var AlertDialogTitle = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-text-primary", className),
    ...props
  }
));
AlertDialogTitle.displayName = "AlertDialogTitle";
var AlertDialogDescription = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-text-muted", className),
    ...props
  }
));
AlertDialogDescription.displayName = "AlertDialogDescription";
var AlertDialogAction = forwardRef(
  ({ className, tone = "default", ...props }, ref) => /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Action,
    {
      ref,
      className: cn(buttonVariants({ tone }), className),
      ...props
    }
  )
);
AlertDialogAction.displayName = "AlertDialogAction";
var AlertDialogCancel = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), className),
    ...props
  }
));
AlertDialogCancel.displayName = "AlertDialogCancel";
var ConfirmContext = createContext(null);
function ConfirmProvider({ children }) {
  const [pending2, setPending] = useState(null);
  const pendingRef = useRef(null);
  const returnFocusRef = useRef(null);
  useEffect(
    () => () => {
      pendingRef.current?.resolve(false);
      pendingRef.current = null;
    },
    []
  );
  const settle = useCallback((confirmed) => {
    pendingRef.current?.resolve(confirmed);
    pendingRef.current = null;
    setPending(null);
  }, []);
  const confirm = useCallback(
    (options) => new Promise((resolve) => {
      pendingRef.current?.resolve(false);
      const active = document.activeElement;
      returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      const next = { ...options, resolve };
      pendingRef.current = next;
      setPending(next);
    }),
    []
  );
  return /* @__PURE__ */ jsxs(ConfirmContext.Provider, { value: confirm, children: [
    children,
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: pending2 !== null,
        onOpenChange: (open) => {
          if (!open) settle(false);
        },
        children: pending2 && /* @__PURE__ */ jsxs(
          AlertDialogContent,
          {
            onCloseAutoFocus: (event) => {
              event.preventDefault();
              const el = returnFocusRef.current;
              returnFocusRef.current = null;
              if (el?.isConnected) el.focus();
            },
            children: [
              /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsx(AlertDialogTitle, { children: pending2.title }),
                pending2.description && /* @__PURE__ */ jsx(AlertDialogDescription, { children: pending2.description })
              ] }),
              /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsx(AlertDialogCancel, { children: pending2.cancelLabel ?? "Cancel" }),
                /* @__PURE__ */ jsx(AlertDialogAction, { tone: pending2.destructive ? "destructive" : "default", onClick: () => settle(true), children: pending2.confirmLabel ?? "Confirm" })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm needs a <ConfirmProvider> above it.");
  return confirm;
}
var Checkbox = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded border border-border bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 }) })
  }
));
Checkbox.displayName = "Checkbox";
function CheckboxGroup({
  value,
  onChange,
  options,
  name,
  orientation = "horizontal",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy
}) {
  const baseId = useId();
  const vertical = orientation === "vertical";
  function toggle(optionValue, checked) {
    if (checked) {
      if (!value.includes(optionValue)) onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className: cn(
        vertical ? "flex flex-col" : "flex flex-wrap items-center gap-4",
        className
      ),
      children: options.map((option, index) => {
        const id = `${baseId}-${index}`;
        const isDisabled = disabled || option.disabled;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "inline-flex items-center gap-2",
              // A vertical list is a column of rows: each takes the full width and
              // answers the pointer, as the options of a filter menu do.
              vertical && "w-full rounded px-1 py-1.5 hover:bg-surface-overlay"
            ),
            children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  id,
                  name,
                  value: option.value,
                  checked: value.includes(option.value),
                  disabled: isDisabled,
                  onCheckedChange: (checked) => toggle(option.value, checked === true)
                }
              ),
              /* @__PURE__ */ jsx(
                Label,
                {
                  htmlFor: id,
                  className: cn(
                    "text-sm text-text-secondary",
                    vertical && "flex-1",
                    isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  ),
                  children: option.label
                }
              )
            ]
          },
          option.value
        );
      })
    }
  );
}
var STATUS_MAP = {
  OPEN: "success",
  ACTIVE: "success",
  APPROVED: "success",
  POSTED: "success",
  CURRENT: "success",
  PAID: "success",
  COMPLETED: "success",
  CLOSED: "error",
  VOIDED: "error",
  CANCELLED: "error",
  REJECTED: "error",
  PAST_RESIDENT: "error",
  SOFT_CLOSED: "warning",
  PENDING: "warning",
  PENDING_APPROVAL: "warning",
  DRAFT: "default",
  NOTICE: "warning",
  PARTIALLY_PAID: "info",
  PARTIALLY_FULFILLED: "info",
  IN_PROGRESS: "info",
  APPLICANT: "info",
  // Renewal pipeline statuses.
  NOT_STARTED: "warning",
  RENEWED: "success",
  WENT_MTM: "info",
  // Unit: an application landed but no lease is signed — still available to others.
  VACANT_APPLICANT_PENDING: "accent"
};
function StatusBadge({ status, className }) {
  const variant = STATUS_MAP[status] ?? "default";
  const label = status.replace(/_/g, " ");
  return /* @__PURE__ */ jsx(Badge, { variant, className, children: label });
}
var Textarea = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          fieldChromeClass,
          "flex min-h-[80px] px-3 py-2",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

// src/components/ui/rich-text-editor-loader.ts
var impl = null;
var pending = null;
var listeners = /* @__PURE__ */ new Set();
var notify = () => listeners.forEach((listener) => listener());
function loadRichTextEditor() {
  pending ??= import('./rich-text-editor-impl.js').then(
    (module) => {
      impl = module.RichTextEditorImpl;
      notify();
      return impl;
    },
    (cause) => {
      pending = null;
      throw cause;
    }
  );
  return pending;
}
function subscribeRichTextEditor(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
var loadedRichTextEditor = () => impl;
var RichTextEditor = forwardRef(
  function RichTextEditor2(props, ref) {
    const Impl = useSyncExternalStore(subscribeRichTextEditor, loadedRichTextEditor, () => null);
    const [failure, setFailure] = useState(null);
    const inner = useRef(null);
    useImperativeHandle(
      ref,
      () => ({
        insert: (html) => inner.current?.insert(html),
        focus: () => inner.current?.focus()
      }),
      []
    );
    useEffect(() => {
      if (Impl) return;
      loadRichTextEditor().catch((cause) => setFailure({ cause }));
    }, [Impl]);
    if (failure) throw failure.cause;
    if (Impl) return /* @__PURE__ */ jsx(Impl, { ref: inner, ...props });
    return /* @__PURE__ */ jsxs(
      "div",
      {
        "aria-busy": "true",
        className: cn(
          "overflow-hidden rounded-md border bg-surface-raised shadow-sm",
          props.invalid ? "border-error-border" : "border-border",
          props.disabled && "opacity-50"
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 border-b border-border-subtle bg-surface" }),
          /* @__PURE__ */ jsx("div", { className: cn("min-h-24 w-full", props.className) })
        ]
      }
    );
  }
);
var Switch = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitive.Root,
  {
    ref,
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-border",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitive.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-carbon-50 shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = "Switch";
var EMPTY_VALUE = "\0carbon-select-empty";
var EmptyItemContext = createContext(null);
function Select({
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  form,
  children,
  ...props
}) {
  const [emptyItems, setEmptyItems] = useState(0);
  const register = useCallback(
    (delta) => setEmptyItems((n) => n + delta),
    []
  );
  const hasEmptyItem = emptyItems > 0;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;
  return /* @__PURE__ */ jsxs(EmptyItemContext.Provider, { value: register, children: [
    /* @__PURE__ */ jsx(
      SelectPrimitive.Root,
      {
        ...props,
        disabled,
        form,
        value: current === void 0 ? "" : current === "" && hasEmptyItem ? EMPTY_VALUE : current,
        onValueChange: (next) => {
          const mapped = next === EMPTY_VALUE ? "" : next;
          if (value === void 0) setUncontrolled(mapped);
          onValueChange?.(mapped);
        },
        name: hasEmptyItem ? void 0 : name,
        children
      }
    ),
    hasEmptyItem && name && // `disabled` and `form` as Radix's own field would have them: a
    // disabled Select submits nothing, and `form` ties it to a form
    // elsewhere in the page.
    /* @__PURE__ */ jsx("input", { type: "hidden", name, value: current ?? "", disabled, form })
  ] });
}
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      fieldChromeClass,
      "flex h-8 items-center justify-between gap-2 px-3",
      "[&>span]:min-w-0 [&>span]:truncate",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "shrink-0 text-text-muted" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
var SelectContent = forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      floatingSurfaceClass,
      floatingMotionClass,
      "relative max-h-72 min-w-[8rem] overflow-hidden",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: /* @__PURE__ */ jsx(
      SelectPrimitive.Viewport,
      {
        className: cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        ),
        children
      }
    )
  }
) }));
SelectContent.displayName = "SelectContent";
var SelectItem = forwardRef(({ className, children, value, ...props }, ref) => {
  const register = useContext(EmptyItemContext);
  const empty = value === "";
  useLayoutEffect(() => {
    if (!empty || !register) return;
    register(1);
    return () => register(-1);
  }, [empty, register]);
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      ref,
      value: empty ? EMPTY_VALUE : value,
      className: cn(
        optionRowClass,
        optionRowFocusClass,
        "pl-8 pr-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { size: 12 }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
});
SelectItem.displayName = "SelectItem";

// src/lib/file-viewer.ts
var CSV_ROW_CAP = 1e3;
var TEXT_CHAR_CAP = 2e5;
var DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
var CSV_TYPES = /* @__PURE__ */ new Set(["text/csv", "application/csv", "text/comma-separated-values"]);
var CSV_BY_NAME_TYPES = /* @__PURE__ */ new Set(["application/vnd.ms-excel", "text/plain", "application/octet-stream", ""]);
var IMAGE_TYPES = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/webp", "image/avif"]);
var KIND_BY_EXTENSION = {
  pdf: "pdf",
  docx: "docx",
  doc: "doc",
  txt: "text",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  bmp: "image",
  webp: "image",
  avif: "image"
};
function normalizeContentType(raw) {
  return (raw ?? "").split(";")[0].trim().toLowerCase();
}
function extensionOf(filename) {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}
function fileViewerKind(contentType, filename) {
  const type = normalizeContentType(contentType);
  const ext = extensionOf(filename);
  if (CSV_TYPES.has(type)) return "csv";
  if (ext === "csv" && CSV_BY_NAME_TYPES.has(type)) return "csv";
  if (type === "application/pdf") return "pdf";
  if (type === DOCX_TYPE) return "docx";
  if (type === "application/msword") return "doc";
  if (type.startsWith("image/")) return IMAGE_TYPES.has(type) ? "image" : "unsupported";
  if (type === "text/plain") return "text";
  if (type === "" || type === "application/octet-stream") return KIND_BY_EXTENSION[ext] ?? "unsupported";
  return "unsupported";
}
function documentLinkHref(href) {
  if (href === null) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith("#")) return { href: trimmed, external: false };
  const safe = safeHref(href);
  return safe === null ? null : { href: safe, external: true };
}
var SYMBOL_FONT_BULLETS = {
  "\uF0B7": "\u2022",
  // Symbol / Wingdings filled bullet
  "\uF06C": "\u2022",
  // Wingdings filled circle
  "\uF0A7": "\u25AA",
  // Wingdings filled square
  "\uF0A8": "\u25E6",
  // Wingdings hollow bullet
  "\uF0FC": "\u2714",
  // Wingdings check mark
  "\uF0D8": "\u27A2",
  // Wingdings arrowhead
  "\uF0E0": "\u2192"
  // Wingdings arrow
};
var PRIVATE_USE_GLYPH = /[-]/g;
function replaceSymbolGlyphs(content) {
  return content.replace(PRIVATE_USE_GLYPH, (ch) => SYMBOL_FONT_BULLETS[ch] ?? "\u2022");
}
function decodeText(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}
function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, "\n");
}
function capText(text, cap = TEXT_CHAR_CAP) {
  return text.length > cap ? { text: text.slice(0, cap), truncated: true } : { text, truncated: false };
}
function shapeCsvRows(parsed, cap = CSV_ROW_CAP) {
  const [first = [], ...data] = parsed;
  const kept = data.slice(0, cap);
  const width = Math.max(first.length, ...kept.map((row) => row.length));
  const pad = (row) => row.length < width ? [...row, ...Array(width - row.length).fill("")] : row;
  return { header: pad(first), rows: kept.map(pad), truncated: data.length > cap };
}
function EmptyState({
  icon,
  title,
  as: Heading = "h3",
  description,
  action,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center py-16 text-center", className), children: [
    icon && /* @__PURE__ */ jsx("div", { className: "mb-4 text-text-faint", children: icon }),
    /* @__PURE__ */ jsx(Heading, { className: "text-sm font-medium text-text-primary", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-sm text-sm text-text-muted", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4", children: action })
  ] });
}
var Table = forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("table", { ref, className: cn("w-full text-sm", className), ...props })
);
Table.displayName = "Table";
var TableHeader = forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("thead", { ref, className: cn("[&_tr]:border-border", className), ...props })
);
TableHeader.displayName = "TableHeader";
var TableBody = forwardRef(
  (props, ref) => /* @__PURE__ */ jsx("tbody", { ref, ...props })
);
TableBody.displayName = "TableBody";
var TableFooter = forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("tfoot", { ref, className: cn("[&_tr]:border-b-0 [&_tr]:border-t-2 [&_tr]:border-border", className), ...props })
);
TableFooter.displayName = "TableFooter";
var TableRow = forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("tr", { ref, className: cn("border-b border-border-subtle", className), ...props })
);
TableRow.displayName = "TableRow";
var TableHead = forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "th",
    {
      ref,
      className: cn(eyebrowClass, "px-3 py-2 text-left", className),
      ...props
    }
  )
);
TableHead.displayName = "TableHead";
var TableCell = forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("td", { ref, className: cn("px-3 py-2", className), ...props })
);
TableCell.displayName = "TableCell";
function TableEmptyRow({
  colSpan,
  children
}) {
  return /* @__PURE__ */ jsx(TableRow, { className: "border-0", children: /* @__PURE__ */ jsx(TableCell, { colSpan, className: "py-8 text-center text-text-muted", children }) });
}
async function parseCsv(text) {
  const mod = await import('papaparse');
  const Papa = mod.default ?? mod;
  const rows = [];
  Papa.parse(text, {
    delimiter: "",
    delimitersToGuess: [",", ";", "	", "|"],
    skipEmptyLines: "greedy",
    step: (result, parser) => {
      if (result.data.every((cell) => cell.trim() === "")) return;
      rows.push(result.data);
      if (rows.length > CSV_ROW_CAP + 1) parser.abort();
    }
  });
  return shapeCsvRows(rows);
}
function CsvView({ table }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    table.truncated && /* @__PURE__ */ jsx("div", { className: "mx-4 mt-4", children: /* @__PURE__ */ jsx(Alert, { variant: "info", children: "Showing the first 1,000 rows. Download the file to see all of it." }) }),
    /* @__PURE__ */ jsx("div", { className: "m-4 overflow-x-auto rounded-lg border border-border bg-surface", children: /* @__PURE__ */ jsxs(Table, { className: "w-auto min-w-full", children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsx(TableRow, { children: table.header.map((cell, i) => (
        // Headers are the file's words, not UI labels: no eyebrow upper-casing.
        /* @__PURE__ */ jsx(TableHead, { className: "whitespace-nowrap normal-case tracking-normal", children: cell }, i)
      )) }) }),
      /* @__PURE__ */ jsx(TableBody, { children: table.rows.length === 0 ? /* @__PURE__ */ jsx(TableEmptyRow, { colSpan: Math.max(table.header.length, 1), children: "This file has a header row but no data rows." }) : table.rows.map((row, r) => /* @__PURE__ */ jsx(TableRow, { children: row.map((cell, c) => /* @__PURE__ */ jsx(TableCell, { className: "max-w-xs whitespace-pre-wrap break-words align-top", children: cell }, c)) }, r)) })
    ] }) })
  ] });
}
function DocxView({
  file,
  onFetchFailed,
  onRenderFailed
}) {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const library = import('docx-preview');
      library.catch(() => {
      });
      const blob = await file;
      if (cancelled) return;
      if (blob === null) {
        onFetchFailed();
        return;
      }
      try {
        const { renderAsync } = await library;
        if (cancelled || !hostRef.current) return;
        const { body, style } = shadowContainers(hostRef.current);
        await renderAsync(blob, body, style, {
          inWrapper: true,
          breakPages: true,
          // Pages may grow past their nominal height, so A4 read on Letter isn't clipped.
          ignoreHeight: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          // Images as data URLs, so nothing outlives the dialog as a blob URL.
          useBase64URL: true,
          // An altChunk is document-supplied HTML that the library puts in a
          // same-origin iframe, which would run its script in the app's origin
          // the moment the viewer opens.
          renderAltChunks: false,
          // Embedded fonts become @font-face rules, which browsers ignore inside
          // a shadow root; the document's fonts fall back to the named families.
          ignoreFonts: true
        });
        if (cancelled) return;
        replaceSymbolFontBullets(style);
        neutraliseLinks(body);
        setReady(true);
      } catch {
        if (!cancelled) onRenderFailed();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    !ready && /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx(Spinner, { size: "lg", label: "Laying out document\u2026" }) }),
    /* @__PURE__ */ jsx("div", { style: { contain: "paint", position: "relative" }, hidden: !ready, children: /* @__PURE__ */ jsx("div", { ref: hostRef, className: "file-viewer-docx" }) })
  ] });
}
var PAGE_CSS = `
.docx-wrapper {
  background: transparent;
  padding: 1.5rem 1rem 0.5rem;
  gap: 1rem;
}
.docx-wrapper > section.docx {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  /* Narrow screens: a Letter or A4 page shrinks instead of scrolling sideways. */
  max-width: 100%;
}
`;
function shadowContainers(host) {
  const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const page = document.createElement("style");
  page.textContent = PAGE_CSS;
  const style = document.createElement("div");
  const body = document.createElement("div");
  root.replaceChildren(style, page, body);
  return { body, style };
}
function neutraliseLinks(container) {
  for (const anchor of container.querySelectorAll("a")) {
    const link = documentLinkHref(anchor.getAttribute("href"));
    if (!link) {
      anchor.removeAttribute("href");
      continue;
    }
    anchor.setAttribute("href", link.href);
    if (link.external) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  }
}
function replaceSymbolFontBullets(styleContainer) {
  for (const styleTag of styleContainer.querySelectorAll("style")) {
    let rules;
    try {
      if (!styleTag.sheet) continue;
      rules = styleTag.sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      const content = rule.style.content;
      if (!content) continue;
      const patched = replaceSymbolGlyphs(content);
      if (patched === content) continue;
      rule.style.setProperty("content", patched);
      rule.style.setProperty("font-family", "inherit");
    }
  }
}

// src/components/ui/file-viewer-html.ts
var HTML_NS = "http://www.w3.org/1999/xhtml";
var ALLOWED = /* @__PURE__ */ new Set([
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
  "hr"
]);
var DROP_CONTENT2 = /* @__PURE__ */ new Set([
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
  "base"
]);
var DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp|bmp|avif);base64,[a-z0-9+/=]+$/i;
function imageSrc(raw) {
  if (DATA_IMAGE.test(raw.trim())) return raw.trim();
  const src = safeHref(raw);
  return src !== null && /^https:/i.test(src) ? src : null;
}
function span(raw) {
  if (raw === null || !/^\d{1,4}$/.test(raw.trim())) return null;
  const n = Number(raw.trim());
  return n >= 1 && n <= 1e3 ? String(n) : null;
}
function rebuild(source, tag, doc) {
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
function appendClean(source, target, doc) {
  for (const node of Array.from(source.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(doc.createTextNode(node.nodeValue ?? ""));
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const element = node;
    if (element.namespaceURI !== HTML_NS) continue;
    const tag = element.localName;
    if (DROP_CONTENT2.has(tag)) continue;
    if (!ALLOWED.has(tag)) {
      appendClean(element, target, doc);
      continue;
    }
    const clean2 = rebuild(element, tag, doc);
    if (clean2 === null) continue;
    appendClean(element, clean2, doc);
    target.appendChild(clean2);
  }
}
function sanitizePreviewHtml(html, doc) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const fragment = doc.createDocumentFragment();
  appendClean(parsed.body, fragment, doc);
  return fragment;
}
var COULD_NOT_OPEN = "We couldn't open this file. Download it to view it locally.";
var NO_PREVIEW = {
  doc: "Word 97\u20132003 files can't be displayed in the browser. Download it to open it locally.",
  "render-failed": "We couldn't display this Word file. Download it to open it locally.",
  unsupported: "This file can't be previewed in the browser."
};
async function request(url, signal) {
  try {
    const res = await fetch(url, { signal, credentials: "same-origin" });
    if (res.ok) return res;
    discard(res);
    return null;
  } catch {
    return null;
  }
}
function discard(res) {
  res?.body?.cancel().catch(() => {
  });
}
async function textOf(res) {
  if (!res) return null;
  try {
    return decodeText(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}
function fallbackState(result, reason) {
  if (result && "html" in result && typeof result.html === "string" && result.html.trim()) {
    return { step: "html", html: result.html };
  }
  if (result && "text" in result && typeof result.text === "string" && result.text.trim()) {
    const note = typeof result.note === "string" && result.note.trim() ? result.note : void 0;
    return { step: "text", ...capText(normalizeNewlines(result.text)), note };
  }
  return { step: "no-preview", reason };
}
function FileViewerBody({ url, filename, contentType, loadFallback }) {
  const [state, setState] = useState({ step: "loading" });
  const fallbackRef = useRef(loadFallback);
  fallbackRef.current = loadFallback;
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const show = (next) => {
      if (!signal.aborted) setState(next);
    };
    async function fallback(reason, type) {
      const load = fallbackRef.current;
      if (!load) return show({ step: "no-preview", reason });
      show({ step: "loading" });
      let result;
      try {
        result = await load({ reason, url, filename, contentType: type, signal });
      } catch {
        result = null;
      }
      show(fallbackState(result, reason));
    }
    async function open() {
      let probe = null;
      let type;
      if (contentType != null) {
        type = normalizeContentType(contentType);
      } else {
        probe = await request(url, signal);
        if (!probe) return show({ step: "error" });
        type = normalizeContentType(probe.headers.get("content-type"));
      }
      const file = () => probe ? Promise.resolve(probe) : request(url, signal);
      switch (fileViewerKind(type, filename)) {
        case "pdf": {
          const res = await file();
          discard(res);
          return show(res ? { step: "pdf" } : { step: "error" });
        }
        case "image":
          discard(probe);
          return show({ step: "image" });
        case "docx":
          return show({
            step: "docx",
            file: file().then((res) => res ? res.blob().catch(() => null) : null),
            onRenderFailed: () => void fallback("render-failed", type)
          });
        case "csv": {
          const text = await textOf(await file());
          if (text === null) return show({ step: "error" });
          if (text.trim() === "") return show({ step: "empty" });
          try {
            return show({ step: "csv", table: await parseCsv(text) });
          } catch {
            return show({ step: "error" });
          }
        }
        case "text": {
          const text = await textOf(await file());
          if (text === null) return show({ step: "error" });
          if (text.trim() === "") return show({ step: "empty" });
          return show({ step: "text", ...capText(normalizeNewlines(text)) });
        }
        case "doc":
          discard(probe);
          return fallback("doc", type);
        case "unsupported":
          discard(probe);
          return fallback("unsupported", type);
      }
    }
    void open();
    return () => controller.abort();
  }, [url, filename, contentType]);
  switch (state.step) {
    case "loading":
      return /* @__PURE__ */ jsx(ViewerLoading, {});
    case "error":
      return /* @__PURE__ */ jsx(ViewerMessage, { text: COULD_NOT_OPEN });
    case "empty":
      return /* @__PURE__ */ jsx(ViewerMessage, { text: "This file is empty." });
    case "no-preview":
      return /* @__PURE__ */ jsx(
        ViewerMessage,
        {
          text: NO_PREVIEW[state.reason],
          action: /* @__PURE__ */ jsx(Button, { asChild: true, className: "max-w-full", children: /* @__PURE__ */ jsxs("a", { href: url, download: filename, children: [
            "Download ",
            filename
          ] }) })
        }
      );
    case "pdf":
      return /* @__PURE__ */ jsx("iframe", { src: url, title: filename, className: "h-full w-full border-0 bg-surface" });
    case "image":
      return /* @__PURE__ */ jsx(ImageView, { url, filename, onFailed: () => setState({ step: "error" }) });
    case "docx":
      return /* @__PURE__ */ jsx(
        DocxView,
        {
          file: state.file,
          onFetchFailed: () => setState({ step: "error" }),
          onRenderFailed: state.onRenderFailed
        }
      );
    case "csv":
      return /* @__PURE__ */ jsx(CsvView, { table: state.table });
    case "text":
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Notes, { note: state.note, truncated: state.truncated }),
        /* @__PURE__ */ jsx(TextPage, { children: /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-text-primary", children: state.text }) })
      ] });
    case "html":
      return /* @__PURE__ */ jsx(TextPage, { children: /* @__PURE__ */ jsx(SanitizedHtml, { html: state.html }) });
  }
}
function ViewerLoading() {
  return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx(Spinner, { size: "lg", label: "Opening file\u2026" }) });
}
function ViewerMessage({ text, action }) {
  return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center px-6", children: /* @__PURE__ */ jsx(
    EmptyState,
    {
      icon: /* @__PURE__ */ jsx(File, { className: "h-8 w-8", strokeWidth: 1.5, "aria-hidden": "true" }),
      title: text,
      action
    }
  ) });
}
function TextPage({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "mx-auto my-4 max-w-3xl rounded-lg bg-surface p-4 text-text-primary shadow-sm sm:p-8", children });
}
function Notes({ note, truncated }) {
  if (!note && !truncated) return null;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-4 max-w-3xl space-y-2 px-4 sm:px-0", children: [
    note && /* @__PURE__ */ jsx(Alert, { variant: "info", children: note }),
    truncated && /* @__PURE__ */ jsx(Alert, { variant: "info", children: "Showing the first 200k characters. Download the file to read all of it." })
  ] });
}
function SanitizedHtml({ html }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    ref.current?.replaceChildren(sanitizePreviewHtml(html, document));
  }, [html]);
  return /* @__PURE__ */ jsx("div", { ref, className: "file-viewer-html" });
}
function ImageView({
  url,
  filename,
  onFailed
}) {
  const [loaded, setLoaded] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    !loaded && /* @__PURE__ */ jsx(ViewerLoading, {}),
    /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-start justify-center p-4", hidden: !loaded, children: /* @__PURE__ */ jsx(
      "img",
      {
        src: url,
        alt: filename,
        className: "max-w-full rounded-lg bg-surface shadow-sm",
        onLoad: () => setLoaded(true),
        onError: onFailed
      }
    ) })
  ] });
}
function stopClick(event) {
  event.stopPropagation();
}
function FileViewer({
  url,
  filename,
  contentType,
  loadFallback,
  children,
  open,
  onOpenChange
}) {
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs("span", { className: "contents", onClick: stopClick, children: [
    children && /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children }),
    /* @__PURE__ */ jsxs(
      DialogContent,
      {
        "aria-describedby": void 0,
        className: "h-[92dvh] max-h-[92dvh] w-[calc(100%-2rem)] max-w-5xl overflow-hidden p-0",
        children: [
          /* @__PURE__ */ jsxs(DialogHeader, { className: "mb-0 flex items-center gap-3 space-y-0 border-b border-border px-4 py-3 pr-12", children: [
            /* @__PURE__ */ jsx(File, { className: "h-4 w-4 shrink-0 text-text-faint", "aria-hidden": "true" }),
            /* @__PURE__ */ jsx(DialogTitle, { title: filename, className: "min-w-0 flex-1 truncate text-sm font-semibold", children: filename }),
            /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", className: "shrink-0", children: /* @__PURE__ */ jsx("a", { href: url, download: filename, children: "Download" }) }),
            /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "outline", className: "shrink-0", children: /* @__PURE__ */ jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: [
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Open in new tab" }),
              /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Open" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx(DialogBody, { className: "bg-surface-overlay", children: /* @__PURE__ */ jsx(
            FileViewerBody,
            {
              url,
              filename,
              contentType,
              loadFallback
            },
            url
          ) })
        ]
      }
    )
  ] }) });
}
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuContent = forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(floatingSurfaceClass, floatingMotionClass, "min-w-[8rem] overflow-hidden p-1", className),
    ...props
  }
) }));
DropdownMenuContent.displayName = "DropdownMenuContent";
var DropdownMenuItem = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(optionRowClass, optionRowFocusClass, className),
    ...props
  }
));
DropdownMenuItem.displayName = "DropdownMenuItem";
var DropdownMenuSeparator = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-border", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
var DropdownMenuLabel = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-xs font-medium text-text-muted", className),
    ...props
  }
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";
var Sheet = DialogPrimitive2.Root;
var SheetTrigger = DialogPrimitive2.Trigger;
var SheetClose = DialogPrimitive2.Close;
var SheetPortal = DialogPrimitive2.Portal;
var SheetOverlay = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive2.Overlay,
  {
    ref,
    className: cn(overlayClass, className),
    ...props
  }
));
SheetOverlay.displayName = "SheetOverlay";
var SheetContent = forwardRef(
  ({ className, children, side = "right", ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive2.Content,
      {
        ref,
        className: cn(
          "fixed z-50 flex h-full flex-col border-border bg-surface-raised shadow-lg transition duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right" && "inset-y-0 right-0 w-full max-w-lg border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" && "inset-y-0 left-0 w-full max-w-lg border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsx(CloseButton, {})
        ]
      }
    )
  ] })
);
SheetContent.displayName = "SheetContent";
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("border-b border-border px-6 py-4", className), ...props });
}
var SheetTitle = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive2.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-text-primary", className),
    ...props
  }
));
SheetTitle.displayName = "SheetTitle";
function SheetBody({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex-1 overflow-y-auto px-6 py-4", className), ...props });
}
function SheetFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex justify-end gap-2 border-t border-border px-6 py-4", className), ...props });
}
var Separator2 = forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    ),
    ...props
  }
));
Separator2.displayName = "Separator";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-surface-overlay", className),
      ...props
    }
  );
}
var toneClasses = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info"
};
var Progress = forwardRef(
  ({ className, value, max = 100, tone = "accent", ...props }, ref) => {
    const safeMax = max > 0 ? max : 100;
    const clamped = value == null ? value : Math.min(Math.max(value, 0), safeMax);
    return /* @__PURE__ */ jsx(
      ProgressPrimitive.Root,
      {
        ref,
        value: clamped,
        max: safeMax,
        className: cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-overlay", className),
        ...props,
        children: /* @__PURE__ */ jsx(
          ProgressPrimitive.Indicator,
          {
            className: cn("h-full transition-all", toneClasses[tone]),
            style: { width: `${(clamped ?? 0) / safeMax * 100}%` }
          }
        )
      }
    );
  }
);
Progress.displayName = "Progress";
var Tabs = TabsPrimitive.Root;
var TabsList = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex items-center gap-1 border-b border-border",
      className
    ),
    ...props
  }
));
TabsList.displayName = "TabsList";
var TabsTrigger = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center px-3 pb-2 pt-1 text-sm font-medium text-text-muted transition-colors hover:text-text-secondary data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent-text data-[state=active]:-mb-px",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn("mt-4 focus-visible:outline-none", className),
    ...props
  }
));
TabsContent.displayName = "TabsContent";
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-surface-overlay px-2.5 py-1 text-xs text-text-secondary shadow-md animate-in fade-in-0 zoom-in-95",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = "TooltipContent";
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverAnchor = PopoverPrimitive.Anchor;
var PopoverContent = forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(floatingSurfaceClass, floatingMotionClass, "w-72 p-4 outline-none", className),
    ...props
  }
) }));
PopoverContent.displayName = "PopoverContent";
var PinContext = createContext(null);
function usePinControls(component2) {
  const controls = useContext(PinContext);
  if (!controls) throw new Error(`<${component2}> must be used inside <HoverCard>`);
  return controls;
}
function HoverCard({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  openDelay = 150,
  closeDelay = 120,
  ...props
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef(null);
  const contentId = useId();
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next) => {
    if (controlledOpen === void 0) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const controls = {
    open,
    contentId,
    triggerRef,
    togglePin: () => {
      setPinned(!pinned);
      setOpen(!pinned);
    },
    dismiss: () => {
      setPinned(false);
      setOpen(false);
    }
  };
  return /* @__PURE__ */ jsx(PinContext.Provider, { value: controls, children: /* @__PURE__ */ jsx(
    HoverCardPrimitive.Root,
    {
      ...props,
      openDelay,
      closeDelay,
      open,
      onOpenChange: (next) => {
        if (!next && pinned) return;
        setOpen(next);
      }
    }
  ) });
}
var HoverCardTrigger = forwardRef(({ onClick, ...props }, ref) => {
  const { open, contentId, triggerRef, togglePin } = usePinControls("HoverCardTrigger");
  return /* @__PURE__ */ jsx(
    HoverCardPrimitive.Trigger,
    {
      "aria-expanded": open,
      "aria-controls": open ? contentId : void 0,
      ...props,
      ref: (el) => {
        triggerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      onClick: (e) => {
        onClick?.(e);
        if (!e.defaultPrevented) togglePin();
      }
    }
  );
});
HoverCardTrigger.displayName = "HoverCardTrigger";
var HoverCardContent = forwardRef(({ className, align = "center", sideOffset = 4, onEscapeKeyDown, onPointerDownOutside, ...props }, ref) => {
  const { contentId, triggerRef, dismiss } = usePinControls("HoverCardContent");
  return /* @__PURE__ */ jsx(HoverCardPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    HoverCardPrimitive.Content,
    {
      ref,
      id: contentId,
      align,
      sideOffset,
      onEscapeKeyDown: (e) => {
        onEscapeKeyDown?.(e);
        if (!e.defaultPrevented) dismiss();
      },
      onPointerDownOutside: (e) => {
        onPointerDownOutside?.(e);
        if (e.defaultPrevented || triggerRef.current?.contains(e.target)) return;
        dismiss();
      },
      className: cn(floatingSurfaceClass, floatingMotionClass, "w-72 p-4 outline-none", className),
      ...props
    }
  ) });
});
HoverCardContent.displayName = "HoverCardContent";
var ScrollArea = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(ScrollAreaPrimitive.Root, { ref, className: cn("relative overflow-hidden", className), ...props, children: [
  /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
  /* @__PURE__ */ jsx(
    ScrollAreaPrimitive.ScrollAreaScrollbar,
    {
      orientation: "vertical",
      className: "flex h-full w-2 touch-none select-none border-l border-l-transparent p-px transition-colors",
      children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
    }
  ),
  /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
] }));
ScrollArea.displayName = "ScrollArea";
var ToastContext = createContext({ toast: () => {
} });
function useToast() {
  return useContext(ToastContext);
}
var listeners2 = /* @__PURE__ */ new Set();
function emit(t) {
  listeners2.forEach((listener) => listener(t));
}
var toast = Object.assign((t) => emit(t), {
  success: (title, options) => emit({ title, ...options, variant: "success" }),
  error: (title, options) => emit({ title, ...options, variant: "error" }),
  info: (title, options) => emit({ title, ...options, variant: "info" }),
  warning: (title, options) => emit({ title, ...options, variant: "warning" })
});
function toastClass(variant = "default") {
  return variant === "default" ? "flex items-start gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm text-text-primary" : alertVariants({ variant });
}
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((t) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4e3);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  useEffect(() => {
    listeners2.add(addToast);
    return () => {
      listeners2.delete(addToast);
    };
  }, [addToast]);
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { toast: addToast }, children: [
    children,
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2",
        role: "region",
        "aria-label": "Notifications",
        "aria-live": "polite",
        children: toasts.map((t) => /* @__PURE__ */ jsxs(
          "div",
          {
            role: t.variant === "error" ? "alert" : "status",
            className: cn(toastClass(t.variant), "w-80 shadow-lg animate-in slide-in-from-right"),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: t.title }),
                t.description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs", children: t.description })
              ] }),
              /* @__PURE__ */ jsx(DismissButton, { label: "Dismiss", onClick: () => removeToast(t.id), className: "-mr-1 -mt-0.5" })
            ]
          },
          t.id
        ))
      }
    )
  ] });
}
function ProductMark({
  name,
  initial,
  compact = false,
  className
}) {
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-2", className), children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        "aria-hidden": "true",
        className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground",
        children: (initial ?? name.charAt(0)).toUpperCase()
      }
    ),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: compact ? "sr-only" : "font-[family-name:var(--font-display)] text-lg tracking-tight text-text-primary",
        children: name
      }
    )
  ] });
}
function PageHeader({ title, description, actions, back, className }) {
  const BackLink = back?.as ?? "a";
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-6 flex items-start justify-between", className), children: [
    /* @__PURE__ */ jsxs("div", { children: [
      back && /* @__PURE__ */ jsx(
        TextLink,
        {
          asChild: true,
          className: "mb-2 flex w-fit items-center text-sm font-normal text-text-muted hover:text-text-primary",
          children: /* @__PURE__ */ jsxs(BackLink, { href: back.href, children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 14, "aria-hidden": "true" }),
            back.label
          ] })
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "font-[family-name:var(--font-display)] text-2xl text-text-primary", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-text-muted", children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: actions })
  ] });
}
var alignClasses = {
  left: { cell: "text-left", header: "text-left", content: "justify-start" },
  right: { cell: "text-right", header: "text-right", content: "justify-end" },
  center: { cell: "text-center", header: "text-center", content: "justify-center" }
};
var UNSET = /* @__PURE__ */ Symbol("DataTable.resetPageOn.unset");
function DataTable({
  columns,
  data,
  onRowClick,
  pageSize = 25,
  paginate = true,
  getRowId,
  enableSelection = false,
  emptyMessage = "No results.",
  resetPageOn = UNSET,
  rowClassName,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  renderExpanded,
  getRowCanExpand,
  expandOnRowClick = false
}) {
  const [expanded, setExpanded] = useState({});
  const expandable = renderExpanded !== void 0;
  const detailId = useId();
  const colCount = columns.length + (expandable ? 1 : 0);
  const [internalSorting, setInternalSorting] = useState([]);
  const sorting = controlledSorting ?? internalSorting;
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const driven = resetPageOn !== UNSET;
  function handleSortingChange(updater) {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (controlledSorting === void 0) setInternalSorting(next);
    onSortingChange?.(next);
  }
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginate ? getPaginationRowModel() : void 0,
    getRowId: getRowId ? (row) => getRowId(row) : void 0,
    manualSorting,
    onSortingChange: handleSortingChange,
    getRowCanExpand: expandable ? (row) => getRowCanExpand ? getRowCanExpand(row.original) : true : () => false,
    onExpandedChange: setExpanded,
    // Hold rows open across a refetch; `getRowId` keeps them the same rows.
    autoResetExpanded: false,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    // Hand the reset over to the effect below only when the caller opted in, so the
    // default stays exactly TanStack's.
    autoResetPageIndex: !driven,
    state: { sorting, columnFilters, rowSelection, expanded },
    initialState: { pagination: { pageSize } }
  });
  const hasFooter = table.getAllLeafColumns().some((column) => column.columnDef.footer !== void 0);
  const seen = useRef(resetPageOn);
  useEffect(() => {
    if (!driven || Object.is(seen.current, resetPageOn)) return;
    seen.current = resetPageOn;
    table.setPageIndex(0);
  }, [driven, resetPageOn, table]);
  const pageIndex = table.getState().pagination.pageIndex;
  const lastPage = Math.max(0, table.getPageCount() - 1);
  useEffect(() => {
    if (paginate && pageIndex > lastPage) table.setPageIndex(lastPage);
  }, [paginate, pageIndex, lastPage, table]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsxs(TableRow, { children: [
        expandable && /* @__PURE__ */ jsx(TableHead, { className: "w-10 px-1 py-2", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Details" }) }),
        headerGroup.headers.map((header) => {
          const meta = header.column.columnDef.meta;
          const align = alignClasses[meta?.align ?? "left"];
          const sorted = header.column.getIsSorted();
          const canSort = header.column.getCanSort();
          const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
          const sortIcon = /* @__PURE__ */ jsx(
            SortIcon,
            {
              size: 12,
              "aria-hidden": "true",
              className: sorted ? "text-text-secondary" : "text-text-faint"
            }
          );
          const label = header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext());
          return /* @__PURE__ */ jsx(
            TableHead,
            {
              "aria-sort": sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : void 0,
              className: cn(align.header, meta?.headerClassName),
              children: /* @__PURE__ */ jsx("div", { className: cn("flex items-center gap-1", align.content), children: !canSort ? label : typeof label === "string" || typeof label === "number" ? (
                // A real button, so the sort is reachable with Tab and
                // Enter, not only a click on the cell. The heading's
                // own look: the button only adds the hover and ring.
                // It wraps like the heading it replaces: a long title
                // takes a second line rather than an ellipsis.
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    onClick: header.column.getToggleSortingHandler(),
                    className: cn(
                      "-mx-1.5 h-auto min-h-6 gap-1 whitespace-normal px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-current",
                      align.header
                    ),
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "min-w-0", children: label }),
                      sortIcon
                    ]
                  }
                )
              ) : (
                // A header the caller rendered may hold its own
                // control, and a button cannot hold another: the
                // header stays as given and the sort is a button
                // beside it.
                /* @__PURE__ */ jsxs(Fragment, { children: [
                  label,
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon",
                      "aria-label": `Sort by ${header.column.id}`,
                      onClick: header.column.getToggleSortingHandler(),
                      className: "h-6 w-6 text-current",
                      children: sortIcon
                    }
                  )
                ] })
              ) })
            },
            header.id
          );
        })
      ] }, headerGroup.id)) }),
      /* @__PURE__ */ jsx(TableBody, { children: table.getRowModel().rows.length ? table.getRowModel().rows.map((row, index) => {
        const canExpand = row.getCanExpand();
        const isExpanded = canExpand && row.getIsExpanded();
        const rowDetailId = `${detailId}-${row.id}`;
        return /* @__PURE__ */ jsxs(Fragment$1, { children: [
          /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: cn(
                "transition-colors last:border-0",
                // Zebra, keyed to the row's index within the CURRENT page, so the
                // banding starts the same way on every page instead of depending on
                // whether the pages before it held an odd number of rows.
                //
                // A plain `bg-*` and not the `even:` variant on purpose: a plain
                // class is one specificity step below `hover:bg-*`, so the hover
                // wins whatever order Tailwind emits the two in. `even:` and
                // `hover:` are both class-plus-pseudo-class and TIE, which would
                // leave "does hovering a striped row look any different" decided by
                // the generated stylesheet's ordering.
                index % 2 === 1 && "bg-table-stripe",
                onRowClick && "cursor-pointer",
                // Hover on EVERY row, clickable or not. It answers "which row am I
                // reading" across a table too wide to track by eye, which is a
                // reading aid rather than a click affordance — `cursor-pointer`
                // above is the separate question of whether the row does anything
                // when you click it.
                //
                // Held back while the row is selected: the hover token is a wash
                // OVER whatever the row sits on rather than a shade of it, so on a
                // selected row it would cover the selection instead of deepening
                // it, and the pointer would appear to clear the one row state that
                // has to stay readable under it.
                !row.getIsSelected() && tableRowHoverClass,
                // Last, so twMerge drops the stripe from a selected row: a row gets
                // one background, and selection is the one that means something.
                row.getIsSelected() && "bg-accent-muted",
                // The caller's, last of all, so a row tint or `opacity-60` wins.
                rowClassName?.(row.original)
              ),
              onClick: () => {
                if (expandOnRowClick && canExpand) row.toggleExpanded();
                onRowClick?.(row.original);
              },
              children: [
                expandable && /* @__PURE__ */ jsx(TableCell, { className: "w-10 px-1 py-1", children: canExpand && /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "icon",
                    "aria-label": "Show details",
                    "aria-expanded": isExpanded,
                    "aria-controls": isExpanded ? rowDetailId : void 0,
                    onClick: (e) => {
                      e.stopPropagation();
                      row.toggleExpanded();
                    },
                    children: /* @__PURE__ */ jsx(
                      ChevronRight,
                      {
                        size: 14,
                        "aria-hidden": "true",
                        className: cn("transition-transform", isExpanded && "rotate-90")
                      }
                    )
                  }
                ) }),
                row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(
                  TableCell,
                  {
                    className: cn(
                      "text-text-secondary",
                      cell.column.columnDef.meta?.align && alignClasses[cell.column.columnDef.meta.align].cell,
                      cell.column.columnDef.meta?.className
                    ),
                    children: flexRender(cell.column.columnDef.cell, cell.getContext())
                  },
                  cell.id
                ))
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ jsx(
            TableRow,
            {
              id: rowDetailId,
              className: "bg-surface-raised last:border-0",
              children: /* @__PURE__ */ jsx(TableCell, { colSpan: colCount, className: "px-4 py-3 text-text-secondary", children: renderExpanded?.(row.original) })
            }
          )
        ] }, row.id);
      }) : /* @__PURE__ */ jsx(TableEmptyRow, { colSpan: colCount, children: emptyMessage }) }),
      hasFooter && /* @__PURE__ */ jsx(TableFooter, { children: table.getFooterGroups().slice(0, 1).map((footerGroup) => /* @__PURE__ */ jsxs(TableRow, { children: [
        expandable && /* @__PURE__ */ jsx(TableCell, { className: "w-10 px-1" }),
        footerGroup.headers.map((header) => {
          const meta = header.column.columnDef.meta;
          return /* @__PURE__ */ jsx(
            TableCell,
            {
              colSpan: header.colSpan,
              className: cn(
                "font-medium text-text-primary",
                meta?.align && alignClasses[meta.align].cell,
                meta?.className
              ),
              children: header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())
            },
            header.id
          );
        })
      ] }, footerGroup.id)) })
    ] }) }),
    paginate && // Renders nothing for a single page.
    /* @__PURE__ */ jsx(
      Pagination,
      {
        className: "px-1 pt-3",
        page: table.getState().pagination.pageIndex + 1,
        totalPages: table.getPageCount(),
        totalItems: table.getFilteredRowModel().rows.length,
        pageSize: table.getState().pagination.pageSize,
        onPageChange: (page) => table.setPageIndex(page - 1)
      }
    )
  ] });
}
function clean(raw) {
  const neg = raw.trim().startsWith("-");
  const digits = raw.replace(/[^0-9.]/g, "");
  const parts = digits.split(".");
  const hasDot = parts.length > 1;
  const intPart = (parts[0] ?? "").replace(/^0+(?=\d)/, "");
  const joined = hasDot ? `${intPart}.${parts.slice(1).join("")}` : intPart;
  return (neg ? "-" : "") + joined;
}
function formatForDisplay(value) {
  if (!value || value === "-" || value === ".") return value;
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim()) ? formatAmount(value, { symbol: false }) : value;
}
var MoneyInput = forwardRef(
  ({ className, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const handleChange = useCallback(
      (e) => onChange(clean(e.target.value)),
      [onChange]
    );
    const handleFocus = useCallback(
      (e) => {
        setFocused(true);
        e.target.select();
        onFocus?.(e);
      },
      [onFocus]
    );
    const handleBlur = useCallback(
      (e) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted", children: "$" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          ref,
          type: "text",
          inputMode: "decimal",
          className: cn("pl-7 text-right font-[family-name:var(--font-mono)] tabular-nums", className),
          value: focused ? value : formatForDisplay(value),
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...props
        }
      )
    ] });
  }
);
MoneyInput.displayName = "MoneyInput";
function CommandPalette({
  open,
  onOpenChange,
  children,
  value,
  onValueChange,
  shouldFilter = true,
  filter,
  loop = true,
  placeholder = "Search or type a command...",
  emptyMessage = "No results found.",
  label = "Command palette"
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.defaultPrevented) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (open && e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);
  if (!open) return null;
  if (typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: overlayClass,
          onClick: () => onOpenChange(false),
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2", children: /* @__PURE__ */ jsxs(
        Command,
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": label,
          className: "overflow-hidden rounded-lg border border-border bg-surface-raised shadow-2xl",
          loop,
          shouldFilter,
          filter,
          onKeyDown: (e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(false);
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3", children: [
              /* @__PURE__ */ jsx(Search, { size: 16, className: "shrink-0 text-text-muted" }),
              /* @__PURE__ */ jsx(
                Command.Input,
                {
                  value,
                  onValueChange,
                  autoFocus: true,
                  placeholder,
                  className: "flex-1 bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(Command.List, { className: "max-h-80 overflow-y-auto p-2", children: [
              shouldFilter && /* @__PURE__ */ jsx(Command.Empty, { className: "py-6 text-center text-sm text-text-muted", children: emptyMessage }),
              children
            ] })
          ]
        }
      ) })
    ] }),
    document.body
  );
}
function CommandGroup({ heading, children }) {
  return /* @__PURE__ */ jsx(
    Command.Group,
    {
      heading,
      className: "[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted",
      children
    }
  );
}
function CommandItem({
  onSelect,
  icon,
  children,
  value,
  keywords,
  forceMount,
  disabled
}) {
  return /* @__PURE__ */ jsxs(
    Command.Item,
    {
      onSelect,
      value,
      keywords,
      forceMount,
      disabled,
      className: cn(
        optionRowClass,
        "data-[selected=true]:bg-surface-overlay data-[selected=true]:text-text-primary",
        disabled && "pointer-events-none opacity-50"
      ),
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "text-text-muted", children: icon }),
        children
      ]
    }
  );
}
function SearchSelect({
  value,
  onChange,
  onSearch,
  onQueryChange,
  options,
  selectedOption: selectedOptionProp,
  disabled = false,
  loading = false,
  placeholder = "Search...",
  emptyMessage = "No results",
  className,
  id,
  ariaLabel,
  required,
  requiredLabel = "Required",
  triggerClassName,
  contentClassName,
  optionClassName,
  clearable = true,
  renderOption,
  autoFocus = false,
  onCreate,
  createLabel = (input) => `Create "${input}"`
}) {
  const [open, setOpen] = useState(autoFocus);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const expanded = open && !disabled;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(void 0);
  const listboxId = useId();
  const optionId = (i) => `${listboxId}-option-${i}`;
  const requiredHintId = `${listboxId}-required`;
  const selectedOption = options.find((o) => o.value === value) ?? (value != null && selectedOptionProp?.value === value ? selectedOptionProp : void 0);
  const trimmed = query.trim();
  const showCreate = !!onCreate && !loading && trimmed.length > 0 && !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
  const navigable = [
    ...options.flatMap((o, i) => o.disabled ? [] : [i]),
    ...showCreate ? [options.length] : []
  ];
  const firstOption = navigable.find((i) => i < options.length) ?? -1;
  const lastOption = [...navigable].reverse().find((i) => i < options.length) ?? -1;
  const stepFrom = (from, step) => {
    if (navigable.length === 0) return -1;
    const at = navigable.indexOf(from);
    if (at === -1) return step === 1 ? navigable[0] : navigable[navigable.length - 1];
    return navigable[(at + step + navigable.length) % navigable.length];
  };
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const optionsKey = options.map((o) => o.value).join("\0");
  useEffect(() => {
    setActiveIndex(-1);
  }, [optionsKey]);
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(
      `#${CSS.escape(optionId(activeIndex))}`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);
  const openList = useCallback((activeTo) => {
    setOpen(true);
    setActiveIndex(activeTo);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);
  const closeList = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);
  const handleQueryChange = useCallback(
    (q) => {
      setQuery(q);
      onQueryChange?.(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(q), 300);
    },
    [onSearch, onQueryChange]
  );
  const cancelPendingSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);
  const handleSelect = useCallback(
    (val) => {
      cancelPendingSearch();
      onChange(val);
      setQuery("");
      closeList();
    },
    [onChange, closeList, cancelPendingSearch]
  );
  const { creating, create } = useCreateOption(onCreate);
  const handleCreate = useCallback(async () => {
    cancelPendingSearch();
    await create(trimmed, () => {
      setQuery("");
      closeList();
    });
  }, [create, trimmed, cancelPendingSearch, closeList]);
  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      cancelPendingSearch();
      onChange(null);
      setQuery("");
    },
    [onChange, cancelPendingSearch]
  );
  const handleBlur = useCallback((e) => {
    const next = e.relatedTarget;
    if (next) {
      if (!ref.current?.contains(next)) setOpen(false);
      return;
    }
    setTimeout(() => {
      if (ref.current && !ref.current.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 0);
  }, []);
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (!open) {
            openList(firstOption);
            return;
          }
          setActiveIndex((i) => stepFrom(i, 1));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            openList(lastOption);
            return;
          }
          setActiveIndex((i) => stepFrom(i, -1));
          break;
        }
        case "Enter": {
          if (open) {
            e.preventDefault();
            if (activeIndex >= 0 && options[activeIndex] && !options[activeIndex].disabled) {
              handleSelect(options[activeIndex].value);
            } else if (showCreate && activeIndex === options.length) {
              void handleCreate();
            }
          }
          break;
        }
        case "Escape": {
          if (open) {
            e.preventDefault();
            closeList();
          }
          break;
        }
      }
    },
    // stepFrom, firstOption and lastOption derive from options and showCreate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, options, activeIndex, openList, closeList, handleSelect, showCreate, handleCreate]
  );
  return /* @__PURE__ */ jsxs("div", { ref, onBlur: handleBlur, className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        id,
        type: "button",
        "aria-haspopup": "listbox",
        "aria-expanded": expanded,
        "aria-label": ariaLabel,
        "aria-describedby": required ? requiredHintId : void 0,
        "aria-controls": expanded ? listboxId : void 0,
        disabled,
        onKeyDown: handleKeyDown,
        onClick: () => open ? closeList() : openList(-1),
        className: cn(
          fieldChromeClass,
          "flex h-8 items-center justify-between px-3 hover:border-text-faint disabled:hover:border-border",
          triggerClassName
        ),
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "min-w-0 truncate",
                selectedOption ? "text-text-primary" : "text-text-muted"
              ),
              children: selectedOption?.label ?? placeholder
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
            clearable && value && !disabled && /* @__PURE__ */ jsx(
              "span",
              {
                role: "button",
                tabIndex: -1,
                onClick: handleClear,
                className: "rounded p-0.5 text-text-muted hover:text-text-primary",
                children: /* @__PURE__ */ jsx(X, { size: 12 })
              }
            ),
            /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" })
          ] })
        ]
      }
    ),
    required && /* @__PURE__ */ jsx("span", { id: requiredHintId, className: "sr-only", children: requiredLabel }),
    expanded && /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          floatingSurfaceClass,
          "absolute left-0 top-full mt-1 w-full min-w-[240px]",
          contentClassName
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
            /* @__PURE__ */ jsx(Search, { size: 14, className: "text-text-muted" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: inputRef,
                autoFocus,
                type: "text",
                role: "combobox",
                "aria-expanded": open,
                "aria-controls": listboxId,
                "aria-label": ariaLabel,
                "aria-required": required || void 0,
                "aria-autocomplete": "list",
                "aria-activedescendant": activeIndex >= 0 ? optionId(activeIndex) : void 0,
                value: query,
                onChange: (e) => handleQueryChange(e.target.value),
                onKeyDown: handleKeyDown,
                placeholder,
                className: "flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { ref: listRef, role: "listbox", id: listboxId, className: "max-h-60 overflow-y-auto p-1", children: [
            loading ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-text-muted", children: "Searching..." }) : options.length === 0 && !showCreate ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-text-muted", children: emptyMessage }) : options.map((option, i) => /* @__PURE__ */ jsx(
              "button",
              {
                id: optionId(i),
                role: "option",
                "aria-selected": option.value === value,
                "aria-disabled": option.disabled || void 0,
                type: "button",
                tabIndex: -1,
                onClick: () => {
                  if (!option.disabled) handleSelect(option.value);
                },
                onMouseEnter: () => {
                  if (!option.disabled) setActiveIndex(i);
                },
                className: cn(
                  optionRowClass,
                  "text-text-primary hover:bg-surface-overlay",
                  i === activeIndex && optionRowActiveClass,
                  option.value === value && "bg-accent-muted text-accent-text",
                  option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                  optionClassName
                ),
                children: renderOption ? renderOption(option) : /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { children: option.label }),
                  option.sublabel && /* @__PURE__ */ jsx("div", { className: "text-xs text-text-muted", children: option.sublabel })
                ] })
              },
              option.value
            )),
            showCreate && /* @__PURE__ */ jsxs(
              "button",
              {
                id: optionId(options.length),
                role: "option",
                "aria-selected": false,
                "aria-disabled": creating || void 0,
                type: "button",
                tabIndex: -1,
                onClick: () => void handleCreate(),
                onMouseEnter: () => setActiveIndex(options.length),
                className: cn(
                  optionRowClass,
                  "text-accent-text hover:bg-surface-overlay",
                  activeIndex === options.length && "bg-surface-overlay",
                  creating && "cursor-wait opacity-50",
                  optionClassName
                ),
                children: [
                  /* @__PURE__ */ jsx(Plus, { size: 12, "aria-hidden": "true", className: "shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate", children: createLabel(trimmed) })
                ]
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function Money({ value, colorNegative, className, ...props }) {
  const formatted = formatMoney(value);
  const isNegative = formatted.startsWith("(");
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "font-[family-name:var(--font-mono)] tabular-nums",
        colorNegative && isNegative && "text-error",
        className
      ),
      ...props,
      children: formatted
    }
  );
}
function withFieldState(control, { messageId, error, required }, ownRequired = control.props.required) {
  const own = control.props["aria-describedby"];
  const ownAriaRequired = control.props["aria-required"];
  return cloneElement(control, {
    ...messageId ? { "aria-describedby": own ? `${own} ${messageId}` : messageId } : {},
    ...error ? { "aria-invalid": control.props["aria-invalid"] ?? true } : {},
    // A native `required` is already announced, and a control that states its
    // own `aria-required` keeps it.
    ...required && ownAriaRequired === void 0 && !ownRequired ? { "aria-required": true } : {}
  });
}
function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children
}) {
  const generatedId = useId();
  const baseId = htmlFor ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${baseId}-${error ? "error" : "hint"}` : void 0;
  const state = { messageId, error: Boolean(error), required: Boolean(required) };
  let control = children;
  if ((messageId || required) && isValidElement(children)) {
    if (children.type === Select) {
      const selectRequired = children.props.required;
      control = cloneElement(
        children,
        void 0,
        Children.map(
          children.props.children,
          (child) => isValidElement(child) && child.type === SelectTrigger ? withFieldState(child, state, selectRequired) : child
        )
      );
    } else {
      control = withFieldState(children, state);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-1", className), children: [
    /* @__PURE__ */ jsx(Label, { htmlFor, required, children: label }),
    control,
    error ? /* @__PURE__ */ jsx("p", { id: messageId, role: "alert", className: "break-words text-xs text-error-text", children: error }) : hint ? /* @__PURE__ */ jsx("p", { id: messageId, className: "break-words text-xs text-text-muted", children: hint }) : null
  ] });
}
function DefinitionList({ columns = 2, className, children }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "grid gap-4 text-sm",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        className
      ),
      children
    }
  );
}
function DefinitionItem({ label, children, className }) {
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx("p", { className: "text-text-muted", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-text-primary", children })
  ] });
}
function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchLabel,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-4 flex items-center gap-3", className), children: [
    onSearchChange && /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1", children: [
      /* @__PURE__ */ jsx(
        Search,
        {
          size: 14,
          className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        }
      ),
      /* @__PURE__ */ jsx(
        Input,
        {
          value: search ?? "",
          onChange: (e) => onSearchChange(e.target.value),
          placeholder: searchPlaceholder,
          "aria-label": searchLabel ?? searchPlaceholder,
          className: "pl-9"
        }
      )
    ] }),
    children
  ] });
}
function StatCard({
  label,
  value,
  sub,
  trend,
  loading,
  action,
  children,
  valueClassName,
  className
}) {
  return /* @__PURE__ */ jsxs(Card, { padding: "none", className: cn("p-4", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: eyebrowClass, children: label }),
      action && /* @__PURE__ */ jsx("div", { className: "-my-1 shrink-0", children: action })
    ] }),
    loading ? /* @__PURE__ */ jsx(Skeleton, { className: "mt-2 h-7 w-24" }) : /* @__PURE__ */ jsx(
      "p",
      {
        className: cn(
          "mt-1 font-[family-name:var(--font-mono)] text-2xl font-semibold tracking-tight text-text-primary",
          valueClassName
        ),
        children: value
      }
    ),
    sub && /* @__PURE__ */ jsx(
      "p",
      {
        className: cn(
          "mt-1 text-xs",
          trend === "up" && "text-success",
          trend === "down" && "text-error",
          (!trend || trend === "neutral") && "text-text-muted"
        ),
        children: sub
      }
    ),
    children && /* @__PURE__ */ jsx("div", { className: "mt-3", children })
  ] });
}
var CHART_SERIES_LIMIT = 8;
function seriesColor(index) {
  const slot = Math.min(Math.max(index, 0), CHART_SERIES_LIMIT - 1) + 1;
  return `var(--color-chart-${slot})`;
}
var CHART_NEUTRAL_COLOR = "var(--color-text-faint)";
function resolveSeriesColors(series) {
  return series.map((s, i) => s.color ?? seriesColor(i));
}
function capSeries(series, context) {
  if (series.length <= CHART_SERIES_LIMIT) return series;
  console.warn(
    `[CarbonOS ${context}] ${series.length} series given but the categorical palette has ${CHART_SERIES_LIMIT} slots. Showing the first ${CHART_SERIES_LIMIT} and dropping the rest \u2014 fold the tail into an "Other" series, or split the chart.`
  );
  return series.slice(0, CHART_SERIES_LIMIT);
}
var formatChartValue = (value) => new Intl.NumberFormat(void 0, { maximumFractionDigits: 2 }).format(value);
function ChartCard({
  title,
  subtitle,
  action,
  footer,
  className,
  children
}) {
  return /* @__PURE__ */ jsxs(Card, { padding: "none", className: cn("p-4", className), children: [
    (title || subtitle || action) && /* @__PURE__ */ jsx(CardHeader, { as: "h3", size: "sm", title, description: subtitle, actions: action }),
    children,
    footer && /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-text-secondary", children: footer })
  ] });
}
function ChartLegend({ items, onItemClick, className }) {
  const withValues = items.some((item) => item.value != null);
  return /* @__PURE__ */ jsx(
    "ul",
    {
      className: cn(
        withValues ? "space-y-1.5" : "flex flex-wrap items-center gap-x-4 gap-y-1.5",
        className
      ),
      children: items.map((item, i) => {
        const content = /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Swatch, { color: item.color, dimmed: item.inactive }),
          /* @__PURE__ */ jsx("span", { className: cn("min-w-0 truncate", item.inactive ? "text-text-faint" : "text-text-secondary"), children: item.label })
        ] });
        const value = item.value != null ? /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0 font-[family-name:var(--font-mono)] text-text-primary", children: item.value }) : null;
        return /* @__PURE__ */ jsxs("li", { className: cn("min-w-0 text-xs", withValues && "flex items-center gap-2"), children: [
          onItemClick ? /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              onClick: () => onItemClick(i),
              "aria-pressed": !item.inactive,
              className: "-mx-1.5 -my-1 h-auto gap-1.5 rounded-sm px-1.5 py-1 text-xs font-normal",
              children: content
            }
          ) : /* @__PURE__ */ jsx("span", { className: "flex min-w-0 items-center gap-1.5", children: content }),
          value
        ] }, `${item.label}-${i}`);
      })
    }
  );
}
function ChartTooltipShell({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border bg-surface-overlay px-3 py-2 shadow-lg", children });
}
function inShell(body) {
  return body == null || body === false ? null : /* @__PURE__ */ jsx(ChartTooltipShell, { children: body });
}
function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter = formatChartValue,
  labelFormatter,
  render
}) {
  if (!active || !payload?.length) return null;
  if (render) {
    const ctx = {
      label: label ?? "",
      payload: payload.map((item) => ({
        key: String(item.dataKey ?? item.name ?? ""),
        label: String(item.name ?? item.dataKey ?? ""),
        value: Number(item.value),
        color: item.color ?? "",
        datum: item.payload ?? {}
      }))
    };
    return inShell(render(ctx));
  }
  return /* @__PURE__ */ jsxs(ChartTooltipShell, { children: [
    label != null && label !== "" && /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-xs font-medium text-text-primary", children: labelFormatter ? labelFormatter(label) : label }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: payload.map((item, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsx(Swatch, { color: item.color ?? "" }),
      /* @__PURE__ */ jsx("span", { className: "mr-2 text-text-secondary", children: item.name }),
      /* @__PURE__ */ jsx("span", { className: "ml-auto font-[family-name:var(--font-mono)] text-text-primary", children: typeof item.value === "number" ? valueFormatter(item.value) : item.value ?? "\u2014" })
    ] }, i)) })
  ] });
}
function ChartSliceTooltipContent({
  active,
  payload,
  render
}) {
  const item = payload?.[0];
  if (!active || !item) return null;
  const datum = item.payload;
  const ctx = {
    datum,
    value: Number(item.value),
    color: datum.color ?? item.color ?? ""
  };
  return inShell(render(ctx));
}
function ChartDataTable({
  caption,
  categoryLabel,
  categories,
  series,
  data,
  valueFormatter = formatChartValue
}) {
  return /* @__PURE__ */ jsxs("table", { className: "sr-only", children: [
    /* @__PURE__ */ jsx("caption", { children: caption }),
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { scope: "col", children: categoryLabel }),
      series.map((s) => /* @__PURE__ */ jsx("th", { scope: "col", children: s.label }, s.key))
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: data.map((row, i) => /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { scope: "row", children: String(categories[i] ?? "") }),
      series.map((s) => {
        const value = row[s.key];
        return /* @__PURE__ */ jsx("td", { children: typeof value === "number" ? valueFormatter(value) : value ?? "\u2014" }, s.key);
      })
    ] }, i)) })
  ] });
}
function ChartSkeleton({ height }) {
  return /* @__PURE__ */ jsx(Skeleton, { className: "w-full rounded-md", style: { height } });
}
function ChartEmpty({
  height,
  title = "No data",
  description
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", style: { minHeight: height }, children: /* @__PURE__ */ jsx(EmptyState, { className: "py-0", title, description }) });
}
var CHART_TICK_VALUE = {
  fill: "var(--color-text-secondary)",
  fontSize: 11,
  fontFamily: "var(--font-mono)"
};
var CHART_TICK_CATEGORY = {
  fill: "var(--color-text-secondary)",
  fontSize: 11,
  fontFamily: "var(--font-body)"
};
var CHART_GRID_COLOR = "var(--color-chart-grid)";
var CHART_LABEL_STYLE = {
  fill: "var(--color-text-secondary)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  fontWeight: 500
};
function useChartSeries(series, data, context) {
  const allSeries = capSeries(series, context);
  const [hidden, setHidden] = React.useState(() => /* @__PURE__ */ new Set());
  const plotData = React.useMemo(() => data.map((row) => ({ ...row })), [data]);
  const visibleSeries = React.useMemo(
    () => allSeries.filter((s) => !hidden.has(s.key)),
    [allSeries, hidden]
  );
  const toggle = (index) => {
    const key = allSeries[index]?.key;
    if (!key) return;
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (prev.size < allSeries.length - 1) next.add(key);
      return next;
    });
  };
  return { allSeries, visibleSeries, colors: resolveSeriesColors(allSeries), hidden, toggle, plotData };
}
function ChartFooter({
  state,
  showLegend,
  toggleable,
  data,
  categoryKey,
  categoryLabel,
  tableCaption,
  valueFormatter
}) {
  const { allSeries, colors, hidden, toggle } = state;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showLegend && /* @__PURE__ */ jsx(
      ChartLegend,
      {
        className: "mt-3",
        items: allSeries.map((s, i) => ({
          label: s.label,
          color: colors[i],
          inactive: hidden.has(s.key)
        })),
        onItemClick: toggleable ? toggle : void 0
      }
    ),
    /* @__PURE__ */ jsx(
      ChartDataTable,
      {
        caption: tableCaption ?? `${allSeries.map((s) => s.label).join(", ")} by ${categoryLabel}`,
        categoryLabel,
        categories: data.map((row) => String(row[categoryKey] ?? "")),
        series: allSeries,
        data,
        valueFormatter
      }
    )
  ] });
}
function BarChart({
  data,
  categoryKey,
  series,
  orientation = "vertical",
  stacked = false,
  colorBy = "series",
  valueLabels,
  legend,
  toggleableSeries = false,
  height = 260,
  maxBarSize = 40,
  valueFormatter = formatChartValue,
  tickFormatter,
  labelFormatter,
  tooltipContent,
  categoryLabel = "Category",
  tableCaption,
  onBarClick,
  loading,
  emptyTitle,
  emptyDescription,
  className
}) {
  const seriesState = useChartSeries(series, data, "BarChart");
  const { allSeries, visibleSeries, colors: allColors, plotData } = seriesState;
  const isHorizontal = orientation === "horizontal";
  const perCategory = colorBy === "category" && allSeries.length === 1;
  const categoryColors = React.useMemo(() => {
    if (!perCategory) return null;
    if (data.length > CHART_SERIES_LIMIT) {
      console.warn(
        `[CarbonOS BarChart] colorBy="category" with ${data.length} categories, but the palette has ${CHART_SERIES_LIMIT} identity slots. Bars past the ${CHART_SERIES_LIMIT}th render neutral. Sort and group the tail, or drop back to colorBy="series".`
      );
    }
    return data.map((_row, i) => i < CHART_SERIES_LIMIT ? seriesColor(i) : CHART_NEUTRAL_COLOR);
  }, [perCategory, data]);
  const showLabels = valueLabels ?? (visibleSeries.length === 1 && data.length <= 16);
  const showLegend = legend ?? allSeries.length > 1;
  const axisTickFormatter = tickFormatter ?? valueFormatter;
  const rightGutter = React.useMemo(() => {
    if (!isHorizontal) return 8;
    const widest = showLabels ? data.reduce((max, row) => {
      const rowMax = allSeries.reduce((m, s) => {
        const value = row[s.key];
        return typeof value === "number" && value !== 0 ? Math.max(m, valueFormatter(value).length) : m;
      }, 0);
      return Math.max(max, rowMax);
    }, 0) : 0;
    return Math.max(40, Math.ceil(widest * 6.5) + 10);
  }, [isHorizontal, showLabels, data, allSeries, valueFormatter]);
  if (loading) return /* @__PURE__ */ jsx(ChartSkeleton, { height });
  if (!data.length || !allSeries.length) {
    return /* @__PURE__ */ jsx(ChartEmpty, { height, title: emptyTitle, description: emptyDescription });
  }
  const capFor = (isLastInStack) => {
    if (stacked && !isLastInStack) return [0, 0, 0, 0];
    return isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];
  };
  const valueAxis = /* @__PURE__ */ jsx(
    XAxis,
    {
      type: "number",
      tick: CHART_TICK_VALUE,
      tickFormatter: axisTickFormatter,
      axisLine: false,
      tickLine: false
    }
  );
  const categoryAxis = /* @__PURE__ */ jsx(
    YAxis,
    {
      type: "category",
      dataKey: categoryKey,
      tick: CHART_TICK_CATEGORY,
      axisLine: false,
      tickLine: false,
      width: 110
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full", className), children: [
    /* @__PURE__ */ jsx("div", { style: { height }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
      BarChart$1,
      {
        accessibilityLayer: true,
        data: plotData,
        layout: isHorizontal ? "vertical" : "horizontal",
        barGap: 2,
        barCategoryGap: "28%",
        margin: {
          top: !isHorizontal && showLabels ? 18 : 8,
          right: rightGutter,
          bottom: 0,
          left: 0
        },
        children: [
          /* @__PURE__ */ jsx(
            CartesianGrid,
            {
              stroke: CHART_GRID_COLOR,
              horizontal: !isHorizontal,
              vertical: isHorizontal
            }
          ),
          isHorizontal ? /* @__PURE__ */ jsxs(Fragment, { children: [
            valueAxis,
            categoryAxis
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              XAxis,
              {
                dataKey: categoryKey,
                tick: CHART_TICK_CATEGORY,
                axisLine: false,
                tickLine: false,
                interval: "preserveStartEnd"
              }
            ),
            /* @__PURE__ */ jsx(
              YAxis,
              {
                tick: CHART_TICK_VALUE,
                tickFormatter: axisTickFormatter,
                axisLine: false,
                tickLine: false,
                width: 48
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Tooltip$1,
            {
              cursor: { fill: "var(--color-surface-overlay)", fillOpacity: 0.45 },
              content: /* @__PURE__ */ jsx(
                ChartTooltipContent,
                {
                  valueFormatter,
                  labelFormatter,
                  render: tooltipContent
                }
              )
            }
          ),
          visibleSeries.map((s) => {
            const seriesIndex = allSeries.indexOf(s);
            const isLastInStack = s === visibleSeries[visibleSeries.length - 1];
            return /* @__PURE__ */ jsxs(
              Bar,
              {
                dataKey: s.key,
                name: s.label,
                fill: allColors[seriesIndex],
                radius: capFor(isLastInStack),
                maxBarSize,
                stackId: stacked ? "stack" : void 0,
                stroke: stacked ? "var(--color-surface)" : void 0,
                strokeWidth: stacked ? 2 : 0,
                isAnimationActive: false,
                cursor: onBarClick ? "pointer" : void 0,
                onClick: onBarClick ? (_entry, index) => onBarClick(data[index], index, s.key) : void 0,
                children: [
                  categoryColors?.map((fill, i) => /* @__PURE__ */ jsx(Cell, { fill }, i)),
                  showLabels && /* @__PURE__ */ jsx(
                    LabelList,
                    {
                      dataKey: s.key,
                      position: isHorizontal ? "right" : "top",
                      formatter: (value) => typeof value === "number" && value !== 0 ? valueFormatter(value) : "",
                      ...CHART_LABEL_STYLE
                    }
                  )
                ]
              },
              s.key
            );
          })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsx(
      ChartFooter,
      {
        state: seriesState,
        showLegend,
        toggleable: toggleableSeries,
        data,
        categoryKey,
        categoryLabel,
        tableCaption,
        valueFormatter
      }
    )
  ] });
}
function LineChart({
  data,
  categoryKey,
  series,
  area = false,
  stacked = false,
  curve = "linear",
  dots,
  legend,
  toggleableSeries = false,
  referenceValue,
  referenceLabel,
  height = 260,
  valueFormatter = formatChartValue,
  tickFormatter,
  labelFormatter,
  tooltipContent,
  categoryLabel = "Period",
  tableCaption,
  loading,
  emptyTitle,
  emptyDescription,
  className
}) {
  const seriesState = useChartSeries(series, data, "LineChart");
  const { allSeries, visibleSeries, colors: allColors, plotData } = seriesState;
  const showLegend = legend ?? allSeries.length > 1;
  const showDots = dots ?? data.length <= 12;
  const axisTickFormatter = tickFormatter ?? valueFormatter;
  if (loading) return /* @__PURE__ */ jsx(ChartSkeleton, { height });
  if (!data.length || !allSeries.length) {
    return /* @__PURE__ */ jsx(ChartEmpty, { height, title: emptyTitle, description: emptyDescription });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full", className), children: [
    /* @__PURE__ */ jsx("div", { style: { height }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
      AreaChart,
      {
        accessibilityLayer: true,
        data: plotData,
        margin: { top: 8, right: 8, bottom: 0, left: 0 },
        children: [
          /* @__PURE__ */ jsx(CartesianGrid, { stroke: CHART_GRID_COLOR, vertical: false }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: categoryKey,
              tick: CHART_TICK_CATEGORY,
              axisLine: false,
              tickLine: false,
              interval: "preserveStartEnd"
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              tick: CHART_TICK_VALUE,
              tickFormatter: axisTickFormatter,
              axisLine: false,
              tickLine: false,
              width: 48
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip$1,
            {
              cursor: { stroke: "var(--color-text-faint)", strokeWidth: 1 },
              content: /* @__PURE__ */ jsx(
                ChartTooltipContent,
                {
                  valueFormatter,
                  labelFormatter,
                  render: tooltipContent
                }
              )
            }
          ),
          referenceValue != null && /* @__PURE__ */ jsx(
            ReferenceLine,
            {
              y: referenceValue,
              stroke: "var(--color-text-faint)",
              strokeWidth: 1,
              label: referenceLabel ? {
                value: referenceLabel,
                position: "insideTopRight",
                fill: "var(--color-text-muted)",
                fontSize: 10
              } : void 0
            }
          ),
          visibleSeries.map((s) => {
            const color = allColors[allSeries.indexOf(s)];
            return /* @__PURE__ */ jsx(
              Area,
              {
                type: curve,
                dataKey: s.key,
                name: s.label,
                stroke: color,
                strokeWidth: 2,
                fill: color,
                fillOpacity: area ? 0.16 : 0,
                stackId: area && stacked ? "stack" : void 0,
                dot: showDots ? { r: 3.5, fill: "var(--color-surface)", stroke: color, strokeWidth: 2 } : false,
                activeDot: { r: 4.5, fill: color, stroke: "var(--color-surface)", strokeWidth: 2 },
                isAnimationActive: false,
                connectNulls: true
              },
              s.key
            );
          })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsx(
      ChartFooter,
      {
        state: seriesState,
        showLegend,
        toggleable: toggleableSeries,
        data,
        categoryKey,
        categoryLabel,
        tableCaption,
        valueFormatter
      }
    )
  ] });
}
var DONUT_TABLE_SERIES = [
  { key: "value", label: "Value" },
  { key: "share", label: "Share" }
];
function DonutChart({
  data,
  maxSlices = 6,
  otherLabel = "Other",
  sort = false,
  variant = "donut",
  centerValue,
  centerLabel,
  legendPosition = "right",
  showPercentages = true,
  height = 260,
  valueFormatter = formatChartValue,
  categoryLabel = "Category",
  tableCaption,
  onSliceClick,
  tooltipContent,
  loading,
  emptyTitle,
  emptyDescription,
  className
}) {
  const slices = React.useMemo(() => {
    const rows = sort ? [...data].sort((a, b) => b.value - a.value) : data;
    let kept = rows;
    if (rows.length > maxSlices) {
      const cutoff = [...rows].sort((a, b) => b.value - a.value).slice(0, maxSlices - 1);
      const survivors = rows.filter((row) => cutoff.includes(row));
      const foldedTotal = rows.filter((row) => !cutoff.includes(row)).reduce((sum, row) => sum + row.value, 0);
      kept = [...survivors, { label: otherLabel, value: foldedTotal, color: CHART_NEUTRAL_COLOR }];
    }
    const total2 = kept.reduce((sum, row) => sum + row.value, 0);
    return kept.map((row, i) => ({
      ...row,
      color: row.color ?? seriesColor(i),
      percent: total2 > 0 ? row.value / total2 * 100 : 0
    }));
  }, [data, maxSlices, otherLabel, sort]);
  const total = slices.reduce((sum, row) => sum + row.value, 0);
  if (loading) return /* @__PURE__ */ jsx(ChartSkeleton, { height });
  if (!data.length || total === 0) {
    return /* @__PURE__ */ jsx(ChartEmpty, { height, title: emptyTitle, description: emptyDescription });
  }
  const isRight = legendPosition === "right";
  return (
    /*
     * The plot is square and sized off `height`, and the whole plot+legend unit
     * centers. Letting the plot flex instead would strand a small circle in the
     * middle of a wide card, far from the legend that names its wedges.
     */
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex w-full justify-center",
          isRight ? "items-center gap-6" : "flex-col items-center gap-4",
          className
        ),
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative shrink-0",
              style: { height, width: height, maxWidth: "100%" },
              children: [
                /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
                  /* @__PURE__ */ jsx(
                    Tooltip$1,
                    {
                      content: tooltipContent ? /* @__PURE__ */ jsx(ChartSliceTooltipContent, { render: tooltipContent }) : /* @__PURE__ */ jsx(ChartTooltipContent, { valueFormatter })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Pie,
                    {
                      data: slices,
                      dataKey: "value",
                      nameKey: "label",
                      innerRadius: variant === "donut" ? "62%" : 0,
                      outerRadius: "88%",
                      paddingAngle: 1,
                      stroke: "var(--color-surface)",
                      strokeWidth: 2,
                      isAnimationActive: false,
                      cursor: onSliceClick ? "pointer" : void 0,
                      onClick: onSliceClick ? (_entry, index) => onSliceClick(slices[index], index) : void 0,
                      children: slices.map((slice, i) => /* @__PURE__ */ jsx(Cell, { fill: slice.color }, `${slice.label}-${i}`))
                    }
                  )
                ] }) }),
                variant === "donut" && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-[family-name:var(--font-mono)] text-xl font-semibold text-text-primary", children: centerValue ?? valueFormatter(total) }),
                  centerLabel && /* @__PURE__ */ jsx("span", { className: "mt-0.5 max-w-[70%] text-center text-[11px] uppercase tracking-widest text-text-secondary", children: centerLabel })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            ChartLegend,
            {
              className: isRight ? "w-44 shrink-0" : "w-full max-w-xs",
              items: slices.map((slice) => ({
                label: slice.label,
                color: slice.color,
                value: showPercentages ? `${slice.percent.toFixed(1)}%` : valueFormatter(slice.value)
              }))
            }
          ),
          /* @__PURE__ */ jsx(
            ChartDataTable,
            {
              caption: tableCaption ?? `Share of total by ${categoryLabel}`,
              categoryLabel,
              categories: slices.map((slice) => slice.label),
              series: DONUT_TABLE_SERIES,
              data: slices.map((slice) => ({ value: slice.value, share: `${slice.percent.toFixed(1)}%` })),
              valueFormatter
            }
          )
        ]
      }
    )
  );
}
var MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: shortMonthName(i + 1) }));
var triggerClass = "h-7 gap-1 px-2 text-xs";
function NumberSelect({
  value,
  onChange,
  options,
  label,
  className
}) {
  return /* @__PURE__ */ jsxs(Select, { value: String(value), onValueChange: (v) => onChange(Number(v)), children: [
    /* @__PURE__ */ jsx(SelectTrigger, { "aria-label": label, className: cn(triggerClass, className), children: /* @__PURE__ */ jsx(SelectValue, {}) }),
    /* @__PURE__ */ jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: String(o.value), children: o.label }, o.value)) })
  ] });
}
function DateRangePicker({ value, onChange, years, className }) {
  const yearOptions = [.../* @__PURE__ */ new Set([...years, value.startYear, value.endYear])].sort((a, b) => a - b).map((y) => ({ value: y, label: String(y) }));
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1.5 text-xs", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        NumberSelect,
        {
          label: "Start month",
          value: value.startMonth,
          onChange: (startMonth) => onChange({ ...value, startMonth }),
          options: MONTH_OPTIONS,
          className: "w-16"
        }
      ),
      /* @__PURE__ */ jsx(
        NumberSelect,
        {
          label: "Start year",
          value: value.startYear,
          onChange: (startYear) => onChange({ ...value, startYear }),
          options: yearOptions,
          className: "w-[4.5rem]"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-text-muted", children: "to" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        NumberSelect,
        {
          label: "End month",
          value: value.endMonth,
          onChange: (endMonth) => onChange({ ...value, endMonth }),
          options: MONTH_OPTIONS,
          className: "w-16"
        }
      ),
      /* @__PURE__ */ jsx(
        NumberSelect,
        {
          label: "End year",
          value: value.endYear,
          onChange: (endYear) => onChange({ ...value, endYear }),
          options: yearOptions,
          className: "w-[4.5rem]"
        }
      )
    ] })
  ] });
}
function PeriodNav({
  label,
  layout = "bar",
  onPrevious,
  onNext,
  onToday,
  previousLabel,
  nextLabel,
  previousDisabled = false,
  nextDisabled = false,
  todayDisabled = false,
  disabled = false,
  className
}) {
  const compact = layout === "compact";
  const arrow = (direction) => {
    const previous = direction === "previous";
    const Icon2 = previous ? ChevronLeft : ChevronRight;
    return /* @__PURE__ */ jsx(
      Button,
      {
        type: "button",
        variant: compact ? "ghost" : "outline",
        size: "icon",
        "aria-label": previous ? previousLabel : nextLabel,
        disabled: disabled || (previous ? previousDisabled : nextDisabled),
        onClick: previous ? onPrevious : onNext,
        children: /* @__PURE__ */ jsx(Icon2, { size: 16, "aria-hidden": "true" })
      }
    );
  };
  if (compact) {
    return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center justify-between", className), children: [
      arrow("previous"),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-primary", "aria-live": "polite", children: label }),
      arrow("next")
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-wrap items-center justify-between gap-2", className), children: [
    /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-text-primary", "aria-live": "polite", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      onToday && /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", disabled: disabled || todayDisabled, onClick: onToday, children: "Today" }),
      arrow("previous"),
      arrow("next")
    ] })
  ] });
}
function MonthGrid({
  month,
  ariaLabel,
  today,
  renderDay,
  dayClassName,
  dimWeekendHeaders = false,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { role: "table", "aria-label": ariaLabel, className, children: [
    /* @__PURE__ */ jsx("div", { role: "row", className: "grid grid-cols-7", children: WEEKDAY_LABELS.map((label, i) => /* @__PURE__ */ jsx(
      "div",
      {
        role: "columnheader",
        className: cn(eyebrowClass, "py-2 text-center", dimWeekendHeaders && i >= 5 && "text-text-faint"),
        children: label
      },
      label
    )) }),
    /* @__PURE__ */ jsx("div", { role: "rowgroup", className: "divide-y divide-border overflow-hidden rounded-lg border border-border", children: monthWeeks(month).map((week, w) => /* @__PURE__ */ jsx("div", { role: "row", className: "grid grid-cols-7 divide-x divide-border", children: week.map((date, d) => {
      if (!date) return /* @__PURE__ */ jsx("div", { role: "cell", className: "bg-bg" }, `blank-${d}`);
      const key = dateKey(date);
      const day = { key, isToday: key === today, isWeekend: isWeekend(date) };
      return /* @__PURE__ */ jsx(
        "div",
        {
          role: "cell",
          "aria-label": formatCalendarDate(date, { weekday: "long", month: "long", day: "numeric" }),
          "aria-current": day.isToday ? "date" : void 0,
          className: cn("min-w-0", dayClassName?.(date, day)),
          children: renderDay(date, day)
        },
        key
      );
    }) }, w)) })
  ] });
}
function MonthCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  available,
  unavailableLabel = "unavailable",
  min,
  max,
  className,
  "aria-label": ariaLabel = "Choose a day"
}) {
  const cells = monthWeeks(month).flat();
  const canGoBack = compareMonths(month, min) > 0;
  const canGoForward = compareMonths(month, max) < 0;
  return /* @__PURE__ */ jsxs("div", { role: "group", "aria-label": ariaLabel, className: cn("w-[17.5rem] shrink-0", className), children: [
    /* @__PURE__ */ jsx(
      PeriodNav,
      {
        layout: "compact",
        className: "mb-2",
        label: monthLabel(month),
        onPrevious: () => onMonthChange(shiftMonth(month, -1)),
        onNext: () => onMonthChange(shiftMonth(month, 1)),
        previousLabel: "Previous month",
        nextLabel: "Next month",
        previousDisabled: !canGoBack,
        nextDisabled: !canGoForward
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-1", children: [
      WEEKDAY_LABELS.map((label) => /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": "true",
          className: cn(eyebrowClass, "pb-1 text-center text-[10px] tracking-normal"),
          children: label[0]
        },
        label
      )),
      cells.map((cell, i) => {
        if (!cell) return /* @__PURE__ */ jsx("span", { "aria-hidden": "true" }, `blank-${i}`);
        const { day } = cell;
        const key = dateKey(cell);
        const open = available ? available.has(key) : true;
        const isSelected = key === selected;
        return /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: isSelected ? "default" : open ? "outline" : "ghost",
            size: "icon",
            className: "h-9 w-9",
            disabled: !open,
            "aria-label": `${day} ${monthLabel(month)}${open ? "" : `, ${unavailableLabel}`}`,
            "aria-pressed": isSelected,
            onClick: () => onSelect(key),
            children: day
          },
          key
        );
      })
    ] })
  ] });
}
function EventCalendar({
  month,
  onMonthChange,
  itemsByDate,
  renderItem,
  itemKey,
  maxVisibleItems = 3,
  loading = false,
  overflowPopoverTitle,
  overflowAriaLabel,
  ariaLabel,
  className
}) {
  const today = todayIn();
  const todayKey = dateKey(today);
  const currentMonth = { year: today.year, month: today.month };
  const monthTitle = monthLabel(month);
  const titleOf = overflowPopoverTitle ?? ((isoDate, count) => `${formatDateKey(isoDate, { weekday: "short", month: "short", day: "numeric" })} \u2014 ${count} ${count === 1 ? "item" : "items"}`);
  const ariaLabelOf = overflowAriaLabel ?? ((isoDate, count) => `Show ${count} more items on ${formatDateKey(isoDate, { month: "long", day: "numeric" })}`);
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx(
      PeriodNav,
      {
        className: "border-b border-border pb-4",
        label: monthTitle,
        onPrevious: () => onMonthChange(shiftMonth(month, -1)),
        onNext: () => onMonthChange(shiftMonth(month, 1)),
        onToday: () => onMonthChange(currentMonth),
        previousLabel: "Previous month",
        nextLabel: "Next month",
        todayDisabled: compareMonths(month, currentMonth) === 0,
        disabled: loading
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative pt-4", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/60", children: /* @__PURE__ */ jsx(Spinner, { size: "sm" }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx(
        MonthGrid,
        {
          className: "min-w-[700px]",
          month,
          ariaLabel: ariaLabel ?? `Calendar, ${monthTitle}`,
          today: todayKey,
          dayClassName: (_date, day) => cn(
            "flex min-h-[96px] flex-col gap-1 p-1.5 lg:min-h-[112px]",
            day.isWeekend ? "bg-surface-raised" : "bg-surface"
          ),
          renderDay: (cell, { key: iso, isToday }) => {
            const items = itemsByDate.get(iso) || [];
            const visible = items.slice(0, maxVisibleItems);
            const overflow = items.length - visible.length;
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs tabular-nums",
                    isToday ? "bg-accent font-semibold text-accent-foreground" : "font-medium text-text-secondary"
                  ),
                  children: cell.day
                }
              ),
              visible.map((item) => /* @__PURE__ */ jsx(Fragment$1, { children: renderItem(item, iso) }, itemKey(item, iso))),
              overflow > 0 && /* @__PURE__ */ jsxs(Popover, { children: [
                /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    "aria-label": ariaLabelOf(iso, overflow),
                    className: "h-6 w-full justify-start px-1.5 text-text-muted",
                    children: `+${overflow} more`
                  }
                ) }),
                /* @__PURE__ */ jsxs(
                  PopoverContent,
                  {
                    align: "start",
                    "aria-label": `Items on ${formatCalendarDate(cell, { month: "long", day: "numeric" })}`,
                    className: "max-h-64 w-64 space-y-1 overflow-y-auto p-2",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "pb-1 text-xs font-semibold text-text-secondary", children: titleOf(iso, items.length) }),
                      items.map((item) => /* @__PURE__ */ jsx(Fragment$1, { children: renderItem(item, iso) }, itemKey(item, iso)))
                    ]
                  }
                )
              ] })
            ] });
          }
        }
      ) })
    ] })
  ] });
}

// src/lib/timesheet.ts
function createDefaultApi(baseUrl = "", extraHeaders = {}) {
  const headers = (contentType) => ({
    ...extraHeaders,
    ...contentType ? { "Content-Type": contentType } : {}
  });
  return {
    async fetchTimeEntries(params) {
      const searchParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate
      });
      const res = await fetch(`${baseUrl}/api/my-timesheets/entries?${searchParams}`, {
        headers: headers()
      });
      if (!res.ok) throw new Error("Failed to fetch time entries");
      return res.json();
    },
    async fetchExpectedHours(params) {
      const searchParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate
      });
      const res = await fetch(`${baseUrl}/api/my-timesheets/expected-hours?${searchParams}`, {
        headers: headers()
      });
      if (!res.ok) throw new Error("Failed to fetch expected hours");
      return res.json();
    },
    async saveTimesheet(entries) {
      const res = await fetch(`${baseUrl}/api/my-timesheets/save`, {
        method: "POST",
        headers: headers("application/json"),
        body: JSON.stringify({ entries })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      return res.json();
    }
  };
}
function cellKey(contractId, date) {
  return `${contractId}::${date}`;
}
function parseCellKey(key) {
  const [contractIdStr, date] = key.split("::");
  return { contractId: parseInt(contractIdStr), date };
}
function diffGrids(before, after) {
  const changed = [];
  for (const key of /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)])) {
    const hours = after[key] ?? null;
    if (hours !== (before[key] ?? null)) {
      const { contractId, date } = parseCellKey(key);
      changed.push({ contractId, date, hours });
    }
  }
  return changed;
}
function contractCoversDay(contract, date) {
  return date >= datePart(contract.startDate) && date <= datePart(contract.endDate);
}
function dayLabel(date, weekday = "short") {
  return formatDateKey(date, { weekday, month: "short", day: "numeric", year: "numeric" });
}
var HOURS_DRAFT = /^\d{0,2}(\.\d{0,2})?$/;
var HoursInput = forwardRef(
  ({ value, onValueChange, onFocus, onBlur, className, ...props }, ref) => {
    const [draft, setDraft] = useState(null);
    const draftHours = draft === null ? void 0 : draft === "" || draft === "." ? null : parseFloat(draft);
    const shown = draft !== null && draftHours === (value ?? null) ? draft : value == null ? "" : String(value);
    return /* @__PURE__ */ jsx(
      Input,
      {
        ref,
        type: "text",
        inputMode: "decimal",
        autoComplete: "off",
        value: shown,
        onChange: (e) => {
          const next = e.target.value.trim();
          if (!HOURS_DRAFT.test(next) || parseFloat(next) > 24) return;
          setDraft(next);
          onValueChange(next === "." ? "" : next);
        },
        onFocus: (e) => {
          setDraft(value == null ? "" : String(value));
          e.target.select();
          onFocus?.(e);
        },
        onBlur: (e) => {
          setDraft(null);
          onBlur?.(e);
        },
        className: cn("h-8 px-1 text-center tabular-nums", className),
        ...props
      }
    );
  }
);
HoursInput.displayName = "HoursInput";
function isTimeOffDay(date, timeOffs) {
  return timeOffs.some((to) => date >= datePart(to.startsAt) && date < datePart(to.endsAt));
}
function MonthlyCalendarGrid({
  month,
  gridData,
  contracts,
  timeOffs,
  today,
  selectedDay,
  onDaySelect,
  onClose,
  onCellChange
}) {
  const inlineInputRef = useRef(null);
  const dayButtonRefs = useRef({});
  const returnFocusTo = useRef(null);
  useEffect(() => {
    if (selectedDay && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    } else if (!selectedDay && returnFocusTo.current) {
      dayButtonRefs.current[returnFocusTo.current]?.focus();
    }
    returnFocusTo.current = null;
  }, [selectedDay]);
  const dayTotal = (date) => contracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, date)] || 0), 0);
  return /* @__PURE__ */ jsx(
    MonthGrid,
    {
      month,
      ariaLabel: `Hours, ${monthLabel(month)}`,
      today,
      dimWeekendHeaders: true,
      dayClassName: () => "flex min-h-[72px]",
      renderDay: (cell, { key: date, isToday, isWeekend: weekend }) => {
        const isSelected = date === selectedDay;
        const total = dayTotal(date);
        const hasTimeOff = isTimeOffDay(date, timeOffs);
        const isMissingHours = !weekend && date < today && total === 0 && !hasTimeOff;
        const dayContracts = contracts.filter((c) => contractCoversDay(c, date));
        const background = isMissingHours ? "bg-error-soft" : isToday ? "bg-accent-muted" : weekend ? "bg-surface-raised" : "bg-surface";
        const header = /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "text-sm font-medium tabular-nums",
                isToday ? "text-accent-text" : weekend ? "text-text-faint" : "text-text-primary"
              ),
              children: cell.day
            }
          ),
          hasTimeOff && /* @__PURE__ */ jsx(Badge, { variant: "info", className: "px-1 text-[10px]", children: "PTO" })
        ] });
        if (isSelected && dayContracts.length === 1) {
          const contract = dayContracts[0];
          return /* @__PURE__ */ jsxs("div", { className: cn("w-full p-2 ring-2 ring-inset ring-accent", background), children: [
            header,
            /* @__PURE__ */ jsx(
              HoursInput,
              {
                ref: inlineInputRef,
                "aria-label": `Hours for ${contract.projectName} on ${dayLabel(date)}`,
                value: gridData[cellKey(contract.id, date)],
                onValueChange: (value) => onCellChange(contract.id, date, value),
                onKeyDown: (e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    returnFocusTo.current = date;
                    onClose();
                  }
                },
                placeholder: "\u2013",
                className: "mt-1 h-7"
              }
            )
          ] });
        }
        return /* @__PURE__ */ jsxs(
          Button,
          {
            ref: (el) => {
              dayButtonRefs.current[date] = el;
            },
            type: "button",
            variant: "ghost",
            "aria-pressed": isSelected,
            "aria-label": `${dayLabel(date)}${total > 0 ? `, ${total} hours` : ""}${hasTimeOff ? ", time off" : ""}${isMissingHours ? ", no hours" : ""}`,
            onClick: () => onDaySelect(date),
            className: cn(
              // A whole calendar cell, not an inline button: stacked, square, full height.
              "flex h-auto w-full flex-col items-stretch justify-start gap-0 whitespace-normal rounded-none p-2 text-left font-normal focus-visible:ring-inset",
              background,
              "hover:bg-surface-overlay",
              isSelected && "ring-2 ring-inset ring-accent"
            ),
            children: [
              header,
              total > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs font-semibold tabular-nums text-text-primary", children: [
                total,
                "h"
              ] }),
              isMissingHours && /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-error-text", children: "No hours" })
            ]
          }
        );
      }
    }
  );
}
function DayDetailPanel({
  selectedDay,
  contracts,
  gridData,
  onCellChange,
  onClose
}) {
  const inputRefs = useRef([]);
  const panelRef = useRef(null);
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, contracts.length);
  }, [contracts.length]);
  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedDay]);
  const focusRow = (idx) => {
    inputRefs.current[idx]?.focus();
    inputRefs.current[idx]?.select();
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === "ArrowUp" || e.key === "Tab" && e.shiftKey) {
      if (idx > 0) {
        e.preventDefault();
        focusRow(idx - 1);
      }
    } else if (e.key === "ArrowDown" || e.key === "Enter" || e.key === "Tab" && !e.shiftKey) {
      if (idx < contracts.length - 1) {
        e.preventDefault();
        focusRow(idx + 1);
      }
    }
  };
  const total = contracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, selectedDay)] || 0), 0);
  return /* @__PURE__ */ jsx("div", { ref: panelRef, children: /* @__PURE__ */ jsxs(Card, { padding: "sm", children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        as: "h3",
        size: "sm",
        className: "mb-0 items-center px-3 pb-3 pt-2",
        title: dayLabel(selectedDay, "long"),
        actions: /* @__PURE__ */ jsx(DismissButton, { label: "Close", onClick: onClose, className: "text-text-muted" })
      }
    ),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Contract" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-[100px] text-center", children: "Hours" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        contracts.length === 0 && /* @__PURE__ */ jsx(TableEmptyRow, { colSpan: 2, children: "No active contracts for this day." }),
        contracts.map((contract, idx) => /* @__PURE__ */ jsxs(TableRow, { className: tableRowHoverClass, children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(ContractName, { contract }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
            HoursInput,
            {
              ref: (el) => {
                inputRefs.current[idx] = el;
              },
              "aria-label": `Hours for ${contract.projectName} on ${dayLabel(selectedDay)}`,
              value: gridData[cellKey(contract.id, selectedDay)],
              disabled: !contractCoversDay(contract, selectedDay),
              onValueChange: (value) => onCellChange(contract.id, selectedDay, value),
              onKeyDown: (e) => handleKeyDown(e, idx),
              placeholder: contractCoversDay(contract, selectedDay) ? "\u2013" : ""
            }
          ) })
        ] }, contract.id))
      ] }),
      /* @__PURE__ */ jsx(TableFooter, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "text-xs font-medium uppercase text-text-muted", children: "Total" }),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            className: cn(
              "text-center font-semibold tabular-nums",
              total > 0 ? "text-text-primary" : "text-text-faint"
            ),
            children: total > 0 ? `${total}h` : "\u2013"
          }
        )
      ] }) })
    ] })
  ] }) });
}
function ContractName({ contract }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium text-text-primary", children: contract.projectName }),
    /* @__PURE__ */ jsxs("div", { className: "truncate text-xs text-text-muted", children: [
      contract.customerName,
      " \xB7 ",
      contract.name
    ] })
  ] });
}
var VIEW_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];
var AUTOSAVE_DELAY_MS = 15e3;
var REVERT_WINDOW_MS = 5e3;
var headClass = cn(eyebrowClass, "px-2 py-3");
function weekRangeLabel(monday) {
  const sunday = addDays(monday, 6);
  return `${formatCalendarDate(monday, { month: "short", day: "numeric" })} \u2013 ${formatCalendarDate(sunday, { month: "short", day: "numeric", year: "numeric" })}`;
}
function monthOf(date) {
  return { year: date.year, month: date.month };
}
function HoursSummary({
  loggedHours,
  expectedHours,
  ptoHours
}) {
  const hasExpected = expectedHours > 0;
  const percentage = hasExpected ? Math.min(loggedHours / expectedHours * 100, 100) : 0;
  const isComplete = hasExpected && loggedHours >= expectedHours;
  const isOver = hasExpected && loggedHours > expectedHours;
  return /* @__PURE__ */ jsxs(Card, { padding: "md", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-text-secondary", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-semibold tabular-nums text-text-primary", children: [
          loggedHours,
          "h"
        ] }),
        " of",
        " ",
        /* @__PURE__ */ jsxs("span", { className: "font-semibold tabular-nums text-text-primary", children: [
          expectedHours,
          "h"
        ] }),
        " ",
        "expected"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        ptoHours > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
          ptoHours,
          "h time off"
        ] }),
        hasExpected && (isOver ? /* @__PURE__ */ jsxs(Badge, { variant: "warning", children: [
          "+",
          loggedHours - expectedHours,
          "h over"
        ] }) : isComplete ? /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Complete" }) : /* @__PURE__ */ jsxs(Badge, { children: [
          Math.max(0, expectedHours - loggedHours),
          "h remaining"
        ] }))
      ] })
    ] }),
    hasExpected && /* @__PURE__ */ jsx(
      Progress,
      {
        "aria-label": "Hours logged of expected",
        value: percentage,
        tone: isOver ? "warning" : isComplete ? "success" : "error"
      }
    )
  ] });
}
function TimesheetTable({
  userId,
  userFullName,
  contracts,
  api: apiOverrides,
  baseUrl = "",
  apiHeaders,
  defaultView = "weekly",
  onViewChange,
  onNavigate,
  initialWeek,
  initialMonth,
  title = "My Timesheets",
  className
}) {
  const latest = useRef({ apiOverrides, baseUrl, apiHeaders, onNavigate });
  useLayoutEffect(() => {
    latest.current = { apiOverrides, baseUrl, apiHeaders, onNavigate };
  });
  const api = useMemo(() => {
    const resolve = () => {
      const { apiOverrides: overrides, baseUrl: url, apiHeaders: headers } = latest.current;
      const defaultApi = createDefaultApi(url, headers);
      return {
        fetchTimeEntries: overrides?.fetchTimeEntries ?? defaultApi.fetchTimeEntries,
        fetchExpectedHours: overrides?.fetchExpectedHours ?? defaultApi.fetchExpectedHours,
        saveTimesheet: overrides?.saveTimesheet ?? defaultApi.saveTimesheet
      };
    };
    return {
      fetchTimeEntries: (params) => resolve().fetchTimeEntries(params),
      fetchExpectedHours: (params) => resolve().fetchExpectedHours(params),
      saveTimesheet: (entries) => resolve().saveTimesheet(entries)
    };
  }, [baseUrl]);
  const [viewMode, setViewMode] = useState(defaultView);
  const [weekStart, setWeekStart] = useState(
    () => startOfWeek(initialWeek && parseDateKey(initialWeek) || todayIn())
  );
  const [month, setMonth] = useState(
    () => initialMonth && parseMonthKey(initialMonth) || monthOf(todayIn())
  );
  const [selectedDay, setSelectedDay] = useState(null);
  const [gridData, setGridData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expectedHours, setExpectedHours] = useState(null);
  const [ptoHours, setPtoHours] = useState(0);
  const [timeOffs, setTimeOffs] = useState([]);
  const inputRefs = useRef({});
  const [revertSnapshot, setRevertSnapshot] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const revertHideTimerRef = useRef(null);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDates = weekDays.map(dateKey);
  const today = dateKey(todayIn());
  const rangeStart = viewMode === "weekly" ? weekDates[0] : dateKey({ ...month, day: 1 });
  const rangeEnd = viewMode === "weekly" ? weekDates[6] : dateKey({ ...month, day: daysInMonth(month.year, month.month) });
  const activeContracts = contracts.filter(
    (c) => c.projectActive && datePart(c.startDate) <= rangeEnd && datePart(c.endDate) >= rangeStart
  );
  const selectedDayContracts = selectedDay ? contracts.filter((c) => c.projectActive && contractCoversDay(c, selectedDay)) : [];
  const isDirty = diffGrids(originalData, gridData).length > 0;
  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const startDate = rangeStart;
      const endDate = rangeEnd;
      const [entriesRes, expectedRes] = await Promise.all([
        api.fetchTimeEntries({ userId, startDate, endDate }),
        api.fetchExpectedHours({ startDate, endDate })
      ]);
      const newGrid = {};
      for (const entry of entriesRes.timeEntries) {
        newGrid[cellKey(entry.contractId, datePart(entry.date))] = entry.hours;
      }
      setGridData(newGrid);
      setOriginalData(newGrid);
      setExpectedHours(expectedRes.expectedHours);
      setPtoHours(expectedRes.ptoHours);
      setTimeOffs(expectedRes.timeOffs || []);
      setRevertSnapshot(null);
      clearTimer(autoSaveTimerRef);
      clearTimer(revertHideTimerRef);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setLoadError(true);
      toast.error("Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd, userId, api]);
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  useEffect(() => {
    latest.current.onNavigate?.(
      viewMode === "monthly" ? { view: "monthly", month: monthKey(month) } : { view: "weekly", week: dateKey(weekStart) }
    );
  }, [viewMode, weekStart, month]);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
  const handleCellChange = (contractId, date, value) => {
    const key = cellKey(contractId, date);
    if (value === "" || value === null) {
      setGridData((prev) => ({ ...prev, [key]: null }));
    } else {
      const num = parseFloat(value);
      if (!isNaN(num) && num >= 0 && num <= 24) {
        setGridData((prev) => ({ ...prev, [key]: num }));
      }
    }
  };
  const persistDiff = useCallback(
    async (snapshotBefore, gridNow) => {
      const changedEntries = diffGrids(snapshotBefore, gridNow);
      if (changedEntries.length === 0) return false;
      await api.saveTimesheet(changedEntries);
      return true;
    },
    [api]
  );
  const performAutoSave = useCallback(async () => {
    clearTimer(autoSaveTimerRef);
    const snapshotBefore = originalData;
    const gridNow = gridData;
    if (diffGrids(snapshotBefore, gridNow).length === 0) return true;
    setSaving(true);
    try {
      const saved = await persistDiff(snapshotBefore, gridNow);
      if (!saved) return true;
      setOriginalData({ ...gridNow });
      setRevertSnapshot(snapshotBefore);
      clearTimer(revertHideTimerRef);
      revertHideTimerRef.current = setTimeout(() => {
        setRevertSnapshot(null);
        revertHideTimerRef.current = null;
      }, REVERT_WINDOW_MS);
      return true;
    } catch (error) {
      console.error("Error auto-saving timesheet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save timesheet");
      return false;
    } finally {
      setSaving(false);
    }
  }, [originalData, gridData, persistDiff]);
  const flushPendingAutoSave = useCallback(async () => {
    clearTimer(autoSaveTimerRef);
    return isDirty ? performAutoSave() : true;
  }, [isDirty, performAutoSave]);
  const handleRevert = useCallback(async () => {
    if (!revertSnapshot) return;
    const snapshot = revertSnapshot;
    setRevertSnapshot(null);
    clearTimer(revertHideTimerRef);
    clearTimer(autoSaveTimerRef);
    const currentSaved = originalData;
    setGridData(snapshot);
    setSaving(true);
    try {
      await persistDiff(currentSaved, snapshot);
      setOriginalData(snapshot);
    } catch (error) {
      console.error("Error reverting timesheet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to revert changes");
    } finally {
      setSaving(false);
    }
  }, [revertSnapshot, originalData, persistDiff]);
  useEffect(() => {
    if (!isDirty || loading || saving) return;
    if (revertSnapshot) {
      setRevertSnapshot(null);
      clearTimer(revertHideTimerRef);
    }
    clearTimer(autoSaveTimerRef);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      performAutoSave();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimer(autoSaveTimerRef);
  }, [gridData, isDirty, loading, saving, performAutoSave, revertSnapshot]);
  useEffect(() => {
    return () => {
      clearTimer(autoSaveTimerRef);
      clearTimer(revertHideTimerRef);
    };
  }, []);
  const getRowTotal = (contractId) => weekDates.reduce((sum, date) => sum + (gridData[cellKey(contractId, date)] || 0), 0);
  const getColumnTotal = (date) => activeContracts.reduce((sum, c) => sum + (gridData[cellKey(c.id, date)] || 0), 0);
  const getGrandTotal = () => {
    if (viewMode === "weekly") {
      return activeContracts.reduce((sum, c) => sum + getRowTotal(c.id), 0);
    }
    return Object.entries(gridData).reduce((sum, [key, val]) => {
      const { contractId } = parseCellKey(key);
      return activeContracts.some((c) => c.id === contractId) ? sum + (val || 0) : sum;
    }, 0);
  };
  const goToPrev = async () => {
    if (!await flushPendingAutoSave()) return;
    if (viewMode === "weekly") {
      setWeekStart((prev) => addDays(prev, -7));
    } else {
      setSelectedDay(null);
      setMonth((prev) => shiftMonth(prev, -1));
    }
  };
  const goToNext = async () => {
    if (!await flushPendingAutoSave()) return;
    if (viewMode === "weekly") {
      setWeekStart((prev) => addDays(prev, 7));
    } else {
      setSelectedDay(null);
      setMonth((prev) => shiftMonth(prev, 1));
    }
  };
  const goToToday = async () => {
    if (!await flushPendingAutoSave()) return;
    if (viewMode === "weekly") {
      setWeekStart(startOfWeek(todayIn()));
    } else {
      setSelectedDay(null);
      setMonth(monthOf(todayIn()));
    }
  };
  const handleViewModeChange = async (mode) => {
    if (mode === viewMode) return;
    if (!await flushPendingAutoSave()) return;
    if (mode === "monthly") {
      setMonth(monthOf(weekStart));
      setSelectedDay(null);
    } else {
      setWeekStart(startOfWeek({ ...month, day: 1 }));
    }
    setViewMode(mode);
    onViewChange?.(mode);
  };
  const handleKeyDown = (e, contractIdx, dayIdx) => {
    let targetContract = contractIdx;
    let targetDay = dayIdx;
    if (e.key === "ArrowUp") {
      targetContract = Math.max(0, contractIdx - 1);
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      targetContract = Math.min(activeContracts.length - 1, contractIdx + 1);
    } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      targetDay = Math.max(0, dayIdx - 1);
    } else if (e.key === "ArrowRight" && e.currentTarget.selectionEnd === e.currentTarget.value.length) {
      targetDay = Math.min(6, dayIdx + 1);
    } else {
      return;
    }
    e.preventDefault();
    const target = inputRefs.current[cellKey(activeContracts[targetContract].id, weekDates[targetDay])];
    target?.focus();
    target?.select();
  };
  const grandTotal = getGrandTotal();
  const showRevert = revertSnapshot && !isDirty && !saving;
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-6", className), children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        className: "mb-0",
        title,
        description: userFullName,
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            SegmentedControl,
            {
              "aria-label": "View",
              options: VIEW_OPTIONS,
              value: viewMode,
              onChange: (v) => handleViewModeChange(v)
            }
          ),
          showRevert ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { role: "status", className: "text-sm font-medium text-success-text", children: "Saved" }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: handleRevert, children: "Revert" })
          ] }) : isDirty || saving ? /* @__PURE__ */ jsx(Button, { type: "button", onClick: performAutoSave, disabled: saving || !isDirty, children: saving ? "Saving..." : "Save" }) : null
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      PeriodNav,
      {
        label: viewMode === "weekly" ? weekRangeLabel(weekStart) : monthLabel(month),
        onPrevious: goToPrev,
        onNext: goToNext,
        onToday: goToToday,
        previousLabel: viewMode === "weekly" ? "Previous week" : "Previous month",
        nextLabel: viewMode === "weekly" ? "Next week" : "Next month"
      }
    ),
    loading ? /* @__PURE__ */ jsx(Spinner, { label: "Loading timesheet...", className: "py-12" }) : loadError ? /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Failed to load time entries", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "mt-2", onClick: fetchEntries, children: "Try again" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        HoursSummary,
        {
          loggedHours: grandTotal,
          expectedHours: expectedHours ?? 0,
          ptoHours
        }
      ),
      viewMode === "weekly" ? /* @__PURE__ */ jsx(Card, { padding: "sm", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: cn(headClass, "min-w-[200px] px-3 text-left text-text-muted"), children: "Contract" }),
          weekDates.map((date, i) => /* @__PURE__ */ jsxs(
            TableHead,
            {
              className: cn(
                headClass,
                "w-[90px] text-center",
                date === today ? "bg-accent-muted text-accent-text" : i >= 5 ? "text-text-faint" : "text-text-muted"
              ),
              children: [
                /* @__PURE__ */ jsx("div", { children: WEEKDAY_LABELS[i] }),
                /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[10px] font-normal normal-case", children: formatCalendarDate(weekDays[i], { month: "short", day: "numeric" }) })
              ]
            },
            date
          )),
          /* @__PURE__ */ jsx(TableHead, { className: cn(headClass, "w-[70px] text-center text-text-muted"), children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          activeContracts.length === 0 && /* @__PURE__ */ jsx(TableEmptyRow, { colSpan: 9, children: "No active contracts for this week." }),
          activeContracts.map((contract, contractIdx) => {
            const rowTotal = getRowTotal(contract.id);
            return /* @__PURE__ */ jsxs(TableRow, { className: tableRowHoverClass, children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(ContractName, { contract }) }),
              weekDates.map((date, dayIdx) => {
                const key = cellKey(contract.id, date);
                const value = gridData[key];
                const isOutside = !contractCoversDay(contract, date);
                return /* @__PURE__ */ jsx(
                  TableCell,
                  {
                    className: cn("px-1 py-2", date === today && "bg-accent-muted"),
                    children: /* @__PURE__ */ jsx(
                      HoursInput,
                      {
                        ref: (el) => {
                          inputRefs.current[key] = el;
                        },
                        "aria-label": `Hours for ${contract.projectName} on ${dayLabel(date)}`,
                        value,
                        disabled: isOutside,
                        onValueChange: (next) => handleCellChange(contract.id, date, next),
                        onKeyDown: (e) => handleKeyDown(e, contractIdx, dayIdx),
                        placeholder: isOutside ? "" : "\u2013",
                        className: cn(dayIdx >= 5 && !value && "bg-surface")
                      }
                    )
                  },
                  date
                );
              }),
              /* @__PURE__ */ jsx(
                TableCell,
                {
                  className: cn(
                    "px-2 py-2 text-center font-medium tabular-nums",
                    rowTotal > 0 ? "text-text-primary" : "text-text-faint"
                  ),
                  children: rowTotal > 0 ? rowTotal : "\u2013"
                }
              )
            ] }, contract.id);
          })
        ] }),
        /* @__PURE__ */ jsx(TableFooter, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: cn(eyebrowClass, "px-3 py-3"), children: "Daily Total" }),
          weekDates.map((date) => {
            const colTotal = getColumnTotal(date);
            const isOver = colTotal > 24;
            return /* @__PURE__ */ jsxs(
              TableCell,
              {
                className: cn(
                  "px-2 py-3 text-center font-semibold tabular-nums",
                  date === today && "bg-accent-muted",
                  isOver ? "text-accent-text" : colTotal > 0 ? "text-text-primary" : "text-text-faint"
                ),
                title: isOver ? "More than 24 hours in a day" : void 0,
                children: [
                  colTotal > 0 ? colTotal : "\u2013",
                  isOver && " !"
                ]
              },
              date
            );
          }),
          /* @__PURE__ */ jsx(TableCell, { className: "px-2 py-3 text-center font-bold tabular-nums text-text-primary", children: grandTotal > 0 ? grandTotal : "\u2013" })
        ] }) })
      ] }) }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          MonthlyCalendarGrid,
          {
            month,
            gridData,
            contracts: activeContracts,
            timeOffs,
            today,
            selectedDay,
            onDaySelect: setSelectedDay,
            onClose: () => setSelectedDay(null),
            onCellChange: handleCellChange
          }
        ),
        selectedDay && selectedDayContracts.length > 1 && /* @__PURE__ */ jsx(
          DayDetailPanel,
          {
            selectedDay,
            contracts: selectedDayContracts,
            gridData,
            onCellChange: handleCellChange,
            onClose: () => setSelectedDay(null)
          }
        )
      ] }),
      timeOffs.length > 0 && /* @__PURE__ */ jsx(TimeOffList, { timeOffs, viewMode })
    ] })
  ] });
}
function TimeOffList({
  timeOffs,
  viewMode
}) {
  const fmt = (iso) => formatDateKey(iso, { weekday: "short", month: "short", day: "numeric" });
  return /* @__PURE__ */ jsxs(Card, { padding: "sm", children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        size: "sm",
        className: "mb-0 px-3 pb-3 pt-2",
        title: `Time off this ${viewMode === "weekly" ? "week" : "month"}`
      }
    ),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsx(TableRow, { children: ["Type", "From", "To"].map((h) => /* @__PURE__ */ jsx(TableHead, { children: h }, h)) }) }),
      /* @__PURE__ */ jsx(TableBody, { children: timeOffs.map((to) => /* @__PURE__ */ jsxs(TableRow, { className: "last:border-0", children: [
        /* @__PURE__ */ jsx(TableCell, { className: "text-text-primary", children: to.type }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-text-secondary", children: fmt(to.startsAt) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-text-secondary", children: fmt(to.endsAt) })
      ] }, to.id)) })
    ] })
  ] });
}

// src/lib/theme-script.ts
var THEME_STORAGE_KEY = "carbon-theme";
function themeScript({ defaultTheme = "dark" } = {}) {
  const fallback = defaultTheme === "light" ? "light" : "dark";
  return `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t="${fallback}";var c=document.documentElement.classList;c.remove("light","dark");c.add(t);}catch(e){}})();`;
}
var THEME_SCRIPT = themeScript();
function storedTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}
function applyTheme(theme) {
  const classList = document.documentElement.classList;
  classList.remove("light", "dark");
  classList.add(theme);
}
function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
var ThemeContext = createContext(null);
function ThemeProvider({
  children,
  initialTheme,
  defaultTheme,
  persist = true,
  onThemeChange
}) {
  const resolved = initialTheme === "light" || initialTheme === "dark";
  const [theme, setThemeState] = useState(
    resolved ? initialTheme : defaultTheme ?? "dark"
  );
  const onThemeChangeRef = useRef(onThemeChange);
  useEffect(() => {
    onThemeChangeRef.current = onThemeChange;
  }, [onThemeChange]);
  useEffect(() => {
    if (initialTheme === void 0) {
      const classList = document.documentElement.classList;
      if (classList.contains("light") || classList.contains("dark") || defaultTheme === void 0) {
        setThemeState(classList.contains("light") ? "light" : "dark");
        return;
      }
      const start2 = (persist ? storedTheme() : null) ?? defaultTheme;
      setThemeState(start2);
      applyTheme(start2);
      return;
    }
    const start = initialTheme === "system" ? systemTheme() : initialTheme;
    setThemeState(start);
    applyTheme(start);
  }, []);
  const setTheme = useCallback(
    (next) => {
      setThemeState(next);
      applyTheme(next);
      if (persist) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
        }
      }
      onThemeChangeRef.current?.(next);
    },
    [persist]
  );
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, resolved, setTheme, toggleTheme }, children });
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
function ThemeToggle({ className }) {
  const { theme, resolved, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";
  return /* @__PURE__ */ jsx(
    Button,
    {
      type: "button",
      variant: "outline",
      size: "icon",
      onClick: toggleTheme,
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      title: isDark ? "Switch to light mode" : "Switch to dark mode",
      className: cn("h-7 w-7 bg-surface-raised hover:border-carbon-600 hover:bg-surface-raised", className),
      children: mounted || resolved ? isDark ? /* @__PURE__ */ jsx(Sun, { size: 16, className: "text-amber-500", fill: "currentColor" }) : /* @__PURE__ */ jsx(Moon, { size: 16, className: "text-indigo-400", fill: "currentColor" }) : /* @__PURE__ */ jsx("span", { className: "h-4 w-4" })
    }
  );
}
function AccountCombobox({
  accounts,
  value,
  onChange,
  placeholder = "Search account\u2026",
  variant = "default",
  clearable = false,
  disabled = false,
  id,
  className
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const selected = accounts.find((a) => a.id === value);
  const filtered = useMemo(() => {
    if (!query) return accounts;
    const q = query.toLowerCase();
    return accounts.filter(
      (a) => a.accountNumber.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [accounts, query]);
  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);
  useEffect(() => {
    const el = listRef.current?.children[highlightIdx];
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);
  const selectAccount = useCallback(
    (accountId) => {
      onChange(accountId);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );
  const clear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange("");
      setQuery("");
      setIsOpen(false);
    },
    [onChange]
  );
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightIdx((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filtered[highlightIdx]) selectAccount(filtered[highlightIdx].id);
      e.preventDefault();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      setQuery("");
    }
  };
  const inputClasses = variant === "inline" ? cn(
    "h-7 rounded border-0 bg-transparent px-1 py-0 text-xs shadow-none focus-visible:ring-1",
    selected ? "text-text-primary" : "text-text-faint"
  ) : cn(clearable && selected && "pr-8", selected ? "text-text-primary" : "text-text-muted");
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        id,
        ref: inputRef,
        type: "text",
        role: "combobox",
        "aria-expanded": isOpen,
        "aria-autocomplete": "list",
        "data-1p-ignore": true,
        autoComplete: "off",
        disabled,
        value: isOpen ? query : selected ? `${selected.accountNumber} \u2014 ${selected.name}` : "",
        placeholder,
        onChange: (e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        },
        onFocus: () => {
          setIsOpen(true);
          setQuery("");
        },
        onBlur: () => setTimeout(() => setIsOpen(false), 150),
        onKeyDown: handleKeyDown,
        className: inputClasses
      }
    ),
    clearable && selected && !isOpen && variant === "default" && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": "Clear account",
        onClick: clear,
        className: "absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted hover:text-text-primary",
        children: /* @__PURE__ */ jsx(X, { size: 14 })
      }
    ),
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        ref: listRef,
        role: "listbox",
        className: cn(floatingSurfaceClass, "absolute left-0 top-full mt-1 max-h-60 w-full min-w-[18rem] overflow-y-auto p-1"),
        children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-2 py-1.5 text-xs text-text-faint", children: "No matching accounts" }) : filtered.slice(0, 50).map((a, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": a.id === value,
            onMouseDown: (e) => e.preventDefault(),
            onClick: () => selectAccount(a.id),
            className: cn(
              optionRowClass,
              "text-xs hover:bg-surface-overlay",
              i === highlightIdx && optionRowActiveClass,
              a.id === value && "text-accent-text"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { className: "shrink-0 font-[family-name:var(--font-mono)] text-accent-text", children: a.accountNumber }),
              /* @__PURE__ */ jsx("span", { className: "truncate text-text-primary", children: a.name })
            ]
          },
          a.id
        ))
      }
    )
  ] });
}
function MultiStatusFilter({
  label = "Status",
  options,
  selected,
  onChange,
  className
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const summary = useMemo(() => {
    if (selected.length === 0) return "All statuses";
    if (selected.length === options.length) return "All statuses";
    const labels = options.filter((o) => selectedSet.has(o.value)).map((o) => o.label);
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.length} selected`;
  }, [selected.length, options, selectedSet]);
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        type: "button",
        variant: "outline",
        "aria-label": `${label} filter`,
        className: cn(
          "justify-start bg-surface-raised font-normal hover:border-accent/50 hover:bg-surface-raised",
          className
        ),
        children: [
          /* @__PURE__ */ jsxs("span", { className: "text-text-muted", children: [
            label,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "max-w-[12rem] truncate", children: summary }),
          selected.length > 0 && selected.length < options.length && /* @__PURE__ */ jsx(Badge, { variant: "accent", className: "px-1.5 py-0 text-xs tabular-nums", children: selected.length }),
          /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(PopoverContent, { align: "end", className: "w-60 p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between px-1 pb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-text-muted", children: label }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "link",
              className: "h-auto p-0 text-xs font-normal disabled:opacity-40",
              disabled: selected.length === options.length,
              onClick: () => onChange(options.map((o) => o.value)),
              children: "All"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "link",
              className: "h-auto p-0 text-xs font-normal text-text-muted disabled:opacity-40",
              disabled: selected.length === 0,
              onClick: () => onChange([]),
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        CheckboxGroup,
        {
          "aria-label": label,
          orientation: "vertical",
          options,
          value: selected,
          onChange,
          className: "max-h-72 overflow-y-auto"
        }
      )
    ] })
  ] });
}

// src/lib/google-places.ts
var GOOGLE_MAPS_SCRIPT_ID = "carbon-google-maps";
var GOOGLE_MAPS_LOAD_TIMEOUT_MS = 1e4;
var placesLibraryPromise = null;
function getApiKey2() {
  const viteEnv = import.meta.env;
  const nodeEnv = globalThis.process?.env;
  return viteEnv?.VITE_GOOGLE_MAPS_API_KEY ?? nodeEnv?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}
function hasGoogleImporter() {
  const maps = window.google?.maps;
  return typeof maps?.importLibrary === "function";
}
function removeOwnedScript() {
  const script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
  if (script?.dataset.carbonOwned === "true") script.remove();
}
function waitForGoogleMaps() {
  if (hasGoogleImporter()) return Promise.resolve();
  const key = getApiKey2();
  if (!key) return Promise.reject(new Error("Google address suggestions are not configured"));
  return new Promise((resolve, reject) => {
    let script = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      if (error) {
        removeOwnedScript();
        reject(error);
      } else {
        resolve();
      }
    };
    const handleLoad = () => {
      if (hasGoogleImporter()) finish();
      else finish(new Error("Google Maps loaded without the Places library"));
    };
    const handleError = () => finish(new Error("Google Maps could not be loaded"));
    const timeout = window.setTimeout(
      () => finish(new Error("Google Maps took too long to load")),
      GOOGLE_MAPS_LOAD_TIMEOUT_MS
    );
    if (!script) {
      script = document.createElement("script");
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.dataset.carbonOwned = "true";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
      script.async = true;
    }
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!script.isConnected) document.head.appendChild(script);
    if (hasGoogleImporter()) finish();
  });
}
function loadGooglePlacesLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Places is only available in a browser"));
  }
  if (placesLibraryPromise) return placesLibraryPromise;
  placesLibraryPromise = waitForGoogleMaps().then(() => window.google.maps.importLibrary("places")).catch((error) => {
    placesLibraryPromise = null;
    throw error;
  });
  return placesLibraryPromise;
}

// src/components/ui/postal-address.ts
var EMPTY_POSTAL_ADDRESS = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US"
};
function postalAddressToDraft(address) {
  return address ? { ...address, addressLine2: address.addressLine2 ?? "" } : { ...EMPTY_POSTAL_ADDRESS };
}
function postalAddressFromDraft(address) {
  if (!address.addressLine1.trim()) return null;
  return {
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim() || null,
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim().toUpperCase() || "US"
  };
}
function isPostalAddressDraftComplete(address) {
  return Boolean(
    address.addressLine1.trim() && address.city.trim() && /^[A-Za-z]{2}$/.test(address.state.trim()) && /^\d{5}(?:-\d{4})?$/.test(address.postalCode.trim()) && address.country.trim()
  );
}
function component(components, type, short = false) {
  const found = components.find((item) => item.types.includes(type));
  return (short ? found?.shortText : found?.longText) ?? "";
}
function parseGooglePlaceAddress(place) {
  const components = place.addressComponents;
  if (!components) return null;
  const street = [component(components, "street_number"), component(components, "route")].filter(Boolean).join(" ");
  const city = component(components, "locality") || component(components, "postal_town") || component(components, "sublocality_level_1");
  const postalCode = component(components, "postal_code");
  const postalSuffix = component(components, "postal_code_suffix");
  return {
    addressLine1: street,
    addressLine2: component(components, "subpremise"),
    city,
    state: component(components, "administrative_area_level_1", true),
    postalCode: postalSuffix ? `${postalCode}-${postalSuffix}` : postalCode,
    country: component(components, "country", true) || "US"
  };
}

// src/lib/address-suggestions.ts
async function fetchAddressSuggestions(provider, query, signal) {
  const controller = new AbortController();
  let rejectCancellation;
  const cancelled = new Promise((_, reject) => {
    rejectCancellation = reject;
  });
  const cancel = () => {
    controller.abort();
    rejectCancellation(new Error("Address lookup cancelled"));
  };
  signal.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(cancel, 1e4);
  try {
    if (signal.aborted) {
      cancel();
      return await cancelled;
    }
    const result = await Promise.race([
      Promise.resolve().then(
        () => provider(query, { signal: controller.signal })
      ),
      cancelled
    ]);
    return result.slice(0, 5);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}
var SEARCH_DELAY_MS = 250;
var MIN_QUERY_LENGTH = 3;
var STAFF_INPUT_CLASS = "h-9 py-0";
var VENDOR_INPUT_CLASS = "h-10 py-0 shadow-none focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500";
function predictionText(prediction) {
  return {
    main: prediction.mainText?.toString() || prediction.text.toString(),
    secondary: prediction.secondaryText?.toString() || ""
  };
}
function AddressAutocomplete2({
  id,
  value,
  onChange,
  onAddressSelect,
  onSelect,
  onStatusChange,
  fetchSuggestions,
  attribution,
  showStatus = true,
  disabled = false,
  onBlur,
  placeholder = "Start typing an address...",
  className,
  variant = "staff",
  ariaLabel = "Address search",
  required = false,
  autoComplete = "street-address"
}) {
  const generatedId = useId().replaceAll(":", "");
  const inputId = id ?? `address-${generatedId}`;
  const listId = `${inputId}-suggestions`;
  const statusId = `${inputId}-status`;
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchActive, setSearchActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const requestSequence = useRef(0);
  const sessionToken = useRef(null);
  const suppressNextSearch = useRef(false);
  const blurTimer = useRef(null);
  const activeRequest = useRef(null);
  const statusCallback = useRef(onStatusChange);
  statusCallback.current = onStatusChange;
  useEffect(() => {
    statusCallback.current?.(status);
  }, [status]);
  useEffect(
    () => () => {
      requestSequence.current += 1;
      if (blurTimer.current !== null) window.clearTimeout(blurTimer.current);
    },
    []
  );
  useEffect(() => {
    const query = value.trim();
    const sequence = ++requestSequence.current;
    const controller = new AbortController();
    activeRequest.current = controller;
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false;
      setSuggestions([]);
      setStatus("idle");
      return;
    }
    if (disabled || !searchActive || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setActiveIndex(-1);
      setStatus("idle");
      return;
    }
    const timer = window.setTimeout(() => {
      if (requestSequence.current !== sequence || controller.signal.aborted)
        return;
      setStatus("loading");
      void (async () => {
        if (fetchSuggestions)
          return [
            ...await fetchAddressSuggestions(
              fetchSuggestions,
              query,
              controller.signal
            )
          ];
        const places = await loadGooglePlacesLibrary();
        if (requestSequence.current !== sequence) return [];
        if (!sessionToken.current)
          sessionToken.current = new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ["us"],
          region: "us",
          sessionToken: sessionToken.current
        });
        return response.suggestions.flatMap(
          (item) => item.placePrediction ? [
            {
              id: item.placePrediction.placeId,
              address: item.placePrediction.text.toString(),
              secondaryText: item.placePrediction.secondaryText?.toString(),
              prediction: item.placePrediction
            }
          ] : []
        );
      })().then((result) => {
        if (requestSequence.current !== sequence) return;
        setSuggestions(result);
        setActiveIndex(-1);
        setStatus("ready");
      }).catch(() => {
        if (requestSequence.current !== sequence) return;
        setSuggestions([]);
        setActiveIndex(-1);
        setStatus("unavailable");
      });
    }, SEARCH_DELAY_MS);
    return () => {
      controller.abort();
      requestSequence.current += 1;
      window.clearTimeout(timer);
    };
  }, [retryAttempt, searchActive, value, disabled, fetchSuggestions]);
  const selectSuggestion = async (suggestion) => {
    const prediction = suggestion.prediction;
    if (!prediction) {
      requestSequence.current += 1;
      suppressNextSearch.current = true;
      setSuggestions([]);
      setActiveIndex(-1);
      setSearchActive(false);
      setStatus("idle");
      onChange(suggestion.address);
      onSelect?.(suggestion.address);
      return;
    }
    const sequence = ++requestSequence.current;
    setSuggestions([]);
    setActiveIndex(-1);
    setStatus("loading");
    try {
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["addressComponents", "formattedAddress"]
      });
      if (requestSequence.current !== sequence) return;
      const parsed = parseGooglePlaceAddress(place);
      suppressNextSearch.current = true;
      if (parsed && onAddressSelect) onAddressSelect(parsed);
      else onChange(place.formattedAddress || prediction.text.toString());
      onSelect?.(place.formattedAddress || prediction.text.toString());
      sessionToken.current = null;
      setSearchActive(false);
      setStatus("idle");
    } catch {
      if (requestSequence.current !== sequence) return;
      setStatus("unavailable");
    }
  };
  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (!suggestions.length) {
      if (event.key === "Escape") setSearchActive(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => current <= 0 ? suggestions.length - 1 : current - 1
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSuggestions([]);
      setActiveIndex(-1);
      setSearchActive(false);
    }
  };
  const vendor = variant === "vendor";
  const scopeClass = variant === "public" ? "dark" : vendor ? "light" : void 0;
  const inputClass = vendor ? VENDOR_INPUT_CLASS : STAFF_INPUT_CLASS;
  const optionsVisible = !disabled && searchActive && suggestions.length > 0;
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", scopeClass), children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        id: inputId,
        type: "text",
        value,
        onChange: (event) => {
          requestSequence.current += 1;
          activeRequest.current?.abort();
          setSuggestions([]);
          setActiveIndex(-1);
          setStatus("idle");
          onChange(event.target.value);
          setSearchActive(true);
        },
        onFocus: () => setSearchActive(true),
        onBlur: () => {
          requestSequence.current += 1;
          activeRequest.current?.abort();
          onBlur?.();
          blurTimer.current = window.setTimeout(() => {
            setSearchActive(false);
            setSuggestions([]);
            setActiveIndex(-1);
            sessionToken.current = null;
            requestSequence.current += 1;
          }, 0);
        },
        onKeyDown: handleKeyDown,
        placeholder,
        "aria-label": ariaLabel,
        "aria-autocomplete": "list",
        "aria-controls": listId,
        "aria-describedby": !showStatus || status === "idle" ? void 0 : statusId,
        "aria-expanded": optionsVisible,
        "aria-activedescendant": optionsVisible && activeIndex >= 0 ? `${listId}-${activeIndex}` : void 0,
        role: "combobox",
        disabled,
        required,
        autoComplete,
        className: cn(inputClass, className)
      }
    ),
    optionsVisible && /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          floatingSurfaceClass,
          "absolute left-0 right-0 top-full z-[70] mt-1 overflow-hidden text-text-primary"
        ),
        children: [
          /* @__PURE__ */ jsx(
            "ul",
            {
              id: listId,
              role: "listbox",
              "aria-label": "Address suggestions",
              className: "max-h-60 overflow-y-auto py-1",
              children: suggestions.map((suggestion, index) => {
                const text = suggestion.prediction ? predictionText(suggestion.prediction) : {
                  main: suggestion.address,
                  secondary: suggestion.secondaryText ?? ""
                };
                return /* @__PURE__ */ jsxs(
                  "li",
                  {
                    id: `${listId}-${index}`,
                    role: "option",
                    "aria-selected": activeIndex === index,
                    className: cn(
                      "cursor-pointer px-3 py-2 text-sm",
                      activeIndex === index && (vendor ? "bg-emerald-50" : optionRowActiveClass)
                    ),
                    onMouseDown: (event) => event.preventDefault(),
                    onMouseEnter: () => setActiveIndex(index),
                    onClick: () => void selectSuggestion(suggestion),
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "block font-medium", children: text.main }),
                      text.secondary && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-text-muted", children: text.secondary })
                    ]
                  },
                  suggestion.id
                );
              })
            }
          ),
          (!fetchSuggestions || attribution) && /* @__PURE__ */ jsx("div", { className: "flex justify-end border-t px-3 py-1.5", children: fetchSuggestions ? attribution : /* @__PURE__ */ jsx(
            "img",
            {
              src: "https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png",
              alt: "Powered by Google",
              className: "h-[14px] w-auto"
            }
          ) })
        ]
      }
    ),
    showStatus && /* @__PURE__ */ jsxs(
      "div",
      {
        id: statusId,
        role: "status",
        "aria-live": "polite",
        className: "mt-1 text-xs text-text-muted",
        children: [
          status === "loading" && "Finding addresses\u2026",
          status === "ready" && !suggestions.length && value.trim().length >= MIN_QUERY_LENGTH && "No matches. Continue entering the address manually.",
          status === "unavailable" && /* @__PURE__ */ jsxs("span", { children: [
            "Address suggestions are unavailable. Continue entering the address manually.",
            " ",
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "link",
                className: cn(
                  "inline h-auto p-0 text-xs underline",
                  vendor ? "text-emerald-700" : "text-accent-text"
                ),
                onMouseDown: (event) => event.preventDefault(),
                onClick: () => {
                  sessionToken.current = null;
                  setSearchActive(true);
                  setRetryAttempt((attempt) => attempt + 1);
                },
                children: "Retry"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function StructuredAddressInput({
  value,
  onChange,
  variant = "staff",
  idPrefix,
  required = false
}) {
  const vendor = variant === "vendor";
  const inputClass = vendor ? VENDOR_INPUT_CLASS : STAFF_INPUT_CLASS;
  const update = (field, next) => onChange({ ...value, [field]: next });
  return /* @__PURE__ */ jsxs("div", { className: cn("grid grid-cols-1 gap-3 sm:grid-cols-6", vendor && "light"), children: [
    /* @__PURE__ */ jsx(
      FormField,
      {
        className: "sm:col-span-4",
        label: "Street address",
        htmlFor: `${idPrefix}-line1`,
        required,
        children: /* @__PURE__ */ jsx(
          AddressAutocomplete2,
          {
            id: `${idPrefix}-line1`,
            value: value.addressLine1,
            onChange: (next) => update("addressLine1", next),
            onAddressSelect: onChange,
            variant: vendor ? "vendor" : "staff",
            ariaLabel: "Street address",
            placeholder: "Start typing or enter manually",
            required,
            autoComplete: "address-line1"
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(FormField, { className: "sm:col-span-2", label: "Apartment or suite", htmlFor: `${idPrefix}-line2`, children: /* @__PURE__ */ jsx(
      Input,
      {
        id: `${idPrefix}-line2`,
        className: inputClass,
        value: value.addressLine2,
        onChange: (event) => update("addressLine2", event.target.value),
        autoComplete: "address-line2"
      }
    ) }),
    /* @__PURE__ */ jsx(FormField, { className: "sm:col-span-3", label: "City", htmlFor: `${idPrefix}-city`, required, children: /* @__PURE__ */ jsx(
      Input,
      {
        id: `${idPrefix}-city`,
        className: inputClass,
        value: value.city,
        onChange: (event) => update("city", event.target.value),
        autoComplete: "address-level2",
        required
      }
    ) }),
    /* @__PURE__ */ jsx(FormField, { className: "sm:col-span-1", label: "State", htmlFor: `${idPrefix}-state`, required, children: /* @__PURE__ */ jsx(
      Input,
      {
        id: `${idPrefix}-state`,
        className: inputClass,
        value: value.state,
        onChange: (event) => update("state", event.target.value.toUpperCase()),
        autoComplete: "address-level1",
        maxLength: 2,
        required
      }
    ) }),
    /* @__PURE__ */ jsx(FormField, { className: "sm:col-span-2", label: "ZIP code", htmlFor: `${idPrefix}-postal`, required, children: /* @__PURE__ */ jsx(
      Input,
      {
        id: `${idPrefix}-postal`,
        className: inputClass,
        value: value.postalCode,
        onChange: (event) => update("postalCode", event.target.value),
        autoComplete: "postal-code",
        inputMode: "numeric",
        required
      }
    ) }),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "country", value: value.country || "US" })
  ] });
}

export { AccountCombobox, AddressAutocomplete, AddressAutocomplete2 as AddressCombobox, Alert, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, BarChart, Button, CATEGORICAL_PALETTE, CHART_GRID_COLOR, CHART_LABEL_STYLE, CHART_NEUTRAL_COLOR, CHART_SERIES_LIMIT, CHART_TICK_CATEGORY, CHART_TICK_VALUE, Card, CardHeader, CategoryChip, ChartCard, ChartDataTable, ChartEmpty, ChartLegend, ChartSkeleton, ChartSliceTooltipContent, ChartTooltipContent, Checkbox, CheckboxGroup, CommandGroup, CommandItem, CommandPalette, ConfirmProvider, DataTable, DateRangePicker, DefinitionItem, DefinitionList, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DonutChart, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, EMPTY_POSTAL_ADDRESS, EmptyState, EventCalendar, FileViewer, FilterBar, FormField, HoverCard, HoverCardContent, HoverCardTrigger, Input, Label, LineChart, MAX_CHIP_SEGMENTS, Money, MoneyInput, MonthCalendar, MultiSelect, MultiStatusFilter, NEUTRAL_CATEGORICAL_COLOR, OVERFLOW_SEGMENT_COLOR, PageHeader, Pagination, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, ProductMark, Progress, RICH_TEXT_EXTENDED_TAGS, RICH_TEXT_IMAGE_TAGS, RICH_TEXT_TAGS, RichTextEditor, ScrollArea, SearchSelect, SegmentedControl, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Separator2 as Separator, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, Spinner, StatCard, StatusBadge, StatusIndicator, StructuredAddressInput, Swatch, Switch, THEME_SCRIPT, Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Tag, TextLink, Textarea, ThemeProvider, ThemeToggle, TimesheetTable, ToastProvider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, WEEKDAY_LABELS, addDays, alertVariants, badgeVariants, buttonVariants, capSeries, cardVariants, cn, compareMonths, createDefaultApi, dateKey, daysInMonth, formatCalendarDate, formatChartValue, formatDate, formatDateKey, formatMoney, formatPeriodLabel, getCategoricalColor, getCategoricalSegments, isAllowedEditorHref, isPostalAddressDraftComplete, isRichTextEmpty, isWeekend, linkHrefErrorMessage, monthLabel, monthOfKey, monthWeeks, normalizeLinkHref, parseDateKey, parseGooglePlaceAddress, postalAddressFromDraft, postalAddressToDraft, resolveSeriesColors, richTextTags, safeHref, sanitizeRichText, seriesColor, shiftMonth, startOfWeek, themeScript, toast, todayIn, useConfirm, useTheme, useToast, weekdayOf };
