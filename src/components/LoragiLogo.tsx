import React from 'react';

interface LoragiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  subtext?: string;
}

export const LoragiLogo: React.FC<LoragiLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  subtext,
}) => {
  const sizeMap: Record<string, string> = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const isNumeric = typeof size === 'number';
  const iconClass = isNumeric ? '' : sizeMap[size] || sizeMap.md;
  const customStyle = isNumeric ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Bio-Digital Vector Logo Icon */}
      <div
        style={customStyle}
        className={`relative flex items-center justify-center ${iconClass} rounded-2xl bg-gradient-to-tr from-bio-surface to-bio-card border border-bio-emerald/40 shadow-bio-emerald p-1 group shrink-0 transition-all hover:scale-105`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(0,245,160,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoEm" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5a0" />
              <stop offset="100%" stopColor="#00d2ff" />
            </linearGradient>
            <linearGradient id="logoVi" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Filmstrip Track Ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#logoEm)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.4"
          />

          {/* Precision Slicer Left Blade ('L' Curve) */}
          <path
            d="M 32 24 C 32 42 42 56 50 56 C 58 56 68 48 76 35 C 70 45 60 52 48 52 C 37 52 35 42 35 24 Z"
            fill="url(#logoEm)"
          />

          {/* Precision Slicer Right Blade ('G' Curve) */}
          <path
            d="M 68 76 C 68 58 58 44 50 44 C 42 44 32 52 24 65 C 30 55 40 48 52 48 C 63 48 65 58 65 76 Z"
            fill="url(#logoVi)"
          />

          {/* Laser Cutting Beam (45deg) */}
          <line
            x1="20"
            y1="80"
            x2="80"
            y2="20"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Central Larva Lens Core */}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="#030712"
            stroke="url(#logoEm)"
            strokeWidth="2.5"
          />
          <polygon
            points="50,44 56,50 50,56 44,50"
            fill="#00f5a0"
          />
          <circle cx="50" cy="50" r="3" fill="#ffffff" />
        </svg>

        {/* Ambient Pulsing Signal Particle */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-bio-cyan animate-ping opacity-75" />
      </div>

      {/* Optional Typography Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Lora<span className="text-bio-emerald">Gi</span>
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider uppercase rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
              Bio-Digital AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {subtext || 'Precision Video Slicer & Multi-Purpose Studio'}
          </span>
        </div>
      )}
    </div>
  );
};
