#!/usr/bin/env node
/**
 * Writes src/tokens.ts — every `--color-*` token in src/styles/theme.css as a plain value,
 * per theme — so places that cannot read a CSS variable can still take their colours from the
 * design system: a PDF renderer, an HTML email, a non-Tailwind site's theme.
 *
 * theme.css stays the single source. This file is generated from it, never edited, and
 * `build:lib` regenerates it before bundling, so a published build cannot carry a stale copy.
 * test/tokens.test.ts fails when the committed file differs from what this produces.
 *
 *   dark  = @theme + @theme static, the default theme; `.dark` must restate it, not change it
 *   light = @theme + @theme static, with `.light` applied
 *
 * theme.css is read with postcss. Every `--color-*` declaration must sit directly in one of the
 * four theme blocks: one anywhere else (`html.light { … }`, an `@media` inside `.light`) applies
 * in a browser but has no single plain value, so it fails the build rather than leaving PDFs
 * and emails on the old colour.
 *
 * `var(--color-…)` references are resolved within the theme, as a browser does when the theme
 * class sits on the root element (where apps put it). Every value is then normalised to one of
 * two forms that react-pdf and the common email clients all read: `#rrggbb` for a solid colour,
 * or `rgba(r, g, b, a)` for a translucent one (today only the table inks). A colour in any other
 * syntax (oklch, hsl, a named colour) fails the build rather than shipping a value those
 * renderers drop.
 */
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "src/styles/theme.css");
const OUT = join(ROOT, "src/tokens.ts");

const PREFIX = "--color-";

/** A token name as written in CSS (`gray-0\.5`) → as it is keyed in colorTokens (`gray-0.5`). */
export const cssUnescape = (name) => name.replace(/\\(.)/g, "$1");

const BLOCKS = {
  theme: { label: "@theme", matches: (n) => n.type === "atrule" && n.name === "theme" && n.params === "" },
  static: { label: "@theme static", matches: (n) => n.type === "atrule" && n.name === "theme" && n.params === "static" },
  dark: { label: ".dark", matches: (n) => n.type === "rule" && n.selector === ".dark" },
  light: { label: ".light", matches: (n) => n.type === "rule" && n.selector === ".light" },
};

/**
 * The `--color-*` declarations of each theme block, as `[name, value]` in source order. Each
 * block must appear exactly once at the top level, and no `--color-*` declaration may sit
 * anywhere but directly inside one of them.
 */
export function themeBlocks(css) {
  const root = postcss.parse(css);
  const rules = Object.fromEntries(
    Object.entries(BLOCKS).map(([key, { label, matches }]) => {
      const found = root.nodes.filter(matches);
      if (found.length !== 1) throw new Error(`theme.css: expected one "${label} {" block, found ${found.length}`);
      return [key, found[0]];
    }),
  );
  const owners = new Set(Object.values(rules));
  root.walkDecls((decl) => {
    if (decl.prop.startsWith(PREFIX) && !owners.has(decl.parent)) {
      throw new Error(
        `theme.css:${decl.source.start.line}: ${decl.prop} is declared outside @theme, @theme static, ` +
          ".dark and .light, so it has no plain value for PDFs and emails. Move it into one of them.",
      );
    }
  });
  return Object.fromEntries(
    Object.entries(rules).map(([key, rule]) => [
      key,
      rule.nodes
        .filter((node) => node.type === "decl" && node.prop.startsWith(PREFIX))
        .map((decl) => [cssUnescape(decl.prop.slice(PREFIX.length)), decl.value.trim()]),
    ]),
  );
}

const hex = (channels) => `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

/**
 * `#rgb`, `#rrggbb`, `rgb(r g b [/ a])` or `rgba(r, g, b, a)` → `#rrggbb` when it is solid,
 * `rgba(r, g, b, a)` when it is translucent.
 */
