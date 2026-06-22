"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

export type Theme = "light" | "dark";

const STORAGE_KEY = "carbon-theme";

/**
 * Inline script to drop into <head> so the saved theme is applied before the
 * first paint. The design system is dark by default (no class); this always
 * sets an explicit `light`/`dark` class so consumers can read it back on
 * hydration. Without it, a saved light preference would flash dark on load.
 *
 * Usage (Next.js app root):
 *   <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark")t="dark";var c=document.documentElement.classList;c.remove("light","dark");c.add(t);}catch(e){}})();`;

function applyTheme(theme: Theme) {
  const classList = document.documentElement.classList;
  classList.remove("light", "dark");
  classList.add(theme);
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // THEME_SCRIPT set the class before hydration; both server and first client
  // render assume "dark" (the default), then we sync to the real value on mount.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(
      document.documentElement.classList.contains("light") ? "light" : "dark",
    );
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode, quota) — the class still applies.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
  const { theme, toggleTheme } = useTheme();

  // The resolved theme is only known client-side; render a fixed-size
  // placeholder until mounted to avoid a hydration mismatch on the icon.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised transition-colors hover:border-carbon-600",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun size={16} className="text-amber-500" fill="currentColor" />
        ) : (
          <Moon size={16} className="text-indigo-400" fill="currentColor" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
