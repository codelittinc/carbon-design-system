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
 *   dark  = @theme + @theme static, with `.dark` applied (the default theme)
 *   light = @theme + @theme static, with `.light` applied
 *
 * `var(--color-…)` references are resolved within the theme, as a browser does when the theme
 * class sits on the root element (where apps put it). Every value is then normalised to one of
 * two forms that react-pdf and the common email clients all read: `#rrggbb`, or
 * `rgba(r, g, b, a)` for the translucent table inks. A colour in any other syntax (oklch,
 * hsl, a named colour) fails the build rather than shipping a value those renderers drop.
 */
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "src/styles/theme.css");
const OUT = join(ROOT, "src/tokens.ts");

/** A `--color-<name>` declaration. The name may carry CSS escapes (`gray-0\.5`). */
export const DECLARATION = /--color-((?:[a-z0-9-]|\\.)+)\s*:\s*([^;]+);/g;

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const unescape = (name) => name.replace(/\\(.)/g, "$1");

/**
 * The body of the top-level rule `opener` (e.g. ".light"), up to its matching brace. The rule
 * must start a line and appear exactly once, so a quote of it in prose or a second copy fails
 * loudly instead of being parsed; nested blocks (`@media { … }`) are kept whole.
 */
function block(css, opener) {
  const escaped = opener.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const starts = [...css.matchAll(new RegExp(`^${escaped}\\s*\\{`, "gm"))];
  if (starts.length !== 1) {
    throw new Error(`theme.css: expected one "${opener} {" block, found ${starts.length}`);
  }
  const open = starts[0].index + starts[0][0].length;
  let depth = 1;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open, i);
  }
  throw new Error(`theme.css: "${opener} {" is never closed`);
}

/** `--color-<name>: <value>;` declarations, in source order. */
function declarations(body) {
  return Array.from(body.matchAll(DECLARATION), (m) => [unescape(m[1]), m[2].trim()]);
}

/** `#rgb`, `#rrggbb`, `rgb(r g b / a%)` or `rgba(r, g, b, a)` → `#rrggbb` or `rgba(r, g, b, a)`. */
export function plainColor(name, value) {
  const v = value.toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join("")}`;
  const fn = v.match(/^rgba?\(([^)]*)\)$/);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
    const channels = parts.slice(0, 3).map(Number);
    if ((parts.length === 3 || parts.length === 4) && channels.every((c) => Number.isInteger(c) && c >= 0 && c <= 255)) {
      if (parts.length === 3) return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      const raw = parts[3];
      const alpha = raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
      if (alpha >= 0 && alpha <= 1) return `rgba(${channels.join(", ")}, ${Number(alpha.toFixed(4))})`;
    }
  }
  throw new Error(
    `theme.css: --color-${name} is "${value}", which PDFs and emails cannot read. ` +
      "Use #rrggbb or rgb(r g b / a), or teach scripts/generate-tokens.mjs the new syntax.",
  );
}

function resolveTheme(entries) {
  const map = new Map(entries);
  const resolve = (value, chain) =>
    value.replace(/var\(--color-((?:[a-z0-9-]|\\.)+)\)/g, (_, raw) => {
      const name = unescape(raw);
      if (chain.includes(name)) {
        throw new Error(`theme.css: reference cycle ${[...chain, name].map((n) => `--color-${n}`).join(" → ")}`);
      }
      if (!map.has(name)) throw new Error(`theme.css: var(--color-${name}) is not declared`);
      return resolve(map.get(name), [...chain, name]);
    });
  return Object.fromEntries(
    [...map].map(([name, value]) => [name, plainColor(name, resolve(value, [name]))]),
  );
}

export function colorTokensFrom(source) {
  const css = stripComments(source);
  const base = [...declarations(block(css, "@theme")), ...declarations(block(css, "@theme static"))];
  return {
    dark: resolveTheme([...base, ...declarations(block(css, ".dark"))]),
    light: resolveTheme([...base, ...declarations(block(css, ".light"))]),
  };
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
 * variable: a PDF renderer, an HTML email, a site that does not use Tailwind. Every value is
 * \`#rrggbb\`, or \`rgba(r, g, b, a)\` for the translucent table inks, which react-pdf and email
 * clients read. In a browser app, use the utilities and \`var(--color-…)\` from the stylesheet
 * instead, so a theme switch reaches them.
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

// Compare real paths: argv[1] keeps a symlinked path (/tmp on macOS) that import.meta.url does not.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  writeFileSync(OUT, tokensSource(readFileSync(THEME, "utf8")));
  console.log(`wrote ${OUT}`);
}
