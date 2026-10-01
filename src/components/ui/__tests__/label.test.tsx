import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "../label";

describe("Label", () => {
  it("names its control", () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <input id="name" />
      </>,
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("marks required without changing the accessible name", () => {
    render(
      <>
        <Label htmlFor="name" required>
          Name
        </Label>
        <input id="name" />
      </>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  });
});