export function plainColor(name, value) {
  const v = value.toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join("")}`;
  // rgb() and rgba() are aliases. Either all spaces with an optional `/ alpha`, or all commas.
  const fn =
    v.match(/^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/) ??
    v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+%?)\s*)?\)$/);
  if (fn) {
    const channels = fn.slice(1, 4).map(Number);
    const raw = fn[4] ?? "1";
    const number = raw.replace(/%$/, "");
    const parsed = /^(\d+(\.\d*)?|\.\d+)$/.test(number) ? Number(number) : NaN;
    // Rounded before the solid check, so 0.99999 is solid like 1.
    const alpha = Number((raw.endsWith("%") ? parsed / 100 : parsed).toFixed(4));
    if (channels.every((c) => c <= 255) && alpha >= 0 && alpha <= 1) {
      return alpha === 1 ? hex(channels) : `rgba(${channels.join(", ")}, ${alpha})`;
    }
  }
  throw new Error(
    `theme.css: --color-${name} is "${value}", which PDFs and emails cannot read. ` +
      "Use #rrggbb or rgb(r g b / a), or teach scripts/generate-tokens.mjs the new syntax.",
  );
}

function resolveTheme(entries) {
  const declared = new Map(entries);
  const resolved = new Map();
  const resolve = (name, chain) => {
    if (resolved.has(name)) return resolved.get(name);
    if (chain.includes(name)) {
      throw new Error(`theme.css: reference cycle ${[...chain, name].map((n) => PREFIX + n).join(" → ")}`);
    }
    const value = declared.get(name).replace(/var\(--color-((?:[a-z0-9-]|\\.)+)\)/g, (_, raw) => {
      const ref = cssUnescape(raw);
      if (!declared.has(ref)) throw new Error(`theme.css: var(--color-${ref}) is not declared`);
      return resolve(ref, [...chain, name]);
    });
    resolved.set(name, value);
    return value;
  };
  return Object.fromEntries([...declared.keys()].map((name) => [name, plainColor(name, resolve(name, []))]));
}

export function colorTokensFrom(css) {
  const blocks = themeBlocks(css);
  const base = [...blocks.theme, ...blocks.static];
  const dark = resolveTheme([...base, ...blocks.dark]);
  // A page with no theme class shows @theme alone, so `.dark` must restate it, not change it.
  // Otherwise colorTokens.dark (what PDFs and emails get) and the app's default would differ.
  const defaults = resolveTheme(base);
  const drifted = Object.keys(dark).filter((name) => dark[name] !== defaults[name]);
  if (drifted.length > 0) {
    throw new Error(
      `theme.css: .dark changes ${drifted.map((name) => `${PREFIX}${name} (${defaults[name]} → ${dark[name]})`).join(", ")}. ` +
        "Dark is the default theme, so make the same change in @theme.",
    );
  }
  return { dark, light: resolveTheme([...base, ...blocks.light]) };
}

export function tokensSource(css) {
  const tokens = colorTokensFrom(css);
  const theme = (values) =>
    Object.entries(values)
      .map(([name, value]) => `    ${JSON.stringify(name)}: ${JSON.stringify(value)},`)
      .join("\n");
  return `/**
 * GENERATED by scripts/generate-tokens.mjs from src/styles/theme.css. Do not edit:
 * change theme.css and run \`pnpm tokens:generate\` (build:lib does it too).
 *
 * Every colour token as a plain CSS value, per theme, for places that cannot read a CSS
 * variable: a PDF renderer, an HTML email, a site that does not use Tailwind. A solid colour
 * is \`#rrggbb\`; a translucent one (the table inks) is \`rgba(r, g, b, a)\`. Both are forms
 * react-pdf and email clients read. In a browser app, use the utilities and \`var(--color-…)\`
 * from the stylesheet instead, so a theme switch reaches them.
 *
 *   import { colorTokens } from "@codelittinc/carbon-design-system/tokens";
 *   colorTokens.light["text-primary"]; // "#18181b"
 */
export const colorTokens = {
  dark: {
${theme(tokens.dark)}
  },
  light: {
${theme(tokens.light)}
  },
} as const;

export type ColorTheme = keyof typeof colorTokens;
export type ColorToken = keyof (typeof colorTokens)["dark"];
`;
}

/**
 * Whether this file is the script node was started with. Real paths, because argv[1] keeps a
 * symlinked path (/tmp on macOS) that import.meta.url does not. An argv[1] that is not a file
 * (`node -e`, a test runner's virtual path) means this module was imported, never an error.
 */
function isMain() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (process.argv[1] && isMain()) {
  writeFileSync(OUT, tokensSource(readFileSync(THEME, "utf8")));
  console.log(`wrote ${OUT}`);
}
