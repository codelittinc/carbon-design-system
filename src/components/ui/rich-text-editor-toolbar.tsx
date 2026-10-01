"use client";

import { Fragment, useRef, useState, type ReactNode } from "react";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  SquareCode,
  Strikethrough,
  TextQuote,
  type LucideIcon,
} from "lucide-react";
import type { RichTextFormatting } from "@/lib/rich-text";
import { Button } from "./button";
import { RichTextImageButton } from "./rich-text-image-button";
import { RichTextLinkPanel, type LinkPanelTarget } from "./rich-text-link-panel";
import { RichTextLinkRow } from "./rich-text-link-row";
import { ToolbarButton, useIsApplePlatform, type Shortcut } from "./rich-text-toolbar-button";
import { Separator } from "./separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface ToolbarInsertAction {
  label: string;
  title?: string;
  html: string;
}

export interface RichTextToolbarProps {
  /** `null` until the client editor exists; every control is disabled until then. */
  editor: Editor | null;
  formatting: RichTextFormatting;
  images: boolean;
  linkPanel: boolean;
  targets: readonly LinkPanelTarget[];
  insertActions: readonly ToolbarInsertAction[];
  disabled: boolean;
  linkOpen: boolean;
  onLinkOpenChange: (open: boolean) => void;
  uploadImage: React.RefObject<((file: File) => Promise<string | null>) | undefined>;
  onStatus: (message: string) => void;
  /** The editable surface's id, for `aria-controls`. */
  controls?: string;
}

interface Toggle {
  key: string;
  label: string;
  icon: LucideIcon;
  shortcut: Shortcut;
  active: boolean;
  run: (editor: Editor) => void;
}

const INACTIVE = {
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
  link: false,
};

/**
 * The editor's toolbar: `role="toolbar"` with one Tab stop, Left/Right/Home/End
 * between controls (the ARIA toolbar pattern), and Tab on to the text.
 *
 * Controls come in fixed groups — inline, blocks, lists, insert, actions — so
 * Bold is in the same place in every configuration. The default editor has no
 * separators, so it looks as it always has; once an opt-in adds a control, a
 * separator goes between every pair of non-empty groups.
 */
