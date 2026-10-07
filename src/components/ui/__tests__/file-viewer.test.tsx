import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderAsync } from "docx-preview";
import { Button } from "../button";
import { FileViewer, type FileViewerFallback, type FileViewerProps } from "../file-viewer";

// docx-preview needs a real layout engine; what it does with a document is
// checked in Storybook. Here it stands in for the library's two outputs: the
// rendered body and the stylesheet it injects.
vi.mock("docx-preview", () => ({ renderAsync: vi.fn() }));
const renderDocx = vi.mocked(renderAsync);

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();

function file(body: BodyInit | null, type: string, status = 200): Response {
  return new Response(body, { status, headers: type ? { "content-type": type } : {} });
}

/** A promise and the means to settle it, for responses that arrive late. */
function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function Viewer(props: Partial<FileViewerProps>): React.ReactElement {
  return (
    <FileViewer url="/files/report.pdf" filename="report.pdf" {...props}>
      <Button type="button">Preview</Button>
    </FileViewer>
  );
}

/** Renders the viewer and opens it by clicking its trigger. */
function openViewer(props: Partial<FileViewerProps> = {}): HTMLElement {
  render(<Viewer {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));
  return screen.getByRole("dialog");
}

/** The PDF frame, once the availability check has passed. */
async function frame(title: string): Promise<HTMLIFrameElement> {
  return waitFor(() => {
    const el = document.querySelector<HTMLIFrameElement>("iframe");
    expect(el).toHaveAttribute("title", title);
    return el!;
  });
}

const overlay = (): HTMLElement => document.querySelector<HTMLElement>("[data-state='open'].fixed.inset-0")!;

/** A press and release on the backdrop, as Radix sees one. */
async function pressBackdrop(): Promise<void> {
  // Radix arms its outside-press listener a tick after opening.
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  const target = overlay();
  fireEvent.pointerDown(target, { button: 0 });
  fireEvent.mouseDown(target, { button: 0 });
  fireEvent.pointerUp(target, { button: 0 });
  fireEvent.mouseUp(target, { button: 0 });
  fireEvent.click(target, { button: 0 });
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
}

/** The body's message, once loading is over. */
async function message(text: string): Promise<HTMLElement> {
  return screen.findByRole("heading", { name: text });
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchMock.mockReset();
  renderDocx.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  consoleError = vi.spyOn(console, "error");
});

afterEach(() => {
  // Unmounted first: closing mid-load is part of what is checked.
  cleanup();
  const errors = consoleError.mock.calls;
  consoleError.mockRestore();
  vi.unstubAllGlobals();
  // No React warnings, act() complaints or uncaught render errors in any test.
  expect(errors).toEqual([]);
});

