import { describe, expect, it } from "vitest";
import { sanitizePreviewHtml } from "../file-viewer-html";

/** The sanitised markup, serialised only so the test can read it. */
function clean(html: string): string {
  const host = document.createElement("div");
  host.appendChild(sanitizePreviewHtml(html, document));
  return host.innerHTML;
}

/** Every attribute name left anywhere in the output. */
function attributesIn(html: string): string[] {
  const host = document.createElement("div");
  host.appendChild(sanitizePreviewHtml(html, document));
  return Array.from(host.querySelectorAll("*")).flatMap((el) => el.getAttributeNames());
}

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

describe("sanitizePreviewHtml", () => {
  it("returns nodes owned by the live document", () => {
    const fragment = sanitizePreviewHtml("<p>Hi</p>", document);
    expect(fragment.ownerDocument).toBe(document);
    expect(fragment.firstChild?.ownerDocument).toBe(document);
  });

  it("keeps document structure: headings, emphasis, lists, quotes, code, rules", () => {
    const html =
      "<h1>T</h1><h4>Four</h4><h6>Six</h6><p><strong>b</strong> <b>b</b> <em>i</em> <i>i</i> <u>u</u> <s>s</s> H<sub>2</sub>O x<sup>2</sup></p>" +
      "<ul><li>one</li></ul><ol><li>two</li></ol><blockquote>q</blockquote><pre><code>c</code></pre><hr><p>a<br>b</p>";
    expect(clean(html)).toBe(html);
  });

  it("keeps tables with their sections, caption and valid spans", () => {
    const html =
      '<table><caption>C</caption><thead><tr><th colspan="2">H</th></tr></thead>' +
      '<tbody><tr><td rowspan="2">a</td><td>b</td></tr></tbody><tfoot><tr><td>f</td></tr></tfoot></table>';
    expect(clean(html)).toBe(html);
  });

  it("drops out-of-range or malformed spans", () => {
    expect(attributesIn('<table><tr><td colspan="0">a</td><td colspan="5000">b</td><td rowspan="2x">c</td></tr></table>')).toEqual([]);
  });

  it("keeps http(s) and mailto links, opened in a new tab", () => {
    expect(clean('<a href="https://example.com/a?b=1">x</a>')).toBe(
      '<a href="https://example.com/a?b=1" target="_blank" rel="noopener noreferrer">x</a>',
    );
    expect(clean('<a href="mailto:ana@example.com">m</a>')).toContain('href="mailto:ana@example.com"');
  });

  it("keeps raster data: and https images, with their alt", () => {
    expect(clean(`<img src="${PIXEL}" alt="dot">`)).toBe(`<img src="${PIXEL}" alt="dot">`);
    expect(clean('<img src="https://cdn.example.com/a.png">')).toBe('<img src="https://cdn.example.com/a.png" alt="">');
  });

  it("drops text decoration that the converter might not have stripped: style, class, id", () => {
    expect(
      attributesIn('<p style="color:red" class="x" id="y" title="t" dir="rtl" lang="en">a</p>'),
    ).toEqual([]);
  });

  it("unwraps unknown elements and keeps their text", () => {
    expect(clean("<div><span>kept</span> <font>also</font></div><article><section>deep</section></article>")).toBe(
      "kept alsodeep",
    );
  });

  it("escapes text instead of parsing it", () => {
    expect(clean("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });

  describe("hostile input", () => {
    it.each([
      ["script", "<script>alert(1)</script>"],
      ["script with src", '<script src="https://evil.example/x.js"></script>'],
      ["style", "<style>body{background:url(javascript:alert(1))}</style>"],
      ["iframe", '<iframe src="https://evil.example"></iframe>'],
      ["iframe srcdoc", '<iframe srcdoc="<script>alert(1)</script>"></iframe>'],
      ["object", '<object data="evil.swf"><param name="x"></object>'],
      ["embed", '<embed src="evil.swf">'],
      ["form", '<form action="https://evil.example"><input name="pw"><button>Go</button></form>'],
      ["select / textarea", "<select><option>o</option></select><textarea>t</textarea>"],
      ["link / meta / base", '<link rel="stylesheet" href="https://evil.example/x.css"><meta http-equiv="refresh" content="0;url=javascript:alert(1)"><base href="https://evil.example/">'],
      ["svg", '<svg onload="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">x</a></svg>'],
      ["svg foreignObject", '<svg><foreignObject><img src="https://e.example/x.png" onerror="alert(1)"></foreignObject></svg>'],
      ["math", '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)></style></mglyph></table></mtext></math>'],
      ["template", '<template><img src="https://e.example/x.png" onerror="alert(1)"></template>'],
      ["nested templates", "<template><template><script>alert(1)</script></template><img src=x onerror=alert(1)></template>"],
      ["noscript", '<noscript><img src="https://e.example/x.png" onerror="alert(1)"></noscript>'],
    ])("drops %s with everything in it", (_name, html) => {
      // Body content first, so each case is parsed in the body as a document would be.
      expect(clean(`<p>before</p>${html}<p>after</p>`)).toBe("<p>before</p><p>after</p>");
    });

    it("drops every event handler", () => {
      const html =
        '<p onclick="alert(1)">a</p><img src="https://e.example/x.png" onerror="alert(1)" onload="alert(2)">' +
        '<a href="https://e.example" onmouseover="alert(3)">x</a><table onpointerenter="alert(4)"><tr><td onfocus="alert(5)">c</td></tr></table>';
      expect(attributesIn(html).filter((name) => name.startsWith("on"))).toEqual([]);
    });

    it("drops an image whose src is not a raster data: or https URL", () => {
      expect(clean('<img src=x onerror="alert(1)">')).toBe("");
      expect(clean('<img src="http://e.example/x.png">')).toBe("");
      expect(clean('<img src="javascript:alert(1)">')).toBe("");
      expect(clean('<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">')).toBe("");
      expect(clean('<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">')).toBe("");
      expect(clean('<img src="//e.example/x.png">')).toBe("");
    });

    it("never copies srcset or sizes, so they can't name another source", () => {
      expect(clean('<img src="https://e.example/a.png" srcset="javascript:alert(1) 1x, http://e.example/b.png 2x" sizes="10px">')).toBe(
        '<img src="https://e.example/a.png" alt="">',
      );
      expect(clean('<picture><source srcset="https://e.example/a.png"><img src="https://e.example/b.png"></picture>')).toBe(
        '<img src="https://e.example/b.png" alt="">',
      );
    });

    it.each([
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "java\tscript:alert(1)",
      "java\nscript:alert(1)",
      "java&#x09;script:alert(1)",
      "\u0001javascript:alert(1)",
      " javascript:alert(1)",
      "javascript&colon;alert(1)",
      "&#106;avascript:alert(1)",
      "vbscript:msgbox(1)",
      "data:text/html,<script>alert(1)</script>",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "/relative",
      "#bookmark",
      "//evil.example",
    ])("drops the href %j and keeps the link text", (href) => {
      const host = document.createElement("div");
      host.appendChild(sanitizePreviewHtml(`<a href="${href.replace(/"/g, "&quot;")}">text</a>`, document));
      const anchor = host.querySelector("a");
      expect(anchor?.hasAttribute("href")).toBe(false);
      expect(host.textContent).toBe("text");
    });

    it("ignores target and rel from the input", () => {
      expect(clean('<a href="https://e.example" target="_self" rel="opener">x</a>')).toBe(
        '<a href="https://e.example" target="_blank" rel="noopener noreferrer">x</a>',
      );
    });

    it("drops comments and the document's head", () => {
      expect(clean("<html><head><title>T</title><style>p{}</style></head><body><!-- <script>x</script> --><p>a</p></body></html>")).toBe(
        "<p>a</p>",
      );
    });

    it("doesn't let unbalanced markup reopen a dropped element", () => {
      expect(clean('<p>a</p></script><script>alert(1)</script><p title="</p><script>alert(2)</script>">b</p>')).toBe(
        "<p>a</p><p>b</p>",
      );
    });

    it("runs nothing while sanitising", () => {
      const fired: string[] = [];
      (window as unknown as Record<string, unknown>).__fvProbe = (v: string) => fired.push(v);
      sanitizePreviewHtml(
        '<img src=x onerror="__fvProbe(\'img\')"><script>__fvProbe("script")</script><svg onload="__fvProbe(\'svg\')"></svg>',
        document,
      );
      expect(fired).toEqual([]);
      delete (window as unknown as Record<string, unknown>).__fvProbe;
    });
  });
});
