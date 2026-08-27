import { describe, expect, it } from "vitest";
import {
  RICH_TEXT_TAGS,
  isRichTextEmpty,
  safeHref,
  sanitizeRichText,
} from "../rich-text";

/**
 * These tests are the security boundary for stored rich text, so the XSS block
 * below is deliberately adversarial rather than illustrative. Each case is a
 * payload that defeats a *filtering* sanitizer; they pass here because nothing
 * from the input is copied to the output — see the header comment in
 * src/lib/rich-text.ts.
 *
 * The invariant worth stating once: for any input at all, the output contains no
 * `<` that is not the start of a tag from RICH_TEXT_TAGS, and no attribute this
 * module did not compose itself. The final `describe` block asserts that over
 * every payload in the file rather than trusting the per-case expectations.
 */

const XSS_PAYLOADS: [name: string, input: string][] = [
  ["a bare script", "<script>alert(1)</script>"],
  ["a script with attributes", '<script type="text/javascript">alert(1)</script>'],
  ["an unclosed script", "<script>alert(1)"],
  ["an image error handler", "<img src=x onerror=alert(1)>"],
  ["an image error handler, quoted", '<img src="x" onerror="alert(1)">'],
  ["an svg script", "<svg><script>alert(1)</script></svg>"],
  ["an svg onload", '<svg onload="alert(1)"></svg>'],
  ["a body onload", '<body onload="alert(1)">text</body>'],
  ["an iframe", '<iframe src="javascript:alert(1)"></iframe>'],
  ["an object", '<object data="javascript:alert(1)"></object>'],
  ["an embed", '<embed src="javascript:alert(1)">'],
  ["a javascript href", '<a href="javascript:alert(1)">click</a>'],
  ["a javascript href in caps", '<a href="JaVaScRiPt:alert(1)">click</a>'],
  ["a javascript href behind a tab", '<a href="java\tscript:alert(1)">click</a>'],
  ["a javascript href behind a newline", '<a href="java\nscript:alert(1)">click</a>'],
  ["a javascript href behind a null byte", '<a href="java\u0000script:alert(1)">click</a>'],
  ["a javascript href behind a numeric entity", '<a href="&#106;avascript:alert(1)">click</a>'],
  ["a javascript href behind a hex entity", '<a href="&#x6a;avascript:alert(1)">click</a>'],
  ["a javascript href behind &colon;", '<a href="javascript&colon;alert(1)">click</a>'],
  ["a data-url href", '<a href="data:text/html,<script>alert(1)</script>">click</a>'],
  ["a vbscript href", '<a href="vbscript:msgbox(1)">click</a>'],
  ["an event handler on an allowed tag", '<p onclick="alert(1)">text</p>'],
  ["an event handler on a bold tag", '<b onmouseover="alert(1)">text</b>'],
  ["a style attribute", '<p style="background:url(javascript:alert(1))">text</p>'],
  ["a style element", "<style>body{background:url('javascript:alert(1)')}</style>"],
  ["a conditional comment", "<!--[if IE]><script>alert(1)</script><![endif]-->"],
  ["a comment hiding a tag", "<!-- <img src=x onerror=alert(1)> -->"],
  ["a noscript mutation", '<noscript><p title="</noscript><img src=x onerror=alert(1)>">'],
  ["a textarea mutation", "<textarea></textarea><img src=x onerror=alert(1)>"],
  ["an unbalanced quote in an attribute", '<p title="><img src=x onerror=alert(1)>">text</p>'],
  ["a malformed tag name", "<<script>alert(1)</script>"],
  ["a null byte inside a tag name", "<scr\u0000ipt>alert(1)</scr\u0000ipt>"],
  ["a form action", '<form action="javascript:alert(1)"><input></form>'],
  ["a meta refresh", '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'],
  ["a base tag", '<base href="javascript:alert(1)//">'],
  ["a math mutation", "<math><mtext><script>alert(1)</script></mtext></math>"],
  ["a template", "<template><img src=x onerror=alert(1)></template>"],
  ["an entity-encoded tag in text", "&lt;script&gt;alert(1)&lt;/script&gt;"],
];

