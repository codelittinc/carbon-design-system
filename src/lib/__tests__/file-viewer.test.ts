import { describe, expect, it } from "vitest";
import {
  capText,
  decodeText,
  documentLinkHref,
  fileViewerKind,
  normalizeContentType,
  normalizeNewlines,
  replaceSymbolGlyphs,
  shapeCsvRows,
} from "../file-viewer";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("fileViewerKind", () => {
  it.each([
    ["application/pdf", "a.pdf", "pdf"],
    [DOCX, "a.docx", "docx"],
    ["application/msword", "a.doc", "doc"],
    ["text/csv", "a.txt", "csv"],
    ["application/csv", "data", "csv"],
    ["text/comma-separated-values", "data", "csv"],
    ["text/plain", "notes.txt", "text"],
    ["image/png", "a.png", "image"],
    ["image/jpeg", "a.jpg", "image"],
    ["image/gif", "a.gif", "image"],
    ["image/bmp", "a.bmp", "image"],
    ["image/webp", "a.webp", "image"],
    ["image/avif", "a.avif", "image"],
  ])("%s named %s is %s", (type, name, kind) => {
    expect(fileViewerKind(type, name)).toBe(kind);
  });

  it("reads a .csv name under the types Windows and servers give it", () => {
    expect(fileViewerKind("application/vnd.ms-excel", "export.csv")).toBe("csv");
    expect(fileViewerKind("application/vnd.ms-excel", "EXPORT.CSV")).toBe("csv");
    expect(fileViewerKind("text/plain", "export.csv")).toBe("csv");
    expect(fileViewerKind("application/octet-stream", "export.csv")).toBe("csv");
    expect(fileViewerKind("", "export.csv")).toBe("csv");
  });

  it("treats an Excel workbook as unsupported", () => {
    expect(fileViewerKind("application/vnd.ms-excel", "book.xls")).toBe("unsupported");
  });

  it("uses the extension only for a generic type", () => {
    expect(fileViewerKind("application/octet-stream", "a.PDF")).toBe("pdf");
    expect(fileViewerKind("application/octet-stream", "a.docx")).toBe("docx");
    expect(fileViewerKind("", "legacy.doc")).toBe("doc");
    expect(fileViewerKind("", "notes.txt")).toBe("text");
    expect(fileViewerKind("", "photo.jpeg")).toBe("image");
    expect(fileViewerKind("", "archive.zip")).toBe("unsupported");
    expect(fileViewerKind("", "no-extension")).toBe("unsupported");
  });

  it("never frames a declared image or text file because of its name", () => {
    expect(fileViewerKind("image/png", "contract.pdf")).toBe("image");
    expect(fileViewerKind("text/plain", "contract.pdf")).toBe("text");
    expect(fileViewerKind("text/html", "contract.pdf")).toBe("unsupported");
  });

  it("refuses script-capable and undecodable images", () => {
    expect(fileViewerKind("image/svg+xml", "logo.svg")).toBe("unsupported");
    expect(fileViewerKind("image/heic", "photo.heic")).toBe("unsupported");
  });

  it.each([
    ["application/zip", "a.zip"],
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "a.xlsx"],
    ["application/rtf", "a.rtf"],
  ])("%s is unsupported", (type, name) => {
    expect(fileViewerKind(type, name)).toBe("unsupported");
  });

  it("ignores case and parameters in the type", () => {
    expect(fileViewerKind("Application/PDF; charset=binary", "a")).toBe("pdf");
    expect(fileViewerKind("text/csv; charset=utf-8", "a")).toBe("csv");
  });
});

describe("normalizeContentType", () => {
  it("lowercases and drops parameters", () => {
    expect(normalizeContentType(" Text/Plain; charset=UTF-8 ")).toBe("text/plain");
    expect(normalizeContentType(null)).toBe("");
    expect(normalizeContentType(undefined)).toBe("");
  });
});

