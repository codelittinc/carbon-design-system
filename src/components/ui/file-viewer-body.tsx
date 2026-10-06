"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { File as FileIcon } from "lucide-react";
import {
  capText,
  decodeText,
  fileViewerKind,
  normalizeContentType,
  normalizeNewlines,
  type CsvTable,
} from "@/lib/file-viewer";
import { Alert } from "./alert";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Spinner } from "./spinner";
import { CsvView, parseCsv } from "./file-viewer-csv";
import { DocxView } from "./file-viewer-docx";
import { sanitizePreviewHtml } from "./file-viewer-html";
import type { FileViewerFallback, FileViewerFallbackContent, FileViewerFallbackReason } from "./file-viewer";

/**
 * What the open `FileViewer` shows, worked out once per mount. Radix unmounts
 * the dialog's content on close, so every open is a fresh mount: its requests
 * and the fallback share one `AbortController`, aborted on unmount, and every
 * state change is dropped once it is aborted, so nothing from an earlier open
 * renders into a later one. Internal, not exported.
 */

const COULD_NOT_OPEN = "We couldn't open this file. Download it to view it locally.";

/** The download-only message for each case the fallback covers. */
const NO_PREVIEW: Record<FileViewerFallbackReason, string> = {
  doc: "Word 97–2003 files can't be displayed in the browser. Download it to open it locally.",
  "render-failed": "We couldn't display this Word file. Download it to open it locally.",
  unsupported: "This file can't be previewed in the browser.",
};

type BodyState =
  | { step: "loading" }
  | { step: "error" }
  | { step: "empty" }
  | { step: "no-preview"; reason: FileViewerFallbackReason }
  | { step: "pdf" }
  | { step: "image" }
  | { step: "docx"; file: Promise<Blob | null>; onRenderFailed: () => void }
  | { step: "csv"; table: CsvTable }
  | { step: "text"; text: string; truncated: boolean; note?: string }
  | { step: "html"; html: string };

interface FileViewerBodyProps {
  url: string;
  filename: string;
  contentType?: string | null;
  loadFallback?: FileViewerFallback;
}

/** The response when it is a success, else null. Never rejects. */
async function request(url: string, signal: AbortSignal): Promise<Response | null> {
  try {
    const res = await fetch(url, { signal, credentials: "same-origin" });
    if (res.ok) return res;
    discard(res);
    return null;
  } catch {
    return null;
  }
}

/** Stops downloading a body nobody will read. */
function discard(res: Response | null): void {
  res?.body?.cancel().catch(() => {});
}

