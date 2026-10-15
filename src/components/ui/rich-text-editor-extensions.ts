import { Extension, mergeAttributes, type AnyExtension, type NodeViewRenderer } from "@tiptap/core";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { ListItem, ListKeymap, OrderedList } from "@tiptap/extension-list";
import { StarterKit } from "@tiptap/starter-kit";
import { isAllowedEditorHref } from "@/lib/link-href";
import { MAX_IMAGE_WIDTH, safeImageSrc, safeImageWidth, type RichTextFormatting } from "@/lib/rich-text";

/**
 * The editor's schema, derived from its props.
 *
 * This is the guarantee that what the editor emits fits the matching
 * sanitizer: a tag that is not in the schema cannot be produced by a button, a
 * shortcut, a Markdown rule or a paste, because ProseMirror has nothing to make
 * it with. The toolbar is only UI on top. Each configuration's tag set is
 * `richTextTags` in src/lib/rich-text.ts, and the schema tests pin the two
 * together.
 */
export interface EditorSchemaConfig {
  formatting: RichTextFormatting;
  images: boolean;
  /** The full link panel: autolink as you type and link-on-paste come with it. */
  linkPanel: boolean;
  /** Cmd/Ctrl+K. Read through a ref by the caller, so it is always current. */
  onLinkShortcut: () => void;
}

/** Enter splits an item as usual; Tab and Shift-Tab are left to the browser, so Tab leaves the editor. */
const CarbonListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return { Enter: () => this.editor.commands.splitListItem(this.name) };
  },
});

/** The list keymap without its Tab handler, which pulls a paragraph into the list above it. */
const CarbonListKeymap = ListKeymap.extend({
  addKeyboardShortcuts() {
    const shortcuts = { ...this.parent?.() };
    delete shortcuts.Tab;
    return shortcuts;
  },
});

/** No `start` or `type`: every sanitizer strips them, so the editor should not make them. */
const CarbonOrderedList = OrderedList.extend({
  addAttributes() {
    return {};
  },
  renderHTML({ HTMLAttributes }) {
    return ["ol", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

/** No `language`, so a code block is exactly `<pre><code>…</code></pre>`. */
const CarbonCodeBlock = CodeBlock.extend({
  addAttributes() {
    return {};
  },
});

/**
 * Only `href` is kept. `target` and `rel` are fixed, the same ones
 * `sanitizeRichText` composes, so stored links read the same before and after
 * a save.
 */
const CarbonLink = Link.extend({
  addAttributes() {
    return {
      href: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute("href") },
    };
  },
});

/**
 * The `src` an image in the editor gets: resolved against the page, so an
 * upload that returns `/api/files/1` is stored as an absolute URL, then held to
 * the sanitizer's own image rule (http and https only). Anything the sanitizer
 * would drop on save is refused here instead, so an image never shows in the
 * editor and then vanishes from the saved note. `null` when it is refused.
 */
export function editorImageSrc(raw: string): string | null {
  const base = typeof window === "undefined" ? undefined : window.location.href;
  try {
    return safeImageSrc(new URL(raw.trim(), base).href);
  } catch {
    return null;
  }
}

/**
 * Only `src`, `alt` and `width`; height and title are dropped as every sanitizer
 * drops them. `src` goes through `editorImageSrc`, and an image whose `src` it
 * refuses is not parsed at all. `width` is whatever `safeImageWidth` keeps, so a
 * resize survives the save exactly. No `![alt](src)` typing rule: images come in
 * through the button only.
 *
 * The node view is ours rather than TipTap's `ResizableNodeView`, which (as of
 * 3.31) never ends a touch resize, does not redraw a width changed by undo,
 * commits a width on a click with no drag, and leaks an editor listener per
 * image. See `imageNodeView`.
 */
const CarbonImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => editorImageSrc(element.getAttribute("src") ?? ""),
      },
      alt: { default: null },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => safeImageWidth(element.getAttribute("width")),
        renderHTML: (attributes: { width?: unknown }) => {
          const width = safeImageWidth(attributes.width);
          return width === null ? {} : { width };
        },
      },
    };
  },
  addInputRules() {
    return [];
  },
  addNodeView() {
    return imageNodeView;
  },
  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element: HTMLElement) =>
          editorImageSrc(element.getAttribute("src") ?? "") === null ? false : null,
      },
    ];
  },
});

