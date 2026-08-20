import React, { useState, useEffect } from 'react';

export default function TuLinhArenaBackground({ children }) {
  const [embers, setEmbers] = useState([]);

  useEffect(() => {
    // 60 Emerald green & golden fire stardust embers rising from the dragon eyes & rune portal
    const generatedEmbers = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      left: Math.random() * 92 + 4,
      bottom: Math.random() * 65 + 5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3.5,
      color: i % 4 === 0 ? '#34d399' : i % 4 === 1 ? '#10b981' : i % 4 === 2 ? '#6ee7b7' : '#a7f3d0'
    }));
    setEmbers(generatedEmbers);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030e0b] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ============================================================== */}
      {/* TOP HERO ARENA BACKGROUND LAYER (PURE EMERALD & BLACK ARTWORK) */}
      {/* ============================================================== */}
      <div className="absolute inset-x-0 top-0 h-[680px] sm:h-[760px] pointer-events-none z-0 overflow-hidden bg-[#030e0b]">
        
        {/* 1. Base 8K Arena Artwork Wallpaper */}
        <img
          src="/images/loi_dai_bg_ultra_sharp_8k.jpg"
          alt="Thách Đấu Arena 8K"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
          className="w-full h-full object-cover object-[center_50%] filter brightness-110 saturate-125 contrast-110 opacity-100 transition-all duration-300"
        />

        {/* 🐉 2. GENTLE DEEP EMERALD AMBIENT BREATHING AURA (NO FAKE LIGHTNING LINES) */}
        <div className="absolute top-[8%] left-[4%] w-64 sm:w-80 h-64 sm:h-80 pointer-events-none z-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35)_0%,rgba(4,120,87,0.15)_50%,transparent_75%)] filter blur-3xl animate-pulse" />
        </div>

        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none z-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.4)_0%,rgba(4,120,87,0.2)_50%,transparent_75%)] filter blur-3xl animate-pulse" />
        </div>

        <div className="absolute top-[8%] right-[4%] w-64 sm:w-80 h-64 sm:h-80 pointer-events-none z-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35)_0%,rgba(4,120,87,0.15)_50%,transparent_75%)] filter blur-3xl animate-pulse" />
        </div>

        {/* ✨ 3. 60 FLOATING EMERALD STARDUST EMBERS */}
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="absolute rounded-full animate-emerald-ember pointer-events-none z-20"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              left: `${ember.left}%`,
              bottom: `${ember.bottom}%`,
              backgroundColor: ember.color,
              boxShadow: `0 0 12px ${ember.color}, 0 0 24px ${ember.color}`,
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`
            }}
          />
        ))}

        {/* 4. Smooth Bottom Gradient Fade Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-60% to-[#030e0b] pointer-events-none z-15" />
      </div>

      {/* Main Page Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