describe("sanitizeRichText — the rich-text subset", () => {
  it("keeps a paragraph", () => {
    expect(sanitizeRichText("<p>hello</p>")).toBe("<p>hello</p>");
  });

  it("keeps the emphasis tags", () => {
    expect(sanitizeRichText("<p><strong>a</strong><em>b</em><u>c</u><s>d</s></p>")).toBe(
      "<p><strong>a</strong><em>b</em><u>c</u><s>d</s></p>",
    );
  });

  it("keeps both list kinds", () => {
    expect(sanitizeRichText("<ul><li>a</li></ul><ol><li>b</li></ol>")).toBe(
      "<ul><li>a</li></ul><ol><li>b</li></ol>",
    );
  });

  it("emits br self-closing and never opens it", () => {
    expect(sanitizeRichText("<p>a<br>b</p>")).toBe("<p>a<br />b</p>");
  });

  it("returns empty for null, undefined and empty input", () => {
    expect(sanitizeRichText(null)).toBe("");
    expect(sanitizeRichText(undefined)).toBe("");
    expect(sanitizeRichText("")).toBe("");
  });
});

describe("sanitizeRichText — normalising what browsers actually emit", () => {
  it("folds b to strong and i to em", () => {
    expect(sanitizeRichText("<b>a</b><i>b</i>")).toBe("<strong>a</strong><em>b</em>");
  });

  it("folds strike and del to s", () => {
    expect(sanitizeRichText("<strike>a</strike><del>b</del>")).toBe("<s>a</s><s>b</s>");
  });

  it("folds div to p, so Chrome and Firefox store the same markup", () => {
    expect(sanitizeRichText("<div>a</div><div>b</div>")).toBe("<p>a</p><p>b</p>");
  });

  it("is case-insensitive about tag names", () => {
    expect(sanitizeRichText("<P><STRONG>a</STRONG></P>")).toBe("<p><strong>a</strong></p>");
  });

  it("strips every attribute from an allowed tag", () => {
    expect(sanitizeRichText('<p class="x" id="y" data-z="1">a</p>')).toBe("<p>a</p>");
  });

  it("unwraps a tag that is not allowed but keeps its words", () => {
    expect(sanitizeRichText("<span>keep</span> <font>this</font>")).toBe("keep this");
  });

  it("unwraps a table rather than deleting the text in it", () => {
    expect(sanitizeRichText("<table><tr><td>cell</td></tr></table>")).toBe("cell");
  });

  it("drops an element left holding nothing after its children were stripped", () => {
    expect(sanitizeRichText("<p><span></span></p>")).toBe("");
    expect(sanitizeRichText("<ul><li><span></span></li></ul>")).toBe("");
  });
});

describe("sanitizeRichText — output is well formed whatever the input was", () => {
  it("closes a tag the input left open", () => {
    expect(sanitizeRichText("<p>a")).toBe("<p>a</p>");
    expect(sanitizeRichText("<ul><li>a")).toBe("<ul><li>a</li></ul>");
  });

  it("drops a closing tag that was never opened", () => {
    expect(sanitizeRichText("</p>a")).toBe("a");
  });

  it("closes an open li when the next one starts, rather than nesting", () => {
    expect(sanitizeRichText("<ul><li>a<li>b</ul>")).toBe("<ul><li>a</li><li>b</li></ul>");
  });

  it("refuses to nest a paragraph in a paragraph", () => {
    expect(sanitizeRichText("<p>a<p>b</p>")).toBe("<p>a</p><p>b</p>");
  });

  it("closes inner tags when an outer one closes", () => {
    expect(sanitizeRichText("<p><strong>a</p>")).toBe("<p><strong>a</strong></p>");
  });

  it("survives a tag that never closes its angle bracket", () => {
    expect(sanitizeRichText("<p")).toBe("");
    expect(sanitizeRichText("<p>a<strong")).toBe("<p>a</p>");
  });

  it("treats a lone angle bracket in prose as text", () => {
    expect(sanitizeRichText("a < b")).toBe("a &lt; b");
    expect(sanitizeRichText("<p>1 < 2 > 0</p>")).toBe("<p>1 &lt; 2 &gt; 0</p>");
  });
});

