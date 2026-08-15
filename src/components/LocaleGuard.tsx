"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/config";

export function LocaleGuard({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const renderedLocale = useRef(locale);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    const currentCookieLocale = cookieMatch?.[1];

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (currentCookieLocale !== locale) {
        document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      }
      renderedLocale.current = locale;
      return;
    }

    if (currentCookieLocale && currentCookieLocale !== renderedLocale.current) {
      window.location.reload();
      return;
    }

    renderedLocale.current = locale;
  }, [pathname, locale]);

  return null;
}