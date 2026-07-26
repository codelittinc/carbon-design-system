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
