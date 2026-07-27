'use client';
import { useState } from 'react';

export default function ContactEmail({ className = '' }) {
  const [copiado, setCopiado] = useState(false);
  const correo = "contacto@ladeveloper.dev";

  const manejarCopia = async () => {
    try {
      await navigator.clipboard.writeText(correo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Error al copiar: ", err);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-5 p-5 sm:p-6 rounded-2xl bg-surface/30 border border-accent-secondary/20 shadow-lg ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-base sm:text-lg uppercase tracking-wider font-semibold text-text-muted">
          Email de contacto
        </span>

        <button
          onClick={manejarCopia}
          className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-surface border border-accent-secondary/30 hover:border-accent text-text-muted hover:text-accent transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm"
          title="Copiar al portapapeles"
          aria-label="Copiar correo"
        >
          {copiado ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          )}
        </button>
      </div>

      <span className="text-feature w-full min-w-0 break-all">
        {correo}
      </span>

      <a
        href={`mailto:${correo}`}
        className="w-full inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-secondary text-background font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md text-sm sm:text-base active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </svg>
        <span>Abrir en mi app de correo</span>
      </a>
    </div>
  );
}