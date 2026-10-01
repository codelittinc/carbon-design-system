import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "../card";

describe("Card", () => {
  it("renders a div with its children", () => {
    render(<Card data-testid="card">Body</Card>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveTextContent("Body");
    expect(card.className).toContain("bg-surface");
  });

  it("merges its styles onto the child with asChild", () => {
    render(
      <Card asChild>
        <a href="/x" className="block">
          Link
        </a>
      </Card>,
    );
    const link = screen.getByRole("link", { name: "Link" });
    expect(link.className).toContain("border-border");
    expect(link.className).toContain("block");
  });

  it("drops padding with padding=none", () => {
    render(<Card data-testid="card" padding="none" />);
    expect(screen.getByTestId("card").className).not.toMatch(/\bp-\d/);
  });
});
