import { safeHref } from "./rich-text";

/**
 * The decisions behind `FileViewer`, kept free of React and the DOM so they can
 * be tested on their own. Internal: not exported from the package.
 */

/** Which renderer a file gets. */
export type FileViewerKind = "pdf" | "docx" | "doc" | "csv" | "image" | "text" | "unsupported";

/** At most this many CSV data rows render; the rest are behind Download. */
export const CSV_ROW_CAP = 1000;

/** At most this many characters of text render. */
export const TEXT_CHAR_CAP = 200_000;

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const CSV_TYPES = new Set(["text/csv", "application/csv", "text/comma-separated-values"]);
/** Windows reports a `.csv` upload as an Excel file, and some servers as plain text. */
const CSV_BY_NAME_TYPES = new Set(["application/vnd.ms-excel", "text/plain", "application/octet-stream", ""]);
/** Raster formats every current browser decodes. No SVG: it can carry script. */
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/bmp", "image/webp", "image/avif"]);

/** What a generic type falls back to, by extension. */
const KIND_BY_EXTENSION: Record<string, FileViewerKind> = {
  pdf: "pdf",
  docx: "docx",
  doc: "doc",
  txt: "text",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  bmp: "image",
  webp: "image",
  avif: "image",
};

/** A MIME type lowercased and without its parameters; "" when there is none. */
export function normalizeContentType(raw: string | null | undefined): string {
  return (raw ?? "").split(";")[0].trim().toLowerCase();
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

/**
 * Which renderer a file gets. The declared type decides; the extension is read
 * only when the type is generic (`application/octet-stream` or missing), so a
 * file served as an image or as text is never framed as a PDF because of its
 * name. The one exception is CSV, which Windows and some servers label as Excel
 * or plain text: a `.csv` name under those types is still a CSV.
 */
export function fileViewerKind(contentType: string, filename: string): FileViewerKind {
  const type = normalizeContentType(contentType);
  const ext = extensionOf(filename);

  if (CSV_TYPES.has(type)) return "csv";
  if (ext === "csv" && CSV_BY_NAME_TYPES.has(type)) return "csv";
  if (type === "application/pdf") return "pdf";
  if (type === DOCX_TYPE) return "docx";
  if (type === "application/msword") return "doc";
  if (type.startsWith("image/")) return IMAGE_TYPES.has(type) ? "image" : "unsupported";
  if (type === "text/plain") return "text";
  if (type === "" || type === "application/octet-stream") return KIND_BY_EXTENSION[ext] ?? "unsupported";
  return "unsupported";
}

/**
 * The href a rendered document link may keep, or null to drop it. docx-preview
 * copies a document's hyperlink targets onto `<a href>` unchecked, and the
 * document renders in the app's authenticated origin, so only in-document
 * bookmarks and http(s)/mailto survive. `safeHref` strips the control
 * characters a browser ignores (`java\tscript:` is `javascript:` to it) and
 * refuses relative URLs.
 */
export function documentLinkHref(href: string | null): { href: string; external: boolean } | null {
  if (href === null) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith("#")) return { href: trimmed, external: false };
  const safe = safeHref(href);
  return safe === null ? null : { href: safe, external: true };
}

/**
 * Word writes list bullets as Symbol/Wingdings private-use code points, and
 * docx-preview emits them as `::before` content in that font. Without the font
 * each bullet is a tofu box, so they are swapped for the real character.
 */
const SYMBOL_FONT_BULLETS: Record<string, string> = {
  "": "•", // Symbol / Wingdings filled bullet
  "": "•", // Wingdings filled circle
  "": "▪", // Wingdings filled square
  "": "◦", // Wingdings hollow bullet
  "": "✔", // Wingdings check mark
  "": "➢", // Wingdings arrowhead
  "": "→", // Wingdings arrow
};
// Only the Symbol/Wingdings mapping block, so ordinary text is never touched.
const PRIVATE_USE_GLYPH = /[-]/g;

/** A CSS `content` value with Symbol/Wingdings glyphs replaced; unknown ones become a bullet. */
export function replaceSymbolGlyphs(content: string): string {
  return content.replace(PRIVATE_USE_GLYPH, (ch) => SYMBOL_FONT_BULLETS[ch] ?? "•");
}

/**
 * File bytes as text: UTF-8 when they are valid UTF-8 (its BOM dropped), else
 * windows-1252, which is what Excel on Windows writes. No other detection.
 */
export function decodeText(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/** CRLF and lone CR as LF. */
export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

/** The text cut at `cap` characters, and whether it was. */
export function capText(text: string, cap: number = TEXT_CHAR_CAP): { text: string; truncated: boolean } {
  return text.length > cap ? { text: text.slice(0, cap), truncated: true } : { text, truncated: false };
}

/** A parsed CSV laid out for a table. */
export interface CsvTable {
  header: string[];
  rows: string[][];
  /** More data rows existed than are in `rows`. */
  truncated: boolean;
}

/**
 * Parsed rows as a table: the first row is the header, short rows are padded,
 * and a row with extra cells widens the table under a blank header. At most
 * `cap` data rows are kept.
 */
export function shapeCsvRows(parsed: string[][], cap: number = CSV_ROW_CAP): CsvTable {
  const [first = [], ...data] = parsed;
  const kept = data.slice(0, cap);
  const width = Math.max(first.length, ...kept.map((row) => row.length));
  const pad = (row: string[]): string[] =>
    row.length < width ? [...row, ...Array<string>(width - row.length).fill("")] : row;
  return { header: pad(first), rows: kept.map(pad), truncated: data.length > cap };
}
