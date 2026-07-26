import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  THEME_SCRIPT,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../theme";

afterEach(() => {
  document.documentElement.classList.remove("light", "dark");
  localStorage.clear();
});

function ThemeReadout() {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("light")}>set light</button>
      <button onClick={() => setTheme("dark")}>set dark</button>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe("useTheme", () => {
  it("throws when used outside a ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeReadout />)).toThrow(
      /useTheme must be used within a ThemeProvider/,
    );
    spy.mockRestore();
  });
});

describe("ThemeProvider", () => {
  it("syncs the initial theme from the existing documentElement class on mount", () => {
    document.documentElement.classList.add("light");
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("defaults to dark when no class is present", () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("setTheme updates the documentElement class and localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("set light"));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("carbon-theme")).toBe("light");

    fireEvent.click(screen.getByText("set dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(localStorage.getItem("carbon-theme")).toBe("dark");
  });

  it("toggleTheme flips between light and dark", () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("ThemeToggle", () => {
  it("renders a button with the light-mode aria-label while dark and toggles on click", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: "Switch to light mode" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});

describe("THEME_SCRIPT", () => {
  it("is a non-empty string containing the storage key", () => {
    expect(typeof THEME_SCRIPT).toBe("string");
    expect(THEME_SCRIPT.length).toBeGreaterThan(0);
    expect(THEME_SCRIPT).toContain("carbon-theme");
  });
});