describe("FileViewer chrome", () => {
  it("opens a dialog named after the file with Download and Open in new tab", async () => {
    fetchMock.mockResolvedValue(file("%PDF", "application/pdf"));
    const dialog = openViewer({ filename: "Master Services Agreement.pdf", url: "/files/msa.pdf" });

    expect(screen.getByRole("dialog", { name: "Master Services Agreement.pdf" })).toBe(dialog);
    expect(within(dialog).getByRole("heading", { name: "Master Services Agreement.pdf" })).toHaveAttribute(
      "title",
      "Master Services Agreement.pdf",
    );

    const download = within(dialog).getByRole("link", { name: "Download" });
    expect(download).toHaveAttribute("href", "/files/msa.pdf");
    expect(download).toHaveAttribute("download", "Master Services Agreement.pdf");

    const open = within(dialog)
      .getAllByRole("link")
      .find((link) => link.getAttribute("target") === "_blank");
    expect(open).toHaveAttribute("href", "/files/msa.pdf");
    expect(open).toHaveAttribute("rel", "noopener noreferrer");
    expect(open).toHaveTextContent("Open in new tab");
    expect(within(open!).getByText("Open")).toHaveClass("sm:hidden");

    expect(within(dialog).getByRole("button", { name: "Close" })).toBeInTheDocument();
    await frame("Master Services Agreement.pdf");
  });

  it.each(["{Enter}", " "])("opens from the keyboard with %j", async (key) => {
    fetchMock.mockResolvedValue(file("%PDF", "application/pdf"));
    const user = userEvent.setup();
    render(<Viewer />);
    screen.getByRole("button", { name: "Preview" }).focus();
    await user.keyboard(key);
    expect(screen.getByRole("dialog", { name: "report.pdf" })).toBeInTheDocument();
    await frame("report.pdf");
  });

  it("keeps clicks on the trigger and inside the dialog from reaching a clickable ancestor", async () => {
    fetchMock.mockResolvedValue(file("x", "application/zip"));
    const onCardClick = vi.fn();
    render(
      <div onClick={onCardClick}>
        <Viewer filename="archive.zip" url="/files/archive.zip" />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const dialog = screen.getByRole("dialog");
    await message("This file can't be previewed in the browser.");

    const downloads = within(dialog).getAllByRole("link", { name: /^Download/ });
    for (const link of downloads) {
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link);
    }
    fireEvent.click(within(dialog).getByRole("heading", { name: "archive.zip" }));
    fireEvent.click(overlay());
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // The backdrop still closes the dialog with its click stopped.
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    await message("This file can't be previewed in the browser.");
    await pressBackdrop();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("covers the viewport from inside a transformed ancestor", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <div style={{ transform: "translateX(10px)" }}>
        <Viewer />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    // Portalled to <body>, so `fixed` is against the viewport, not the card.
    expect(container.contains(screen.getByRole("dialog"))).toBe(false);
    expect(screen.getByRole("dialog").parentElement).toBe(document.body);
  });

  it("closes on Escape and on Close, returning focus to the trigger", async () => {
    fetchMock.mockResolvedValue(file("%PDF", "application/pdf"));
    render(<Viewer />);
    const trigger = screen.getByRole("button", { name: "Preview" });

    fireEvent.click(trigger);
    expect(document.body).toHaveAttribute("data-scroll-locked");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(document.body).not.toHaveAttribute("data-scroll-locked");

    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("works controlled, with no trigger", async () => {
    fetchMock.mockResolvedValue(file("%PDF", "application/pdf"));
    const onOpenChange = vi.fn();
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button type="button" onClick={() => setOpen(true)}>
            Show
          </Button>
          <FileViewer
            url="/files/report.pdf"
            filename="report.pdf"
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
          />
        </>
      );
    }
    render(<Controlled />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByRole("dialog", { name: "report.pdf" })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    onOpenChange.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    await pressBackdrop();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows a labelled spinner while loading", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    openViewer();
    expect(screen.getByRole("status", { name: "Opening file…" })).toBeInTheDocument();
  });

  it("starts each open fresh, and a late response from an earlier open never renders", async () => {
    const first = deferred<Response>();
    fetchMock.mockReturnValueOnce(first.promise).mockResolvedValueOnce(file("not here", "text/plain", 404));
    render(<Viewer filename="notes.txt" url="/files/notes.txt" />);
    const trigger = screen.getByRole("button", { name: "Preview" });

    fireEvent.click(trigger);
    expect(screen.getByRole("status", { name: "Opening file…" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    // The first open's request was aborted on close.
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);

    fireEvent.click(trigger);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await message("We couldn't open this file. Download it to view it locally.");

    await act(async () => first.resolve(file("STALE CONTENT", "text/plain")));
    expect(screen.queryByText("STALE CONTENT")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "We couldn't open this file. Download it to view it locally." }))
      .toBeInTheDocument();
  });
});

describe("choosing the renderer", () => {
  it("uses the response's Content-Type when no contentType is given", async () => {
    fetchMock.mockResolvedValue(file("hello", "text/plain; charset=utf-8"));
    openViewer({ filename: "report.pdf" });
    expect(await screen.findByText("hello")).toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("lets the contentType prop decide over the response", async () => {
    fetchMock.mockResolvedValue(file("hello", "application/pdf"));
    openViewer({ filename: "report.pdf", contentType: "text/plain" });
    expect(await screen.findByText("hello")).toBeInTheDocument();
  });

  it("never frames a declared image because of a .pdf name", async () => {
    openViewer({ filename: "scan.pdf", url: "/files/scan", contentType: "image/png" });
    expect(screen.getByRole("img", { hidden: true, name: "scan.pdf" })).toHaveAttribute("src", "/files/scan");
    expect(document.querySelector("iframe")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads a .csv uploaded as an Excel type as CSV", async () => {
    fetchMock.mockResolvedValue(file("a,b\n1,2", "application/vnd.ms-excel"));
    openViewer({ filename: "export.csv" });
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("shows the open error when the probe fails", async () => {
    fetchMock.mockResolvedValue(file("{}", "application/json", 403));
    openViewer();
    await message("We couldn't open this file. Download it to view it locally.");
  });
});

describe("PDF", () => {
  it("frames the file once it answers", async () => {
    fetchMock.mockResolvedValue(file("%PDF", "application/pdf"));
    openViewer({ contentType: "application/pdf" });
    expect(await frame("report.pdf")).toHaveAttribute("src", "/files/report.pdf");
    expect(fetchMock).toHaveBeenCalledWith("/files/report.pdf", expect.objectContaining({ credentials: "same-origin" }));
  });

  it.each([401, 403, 404, 500])("shows a message instead of the frame on %i", async (status) => {
    fetchMock.mockResolvedValue(file('{"error":"nope"}', "application/json", status));
    openViewer({ contentType: "application/pdf" });
    await message("We couldn't open this file. Download it to view it locally.");
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.queryByText(/nope/)).not.toBeInTheDocument();
  });

  it("shows a message when the network fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    openViewer({ contentType: "application/pdf" });
    await message("We couldn't open this file. Download it to view it locally.");
  });

  it("never frames a new file while it is still being checked", async () => {
    fetchMock.mockResolvedValueOnce(file("%PDF", "application/pdf"));
    const { rerender } = render(<FileViewer open url="/files/a.pdf" filename="a.pdf" contentType="application/pdf" />);
    await frame("a.pdf");

    // Every src any frame is given, however briefly, as React commits.
    const framed: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const nodes = record.type === "attributes" ? [record.target] : Array.from(record.addedNodes);
        for (const node of nodes) {
          if (node instanceof HTMLIFrameElement) framed.push(node.getAttribute("src") ?? "");
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });

    const late = deferred<Response>();
    fetchMock.mockReturnValueOnce(late.promise);
    rerender(<FileViewer open url="/files/b.pdf" filename="b.pdf" contentType="application/pdf" />);
    observer.disconnect();
    expect(framed).not.toContain("/files/b.pdf");
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("status", { name: "Opening file…" })).toBeInTheDocument();

    await act(async () => late.resolve(file("%PDF", "application/pdf")));
    expect(await frame("b.pdf")).toHaveAttribute("src", "/files/b.pdf");
  });
});

describe("DOCX", () => {
  const props = { filename: "brief.docx", url: "/files/brief.docx", contentType: DOCX };

  /** The document's shadow root, once docx-preview has written into it. */
  async function docxRoot(): Promise<ShadowRoot> {
    return waitFor(() => {
      const root = document.querySelector(".file-viewer-docx")?.shadowRoot;
      expect(root?.querySelector("section")).toBeTruthy();
      return root!;
    });
  }

  it("lays the document out with altChunks off and links neutralised", async () => {
    fetchMock.mockResolvedValue(file("PK", DOCX));
    renderDocx.mockImplementation(async (_blob, body, style) => {
      body.innerHTML =
        '<section class="docx"><a href="javascript:alert(1)">bad</a> <a href="java&#9;script:alert(1)">tab</a> ' +
        '<a href="/relative">rel</a> <a href="https://example.com">ok</a> <a href="mailto:a@example.com">mail</a> ' +
        '<a href="#bookmark">mark</a></section>';
      const sheet = document.createElement("style");
      sheet.textContent = '.docx-num-1::before { content: "\uF0B7"; font-family: Symbol; }';
      style!.appendChild(sheet);
    });
    openViewer(props);

    expect(screen.getByRole("status", { name: "Laying out document…" })).toBeInTheDocument();
    const root = await docxRoot();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    const doc = within(root as unknown as HTMLElement);
    const ok = doc.getByRole("link", { name: "ok" });

    const options = renderDocx.mock.calls[0][3];
    expect(options).toMatchObject({
      renderAltChunks: false,
      ignoreFonts: true,
      ignoreHeight: true,
      breakPages: true,
      useBase64URL: true,
    });

    expect(ok).toHaveAttribute("target", "_blank");
    expect(ok).toHaveAttribute("rel", "noopener noreferrer");
    expect(doc.getByRole("link", { name: "mail" })).toHaveAttribute("href", "mailto:a@example.com");
    expect(doc.getByRole("link", { name: "mark" })).toHaveAttribute("href", "#bookmark");
    expect(doc.getByRole("link", { name: "mark" })).not.toHaveAttribute("target");
    for (const text of ["bad", "tab", "rel"]) {
      const anchor = doc.getByText(text);
      expect(anchor.tagName).toBe("A");
      expect(anchor).not.toHaveAttribute("href");
    }

    // The bullet patch reads the stylesheet's CSSOM, which jsdom doesn't build
    // inside a shadow root; replaceSymbolGlyphs is tested on its own, and the
    // DOCX story shows the patched bullets in a browser.
  });

  it("keeps the document's stylesheet out of the app page", async () => {
    fetchMock.mockResolvedValue(file("PK", DOCX));
    // What a crafted list marker in a .docx turns into: a closed rule, then the attacker's own.
    renderDocx.mockImplementation(async (_blob, body, style) => {
      body.innerHTML = '<section class="docx"><p>Resume</p></section>';
      const sheet = document.createElement("style");
      sheet.textContent = '.docx-num-1::before { content: ""} body { display: none } .z { content: "" }';
      style!.appendChild(sheet);
    });
    openViewer(props);
    const root = await docxRoot();

    // Rendered into the shadow root: no stylesheet of the document's lands in the page.
    for (const el of document.querySelectorAll("style")) expect(el.textContent).not.toContain("display: none");
    expect(root.querySelector("style")).not.toBeNull();
    // Containment sits on the host's wrapper, which `:host` rules can't reach,
    // and inline, so it doesn't depend on the app's Tailwind.
    const host = document.querySelector<HTMLElement>(".file-viewer-docx")!;
    expect(host.style.contain).toBe("");
    expect(host.parentElement!.style.contain).toBe("paint");
    expect(host.parentElement!.children).toHaveLength(1);
  });

  it("asks the fallback when the document can't be laid out", async () => {
    fetchMock.mockResolvedValue(file("%PDF", DOCX));
    renderDocx.mockRejectedValue(new Error("Corrupted zip"));
    const loadFallback = vi.fn<FileViewerFallback>().mockResolvedValue({ text: "Plain text of the brief" });
    openViewer({ ...props, loadFallback });

    expect(await screen.findByText("Plain text of the brief")).toBeInTheDocument();
    expect(loadFallback).toHaveBeenCalledTimes(1);
    expect(loadFallback.mock.calls[0][0]).toMatchObject({
      reason: "render-failed",
      url: "/files/brief.docx",
      filename: "brief.docx",
      contentType: DOCX,
    });
  });

  it.each([
    ["no fallback", undefined],
    ["a fallback that returns nothing", vi.fn<FileViewerFallback>().mockResolvedValue(null)],
    ["a fallback that rejects", vi.fn<FileViewerFallback>().mockRejectedValue(new Error("500"))],
  ])("offers a Download with %s", async (_name, loadFallback) => {
    fetchMock.mockResolvedValue(file("garbage", DOCX));
    renderDocx.mockRejectedValue(new Error("Corrupted zip"));
    openViewer({ ...props, loadFallback });

    await message("We couldn't display this Word file. Download it to open it locally.");
    expect(screen.getByRole("link", { name: "Download brief.docx" })).toHaveAttribute("download", "brief.docx");
  });

  it("tries the library again on the next open", async () => {
    fetchMock.mockImplementation(async () => file("PK", DOCX));
    renderDocx.mockRejectedValueOnce(new Error("Loading chunk failed")).mockImplementationOnce(async (_b, body) => {
      body.innerHTML = "<p>Second time lucky</p>";
    });
    render(<Viewer {...props} />);
    const trigger = screen.getByRole("button", { name: "Preview" });

    fireEvent.click(trigger);
    await message("We couldn't display this Word file. Download it to open it locally.");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    fireEvent.click(trigger);
    await waitFor(() =>
      expect(document.querySelector(".file-viewer-docx")?.shadowRoot?.textContent).toContain("Second time lucky"),
    );
    expect(renderDocx).toHaveBeenCalledTimes(2);
  });

  it("shows the open error, not the Word one, when the file request fails", async () => {
    fetchMock.mockResolvedValue(file("", DOCX, 404));
    openViewer(props);
    await message("We couldn't open this file. Download it to view it locally.");
    expect(renderDocx).not.toHaveBeenCalled();
  });
});

describe("DOC (Word 97–2003)", () => {
  const props = { filename: "legacy.doc", url: "/files/legacy.doc", contentType: "application/msword" };

  it("shows the fallback's text and note", async () => {
    const pending = deferred<{ text: string; note: string }>();
    const loadFallback = vi.fn<FileViewerFallback>().mockReturnValue(pending.promise);
    openViewer({ ...props, loadFallback });

    expect(screen.getByRole("status", { name: "Opening file…" })).toBeInTheDocument();
    const request = loadFallback.mock.calls[0][0];
    expect(request).toMatchObject({ reason: "doc", url: "/files/legacy.doc", filename: "legacy.doc", contentType: "application/msword" });
    expect(request.signal).toBeInstanceOf(AbortSignal);
    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => pending.resolve({ text: "Dear Ana,\r\nWelcome.", note: "Formatting isn't shown." }));
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Formatting isn't shown.");
    expect(document.querySelector("pre")?.textContent).toBe("Dear Ana,\nWelcome.");
  });

  it("aborts the fallback's signal when the dialog closes", async () => {
    const loadFallback = vi.fn<FileViewerFallback>().mockReturnValue(new Promise(() => {}));
    openViewer({ ...props, loadFallback });
    const { signal } = loadFallback.mock.calls[0][0];
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(signal.aborted).toBe(true));
  });

  it.each([
    ["no fallback", undefined],
    ["a fallback that returns nothing", vi.fn<FileViewerFallback>().mockResolvedValue(undefined)],
    ["a fallback that returns blank text", vi.fn<FileViewerFallback>().mockResolvedValue({ text: "   " })],
    ["a fallback that rejects", vi.fn<FileViewerFallback>().mockRejectedValue(new Error("500"))],
  ])("offers a Download with %s", async (_name, loadFallback) => {
    openViewer({ ...props, loadFallback });
    await message("Word 97–2003 files can't be displayed in the browser. Download it to open it locally.");
    expect(screen.getByRole("link", { name: "Download legacy.doc" })).toHaveAttribute("href", "/files/legacy.doc");
  });

  it("treats an octet-stream .doc as Word 97–2003", async () => {
    fetchMock.mockResolvedValue(file("\xd0\xcf", "application/octet-stream"));
    openViewer({ filename: "legacy.doc" });
    await message("Word 97–2003 files can't be displayed in the browser. Download it to open it locally.");
  });
});

describe("CSV", () => {
  function csv(body: BodyInit, props: Partial<FileViewerProps> = {}): void {
    fetchMock.mockResolvedValue(file(body, "text/csv"));
    openViewer({ filename: "data.csv", url: "/files/data.csv", ...props });
  }

  /** The table's cells, row by row, header first. */
  async function cells(): Promise<string[][]> {
    const table = await screen.findByRole("table");
    return Array.from(table.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th, td")).map((cell) => cell.textContent ?? ""),
    );
  }

  it("renders a comma-separated file with the first row as the header", async () => {
    csv("name,email\nAna,ana@example.com\nBo,bo@example.com\n");
    expect(await cells()).toEqual([
      ["name", "email"],
      ["Ana", "ana@example.com"],
      ["Bo", "bo@example.com"],
    ]);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    // File content, so not upper-cased like a UI label.
    expect(screen.getByRole("columnheader", { name: "name" })).toHaveClass("normal-case");
  });

  it.each([
    ["semicolons", "a;b\n1;2"],
    ["tabs", "a\tb\n1\t2"],
    ["pipes", "a|b\n1|2"],
  ])("detects %s", async (_name, body) => {
    csv(body);
    expect(await cells()).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps a quoted field with delimiters, quotes and newlines in one cell", async () => {
    csv('note,n\n"Line one\nline two, with ""quotes""",1\n');
    expect(await cells()).toEqual([
      ["note", "n"],
      ['Line one\nline two, with "quotes"', "1"],
    ]);
  });

  it("pads short rows and gives extra cells a blank header", async () => {
    csv("a,b\n1\n1,2,3\n");
    expect(await cells()).toEqual([
      ["a", "b", ""],
      ["1", "", ""],
      ["1", "2", "3"],
    ]);
  });

  it("shows cell text as text, never as markup", async () => {
    csv('a\n<b>bold</b><img src=x onerror="alert(1)">\n');
    const table = await screen.findByRole("table");
    expect(table.querySelector("b, img")).toBeNull();
    expect(within(table).getByText('<b>bold</b><img src=x onerror="alert(1)">')).toBeInTheDocument();
  });

  it("renders the first 1,000 of 1,500 rows with a note", async () => {
    csv(["n", ...Array.from({ length: 1500 }, (_, i) => `row ${i}`)].join("\n"));
    const rows = await cells();
    expect(rows).toHaveLength(1001);
    expect(rows[1000]).toEqual(["row 999"]);
    expect(screen.getByText("Showing the first 1,000 rows. Download the file to see all of it.")).toBeInTheDocument();
  });

  it("counts only rows with content toward the cap", async () => {
    // Excel's `,,` spacer rows and blank lines between every data row.
    csv(["n", ...Array.from({ length: 1200 }, (_, i) => `row ${i}\n,,\n`)].join("\n"));
    const rows = await cells();
    expect(rows).toHaveLength(1001);
    expect(rows[1000]).toEqual(["row 999"]);
    expect(screen.getByText("Showing the first 1,000 rows. Download the file to see all of it.")).toBeInTheDocument();
  });

  it("has no note at 1,000 rows or fewer", async () => {
    csv(["n", ...Array.from({ length: 1000 }, (_, i) => `row ${i}`)].join("\n"));
    expect(await cells()).toHaveLength(1001);
    expect(screen.queryByText(/Showing the first 1,000 rows/)).not.toBeInTheDocument();
  });

  it("shows the header and an empty-table message for a header-only file", async () => {
    csv("a,b,c\n");
    await screen.findByRole("table");
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["a", "b", "c"]);
    const empty = screen.getByText("This file has a header row but no data rows.");
    expect(empty).toHaveAttribute("colspan", "3");
  });

  it.each([
    ["0 bytes", ""],
    ["whitespace", "  \n\r\n  "],
  ])("says an empty file (%s) is empty", async (_name, body) => {
    csv(body);
    await message("This file is empty.");
  });

  it("drops a UTF-8 BOM from the first header", async () => {
    csv(new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode("id,name\n1,Ana")]));
    expect((await cells())[0]).toEqual(["id", "name"]);
  });

  it("reads a windows-1252 export", async () => {
    csv(new Uint8Array([...new TextEncoder().encode("name\n"), 0x43, 0x61, 0x66, 0xe9]));
    expect((await cells())[1]).toEqual(["Café"]);
  });

  it("shows the open error when the file request fails", async () => {
    fetchMock.mockResolvedValue(file("", "text/csv", 500));
    openViewer({ filename: "data.csv", contentType: "text/csv" });
    await message("We couldn't open this file. Download it to view it locally.");
  });

  it("never calls the fallback for a file it rendered", async () => {
    const loadFallback = vi.fn<FileViewerFallback>();
    csv("a\n1", { loadFallback });
    await screen.findByRole("table");
    expect(loadFallback).not.toHaveBeenCalled();
  });
});

