"use client";
import { forwardRef, isValidElement, useRef, useState, createContext, useContext, useLayoutEffect, useMemo, useEffect, useImperativeHandle, Children, Fragment as Fragment$2, useSyncExternalStore, useCallback, useId, cloneElement } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import { Slice, Fragment as Fragment$1 } from '@tiptap/pm/model';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { mergeAttributes, Extension, getMarkRange } from '@tiptap/core';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list';
import { StarterKit } from '@tiptap/starter-kit';
import { LoaderCircle, ImagePlus, ChevronDown, Check, Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, TextQuote, SquareCode, List, ListOrdered, Link2, Unlink, X } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

function cn(...inputs) {
  return twMerge(clsx(inputs));
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
  const aliases = {
    ...TAG_ALIASES,
    ...EXTENDED_ALIASES ,
    ...{ img: "img" } 
  };
  const collapsible = richTextTags(options).filter((tag) => !VOID_TAGS.has(tag));
  return { aliases, empty: emptyElement(collapsible) };
}
function emptyElement(tags) {
  return new RegExp(`<(${tags.join("|")})\\b[^>]*><\\/\\1>`, "g");
}
({
  empty: emptyElement(RICH_TEXT_TAGS.filter((tag) => !VOID_TAGS.has(tag)))
});
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

