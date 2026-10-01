import { defineConfig } from "tsup";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Library build for @codelittinc/carbon-design-system.
 *
 * Emits ESM + type declarations to dist/. Two entry points:
 *   - index → the full barrel (@codelittinc/carbon-design-system)
 *   - utils → pure helpers only (@codelittinc/carbon-design-system/utils)
 *
 * Plus one file that is not an entry point: rich-text-editor-impl.js, the
 * TipTap editor, which index.js reaches only through a dynamic import. See
 * `lazyEditor` below.
 *
 * tsup automatically treats everything in `dependencies` / `peerDependencies`
 * as external, so React and the UI libs are not bundled — the consumer supplies
 * them. The `@/` path alias resolves via tsconfig.json.
 */
const DIST = "dist";
const DIRECTIVE = '"use client";';

/**
 * Which emitted bundles are React client code, and which are safe to call from
 * a server component. `index` is client: it is almost entirely components, and
 * the directive has to cover them. `utils` must NOT be, which is the reason it
 * is a separate entry — see the comment in src/utils.ts.
 */
const CLIENT_ENTRIES = new Set(["index.js", "rich-text-editor-impl.js"]);

/**
 * Keeps TipTap out of index.js. The editor is built as its own file, and the
 * loader's `import("./rich-text-editor-impl")` is left as a dynamic import of
 * that file instead of being inlined, which is what esbuild does to a dynamic
 * import when `splitting` is off. An app's bundler then puts TipTap in a chunk
 * of its own, fetched when an editor first renders. `splitting` itself stays
 * off: it would hoist code shared by index and utils into chunks, and utils has
 * to stay free of "use client".
 */
const lazyEditor = {
  name: "lazy-rich-text-editor",
  setup(build: { onResolve: (options: { filter: RegExp }, callback: (args: { kind: string }) => unknown) => void }) {
    build.onResolve({ filter: /^\.\/rich-text-editor-impl$/ }, (args) =>
      args.kind === "dynamic-import" ? { path: "./rich-text-editor-impl.js", external: true } : undefined,
    );
  },
};
const SERVER_SAFE_ENTRIES = new Set(["utils.js"]);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    utils: "src/utils.ts",
    "rich-text-editor-impl": "src/components/ui/rich-text-editor-impl.tsx",
  },
  format: ["esm"],
  // The editor file is reached only through index.js, whose types cover it.
  dts: { entry: { index: "src/index.ts", utils: "src/utils.ts" } },
  esbuildPlugins: [lazyEditor],
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  tsconfig: "tsconfig.json",
  /**
   * esbuild strips module-level "use client" directives when bundling (and a
   * banner is stripped the same way), so the directive is re-added here per
   * entry rather than being written in the source.
   *
   * This step asserts rather than just writes. Getting it wrong is invisible:
   * a missing directive on a client bundle and a stray one on `utils` both
   * typecheck, both build, and both only fail when a page renders. So an
   * unrecognised bundle fails the build instead of silently defaulting either
   * way — a new entry must be classified above deliberately.
   */
  async onSuccess() {
    const files = (await readdir(DIST)).filter((f) => f.endsWith(".js"));

    const unclassified = files.filter(
      (f) => !CLIENT_ENTRIES.has(f) && !SERVER_SAFE_ENTRIES.has(f),
    );
    if (unclassified.length > 0) {
      throw new Error(
        `tsup.config.ts: unclassified bundle(s) ${unclassified.join(", ")} — ` +
          `add each to CLIENT_ENTRIES or SERVER_SAFE_ENTRIES so it is clear ` +
          `whether "use client" belongs on it.`,
      );
    }

    await Promise.all(
      files.map(async (file) => {
        const path = join(DIST, file);
        const code = await readFile(path, "utf8");

        if (SERVER_SAFE_ENTRIES.has(file)) {
          if (code.startsWith(DIRECTIVE)) {
            throw new Error(
              `tsup.config.ts: ${file} is server-safe but carries the ` +
                `"use client" directive — its exports would become client ` +
                `references and throw when called during a server render.`,
            );
          }
          return;
        }

        if (code.startsWith(DIRECTIVE)) return;
        await writeFile(path, `${DIRECTIVE}\n${code}`);
      }),
    );
  },
});