describe("sanitizeRichText — links", () => {
  it("keeps an https link and composes target and rel itself", () => {
    expect(sanitizeRichText('<a href="https://example.com">go</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">go</a>',
    );
  });

  it("keeps http and mailto", () => {
    expect(sanitizeRichText('<a href="http://example.com">a</a>')).toContain(
      'href="http://example.com"',
    );
    expect(sanitizeRichText('<a href="mailto:a@b.com">a</a>')).toContain('href="mailto:a@b.com"');
  });

  it("reads an unquoted href", () => {
    expect(sanitizeRichText("<a href=https://example.com>go</a>")).toContain(
      'href="https://example.com"',
    );
  });

  it("finds href past an attribute whose value contains a closing bracket", () => {
    expect(sanitizeRichText('<a title="a > b" href="https://example.com">go</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">go</a>',
    );
  });

  it("replaces a target the input supplied rather than carrying it over", () => {
    const out = sanitizeRichText('<a href="https://example.com" target="x" rel="y">go</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).not.toContain('target="x"');
    expect(out).not.toContain('rel="y"');
  });

  it("keeps the words but drops the anchor when the scheme is unsafe", () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">click</a>')).toBe("click");
    expect(sanitizeRichText('<a href="data:text/html,x">click</a>')).toBe("click");
  });

  it("drops a relative or schemeless link", () => {
    expect(sanitizeRichText('<a href="/products/1">click</a>')).toBe("click");
    expect(sanitizeRichText('<a href="//example.com">click</a>')).toBe("click");
    expect(sanitizeRichText('<a href="#anchor">click</a>')).toBe("click");
  });

  it("drops an anchor with no href at all", () => {
    expect(sanitizeRichText("<a>click</a>")).toBe("click");
    expect(sanitizeRichText("<a href>click</a>")).toBe("click");
  });

  it("closes an anchor before opening another, since a browser would", () => {
    // Nested anchors are invalid HTML. Left as they came in, the stored string
    // would describe a tree no browser builds, and closing "the" anchor later
    // would close the wrong one.
    expect(sanitizeRichText('<a href="https://a.com">x<a href="https://b.com">y</a></a>')).toBe(
      '<a href="https://a.com" target="_blank" rel="noopener noreferrer">x</a>' +
        '<a href="https://b.com" target="_blank" rel="noopener noreferrer">y</a>',
    );
  });

  it("takes the last href when a tag carries two, and emits only that one", () => {
    // Whichever one wins, the output holds a single href that this module wrote,
    // so a browser never gets to apply its own precedence rule to the pair.
    expect(sanitizeRichText('<a href="https://ok.com" href="javascript:x">c</a>')).toBe("c");
    expect(sanitizeRichText('<a href="javascript:x" href="https://ok.com">c</a>')).toBe(
      '<a href="https://ok.com" target="_blank" rel="noopener noreferrer">c</a>',
    );
  });

  it("keeps a space in a URL by encoding it, rather than joining the URL up", () => {
    expect(sanitizeRichText('<a href="https://a.com/x y">c</a>')).toBe(
      '<a href="https://a.com/x%20y" target="_blank" rel="noopener noreferrer">c</a>',
    );
  });

  it("escapes a quote inside an otherwise valid href", () => {
    // The quote would close the attribute and let the rest of the value become
    // markup, so it has to come back as an entity.
    expect(sanitizeRichText('<a href=\'https://example.com/?a="b\'>go</a>')).toBe(
      '<a href="https://example.com/?a=&quot;b" target="_blank" rel="noopener noreferrer">go</a>',
    );
  });
});

describe("safeHref", () => {
  it("accepts the three safe schemes", () => {
    expect(safeHref("https://a.com")).toBe("https://a.com");
    expect(safeHref("http://a.com")).toBe("http://a.com");
    expect(safeHref("mailto:a@b.com")).toBe("mailto:a@b.com");
  });

  it("is case-insensitive about the scheme", () => {
    expect(safeHref("HTTPS://a.com")).toBe("HTTPS://a.com");
  });

  it("refuses everything else", () => {
    for (const url of [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "vbscript:msgbox(1)",
      "data:text/html,x",
      "file:///etc/passwd",
      "/relative",
      "//protocol-relative.com",
      "#anchor",
      "example.com",
      "",
      "   ",
    ]) {
      expect(safeHref(url), url).toBeNull();
    }
  });

  it("encodes a space rather than removing it, so the URL is not rewritten", () => {
    expect(safeHref("https://a.com/x y")).toBe("https://a.com/x%20y");
    expect(safeHref("  https://a.com  ")).toBe("https://a.com");
  });

  it("refuses a scheme broken by an internal space, the way a browser does", () => {
    // The space is kept, which is exactly why this is refused: `java script:` is
    // not a scheme to this function or to a browser.
    expect(safeHref("java script:alert(1)")).toBeNull();
  });

  it("refuses a scheme hidden behind control characters or entities", () => {
    for (const url of [
      "java\tscript:alert(1)",
      "java\nscript:alert(1)",
      "java\rscript:alert(1)",
      "java\u0000script:alert(1)",
      " javascript:alert(1)",
      "&#106;avascript:alert(1)",
      "&#x6a;avascript:alert(1)",
      "javascript&colon;alert(1)",
      "\u0001javascript:alert(1)",
    ]) {
      expect(safeHref(url), url).toBeNull();
    }
  });
});

describe("sanitizeRichText — entities round-trip without doubling", () => {
  it("keeps an ampersand encoded exactly once", () => {
    expect(sanitizeRichText("<p>a &amp; b</p>")).toBe("<p>a &amp; b</p>");
    expect(sanitizeRichText("<p>a & b</p>")).toBe("<p>a &amp; b</p>");
  });

  it("keeps an entity-encoded tag as visible text, never as markup", () => {
    expect(sanitizeRichText("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("normalises a non-breaking space to a numeric reference", () => {
    expect(sanitizeRichText("<p>a\u00a0b</p>")).toBe("<p>a&#160;b</p>");
    expect(sanitizeRichText("<p>a&nbsp;b</p>")).toBe("<p>a&#160;b</p>");
  });

  it("is idempotent — the sanitize-in, sanitize-out rule costs nothing", () => {
    const inputs = [
      "<p>a &amp; b</p>",
      "<p>a & b</p>",
      "&lt;script&gt;x&lt;/script&gt;",
      '<a href="https://a.com/?x=1&amp;y=2">link</a>',
      "<p>a\u00a0b</p>",
      "<b>bold</b> and <span>plain</span>",
      "a < b > c",
      ...XSS_PAYLOADS.map(([, input]) => input),
    ];
    for (const input of inputs) {
      const once = sanitizeRichText(input);
      expect(sanitizeRichText(once), input).toBe(once);
    }
  });
});

describe("sanitizeRichText — XSS payloads", () => {
  it.each(XSS_PAYLOADS)("neutralises %s", (_name, input) => {
    const out = sanitizeRichText(input);
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<img/i);
    expect(out).not.toMatch(/<svg/i);
    expect(out).not.toMatch(/on[a-z]+\s*=/i);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).not.toMatch(/vbscript:/i);
    expect(out).not.toMatch(/data:text\/html/i);
    expect(out).not.toMatch(/style\s*=/i);
    // `alert(1)` may well survive as *text* — unwrapping `<scr\u0000ipt>` keeps
    // the words inside it, escaped. That is the intended outcome, so this block
    // asserts the absence of a vector rather than the absence of the string;
    // "the output grammar" below is what proves nothing became markup again.
  });

  it("drops the content of an element that holds no prose", () => {
    expect(sanitizeRichText("<script>alert(1)</script>")).toBe("");
    expect(sanitizeRichText("<style>p{color:red}</style>")).toBe("");
    expect(sanitizeRichText("<svg><circle /></svg>")).toBe("");
    expect(sanitizeRichText("<!-- <b>hidden</b> -->")).toBe("");
  });

  it("keeps surrounding prose when it drops one of those elements", () => {
    expect(sanitizeRichText("<p>before</p><script>alert(1)</script><p>after</p>")).toBe(
      "<p>before</p><p>after</p>",
    );
  });
});

/**
 * The structural invariant, checked over every payload above rather than
 * case by case: whatever went in, what comes out is only tags this module
 * emits, and only the attributes it composes.
 */
describe("sanitizeRichText — the output grammar", () => {
  const ALLOWED = new Set<string>(RICH_TEXT_TAGS);

  const CORPUS = [
    ...XSS_PAYLOADS.map(([, input]) => input),
    "<p>ordinary text</p>",
    "<ul><li>a<li>b</ul>",
    "<p>a<p>b<p>c",
    "a < b",
    "<p",
    "<",
    "<<<>>>",
    '<a href="https://a.com">l</a>',
    "&lt;&gt;&amp;&quot;&#39;",
  ];

  it.each(CORPUS)("emits only allow-listed tags for %j", (input) => {
    const out = sanitizeRichText(input);
    for (const [, name] of out.matchAll(/<\/?([a-zA-Z0-9]+)/g)) {
      expect(ALLOWED.has(name.toLowerCase()), `${name} in ${out}`).toBe(true);
    }
  });

  it.each(CORPUS)("emits attributes only on an anchor for %j", (input) => {
    const out = sanitizeRichText(input);
    for (const [tag] of out.matchAll(/<[a-zA-Z0-9]+[^>]*>/g)) {
      const hasAttrs = /\s/.test(tag.replace(/\s*\/>$/, ""));
      if (hasAttrs) {
        expect(tag).toMatch(
          /^<a href="[^"]*" target="_blank" rel="noopener noreferrer">$/,
        );
      }
    }
  });

  it.each(CORPUS)("leaves every tag balanced for %j", (input) => {
    const out = sanitizeRichText(input);
    const stack: string[] = [];
    for (const [, slash, name] of out.matchAll(/<(\/?)([a-zA-Z0-9]+)[^>]*>/g)) {
      const isClose = slash === "/";
      const lower = name.toLowerCase();
      if (lower === "br") continue;
      if (isClose) {
        expect(stack.pop(), `unbalanced close in ${out}`).toBe(lower);
      } else {
        stack.push(lower);
      }
    }
    expect(stack, `unclosed tags in ${out}`).toEqual([]);
  });
});

describe("isRichTextEmpty", () => {
  it("is true for nothing at all", () => {
    expect(isRichTextEmpty(null)).toBe(true);
    expect(isRichTextEmpty(undefined)).toBe(true);
    expect(isRichTextEmpty("")).toBe(true);
  });

  it("is true for what a cleared contenteditable leaves behind", () => {
    // Every one of these is a browser's idea of "the user deleted everything".
    expect(isRichTextEmpty("<p><br></p>")).toBe(true);
    expect(isRichTextEmpty("<div><br></div>")).toBe(true);
    expect(isRichTextEmpty("<br>")).toBe(true);
    expect(isRichTextEmpty("<p></p>")).toBe(true);
    expect(isRichTextEmpty("<p>&nbsp;</p>")).toBe(true);
    expect(isRichTextEmpty("<p>\u00a0</p>")).toBe(true);
    expect(isRichTextEmpty("<p>   \n  </p>")).toBe(true);
    expect(isRichTextEmpty("<ul><li></li></ul>")).toBe(true);
  });

  it("is false as soon as there is a word", () => {
    expect(isRichTextEmpty("<p>a</p>")).toBe(false);
    expect(isRichTextEmpty("<p><strong>a</strong></p>")).toBe(false);
    expect(isRichTextEmpty("text with no tags")).toBe(false);
  });
});
