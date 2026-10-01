import { createRef } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { richTextTags, sanitizeRichText, type RichTextSanitizeOptions } from "@/lib/rich-text";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog";
import type { RichTextEditorHandle } from "../rich-text-editor";
import { Harness, canonical, edit, editorOf, paste, surface as editor, tagsIn, typeText } from "./rich-text-editor.helpers";

/**
 * The opt-in capabilities: `formatting="extended"`, `uploadImage`,
 * `linkPanel` (with and without targets) and `insertActions` / the `insert`
 * handle. The default editor is covered in rich-text-editor.test.tsx.
 */

const toolbarNames = () =>
  Array.from(screen.getByRole("toolbar", { name: "Formatting" }).querySelectorAll("button"), (b) =>
    b.getAttribute("aria-label") ?? b.textContent?.trim(),
  );

describe("RichTextEditor — extended formatting", () => {
  it("adds strikethrough, inline code, headings, quote and code block, in groups", () => {
    render(<Harness formatting="extended" />);
    expect(toolbarNames()).toEqual([
      "Bold",
      "Italic",
      "Strikethrough",
      "Inline code",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Quote",
      "Code block",
      "Bulleted list",
      "Numbered list",
      "Link",
    ]);
  });

  it("turns a paragraph into a heading and back", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness formatting="extended" initial="<p>Title</p>" onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection(2));

    await user.click(screen.getByRole("button", { name: "Heading 2" }));
    expect(onChange).toHaveBeenLastCalledWith("<h2>Title</h2>");
    expect(screen.getByRole("button", { name: "Heading 2" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Heading 2" }));
    expect(onChange).toHaveBeenLastCalledWith("<p>Title</p>");
  });

  it("takes Markdown-style typing shortcuts", () => {
    const onChange = vi.fn();
    render(<Harness formatting="extended" onChange={onChange} />);
    const e = editorOf(editor());

    typeText(e, "## Hi");
    expect(onChange).toHaveBeenLastCalledWith("<h2>Hi</h2>");
  });

  it("leaves --- as text: there is no horizontal rule", () => {
    const onChange = vi.fn();
    render(<Harness formatting="extended" onChange={onChange} />);
    typeText(editorOf(editor()), "---");
    expect(onChange.mock.lastCall?.[0]).not.toContain("<hr");
    expect(editor()).toHaveTextContent("---");
  });

  it("stops headings at h3", () => {
    const onChange = vi.fn();
    render(<Harness formatting="extended" initial="<h4>Four</h4>" onChange={onChange} />);
    edit(() => editorOf(editor()).commands.insertContent(" more"));
    expect(onChange.mock.lastCall?.[0]).not.toMatch(/<h[4-6]/);
  });

  it("keeps pasted HTML, reduced to its schema", () => {
    const onChange = vi.fn();
    render(<Harness formatting="extended" onChange={onChange} />);
    paste(editor(), {
      "text/html": '<h1 style="color:red">Big</h1><table><tr><td>cell</td></tr></table><p><span>x</span></p>',
      "text/plain": "Big cell x",
    });
    const out = onChange.mock.lastCall?.[0] as string;
    expect(out).toContain("<h1>Big</h1>");
    expect(out).not.toMatch(/<(table|td|span)|style=/);
    expect(out).toContain("cell");
  });

  it("the default editor still has none of it", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    typeText(editorOf(editor()), "## Hi");
    expect(onChange).toHaveBeenLastCalledWith("<p>## Hi</p>");
    expect(screen.queryByRole("button", { name: "Heading 1" })).not.toBeInTheDocument();
  });
});

/**
 * Every configuration, fed a document holding every tag any editor could make
 * and some none should, must emit only its own tag set — the set its matching
 * `sanitizeRichText` keeps — and sanitizing what it emits must change nothing
 * that renders. This is the guarantee that what somebody sees in the editor is
 * what is saved.
 */