// src/components/ui/rich-text-editor-extensions.ts
var CarbonListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return { Enter: () => this.editor.commands.splitListItem(this.name) };
  }
});
var CarbonListKeymap = ListKeymap.extend({
  addKeyboardShortcuts() {
    const shortcuts = { ...this.parent?.() };
    delete shortcuts.Tab;
    return shortcuts;
  }
});
var CarbonOrderedList = OrderedList.extend({
  addAttributes() {
    return {};
  },
  renderHTML({ HTMLAttributes }) {
    return ["ol", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  }
});
var CarbonCodeBlock = CodeBlock.extend({
  addAttributes() {
    return {};
  }
});
var CarbonLink = Link.extend({
  addAttributes() {
    return {
      href: { default: null, parseHTML: (element) => element.getAttribute("href") }
    };
  }
});
function editorImageSrc(raw) {
  const base = typeof window === "undefined" ? void 0 : window.location.href;
  try {
    return safeImageSrc(new URL(raw.trim(), base).href);
  } catch {
    return null;
  }
}
var CarbonImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => editorImageSrc(element.getAttribute("src") ?? "")
      },
      alt: { default: null }
    };
  },
  addInputRules() {
    return [];
  },
  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => editorImageSrc(element.getAttribute("src") ?? "") === null ? false : null
      }
    ];
  }
});
function buildExtensions(config) {
  const extended = config.formatting === "extended";
  const keymap = Extension.create({
    name: "carbonKeymap",
    addKeyboardShortcuts() {
      const openLink = () => {
        if (!this.editor.isEditable) return false;
        config.onLinkShortcut();
        return true;
      };
      return { "Meta-k": openLink, "Ctrl-k": openLink };
    }
  });
  const extensions = [
    StarterKit.configure({
      listItem: false,
      listKeymap: false,
      orderedList: false,
      link: false,
      codeBlock: false,
      // `---` stays literal text: <hr> is in no tag set.
      horizontalRule: false,
      // Its appendTransaction changes the document on the first click after a
      // load, which would fire onChange without an edit.
      trailingNode: false,
      strike: extended ? {} : false,
      heading: extended ? { levels: [1, 2, 3] } : false,
      blockquote: extended ? {} : false,
      code: extended ? {} : false
    }),
    CarbonListItem,
    CarbonListKeymap,
    CarbonOrderedList,
    CarbonLink.configure({
      openOnClick: false,
      defaultProtocol: "https",
      isAllowedUri: (url) => isAllowedEditorHref(url),
      autolink: config.linkPanel,
      linkOnPaste: config.linkPanel,
      HTMLAttributes: { target: "_blank", rel: "noopener noreferrer", class: null }
    }),
    keymap
  ];
  if (extended) extensions.push(CarbonCodeBlock);
  if (config.images) {
    extensions.push(CarbonImage.configure({ inline: false, allowBase64: false, resize: false }));
  }
  return extensions;
}
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-w-0 [&>svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent-hover",
        // The error tokens with their theme.css values as fallbacks: a consumer
        // with its own theme may not define `--color-error-solid` /
        // `--color-error-foreground`, and a token utility for a variable that is
        // not there compiles to nothing, leaving a transparent button.
        destructive: "bg-[var(--color-error-solid,#dc2626)] text-[color:var(--color-error-foreground,#fafafa)] hover:bg-[var(--color-error,#ef4444)]",
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-overlay",
        ghost: "text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
        link: "text-accent-text underline-offset-4 hover:underline"
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
        className: "bg-error-solid text-error-foreground hover:bg-error"
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
var subscribeNever = () => () => {
};
function useIsApplePlatform() {
  return useSyncExternalStore(
    subscribeNever,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => false
  );
}
function shortcutLabel(shortcut, apple) {
  if (apple) {
    return `${shortcut.mod ? "\u2318" : ""}${shortcut.shift ? "\u21E7" : ""}${shortcut.alt ? "\u2325" : ""}${shortcut.key}`;
  }
  return [shortcut.mod && "Ctrl", shortcut.shift && "Shift", shortcut.alt && "Alt", shortcut.key].filter(Boolean).join("+");
}
function ariaShortcut(shortcut, apple) {
  if (!shortcut.mod && !shortcut.shift && !shortcut.alt) return void 0;
  return [
    shortcut.mod && (apple ? "Meta" : "Control"),
    shortcut.shift && "Shift",
    shortcut.alt && "Alt",
    shortcut.key
  ].filter(Boolean).join("+");
}
var ToolbarButton = forwardRef(
  ({ label, tooltip, icon: Icon2, iconClassName, shortcut, pressed, apple, className, onMouseDown, ...props }, ref) => /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        ref,
        type: "button",
        variant: "ghost",
        size: "icon",
        "aria-label": label,
        "aria-pressed": pressed,
        "aria-keyshortcuts": shortcut ? ariaShortcut(shortcut, apple) : void 0,
        onMouseDown: (event) => {
          event.preventDefault();
          onMouseDown?.(event);
        },
        className: cn(
          "h-7 w-7 border border-transparent",
          pressed && "border-accent/40 bg-accent-muted text-accent-text hover:bg-accent-muted hover:text-accent-text",
          className
        ),
        ...props,
        children: /* @__PURE__ */ jsx(Icon2, { size: 13, "aria-hidden": true, className: iconClassName })
      }
    ) }),
    /* @__PURE__ */ jsxs(TooltipContent, { side: "top", children: [
      tooltip ?? label,
      shortcut && /* @__PURE__ */ jsx("span", { className: "ml-2 text-text-faint", children: shortcutLabel(shortcut, apple) })
    ] })
  ] })
);
ToolbarButton.displayName = "ToolbarButton";
var IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
var RichTextImageButton = forwardRef(
  ({ editor, uploadImage, onStatus, apple, disabled, ...props }, ref) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    async function onPick(input) {
      const file = input.files?.[0];
      input.value = "";
      if (!file || !editor) return;
      editor.commands.focus();
      if (!IMAGE_TYPES.includes(file.type)) {
        onStatus("Choose a PNG, JPEG, GIF or WebP image.");
        return;
      }
      setUploading(true);
      onStatus("Uploading image\u2026");
      try {
        const uploaded = await uploadImage.current?.(file);
        const src = uploaded ? editorImageSrc(uploaded) : null;
        if (src && !editor.isDestroyed && editor.isEditable) {
          editor.chain().focus().setImage({ src, alt: file.name }).run();
          onStatus("Image inserted.");
        } else if (uploaded && !src) {
          onStatus("The uploaded image's address can't be saved, so it wasn't inserted.");
        } else {
          onStatus("");
        }
      } catch {
        onStatus("");
      } finally {
        setUploading(false);
      }
    }
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        ToolbarButton,
        {
          ref,
          label: uploading ? "Uploading image\u2026" : "Insert image",
          icon: uploading ? LoaderCircle : ImagePlus,
          iconClassName: uploading ? "animate-spin motion-reduce:animate-none" : void 0,
          apple,
          disabled: disabled || uploading,
          onClick: () => inputRef.current?.click(),
          ...props
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          accept: IMAGE_TYPES.join(","),
          hidden: true,
          tabIndex: -1,
          "aria-hidden": "true",
          onChange: (event) => void onPick(event.currentTarget)
        }
      )
    ] });
  }
);
RichTextImageButton.displayName = "RichTextImageButton";
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

