import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RICH_TEXT_PROSE, RichTextView } from "../rich-text-view";

describe("RichTextView", () => {
  it("sanitizes what it is given", () => {
    const { container } = render(
      <RichTextView html={'<p onclick="x()">Hi<script>alert(1)</script></p><img src="javascript:x" alt="">'} />,
    );
    expect(container.firstElementChild?.innerHTML).toBe("<p>Hi</p>");
  });

  it("keeps an image's alignment and contains a wrapped image", () => {
    const { container } = render(
      <RichTextView html={'<img src="https://x.com/a.png" alt="Logo" data-align="left-wrap"><p>Name</p>'} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("flow-root");
    const img = root.querySelector("img") as HTMLImageElement;
    expect(img.getAttribute("data-align")).toBe("left-wrap");
    expect(img.style.cssFloat).toBe("left");
  });

  it("drops images and extended tags when the configuration says so", () => {
    const { container } = render(
      <RichTextView formatting="basic" images={false} html={'<h2>T</h2><img src="https://x.com/a.png" alt="">'} />,
    );
    expect(container.firstElementChild?.innerHTML).toBe("T");
  });

  it("keeps root-relative links and images only with rootRelative", () => {
    const html = '<p><a href="/handbook/1">doc</a></p><img src="/api/files/9" alt="Shot">';
    const off = render(<RichTextView html={html} />);
    expect(off.container.firstElementChild?.innerHTML).toBe("<p>doc</p>");
    off.unmount();
    const { container } = render(<RichTextView html={html} rootRelative />);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/handbook/1");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/api/files/9");
  });

  it("styles with RICH_TEXT_PROSE and the caller's classes", () => {
    const { container } = render(<RichTextView html="<p>a</p>" className="text-base" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("text-base");
    expect(root.className).toContain(RICH_TEXT_PROSE.split(" ")[0]);
  });

  it("copies part of a formatted run with the elements around it", () => {
    const { container } = render(<RichTextView cleanCopy html="<ul><li><strong>Full Name</strong></li></ul>" />);
    const root = container.firstElementChild as HTMLElement;
    const text = root.querySelector("strong")!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 4);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    const data: Record<string, string> = {};
    fireEvent.copy(root, { clipboardData: { setData: (type: string, value: string) => { data[type] = value; } } });
    expect(data["text/html"]).toBe("<ul><li><strong>Full</strong></li></ul>");
  });

  it("copies a selection inside it as sanitized HTML with absolute URLs", () => {
    const { container } = render(
      <RichTextView cleanCopy html={'<p><strong>Name</strong></p><img src="https://x.com/a.png" alt="" data-align="left">'} />,
    );
    const root = container.firstElementChild as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(root);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    const data: Record<string, string> = {};
    const event = fireEvent.copy(root, { clipboardData: { setData: (type: string, value: string) => { data[type] = value; } } });
    expect(event).toBe(false);
    expect(data["text/html"]).toBe(
      '<p><strong>Name</strong></p><img src="https://x.com/a.png" alt="" data-align="left" style="display: block; margin-left: 0; margin-right: auto;" />',
    );
  });
});
