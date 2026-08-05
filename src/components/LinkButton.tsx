import type { ReactNode } from 'react';

export default function LinkButton({ href, icon, children, className = '' }: 
  { href: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`
        w-full inline-flex items-center justify-center gap-2 
        bg-accent text-background font-body text-xl font-bold 
        py-3.5 px-6 rounded-xl
        
        shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-4px_0_rgba(0,0,0,0.25)]
        
        hover:-translate-y-[2px] 
        hover:brightness-110 
        hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.25),0_6px_15px_rgba(0,0,0,0.15)]
        
        transition-all duration-150 
        active:translate-y-[2px] 
        active:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.25)]
        
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </a>
  );
}