import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "epubtr-theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyTheme(theme: Theme): void {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function getOppositeTheme(theme: Theme): Theme {
  if (theme === "system") return "light";
  if (theme === "light") return "dark";
  return "system";
}

export function useTheme(): {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
} {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const resolvedTheme =
    theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (): void => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => getOppositeTheme(prev));
  }, []);

  return { theme, resolvedTheme, toggleTheme };
}
