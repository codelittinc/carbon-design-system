import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Monogram } from "../monogram";

function tile(ui: React.ReactElement) {
  return render(ui).container.firstElementChild as HTMLElement;
}

describe("Monogram", () => {
  it("takes the first letter of each of the first two words", () => {
    expect(tile(<Monogram name="Google Suite" />)).toHaveTextContent("GS");
    expect(tile(<Monogram name="Carbon Gatekeeper Admin" />)).toHaveTextContent("CG");
  });

  it("takes the first two letters of a single word", () => {
    expect(tile(<Monogram name="Slack" />)).toHaveTextContent("SL");
  });

  it("ignores punctuation and keeps digits", () => {
    expect(tile(<Monogram name="(Legacy) — Wiki" />)).toHaveTextContent("LW");
    expect(tile(<Monogram name="1Password" />)).toHaveTextContent("1P");
  });

  it("keeps non-Latin letters whole and uppercases them", () => {
    expect(tile(<Monogram name="ångström ñandú" />)).toHaveTextContent("ÅÑ");
    expect(tile(<Monogram name="𝒳ylophone" />)).toHaveTextContent("𝒳Y");
  });

  it("is empty when the name has no letters or digits", () => {
    expect(tile(<Monogram name=" — " />)).toHaveTextContent("");
  });

  it("takes explicit initials, uppercased", () => {
    expect(tile(<Monogram name="Carbon Gatekeeper Admin" initials="gk" />)).toHaveTextContent("GK");
  });

  it("is decorative and drawn with the muted accent pairing", () => {
    const el = tile(<Monogram name="Slack" />);
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("bg-accent-muted", "text-accent-text");
  });

  it("is size-10 at md by default, with sm and lg steps", () => {
    expect(tile(<Monogram name="Slack" />)).toHaveClass("size-10");
    expect(tile(<Monogram name="Slack" size="sm" />)).toHaveClass("size-8");
    expect(tile(<Monogram name="Slack" size="lg" />)).toHaveClass("size-12");
  });

  it("merges className", () => {
    expect(tile(<Monogram name="Slack" className="rounded-full" />)).toHaveClass("rounded-full");
  });
});
