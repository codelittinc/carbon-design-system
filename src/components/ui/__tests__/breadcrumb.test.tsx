import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../breadcrumb";

describe("Breadcrumb", () => {
  it("exposes ordered ancestor links and a non-link current page", async () => {
    render(<Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/handbook">Handbook</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink href="/handbook?folder=policies">Policies</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Leave</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/handbook", "/handbook?folder=policies",
    ]);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Leave")).toHaveAttribute("aria-current", "page");
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("link", { name: "Handbook" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Policies" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("preserves a consumer link and its navigation handler without nested anchors", async () => {
    const navigate = vi.fn((event: React.MouseEvent) => event.preventDefault());
    const { container } = render(<Breadcrumb aria-label="Document location">
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink asChild><a href="/handbook" onClick={navigate}>Handbook</a></BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem><BreadcrumbPage>Unfiled</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>);
    expect(screen.getByRole("navigation", { name: "Document location" })).toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    await userEvent.setup().click(screen.getByRole("link", { name: "Handbook" }));
    expect(navigate).toHaveBeenCalledOnce();
    expect(screen.getByText("/")).toHaveAttribute("aria-hidden", "true");
  });
});
