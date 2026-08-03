'use client';

import dynamic from 'next/dynamic';

const SamiRPG = dynamic(() => import('@/components/SamiRPG'), { ssr: false });

export default function PlayPage() {
    return <SamiRPG />;
}