describe("RichTextEditor — output fits the sanitizer, per configuration", () => {
  const EVERYTHING =
    "<h1>One</h1><h2>Two</h2><h3>Three</h3><h5>Five</h5>" +
    '<p><strong>b</strong> <em>i</em> <s>s</s> <u>u</u> <code>c</code> <a href="https://x.com">l</a> <a href="{{booking_link}}">t</a></p>' +
    '<blockquote><p>q</p></blockquote><pre><code class="language-js">x = 1</code></pre>' +
    '<ul><li>u</li></ul><ol start="3" type="a"><li>o</li></ol><p></p><p><br></p>' +
    '<img src="https://x.com/a.png" alt="A" width="10"><hr><table><tr><td>t</td></tr></table>';

  const configs: [string, Partial<React.ComponentProps<typeof Harness>>, RichTextSanitizeOptions][] = [
    ["basic", {}, {}],
    ["extended", { formatting: "extended" }, { formatting: "extended" }],
    ["basic + images", { uploadImage: async () => null }, { images: true }],
    ["extended + images", { formatting: "extended", uploadImage: async () => null }, { formatting: "extended", images: true }],
    ["extended + link panel", { formatting: "extended", linkPanel: true }, { formatting: "extended" }],
  ];

  it.each(configs)("%s", (_name, props, options) => {
    const onChange = vi.fn();
    render(<Harness {...props} onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setContent(EVERYTHING, { emitUpdate: true }));
    const out = onChange.mock.lastCall?.[0] as string;

    const allowed = new Set([...richTextTags(options), "br"]);
    for (const tag of tagsIn(out)) expect(allowed.has(tag), `<${tag}>`).toBe(true);
    expect(out).not.toContain("<hr");

    // The {{target}} link is the documented exception: the editor keeps its
    // href for the app's own sanitizer, which Carbon's does not keep.
    const comparable = out.replace(/<a [^>]*href="\{\{booking_link\}\}"[^>]*>(.*?)<\/a>/, "$1");
    expect(canonical(sanitizeRichText(comparable, options))).toBe(canonical(comparable));
  });
});