// src/lib/ui-classes.ts
var floatingSurfaceClass = "z-50 rounded-lg border border-border bg-surface-raised shadow-lg";
var floatingMotionClass = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";
var optionRowClass = "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary outline-none transition-colors";
var optionRowFocusClass = "focus:bg-surface-overlay focus:text-text-primary data-[highlighted]:bg-surface-overlay data-[highlighted]:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
var fieldChromeClass = "w-full min-w-0 rounded-md border border-border bg-surface-raised text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50";
var EMPTY_VALUE = "\0carbon-select-empty";
var EmptyItemContext = createContext(null);
function Select({
  value,
  defaultValue,
  onValueChange,
  name,
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
    hasEmptyItem && name && /* @__PURE__ */ jsx("input", { type: "hidden", name, value: current ?? "" })
  ] });
}
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
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
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
function RichTextLinkPanel({
  editor,
  open,
  onOpenChange,
  targets,
  editing,
  trigger
}) {
  const label = editing ? "Edit link" : "Add link";
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: trigger }),
    /* @__PURE__ */ jsx(
      PopoverContent,
      {
        align: "start",
        "aria-label": label,
        onOpenAutoFocus: (event) => event.preventDefault(),
        onCloseAutoFocus: (event) => event.preventDefault(),
        onEscapeKeyDown: () => editor.commands.focus(),
        children: /* @__PURE__ */ jsx(LinkPanel, { editor, targets, onDone: () => onOpenChange(false) })
      }
    )
  ] });
}
function linkRange(editor, from, to) {
  const { doc, schema } = editor.state;
  const type = schema.marks.link;
  if (from === to) {
    return getMarkRange(doc.resolve(from), type) ?? { from, to };
  }
  let start = from;
  let end = to;
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText || !type.isInSet(node.marks)) return;
    const range = getMarkRange(doc.resolve(pos), type);
    if (!range) return;
    start = Math.min(start, range.from);
    end = Math.max(end, range.to);
  });
  return { from: start, to: end };
}
function LinkPanel({
  editor,
  targets,
  onDone
}) {
  const id = useId();
  const urlRef = useRef(null);
  const hrefs = targets.map((target) => target.href);
  const [opened] = useState(() => {
    const href = editor.getAttributes("link").href;
    const { empty, from, to } = editor.state.selection;
    return { href: href ?? "", editing: href !== void 0, empty, from, to };
  });
  const [url, setUrl] = useState(opened.href);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  useEffect(() => {
    urlRef.current?.focus();
    urlRef.current?.select();
  }, []);
  function cancel() {
    editor.commands.focus();
    onDone();
  }
  function apply() {
    if (!url.trim()) return;
    const result = normalizeLinkHref(url, { targets: hrefs });
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    const { href } = result;
    if (opened.editing) {
      const range = linkRange(editor, opened.from, opened.to);
      editor.chain().focus().setTextSelection(range).setLink({ href }).setTextSelection(range.to).unsetMark("link").run();
    } else if (!opened.empty) {
      editor.chain().focus().setTextSelection({ from: opened.from, to: opened.to }).setLink({ href }).setTextSelection(opened.to).unsetMark("link").run();
    } else {
      editor.chain().focus().setTextSelection(opened.from).insertContent({
        type: "text",
        text: text.trim() || href,
        marks: [{ type: "link", attrs: { href } }]
      }).unsetMark("link").run();
    }
    onDone();
  }
  function remove() {
    editor.chain().focus().setTextSelection(linkRange(editor, opened.from, opened.to)).unsetLink().setTextSelection({ from: opened.from, to: opened.to }).run();
    onDone();
  }
  function onFieldKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    apply();
  }
  const urlId = `${id}-url`;
  const textId = `${id}-text`;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        FormField,
        {
          label: "URL",
          htmlFor: urlId,
          error: error ? linkHrefErrorMessage(error, { targets: hrefs }) : void 0,
          children: /* @__PURE__ */ jsx(
            Input,
            {
              ref: urlRef,
              id: urlId,
              type: "text",
              value: url,
              onChange: (event) => {
                setUrl(event.target.value);
                setError(null);
              },
              onKeyDown: onFieldKeyDown,
              placeholder: hrefs.length > 0 ? `https://example.com or ${hrefs[0]}` : "https://example.com",
              className: cn(error && "border-error-border")
            }
          )
        }
      ),
      targets.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: targets.map((target) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            onClick: () => {
              setUrl(target.href);
              setError(null);
              urlRef.current?.focus();
            },
            children: `Use ${target.name}`
          }
        ),
        target.description && /* @__PURE__ */ jsx("p", { className: "mt-1 break-words text-xs text-text-muted", children: target.description })
      ] }, target.href)) })
    ] }),
    !opened.editing && opened.empty && /* @__PURE__ */ jsx(FormField, { label: "Text to show (optional)", htmlFor: textId, hint: "Leave blank to show the URL.", children: /* @__PURE__ */ jsx(
      Input,
      {
        id: textId,
        type: "text",
        value: text,
        onChange: (event) => setText(event.target.value),
        onKeyDown: onFieldKeyDown
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      opened.editing && // Ghost, not destructive: removing a link keeps its text.
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: remove, "aria-label": "Remove link", children: [
        /* @__PURE__ */ jsx(Unlink, { size: 13, "aria-hidden": true }),
        "Remove"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: cancel, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", onClick: apply, disabled: !url.trim(), children: "Apply" })
      ] })
    ] })
  ] });
}
function RichTextLinkRow({
  editor,
  onClose,
  apple
}) {
  const rowRef = useRef(null);
  const [opened] = useState(() => {
    const { from, to, empty } = editor.state.selection;
    const href = editor.getAttributes("link").href;
    return { from, to, empty, href };
  });
  const [linkValue, setLinkValue] = useState(opened.href ?? "https://");
  const pendingHref = useMemo(() => safeHref(linkValue), [linkValue]);
  const close = useCallback(() => {
    onClose();
    editor.commands.focus();
  }, [editor, onClose]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (!rowRef.current?.contains(event.target)) return;
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [close]);
  const apply = () => {
    if (pendingHref === null) return;
    const href = pendingHref;
    const chain = editor.chain().focus();
    if (opened.href !== void 0) {
      chain.setTextSelection({ from: opened.from, to: opened.to }).extendMarkRange("link").setLink({ href });
    } else if (opened.empty) {
      chain.setTextSelection(opened.from).insertContent({
        type: "text",
        text: href,
        marks: [{ type: "link", attrs: { href } }]
      });
    } else {
      chain.setTextSelection({ from: opened.from, to: opened.to }).setLink({ href }).setTextSelection(opened.to);
    }
    chain.unsetMark("link").run();
    onClose();
  };
  const remove = () => {
    editor.chain().focus().setTextSelection({ from: opened.from, to: opened.to }).extendMarkRange("link").unsetLink().run();
    onClose();
  };
  return /* @__PURE__ */ jsxs("div", { ref: rowRef, className: "flex w-full items-center gap-1.5 py-0.5", children: [
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
            apply();
          }
        }
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        label: "Apply link",
        icon: Check,
        shortcut: { key: "Enter" },
        apple,
        disabled: pendingHref === null,
        onClick: apply
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        label: "Remove link",
        icon: Unlink,
        apple,
        disabled: opened.href === void 0,
        onClick: remove
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        label: "Cancel link",
        tooltip: "Cancel",
        icon: X,
        shortcut: { key: "Esc" },
        apple,
        onClick: close
      }
    )
  ] });
}
var Separator = forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
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
Separator.displayName = "Separator";
var INACTIVE = {
  bold: false,
  italic: false,
  strike: false,
  code: false,
  h1: false,
  h2: false,
  h3: false,
  blockquote: false,
  codeBlock: false,
  bulletList: false,
  orderedList: false,
  link: false
};
function RichTextToolbar({
  editor,
  formatting,
  images,
  linkPanel,
  targets,
  insertActions,
  disabled,
  linkOpen,
  onLinkOpenChange,
  uploadImage,
  onStatus,
  controls
}) {
  const apple = useIsApplePlatform();
  const toolbarRef = useRef(null);
  const [current, setCurrent] = useState(null);
  const extended = formatting === "extended";
  const inert = disabled || editor === null;
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => e ? {
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: extended && e.isActive("strike"),
      code: extended && e.isActive("code"),
      h1: extended && e.isActive("heading", { level: 1 }),
      h2: extended && e.isActive("heading", { level: 2 }),
      h3: extended && e.isActive("heading", { level: 3 }),
      blockquote: extended && e.isActive("blockquote"),
      codeBlock: extended && e.isActive("codeBlock"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      link: e.isActive("link")
    } : INACTIVE
  }) ?? INACTIVE;
  const toggle = (key, label, icon, shortcut, isActive, run) => ({ key, label, icon, shortcut, active: isActive, run });
  const inline = [
    toggle("bold", "Bold", Bold, { mod: true, key: "B" }, active.bold, (e) => e.chain().focus().toggleBold().run()),
    toggle(
      "italic",
      "Italic",
      Italic,
      { mod: true, key: "I" },
      active.italic,
      (e) => e.chain().focus().toggleItalic().run()
    ),
    ...extended ? [
      toggle(
        "strike",
        "Strikethrough",
        Strikethrough,
        { mod: true, shift: true, key: "S" },
        active.strike,
        (e) => e.chain().focus().toggleStrike().run()
      ),
      toggle(
        "code",
        "Inline code",
        Code,
        { mod: true, key: "E" },
        active.code,
        (e) => e.chain().focus().toggleCode().run()
      )
    ] : []
  ];
  const blocks = extended ? [
    toggle(
      "h1",
      "Heading 1",
      Heading1,
      { mod: true, alt: true, key: "1" },
      active.h1,
      (e) => e.chain().focus().toggleHeading({ level: 1 }).run()
    ),
    toggle(
      "h2",
      "Heading 2",
      Heading2,
      { mod: true, alt: true, key: "2" },
      active.h2,
      (e) => e.chain().focus().toggleHeading({ level: 2 }).run()
    ),
    toggle(
      "h3",
      "Heading 3",
      Heading3,
      { mod: true, alt: true, key: "3" },
      active.h3,
      (e) => e.chain().focus().toggleHeading({ level: 3 }).run()
    ),
    toggle(
      "quote",
      "Quote",
      TextQuote,
      { mod: true, shift: true, key: "B" },
      active.blockquote,
      (e) => e.chain().focus().toggleBlockquote().run()
    ),
    toggle(
      "codeBlock",
      "Code block",
      SquareCode,
      { mod: true, alt: true, key: "C" },
      active.codeBlock,
      (e) => e.chain().focus().toggleCodeBlock().run()
    )
  ] : [];
  const lists = [
    toggle(
      "bulletList",
      "Bulleted list",
      List,
      { mod: true, shift: true, key: "8" },
      active.bulletList,
      (e) => e.chain().focus().toggleBulletList().run()
    ),
    toggle(
      "orderedList",
      "Numbered list",
      ListOrdered,
      { mod: true, shift: true, key: "7" },
      active.orderedList,
      (e) => e.chain().focus().toggleOrderedList().run()
    )
  ];
  const order = [
    ...[...inline, ...blocks, ...lists].map((t) => ({ key: t.key, enabled: !inert })),
    { key: "link", enabled: !inert },
    ...images ? [{ key: "image", enabled: !inert }] : [],
    ...insertActions.map((_, index) => ({ key: `action-${index}`, enabled: !inert }))
  ];
  const enabledKeys = order.filter((item) => item.enabled).map((item) => item.key);
  const tabStop = current !== null && enabledKeys.includes(current) ? current : enabledKeys[0];
  const roving = (key) => ({
    "data-toolbar-item": key,
    tabIndex: key === tabStop ? 0 : -1,
    onFocus: () => setCurrent(key)
  });
  const onKeyDown = (event) => {
    const key = event.target.getAttribute("data-toolbar-item");
    if (key === null || enabledKeys.length === 0) return;
    const index = enabledKeys.indexOf(key);
    const last = enabledKeys.length - 1;
    const next = event.key === "ArrowRight" ? enabledKeys[index === last ? 0 : index + 1] : event.key === "ArrowLeft" ? enabledKeys[index <= 0 ? last : index - 1] : event.key === "Home" ? enabledKeys[0] : event.key === "End" ? enabledKeys[last] : void 0;
    if (next === void 0) return;
    event.preventDefault();
    toolbarRef.current?.querySelector(`[data-toolbar-item="${next}"]`)?.focus();
  };
  const renderToggle = (t) => /* @__PURE__ */ jsx(
    ToolbarButton,
    {
      label: t.label,
      icon: t.icon,
      shortcut: t.shortcut,
      pressed: t.active,
      apple,
      disabled: inert,
      onClick: () => editor && t.run(editor),
      ...roving(t.key)
    },
    t.key
  );
  const linkLabel = linkPanel ? active.link ? "Edit link" : "Add link" : "Link";
  const linkButton = /* @__PURE__ */ jsx(
    ToolbarButton,
    {
      label: linkLabel,
      icon: Link2,
      shortcut: { mod: true, key: "K" },
      pressed: linkPanel ? active.link : void 0,
      apple,
      disabled: inert,
      ...linkPanel ? {} : { onClick: () => onLinkOpenChange(true) },
      ...roving("link")
    }
  );
  const insertGroup = [
    linkPanel && editor ? /* @__PURE__ */ jsx(
      RichTextLinkPanel,
      {
        editor,
        open: linkOpen,
        onOpenChange: onLinkOpenChange,
        targets,
        editing: active.link,
        trigger: linkButton
      },
      "link"
    ) : /* @__PURE__ */ jsx(Fragment$2, { children: linkButton }, "link"),
    ...images ? [
      /* @__PURE__ */ jsx(
        RichTextImageButton,
        {
          editor,
          uploadImage,
          onStatus,
          apple,
          disabled: inert,
          ...roving("image")
        },
        "image"
      )
    ] : []
  ];
  const actionGroup = insertActions.map((action, index) => {
    const button = /* @__PURE__ */ jsx(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        className: "h-7 px-2",
        disabled: inert,
        onMouseDown: (event) => event.preventDefault(),
        onClick: () => editor?.chain().focus().insertContent(action.html).run(),
        ...roving(`action-${index}`),
        children: action.label
      },
      `action-${index}`
    );
    if (!action.title) return button;
    return /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "top", className: "max-w-xs break-words", children: action.title })
    ] }, `action-${index}`);
  });
  const groups = [inline.map(renderToggle), blocks.map(renderToggle), lists.map(renderToggle), insertGroup, actionGroup].filter((group) => group.length > 0);
  const separated = extended || images || linkPanel || insertActions.length > 0;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: toolbarRef,
      role: "toolbar",
      "aria-label": "Formatting",
      "aria-controls": controls,
      onKeyDown,
      className: "flex flex-wrap items-center gap-0.5 border-b border-border-subtle bg-surface px-1.5 py-1",
      children: linkOpen && !linkPanel && editor ? /* @__PURE__ */ jsx(RichTextLinkRow, { editor, onClose: () => onLinkOpenChange(false), apple }) : groups.map((group, index) => /* @__PURE__ */ jsxs(Fragment$2, { children: [
        separated && index > 0 && /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "mx-1 h-4 self-center" }),
        group
      ] }, index))
    }
  );
}

