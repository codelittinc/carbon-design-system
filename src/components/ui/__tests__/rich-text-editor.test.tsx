import { createRef, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { isRichTextEmpty } from "@/lib/rich-text";
import { CommandPalette } from "../command-palette";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog";
import { RichTextEditor, type RichTextEditorHandle } from "../rich-text-editor";
import { Harness, edit, editorOf, paste, press, surface as editor, typeChars } from "./rich-text-editor.helpers";

/**
 * The default editor — `RichTextEditor` with only the props it has always had
 * — and everything every configuration shares: what renders, what reaches
 * `onChange`, the caret-preserving sync rule, the link row, `disabled`, the
 * accessibility contract and the server render.
 *
 * The sync rule is the one worth reading twice. `value` coming back equal to
 * what the editor emitted must NOT replace the content, because replacing it
 * moves the caret to the start of the field on every keystroke.
 *
 * Formatting fidelity in a real browser (typing, IME, the clipboard, caret
 * visuals) is checked in Storybook; see the helpers file for why typing here
 * is mostly driven through the editor's state.
 */

describe("RichTextEditor — what renders", () => {
  it("renders an editable multiline textbox", () => {
    render(<Harness />);
    const el = editor();
    expect(el).toHaveAttribute("contenteditable", "true");
    expect(el).toHaveAttribute("aria-multiline", "true");
  });

  it("renders exactly Bold, Italic, Bulleted list, Numbered list and Link, in that order", () => {
    render(<Harness />);
    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    const names = [...toolbar.querySelectorAll("button")].map((b) => b.getAttribute("aria-label"));
    expect(names).toEqual(["Bold", "Italic", "Bulleted list", "Numbered list", "Link"]);
    // No separators in the default toolbar, so it looks as it always has.
    expect(toolbar.querySelector('[data-orientation="vertical"]')).toBeNull();
  });

  it("starts with every formatting button unpressed", () => {
    render(<Harness />);
    for (const label of ["Bold", "Italic", "Bulleted list", "Numbered list"]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("puts the initial value into the editable surface", () => {
    render(<Harness initial="<p>existing note</p>" />);
    expect(editor().innerHTML).toBe("<p>existing note</p>");
  });

  it("passes id through so a FormField label can point at it", () => {
    render(<Harness id="notes" />);
    expect(editor()).toHaveAttribute("id", "notes");
  });

  it("marks the surface invalid when asked", () => {
    render(<Harness invalid />);
    expect(editor()).toHaveAttribute("aria-invalid", "true");
  });

  it("applies className to the editable surface, after its own classes", () => {
    render(<Harness className="min-h-48 text-base" />);
    expect(editor()).toHaveClass("min-h-48", "text-base");
    // tailwind-merge lets the app's size win over the default.
    expect(editor()).not.toHaveClass("min-h-24");
  });
});

describe("RichTextEditor — the placeholder", () => {
  it("shows while there is nothing to read", () => {
    render(<Harness placeholder="Add a note…" />);
    expect(screen.getByText("Add a note…")).toBeInTheDocument();
  });

  it("shows for the markup a cleared contenteditable leaves behind", () => {
    // Not the empty string — this is what a browser leaves after somebody types
    // and deletes, and it is the case a naive `value === ""` check gets wrong.
    render(<Harness initial="<p><br></p>" placeholder="Add a note…" />);
    expect(screen.getByText("Add a note…")).toBeInTheDocument();
  });

  it("is hidden once there is content", () => {
    render(<Harness initial="<p>written</p>" placeholder="Add a note…" />);
    expect(screen.queryByText("Add a note…")).not.toBeInTheDocument();
  });

  it("comes back after somebody types and clears the field", () => {
    render(<Harness placeholder="Add a note…" />);
    const ed = editorOf(editor());
    edit(() => ed.commands.insertContent("x"));
    expect(screen.queryByText("Add a note…")).not.toBeInTheDocument();
    edit(() => ed.chain().selectAll().deleteSelection().run());
    expect(screen.getByText("Add a note…")).toBeInTheDocument();
  });

  it("is hidden from assistive tech, which reads the labelled textbox instead", () => {
    render(<Harness placeholder="Add a note…" />);
    expect(screen.getByText("Add a note…")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("RichTextEditor — onChange", () => {
  it("emits the editor's HTML when it is typed in", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(editor());
    await typeChars(user, "hello");

    expect(onChange.mock.lastCall?.[0]).toBe("<p>hello</p>");
  });

  it("emits an edit straight away, without waiting for blur", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    edit(() => editorOf(editor()).commands.insertContent("typed"));
    expect(onChange).toHaveBeenLastCalledWith("<p>typed</p>");
  });

  it("is not called on mount", () => {
    const onChange = vi.fn();
    render(<Harness initial="<p>a note</p>" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is not called when value replaces the content, or when disabled or invalid change", () => {
    const onChange = vi.fn();
    const { rerender } = render(<RichTextEditor value="<p>first</p>" onChange={onChange} ariaLabel="Notes" />);
    rerender(<RichTextEditor value="<p>second</p>" onChange={onChange} ariaLabel="Notes" />);
    rerender(<RichTextEditor value="<p>second</p>" onChange={onChange} ariaLabel="Notes" disabled />);
    rerender(<RichTextEditor value="<p>second</p>" onChange={onChange} ariaLabel="Notes" invalid />);
    rerender(<RichTextEditor value="" onChange={onChange} ariaLabel="Notes" />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("emits the empty string when the editor is emptied", () => {
    const onChange = vi.fn();
    render(<Harness initial="<p>something</p>" onChange={onChange} />);
    edit(() => editorOf(editor()).chain().selectAll().deleteSelection().run());
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("emits a blank line as <p><br></p>, which the sanitizer keeps", () => {
    const onChange = vi.fn();
    render(<Harness initial="<p>a</p>" onChange={onChange} />);
    const ed = editorOf(editor());
    edit(() => ed.chain().setTextSelection(2).splitBlock().splitBlock().insertContent("b").run());
    expect(onChange).toHaveBeenLastCalledWith("<p>a</p><p><br></p><p>b</p>");
  });

  it("loads a stored blank line as one, and leaves it alone", () => {
    const onChange = vi.fn();
    render(<Harness initial="<p>a</p><p><br /></p><p>b</p>" onChange={onChange} />);
    expect(editorOf(editor()).getHTML()).toBe("<p>a</p><p></p><p>b</p>");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("emits only values whose emptiness matches what the person sees", () => {
    const seen: string[] = [];
    render(<Harness onChange={(html) => seen.push(html)} />);
    const ed = editorOf(editor());
    edit(() => ed.commands.insertContent("a"));
    edit(() => ed.chain().selectAll().deleteSelection().run());
    edit(() => ed.chain().toggleBulletList().run());
    for (const html of seen) {
      const el = document.createElement("div");
      el.innerHTML = html;
      expect(isRichTextEmpty(html), html).toBe((el.textContent ?? "").trim() === "");
    }
  });
});

describe("RichTextEditor — the caret-preserving sync rule", () => {
  it("does not replace the content when value echoes back what it emitted", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const el = editor();
    await user.click(el);
    await typeChars(user, "abc");

    // The controlled parent has re-rendered with the emitted value by now. If
    // the sync effect treated that as an external change it would have
    // replaced the document, and the caret with it.
    expect(el.textContent).toBe("abc");
    expect(editorOf(el).state.selection.from).toBe(4);
  });

  it("keeps the caret where it is when the parent re-renders with the same value", () => {
    function Host() {
      const [value, setValue] = useState("<p>hello world</p>");
      const [, setTick] = useState(0);
      return (
        <>
          <RichTextEditor value={value} onChange={setValue} ariaLabel="Notes" />
          <button type="button" onClick={() => setTick((t) => t + 1)}>
            Re-render
          </button>
        </>
      );
    }
    render(<Host />);
    const ed = editorOf(editor());
    edit(() => ed.commands.setTextSelection(6));
    edit(() => ed.commands.insertContent("X"));
    expect(ed.state.selection.from).toBe(7);
    act(() => screen.getByRole("button", { name: "Re-render" }).click());
    expect(ed.state.selection.from).toBe(7);
    expect(ed.getText()).toBe("helloX world");
  });

  it("does replace the content for a genuine external change", () => {
    const { rerender } = render(<RichTextEditor value="<p>first</p>" onChange={() => {}} ariaLabel="Notes" />);
    expect(editor().innerHTML).toBe("<p>first</p>");

    // A form reset, or a different record loading into the same field.
    rerender(<RichTextEditor value="<p>second</p>" onChange={() => {}} ariaLabel="Notes" />);
    expect(editor().innerHTML).toBe("<p>second</p>");
  });

  it("clears the surface when the value is reset to empty", () => {
    const { rerender } = render(
      <RichTextEditor value="<p>first</p>" onChange={() => {}} ariaLabel="Notes" placeholder="Add a note…" />,
    );
    rerender(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" placeholder="Add a note…" />);
    expect(editor().textContent).toBe("");
    expect(screen.getByText("Add a note…")).toBeInTheDocument();
  });

  it("reads tag-less text as plain text only when acceptPlainText is set", () => {
    const { unmount } = render(<Harness initial={"one\n\ntwo\nthree"} acceptPlainText />);
    expect(editorOf(editor()).getHTML()).toBe("<p>one</p><p>two<br>three</p>");
    unmount();

    // Off by default: a sanitized tag-less value with an entity is HTML, and
    // reading it as text would double-escape it.
    render(<Harness initial="a &amp; b" />);
    expect(editor().textContent).toBe("a & b");
  });
});

describe("RichTextEditor — the link row", () => {
  const openRow = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole("button", { name: "Link" }));
    return screen.getByRole("textbox", { name: "Link address" });
  };

  it("replaces the toolbar with an address field", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = await openRow(user);
    expect(input).toBeInTheDocument();
    // The formatting buttons are gone while the row is open, so the row cannot
    // be confused for a sixth button.
    expect(screen.queryByRole("button", { name: "Bold" })).not.toBeInTheDocument();
  });

  it("prefills https:// rather than an empty field", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(await openRow(user)).toHaveValue("https://");
  });

  it("prefills the href of the link the caret is in", async () => {
    const user = userEvent.setup();
    render(<Harness initial='<p><a href="https://example.com/jobs">jobs</a></p>' />);
    edit(() => editorOf(editor()).commands.setTextSelection(3));
    expect(await openRow(user)).toHaveValue("https://example.com/jobs");
  });

  it("refuses a URL the sanitizer would strip, so a link cannot work until it is saved", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = await openRow(user);
    const apply = screen.getByRole("button", { name: "Apply link" });

    await user.clear(input);
    await user.type(input, "javascript:alert(1)");
    expect(apply).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.clear(input);
    await user.type(input, "example.com");
    expect(apply).toBeDisabled();

    await user.clear(input);
    await user.type(input, "https://example.com");
    expect(apply).toBeEnabled();
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("accepts mailto, which is a normal thing to put in a note", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = await openRow(user);
    await user.clear(input);
    await user.type(input, "mailto:it@example.com");
    expect(screen.getByRole("button", { name: "Apply link" })).toBeEnabled();
  });

  it("links the selected text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="<p>see the docs</p>" onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection({ from: 9, to: 13 }));
    const input = await openRow(user);
    await user.clear(input);
    await user.type(input, "https://example.com{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(
      '<p>see the <a target="_blank" rel="noopener noreferrer" href="https://example.com">docs</a></p>',
    );
  });

  it("with nothing selected, makes the URL its own link text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = await openRow(user);
    await user.clear(input);
    await user.type(input, "https://example.com");
    await user.click(screen.getByRole("button", { name: "Apply link" }));
    expect(onChange).toHaveBeenLastCalledWith(
      '<p><a target="_blank" rel="noopener noreferrer" href="https://example.com">https://example.com</a></p>',
    );
  });

  it("removes the link the caret is in, keeping its text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial='<p><a href="https://example.com">jobs</a> page</p>' onChange={onChange} />);
    edit(() => editorOf(editor()).commands.setTextSelection(3));
    await openRow(user);
    await user.click(screen.getByRole("button", { name: "Remove link" }));
    expect(onChange).toHaveBeenLastCalledWith("<p>jobs page</p>");
  });

  it("has nothing to remove when the caret is not in a link", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openRow(user);
    expect(screen.getByRole("button", { name: "Remove link" })).toBeDisabled();
  });

  it("closes on cancel and brings the toolbar back", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openRow(user);

    await user.click(screen.getByRole("button", { name: "Cancel link" }));
    expect(screen.queryByRole("textbox", { name: "Link address" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = await openRow(user);

    await user.type(input, "{Escape}");
    expect(screen.queryByRole("textbox", { name: "Link address" })).not.toBeInTheDocument();
  });

  it("opens on Cmd+K from inside the editor", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(editor());
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("textbox", { name: "Link address" })).toBeInTheDocument();
  });

  it("opens on Ctrl+K too", () => {
    render(<Harness />);
    press(editor(), "k", { ctrl: true });
    expect(screen.getByRole("textbox", { name: "Link address" })).toBeInTheDocument();
  });

  it("keeps Cmd+K from also opening a CommandPalette on the page", () => {
    // The palette binds ⌘K on document. Opening it over the link row put focus
    // in the palette, so the address went into the search box and the
    // editor's selection was lost.
    const onOpenChange = vi.fn();
    render(
      <>
        <Harness />
        <CommandPalette open={false} onOpenChange={onOpenChange}>
          {null}
        </CommandPalette>
      </>,
    );
    press(editor(), "k", { ctrl: true });
    expect(screen.getByRole("textbox", { name: "Link address" })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes when the editor is disabled, as when a save starts", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" />);
    await openRow(user);
    rerender(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" disabled />);
    expect(screen.queryByRole("textbox", { name: "Link address" })).not.toBeInTheDocument();
  });

  it("inside a Dialog, Escape closes only the row, and the editor gets focus back", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Instructions</DialogTitle>
          <DialogDescription>What to do.</DialogDescription>
          <Harness initial="<p>draft</p>" />
        </DialogContent>
      </Dialog>,
    );
    const input = await openRow(user);
    await user.type(input, "{Escape}");

    expect(screen.queryByRole("textbox", { name: "Link address" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(editor()).toHaveTextContent("draft");
    await waitFor(() => expect(editor()).toHaveFocus());
  });
});

describe("RichTextEditor — disabled", () => {
  it("makes the surface uneditable and the buttons inert", () => {
    render(<Harness disabled placeholder="Add a note…" />);
    expect(editor()).toHaveAttribute("contenteditable", "false");
    for (const label of ["Bold", "Italic", "Bulleted list", "Numbered list", "Link"]) {
      expect(screen.getByRole("button", { name: label })).toBeDisabled();
    }
  });

  it("does not open the link row from the keyboard", () => {
    render(<Harness disabled />);
    press(editor(), "k", { ctrl: true });
    expect(screen.queryByRole("textbox", { name: "Link address" })).not.toBeInTheDocument();
  });
});

describe("RichTextEditor — paste", () => {
  it("takes pasted content as plain text rather than as markup", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(editor());
    await user.paste("<b>bold</b> <script>alert(1)</script>");

    expect(editor().innerHTML).not.toContain("<b>");
    expect(editor().innerHTML).not.toContain("<script>");
    expect(onChange).toHaveBeenLastCalledWith("<p>&lt;b&gt;bold&lt;/b&gt; &lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });

  it("ignores the HTML on the clipboard and keeps the lines as paragraphs", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    paste(editor(), { "text/plain": "one\ntwo", "text/html": "<h1>one</h1><p>two</p>" });
    expect(onChange).toHaveBeenLastCalledWith("<p>one</p><p>two</p>");
  });
});

describe("RichTextEditor — accessibility", () => {
  it("puts id and every naming prop on the editable element", () => {
    render(
      <>
        <span id="label">Instructions</span>
        <span id="hint">Shown on the call</span>
        <RichTextEditor value="" onChange={() => {}} id="body" ariaLabelledBy="label" ariaDescribedBy="hint" />
      </>,
    );
    const el = screen.getByRole("textbox", { name: "Instructions" });
    expect(el).toHaveAttribute("id", "body");
    expect(el).toHaveAttribute("aria-multiline", "true");
    expect(el).toHaveAccessibleDescription("Shown on the call");
    expect(document.getElementById("body")).toBe(el);
  });

  it("follows invalid after mount, in both directions", () => {
    const { rerender } = render(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" />);
    expect(editor()).not.toHaveAttribute("aria-invalid");
    rerender(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" invalid />);
    expect(editor()).toHaveAttribute("aria-invalid", "true");
    rerender(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" invalid={false} />);
    expect(editor()).not.toHaveAttribute("aria-invalid");
  });

  it("gives every toolbar control a name and a shortcut", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-keyshortcuts", "Control+B");
    expect(screen.getByRole("button", { name: "Link" })).toHaveAttribute("aria-keyshortcuts", "Control+K");
  });

  it("follows the caret with aria-pressed", () => {
    render(<Harness initial="<p><strong>bold</strong> plain</p><ul><li><p>item</p></li></ul>" />);
    const ed = editorOf(editor());
    edit(() => ed.commands.setTextSelection(3));
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    edit(() => ed.commands.setTextSelection(9));
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
    edit(() => ed.commands.setTextSelection(15));
    expect(screen.getByRole("button", { name: "Bulleted list" })).toHaveAttribute("aria-pressed", "true");
  });

  it("is one Tab stop, with arrow keys, Home and End between controls", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.filter((b) => b.tabIndex === 0)).toEqual([screen.getByRole("button", { name: "Bold" })]);

    await user.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Link" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Link" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();

    // Tab leaves the toolbar for the text.
    await user.tab();
    expect(editor()).toHaveFocus();
  });

  it("takes Cmd/Ctrl+B and Cmd/Ctrl+I", () => {
    const onChange = vi.fn();
    render(<Harness initial="<p>word</p>" onChange={onChange} />);
    const ed = editorOf(editor());
    edit(() => ed.commands.setTextSelection({ from: 1, to: 5 }));
    press(editor(), "b", { ctrl: true });
    expect(onChange).toHaveBeenLastCalledWith("<p><strong>word</strong></p>");
    press(editor(), "i", { meta: true });
    press(editor(), "i", { ctrl: true });
    expect(onChange).toHaveBeenLastCalledWith("<p><strong><em>word</em></strong></p>");
  });

  it("leaves Tab to the browser, in a list as anywhere else", () => {
    render(<Harness initial="<ul><li><p>a</p></li><li><p>b</p></li></ul><p>after</p>" />);
    const ed = editorOf(editor());
    edit(() => ed.commands.setTextSelection(8));
    expect(press(editor(), "Tab")).toBe(true);
    expect(press(editor(), "Tab", { shift: true })).toBe(true);
    edit(() => ed.commands.setTextSelection(ed.state.doc.content.size - 5));
    expect(press(editor(), "Tab")).toBe(true);
    expect(ed.getHTML()).toBe("<ul><li><p>a</p></li><li><p>b</p></li></ul><p>after</p>");
  });
});

describe("RichTextEditor — server render", () => {
  it("renders the loading box without the editor, and hydrates without a warning", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const element = (
      <RichTextEditor
        value="<p>stored</p>"
        onChange={() => {}}
        ariaLabel="Notes"
        placeholder="Add a note…"
        className="min-h-32"
      />
    );
    const html = renderToString(element);
    // The server never loads TipTap: it draws the box the editor will fill.
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("contenteditable");
    expect(html).toContain("min-h-32");
    // The editor is not a sanitizer, so the stored value is not rendered
    // before the client editor exists.
    expect(html).not.toContain("stored");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    await act(async () => {
      hydrateRoot(container, element);
    });
    await waitFor(() => expect(container.querySelector('[role="textbox"]')).toHaveTextContent("stored"));
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    container.remove();
  });
});

describe("RichTextEditor — loading TipTap", () => {
  // The test setup loads the editor once for every file. A fresh module
  // registry gives this test the state an app is in before the chunk arrives.
  it("gives a ref handle that does nothing until the editor has loaded", async () => {
    vi.resetModules();
    const fresh = await import("../rich-text-editor");
    const ref = createRef<RichTextEditorHandle>();
    render(<fresh.RichTextEditor ref={ref} value="" onChange={() => {}} ariaLabel="Early" />);
    expect(ref.current).not.toBeNull();
    expect(() => ref.current!.insert("<p>too soon</p>")).not.toThrow();
    expect(() => ref.current!.focus()).not.toThrow();

    await screen.findByRole("textbox", { name: "Early" });
    act(() => ref.current!.insert("<p>now</p>"));
    expect(screen.getByRole("textbox", { name: "Early" })).toHaveTextContent("now");
  });

  it("draws the loading box, then the editor, without calling onChange", async () => {
    vi.resetModules();
    const fresh = await import("../rich-text-editor");
    const onChange = vi.fn();
    render(<fresh.RichTextEditor value="<p>stored</p>" onChange={onChange} ariaLabel="Fresh" />);
    expect(screen.queryByRole("textbox", { name: "Fresh" })).not.toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    expect(await screen.findByRole("textbox", { name: "Fresh" })).toHaveTextContent("stored");
    expect(document.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

});
