"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { documentLinkHref, replaceSymbolGlyphs } from "@/lib/file-viewer";
import { Spinner } from "./spinner";

/**
 * A Word file laid out the way Word would: docx-preview reads the document's
 * own styles and emits page-sized sections. It only runs in the browser and
 * pulls in a zip reader, so it is imported on demand; nothing ships until
 * somebody opens a `.docx`. Internal to `FileViewer`, not exported.
 *
 * The page styling is `.file-viewer-docx` in theme.css.
 */
export function DocxView({
  file,
  onFetchFailed,
  onRenderFailed,
}: {
  /** The file's bytes, or null when the request failed. Never rejects. */
  file: Promise<Blob | null>;
  onFetchFailed: () => void;
  /** The chunk did not load, or the bytes are not a document it can lay out. */
  onRenderFailed: () => void;
}): ReactElement {
  const bodyRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Started together, so the chunk and the file download side by side.
      const library = import("docx-preview");
      library.catch(() => {});
      const blob = await file;
      if (cancelled) return;
      if (blob === null) {
        onFetchFailed();
        return;
      }
      try {
        const { renderAsync } = await library;
        if (cancelled || !bodyRef.current) return;
        await renderAsync(blob, bodyRef.current, styleRef.current ?? undefined, {
          inWrapper: true,
          breakPages: true,
          // Pages may grow past their nominal height, so A4 read on Letter isn't clipped.
          ignoreHeight: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          // Images as data URLs, so nothing outlives the dialog as a blob URL.
          useBase64URL: true,
          // An altChunk is document-supplied HTML that the library puts in a
          // same-origin iframe, which would run its script in the app's origin
          // the moment the viewer opens.
          renderAltChunks: false,
        });
        if (cancelled) return;
        if (styleRef.current) replaceSymbolFontBullets(styleRef.current);
        if (bodyRef.current) neutraliseLinks(bodyRef.current);
        setReady(true);
      } catch {
        if (!cancelled) onRenderFailed();
      }
    })();
    return () => {
      cancelled = true;
    };
    // Keyed on the file alone: a new callback from a re-render must not lay
    // the document out again.
  }, [file]);

  // docx-preview writes into these nodes, so they stay mounted under the spinner.
  return (
    <>
      {!ready && (
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" label="Laying out document…" />
        </div>
      )}
      <div className="file-viewer-docx" hidden={!ready}>
        <div ref={styleRef} />
        <div ref={bodyRef} />
      </div>
    </>
  );
}

/**
 * docx-preview copies a document's hyperlink targets onto `<a href>` unchecked:
 * unsafe links lose their href and read as text, external ones open in a new
 * tab, bookmarks stay as they are.
 */
function neutraliseLinks(container: HTMLElement): void {
  for (const anchor of container.querySelectorAll("a")) {
    const link = documentLinkHref(anchor.getAttribute("href"));
    if (!link) {
      anchor.removeAttribute("href");
      continue;
    }
    anchor.setAttribute("href", link.href);
    if (link.external) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  }
}

/** Patches the bullet glyphs in the stylesheets docx-preview injected. */
function replaceSymbolFontBullets(styleContainer: HTMLElement): void {
  for (const styleTag of styleContainer.querySelectorAll("style")) {
    let rules: CSSRuleList;
    try {
      if (!styleTag.sheet) continue;
      rules = styleTag.sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      // The value arrives quoted and may carry CSS escapes (a \9 tab after the
      // glyph), so the code point is patched in place rather than rebuilt.
      const content = rule.style.content;
      if (!content) continue;
      const patched = replaceSymbolGlyphs(content);
      if (patched === content) continue;
      rule.style.setProperty("content", patched);
      rule.style.setProperty("font-family", "inherit");
    }
  }
}