export function RichTextToolbar({
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
  controls,
}: RichTextToolbarProps) {
  const apple = useIsApplePlatform();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const extended = formatting === "extended";
  const inert = disabled || editor === null;

  // Subscribed rather than read at render: the editor does not re-render the
  // toolbar when only the caret moves, and pressed states have to follow it.
  // Only names in this editor's schema are asked about — `isActive` of a name
  // the schema lacks answers for any node at all.
  const active =
    useEditorState({
      editor,
      selector: ({ editor: e }) =>
        e
          ? {
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
              link: e.isActive("link"),
            }
          : INACTIVE,
    }) ?? INACTIVE;

  const toggle = (
    key: string,
    label: string,
    icon: LucideIcon,
    shortcut: Shortcut,
    isActive: boolean,
    run: (editor: Editor) => void,
  ): Toggle => ({ key, label, icon, shortcut, active: isActive, run });

  const inline: Toggle[] = [
    toggle("bold", "Bold", Bold, { mod: true, key: "B" }, active.bold, (e) => e.chain().focus().toggleBold().run()),
    toggle("italic", "Italic", Italic, { mod: true, key: "I" }, active.italic, (e) =>
      e.chain().focus().toggleItalic().run(),
    ),
    ...(extended
      ? [
          toggle("strike", "Strikethrough", Strikethrough, { mod: true, shift: true, key: "S" }, active.strike, (e) =>
            e.chain().focus().toggleStrike().run(),
          ),
          toggle("code", "Inline code", Code, { mod: true, key: "E" }, active.code, (e) =>
            e.chain().focus().toggleCode().run(),
          ),
        ]
      : []),
  ];

  const blocks: Toggle[] = extended
    ? [
        toggle("h1", "Heading 1", Heading1, { mod: true, alt: true, key: "1" }, active.h1, (e) =>
          e.chain().focus().toggleHeading({ level: 1 }).run(),
        ),
        toggle("h2", "Heading 2", Heading2, { mod: true, alt: true, key: "2" }, active.h2, (e) =>
          e.chain().focus().toggleHeading({ level: 2 }).run(),
        ),
        toggle("h3", "Heading 3", Heading3, { mod: true, alt: true, key: "3" }, active.h3, (e) =>
          e.chain().focus().toggleHeading({ level: 3 }).run(),
        ),
        toggle("quote", "Quote", TextQuote, { mod: true, shift: true, key: "B" }, active.blockquote, (e) =>
          e.chain().focus().toggleBlockquote().run(),
        ),
        toggle("codeBlock", "Code block", SquareCode, { mod: true, alt: true, key: "C" }, active.codeBlock, (e) =>
          e.chain().focus().toggleCodeBlock().run(),
        ),
      ]
    : [];

  const lists: Toggle[] = [
    toggle("bulletList", "Bulleted list", List, { mod: true, shift: true, key: "8" }, active.bulletList, (e) =>
      e.chain().focus().toggleBulletList().run(),
    ),
    toggle("orderedList", "Numbered list", ListOrdered, { mod: true, shift: true, key: "7" }, active.orderedList, (e) =>
      e.chain().focus().toggleOrderedList().run(),
    ),
  ];

  // Roving tabindex. Every control is listed in DOM order with whether it can
  // take focus; the one somebody last focused keeps the Tab stop, or the first
  // enabled one when that is gone (disabled mid-upload, say).
  const order: { key: string; enabled: boolean }[] = [
    ...[...inline, ...blocks, ...lists].map((t) => ({ key: t.key, enabled: !inert })),
    { key: "link", enabled: !inert },
    ...(images ? [{ key: "image", enabled: !inert }] : []),
    ...insertActions.map((_, index) => ({ key: `action-${index}`, enabled: !inert })),
  ];
  const enabledKeys = order.filter((item) => item.enabled).map((item) => item.key);
  const tabStop = current !== null && enabledKeys.includes(current) ? current : enabledKeys[0];

  const roving = (key: string) => ({
    "data-toolbar-item": key,
    tabIndex: key === tabStop ? 0 : -1,
    onFocus: () => setCurrent(key),
  });

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = (event.target as HTMLElement).getAttribute("data-toolbar-item");
    if (key === null || enabledKeys.length === 0) return;
    const index = enabledKeys.indexOf(key);
    const last = enabledKeys.length - 1;
    const next =
      event.key === "ArrowRight"
        ? enabledKeys[index === last ? 0 : index + 1]
        : event.key === "ArrowLeft"
          ? enabledKeys[index <= 0 ? last : index - 1]
          : event.key === "Home"
            ? enabledKeys[0]
            : event.key === "End"
              ? enabledKeys[last]
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    toolbarRef.current?.querySelector<HTMLElement>(`[data-toolbar-item="${next}"]`)?.focus();
  };

  const renderToggle = (t: Toggle) => (
    <ToolbarButton
      key={t.key}
      label={t.label}
      icon={t.icon}
      shortcut={t.shortcut}
      pressed={t.active}
      apple={apple}
      disabled={inert}
      onClick={() => editor && t.run(editor)}
      {...roving(t.key)}
    />
  );

  const linkLabel = linkPanel ? (active.link ? "Edit link" : "Add link") : "Link";
  const linkButton = (
    <ToolbarButton
      label={linkLabel}
      icon={Link2}
      shortcut={{ mod: true, key: "K" }}
      pressed={linkPanel ? active.link : undefined}
      apple={apple}
      disabled={inert}
      {...(linkPanel ? {} : { onClick: () => onLinkOpenChange(true) })}
      {...roving("link")}
    />
  );

  const insertGroup: ReactNode[] = [
    linkPanel && editor ? (
      <RichTextLinkPanel
        key="link"
        editor={editor}
        open={linkOpen}
        onOpenChange={onLinkOpenChange}
        targets={targets}
        editing={active.link}
        trigger={linkButton}
      />
    ) : (
      <Fragment key="link">{linkButton}</Fragment>
    ),
    ...(images
      ? [
          <RichTextImageButton
            key="image"
            editor={editor}
            uploadImage={uploadImage}
            onStatus={onStatus}
            apple={apple}
            disabled={inert}
            {...roving("image")}
          />,
        ]
      : []),
  ];

  const actionGroup: ReactNode[] = insertActions.map((action, index) => {
    const button = (
      <Button
        key={`action-${index}`}
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        disabled={inert}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor?.chain().focus().insertContent(action.html).run()}
        {...roving(`action-${index}`)}
      >
        {action.label}
      </Button>
    );
    if (!action.title) return button;
    return (
      <Tooltip key={`action-${index}`}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-words">
          {action.title}
        </TooltipContent>
      </Tooltip>
    );
  });

  const groups = [inline.map(renderToggle), blocks.map(renderToggle), lists.map(renderToggle), insertGroup, actionGroup]
    .filter((group) => group.length > 0);
  const separated = extended || images || linkPanel || insertActions.length > 0;

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Formatting"
      aria-controls={controls}
      onKeyDown={onKeyDown}
      className="flex flex-wrap items-center gap-0.5 border-b border-border-subtle bg-surface px-1.5 py-1"
    >
      {linkOpen && !linkPanel && editor ? (
        <RichTextLinkRow editor={editor} onClose={() => onLinkOpenChange(false)} apple={apple} />
      ) : (
        groups.map((group, index) => (
          <Fragment key={index}>
            {separated && index > 0 && <Separator orientation="vertical" className="mx-1 h-4 self-center" />}
            {group}
          </Fragment>
        ))
      )}
    </div>
  );
}