describe("RichTextEditor — image upload", () => {
  const file = () => new File(["x"], "a.png", { type: "image/png" });
  const pick = (f: File) => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { files: [f] } });
    });
  };

  it("adds an Insert image button only when uploadImage is given", () => {
    const { unmount } = render(<Harness />);
    expect(screen.queryByRole("button", { name: "Insert image" })).not.toBeInTheDocument();
    unmount();
    render(<Harness uploadImage={async () => null} />);
    expect(screen.getByRole("button", { name: "Insert image" })).toBeInTheDocument();
  });

  it("inserts the URL the upload resolves to, at the caret", async () => {
    const onChange = vi.fn();
    const uploadImage = vi.fn(async () => "https://cdn.example.com/1.png");
    render(<Harness initial="<p>before</p>" uploadImage={uploadImage} onChange={onChange} />);

    const f = file();
    pick(f);
    expect(uploadImage).toHaveBeenCalledWith(f);
    await waitFor(() => expect(onChange.mock.lastCall?.[0]).toContain('<img src="https://cdn.example.com/1.png"'));
  });

  it("makes a relative upload URL absolute, so the image survives the save", async () => {
    const onChange = vi.fn();
    render(<Harness uploadImage={async () => "/api/files/1"} onChange={onChange} />);
    pick(file());

    const absolute = new URL("/api/files/1", window.location.href).href;
    await waitFor(() => expect(onChange.mock.lastCall?.[0]).toContain(`<img src="${absolute}"`));
    const out = onChange.mock.lastCall![0] as string;
    expect(sanitizeRichText(out, { images: true })).toContain(`src="${absolute}"`);
  });

  it.each(["data:image/png;base64,AAAA", "blob:https://app.example.com/1", "javascript:alert(1)"])(
    "inserts nothing, and says why, when the upload resolves to %s",
    async (url) => {
      const onChange = vi.fn();
      render(<Harness uploadImage={async () => url} onChange={onChange} />);
      pick(file());
      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("can't be saved"));
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it("inserts nothing when the upload finishes after the editor was disabled", async () => {
    let resolve!: (url: string | null) => void;
    const onChange = vi.fn();
    const { rerender } = render(
      <Harness uploadImage={() => new Promise((r) => (resolve = r))} onChange={onChange} />,
    );
    pick(file());
    await screen.findByRole("button", { name: "Uploading image…" });

    // A save starts: the form disables the editor and sends what it has.
    rerender(<Harness uploadImage={() => new Promise((r) => (resolve = r))} onChange={onChange} disabled />);
    await act(async () => resolve("https://cdn.example.com/1.png"));

    expect(editor().querySelector("img")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the upload in progress, and is disabled while it runs", async () => {
    let resolve!: (url: string | null) => void;
    render(<Harness uploadImage={() => new Promise((r) => (resolve = r))} />);
    pick(file());

    const busy = await screen.findByRole("button", { name: "Uploading image…" });
    expect(busy).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Uploading image…");

    await act(async () => resolve(null));
    expect(screen.getByRole("button", { name: "Insert image" })).toBeEnabled();
  });

  it.each([
    ["resolves to null", async () => null],
    ["rejects", async () => Promise.reject(new Error("too big"))],
  ])("inserts nothing, and recovers, when the upload %s", async (_name, uploadImage) => {
    const onChange = vi.fn();
    render(<Harness initial="<p>x</p>" uploadImage={uploadImage} onChange={onChange} />);
    pick(file());
    await waitFor(() => expect(screen.getByRole("button", { name: "Insert image" })).toBeEnabled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores a pasted or dropped file: images come in through the button only", () => {
    const onChange = vi.fn();
    render(<Harness uploadImage={async () => "/x.png"} onChange={onChange} />);
    paste(editor(), {}, [file()]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reads a relative src in stored content as absolute, as the save will need", () => {
    render(<Harness uploadImage={async () => null} initial='<p>a</p><img src="/api/files/9" alt="">' />);
    expect(editor().querySelector("img")?.getAttribute("src")).toBe(new URL("/api/files/9", window.location.href).href);
  });

  it("drops images from pasted HTML, so a pasted page cannot fetch from its servers", () => {
    const onChange = vi.fn();
    render(<Harness formatting="extended" uploadImage={async () => null} onChange={onChange} />);
    paste(editor(), {
      "text/html": '<p>Hello</p><img src="https://tracker.example.com/pixel.gif" alt=""><p>there</p>',
      "text/plain": "Hello\nthere",
    });
    expect(editor().querySelector("img")).toBeNull();
    expect(onChange.mock.lastCall?.[0]).toContain("Hello");
    expect(onChange.mock.lastCall?.[0]).not.toContain("<img");
  });

  it("keeps an image this editor already held, as a drag or a cut and paste moves it", () => {
    const src = "https://cdn.example.com/1.png";
    render(<Harness formatting="extended" uploadImage={async () => null} initial={`<p>a</p><img src="${src}" alt=""><p>b</p>`} />);
    const tiptap = editorOf(editor());
    // Cut: the image leaves the document, then comes back through the clipboard.
    edit(() => {
      tiptap.commands.setContent("<p>a</p><p>b</p>", { emitUpdate: false });
    });
    expect(editor().querySelector("img")).toBeNull();
    paste(editor(), { "text/html": `<img src="${src}" alt="">` });
    expect(editor().querySelector("img")?.getAttribute("src")).toBe(src);
  });

  it("refills a quote left holding nothing once its pasted image is removed", () => {
    render(<Harness formatting="extended" uploadImage={async () => null} initial="<p>x</p>" />);
    paste(editor(), {
      "text/html": '<p>before</p><blockquote><img src="https://tracker.example.com/p.gif"></blockquote><p>after</p>',
    });
    const doc = editorOf(editor()).state.doc;
    expect(() => doc.check()).not.toThrow();
    expect(editor().querySelector("img")).toBeNull();
  });

  it("inserts nothing for a paste that was only an image", () => {
    const onChange = vi.fn();
    render(<Harness formatting="extended" uploadImage={async () => null} initial="<p>x</p>" onChange={onChange} />);
    paste(editor(), { "text/html": '<img src="https://tracker.example.com/pixel.gif" alt="">' });
    expect(editor().querySelector("img")).toBeNull();
  });
});

describe("RichTextEditor — the full link panel", () => {
  const BOOKING = { href: "{{booking_link}}", name: "booking link", description: "Each person's own booking page." };
  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole("button", { name: /link/i }));
    return screen.getByRole("textbox", { name: "URL" });
  };

  it("normalises what is typed, and links the selected text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness linkPanel initial="<p>Docs</p>" onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection({ from: 1, to: 5 }));

    const url = await open(user);
    await user.type(url, "example.com{Enter}");
    expect(onChange.mock.lastCall?.[0]).toBe('<p><a target="_blank" rel="noopener noreferrer" href="https://example.com">Docs</a></p>');
    await waitFor(() => expect(editor()).toHaveFocus());
  });

  it("shows an inline error and keeps the panel open for a refused URL", async () => {
    const user = userEvent.setup();
    render(<Harness linkPanel initial="<p>x</p>" />);
    const url = await open(user);
    await user.type(url, "javascript:alert(1){Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(/https:\/\//);
    expect(url).toHaveAttribute("aria-invalid", "true");
  });

  it("with nothing selected, inserts the optional text to show", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness linkPanel onChange={onChange} />);
    const url = await open(user);
    await user.type(url, "https://x.com");
    await user.type(screen.getByRole("textbox", { name: "Text to show (optional)" }), "Site{Enter}");
    expect(onChange.mock.lastCall?.[0]).toContain(">Site</a>");
  });

  it("offers each declared target, worded by the app, and accepts it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness linkPanel={{ targets: [BOOKING] }} initial="<p>Book</p>" onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection({ from: 1, to: 5 }));
    await open(user);

    expect(screen.getByText(BOOKING.description)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Use booking link" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange.mock.lastCall?.[0]).toContain('href="{{booking_link}}"');
  });

  it("refuses a placeholder that is not a declared target, naming the ones that are", async () => {
    const user = userEvent.setup();
    render(<Harness linkPanel={{ targets: [BOOKING] }} initial="<p>x</p>" />);
    const url = await open(user);
    await user.type(url, "{{{{first_name}}{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(/^Only \{\{booking_link\}\} can be used as a link/);
  });

  it("removes the link the caret is in, keeping its text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness linkPanel initial='<p><a href="https://x.com">Site</a></p>' onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection(3));
    await open(user);
    await user.click(screen.getByRole("button", { name: "Remove link" }));
    expect(onChange.mock.lastCall?.[0]).toBe("<p>Site</p>");
  });

  it("inside a Dialog, Escape closes only the panel and focus returns to the editor", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Template</DialogTitle>
          <DialogDescription>Edit it.</DialogDescription>
          <Harness linkPanel initial="<p>draft</p>" />
        </DialogContent>
      </Dialog>,
    );
    const url = await open(user);
    await user.type(url, "{Escape}");
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "URL" })).not.toBeInTheDocument());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await waitFor(() => expect(editor()).toHaveFocus());
  });

  it("keeps a stored {{target}} href in an editor that does not declare it", () => {
    const onChange = vi.fn();
    render(<Harness linkPanel initial='<p><a href="{{booking_link}}">Book</a></p>' onChange={onChange} />);
    edit(() => editorOf(editor()).commands.insertContentAt(1, "x"));
    expect(onChange.mock.lastCall?.[0]).toContain('href="{{booking_link}}"');
  });
});

