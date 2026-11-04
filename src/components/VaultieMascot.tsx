import React, { useState } from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

interface VaultieMascotProps {
  statusText?: string;
}

export const VaultieMascot: React.FC<VaultieMascotProps> = ({
  statusText = 'Vaultie is standing by. Ready to slice your video with bio-digital precision.'
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [speechBubble, setSpeechBubble] = useState(statusText);

  const quotes = [
    'Bio-Digital precision ready. Zero pixels lost!',
    'All processing happens 100% inside your browser. Your video never leaves your computer.',
    'Pro tip: Press [ to mark In and ] to mark Out for rapid clipping!',
    'Press S at any point to split a portion into two distinct clips.',
    'Lorapok Labs: Open-Source Products That Feel Alive ✨'
  ];

  const handlePoke = () => {
    setIsWiggling(true);
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechBubble(randomQuote);
    setTimeout(() => setIsWiggling(false), 800);
  };

  return (
    <div className="relative flex items-center gap-3 px-3 py-2 rounded-xl bio-glass border border-bio-border hover:border-bio-emerald/30 transition-all">
      {/* Vaultie SVG Avatar */}
      <button
        onClick={handlePoke}
        title="Poke Vaultie (Lorapok Mascot)"
        className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-bio-surface to-bio-card p-1 border border-bio-emerald/40 flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          isWiggling ? 'scale-125 rotate-12' : 'hover:scale-105'
        }`}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,245,160,0.6)]">
          {/* Cybernetic Larva Body Segments */}
          <ellipse cx="20" cy="27" rx="9" ry="6" fill="#0d1b2a" stroke="#00f5a0" strokeWidth="1.5" />
          <ellipse cx="20" cy="21" rx="8" ry="5.5" fill="#132a40" stroke="#00d2ff" strokeWidth="1.5" />
          <ellipse cx="20" cy="15" rx="7" ry="5" fill="#1e3a5f" stroke="#00f5a0" strokeWidth="1.5" />
          {/* Head */}
          <circle cx="20" cy="9" r="5" fill="#00f5a0" />
          {/* Cybernetic Visor / Eyes */}
          <ellipse cx="18" cy="8.5" rx="1.2" ry="1.2" fill="#05070c" />
          <ellipse cx="22" cy="8.5" rx="1.2" ry="1.2" fill="#05070c" />
          {/* Bio Antenna */}
          <path d="M18 4 Q17 1 14 2" stroke="#00d2ff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M22 4 Q23 1 26 2" stroke="#00d2ff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="14" cy="2" r="1" fill="#00f5a0" />
          <circle cx="26" cy="2" r="1" fill="#00f5a0" />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-bio-emerald border-2 border-bio-void animate-pulse" />
      </button>

      {/* Mascot Status */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-bio-emerald tracking-wide">
          <Sparkles className="w-3 h-3 text-bio-emerald animate-spin-slow" />
          <span>VAULTIE • BIO-ASSISTANT</span>
        </div>
        <p className="text-xs text-slate-300 truncate max-w-[280px] sm:max-w-md">
          {speechBubble}
        </p>
      </div>
    </div>
  );
};
