import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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
  vi.restoreAllMocks();
});

function stubSystemTheme(light: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: light && query === "(prefers-color-scheme: light)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

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

describe("ThemeProvider options", () => {
  it("starts from a concrete initialTheme and applies its class", () => {
    render(
      <ThemeProvider initialTheme="light">
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it('follows prefers-color-scheme for initialTheme="system"', () => {
    stubSystemTheme(true);
    render(
      <ThemeProvider initialTheme="system">
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it('falls back to dark for initialTheme="system" without a light preference', () => {
    stubSystemTheme(false);
    render(
      <ThemeProvider initialTheme="system">
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("ignores a later initialTheme until remounted", () => {
    const { rerender } = render(
      <ThemeProvider initialTheme="light">
        <ThemeReadout />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("set dark"));
    rerender(
      <ThemeProvider initialTheme="light">
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("never reads or writes localStorage when persist is false", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(
      <ThemeProvider initialTheme="dark" persist={false}>
        <ThemeReadout />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("toggle"));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("calls onThemeChange with each new theme, and not on mount", () => {
    const onThemeChange = vi.fn();
    render(
      <ThemeProvider initialTheme="dark" onThemeChange={onThemeChange}>
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(onThemeChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("set dark"));
    expect(onThemeChange.mock.calls).toEqual([["light"], ["dark"]]);
  });
});

describe("ThemeToggle", () => {
  it("renders its icon on the server when the provider has a concrete initialTheme", () => {
    const markup = renderToString(
      <ThemeProvider initialTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(markup).toContain("lucide-moon");
    expect(markup).toContain("Switch to dark mode");
  });

  it("renders a placeholder on the server when the theme is only known client-side", () => {
    for (const initialTheme of [undefined, "system"] as const) {
      const markup = renderToString(
        <ThemeProvider initialTheme={initialTheme}>
          <ThemeToggle />
        </ThemeProvider>,
      );
      expect(markup).not.toContain("lucide-moon");
      expect(markup).not.toContain("lucide-sun");
    }
  });

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