// src/components/ui/rich-text-editor-value.ts
var HAS_TAG = /<[a-z][\s\S]*>/i;
var PLACEHOLDER_BREAK = /<br\s*\/?>(?=\s*<\/(p|li|h[1-3]|blockquote)>)/gi;
function plainTextToHtml(text) {
  if (!text) return "";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.split(/\n{2,}/).map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`).join("");
}
function dropPlaceholderBreaks(html) {
  return html.replace(PLACEHOLDER_BREAK, "");
}
function toEditorHtml(value, acceptPlainText) {
  const html = acceptPlainText && !HAS_TAG.test(value) ? plainTextToHtml(value) : value;
  return dropPlaceholderBreaks(html);
}
function fromEditorHtml(html) {
  const out = html.replace(/<p><\/p>/g, "<p><br></p>");
  return isRichTextEmpty(out) ? "" : out;
}
var SURFACE = cn(
  "min-h-24 w-full break-words px-3 py-2 text-sm leading-relaxed text-text-primary focus-visible:outline-none",
  // The editable surface styles its own output. These match the renderer a
  // consumer writes for stored rich text, so what somebody types looks like
  // what they get.
  "[&_a]:cursor-text [&_a]:text-accent-text [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:font-semibold [&_s]:line-through",
  "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_li]:my-0.5",
  "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
  "[&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-text-primary [&_h1:first-child]:mt-0",
  "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2:first-child]:mt-0",
  "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[0.9375rem] [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3:first-child]:mt-0",
  "[&_blockquote]:my-2 [&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-text-secondary",
  "[&_code]:rounded-sm [&_code]:bg-surface-overlay [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[0.8125rem] [&_code]:text-text-primary",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border-subtle [&_pre]:bg-surface-overlay [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:text-[0.8125rem] [&_pre]:leading-relaxed",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_img]:my-2 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg",
  "[&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-offset-2 [&_img.ProseMirror-selectednode]:outline-accent"
);
function onlyFiles(data) {
  if (!data || data.files.length === 0) return false;
  return !data.getData("text/plain") && !data.getData("text/html");
}
function withoutImages(fragment, known) {
  const kept = [];
  fragment.forEach((node) => {
    if (node.type.name === "image") {
      if (known.has(node.attrs.src)) kept.push(node);
      return;
    }
    if (node.isLeaf) {
      kept.push(node);
      return;
    }
    const content = withoutImages(node.content, known);
    if (content === node.content || node.type.validContent(content) || !node.type.validContent(node.content)) {
      kept.push(node.copy(content));
      return;
    }
    const filled = node.type.createAndFill(node.attrs, content, node.marks);
    if (filled) kept.push(filled);
  });
  return kept.length === fragment.childCount && kept.every((node, i) => node === fragment.child(i)) ? fragment : Fragment$1.fromArray(kept);
}
function pastePlainText(view, text) {
  const { schema, selection } = view.state;
  const marks = selection.$from.marks();
  const paragraphs = text.split(/(?:\r\n?|\n)+/).map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line, marks) : null));
  const slice = new Slice(Fragment$1.from(paragraphs), 1, 1);
  view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
}
var RichTextEditorImpl = forwardRef(function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  invalid = false,
  formatting = "basic",
  uploadImage,
  linkPanel,
  insertActions,
  acceptPlainText = false
}, ref) {
  const [capabilities] = useState(() => ({
    formatting,
    images: uploadImage !== void 0,
    linkPanel: linkPanel !== void 0 && linkPanel !== false,
    targets: (typeof linkPanel === "object" ? linkPanel.targets : void 0) ?? []
  }));
  const extended = capabilities.formatting === "extended";
  const [linkOpen, setLinkOpen] = useState(false);
  const [status, setStatus] = useState("");
  const lastEmitted = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const uploadImageRef = useRef(uploadImage);
  uploadImageRef.current = uploadImage;
  const openLinkRef = useRef(() => setLinkOpen(true));
  const knownImages = useRef(/* @__PURE__ */ new Set());
  const rememberImages = (doc) => doc.descendants((node) => {
    if (node.type.name === "image" && node.attrs.src) knownImages.current.add(node.attrs.src);
  });
  const [extensions] = useState(
    () => buildExtensions({
      formatting: capabilities.formatting,
      images: capabilities.images,
      linkPanel: capabilities.linkPanel,
      onLinkShortcut: () => openLinkRef.current()
    })
  );
  const [initialContent] = useState(() => toEditorHtml(value, acceptPlainText));
  const surfaceClass = cn(SURFACE, disabled && "cursor-not-allowed", className);
  const editorProps = useMemo(
    () => ({
      attributes: {
        class: surfaceClass,
        role: "textbox",
        "aria-multiline": "true",
        ...id ? { id } : {},
        ...ariaLabel ? { "aria-label": ariaLabel } : {},
        ...ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {},
        ...ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {},
        ...invalid ? { "aria-invalid": "true" } : {}
      },
      handlePaste: (view, event) => {
        if (onlyFiles(event.clipboardData)) return true;
        if (extended) return false;
        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain") ?? "";
        if (text) pastePlainText(view, text);
        return true;
      },
      handleDrop: (_view, event) => (event.dataTransfer?.files.length ?? 0) > 0,
      transformPastedHTML: dropPlaceholderBreaks,
      transformPasted: (slice, view) => {
        rememberImages(view.state.doc);
        const content = withoutImages(slice.content, knownImages.current);
        if (content === slice.content) return slice;
        return content.size === 0 ? Slice.empty : new Slice(content, slice.openStart, slice.openEnd);
      },
      handleDOMEvents: {
        // A link in the surface places the caret; it never navigates, editable
        // or not.
        click: (_view, event) => {
          if (event.target?.closest?.("a")) event.preventDefault();
          return false;
        }
      }
    }),
    [extended, surfaceClass, id, ariaLabel, ariaLabelledBy, ariaDescribedBy, invalid]
  );
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    enableInputRules: extended,
    enablePasteRules: extended,
    editorProps,
    // Every transaction, not only edits (`setContent` from the sync effect does
    // not emit an update), and the document before it too: a cut removes the
    // image the paste then brings back.
    onTransaction: ({ transaction }) => {
      if (!transaction.docChanged) return;
      rememberImages(transaction.before);
      rememberImages(transaction.doc);
    },
    onUpdate: ({ editor: updated }) => {
      const out = fromEditorHtml(updated.getHTML());
      if (out === lastEmitted.current) return;
      lastEmitted.current = out;
      onChangeRef.current(out);
    }
  });
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value === lastEmitted.current) return;
    const incoming = toEditorHtml(value, acceptPlainText);
    if (fromEditorHtml(editor.getHTML()) !== fromEditorHtml(incoming)) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    lastEmitted.current = value;
  }, [editor, value, acceptPlainText]);
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled, false);
    if (disabled) setLinkOpen(false);
  }, [editor, disabled]);
  useImperativeHandle(
    ref,
    () => ({
      insert: (html) => {
        if (!editor || editor.isDestroyed) return;
        editor.chain().focus().insertContent(html).run();
      },
      focus: () => {
        if (!editor || editor.isDestroyed) return;
        editor.commands.focus();
      }
    }),
    [editor]
  );
  return /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 400, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "overflow-hidden rounded-md border bg-surface-raised shadow-sm transition-colors focus-within:ring-2 focus-within:ring-accent/50",
        invalid ? "border-error-border" : "border-border",
        disabled && "opacity-50"
      ),
      children: [
        /* @__PURE__ */ jsx(
          RichTextToolbar,
          {
            editor,
            formatting: capabilities.formatting,
            images: capabilities.images,
            linkPanel: capabilities.linkPanel,
            targets: capabilities.targets,
            insertActions: insertActions ?? [],
            disabled,
            linkOpen: linkOpen && !disabled,
            onLinkOpenChange: setLinkOpen,
            uploadImage: uploadImageRef,
            onStatus: setStatus,
            controls: id
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          placeholder && isRichTextEmpty(value) && // An overlay rather than TipTap's placeholder pseudo-element, so it
          // can be aria-hidden, and so it uses `isRichTextEmpty` — the same
          // check the consumer uses to decide between the note and its empty
          // state.
          /* @__PURE__ */ jsx("p", { "aria-hidden": "true", className: "pointer-events-none absolute left-3 top-2 text-sm text-text-muted", children: placeholder }),
          editor ? /* @__PURE__ */ jsx(EditorContent, { editor }) : (
            // The server render and the first client render: the same box at
            // the same size, empty until the editor exists. `value` is not
            // rendered here, because the editor is not a sanitizer.
            /* @__PURE__ */ jsx("div", { "aria-hidden": "true", className: surfaceClass })
          )
        ] }),
        capabilities.images && /* @__PURE__ */ jsx("p", { role: "status", className: "sr-only", children: status })
      ]
    }
  ) });
});

export { RichTextEditorImpl };
