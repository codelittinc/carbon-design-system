"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { THEME_STORAGE_KEY as STORAGE_KEY, type Theme } from "@/lib/theme-script";

// The script builder lives in a module without "use client" so the utils entry
// can export it to server components; re-exported here so root imports work.
export {
  THEME_SCRIPT,
  themeScript,
  type Theme,
  type ThemeScriptOptions,
} from "@/lib/theme-script";

/** The saved theme, or null when none is saved or storage is unavailable. */
function storedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  const classList = document.documentElement.classList;
  classList.remove("light", "dark");
  classList.add(theme);
}

/** The OS appearance setting; dark when the browser reports no preference. */
function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

interface ThemeContextValue {
  theme: Theme;
  /**
   * True when `theme` is right from the first render (the provider was given a
   * concrete `initialTheme`), so a toggle can draw its icon without waiting
   * for mount.
   */
  resolved: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /**
   * The theme to start from, for apps that store the choice themselves (e.g.
   * on the user's account) and render it on the server. `"system"` follows the
   * OS `prefers-color-scheme` once mounted, dark when there is no preference.
   * It wins over a saved choice. Omitted, the provider reads back the class
   * `THEME_SCRIPT` / `themeScript()` set.
   */
  initialTheme?: Theme | "system";
  /**
   * The theme to fall back to when `initialTheme` is omitted and nothing has
   * chosen one yet. Unlike `initialTheme`, it never overrides the user's
   * choice: on mount the provider uses the class `themeScript()` set, else the
   * saved theme (when `persist`), else this. Server and first client render
   * assume it, so pass the same value as `themeScript({ defaultTheme })`.
   * Omitted, the provider keeps its old behaviour (dark, nothing applied).
   */
  defaultTheme?: Theme;
  /** Save the choice to localStorage. Defaults to true; false never touches it. */
  persist?: boolean;
  /** Called with the new theme after `setTheme` or `toggleTheme`, never on mount. */
  onThemeChange?: (theme: Theme) => void;
}

export function ThemeProvider({
  children,
  initialTheme,
  defaultTheme,
  persist = true,
  onThemeChange,
}: ThemeProviderProps) {
  const resolved = initialTheme === "light" || initialTheme === "dark";
  // Without a concrete initialTheme, the theme script set the class before
  // hydration; both server and first client render assume the default
  // (dark unless defaultTheme says otherwise), then we sync on mount.
  const [theme, setThemeState] = useState<Theme>(
    resolved ? initialTheme : (defaultTheme ?? "dark"),
  );

  const onThemeChangeRef = useRef(onThemeChange);
  useEffect(() => {
    onThemeChangeRef.current = onThemeChange;
  }, [onThemeChange]);

  // Mount only: initialTheme seeds the state, later changes to it are ignored.
  useEffect(() => {
    if (initialTheme === undefined) {
      const classList = document.documentElement.classList;
      if (classList.contains("light") || classList.contains("dark") || defaultTheme === undefined) {
        setThemeState(classList.contains("light") ? "light" : "dark");
        return;
      }
      // No theme script ran: pick the saved choice, else the default.
      const start = (persist ? storedTheme() : null) ?? defaultTheme;
      setThemeState(start);
      applyTheme(start);
      return;
    }
    const start = initialTheme === "system" ? systemTheme() : initialTheme;
    setThemeState(start);
    applyTheme(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      applyTheme(next);
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Ignore storage failures (private mode, quota) — the class still applies.
        }
      }
      onThemeChangeRef.current?.(next);
    },
    [persist],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * Sun/moon button that toggles light/dark. Shows a filled orange sun while dark
 * (click → light) and a filled indigo moon while light (click → dark).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolved, toggleTheme } = useTheme();

  // Unless the provider was given a concrete initialTheme, the theme is only
  // known client-side; render a fixed-size placeholder until mounted to avoid
  // a hydration mismatch on the icon.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("h-7 w-7 bg-surface-raised hover:border-carbon-600 hover:bg-surface-raised", className)}
    >
      {mounted || resolved ? (
        isDark ? (
          <Sun size={16} className="text-amber-500" fill="currentColor" />
        ) : (
          <Moon size={16} className="text-indigo-400" fill="currentColor" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </Button>
  );
}
