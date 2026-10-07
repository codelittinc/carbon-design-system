"use client";

import type { MouseEvent, ReactElement } from "react";
import { File as FileIcon } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { FileViewerBody } from "./file-viewer-body";

/** Why the viewer is asking the app for content. */
export type FileViewerFallbackReason = "doc" | "render-failed" | "unsupported";

export interface FileViewerFallbackRequest {
  /**
   * `doc` for a Word 97–2003 file, `render-failed` for a `.docx` the browser
   * could not lay out, `unsupported` for a type the viewer has no renderer for.
   */
  reason: FileViewerFallbackReason;
  url: string;
  filename: string;
  /** The resolved MIME type, lowercased and without parameters; "" when unknown. */
  contentType: string;
  /** Aborted when the dialog closes; pass it to fetch. */
  signal: AbortSignal;
}

/**
 * What the app can show instead. `html` is sanitised again by the viewer;
 * `text` is shown as preformatted text, with `note` in a banner above it.
 */
export type FileViewerFallbackContent = { html: string } | { text: string; note?: string };

/** Resolves to the content to show, or null/undefined for the download-only message. */
export type FileViewerFallback = (
  request: FileViewerFallbackRequest,
) => Promise<FileViewerFallbackContent | null | undefined>;

export interface FileViewerProps {
  /** Same-origin file URL; fetched with the browser's normal credentials. */
  url: string;
  /** Dialog title, Download filename, iframe title and image alt. */
  filename: string;
  /** Decides the renderer when given. Otherwise the response's Content-Type does. */
  contentType?: string | null;
  /** Content for `.doc`, failed DOCX renders and unsupported types. Omit for download-only. */
  loadFallback?: FileViewerFallback;
  /**
   * The trigger: one element that forwards its ref and props, such as a
   * `Button`. Optional in controlled mode.
   */
  children?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Triggers sit inside clickable containers (a board card that opens a
 * candidate), so a click on the trigger or anywhere in the dialog stops here.
 * React bubbles a portal's events up the component tree, so this one handler
 * covers the trigger, the content and the overlay. Only `click`: Radix's
 * outside-dismiss listens for `pointerdown` on the document, and stopping that
 * would break backdrop close in an app whose React root is not the document.
 */
function stopClick(event: MouseEvent): void {
  event.stopPropagation();
}

/**
 * A file in a dialog over the page: PDF in the browser's own viewer, Word
 * (`.docx`) laid out as pages, CSV as a table, PNG/JPEG/GIF/BMP/WebP/AVIF
 * images and plain text. Legacy `.doc`, a `.docx` that can't be laid out and
 * other types show what `loadFallback` returns, or a Download.
 *
 * Wrap any trigger, or pass `open`/`onOpenChange` to control it. Every open
 * fetches the file afresh. PDFs frame `url`, so the app must allow same-origin
 * framing of that route; see the README.
 */
export function FileViewer({
  url,
  filename,
  contentType,
  loadFallback,
  children,
  open,
  onOpenChange,
}: FileViewerProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `contents`, so the trigger's layout is untouched. */}
      <span className="contents" onClick={stopClick}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent
          aria-describedby={undefined}
          className="h-[92dvh] max-h-[92dvh] w-[calc(100%-2rem)] max-w-5xl overflow-hidden p-0"
        >
          <DialogHeader className="mb-0 flex items-center gap-3 space-y-0 border-b border-border px-4 py-3 pr-12">
            <FileIcon className="h-4 w-4 shrink-0 text-text-faint" aria-hidden="true" />
            <DialogTitle title={filename} className="min-w-0 flex-1 truncate text-sm font-semibold">
              {filename}
            </DialogTitle>
            {/* Same-origin, so `download` beats the route's inline disposition. */}
            <Button asChild size="sm" className="shrink-0">
              <a href={url} download={filename}>
                Download
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <span className="hidden sm:inline">Open in new tab</span>
                <span className="sm:hidden">Open</span>
              </a>
            </Button>
          </DialogHeader>
          <DialogBody className="bg-surface-overlay">
            {/* Keyed on the file, so a new URL while open starts from a fresh body:
                the previous renderer never frames or loads it unchecked. */}
            <FileViewerBody
              key={url}
              url={url}
              filename={filename}
              contentType={contentType}
              loadFallback={loadFallback}
            />
          </DialogBody>
        </DialogContent>
      </span>
    </Dialog>
  );
}
