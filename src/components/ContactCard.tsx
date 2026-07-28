import CopyButton from '@/components/CopyButton';
import LinkButton from '@/components/LinkButton';
import { siteConfig } from '@/lib/config';

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  );
}

export default function ContactCard({ email = siteConfig.contactEmail, className = '' }) {
  return (
    <div className={`w-full flex flex-col gap-5 p-5 sm:p-6 rounded-2xl bg-surface/30 border border-accent-secondary/20 shadow-lg ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-base sm:text-lg uppercase tracking-wider font-semibold text-text-muted">
          Email de contacto
        </span>
        <CopyButton text={email} variant="boxed" />
      </div>

      <span className="text-feature w-full min-w-0 break-all">{email}</span>

      <LinkButton href={`mailto:${email}`} icon={<MailIcon />}>
        Abrir en mi app de correo
      </LinkButton>
    </div>
  );
}