describe("fallback content", () => {
  const zip = { filename: "archive.zip", url: "/files/archive.zip", contentType: "application/zip" };

  it("cuts fallback text at 200k characters with a note", async () => {
    const loadFallback = vi.fn<FileViewerFallback>().mockResolvedValue({ text: "x".repeat(200_050) });
    openViewer({ ...zip, loadFallback });
    expect(await screen.findByText("Showing the first 200k characters. Download the file to read all of it."))
      .toBeInTheDocument();
    expect(document.querySelector("pre")?.textContent).toHaveLength(200_000);
  });

  it("renders fallback HTML sanitised, keeping document structure", async () => {
    const loadFallback = vi.fn<FileViewerFallback>().mockResolvedValue({
      html:
        '<h2>Brief</h2><script>window.__fvRan = true</script><p onclick="x()" style="background:url(javascript:x)">Body</p>' +
        '<table><tr><td>cell</td></tr></table><img src="x" onerror="window.__fvRan = true">' +
        '<a href="javascript:alert(1)">bad</a><a href="https://example.com">good</a><iframe src="/"></iframe>',
    });
    openViewer({ ...zip, loadFallback });

    const heading = await screen.findByRole("heading", { name: "Brief" });
    const host = heading.closest(".file-viewer-html")!;
    expect(host.querySelector("script, iframe, img")).toBeNull();
    expect(within(host as HTMLElement).getByText("Body")).not.toHaveAttribute("onclick");
    expect(within(host as HTMLElement).getByText("Body")).not.toHaveAttribute("style");
    expect(within(host as HTMLElement).getByRole("cell", { name: "cell" })).toBeInTheDocument();
    expect(within(host as HTMLElement).getByText("bad")).not.toHaveAttribute("href");
    expect(within(host as HTMLElement).getByRole("link", { name: "good" })).toHaveAttribute("href", "https://example.com");
    expect((window as unknown as Record<string, unknown>).__fvRan).toBeUndefined();
  });
});