/** The narrowest an image can be dragged to, in CSS pixels. */
export const MIN_IMAGE_RESIZE_WIDTH = 48;

const HANDLES = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

/**
 * An image with four corner handles. Dragging one sets the image's CSS width
 * (height follows from `height: auto`, so the aspect ratio holds) between
 * `MIN_IMAGE_RESIZE_WIDTH` and the width of the text column, and releasing it
 * stores that whole-pixel `width` in one transaction. A press with no movement
 * stores nothing. Pointer events cover mouse, pen and touch alike; the pointer
 * is captured, so the drag ends wherever it is released. The DOM is redrawn
 * from the node on every update, so undo and a replaced `value` show the width
 * that is stored.
 *
 * Handles are always in the DOM; the surface hides them while it is not
 * editable and a press then does nothing.
 */
const imageNodeView: NodeViewRenderer = ({ node: initial, getPos, editor }) => {
  let node = initial;
  const dom = document.createElement("div");
  dom.dataset.resizeContainer = "";
  const wrapper = document.createElement("div");
  wrapper.dataset.resizeWrapper = "";
  wrapper.style.position = "relative";
  const img = document.createElement("img");
  img.draggable = false;
  wrapper.append(img);
  dom.append(wrapper);

  const draw = () => {
    const src = node.attrs.src as string | null;
    if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
    img.setAttribute("alt", (node.attrs.alt as string | null) ?? "");
    const width = safeImageWidth(node.attrs.width);
    img.style.width = width === null ? "" : `${width}px`;
  };
  draw();

  for (const corner of HANDLES) {
    const handle = document.createElement("div");
    handle.dataset.resizeHandle = corner;
    handle.style.position = "absolute";
    if (corner.startsWith("top")) handle.style.top = "0";
    else handle.style.bottom = "0";
    if (corner.endsWith("left")) handle.style.left = "0";
    else handle.style.right = "0";
    // Dragging a left handle outward is moving it left.
    const direction = corner.endsWith("left") ? -1 : 1;

    handle.addEventListener("pointerdown", (start) => {
      if (!editor.isEditable || start.button !== 0) return;
      start.preventDefault();
      start.stopPropagation();
      const startWidth = img.offsetWidth;
      const column = dom.clientWidth;
      const max = Math.min(MAX_IMAGE_WIDTH, column > 0 ? column : MAX_IMAGE_WIDTH);
      let width = startWidth;
      handle.setPointerCapture?.(start.pointerId);
      dom.dataset.resizeState = "true";

      const move = (event: PointerEvent) => {
        width = Math.round(Math.min(max, Math.max(MIN_IMAGE_RESIZE_WIDTH, startWidth + direction * (event.clientX - start.clientX))));
        img.style.width = `${width}px`;
      };
      const end = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        dom.dataset.resizeState = "false";
        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (width === startWidth || pos === undefined || !editor.isEditable) {
          draw();
          return;
        }
        editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, width }));
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    });
    wrapper.append(handle);
  }

  return {
    dom,
    update(next) {
      if (next.type !== node.type) return false;
      node = next;
      draw();
      return true;
    },
    stopEvent: (event) => event.target instanceof HTMLElement && event.target.dataset.resizeHandle !== undefined,
    ignoreMutation: () => true,
  };
};

export function buildExtensions(config: EditorSchemaConfig): AnyExtension[] {
  const extended = config.formatting === "extended";

  // Cmd+K and Ctrl+K on every platform, as the editor has always taken
  // either: "Mod-k" alone would be Cmd only on a Mac and Ctrl only elsewhere.
  const keymap = Extension.create({
    name: "carbonKeymap",
    addKeyboardShortcuts() {
      const openLink = () => {
        if (!this.editor.isEditable) return false;
        config.onLinkShortcut();
        return true;
      };
      return { "Meta-k": openLink, "Ctrl-k": openLink };
    },
  });

  const extensions: AnyExtension[] = [
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
      code: extended ? {} : false,
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
      HTMLAttributes: { target: "_blank", rel: "noopener noreferrer", class: null },
    }),
    keymap,
  ];

  if (extended) extensions.push(CarbonCodeBlock);
  if (config.images) {
    extensions.push(CarbonImage.configure({ inline: false, allowBase64: false, resize: false }));
  }
  return extensions;
}
