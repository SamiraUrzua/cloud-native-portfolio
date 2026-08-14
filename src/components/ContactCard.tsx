import CopyButton from '@/components/CopyButton';
import LinkButton from '@/components/LinkButton';
import { siteConfig, type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    contactEmail: "Contact Email",
    openInMailApp: "Open in mail app",
  },
  es: {
    contactEmail: "Email de contacto",
    openInMailApp: "Abrir en mi app de correo",
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  );
}

export default function ContactCard({ locale, email = siteConfig.contactEmail, className = '' }: { 
  locale: Locale; email?: string; className?: string; 
}) {
  const text = TRANSLATIONS[locale];

  return (
    <div className={`w-full flex flex-col gap-5 p-5 sm:p-6 rounded-2xl bg-surface/30 border border-accent-secondary/20 shadow-lg ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-base sm:text-xl uppercase tracking-wider font-semibold text-text-muted">
          {text.contactEmail}
        </span>
        <CopyButton text={email} locale={locale} variant="boxed" />
      </div>

      <span className="text-feature w-full min-w-0 break-all">{email}</span>

      <LinkButton href={`mailto:${email}`} icon={<MailIcon />}>
        {text.openInMailApp}
      </LinkButton>
    </div>
  );
}