describe("unsupported", () => {
  it("offers a Download without a fallback", async () => {
    fetchMock.mockResolvedValue(file("PK", "application/zip"));
    openViewer({ filename: "archive.zip", url: "/files/archive.zip" });
    await message("This file can't be previewed in the browser.");
    expect(screen.getByRole("link", { name: "Download archive.zip" })).toHaveAttribute("download", "archive.zip");
  });

  it("shows what the fallback returns, called once with the reason and type", async () => {
    fetchMock.mockResolvedValue(file("{\\rtf1", "application/rtf; charset=binary"));
    const loadFallback = vi.fn<FileViewerFallback>().mockResolvedValue({ text: "Extracted text" });
    openViewer({ filename: "letter.rtf", url: "/files/letter.rtf", loadFallback });

    expect(await screen.findByText("Extracted text")).toBeInTheDocument();
    expect(loadFallback).toHaveBeenCalledTimes(1);
    expect(loadFallback.mock.calls[0][0]).toMatchObject({ reason: "unsupported", contentType: "application/rtf" });
  });

  it("offers a Download when the fallback returns nothing", async () => {
    openViewer({
      filename: "photo.heic",
      contentType: "image/heic",
      loadFallback: vi.fn<FileViewerFallback>().mockResolvedValue(null),
    });
    await message("This file can't be previewed in the browser.");
  });
});

