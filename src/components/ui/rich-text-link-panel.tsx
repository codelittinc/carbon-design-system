"use client";

import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import { getMarkRange, type Editor } from "@tiptap/core";
import { Unlink } from "lucide-react";
import { cn } from "@/lib/cn";
import { linkHrefErrorMessage, normalizeLinkHref, type LinkHrefReason } from "@/lib/link-href";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/** An app-declared link target, as `RichTextEditor`'s `linkPanel.targets` takes it. */
export interface LinkPanelTarget {
  href: string;
  name: string;
  description?: string;
}

/**
 * The full link panel: a popover off the Link button for adding, changing and
 * removing a link, with an inline error and the app's link targets.
 *
 * A Popover, so Radix's layer stack gives Escape to it alone and a host Dialog
 * stays open with its draft. Closing it through Apply, Remove, Cancel or Escape
 * hands focus back to the editor, not the trigger: the person was writing and
 * goes on writing.
 */
export function RichTextLinkPanel({
  editor,
  open,
  onOpenChange,
  targets,
  editing,
  trigger,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: readonly LinkPanelTarget[];
  /** Whether the caret is in a link, which names the panel "Edit link". */
  editing: boolean;
  trigger: ReactElement;
}) {
  const label = editing ? "Edit link" : "Add link";
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={label}
        // The panel focuses its URL field itself, and closing returns focus to
        // the editor, not the trigger.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={() => editor.commands.focus()}
      >
        <LinkPanel editor={editor} targets={targets} onDone={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}

/**
 * The selection widened to every link it touches, end to end. A selection that
 * only partly covers a link still counts as editing that link, so Apply and
 * Remove have to reach the whole of it — extendMarkRange only does that when
 * the selection STARTS inside the link.
 *
 * A caret is looked up on its own: at a link's right edge, where the inclusive
 * mark still counts it as in the link, nodesBetween visits only what comes
 * AFTER the caret, while getMarkRange also looks behind it.
 */
function linkRange(editor: Editor, from: number, to: number): { from: number; to: number } {
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
  onDone,
}: {
  editor: Editor;
  targets: readonly LinkPanelTarget[];
  onDone: () => void;
}) {
  const id = useId();
  const urlRef = useRef<HTMLInputElement>(null);
  const hrefs = targets.map((target) => target.href);
  // Read once, when the panel opens. A selection that only partly covers a
  // link still counts as editing it, prefilled from that link.
  const [opened] = useState(() => {
    const href = editor.getAttributes("link").href as string | undefined;
    const { empty, from, to } = editor.state.selection;
    return { href: href ?? "", editing: href !== undefined, empty, from, to };
  });
  const [url, setUrl] = useState(opened.href);
  const [text, setText] = useState("");
  const [error, setError] = useState<LinkHrefReason | null>(null);

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
    // The caret ends at the link's right edge, and the link mark is inclusive
    // here (TipTap ties that to autolink), so the unsetMark there stops
    // whatever is typed next from running on inside the link.
    if (opened.editing) {
      const range = linkRange(editor, opened.from, opened.to);
      editor
        .chain()
        .focus()
        .setTextSelection(range)
        .setLink({ href })
        .setTextSelection(range.to)
        .unsetMark("link")
        .run();
    } else if (!opened.empty) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: opened.from, to: opened.to })
        .setLink({ href })
        .setTextSelection(opened.to)
        .unsetMark("link")
        .run();
    } else {
      // A JSON node, never an HTML string, so neither the text nor the href
      // can be parsed as markup.
      editor
        .chain()
        .focus()
        .setTextSelection(opened.from)
        .insertContent({
          type: "text",
          text: text.trim() || href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .unsetMark("link")
        .run();
    }
    onDone();
  }

  function remove() {
    editor
      .chain()
      .focus()
      .setTextSelection(linkRange(editor, opened.from, opened.to))
      .unsetLink()
      .setTextSelection({ from: opened.from, to: opened.to })
      .run();
    onDone();
  }

  // No <form> here: React submit events bubble through the portal to the
  // surrounding form's handlers. Enter is handled by hand instead.
  function onFieldKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    apply();
  }

  const urlId = `${id}-url`;
  const textId = `${id}-text`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={urlId} className="mb-1">
          URL
        </Label>
        <Input
          ref={urlRef}
          id={urlId}
          type="text"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError(null);
          }}
          onKeyDown={onFieldKeyDown}
          placeholder={hrefs.length > 0 ? `https://example.com or ${hrefs[0]}` : "https://example.com"}
          className={cn(error && "border-error-border")}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 break-words text-xs text-error-text">
            {linkHrefErrorMessage(error, { targets: hrefs })}
          </p>
        )}
        {targets.length > 0 && (
          <div className="mt-2 space-y-2">
            {targets.map((target) => (
              <div key={target.href}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUrl(target.href);
                    setError(null);
                    urlRef.current?.focus();
                  }}
                >
                  {/* One string: Button wraps each text child in its own span, and
                      "Use " and the name in two would lose the space between them. */}
                  {`Use ${target.name}`}
                </Button>
                {target.description && (
                  <p className="mt-1 break-words text-xs text-text-muted">{target.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!opened.editing && opened.empty && (
        <div>
          <Label htmlFor={textId} className="mb-1">
            Text to show (optional)
          </Label>
          <Input
            id={textId}
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onFieldKeyDown}
          />
          <p className="mt-1 break-words text-xs text-text-muted">Leave blank to show the URL.</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {opened.editing && (
          // Ghost, not destructive: removing a link keeps its text, and the
          // destructive variant is not themed.
          <Button type="button" variant="ghost" size="sm" onClick={remove} aria-label="Remove link">
            <Unlink size={13} aria-hidden />
            Remove
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={cancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={!url.trim()}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
