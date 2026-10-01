import { Extension, mergeAttributes, type AnyExtension } from "@tiptap/core";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { ListItem, ListKeymap, OrderedList } from "@tiptap/extension-list";
import { StarterKit } from "@tiptap/starter-kit";
import { isAllowedEditorHref } from "@/lib/link-href";
import type { RichTextFormatting } from "@/lib/rich-text";

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
 * Only `src` and `alt`; width, height and title are dropped as every sanitizer
 * drops them. A `src` with a scheme other than http(s) is not parsed: TipTap's
 * own rule refuses only `data:`. A relative `src` is kept, because an app's
 * `uploadImage` may return one; restricting it further is the sanitizer's job.
 * No `![alt](src)` typing rule: images come in through the button only.
 */
const CarbonImage = Image.extend({
  addAttributes() {
    return { src: { default: null }, alt: { default: null } };
  },
  addInputRules() {
    return [];
  },
  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element: HTMLElement) => {
          const src = element.getAttribute("src") ?? "";
          return isAllowedEditorHref(src) && !/^\s*mailto:/i.test(src) ? null : false;
        },
      },
    ];
  },
});

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
