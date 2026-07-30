import { useState, useEffect, useCallback } from "react";
import type { AppLanguage } from "@/lib/i18n";
import { detectLanguage, getNextLang } from "@/lib/i18n";

const STORAGE_KEY = "epubtr-lang";

function getStoredLang(): AppLanguage | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "zh-CN" || stored === "zh-TW" || stored === "en") {
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

export function useLanguage(): {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
} {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    return getStoredLang() ?? detectLanguage();
  });

  const setLang = useCallback((newLang: AppLanguage): void => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback((): void => {
    setLangState((prev) => {
      const next = getNextLang(prev);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return { lang, setLang, toggleLang };
}
