"use client";

import { useId, type HTMLAttributes, type MouseEvent, type ReactElement } from "react";
import { File as FileIcon } from "lucide-react";
import { cn } from "@/lib/cn";
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
  /**
   * Aborted when the dialog closes, or when a `FileViewerPanel` unmounts or is
   * given another file; pass it to fetch, and treat its abort as nothing.
   */
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
 * What the body is keyed on: a different file, name or declared type starts
 * a fresh body, so the previous renderer never stays up while the next loads.
 */
function fileKey(url: string, filename: string, contentType: string | null | undefined): string {
  return JSON.stringify([url, filename, contentType ?? null]);
}

/**
 * Download and Open in new tab: the same two on the dialog and the panel. The
 * short "Open" follows the header's own width (a container query), so a panel
 * in a narrow column keeps room for the filename whatever the window's width.
 */
function FileViewerActions({ url, filename }: { url: string; filename: string }): ReactElement {
  return (
    <>
      {/* Same-origin, so `download` beats the route's inline disposition. */}
      <Button asChild size="sm" className="shrink-0">
        <a href={url} download={filename}>
          Download
        </a>
      </Button>
      <Button asChild size="sm" variant="outline" className="shrink-0">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <span className="hidden @md:inline">Open in new tab</span>
          <span className="@md:hidden">Open</span>
        </a>
      </Button>
    </>
  );
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
          <DialogHeader className="@container mb-0 flex items-center gap-3 space-y-0 border-b border-border px-4 py-3 pr-12">
            <FileIcon className="h-4 w-4 shrink-0 text-text-faint" aria-hidden="true" />
            <DialogTitle title={filename} className="min-w-0 flex-1 truncate text-sm font-semibold">
              {filename}
            </DialogTitle>
            <FileViewerActions url={url} filename={filename} />
          </DialogHeader>
          <DialogBody className="bg-surface-overlay">
            {/* Keyed on the file, so a new URL while open starts from a fresh body:
                the previous renderer never frames or loads it unchecked. */}
            <FileViewerBody
              key={fileKey(url, filename, contentType)}
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

export interface FileViewerPanelProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Same-origin file URL; fetched with the browser's normal credentials. */
  url: string;
  /** The panel's heading, Download filename, iframe title and image alt. */
  filename: string;
  /** Decides the renderer when given. Otherwise the response's Content-Type does. */
  contentType?: string | null;
  /** Content for `.doc`, failed DOCX renders and unsupported types. Omit for download-only. */
  loadFallback?: FileViewerFallback;
  /** The heading's level in the page; `h2` by default. */
  headingLevel?: 2 | 3 | 4;
}

/**
 * `FileViewer` in place rather than in a dialog, for a page that shows the file
 * beside something else — a step in a course with the steps listed next to it.
 * The same renderers, fallback and Download / Open in new tab. It loads when it
 * mounts and again for another file, name or type; unmounting aborts the load.
 *
 * It fills its box: `h-[70dvh]` unless `className` gives another height (a PDF
 * frame has none of its own). Other props (`id`, `data-*`, `aria-*`) go on the
 * panel's `<section>`.
 */
export function FileViewerPanel({
  url,
  filename,
  contentType,
  loadFallback,
  headingLevel = 2,
  className,
  ...rest
}: FileViewerPanelProps): ReactElement {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={headingId}
      {...rest}
      className={cn("flex h-[70dvh] min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-surface", className)}
    >
      <div className="@container flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <FileIcon className="h-4 w-4 shrink-0 text-text-faint" aria-hidden="true" />
        <Heading id={headingId} title={filename} className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
          {filename}
        </Heading>
        <FileViewerActions url={url} filename={filename} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-overlay">
        <FileViewerBody
          key={fileKey(url, filename, contentType)}
          url={url}
          filename={filename}
          contentType={contentType}
          loadFallback={loadFallback}
        />
      </div>
    </section>
  );
}