/** The response's text (UTF-8, else windows-1252), or null when reading it failed. */
async function textOf(res: Response | null): Promise<string | null> {
  if (!res) return null;
  try {
    return decodeText(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

/** What the fallback's answer shows; anything unusable is the download-only message. */
function fallbackState(
  result: FileViewerFallbackContent | null | undefined,
  reason: FileViewerFallbackReason,
): BodyState {
  if (result && "html" in result && typeof result.html === "string" && result.html.trim()) {
    return { step: "html", html: result.html };
  }
  if (result && "text" in result && typeof result.text === "string" && result.text.trim()) {
    const note = typeof result.note === "string" && result.note.trim() ? result.note : undefined;
    return { step: "text", ...capText(normalizeNewlines(result.text)), note };
  }
  return { step: "no-preview", reason };
}

export function FileViewerBody({ url, filename, contentType, loadFallback }: FileViewerBodyProps): ReactElement {
  const [state, setState] = useState<BodyState>({ step: "loading" });
  // Read when it is called, so an inline callback that is new on every render
  // doesn't restart the open.
  const fallbackRef = useRef(loadFallback);
  fallbackRef.current = loadFallback;

  useEffect(() => {
    // A new file while open: the previous renderer must not show the new URL.
    setState({ step: "loading" });
    const controller = new AbortController();
    const { signal } = controller;
    const show = (next: BodyState): void => {
      if (!signal.aborted) setState(next);
    };

    async function fallback(reason: FileViewerFallbackReason, type: string): Promise<void> {
      const load = fallbackRef.current;
      if (!load) return show({ step: "no-preview", reason });
      show({ step: "loading" });
      let result: FileViewerFallbackContent | null | undefined;
      try {
        result = await load({ reason, url, filename, contentType: type, signal });
      } catch {
        result = null;
      }
      show(fallbackState(result, reason));
    }

    async function open(): Promise<void> {
      // The declared type decides, or else what the server says the file is.
      let probe: Response | null = null;
      let type: string;
      if (contentType != null) {
        type = normalizeContentType(contentType);
      } else {
        probe = await request(url, signal);
        if (!probe) return show({ step: "error" });
        type = normalizeContentType(probe.headers.get("content-type"));
      }
      const file = (): Promise<Response | null> => (probe ? Promise.resolve(probe) : request(url, signal));

      switch (fileViewerKind(type, filename)) {
        case "pdf": {
          // A frame can't report the status of what it loaded, so the file is
          // checked first: a 401 or 404 shows a message, not JSON in a frame.
          const res = await file();
          discard(res);
          return show(res ? { step: "pdf" } : { step: "error" });
        }
        case "image":
          discard(probe);
          return show({ step: "image" });
        case "docx":
          return show({
            step: "docx",
            file: file().then((res) => (res ? res.blob().catch(() => null) : null)),
            onRenderFailed: () => void fallback("render-failed", type),
          });
        case "csv": {
          const text = await textOf(await file());
          if (text === null) return show({ step: "error" });
          if (text.trim() === "") return show({ step: "empty" });
          try {
            return show({ step: "csv", table: await parseCsv(text) });
          } catch {
            return show({ step: "error" });
          }
        }
        case "text": {
          const text = await textOf(await file());
          if (text === null) return show({ step: "error" });
          if (text.trim() === "") return show({ step: "empty" });
          return show({ step: "text", ...capText(normalizeNewlines(text)) });
        }
        case "doc":
          discard(probe);
          return fallback("doc", type);
        case "unsupported":
          discard(probe);
          return fallback("unsupported", type);
      }
    }

    void open();
    return () => controller.abort();
  }, [url, filename, contentType]);

  switch (state.step) {
    case "loading":
      return <ViewerLoading />;
    case "error":
      return <ViewerMessage text={COULD_NOT_OPEN} />;
    case "empty":
      return <ViewerMessage text="This file is empty." />;
    case "no-preview":
      return (
        <ViewerMessage
          text={NO_PREVIEW[state.reason]}
          action={
            <Button asChild className="max-w-full">
              <a href={url} download={filename}>
                Download {filename}
              </a>
            </Button>
          }
        />
      );
    case "pdf":
      return <iframe src={url} title={filename} className="h-full w-full border-0 bg-surface" />;
    case "image":
      return <ImageView url={url} filename={filename} onFailed={() => setState({ step: "error" })} />;
    case "docx":
      return (
        <DocxView
          file={state.file}
          onFetchFailed={() => setState({ step: "error" })}
          onRenderFailed={state.onRenderFailed}
        />
      );
    case "csv":
      return <CsvView table={state.table} />;
    case "text":
      return (
        <>
          <Notes note={state.note} truncated={state.truncated} />
          <TextPage>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-text-primary">
              {state.text}
            </pre>
          </TextPage>
        </>
      );
    case "html":
      return (
        <TextPage>
          <SanitizedHtml html={state.html} />
        </TextPage>
      );
  }
}

function ViewerLoading(): ReactElement {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" label="Opening file…" />
    </div>
  );
}

function ViewerMessage({ text, action }: { text: string; action?: ReactNode }): ReactElement {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <EmptyState
        icon={<FileIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />}
        title={text}
        action={action}
      />
    </div>
  );
}

/** The sheet text and converted documents sit on, so they read like a page. */
function TextPage({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="mx-auto my-4 max-w-3xl rounded-lg bg-surface p-4 text-text-primary shadow-sm sm:p-8">
      {children}
    </div>
  );
}

/** The app's note, then the cut note, above the page. */
function Notes({ note, truncated }: { note?: string; truncated: boolean }): ReactElement | null {
  if (!note && !truncated) return null;
  return (
    <div className="mx-auto mt-4 max-w-3xl space-y-2 px-4 sm:px-0">
      {note && <Alert variant="info">{note}</Alert>}
      {truncated && (
        <Alert variant="info">Showing the first 200k characters. Download the file to read all of it.</Alert>
      )}
    </div>
  );
}

/**
 * The fallback's HTML, rebuilt by `sanitizePreviewHtml` and inserted as nodes.
 * React renders the container empty and never touches its children.
 */
function SanitizedHtml({ html }: { html: string }): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.replaceChildren(sanitizePreviewHtml(html, document));
  }, [html]);
  return <div ref={ref} className="file-viewer-html" />;
}

/** The image stays mounted under the spinner until it has decoded. */
function ImageView({
  url,
  filename,
  onFailed,
}: {
  url: string;
  filename: string;
  onFailed: () => void;
}): ReactElement {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <ViewerLoading />}
      <div className="flex min-h-full items-start justify-center p-4" hidden={!loaded}>
        <img
          src={url}
          alt={filename}
          className="max-w-full rounded-lg bg-surface shadow-sm"
          onLoad={() => setLoaded(true)}
          onError={onFailed}
        />
      </div>
    </>
  );
}
