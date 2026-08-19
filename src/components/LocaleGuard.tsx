"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/config";

const RELOAD_KEY = "locale_reload_timestamps";
const MAX_RELOADS = 3;
const TIME_WINDOW_MS = 60000; // 1 minute

function isLooping(): boolean {
  const now = Date.now();
  const raw = sessionStorage.getItem(RELOAD_KEY);
  const timestamps: number[] = raw ? JSON.parse(raw) : [];

  // Keep only timestamps within the time window
  const recentTimestamps = timestamps.filter((t) => now - t < TIME_WINDOW_MS);

  if (recentTimestamps.length >= MAX_RELOADS) {
    return true; // Loop detected
  }

  // Record this reload attempt
  recentTimestamps.push(now);
  sessionStorage.setItem(RELOAD_KEY, JSON.stringify(recentTimestamps));
  return false;
}

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
      if (isLooping()) {
        console.error("LocaleGuard: Prevented an infinite reload loop.");
        return;
      }
      window.location.reload();
      return;
    }

    renderedLocale.current = locale;
  }, [pathname, locale]);

  return null;
}