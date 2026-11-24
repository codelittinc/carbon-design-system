import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileInput } from "../file-input";

function pdf(name = "alex-doe-cv.pdf", size = 2048) {
  return new File([new Uint8Array(size)], name, { type: "application/pdf" });
}

describe("FileInput", () => {
  it("renders a named native file input and the empty label", () => {
    render(<FileInput id="resume" name="resume" accept="application/pdf" />);
    const input = document.getElementById("resume") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("name", "resume");
    expect(input).toHaveAttribute("accept", "application/pdf");
    expect(screen.getByText("Choose file")).toBeInTheDocument();
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
  });

  it("shows the chosen file's name and size and reports it", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    render(<FileInput id="resume" onFileChange={onFileChange} />);
    const file = pdf();
    await user.upload(document.getElementById("resume") as HTMLInputElement, file);
    expect(onFileChange).toHaveBeenCalledWith(file);
    expect(screen.getByText("alex-doe-cv.pdf")).toBeInTheDocument();
    expect(screen.getByText("· 2 KB")).toBeInTheDocument();
    expect(screen.getByTitle("alex-doe-cv.pdf")).toBeInTheDocument();
  });

  it("Remove clears the input and reports null", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    render(<FileInput id="resume" onFileChange={onFileChange} />);
    const input = document.getElementById("resume") as HTMLInputElement;
    await user.upload(input, pdf());
    await user.click(screen.getByRole("button", { name: "Remove alex-doe-cv.pdf" }));
    expect(onFileChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe("");
    expect(input.files?.length ?? 0).toBe(0);
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("marks an invalid field and links its description", () => {
    render(<FileInput id="resume" invalid describedBy="resume-error" />);
    const input = document.getElementById("resume") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "resume-error");
    expect(screen.getByText("Choose file")).toHaveClass("border-error-border");
  });

  it("is disabled with the input", () => {
    render(<FileInput id="resume" disabled />);
    expect(document.getElementById("resume")).toBeDisabled();
  });

  it("takes custom labels", () => {
    render(<FileInput id="resume" buttonLabel="Attach" emptyLabel="Nothing attached" />);
    expect(screen.getByText("Attach")).toBeInTheDocument();
    expect(screen.getByText("Nothing attached")).toBeInTheDocument();
  });

  it("forwards a ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput id="resume" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("file");
  });
});
