import "@testing-library/jest-dom/vitest";

/**
 * jsdom is missing a handful of DOM APIs that Radix UI primitives call while
 * opening overlays (pointer-capture, scrollIntoView) or measuring layout
 * (ResizeObserver, matchMedia). Without these, dialog / select / popover /
 * dropdown tests throw before they can assert anything. Polyfill them once here
 * so every test file gets them for free.
 */
const proto = window.Element.prototype as unknown as Record<string, unknown>;
proto.hasPointerCapture ??= () => false;
proto.setPointerCapture ??= () => {};
proto.releasePointerCapture ??= () => {};
proto.scrollIntoView ??= () => {};

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
}

/**
 * ProseMirror (under RichTextEditor) measures the caret to scroll it into view
 * and to map coordinates, and jsdom does no layout at all. Zero-sized rects are
 * enough for it to carry on; what the editor does with real geometry is checked
 * in Storybook.
 */
const zeroRect = () => new DOMRect(0, 0, 0, 0);
const noRects = () => [] as unknown as DOMRectList;
const range = window.Range.prototype as unknown as Record<string, unknown>;
range.getBoundingClientRect ??= zeroRect;
range.getClientRects ??= noRects;
proto.getClientRects ??= noRects;
const doc = document as unknown as Record<string, unknown>;
doc.elementFromPoint ??= () => null;

/**
 * `RichTextEditor` loads TipTap on first render (see
 * rich-text-editor-loader.ts). Loaded once here, every test renders the editor
 * synchronously, as an app does once the chunk has arrived; the loading box has
 * its own test, which resets the module registry.
 */
const { loadRichTextEditor } = await import("@/components/ui/rich-text-editor-loader");
await loadRichTextEditor();
