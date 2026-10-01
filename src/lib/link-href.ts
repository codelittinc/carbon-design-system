/**
 * What `RichTextEditor`'s link UI accepts as an href.
 *
 * Pure functions with no React and no browser globals, exported from the
 * server-safe `/utils` entry as well as the root, so an app can check an href
 * the same way on its server.
 *
 * Two different questions, kept apart on purpose.
 *
 * `normalizeLinkHref` answers "may the person TYPE this into the full link
 * panel?", and is where an app's extra link targets apply. It is for usability
 * only: the app's sanitizer remains the boundary.
 *
 * `isAllowedEditorHref` answers "may the editor keep this href?" for parse,
 * paste, autolink and setLink alike, and is the same in every editor. It cannot
 * depend on the targets an editor declares: an app can load markup that already
 * holds `<a href="{{booking_link}}">` into an editor that does not let anyone
 * type it, and dropping the href there would hide the target from whatever
 * fills it in later.
 */

export type LinkHrefReason = "empty" | "scheme" | "placeholder";

export type LinkHrefResult = { ok: true; href: string } | { ok: false; reason: LinkHrefReason };

export interface LinkHrefOptions {
  /**
   * Hrefs that are not URLs but may be typed as one, in canonical form, e.g.
   * `["{{booking_link}}"]`. Matched case-insensitively and with spaces allowed
   * inside the braces.
   */
  targets?: readonly string[];
}

const TARGET_ONLY = /^\{\{\s*([a-z0-9_]+)\s*\}\}$/i;

// A scheme with no dot before the colon, so "example.com:8080" is read as a
// host and port rather than an "example.com" scheme.
const SCHEME = /^[a-z][a-z0-9+-]*:/i;

// A scheme as a browser reads one, dots allowed. `isAllowedEditorHref` is a
// safety check, so it has to treat "foo.bar:payload" as the scheme it is.
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function parses(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * The href to store for what somebody typed, or why it was refused.
 *
 * `example.com` and `www.example.com` gain `https://`, `ana@example.com` becomes
 * a `mailto:` link, and `http(s)://` and `mailto:` are kept exactly as typed.
 * Every other scheme, relative paths, text with spaces and dot-less hosts
 * without a scheme are refused, and so is any `{{…}}` that is not one of
 * `targets`.
 */
export function normalizeLinkHref(input: string, { targets = [] }: LinkHrefOptions = {}): LinkHrefResult {
  const s = input.trim();
  if (s === "") return { ok: false, reason: "empty" };

  if (s.includes("{{") || s.includes("}}")) {
    const name = TARGET_ONLY.exec(s)?.[1].toLowerCase();
    const canonical = name === undefined ? undefined : `{{${name}}}`;
    if (canonical !== undefined && targets.includes(canonical)) {
      return { ok: true, href: canonical };
    }
    return { ok: false, reason: targets.length > 0 ? "placeholder" : "scheme" };
  }

  if (/\s/.test(s)) return { ok: false, reason: "scheme" };

  if (/^mailto:./i.test(s)) return { ok: true, href: s };

  // Kept as typed rather than URL#href, which would add a trailing slash the
  // person never wrote.
  if (/^https?:\/\//i.test(s)) {
    return parses(s)?.hostname ? { ok: true, href: s } : { ok: false, reason: "scheme" };
  }

  // javascript:, data:, ftp:, tel: and so on — and also "localhost:3000",
  // which reads as a scheme. A dot-less host has to be typed with http(s)://.
  if (SCHEME.test(s)) return { ok: false, reason: "scheme" };

  // A bare "ana@example.com" means an email link. As a host it would become
  // https://ana@example.com — the website, with "ana" as a login.
  if (/^[^@/]+@[^@/]+\.[^@/]+$/.test(s)) return { ok: true, href: `mailto:${s}` };

  // Relative and protocol-relative paths mean nothing outside the page they
  // were written on.
  if (s.startsWith("/")) return { ok: false, reason: "scheme" };

  // A bare "example.com". The dot is what tells a host from a stray word.
  const href = `https://${s}`;
  return parses(href)?.hostname.includes(".") ? { ok: true, href } : { ok: false, reason: "scheme" };
}

// TipTap's UNICODE_WHITESPACE_PATTERN, which it takes from DOMPurify.
// eslint-disable-next-line no-control-regex
const INVISIBLE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;

/**
 * Whether the editor may keep this href at all.
 *
 * TipTap's own default allows ftp, tel, sms, cid, xmpp and more. This narrows
 * any explicit scheme to http, https and mailto, and lets everything without
 * one through, as TipTap does: that covers link targets, and also autolink,
 * which passes linkify's raw value ("example.com", not the href) to this check.
 */
export function isAllowedEditorHref(url: string | undefined): boolean {
  // Whitespace and control characters stripped first, as TipTap does, so
  // "java\tscript:" cannot slip past the scheme check.
  const s = (url ?? "").replace(INVISIBLE, "");
  if (s === "") return true;
  if (/^(https?|mailto):/i.test(s)) return true;
  return !ANY_SCHEME.test(s);
}

/** "A", "A or B", "A, B or C". */
function orList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

/** The message the link panel shows for a refused href. */
export function linkHrefErrorMessage(reason: LinkHrefReason, { targets = [] }: LinkHrefOptions = {}): string {
  if (reason === "empty") return "Enter a URL.";
  if (targets.length === 0) {
    return "Use a web address, including https://, or an email link (mailto:…).";
  }
  const list = orList(targets);
  if (reason === "placeholder") {
    return `Only ${list} can be used as a link. Use it on its own, or enter a web address.`;
  }
  return `Use a web address, including https://, an email link (mailto:…) or ${list}.`;
}
