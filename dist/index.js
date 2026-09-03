"use client";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as React from 'react';
import { forwardRef, createContext, useState, useCallback, useRef, useEffect, useMemo, useContext, useId } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Check, ChevronDown, X, Bold, Italic, List, ListOrdered, Link2, ArrowUpDown, ChevronLeft, ChevronRight, Search, Sun, Moon } from 'lucide-react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { createPortal } from 'react-dom';
import { Command } from 'cmdk';
import { ResponsiveContainer, BarChart as BarChart$1, CartesianGrid, XAxis, YAxis, Tooltip as Tooltip$1, Bar, Cell, LabelList, AreaChart, ReferenceLine, Area, PieChart, Pie } from 'recharts';

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
  const baseClass = variant === "public" ? "flex h-9 w-full rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500" : "flex h-8 w-full rounded-md border border-border bg-surface-raised px-3 py-1 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value,
      onChange: (e) => onChange(e.target.value),
      onBlur,
      placeholder,
      className: cn(baseClass, className)
    }
  );
}
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-carbon-950 hover:bg-accent-hover",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
        link: "text-accent-text underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
        icon: "h-8 w-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
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
        success: "bg-success-soft text-success-text",
        warning: "bg-accent-muted text-accent-text",
        error: "bg-error-soft text-error-text",
        info: "bg-info-soft text-info-text"
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
var Input = forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-8 w-full rounded-md border border-border bg-surface-raised px-3 py-1 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
var Textarea = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  id,
  ariaLabel,
  invalid = false
}) {
  const editorRef = useRef(null);
  const lastEmitted = useRef(null);
  const [active, setActive] = useState({
    bold: false,
    italic: false,
    unordered: false,
    ordered: false
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const savedRange = useRef(null);
  const empty = isRichTextEmpty(value);
  const exec = useCallback((command, argument) => {
    if (typeof document === "undefined" || typeof document.execCommand !== "function") {
      return false;
    }
    try {
      document.execCommand("styleWithCSS", false, "false");
      return document.execCommand(command, false, argument);
    } catch {
      return false;
    }
  }, []);
  const queryState = useCallback((command) => {
    if (typeof document === "undefined" || typeof document.queryCommandState !== "function") {
      return false;
    }
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);
  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }, [onChange]);
  const selectionInside = useCallback(() => {
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
      ordered: queryState("insertOrderedList")
    });
  }, [queryState, selectionInside]);
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    if (el.innerHTML !== value) el.innerHTML = value;
    lastEmitted.current = value;
  }, [value]);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);
  const runCommand = useCallback(
    (command) => {
      editorRef.current?.focus();
      exec(command);
      emit();
      refreshActive();
    },
    [emit, exec, refreshActive]
  );
  const hrefAtCaret = useCallback(() => {
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
    savedRange.current = selectionInside() && selection ? selection.getRangeAt(0).cloneRange() : null;
    setLinkValue(hrefAtCaret() ?? "https://");
    setLinkOpen(true);
  }, [hrefAtCaret, selectionInside]);
  const closeLink = useCallback(() => {
    setLinkOpen(false);
    setLinkValue("");
    savedRange.current = null;
    editorRef.current?.focus();
  }, []);
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
    if (selection?.isCollapsed !== false) {
      const escaped = pendingHref.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
    (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      if (text) exec("insertText", text);
      emit();
    },
    [emit, exec]
  );
  const handleKeyDown = useCallback(
    (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openLink();
      }
    },
    [openLink]
  );
  const toolbarButtons = [
    { key: "bold", label: "Bold", icon: Bold, command: "bold", on: active.bold },
    { key: "italic", label: "Italic", icon: Italic, command: "italic", on: active.italic },
    {
      key: "unordered",
      label: "Bulleted list",
      icon: List,
      command: "insertUnorderedList",
      on: active.unordered
    },
    {
      key: "ordered",
      label: "Numbered list",
      icon: ListOrdered,
      command: "insertOrderedList",
      on: active.ordered
    }
  ];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "overflow-hidden rounded-md border bg-surface-raised shadow-sm transition-colors focus-within:ring-2 focus-within:ring-accent/50",
        invalid ? "border-error-border" : "border-border",
        disabled && "opacity-50"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "toolbar",
            "aria-label": "Formatting",
            "aria-controls": id,
            className: "flex items-center gap-0.5 border-b border-border-subtle bg-surface px-1.5 py-1",
            children: linkOpen ? /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center gap-1.5 py-0.5", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  autoFocus: true,
                  value: linkValue,
                  "aria-label": "Link address",
                  "aria-invalid": pendingHref === null,
                  placeholder: "https://",
                  className: "h-7 text-xs",
                  onChange: (event) => setLinkValue(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyLink();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeLink();
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  "aria-label": "Apply link",
                  disabled: pendingHref === null,
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: applyLink,
                  children: /* @__PURE__ */ jsx(Check, { size: 13 })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  "aria-label": "Remove link",
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: removeLink,
                  children: /* @__PURE__ */ jsx(Link2, { size: 13, className: "text-text-muted" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  "aria-label": "Cancel link",
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: closeLink,
                  children: /* @__PURE__ */ jsx(X, { size: 13 })
                }
              )
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              toolbarButtons.map(({ key, label, icon: Icon2, command, on }) => /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  "aria-label": label,
                  "aria-pressed": on,
                  disabled,
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: () => runCommand(command),
                  className: cn("h-7 w-7", on && "bg-accent-muted text-accent-text"),
                  children: /* @__PURE__ */ jsx(Icon2, { size: 13 })
                },
                key
              )),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  "aria-label": "Link",
                  disabled,
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: openLink,
                  className: "h-7 w-7",
                  children: /* @__PURE__ */ jsx(Link2, { size: 13 })
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          empty && placeholder && // The usual `:empty::before` trick does not work: a contenteditable
          // somebody has typed in and cleared holds `<p><br></p>`, which is not
          // empty. `isRichTextEmpty` is the same check the consumer uses to
          // decide between the note and its empty state.
          /* @__PURE__ */ jsx(
            "p",
            {
              "aria-hidden": "true",
              className: "pointer-events-none absolute left-3 top-2 text-sm text-text-muted",
              children: placeholder
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: editorRef,
              id,
              role: "textbox",
              "aria-label": ariaLabel,
              "aria-multiline": "true",
              "aria-invalid": invalid || void 0,
              contentEditable: !disabled,
              suppressContentEditableWarning: true,
              onInput: emit,
              onBlur: emit,
              onPaste: handlePaste,
              onKeyUp: refreshActive,
              onMouseUp: refreshActive,
              onKeyDown: handleKeyDown,
              className: cn(
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
                className
              )
            }
          )
        ] })
      ]
    }
  );
}
var Checkbox = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded border border-border bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-carbon-950",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 }) })
  }
));
Checkbox.displayName = "Checkbox";
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
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = "Switch";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
var SelectContent = forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
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
var SelectItem = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-text-secondary outline-none focus:bg-surface-overlay focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { size: 12 }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = "SelectItem";
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogClose = DialogPrimitive.Close;
var DialogPortal = DialogPrimitive.Portal;
var DialogOverlay = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
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
function DialogTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx("h2", { className: cn("text-lg font-semibold text-text-primary", className), ...props });
}
function DialogDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx("p", { className: cn("text-sm text-text-muted", className), ...props });
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mt-6 flex shrink-0 justify-end gap-2", className), ...props });
}
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPrimitive.Portal, { children: [
  /* @__PURE__ */ jsx(AlertDialogPrimitive.Overlay, { className: "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = "AlertDialogContent";
function AlertDialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mb-4 space-y-1", className), ...props });
}
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
function AlertDialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("mt-6 flex justify-end gap-2", className), ...props });
}
var AlertDialogAction = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
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
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuContent = forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface-raised p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = "DropdownMenuContent";
var DropdownMenuItem = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary outline-none transition-colors focus:bg-surface-overlay focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
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
var Sheet = DialogPrimitive.Root;
var SheetTrigger = DialogPrimitive.Trigger;
var SheetClose = DialogPrimitive.Close;
var SheetPortal = DialogPrimitive.Portal;
var SheetOverlay = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
SheetOverlay.displayName = "SheetOverlay";
var SheetContent = forwardRef(
  ({ className, children, side = "right", ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
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
          /* @__PURE__ */ jsx(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
        ]
      }
    )
  ] })
);
SheetContent.displayName = "SheetContent";
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("border-b border-border px-6 py-4", className), ...props });
}
function SheetTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx("h2", { className: cn("text-lg font-semibold text-text-primary", className), ...props });
}
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
var Progress = forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-overlay", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full bg-accent transition-all",
        style: { width: `${value ?? 0}%` }
      }
    )
  }
));
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
    className: cn(
      "z-50 w-72 rounded-lg border border-border bg-surface-raised p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = "PopoverContent";
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
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { toast: addToast }, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2", children: toasts.map((t) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex w-80 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right",
          t.variant === "error" ? "border-error-border bg-error-soft" : t.variant === "success" ? "border-success-border bg-success-soft" : "border-border bg-surface-raised"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-text-primary", children: t.title }),
            t.description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-text-muted", children: t.description })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => removeToast(t.id),
              className: "text-text-muted hover:text-text-primary",
              children: /* @__PURE__ */ jsx(X, { size: 14 })
            }
          )
        ]
      },
      t.id
    )) })
  ] });
}
function EmptyState({ icon, title, description, action, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center py-16 text-center", className), children: [
    icon && /* @__PURE__ */ jsx("div", { className: "mb-4 text-text-faint", children: icon }),
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-primary", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-sm text-sm text-text-muted", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-4", children: action })
  ] });
}
function PageHeader({ title, description, actions, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-6 flex items-start justify-between", className), children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-[family-name:var(--font-display)] text-2xl text-text-primary", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-text-muted", children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: actions })
  ] });
}
var UNSET = /* @__PURE__ */ Symbol("DataTable.resetPageOn.unset");
function DataTable({
  columns,
  data,
  onRowClick,
  pageSize = 25,
  enableSelection = false,
  emptyMessage = "No results.",
  resetPageOn = UNSET
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const driven = resetPageOn !== UNSET;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    // Hand the reset over to the effect below only when the caller opted in, so the
    // default stays exactly TanStack's.
    autoResetPageIndex: !driven,
    state: { sorting, columnFilters, rowSelection },
    initialState: { pagination: { pageSize } }
  });
  const seen = useRef(resetPageOn);
  useEffect(() => {
    if (!driven || Object.is(seen.current, resetPageOn)) return;
    seen.current = resetPageOn;
    table.setPageIndex(0);
  }, [driven, resetPageOn, table]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx("tr", { className: "border-b border-border", children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
        "th",
        {
          className: cn(
            "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted",
            header.column.getCanSort() && "cursor-pointer select-none"
          ),
          onClick: header.column.getToggleSortingHandler(),
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()),
            header.column.getCanSort() && /* @__PURE__ */ jsx(ArrowUpDown, { size: 12, className: "text-text-faint" })
          ] })
        },
        header.id
      )) }, headerGroup.id)) }),
      /* @__PURE__ */ jsx("tbody", { children: table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
        "tr",
        {
          className: cn(
            "border-b border-border-subtle transition-colors last:border-0",
            onRowClick && "cursor-pointer hover:bg-surface-overlay",
            row.getIsSelected() && "bg-accent-muted"
          ),
          onClick: () => onRowClick?.(row.original),
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-text-secondary", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
        },
        row.id
      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length, className: "px-3 py-8 text-center text-text-muted", children: emptyMessage }) }) })
    ] }) }),
    table.getPageCount() > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1 pt-3", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-text-muted", children: [
        table.getFilteredRowModel().rows.length,
        " row(s)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "px-2 text-xs text-text-secondary", children: [
          table.getState().pagination.pageIndex + 1,
          " / ",
          table.getPageCount()
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => table.nextPage(),
            disabled: !table.getCanNextPage(),
            children: /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
          }
        )
      ] })
    ] })
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
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  const abs = Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `(${abs})` : abs;
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
        "input",
        {
          ref,
          type: "text",
          inputMode: "decimal",
          className: cn(
            "flex h-8 w-full rounded-md border border-border bg-surface-raised py-1 pl-7 pr-3 text-right font-[family-name:var(--font-mono)] text-sm tabular-nums text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
            className
          ),
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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
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
          className: "fixed inset-0 bg-black/60",
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
      className: "[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-faint",
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
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors",
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
  loading = false,
  placeholder = "Search...",
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
  autoFocus = false
}) {
  const [open, setOpen] = useState(autoFocus);
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
  const selectedOption = options.find((o) => o.value === value);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    setActiveIndex(-1);
  }, [options]);
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
            openList(options.length ? 0 : -1);
            return;
          }
          if (options.length === 0) return;
          setActiveIndex((i) => (i + 1) % options.length);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            openList(options.length ? options.length - 1 : -1);
            return;
          }
          if (options.length === 0) return;
          setActiveIndex((i) => i <= 0 ? options.length - 1 : i - 1);
          break;
        }
        case "Enter": {
          if (open && activeIndex >= 0 && options[activeIndex]) {
            e.preventDefault();
            handleSelect(options[activeIndex].value);
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
    [open, options, activeIndex, openList, closeList, handleSelect]
  );
  return /* @__PURE__ */ jsxs("div", { ref, onBlur: handleBlur, className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        id,
        type: "button",
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-label": ariaLabel,
        "aria-describedby": required ? requiredHintId : void 0,
        "aria-controls": open ? listboxId : void 0,
        onKeyDown: handleKeyDown,
        onClick: () => open ? closeList() : openList(-1),
        className: cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-border bg-surface-raised px-3 text-sm transition-colors hover:border-text-faint focus:outline-none focus:ring-2 focus:ring-accent/50",
          triggerClassName
        ),
        children: [
          /* @__PURE__ */ jsx("span", { className: selectedOption ? "text-text-primary" : "text-text-muted", children: selectedOption?.label ?? placeholder }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            clearable && value && /* @__PURE__ */ jsx(
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
    open && /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] rounded-lg border border-border bg-surface-raised shadow-lg",
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
          /* @__PURE__ */ jsx("div", { ref: listRef, role: "listbox", id: listboxId, className: "max-h-60 overflow-y-auto py-1", children: loading ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-text-muted", children: "Searching..." }) : options.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-text-muted", children: "No results" }) : options.map((option, i) => /* @__PURE__ */ jsx(
            "button",
            {
              id: optionId(i),
              role: "option",
              "aria-selected": option.value === value,
              type: "button",
              tabIndex: -1,
              onClick: () => handleSelect(option.value),
              onMouseEnter: () => setActiveIndex(i),
              className: cn(
                "flex w-full items-center px-3 py-1.5 text-left text-sm text-text-primary transition-colors hover:bg-surface-overlay",
                i === activeIndex && "bg-surface-overlay",
                option.value === value && "bg-accent-muted text-accent-text",
                optionClassName
              ),
              children: renderOption ? renderOption(option) : /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { children: option.label }),
                option.sublabel && /* @__PURE__ */ jsx("div", { className: "text-xs text-text-muted", children: option.sublabel })
              ] })
            },
            option.value
          )) })
        ]
      }
    )
  ] });
}
function Money({ value, colorNegative, className, ...props }) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isNegative = typeof num === "number" && !isNaN(num) && num < 0;
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "font-[family-name:var(--font-mono)] tabular-nums",
        colorNegative && isNegative && "text-error",
        className
      ),
      ...props,
      children: formatMoney(value)
    }
  );
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
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-1", className), children: [
    /* @__PURE__ */ jsxs("label", { htmlFor, className: "block text-xs font-medium text-text-muted", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "ml-0.5 text-error", children: "*" })
    ] }),
    children,
    error ? /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error }) : hint ? /* @__PURE__ */ jsx("p", { className: "text-xs text-text-faint", children: hint }) : null
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
          className: "pl-9"
        }
      )
    ] }),
    children
  ] });
}
function StatCard({ label, value, sub, trend, loading, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("rounded-lg border border-border-subtle bg-surface p-4", className), children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium uppercase tracking-widest text-text-faint", children: label }),
    loading ? /* @__PURE__ */ jsx(Skeleton, { className: "mt-2 h-7 w-24" }) : /* @__PURE__ */ jsx("p", { className: "mt-1 font-[family-name:var(--font-mono)] text-2xl font-semibold tracking-tight text-text-primary", children: value }),
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
    )
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
  return /* @__PURE__ */ jsxs("div", { className: cn("rounded-lg border border-border-subtle bg-surface p-4", className), children: [
    (title || subtitle || action) && /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        title && /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-primary", children: title }),
        subtitle && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-text-secondary", children: subtitle })
      ] }),
      action && /* @__PURE__ */ jsx("div", { className: "shrink-0", children: action })
    ] }),
    children,
    footer && /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-text-secondary", children: footer })
  ] });
}
function ChartLegend({ items, onItemClick, className }) {
  return /* @__PURE__ */ jsx("ul", { className: cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className), children: items.map((item, i) => {
    const content = /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: "size-2 shrink-0 rounded-full",
          style: { backgroundColor: item.color, opacity: item.inactive ? 0.35 : 1 }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: cn("truncate", item.inactive ? "text-text-faint" : "text-text-secondary"), children: item.label })
    ] });
    return /* @__PURE__ */ jsx("li", { className: "min-w-0 text-xs", children: onItemClick ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onItemClick(i),
        "aria-pressed": !item.inactive,
        className: "-mx-1.5 -my-1 flex min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-1 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        children: content
      }
    ) : /* @__PURE__ */ jsx("span", { className: "flex min-w-0 items-center gap-1.5", children: content }) }, `${item.label}-${i}`);
  }) });
}
function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter = formatChartValue,
  labelFormatter
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-surface-overlay px-3 py-2 shadow-lg", children: [
    label != null && label !== "" && /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-xs font-medium text-text-primary", children: labelFormatter ? labelFormatter(label) : label }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: payload.map((item, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: "size-2 shrink-0 rounded-full",
          style: { backgroundColor: item.color }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "mr-2 text-text-secondary", children: item.name }),
      /* @__PURE__ */ jsx("span", { className: "ml-auto font-[family-name:var(--font-mono)] text-text-primary", children: typeof item.value === "number" ? valueFormatter(item.value) : item.value ?? "\u2014" })
    ] }, i)) })
  ] });
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
  categoryLabel = "Category",
  tableCaption,
  onBarClick,
  loading,
  emptyTitle,
  emptyDescription,
  className
}) {
  const allSeries = capSeries(series, "BarChart");
  const [hidden, setHidden] = React.useState(() => /* @__PURE__ */ new Set());
  const plotData = React.useMemo(() => data.map((row) => ({ ...row })), [data]);
  const visibleSeries = React.useMemo(
    () => allSeries.filter((s) => !hidden.has(s.key)),
    [allSeries, hidden]
  );
  const allColors = resolveSeriesColors(allSeries);
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
                  labelFormatter
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
    showLegend && /* @__PURE__ */ jsx(
      ChartLegend,
      {
        className: "mt-3",
        items: allSeries.map((s, i) => ({
          label: s.label,
          color: allColors[i],
          inactive: hidden.has(s.key)
        })),
        onItemClick: toggleableSeries ? toggle : void 0
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
  categoryLabel = "Period",
  tableCaption,
  loading,
  emptyTitle,
  emptyDescription,
  className
}) {
  const allSeries = capSeries(series, "LineChart");
  const [hidden, setHidden] = React.useState(() => /* @__PURE__ */ new Set());
  const plotData = React.useMemo(() => data.map((row) => ({ ...row })), [data]);
  const visibleSeries = React.useMemo(
    () => allSeries.filter((s) => !hidden.has(s.key)),
    [allSeries, hidden]
  );
  const allColors = resolveSeriesColors(allSeries);
  const showLegend = legend ?? allSeries.length > 1;
  const showDots = dots ?? data.length <= 12;
  const axisTickFormatter = tickFormatter ?? valueFormatter;
  if (loading) return /* @__PURE__ */ jsx(ChartSkeleton, { height });
  if (!data.length || !allSeries.length) {
    return /* @__PURE__ */ jsx(ChartEmpty, { height, title: emptyTitle, description: emptyDescription });
  }
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
                  labelFormatter
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
    showLegend && /* @__PURE__ */ jsx(
      ChartLegend,
      {
        className: "mt-3",
        items: allSeries.map((s, i) => ({
          label: s.label,
          color: allColors[i],
          inactive: hidden.has(s.key)
        })),
        onItemClick: toggleableSeries ? toggle : void 0
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
                  /* @__PURE__ */ jsx(Tooltip$1, { content: /* @__PURE__ */ jsx(ChartTooltipContent, { valueFormatter }) }),
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
          /* @__PURE__ */ jsx("ul", { className: cn("space-y-1.5", isRight ? "w-44 shrink-0" : "w-full max-w-xs"), children: slices.map((slice, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                "aria-hidden": true,
                className: "size-2 shrink-0 rounded-full",
                style: { backgroundColor: slice.color }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-text-secondary", children: slice.label }),
            /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0 font-[family-name:var(--font-mono)] text-text-primary", children: showPercentages ? `${slice.percent.toFixed(1)}%` : valueFormatter(slice.value) })
          ] }, `${slice.label}-${i}`)) }),
          /* @__PURE__ */ jsxs("table", { className: "sr-only", children: [
            /* @__PURE__ */ jsx("caption", { children: tableCaption ?? `Share of total by ${categoryLabel}` }),
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { scope: "col", children: categoryLabel }),
              /* @__PURE__ */ jsx("th", { scope: "col", children: "Value" }),
              /* @__PURE__ */ jsx("th", { scope: "col", children: "Share" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: slices.map((slice, i) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { scope: "row", children: slice.label }),
              /* @__PURE__ */ jsx("td", { children: valueFormatter(slice.value) }),
              /* @__PURE__ */ jsxs("td", { children: [
                slice.percent.toFixed(1),
                "%"
              ] })
            ] }, `${slice.label}-${i}`)) })
          ] })
        ]
      }
    )
  );
}
var MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
var selectClass = "h-7 rounded border border-border bg-surface-raised px-1.5 text-xs text-text-primary";
function DateRangePicker({ value, onChange, years, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1.5 text-xs", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.startMonth,
          onChange: (e) => onChange({ ...value, startMonth: Number(e.target.value) }),
          className: selectClass,
          children: MONTH_NAMES.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i))
        }
      ),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.startYear,
          onChange: (e) => onChange({ ...value, startYear: Number(e.target.value) }),
          className: selectClass,
          children: years.map((y) => /* @__PURE__ */ jsx("option", { value: y, children: y }, y))
        }
      )
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-text-muted", children: "to" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.endMonth,
          onChange: (e) => onChange({ ...value, endMonth: Number(e.target.value) }),
          className: selectClass,
          children: MONTH_NAMES.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i))
        }
      ),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: value.endYear,
          onChange: (e) => onChange({ ...value, endYear: Number(e.target.value) }),
          className: selectClass,
          children: years.map((y) => /* @__PURE__ */ jsx("option", { value: y, children: y }, y))
        }
      )
    ] })
  ] });
}
var STORAGE_KEY = "carbon-theme";
var THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark")t="dark";var c=document.documentElement.classList;c.remove("light","dark");c.add(t);}catch(e){}})();`;
function applyTheme(theme) {
  const classList = document.documentElement.classList;
  classList.remove("light", "dark");
  classList.add(theme);
}
var ThemeContext = createContext(null);
function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  useEffect(() => {
    setThemeState(
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );
  }, []);
  const setTheme = useCallback((next) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
    }
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, setTheme, toggleTheme }, children });
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: toggleTheme,
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      title: isDark ? "Switch to light mode" : "Switch to dark mode",
      className: cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised transition-colors hover:border-carbon-600",
        className
      ),
      children: mounted ? isDark ? /* @__PURE__ */ jsx(Sun, { size: 16, className: "text-amber-500", fill: "currentColor" }) : /* @__PURE__ */ jsx(Moon, { size: 16, className: "text-indigo-400", fill: "currentColor" }) : /* @__PURE__ */ jsx("span", { className: "h-4 w-4" })
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
    "h-7 w-full rounded border-0 bg-transparent px-1 text-xs focus:ring-1 focus:ring-accent/50",
    selected ? "text-text-primary" : "text-text-faint"
  ) : cn(
    "h-8 w-full rounded-md border border-border bg-surface-raised px-3 text-sm outline-none focus:ring-2 focus:ring-accent/50",
    clearable && selected ? "pr-8" : "",
    selected ? "text-text-primary" : "text-text-muted"
  );
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(
      "input",
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
        className: "absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[18rem] overflow-y-auto rounded-md border border-border bg-surface-raised shadow-lg",
        children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-2 py-1.5 text-xs text-text-faint", children: "No matching accounts" }) : filtered.slice(0, 50).map((a, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": a.id === value,
            onMouseDown: (e) => e.preventDefault(),
            onClick: () => selectAccount(a.id),
            className: cn(
              "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-surface-overlay",
              i === highlightIdx && "bg-surface-overlay",
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
  const toggle = (value) => {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-label": `${label} filter`,
        className: cn(
          "flex h-8 items-center gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary hover:border-accent/50",
          className
        ),
        children: [
          /* @__PURE__ */ jsxs("span", { className: "text-text-muted", children: [
            label,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "max-w-[12rem] truncate", children: summary }),
          selected.length > 0 && selected.length < options.length && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-accent-muted px-1.5 text-xs tabular-nums text-accent-text", children: selected.length }),
          /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-text-muted" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(PopoverContent, { align: "end", className: "w-60 p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between px-1 pb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-text-muted", children: label }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "text-accent-text hover:underline disabled:opacity-40",
              disabled: selected.length === options.length,
              onClick: () => onChange(options.map((o) => o.value)),
              children: "All"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "text-text-muted hover:underline disabled:opacity-40",
              disabled: selected.length === 0,
              onClick: () => onChange([]),
              children: "Clear"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-72 overflow-y-auto", children: options.map((opt) => {
        const checked = selectedSet.has(opt.value);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "checkbox",
            "aria-checked": checked,
            onClick: () => toggle(opt.value),
            className: "flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-sm text-text-primary hover:bg-surface-overlay",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": "true",
                  className: cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked ? "border-accent bg-accent text-carbon-950" : "border-border bg-surface-raised"
                  ),
                  children: checked && /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 })
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: opt.label })
            ]
          },
          opt.value
        );
      }) })
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
var SEARCH_DELAY_MS = 250;
var MIN_QUERY_LENGTH = 3;
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
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false;
      setSuggestions([]);
      setStatus("idle");
      return;
    }
    if (!searchActive || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setActiveIndex(-1);
      setStatus("idle");
      return;
    }
    const timer = window.setTimeout(() => {
      setStatus("loading");
      void loadGooglePlacesLibrary().then(async (places) => {
        if (requestSequence.current !== sequence) return;
        if (!sessionToken.current) sessionToken.current = new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ["us"],
          region: "us",
          sessionToken: sessionToken.current
        });
        if (requestSequence.current !== sequence) return;
        setSuggestions(response.suggestions.filter((item) => item.placePrediction));
        setActiveIndex(-1);
        setStatus("ready");
      }).catch(() => {
        if (requestSequence.current !== sequence) return;
        setSuggestions([]);
        setActiveIndex(-1);
        setStatus("unavailable");
      });
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [retryAttempt, searchActive, value]);
  const selectSuggestion = async (suggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    const sequence = ++requestSequence.current;
    setSuggestions([]);
    setActiveIndex(-1);
    setStatus("loading");
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
      if (requestSequence.current !== sequence) return;
      const parsed = parseGooglePlaceAddress(place);
      suppressNextSearch.current = true;
      if (parsed && onAddressSelect) onAddressSelect(parsed);
      else onChange(place.formattedAddress || prediction.text.toString());
      sessionToken.current = null;
      setSearchActive(false);
      setStatus("idle");
    } catch {
      if (requestSequence.current !== sequence) return;
      setStatus("unavailable");
    }
  };
  const handleKeyDown = (event) => {
    if (!suggestions.length) {
      if (event.key === "Escape") setSearchActive(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1);
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
  const baseClass = variant === "public" ? "flex h-9 w-full rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" : variant === "vendor" ? "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" : "flex h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
  const optionsVisible = searchActive && suggestions.length > 0;
  const mutedClass = variant === "vendor" ? "text-slate-500" : "text-text-muted";
  const optionClass = variant === "public" ? "border-gray-700 bg-gray-900 text-white" : variant === "vendor" ? "border-slate-200 bg-white text-slate-900" : "border-border bg-surface-raised text-text-primary";
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        id: inputId,
        type: "text",
        value,
        onChange: (event) => {
          requestSequence.current += 1;
          onChange(event.target.value);
          setSearchActive(true);
        },
        onFocus: () => setSearchActive(true),
        onBlur: () => {
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
        "aria-describedby": status === "idle" ? void 0 : statusId,
        "aria-expanded": optionsVisible,
        "aria-activedescendant": optionsVisible && activeIndex >= 0 ? `${listId}-${activeIndex}` : void 0,
        role: "combobox",
        required,
        autoComplete,
        className: cn(baseClass, className)
      }
    ),
    optionsVisible && /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "absolute left-0 right-0 top-full z-[70] mt-1 overflow-hidden rounded-md border shadow-xl",
          optionClass
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
                const prediction = suggestion.placePrediction;
                const text = predictionText(prediction);
                return /* @__PURE__ */ jsxs(
                  "li",
                  {
                    id: `${listId}-${index}`,
                    role: "option",
                    "aria-selected": activeIndex === index,
                    className: cn(
                      "cursor-pointer px-3 py-2 text-sm",
                      activeIndex === index && (variant === "vendor" ? "bg-emerald-50" : variant === "public" ? "bg-gray-800" : "bg-surface-overlay")
                    ),
                    onMouseDown: (event) => event.preventDefault(),
                    onMouseEnter: () => setActiveIndex(index),
                    onClick: () => void selectSuggestion(suggestion),
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "block font-medium", children: text.main }),
                      text.secondary && /* @__PURE__ */ jsx("span", { className: cn("mt-0.5 block text-xs", mutedClass), children: text.secondary })
                    ]
                  },
                  prediction.placeId
                );
              })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end border-t px-3 py-1.5", children: /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: statusId,
        role: "status",
        "aria-live": "polite",
        className: cn("mt-1 text-xs", mutedClass),
        children: [
          status === "loading" && "Finding addresses\u2026",
          status === "ready" && !suggestions.length && value.trim().length >= MIN_QUERY_LENGTH && "No matches. Continue entering the address manually.",
          status === "unavailable" && /* @__PURE__ */ jsxs("span", { children: [
            "Address suggestions are unavailable. Continue entering the address manually.",
            " ",
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: cn(
                  "font-medium underline underline-offset-2",
                  variant === "vendor" ? "text-emerald-700" : "text-accent"
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
  const inputClass = vendor ? "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" : "h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = vendor ? "mb-1 block text-xs font-medium text-slate-600" : "mb-1 block text-xs font-medium text-text-muted";
  const update = (field, next) => onChange({ ...value, [field]: next });
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "sm:col-span-4", children: [
      /* @__PURE__ */ jsxs("label", { className: labelClass, htmlFor: `${idPrefix}-line1`, children: [
        "Street address",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        AddressAutocomplete2,
        {
          id: `${idPrefix}-line1`,
          value: value.addressLine1,
          onChange: (next) => update("addressLine1", next),
          onAddressSelect: onChange,
          variant: vendor ? "vendor" : "staff",
          ariaLabel: `Street address${required ? " *" : ""}`,
          placeholder: "Start typing or enter manually",
          required,
          autoComplete: "address-line1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2", htmlFor: `${idPrefix}-line2`, children: [
      /* @__PURE__ */ jsx("span", { className: labelClass, children: "Apartment or suite" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-line2`,
          className: inputClass,
          value: value.addressLine2,
          onChange: (event) => update("addressLine2", event.target.value),
          autoComplete: "address-line2"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-3", htmlFor: `${idPrefix}-city`, children: [
      /* @__PURE__ */ jsxs("span", { className: labelClass, children: [
        "City",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-city`,
          className: inputClass,
          value: value.city,
          onChange: (event) => update("city", event.target.value),
          autoComplete: "address-level2",
          required
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-1", htmlFor: `${idPrefix}-state`, children: [
      /* @__PURE__ */ jsxs("span", { className: labelClass, children: [
        "State",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-state`,
          className: inputClass,
          value: value.state,
          onChange: (event) => update("state", event.target.value.toUpperCase()),
          autoComplete: "address-level1",
          maxLength: 2,
          required
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "sm:col-span-2", htmlFor: `${idPrefix}-postal`, children: [
      /* @__PURE__ */ jsxs("span", { className: labelClass, children: [
        "ZIP code",
        required ? " *" : ""
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: `${idPrefix}-postal`,
          className: inputClass,
          value: value.postalCode,
          onChange: (event) => update("postalCode", event.target.value),
          autoComplete: "postal-code",
          inputMode: "numeric",
          required
        }
      )
    ] }),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "country", value: value.country || "US" })
  ] });
}

export { AccountCombobox, AddressAutocomplete, AddressAutocomplete2 as AddressCombobox, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, BarChart, Button, CHART_GRID_COLOR, CHART_LABEL_STYLE, CHART_NEUTRAL_COLOR, CHART_SERIES_LIMIT, CHART_TICK_CATEGORY, CHART_TICK_VALUE, ChartCard, ChartDataTable, ChartEmpty, ChartLegend, ChartSkeleton, ChartTooltipContent, Checkbox, CommandGroup, CommandItem, CommandPalette, DataTable, DateRangePicker, DefinitionItem, DefinitionList, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DonutChart, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, EMPTY_POSTAL_ADDRESS, EmptyState, FilterBar, FormField, Input, LineChart, Money, MoneyInput, MultiStatusFilter, PageHeader, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, Progress, RICH_TEXT_TAGS, RichTextEditor, ScrollArea, SearchSelect, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Separator2 as Separator, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Skeleton, StatCard, StatusBadge, StructuredAddressInput, Switch, THEME_SCRIPT, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, ThemeProvider, ThemeToggle, ToastProvider, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, badgeVariants, buttonVariants, capSeries, cn, formatChartValue, formatDate, formatMoney, formatPeriodLabel, isPostalAddressDraftComplete, isRichTextEmpty, parseGooglePlaceAddress, postalAddressFromDraft, postalAddressToDraft, resolveSeriesColors, safeHref, sanitizeRichText, seriesColor, useTheme, useToast };
