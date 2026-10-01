import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, toast, useToast } from "../toast";

function ToastTrigger({
  title = "Saved",
  description,
  variant,
}: {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
}) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title, description, variant })}>
      fire
    </button>
  );
}

describe("ToastProvider / useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the toast title and description when fired", () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Item saved" description="All good" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByText("Item saved")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("applies the error variant styling fragment", () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Nope" variant="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    const toast = screen.getByText("Nope").closest("div")?.parentElement;
    expect(toast?.className).toContain("border-error-border");
  });

  it("applies the success variant styling fragment", () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Yay" variant="success" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    const toast = screen.getByText("Yay").closest("div")?.parentElement;
    expect(toast?.className).toContain("border-success-border");
  });

  it("removes the toast when the close button is clicked", () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Dismiss me" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByText("Dismiss me")).toBeInTheDocument();

    const toast = screen.getByText("Dismiss me").closest("div")?.parentElement;
    const closeButton = toast?.querySelector("button");
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);
    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
  });

  it("auto-dismisses after 4000ms", () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Fades away" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByText("Fades away")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText("Fades away")).not.toBeInTheDocument();
  });
});

describe("imperative toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows in the mounted provider without useToast", () => {
    render(<ToastProvider>app</ToastProvider>);
    act(() => toast.success("Saved", { description: "All good" }));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(screen.getByRole("status").className).toContain("bg-success-soft");
  });

  it("announces errors as alerts", () => {
    render(<ToastProvider>app</ToastProvider>);
    act(() => toast.error("Nope"));
    expect(screen.getByRole("alert")).toHaveTextContent("Nope");
  });

  it("has info and warning variants", () => {
    render(<ToastProvider>app</ToastProvider>);
    act(() => {
      toast.info("FYI");
      toast.warning("Careful");
    });
    expect(screen.getByText("FYI").closest("[role=status]")?.className).toContain("bg-info-soft");
    expect(screen.getByText("Careful").closest("[role=status]")?.className).toContain(
      "bg-accent-muted",
    );
  });

  it("is a no-op once the provider unmounts", () => {
    const { unmount } = render(<ToastProvider>app</ToastProvider>);
    unmount();
    expect(() => act(() => toast.success("Gone"))).not.toThrow();
    expect(screen.queryByText("Gone")).not.toBeInTheDocument();
  });
});
