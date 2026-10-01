import { forwardRef, useState } from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import type { Editor } from "@tiptap/core";
import { RichTextEditor, type RichTextEditorHandle } from "../rich-text-editor";

/**
 * Shared by the RichTextEditor test files.
 *
 * Under jsdom, typing through user-event goes in through ProseMirror's DOM
 * observer, which flushes asynchronously: `user.keyboard("hello")` in one call
 * outruns it and loses characters. Real typing is kept to a few smoke tests,
 * one character per call (`typeChars`); everything else drives the editor
 * through its own state and the events ProseMirror listens to.
 */

type EditorProps = React.ComponentProps<typeof RichTextEditor>;

/** A controlled host, which is how the component is meant to be used. */
export const Harness = forwardRef<
  RichTextEditorHandle,
  { initial?: string; onChange?: (html: string) => void } & Partial<Omit<EditorProps, "value" | "onChange">>
>(function Harness({ initial = "", onChange, ...props }, ref) {
  const [value, setValue] = useState(initial);
  return (
    <RichTextEditor
      ref={ref}
      value={value}
      onChange={(html) => {
        setValue(html);
        onChange?.(html);
      }}
      ariaLabel="Notes"
      {...props}
    />
  );
});

export const surface = (name = "Notes") => screen.getByRole("textbox", { name });

/** The TipTap editor behind a surface. TipTap puts it on its view's DOM node. */
export function editorOf(el: HTMLElement): Editor {
  const editor = (el as unknown as { editor?: Editor }).editor;
  if (!editor) throw new Error("no TipTap editor on this element");
  return editor;
}

/** Run something that dispatches a transaction, flushing React's updates. */
export function edit(run: () => void): void {
  act(run);
}

/** Real typing, one character per call so ProseMirror's observer keeps up. */
export async function typeChars(user: ReturnType<typeof userEvent.setup>, text: string) {
  for (const ch of text) await user.keyboard(ch);
}

/**
 * Typing as ProseMirror's input rules see it: each character offered to
 * `handleTextInput` first, the way a keypress would be, and inserted plainly
 * when nothing claims it.
 */
export function typeText(editor: Editor, text: string): void {
  act(() => {
    for (const ch of text) {
      const { view } = editor;
      const { from, to } = view.state.selection;
      const insert = () => view.state.tr.insertText(ch, from, to);
      const handled = view.someProp("handleTextInput", (f) => f(view, from, to, ch, insert));
      if (!handled) view.dispatch(insert());
    }
  });
}

/** A keyboard shortcut, as ProseMirror's keymap reads it. jsdom is not a Mac, so Mod is Ctrl. */
export function press(
  el: HTMLElement,
  key: string,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {},
): boolean {
  let notPrevented = true;
  act(() => {
    notPrevented = fireEvent.keyDown(el, {
      key,
      ctrlKey: modifiers.ctrl ?? false,
      shiftKey: modifiers.shift ?? false,
      altKey: modifiers.alt ?? false,
      metaKey: modifiers.meta ?? false,
    });
  });
  return notPrevented;
}

/** A stub clipboard or drag payload. */
export function transfer(data: Record<string, string>, files: File[] = []) {
  return {
    getData: (type: string) => data[type] ?? "",
    types: Object.keys(data),
    files: Object.assign([...files], { item: (i: number) => files[i] ?? null }),
    items: [],
  };
}

export function paste(el: HTMLElement, data: Record<string, string>, files: File[] = []): void {
  act(() => {
    fireEvent.paste(el, { clipboardData: transfer(data, files) });
  });
}

const VOID = new Set(["br", "img"]);
const IGNORED_ATTRIBUTES = new Set(["target", "rel"]);

function canonicalNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (!(node instanceof Element)) return "";
  const tag = node.tagName.toLowerCase();
  const attrs = [...node.attributes]
    .filter((attr) => !IGNORED_ATTRIBUTES.has(attr.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((attr) => ` ${attr.name}="${attr.value}"`)
    .join("");
  if (VOID.has(tag)) return `<${tag}${attrs}>`;
  return `<${tag}${attrs}>${[...node.childNodes].map(canonicalNode).join("")}</${tag}>`;
}

/**
 * HTML as a tree, not as a string: attributes sorted, `target`/`rel` ignored
 * (the sanitizer composes its own), `<br />` and `<br>` the same, entities
 * decoded. Two strings with the same canonical form render the same document.
 */
export function canonical(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return [...doc.body.childNodes].map(canonicalNode).join("");
}

/** Every tag name in a string of HTML. */
export function tagsIn(html: string): Set<string> {
  return new Set([...html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)].map(([, name]) => name.toLowerCase()));
}
