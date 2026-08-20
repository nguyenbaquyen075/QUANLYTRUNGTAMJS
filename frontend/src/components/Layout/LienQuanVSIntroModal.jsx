import React, { useState, useEffect } from 'react';

export default function LienQuanVSIntroModal({ isOpen, onClose, onStartMatch, testTitle = "LÔI ĐÀI CHIẾN - THÁCH ĐẤU CAO THỦ", playerInfo = {} }) {
  const [loadPercent, setLoadPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoadPercent(0);
      setIsReady(false);
      return;
    }

    // Simulate 0% to 100% Exam Gauntlet summoning
    const interval = setInterval(() => {
      setLoadPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20 + 15);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const player = {
    name: playerInfo.name || 'NGUYỄN VĂN AN (SĨ TỬ)',
    rank: playerInfo.rank || 'MỤC TIÊU 9.5+ THPTQG',
    avatar: playerInfo.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    beast: '🐉 THANH LONG HỘ THỂ',
    determination: '100% QUYẾT TÂM',
    badge: '🏆 DŨNG SĨ THÁCH ĐẤU'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden font-sans select-none animate-fadeIn">
      {/* Dynamic Background Speedlines & Lightning */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/images/tu_linh_exact_arena_layout.jpg"
          alt="Arena Loading Background"
          className="w-full h-full object-cover filter brightness-75 contrast-110 saturate-120 opacity-40 scale-105 animate-pulse"
        />
        
        {/* Blue vs Emerald Split Glow Ambient */}
        <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-gradient-to-r from-blue-900/60 via-cyan-900/30 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-900/60 via-teal-900/30 to-transparent pointer-events-none" />
        
        {/* Speedlines Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.18),transparent_75%)]" />
      </div>

      {/* TOP ARENA TITLE HEADER */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center w-full px-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-emerald-950/80 border border-emerald-500/50 px-6 py-2 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm sm:text-base md:text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 uppercase">
            ⚡ MỘT MINH THÁCH THỨC ĐỈNH CAO - BỨT PHÁ GIỚI HẠN ⚡
          </h2>
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
        </div>
        <p className="text-xs font-bold text-slate-300 mt-2 uppercase tracking-wider">
          {testTitle}
        </p>
      </div>

      {/* CENTER SOLO HERO VS EXAM TRIAL CONTAINER */}
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-8 py-12 flex flex-col items-center">
        
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 items-center justify-between relative">
          
          {/* ============================================================== */}
          {/* LEFT: HERO APPLICANT (SĨ TỬ HỌC VIÊN - BẠN)                     */}
          {/* ============================================================== */}
          <div className="md:col-span-5 transform md:-skew-x-6 bg-gradient-to-br from-blue-950/90 via-slate-900/90 to-cyan-950/90 border-2 border-cyan-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative overflow-hidden group hover:scale-102 transition-all">
            {/* Corner Rank Badge Accent */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-black font-black text-[11px] px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md">
              {player.badge}
            </div>

            <div className="transform md:skew-x-6 flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Frame with Glowing Aura */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-cyan-400 p-1 bg-slate-950 shadow-[0_0_25px_#06b6d4] overflow-hidden">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  HÀNH TRANG SẴN SÀNG
                </div>
              </div>

              {/* Player Stats & Title */}
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest block">
                  {player.beast}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight uppercase tracking-tight">
                  {player.name}
                </h3>
                <div className="inline-block bg-blue-950/80 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs px-3 py-1 rounded-lg">
                  🎯 {player.rank}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-300 pt-1">
                  <span>Hành trang: <strong className="text-emerald-400 font-black">{player.determination}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CENTER VS TRIAL EMBLEM (THỬ THÁCH CAM GO)                       */}
          {/* ============================================================== */}
          <div className="md:col-span-2 flex flex-col items-center justify-center z-30 my-4 md:my-0">
            <div className="relative flex items-center justify-center">
              {/* Glowing Energy Aura Circle */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 blur-2xl opacity-80 animate-pulse absolute" />
              
              {/* VS Metallic Emblem */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 border-4 border-emerald-400 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.8)] transform hover:scale-110 transition-transform p-2 text-center">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-emerald-400 to-teal-600 font-serif italic leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  VS
                </span>
                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mt-0.5">
                  TRIAL
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT: LEGENDARY TRIAL EXAM GAUNTLET (THÁP THỬ THÁCH CAM GO)    */}
          {/* ============================================================== */}
          <div className="md:col-span-5 transform md:skew-x-6 bg-gradient-to-bl from-emerald-950/90 via-slate-900/90 to-teal-950/90 border-2 border-emerald-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] relative overflow-hidden group hover:scale-102 transition-all">
            {/* Corner Rank Badge Accent */}
            <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-[11px] px-4 py-1.5 rounded-br-2xl uppercase tracking-wider shadow-md">
              🏛️ THẠCH MA PHÁP TRẬN
            </div>

            <div className="transform md:-skew-x-6 flex flex-col sm:flex-row-reverse items-center gap-6">
              {/* Exam Boss Portal Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-emerald-400 p-1 bg-slate-950 shadow-[0_0_25px_#10b981] overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/tu_linh_exact_arena_layout.jpg"
                    alt="Exam Trial Gate"
                    className="w-full h-full object-cover rounded-xl filter brightness-110 saturate-120"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-950 border border-emerald-400 text-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  🔴 ĐỘ KHÓ: SIÊU CẤP (9.0+)
                </div>
              </div>

              {/* Exam Trial Info */}
              <div className="space-y-2 text-center sm:text-right">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest block">
                  🏛️ TRẬN ĐỒ THÁCH ĐẤU THPTQG
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight uppercase tracking-tight">
                  THỬ THÁCH THÍ SINH
                </h3>
                <div className="inline-block bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-lg">
                  ⚡ 50 CÂU HỎI • 90 PHÚT
                </div>
                <p className="text-[11px] text-slate-300 font-medium italic leading-snug">
                  "Chỉ những sĩ tử kiên cường nhất mới vượt qua thử thách này!"
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* EXAM TRIAL LOADING BAR & START MATCH BUTTON                    */}
        {/* ============================================================== */}
        <div className="w-full max-w-2xl mt-10 space-y-5 text-center">
          
          {/* Progress Bar Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-300 px-1">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isReady ? 'ĐÃ MỞ CỔNG THỦ THÁCH! CHUẨN BỊ XUẤT TRẬN!' : 'ĐANG TRIỆU HỒI TRẬN ĐỒ THÁCH ĐẤU...'}</span>
              </span>
              <span className="text-emerald-400 font-mono text-sm">{loadPercent}%</span>
            </div>

            <div className="w-full h-4 bg-slate-950 border border-emerald-500/40 rounded-full p-0.5 overflow-hidden shadow-inner relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-300 shadow-[0_0_15px_#10b981]"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Rút lui
            </button>

            <button
              type="button"
              disabled={!isReady}
              onClick={onStartMatch}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-2xl ${
                isReady
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white border-2 border-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.8)] scale-105 hover:scale-110 active:scale-95 animate-bounce'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <span>🔥 KHAI HỎA THÁCH THỨC NGAY</span>
              <span className="text-lg">➔</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
