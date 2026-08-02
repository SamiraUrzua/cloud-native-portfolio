// app/play/page.tsx
'use client';

import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/components/SamiRPG'), {
  ssr: false,
});

export default function PlayPage() {
  return <PhaserGame />;
}