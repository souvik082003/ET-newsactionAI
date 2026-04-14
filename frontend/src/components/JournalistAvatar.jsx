import React from 'react';

export default function JournalistAvatar({ isTalking }) {
  return (
    <div className="relative w-full h-full max-w-[400px] aspect-[4/5] rounded-3xl border border-slate-600 shadow-2xl overflow-hidden bg-slate-900 pointer-events-none">
      <style>
        {`
          @keyframes talkBounce {
            0% { transform: scaleY(1.05) scaleX(1.05) translateY(0px); }
            100% { transform: scaleY(1.06) scaleX(1.045) translateY(1.5px); }
          }
          .talking-anim {
            animation: talkBounce 0.16s infinite alternate ease-in-out;
            transform-origin: center bottom;
          }
        `}
      </style>
      
      {/* Full Anchor Image (No Breaking Seams) */}
      <img 
        src="/realistic_anchor.png" 
        alt="AI News Anchor" 
        className={`absolute inset-0 w-full h-full object-cover transition-all ${isTalking ? 'talking-anim' : 'scale-105'}`}
      />
      
      {/* Subtle Inner Gradient for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none mix-blend-multiply" />
      
      {/* Branding Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
         <div className="px-3 py-1 bg-orange-500/90 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow">
            {isTalking ? '● Live Synthesis' : 'Standby'}
         </div>
      </div>
    </div>
  );
}
