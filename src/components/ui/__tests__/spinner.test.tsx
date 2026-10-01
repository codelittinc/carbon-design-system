import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "../spinner";

describe("Spinner", () => {
  it("is a status named Loading without a label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("shows and is named by its label", () => {
    render(<Spinner label="Evaluating…" />);
    expect(screen.getByRole("status", { name: "Evaluating…" })).toBeInTheDocument();
    expect(screen.getByText("Evaluating…")).toBeInTheDocument();
  });
});
