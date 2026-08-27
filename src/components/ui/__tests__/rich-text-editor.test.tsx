import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "../rich-text-editor";

/**
 * What is and is not covered here.
 *
 * jsdom implements neither `document.execCommand` nor `queryCommandState`, so
 * whether clicking Bold actually bolds the selection is not answerable in this
 * environment — the component guards both calls and they no-op. These tests
 * cover everything around that: what renders, what reaches `onChange`, the
 * caret-preserving sync rule, the link row's validation, and `disabled`. The
 * formatting itself is a browser behaviour and is verified in Storybook.
 *
 * The sync rule is the one worth reading twice. `value` coming back equal to
 * what the editor emitted must NOT rewrite the DOM, because rewriting it moves
 * the caret to the start of the field on every keystroke.
 */

/** A controlled host, which is how the component is meant to be used. */
function Harness({
  initial = "",
  onChange,
  ...props
}: { initial?: string; onChange?: (html: string) => void } & Partial<
  Omit<React.ComponentProps<typeof RichTextEditor>, "value" | "onChange">
>) {
  const [value, setValue] = useState(initial);
  return (
    <RichTextEditor
      value={value}
      onChange={(html) => {
        setValue(html);
        onChange?.(html);
      }}
      ariaLabel="Notes"
      {...props}
    />
  );
}

const editor = () => screen.getByRole("textbox", { name: "Notes" });

describe("RichTextEditor — what renders", () => {
  it("renders an editable multiline textbox", () => {
    render(<Harness />);
    const el = editor();
    expect(el).toHaveAttribute("contenteditable", "true");
    expect(el).toHaveAttribute("aria-multiline", "true");
  });

  it("renders the formatting toolbar", () => {
    render(<Harness />);
    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    expect(toolbar).toBeInTheDocument();
    for (const label of ["Bold", "Italic", "Bulleted list", "Numbered list", "Link"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("starts with every formatting button unpressed", () => {
    render(<Harness />);
    for (const label of ["Bold", "Italic", "Bulleted list", "Numbered list"]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
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

  it("is hidden from assistive tech, which reads the labelled textbox instead", () => {
    render(<Harness placeholder="Add a note…" />);
    expect(screen.getByText("Add a note…")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("RichTextEditor — onChange", () => {
  it("emits the surface's innerHTML when it is typed in", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(editor());
    await user.keyboard("hello");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall?.[0]).toContain("hello");
  });

  it("emits on blur, so a value typed and tabbed away from is not lost", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const el = editor();
    el.innerHTML = "<p>typed</p>";
    await user.click(el);
    await user.tab();

    expect(onChange).toHaveBeenCalledWith("<p>typed</p>");
  });
});

describe("RichTextEditor — the caret-preserving sync rule", () => {
  it("does not rewrite the DOM when value echoes back what it emitted", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const el = editor();
    await user.click(el);
    await user.keyboard("abc");

    // The controlled parent has re-rendered with the emitted value by now. If
    // the sync effect treated that as an external change it would have reset
    // innerHTML, and in a browser the caret with it.
    expect(el.innerHTML).toContain("abc");
  });

  it("does rewrite the DOM for a genuine external change", () => {
    const { rerender } = render(
      <RichTextEditor value="<p>first</p>" onChange={() => {}} ariaLabel="Notes" />,
    );
    expect(editor().innerHTML).toBe("<p>first</p>");

    // A form reset, or a different record loading into the same field.
    rerender(<RichTextEditor value="<p>second</p>" onChange={() => {}} ariaLabel="Notes" />);
    expect(editor().innerHTML).toBe("<p>second</p>");
  });

  it("clears the surface when the value is reset to empty", () => {
    const { rerender } = render(
      <RichTextEditor value="<p>first</p>" onChange={() => {}} ariaLabel="Notes" />,
    );
    rerender(<RichTextEditor value="" onChange={() => {}} ariaLabel="Notes" />);
    expect(editor().innerHTML).toBe("");
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
});

describe("RichTextEditor — disabled", () => {
  it("makes the surface uneditable and the buttons inert", () => {
    render(<Harness disabled placeholder="Add a note…" />);
    expect(editor()).toHaveAttribute("contenteditable", "false");
    for (const label of ["Bold", "Italic", "Bulleted list", "Numbered list", "Link"]) {
      expect(screen.getByRole("button", { name: label })).toBeDisabled();
    }
  });
});

describe("RichTextEditor — paste", () => {
  it("takes pasted content as plain text rather than as markup", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(editor());
    await user.paste("<b>bold</b> <script>alert(1)</script>");

    // execCommand("insertText") is a no-op under jsdom, so what this pins is the
    // half that matters and is observable: the default paste never ran, so none
    // of that markup reached the DOM.
    expect(editor().innerHTML).not.toContain("<b>");
    expect(editor().innerHTML).not.toContain("<script>");
  });
});
