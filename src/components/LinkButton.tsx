import type { ReactNode } from 'react';

export default function LinkButton({ href, icon, children, className = '' }: 
  { href: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`w-full inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-secondary text-background font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md text-sm sm:text-base active:scale-95 ${className}`}
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}