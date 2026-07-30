import type { JSX } from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { getMessages, LANG_LABELS } from "@/lib/i18n";

const BILIBILI_URL = "https://space.bilibili.com/450000657?spm_id_from=333.1007.0.0";
const DOUYIN_URL = "https://www.douyin.com/user/MS4wLjABAAAAzWfG071S0Ol0_wF3xT1i0oL5eSpPdiYZZY_gKib9S_M?from_tab_name=main";

export function Header(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [useSvgFallback, setUseSvgFallback] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const t = getMessages(lang);

  const themeIcon = theme === "system" ? (
    <Monitor className="h-4 w-4" />
  ) : theme === "dark" ? (
    <Moon className="h-4 w-4" />
  ) : (
    <Sun className="h-4 w-4" />
  );

  const handleAvatarClick = useCallback(() => {
    setAvatarOpen((prev) => !prev);
  }, []);

  const handleLinkClick = useCallback((url: string) => {
    window.open(url, "_blank", "noopener");
    setAvatarOpen(false);
  }, []);

  const handleImgError = useCallback(() => {
    if (!useSvgFallback) {
      setUseSvgFallback(true);
    } else {
      setImgError(true);
    }
  }, [useSvgFallback]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border relative">
      {/* Left: Avatar + Title */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={avatarRef}>
          <div
            className="w-9 h-9 rounded-full bg-primary overflow-hidden flex items-center justify-center cursor-pointer select-none hover:opacity-80 transition-opacity"
            onClick={handleAvatarClick}
            title="FSYL"
          >
            {imgError ? (
              <span className="text-primary-foreground text-xs font-bold">F</span>
            ) : (
              <img
                src={useSvgFallback ? "/fimg/avatar.svg" : "/fimg/avatar.jpg"}
                alt="FSYL"
                className="w-full h-full object-cover"
                onError={handleImgError}
              />
            )}
          </div>
          {avatarOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-32 rounded-lg border border-border bg-card shadow-lg p-1.5 space-y-1 z-50">
              <button
                className="w-full px-3 py-1.5 text-xs rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer"
                onClick={() => handleLinkClick(BILIBILI_URL)}
              >
                {t.bilibili}
              </button>
              <button
                className="w-full px-3 py-1.5 text-xs rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer"
                onClick={() => handleLinkClick(DOUYIN_URL)}
              >
                {t.douyin}
              </button>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">{t.title}</h1>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Right: Language switch + Theme toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          title={t.langSwitch}
          className="text-xs font-medium px-2"
        >
          {LANG_LABELS[lang]}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`${t.themeLabel}: ${theme}`}
        >
          {themeIcon}
        </Button>
      </div>
    </header>
  );
}
