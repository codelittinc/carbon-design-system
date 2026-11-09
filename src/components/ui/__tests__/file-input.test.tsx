import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { acceptsFile, FileInput, formatFileSize } from "../file-input";
import { FormField } from "../form-field";

const csv = (name = "export.csv", bytes = 2048) => new File(["a".repeat(bytes)], name, { type: "text/csv" });

describe("FileInput", () => {
  it("is a file input labelled by its field, with the button hidden from assistive technology", () => {
    render(
      <FormField label="Export" htmlFor="f">
        <FileInput id="f" value={null} onChange={() => {}} />
      </FormField>,
    );
    const input = screen.getByLabelText("Export");
    expect(input).toHaveAttribute("type", "file");
    expect(screen.getByText("Choose file")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
  });

  it("hands the picked file to onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FileInput id="f" value={null} onChange={onChange} />);
    const file = csv();
    await user.upload(document.getElementById("f") as HTMLInputElement, file);
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("shows the chosen file's name and size, and clears it with Remove file", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FileInput id="f" value={csv("rippling.csv", 904_569)} onChange={onChange} />);
    expect(screen.getByText("rippling.csv")).toBeInTheDocument();
    expect(screen.getByText(/883 KB/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove file" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("takes a dropped file that accept allows, and ignores one it doesn't", () => {
    const onChange = vi.fn();
    const { container } = render(<FileInput id="f" accept=".csv,text/csv" value={null} onChange={onChange} />);
    const row = container.firstChild as HTMLElement;
    fireEvent.drop(row, { dataTransfer: { files: [new File(["x"], "photo.png", { type: "image/png" })] } });
    expect(onChange).not.toHaveBeenCalled();
    const file = csv();
    fireEvent.drop(row, { dataTransfer: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("ignores a drop and offers no Remove while disabled", () => {
    const onChange = vi.fn();
    const { container } = render(<FileInput id="f" value={csv()} onChange={onChange} disabled />);
    fireEvent.drop(container.firstChild as HTMLElement, { dataTransfer: { files: [csv()] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Remove file" })).toBeNull();
    expect(document.getElementById("f")).toBeDisabled();
  });

  it("is invalid with `invalid` or with a field's error", () => {
    render(
      <FormField label="Export" htmlFor="f" error="Can't read it">
        <FileInput id="f" value={null} onChange={() => {}} />
      </FormField>,
    );
    const input = screen.getByLabelText("Export");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "f-error");
    expect(input.parentElement).toHaveClass("border-error-border");
  });

  it("uses the words it is given", () => {
    render(<FileInput id="f" value={null} onChange={() => {}} buttonLabel="Elegir archivo" emptyLabel="Ningún archivo" />);
    expect(screen.getByText("Elegir archivo")).toBeInTheDocument();
    expect(screen.getByText("Ningún archivo")).toBeInTheDocument();
  });

  it("forwards a ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput ref={ref} id="f" value={null} onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("file");
  });
});

describe("formatFileSize", () => {
  it("reads bytes, kilobytes and megabytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(904_569)).toBe("883 KB");
    expect(formatFileSize(1_258_291)).toBe("1.2 MB");
  });
});

describe("acceptsFile", () => {
  it("matches extensions in any case, MIME types and families", () => {
    expect(acceptsFile({ name: "EXPORT.CSV", type: "" }, ".csv")).toBe(true);
    expect(acceptsFile({ name: "export", type: "text/csv" }, ".csv,text/csv")).toBe(true);
    expect(acceptsFile({ name: "a.png", type: "image/png" }, "image/*")).toBe(true);
    expect(acceptsFile({ name: "a.png", type: "image/png" }, ".csv,text/csv")).toBe(false);
    expect(acceptsFile({ name: "anything.bin", type: "" }, undefined)).toBe(true);
  });
});
