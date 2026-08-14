'use client';

import { useEffect, useRef, useState } from 'react';
import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    label: "Copy to clipboard",
  },
  es: {
    label: "Copiar al portapapeles",
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

function CopyIcon({ size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  );
}

function CheckIcon({ size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function CopyButton({
  text,
  locale,
  size = 18,
  variant = 'icon',
  className = '',
}: {
  text: string;
  locale: Locale;
  size?: number;
  variant?: string;
  className?: string;
}) {
  const textDict = TRANSLATIONS[locale];
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const manejarCopia = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiado(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setCopiado(false);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };

  const baseStyles =
    variant === 'boxed'
      ? 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface border border-accent-secondary/30 hover:border-accent shadow-sm'
      : 'p-2 rounded-lg hover:bg-surface/50';

  return (
    <button
      onClick={manejarCopia}
      className={`shrink-0 text-text-muted hover:text-accent transition-all duration-200 active:scale-95 flex items-center justify-center ${baseStyles} ${className}`}
      title={textDict.label}
      aria-label={textDict.label}
    >
      {copiado ? <CheckIcon size={size} /> : <CopyIcon size={size} />}
    </button>
  );
}