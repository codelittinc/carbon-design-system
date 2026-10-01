import { describe, expect, it } from "vitest";
import { isAllowedEditorHref, linkHrefErrorMessage, normalizeLinkHref } from "../link-href";

// Ported from the app that first used these rules, with its one link target
// generalised to `targets`. The editor's link panel only shows what these return.

const BOOKING = { targets: ["{{booking_link}}"] };

describe("normalizeLinkHref", () => {
  it("adds https to a bare host", () => {
    expect(normalizeLinkHref("example.com")).toEqual({ ok: true, href: "https://example.com" });
    expect(normalizeLinkHref("  www.example.com ")).toEqual({ ok: true, href: "https://www.example.com" });
  });

  it("reads a host with a port and path as a host, not a scheme", () => {
    expect(normalizeLinkHref("example.com:8080/x")).toEqual({ ok: true, href: "https://example.com:8080/x" });
  });

  it("keeps http and https as typed, with no trailing slash added", () => {
    expect(normalizeLinkHref("https://example.com")).toEqual({ ok: true, href: "https://example.com" });
    expect(normalizeLinkHref("http://example.com/jobs?a=1")).toEqual({ ok: true, href: "http://example.com/jobs?a=1" });
  });

  it("passes a dot-less host only when typed with its scheme", () => {
    expect(normalizeLinkHref("http://localhost:3000")).toEqual({ ok: true, href: "http://localhost:3000" });
    expect(normalizeLinkHref("localhost:3000")).toEqual({ ok: false, reason: "scheme" });
    expect(normalizeLinkHref("intranet")).toEqual({ ok: false, reason: "scheme" });
  });

  it("keeps mailto exactly as entered, and refuses an empty one", () => {
    expect(normalizeLinkHref("mailto:ana@example.com")).toEqual({ ok: true, href: "mailto:ana@example.com" });
    expect(normalizeLinkHref("mailto:")).toEqual({ ok: false, reason: "scheme" });
  });

  it("makes a bare email address a mailto link, not a login on a website", () => {
    expect(normalizeLinkHref("ana@example.com")).toEqual({ ok: true, href: "mailto:ana@example.com" });
    expect(normalizeLinkHref("https://ana@example.com")).toEqual({ ok: true, href: "https://ana@example.com" });
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "ftp://files.example.com",
    "tel:+15550100",
    "file:///etc/passwd",
  ])("refuses the scheme in %s", (input) => {
    expect(normalizeLinkHref(input)).toEqual({ ok: false, reason: "scheme" });
  });

  it.each(["hello world", "hello", "/path", "//evil.com", "https://"])(
    "refuses text and relative paths: %s",
    (input) => {
      expect(normalizeLinkHref(input)).toEqual({ ok: false, reason: "scheme" });
    },
  );

  it("gives an empty URL its own reason", () => {
    expect(normalizeLinkHref("")).toEqual({ ok: false, reason: "empty" });
    expect(normalizeLinkHref("   ")).toEqual({ ok: false, reason: "empty" });
  });

  it("refuses any {{placeholder}} when there are no targets", () => {
    expect(normalizeLinkHref("{{booking_link}}")).toEqual({ ok: false, reason: "scheme" });
  });

  it("accepts a declared target, folding case and spaces to its canonical form", () => {
    expect(normalizeLinkHref("{{booking_link}}", BOOKING)).toEqual({ ok: true, href: "{{booking_link}}" });
    expect(normalizeLinkHref(" {{ Booking_Link }} ", BOOKING)).toEqual({ ok: true, href: "{{booking_link}}" });
  });

  it.each(["{{first_name}}", "{{bookng_link}}", "https://x.com/{{first_name}}", "https://x.com/{{booking_link}}"])(
    "refuses a placeholder that is not a declared target: %s",
    (input) => {
      expect(normalizeLinkHref(input, BOOKING)).toEqual({ ok: false, reason: "placeholder" });
    },
  );

  it("still takes ordinary links when targets are declared", () => {
    expect(normalizeLinkHref("example.com", BOOKING)).toEqual({ ok: true, href: "https://example.com" });
    expect(normalizeLinkHref("javascript:alert(1)", BOOKING)).toEqual({ ok: false, reason: "scheme" });
  });
});

describe("isAllowedEditorHref", () => {
  it("drops scripts and other schemes, however they are spaced", () => {
    for (const href of ["javascript:alert(1)", "java\tscript:alert(1)", " \njavascript:alert(1)", "data:text/html,x", "tel:+15550100", "ftp://files.example.com"]) {
      expect(isAllowedEditorHref(href), href).toBe(false);
    }
  });

  it("drops a scheme with a dot in it, as a browser reads one", () => {
    expect(isAllowedEditorHref("foo.bar:payload")).toBe(false);
    expect(isAllowedEditorHref("web+app.x:thing")).toBe(false);
  });

    it("keeps web and email links", () => {
    expect(isAllowedEditorHref("https://example.com")).toBe(true);
    expect(isAllowedEditorHref("HTTP://example.com")).toBe(true);
    expect(isAllowedEditorHref("mailto:ana@example.com")).toBe(true);
  });

  it("keeps scheme-less hrefs in every editor, whatever its targets", () => {
    // Markup an app loads can already hold a target the editor does not let
    // anyone type; dropping it would hide it from whatever fills it in.
    expect(isAllowedEditorHref("{{booking_link}}")).toBe(true);
    // Autolink passes linkify's raw value, not the href it will build.
    expect(isAllowedEditorHref("example.com")).toBe(true);
    expect(isAllowedEditorHref("/api/files/1")).toBe(true);
  });

  it("allows an empty href, as TipTap's default does", () => {
    expect(isAllowedEditorHref("")).toBe(true);
    expect(isAllowedEditorHref(undefined)).toBe(true);
  });
});

describe("linkHrefErrorMessage", () => {
  it("asks for a URL when empty", () => {
    expect(linkHrefErrorMessage("empty")).toBe("Enter a URL.");
  });

  it("says to include https://, and names targets only where they exist", () => {
    expect(linkHrefErrorMessage("scheme")).toMatch(/https:\/\//);
    expect(linkHrefErrorMessage("scheme")).not.toMatch(/\{\{/);
    expect(linkHrefErrorMessage("scheme", BOOKING)).toMatch(/\{\{booking_link\}\}/);
    expect(linkHrefErrorMessage("placeholder", BOOKING)).toMatch(/^Only \{\{booking_link\}\} can be used as a link/);
  });

  it("lists several targets in prose", () => {
    expect(linkHrefErrorMessage("placeholder", { targets: ["{{a}}", "{{b}}", "{{c}}"] })).toMatch(
      /^Only \{\{a\}\}, \{\{b\}\} or \{\{c\}\} can/,
    );
  });
});
