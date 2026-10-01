"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Fragment as PMFragment, Slice, type Node as PMNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { cn } from "@/lib/cn";
import { isRichTextEmpty, type RichTextFormatting } from "@/lib/rich-text";
import { buildExtensions } from "./rich-text-editor-extensions";
import { RichTextToolbar } from "./rich-text-editor-toolbar";
import { dropPlaceholderBreaks, fromEditorHtml, toEditorHtml } from "./rich-text-editor-value";
import { TooltipProvider } from "./tooltip";

export type { RichTextFormatting } from "@/lib/rich-text";

/** A toolbar button that inserts a fixed snippet at the caret. */
export interface RichTextInsertAction {
  /** The button's text, and its accessible name. */
  label: string;
  /** Shown in a tooltip, e.g. what the snippet expands to. */
  title?: string;
  /** Reduced to this editor's schema on insert, the same way a paste is. */
  html: string;
}

/**
 * An href the full link panel accepts that is not a URL, such as
 * `{{booking_link}}`, for markup an app fills in later. App-supplied: Carbon
 * knows nothing about what it means.
 */
export interface RichTextLinkTarget {
  /** The canonical form stored, matching `/^\{\{[a-z0-9_]+\}\}$/`. */
  href: string;
  /** The quick-fill button reads `Use ${name}`. */
  name: string;
  /** Help text under the quick-fill button. */
  description?: string;
}

export interface RichTextLinkPanelOptions {
  targets?: readonly RichTextLinkTarget[];
}

/** What `ref` on a `RichTextEditor` gives you. */
export interface RichTextEditorHandle {
  /**
   * Focus the editor, put the caret back where it last was, and insert `html`
   * there, reduced to this editor's schema. Does nothing before the editor
   * exists (the first client render) or after it is gone.
   */
  insert(html: string): void;
  focus(): void;
}

export interface RichTextEditorProps {
  /** The current HTML. See the note on `onChange` about what may be fed back. */
  value: string;
  /**
   * Called with the editor's HTML on every edit by the person using it — never
   * on mount, and never when `value` replaces the content. `""` when the
   * editor is empty.
   *
   * **Store this through `sanitizeRichText`, but do not sanitize it here.** The
   * value handed back through `value` has to be the same string this emitted, or
   * the sync effect treats it as an external change, replaces the content, and
   * drops the caret to the start of the field on every keystroke. Sanitize where the
   * value is *stored* and again where it is *rendered* — see src/lib/rich-text.ts.
   */
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Applied to the editable surface, e.g. `min-h-40` to make the box taller. */
  className?: string;
  /** Lands on the editable surface, so a `<label for>` names it and a form can focus it. */
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  /** Marks the surface invalid for assistive tech and draws the error border. */
  invalid?: boolean;
  /**
   * `extended` adds headings 1–3, strikethrough, quotes, inline code and code
   * blocks, Markdown-style typing shortcuts, and HTML paste reduced to those.
   * `basic` (the default) pastes plain text. Sanitize with the same
   * `formatting`.
   */
  formatting?: RichTextFormatting;
  /**
   * Adds an Insert image button. The picked file is passed here and the URL it
   * resolves to is inserted at the caret; `null` or a rejection inserts
   * nothing, and the app shows its own error. A relative URL is made absolute
   * against the page; one `sanitizeRichText` would drop (`data:`, `blob:`)
   * inserts nothing. Sanitize with `images: true`.
   */
  uploadImage?: (file: File) => Promise<string | null>;
  /**
   * The full link panel instead of the inline link row: a "Text to show" field,
   * an inline error, URL normalisation (`normalizeLinkHref`), autolink as you
   * type, and optional link `targets`.
   */
  linkPanel?: boolean | RichTextLinkPanelOptions;
  /** A toolbar button for each, inserting its HTML at the caret. */
  insertActions?: readonly RichTextInsertAction[];
  /** Read a `value` with no tags in it as plain text: blank lines are paragraphs, newlines line breaks. */
  acceptPlainText?: boolean;
}

/** The base classes on the editable surface, before the app's `className`. */
const SURFACE = cn(
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
  "[&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-offset-2 [&_img.ProseMirror-selectednode]:outline-accent",
);

