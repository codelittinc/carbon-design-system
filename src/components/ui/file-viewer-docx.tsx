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
 * The document renders inside a shadow root. docx-preview copies text from the
 * file into its stylesheet unescaped (list markers, font names), so a crafted
 * `.docx` can close a rule and write its own: in the page, those rules would
 * restyle the whole app while the viewer is open. In a shadow root they reach
 * the document and its host only, and a `contain: paint` wrapper around the
 * host clips anything positioned to escape it, so the dialog's own header stays
 * on top. The page styling travels in with the document as PAGE_CSS.
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
  const hostRef = useRef<HTMLDivElement>(null);
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
        if (cancelled || !hostRef.current) return;
        const { body, style } = shadowContainers(hostRef.current);
        await renderAsync(blob, body, style, {
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
          // Embedded fonts become @font-face rules, which browsers ignore inside
          // a shadow root; the document's fonts fall back to the named families.
          ignoreFonts: true,
        });
        if (cancelled) return;
        replaceSymbolFontBullets(style);
        neutraliseLinks(body);
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
      {/* The containment sits on a wrapper the document's CSS can't select: a
          `:host` rule can restyle the host itself, even past an outer
          `!important`. `contain: paint` makes the wrapper the containing block
          for anything fixed or absolute inside and clips it there, so a
          crafted document can't cover the dialog header. Inline, so it doesn't
          depend on the app's Tailwind scanning this package. */}
      <div style={{ contain: "paint", position: "relative" }} hidden={!ready}>
        <div ref={hostRef} className="file-viewer-docx" />
      </div>
    </>
  );
}

/**
 * Page styling inside the shadow root; theme tokens inherit across it. It sits
 * after the container docx-preview writes its stylesheet into, so at equal
 * specificity it wins over the library's gray backdrop and heavy shadow.
 */
const PAGE_CSS = `
.docx-wrapper {
  background: transparent;
  padding: 1.5rem 1rem 0.5rem;
  gap: 1rem;
}
.docx-wrapper > section.docx {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  /* Narrow screens: a Letter or A4 page shrinks instead of scrolling sideways. */
  max-width: 100%;
}
`;

/** Fresh containers for one render, in the host's shadow root. */
function shadowContainers(host: HTMLElement): { body: HTMLElement; style: HTMLElement } {
  const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const page = document.createElement("style");
  page.textContent = PAGE_CSS;
  const style = document.createElement("div");
  const body = document.createElement("div");
  root.replaceChildren(style, page, body);
  return { body, style };
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
