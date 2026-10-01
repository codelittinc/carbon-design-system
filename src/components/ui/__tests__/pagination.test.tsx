import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../pagination";

function pageLabels() {
  return screen
    .getAllByRole("button")
    .map((b) => b.getAttribute("aria-label"))
    .filter((l) => l?.startsWith("Page "));
}

describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists every page when there are seven or fewer", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(pageLabels()).toEqual(["Page 1", "Page 2", "Page 3", "Page 4", "Page 5"]);
  });

  it("collapses the middle around the current page", () => {
    render(<Pagination page={10} totalPages={20} onPageChange={() => {}} />);
    expect(pageLabels()).toEqual(["Page 1", "Page 9", "Page 10", "Page 11", "Page 20"]);
    expect(screen.getByRole("button", { name: "Page 10" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("disables previous on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("reports the page that was clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Page 5" }));
    expect(onPageChange.mock.calls).toEqual([[3], [5]]);
  });

  it("shows the item range", () => {
    render(
      <Pagination page={2} totalPages={6} onPageChange={() => {}} totalItems={57} pageSize={10} />,
    );
    expect(screen.getByText(/Showing 11–20 of\s+57/)).toBeInTheDocument();
  });
});
