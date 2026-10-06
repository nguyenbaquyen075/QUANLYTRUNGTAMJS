import React from 'react';
import pagodaBg from '../../assets/sidebar_pagoda_bg.jpg';

export default function SidebarFooterSupport() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[360px] pointer-events-none select-none z-0 overflow-hidden">
      {/* High-Res Watercolor Pagoda & Misty Mountain Artwork */}
      <div
        className="absolute inset-0 bg-cover bg-bottom opacity-20 mix-blend-luminosity"
        style={{ backgroundImage: `url(${pagodaBg || '/images/sidebar_pagoda_bg.jpg'})` }}
      />
      {/* Soft feathered gradient at top into sidebar blue */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#18489F] via-[#18489F]/60 to-transparent" />
    </div>
  );
}
