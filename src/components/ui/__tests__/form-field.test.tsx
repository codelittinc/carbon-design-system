import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "../form-field";

describe("FormField", () => {
  it("associates the label with the control via htmlFor", () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toBe(screen.getByRole("textbox"));
  });

  it("renders a required marker when required", () => {
    render(
      <FormField label="Email" required>
        <input />
      </FormField>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("omits the required marker when not required", () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>,
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("shows the hint when there is no error", () => {
    render(
      <FormField label="Email" hint="We never share it">
        <input />
      </FormField>,
    );
    expect(screen.getByText("We never share it")).toBeInTheDocument();
  });

  it("shows the error and hides the hint when both are provided", () => {
    render(
      <FormField label="Email" error="Required" hint="We never share it">
        <input />
      </FormField>,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("We never share it")).not.toBeInTheDocument();
  });

  it("renders neither error nor hint text when both are absent", () => {
    const { container } = render(
      <FormField label="Email">
        <input />
      </FormField>,
    );
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("renders its children", () => {
    render(
      <FormField label="Email">
        <input placeholder="you@example.com" />
      </FormField>,
    );
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("merges a custom className onto the wrapper", () => {
    const { container } = render(
      <FormField label="Email" className="mt-4">
        <input />
      </FormField>,
    );
    expect(container.firstChild).toHaveClass("mt-4");
  });

  it("hides the required marker from the accessible name", () => {
    render(
      <FormField label="Email" htmlFor="email" required>
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("describes the control with its hint", () => {
    render(
      <FormField label="Email" htmlFor="email" hint="We never share it">
        <input id="email" />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleDescription("We never share it");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("describes the control with its error, marks it invalid and announces it", () => {
    render(
      <FormField label="Email" htmlFor="email" error="Enter an email" hint="We never share it">
        <input id="email" />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleDescription("Enter an email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email");
  });

  it("keeps a description the control already had", () => {
    render(
      <>
        <span id="own">Format: name@domain</span>
        <FormField label="Email" htmlFor="email" hint="We never share it">
          <input id="email" aria-describedby="own" />
        </FormField>
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription(
      "Format: name@domain We never share it",
    );
  });

  it("links the message without htmlFor too", () => {
    render(
      <FormField label="Email" error="Enter an email">
        <input aria-label="Email" />
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription("Enter an email");
  });
});