describe("images", () => {
  it("shows the image once it loads, with the filename as alt", async () => {
    openViewer({ filename: "photo.png", url: "/files/photo.png", contentType: "image/png" });
    const img = screen.getByRole("img", { hidden: true, name: "photo.png" });
    expect(screen.getByRole("status", { name: "Opening file…" })).toBeInTheDocument();

    fireEvent.load(img);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "photo.png" })).toHaveClass("max-w-full");
  });

  it("shows the open error when the image fails to load", async () => {
    openViewer({ filename: "photo.png", contentType: "image/png" });
    fireEvent.error(screen.getByRole("img", { hidden: true, name: "photo.png" }));
    await message("We couldn't open this file. Download it to view it locally.");
  });
});

describe("plain text", () => {
  it("shows the text preformatted with CRLF normalised", async () => {
    fetchMock.mockResolvedValue(file("first line\r\nsecond line", "text/plain"));
    openViewer({ filename: "notes.txt" });
    await screen.findByText(/first line/);
    expect(document.querySelector("pre")?.textContent).toBe("first line\nsecond line");
  });

  it("says an empty text file is empty", async () => {
    fetchMock.mockResolvedValue(file("", "text/plain"));
    openViewer({ filename: "notes.txt" });
    await message("This file is empty.");
  });
});