/** Has the clipboard or drop got files and nothing to read as text? */
function onlyFiles(data: DataTransfer | null): boolean {
  if (!data || data.files.length === 0) return false;
  return !data.getData("text/plain") && !data.getData("text/html");
}

/**
 * A pasted or dropped slice without its images. Images come in through the
 * Insert image button only: an `<img>` in HTML copied from a web page or an
 * email points at somebody else's server, and rendering it would fetch it (a
 * tracking pixel, say) the moment it was pasted. ProseMirror parses the
 * clipboard in an inert document, so nothing is fetched before this runs.
 */
function withoutImages(fragment: PMFragment): PMFragment {
  const kept: PMNode[] = [];
  fragment.forEach((node) => {
    if (node.type.name === "image") return;
    kept.push(node.isLeaf ? node : node.copy(withoutImages(node.content)));
  });
  return PMFragment.fromArray(kept);
}

/**
 * Paste as plain text: one paragraph per line, carrying the marks at the caret,
 * the way ProseMirror reads a plain-text clipboard.
 */
function pastePlainText(view: EditorView, text: string): void {
  const { schema, selection } = view.state;
  const marks = selection.$from.marks();
  const paragraphs = text
    .split(/(?:\r\n?|\n)+/)
    .map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line, marks) : null));
  const slice = new Slice(PMFragment.from(paragraphs), 1, 1);
  view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
}

/**
 * The editor itself. Apps get it through `RichTextEditor` in
 * rich-text-editor.tsx, which loads this module only when an editor renders.
 *
 * A WYSIWYG editor for a paragraph or two of prose. With no opt-ins: bold,
 * italic, two kinds of list, and links. Each prop under "new, all optional"
 * switches on one more capability for that editor only.
 *
 * ## It emits HTML and does not sanitize it
 *
 * This is a client. Whatever it produces reaches a server as a string in a form
 * post, and that string can say anything regardless of what this component would
 * have done — so this component is not, and cannot be, the place the markup is
 * made safe. `sanitizeRichText` in `@codelittinc/carbon-design-system/utils` is,
 * and it is a separate server-safe entry precisely so the *server* can call it.
 * The full contract is documented there. The one thing to carry over here: the
 * editor's schema produces exactly the tags `sanitizeRichText` allows for the
 * same `formatting` and `images` options, so nothing a user types through this
 * UI is lost on the way to the database.
 *
 * ## Built on TipTap
 *
 * The schema is derived from the props once, at mount (see
 * rich-text-editor-extensions.ts), and that is what keeps the output inside the
 * tag set: a button, a shortcut, a Markdown rule or a paste has nothing to make
 * any other tag with. `formatting`, whether `uploadImage` and `linkPanel` are
 * set, and the link targets are therefore read once; to change them, change the
 * editor's `key`. The `uploadImage` and `onChange` functions themselves may
 * change on every render.
 *
 * The default editor pastes plain text on purpose: pasting from Word or a web
 * page otherwise carries in a document's worth of markup that the sanitizer then
 * reduces to unstyled prose anyway, with the paragraph breaks in surprising
 * places.
 */
