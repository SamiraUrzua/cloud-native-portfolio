"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { siteConfig } from "@/lib/config";

const NAV_LINKS = [
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

            <Link href="/" className="text-nav tracking-tight hover:text-accent transition-colors relative z-50">
              Samira
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-nav hover:text-accent transition-colors">
                  {label}
                </Link>
              ))}
              <div className="flex items-center gap-3">
                <span className="text-nav whitespace-nowrap">{siteConfig.contactEmail}</span>
                <CopyButton text={siteConfig.contactEmail} size={20} />
              </div>
            </div>

            <button
              ref={buttonRef}
              className="md:hidden p-2 -mr-2 text-nav hover:text-accent focus:outline-none transition-colors relative z-50"
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
              Home
            </Link>

            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-nav hover:text-accent transition-colors text-2xl font-medium"
              >
                {label}
              </Link>
            ))}

            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-nav hover:text-accent transition-colors text-2xl font-medium"
            >
              Send email
            </a>
          </div>
        </div>
      )}
    </>
  );
}