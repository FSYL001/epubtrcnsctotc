import type { JSX } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getMessages } from "@/lib/i18n";

const SITE_URL = "https://blog.fsyl001.sbs";
const DONATE_URL = "https://ifdian.net/a/fsyl001";

export function Footer(): JSX.Element {
  const { lang } = useLanguage();
  const t = getMessages(lang);

  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-lg mx-auto px-6 py-6">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <span>{t.footerCopyrightBefore}</span>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            {t.footerCopyrightLink}
          </a>
          <span className="mx-1.5">{t.footerDivider}</span>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            {t.footerSite}
          </a>
          <span className="mx-1.5">{t.footerDivider}</span>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            {t.footerDonate}
          </a>
        </p>
      </div>
    </footer>
  );
}
