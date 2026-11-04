import React from 'react';
import { Scissors, HelpCircle, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { VaultieMascot } from './VaultieMascot';

interface HeaderProps {
  hasVideo: boolean;
  onOpenShortcuts: () => void;
  onOpenMetadata: () => void;
  onResetVideo: () => void;
  totalSegmentsCount: number;
  totalKeptDurationFormatted: string;
}

export const Header: React.FC<HeaderProps> = ({
  hasVideo,
  onOpenShortcuts,
  onOpenMetadata,
  onResetVideo,
  totalSegmentsCount,
  totalKeptDurationFormatted,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-bio-border bg-bio-void/90 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-bio-surface to-bio-card border border-bio-emerald/40 shadow-bio-emerald">
            <Scissors className="w-5 h-5 text-bio-emerald transform -rotate-45" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-bio-cyan animate-ping opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Lora<span className="text-bio-emerald">Gi</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
                v1.0 • Bio-Digital
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Precision Video Slicer</span>
              <span className="text-slate-600">•</span>
              <a 
                href="https://lorapok.tech" 
                target="_blank" 
                rel="noreferrer"
                className="text-bio-cyan hover:underline inline-flex items-center gap-0.5"
              >
                Lorapok Labs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>

        {/* Center Mascot & Tips */}
        <div className="hidden md:block">
          <VaultieMascot />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {hasVideo && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bio-surface border border-bio-border text-xs font-mono">
              <span className="text-slate-400">Portions:</span>
              <span className="text-bio-emerald font-bold">{totalSegmentsCount}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Kept Time:</span>
              <span className="text-bio-cyan font-bold">{totalKeptDurationFormatted}</span>
            </div>
          )}

          {hasVideo && (
            <>
              <button
                onClick={onOpenMetadata}
                title="View Video Metadata"
                className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-cyan/40 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                <Info className="w-4 h-4 text-bio-cyan" />
                <span className="hidden sm:inline">Info</span>
              </button>

              <button
                onClick={onResetVideo}
                title="Open New Video"
                className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-rose/40 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 text-bio-rose" />
                <span className="hidden sm:inline">New File</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-emerald/40 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-bio-emerald" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
        </div>
      </div>
    </header>
  );
};
