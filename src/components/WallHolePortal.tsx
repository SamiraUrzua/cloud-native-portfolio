'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function WallHolePortal() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="fixed bottom-0 right-0 z-50 w-80 h-80 translate-x-[4%] translate-y-[4%] origin-bottom-right scale-50 md:scale-75 lg:scale-100 pointer-events-none group" style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }} onMouseLeave={() => setIsActive(false)}>
      <div className="relative w-full h-full flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-black/50 opacity-0 transition-opacity duration-300 pointer-events-none ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`} />
        {/* Outer Glow */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-radial from-transparent via-emerald-500/10 to-black/80 blur-xl transition-transform duration-300 group-hover:scale-[1.45]" />
        {/* Inner Glow */}
        <div className="absolute w-[190px] h-[190px] rounded-full bg-radial from-transparent via-emerald-500/20 to-black transition-transform duration-300 group-hover:scale-[1.55]" />
        {/* The Portal Circle */}
        <div className={`absolute w-40 h-40 rounded-full overflow-hidden transition-[width,height] duration-300 pointer-events-auto cursor-pointer shadow-2xl ${isActive ? 'w-64 h-64' : 'group-hover:w-64 group-hover:h-64'}`} onMouseDown={() => setIsActive(true)} onTouchStart={() => setIsActive(true)} onTouchEnd={() => setIsActive(false)}>
          <Image
            src="/character_placeholder.webp"
            alt="RPG Dimension"
            width={320}
            height={320}
            loading="eager"
            draggable={false}
            style={{
              position: 'absolute',
              maxWidth: 'none',
              objectFit: 'cover',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}>
            <span className="px-6 text-center text-lg font-semibold text-white">
              En construcción
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}