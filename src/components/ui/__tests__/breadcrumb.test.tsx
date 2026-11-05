import { render, screen } from "@testing-library/react";
import { createRef, forwardRef, type ComponentPropsWithoutRef } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../breadcrumb";

describe("Breadcrumb", () => {
  it("exposes ordered ancestor links and a non-link current page", async () => {
    render(<Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/handbook">Handbook</BreadcrumbLink><BreadcrumbSeparator /></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbLink href="/handbook?folder=policies">Policies</BreadcrumbLink><BreadcrumbSeparator /></BreadcrumbItem>
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
    const linkRef = createRef<HTMLAnchorElement>();
    const navRef = createRef<HTMLElement>();
    const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<"a">>((props, ref) => <a ref={ref} {...props} />);
    const { container } = render(<Breadcrumb ref={navRef} aria-label="Document location">
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink ref={linkRef} asChild href="/handbook"><RouterLink onClick={navigate}>Handbook</RouterLink></BreadcrumbLink><BreadcrumbSeparator>/</BreadcrumbSeparator></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbPage>Unfiled</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>);
    expect(screen.getByRole("navigation", { name: "Document location" })).toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(linkRef.current).toBe(screen.getByRole("link", { name: "Handbook" }));
    expect(linkRef.current).toHaveAttribute("href", "/handbook");
    expect(linkRef.current).toHaveClass("focus-visible:ring-2");
    expect(navRef.current).toBe(screen.getByRole("navigation", { name: "Document location" }));
    await userEvent.setup().click(screen.getByRole("link", { name: "Handbook" }));
    expect(navigate).toHaveBeenCalledOnce();
    expect(screen.getByText("/")).toHaveAttribute("aria-hidden", "true");
  });
});
