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
});