export const RichTextEditorImpl = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor(
  {
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
    acceptPlainText = false,
  },
  ref,
) {
  // Capabilities are fixed at mount, because they are the schema.
  const [capabilities] = useState(() => ({
    formatting,
    images: uploadImage !== undefined,
    linkPanel: linkPanel !== undefined && linkPanel !== false,
    targets: (typeof linkPanel === "object" ? linkPanel.targets : undefined) ?? [],
  }));
  const extended = capabilities.formatting === "extended";

  const [linkOpen, setLinkOpen] = useState(false);
  const [status, setStatus] = useState("");

  /**
   * The last HTML this component emitted, or the `value` it last loaded. The
   * sync effect compares against it to tell its own edits (do nothing — the
   * document is already right) from an external change such as a form reset
   * (replace the content). Without this, every keystroke round-trips through
   * the parent and comes back as "new" HTML, which resets the caret to the top
   * of the field.
   */
  const lastEmitted = useRef<string | null>(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const uploadImageRef = useRef(uploadImage);
  uploadImageRef.current = uploadImage;
  const openLinkRef = useRef(() => setLinkOpen(true));

  const [extensions] = useState(() =>
    buildExtensions({
      formatting: capabilities.formatting,
      images: capabilities.images,
      linkPanel: capabilities.linkPanel,
      onLinkShortcut: () => openLinkRef.current(),
    }),
  );
  const [initialContent] = useState(() => toEditorHtml(value, acceptPlainText));
  const surfaceClass = cn(SURFACE, disabled && "cursor-not-allowed", className);

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: surfaceClass,
        role: "textbox",
        "aria-multiline": "true",
        ...(id ? { id } : {}),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
        ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
      handlePaste: (view: EditorView, event: ClipboardEvent) => {
        // Image paste is not a feature: a clipboard holding only files inserts nothing.
        if (onlyFiles(event.clipboardData)) return true;
        if (extended) return false;
        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain") ?? "";
        if (text) pastePlainText(view, text);
        return true;
      },
      handleDrop: (_view: EditorView, event: DragEvent) => (event.dataTransfer?.files.length ?? 0) > 0,
      transformPastedHTML: dropPlaceholderBreaks,
      transformPasted: (slice: Slice) => {
        const content = withoutImages(slice.content);
        return content.size === 0 ? Slice.empty : new Slice(content, slice.openStart, slice.openEnd);
      },
      handleDOMEvents: {
        // A link in the surface places the caret; it never navigates, editable
        // or not.
        click: (_view: EditorView, event: MouseEvent) => {
          if ((event.target as Element | null)?.closest?.("a")) event.preventDefault();
          return false;
        },
      },
    }),
    [extended, surfaceClass, id, ariaLabel, ariaLabelledBy, ariaDescribedBy, invalid],
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
    onUpdate: ({ editor: updated }) => {
      const out = fromEditorHtml(updated.getHTML());
      if (out === lastEmitted.current) return;
      lastEmitted.current = out;
      onChangeRef.current(out);
    },
  });

  // Push `value` into the editor only when it did not come from here.
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
    // `false`: the default emits an update, which would call onChange
    // without an edit.
    editor.setEditable(!disabled, false);
    // A save starting closes an open link UI.
    if (disabled) setLinkOpen(false);
  }, [editor, disabled]);

  useImperativeHandle(
    ref,
    () => ({
      insert: (html: string) => {
        if (!editor || editor.isDestroyed) return;
        editor.chain().focus().insertContent(html).run();
      },
      focus: () => {
        if (!editor || editor.isDestroyed) return;
        editor.commands.focus();
      },
    }),
    [editor],
  );

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          "overflow-hidden rounded-md border bg-surface-raised shadow-sm transition-colors focus-within:ring-2 focus-within:ring-accent/50",
          invalid ? "border-error-border" : "border-border",
          disabled && "opacity-50",
        )}
      >
        <RichTextToolbar
          editor={editor}
          formatting={capabilities.formatting}
          images={capabilities.images}
          linkPanel={capabilities.linkPanel}
          targets={capabilities.targets}
          insertActions={insertActions ?? []}
          disabled={disabled}
          linkOpen={linkOpen && !disabled}
          onLinkOpenChange={setLinkOpen}
          uploadImage={uploadImageRef}
          onStatus={setStatus}
          controls={id}
        />

        <div className="relative">
          {placeholder && isRichTextEmpty(value) && (
            // An overlay rather than TipTap's placeholder pseudo-element, so it
            // can be aria-hidden, and so it uses `isRichTextEmpty` — the same
            // check the consumer uses to decide between the note and its empty
            // state.
            <p aria-hidden="true" className="pointer-events-none absolute left-3 top-2 text-sm text-text-muted">
              {placeholder}
            </p>
          )}
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            // The server render and the first client render: the same box at
            // the same size, empty until the editor exists. `value` is not
            // rendered here, because the editor is not a sanitizer.
            <div aria-hidden="true" className={surfaceClass} />
          )}
        </div>
        {capabilities.images && (
          <p role="status" className="sr-only">
            {status}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
});
