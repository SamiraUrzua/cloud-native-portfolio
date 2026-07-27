export default function WallHolePortal() {
  return (
    <div className="fixed bottom-0 right-0 z-50 w-80 h-80 translate-x-[4%] translate-y-[4%] origin-bottom-right scale-50 md:scale-75 lg:scale-100 pointer-events-none group">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-radial from-transparent via-emerald-500/10 to-black/80 blur-xl transition-transform duration-300 group-hover:scale-[1.45]" />
        {/* Inner Glow */}
        <div className="absolute w-[190px] h-[190px] rounded-full bg-radial from-transparent via-emerald-500/20 to-black transition-transform duration-300 group-hover:scale-[1.55]" />
        {/* The Portal Circle */}
        <div className="absolute w-40 h-40 rounded-full overflow-hidden transition-[width,height] duration-300 group-hover:w-64 group-hover:h-64 pointer-events-auto cursor-pointer shadow-2xl">
          <img
            src="/character_placeholder.png"
            alt="RPG Dimension"
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              maxWidth: 'none',
              objectFit: 'cover',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}