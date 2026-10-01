import type { RichTextEditorImpl } from "./rich-text-editor-impl";

/**
 * Loads the TipTap editor on demand.
 *
 * The package has one entry, so a static import of TipTap would put it, and all
 * of ProseMirror, on every page of every app that imports any component: TipTap's
 * extension packages are not marked side-effect free, so no bundler may drop
 * them. The import below is the one place TipTap is reached from the barrel. The
 * library build keeps it as a separate file (see tsup.config.ts), so an app's
 * bundler splits it into its own chunk, fetched the first time an editor renders.
 *
 * Not exported from the package: `RichTextEditor` is the API.
 */
type Impl = typeof RichTextEditorImpl;

let impl: Impl | null = null;
let pending: Promise<Impl> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export function loadRichTextEditor(): Promise<Impl> {
  pending ??= import("./rich-text-editor-impl").then(
    (module) => {
      impl = module.RichTextEditorImpl;
      notify();
      return impl;
    },
    (cause: unknown) => {
      // Forgotten, so the next editor to mount tries again: a dropped
      // connection is not permanent.
      pending = null;
      throw cause;
    },
  );
  return pending;
}

export function subscribeRichTextEditor(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const loadedRichTextEditor = (): Impl | null => impl;