describe("RichTextEditor — insert actions and the insert handle", () => {
  it("adds a button per action that inserts its HTML at the caret", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        initial="<p>Hi there</p>"
        insertActions={[{ label: "First name", title: "Inserts {{first_name}}", html: "{{first_name}}" }]}
        onChange={onChange}
      />,
    );
    // After "Hi " (positions count from 1 inside the paragraph).
    edit(() => editorOf(editor()).commands.setTextSelection(4));
    await user.click(screen.getByRole("button", { name: "First name" }));
    expect(onChange.mock.lastCall?.[0]).toBe("<p>Hi {{first_name}}there</p>");
  });

  it("reduces an action's HTML to the editor's schema", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness insertActions={[{ label: "Sig", html: "<h1>Big</h1><table><tr><td>t</td></tr></table>" }]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Sig" }));
    expect(onChange.mock.lastCall?.[0]).not.toMatch(/<(h1|table|td)/);
  });

  it("ref.insert puts HTML at the last caret position, from outside the editor", () => {
    const ref = createRef<RichTextEditorHandle>();
    const onChange = vi.fn();
    render(<Harness ref={ref} initial="<p>Hi there</p>" onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection(4));
    act(() => ref.current?.insert("you "));
    expect(onChange).toHaveBeenLastCalledWith("<p>Hi you there</p>");
  });

  it("ref.focus focuses the editor", async () => {
    const ref = createRef<RichTextEditorHandle>();
    render(<Harness ref={ref} />);
    act(() => ref.current?.focus());
    // TipTap focuses on the next animation frame.
    await waitFor(() => expect(editor()).toHaveFocus());
  });
});
