"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { siteConfig, locales, type Locale } from "@/lib/config";

const TRANSLATIONS = {
  en: {
    home: "Home",
    experience: "Experience",
    projects: "Projects",
    about: "About",
    sendEmail: "Send email",
  },
  es: {
    home: "Inicio",
    experience: "Experiencia",
    projects: "Proyectos",
    about: "Sobre mí",
    sendEmail: "Enviar correo",
  },
} as const satisfies Record<Locale, any>;

const NAV_LINKS = [
  { href: "/experience", key: "experience" },
  { href: "/projects", key: "projects" },
  { href: "/about", key: "about" },
] as const;

const LOCALE_METADATA: Record<Locale, { emoji: string; label: string }> = {
  en: { emoji: "🇬🇧", label: "English" },
  es: { emoji: "🇪🇸", label: "Español" },
};

function LanguageToggle({ locale }: { locale: Locale }) {
  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => changeLanguage(l)}
          aria-label={LOCALE_METADATA[l].label}
          className={`text-2xl leading-none transition-all duration-200 hover:scale-110 ${
            locale === l ? "opacity-100" : "opacity-50 hover:opacity-100"
          }`}
        >
          {LOCALE_METADATA[l].emoji}
        </button>
      ))}
    </div>
  );
}

export default function Navbar({ locale }: { locale: Locale }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const text = TRANSLATIONS[locale];

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      setIsMobileMenuOpen(false);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-transparent backdrop-blur">
        <div className="mx-auto w-full max-w-screen-2xl px-6">
          <nav
            aria-label="Primary"
            className="relative flex items-center justify-between py-8"
          >
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-text/20 to-transparent" />

            <Link href="/" className="relative text-nav transition-colors hover:text-accent after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-current after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
              Samira
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ href, key }) => (
                <Link key={href} href={href} className="relative text-nav transition-colors hover:text-accent after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-current after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                  {text[key]}
                </Link>
              ))}
              <div className="flex items-center gap-3">
                <span className="text-nav whitespace-nowrap">{siteConfig.contactEmail}</span>
                <CopyButton text={siteConfig.contactEmail} locale={locale} size={20} />
              </div>
              <LanguageToggle locale={locale} />
            </div>

            <div className="md:hidden flex items-center gap-3">
              <LanguageToggle locale={locale} />

              <button
                ref={buttonRef}
                className="p-2 -mr-2 text-nav hover:text-accent focus:outline-none transition-colors relative z-50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-transparent backdrop-blur-xl md:hidden touch-none overscroll-none">
          <div className="flex flex-col items-center gap-8 text-center p-6">
            <Link
              href="/"
              className="text-nav hover:text-accent transition-colors text-2xl font-medium"
            >
              {text.home}
            </Link>

            {NAV_LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-nav hover:text-accent transition-colors text-2xl font-medium"
              >
                {text[key]}
              </Link>
            ))}

            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-nav hover:text-accent transition-colors text-2xl font-medium"
            >
              {text.sendEmail}
            </a>
          </div>
        </div>
      )}
    </>
  );
}