describe("documentLinkHref", () => {
  it.each([
    "javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\0script:alert(1)",
    " JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "/relative/path",
    "relative",
    "",
  ])("drops %j", (href) => {
    expect(documentLinkHref(href)).toBeNull();
  });

  it("keeps in-document bookmarks in place", () => {
    expect(documentLinkHref("#section-2")).toEqual({ href: "#section-2", external: false });
  });

  it("keeps http(s) and mailto as external links", () => {
    expect(documentLinkHref("https://example.com/a")).toEqual({ href: "https://example.com/a", external: true });
    expect(documentLinkHref("http://example.com")).toEqual({ href: "http://example.com", external: true });
    expect(documentLinkHref("mailto:ana@example.com")).toEqual({ href: "mailto:ana@example.com", external: true });
  });

  it("drops a missing href", () => {
    expect(documentLinkHref(null)).toBeNull();
  });
});

describe("replaceSymbolGlyphs", () => {
  it("swaps known Symbol/Wingdings bullets for Unicode", () => {
    expect(replaceSymbolGlyphs('"\\9"')).toBe('"•\\9"');
    expect(replaceSymbolGlyphs('""')).toBe('"▪"');
    expect(replaceSymbolGlyphs('""')).toBe('"✔"');
  });

  it("turns an unknown glyph in the block into a bullet", () => {
    expect(replaceSymbolGlyphs('""')).toBe('"•"');
  });

  it("leaves ordinary text alone", () => {
    expect(replaceSymbolGlyphs('"1."')).toBe('"1."');
    expect(replaceSymbolGlyphs('"• é ✓"')).toBe('"• é ✓"');
  });
});

describe("decodeText", () => {
  it("drops a UTF-8 BOM", () => {
    expect(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x2c, 0x62]))).toBe("a,b");
  });

  it("reads valid UTF-8 as UTF-8", () => {
    expect(decodeText(new TextEncoder().encode("Café, São Paulo"))).toBe("Café, São Paulo");
  });

  it("falls back to windows-1252 for bytes that are not UTF-8", () => {
    expect(decodeText(new Uint8Array([0x43, 0x61, 0x66, 0xe9]))).toBe("Café");
  });
});

describe("normalizeNewlines", () => {
  it("turns CRLF and lone CR into LF", () => {
    expect(normalizeNewlines("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
  });
});

describe("capText", () => {
  it("cuts text over the cap and says so", () => {
    expect(capText("abcdef", 4)).toEqual({ text: "abcd", truncated: true });
  });

  it("keeps text at or under the cap", () => {
    expect(capText("abcd", 4)).toEqual({ text: "abcd", truncated: false });
  });

  it("defaults to 200,000 characters", () => {
    const { text, truncated } = capText("x".repeat(200_001));
    expect(text).toHaveLength(200_000);
    expect(truncated).toBe(true);
  });
});

describe("shapeCsvRows", () => {
  it("takes the first row as the header", () => {
    expect(shapeCsvRows([["a", "b"], ["1", "2"]])).toEqual({
      header: ["a", "b"],
      rows: [["1", "2"]],
      truncated: false,
    });
  });

  it("pads short rows and widens for extra cells under a blank header", () => {
    expect(shapeCsvRows([["a", "b"], ["1"], ["1", "2", "3"]])).toEqual({
      header: ["a", "b", ""],
      rows: [
        ["1", "", ""],
        ["1", "2", "3"],
      ],
      truncated: false,
    });
  });

  it("keeps at most the cap and flags the rest", () => {
    const rows = [["n"], ...Array.from({ length: 1500 }, (_, i) => [String(i)])];
    const table = shapeCsvRows(rows);
    expect(table.rows).toHaveLength(1000);
    expect(table.rows[999]).toEqual(["999"]);
    expect(table.truncated).toBe(true);
  });

  it("is not truncated at exactly the cap", () => {
    const rows = [["n"], ...Array.from({ length: 1000 }, (_, i) => [String(i)])];
    expect(shapeCsvRows(rows).truncated).toBe(false);
  });

  it("returns a header with no rows for a header-only file", () => {
    expect(shapeCsvRows([["a", "b"]])).toEqual({ header: ["a", "b"], rows: [], truncated: false });
  });
});
