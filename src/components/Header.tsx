import React from 'react';
import {
  Scissors,
  HelpCircle,
  Info,
  ExternalLink,
  RefreshCw,
  Link as LinkIcon,
  Clapperboard,
  BookOpen,
  Film,
  Wand2,
  Eraser,
  UploadCloud,
} from 'lucide-react';
import { LoragiLogo } from './LoragiLogo';
import { VaultieMascot } from './VaultieMascot';
import { UserProfileMenu } from './UserProfileMenu';

interface HeaderProps {
  hasVideo: boolean;
  activeView: 'studio' | 'gallery';
  onSelectView: (view: 'studio' | 'gallery') => void;
  onOpenShortcuts: () => void;
  onOpenInstructions: () => void;
  onOpenMetadata: () => void;
  onOpenUrlImport: () => void;
  onOpenOutroStudio: () => void;
  onOpenObjectRemoval: () => void;
  onOpenAiGenerator: () => void;
  onOpenPublish: () => void;
  onOpenAuth: () => void;
  onResetVideo: () => void;
  totalSegmentsCount: number;
  totalKeptDurationFormatted: string;
  isOutroEnabled: boolean;
  activeMasksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasVideo,
  activeView,
  onSelectView,
  onOpenShortcuts,
  onOpenInstructions,
  onOpenMetadata,
  onOpenUrlImport,
  onOpenOutroStudio,
  onOpenObjectRemoval,
  onOpenAiGenerator,
  onOpenPublish,
  onOpenAuth,
  onResetVideo,
  totalSegmentsCount,
  totalKeptDurationFormatted,
  isOutroEnabled,
  activeMasksCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-bio-border bg-bio-void/90 backdrop-blur-xl px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <LoragiLogo size="md" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Lora<span className="text-bio-emerald">Gi</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider uppercase rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
                v2.0 • AI Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Precision Slicer & Studio</span>
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

        {/* Center View Selector Tabs (Studio Slicer vs Community Gallery) */}
        <div className="flex items-center p-1 rounded-2xl bg-bio-surface border border-bio-border shadow-inner">
          <button
            onClick={() => onSelectView('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'studio'
                ? 'bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void shadow-bio-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Studio Slicer</span>
          </button>

          <button
            onClick={() => onSelectView('gallery')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'gallery'
                ? 'bg-gradient-to-r from-bio-cyan to-bio-violet text-bio-void shadow-bio-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>YouTube Gallery</span>
          </button>
        </div>

        {/* Mascot (Medium+ Screens) */}
        <div className="hidden xl:block">
          <VaultieMascot />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick AI Video Generator Trigger */}
          <button
            onClick={onOpenAiGenerator}
            title="Generate AI Music Video (Flow Music)"
            className="px-2.5 py-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-cyan/40 text-bio-cyan hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Gen</span>
          </button>

          {/* Slicer Studio Tools (when video is loaded in studio view) */}
          {hasVideo && activeView === 'studio' && (
            <>
              {/* Object Removal Trigger */}
              <button
                onClick={onOpenObjectRemoval}
                title="AI Object Removal & Inpainting"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMasksCount > 0
                    ? 'bg-bio-emerald/20 border-bio-emerald text-bio-emerald shadow-bio-emerald'
                    : 'bg-bio-surface hover:bg-bio-hover border-bio-border text-slate-300 hover:text-white'
                }`}
              >
                <Eraser className="w-3.5 h-3.5 text-bio-emerald" />
                <span className="hidden md:inline">Object Removal</span>
                {activeMasksCount > 0 && (
                  <span className="px-1 py-0.2 rounded-full bg-bio-emerald text-bio-void font-mono font-bold text-[9px]">
                    {activeMasksCount}
                  </span>
                )}
              </button>

              {/* Outro Studio Trigger */}
              <button
                onClick={onOpenOutroStudio}
                title="Configure Ending Scene / Outro"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isOutroEnabled
                    ? 'bg-bio-violet/20 border-bio-violet text-white shadow-bio-violet'
                    : 'bg-bio-surface hover:bg-bio-hover border-bio-border text-slate-300 hover:text-white'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5 text-bio-violet" />
                <span className="hidden md:inline">Outro</span>
              </button>

              {/* Publish Active Video */}
              <button
                onClick={onOpenPublish}
                title="Publish Active Video to Community Gallery"
                className="px-2.5 py-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-cyan/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <UploadCloud className="w-3.5 h-3.5 text-bio-cyan" />
                <span className="hidden md:inline">Publish</span>
              </button>

              {/* Import Link */}
              <button
                onClick={onOpenUrlImport}
                title="Import Video from URL / Flow Music / YouTube"
                className="p-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-cyan/40 text-slate-300 hover:text-white transition-all text-xs"
              >
                <LinkIcon className="w-4 h-4 text-bio-cyan" />
              </button>

              {/* Reset Video */}
              <button
                onClick={onResetVideo}
                title="Open New Video"
                className="p-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-rose/40 text-slate-300 hover:text-white transition-all text-xs"
              >
                <RefreshCw className="w-4 h-4 text-bio-rose" />
              </button>
            </>
          )}

          {/* Instructions Guide */}
          <button
            onClick={onOpenInstructions}
            title="User Guide & YouTube Instructions"
            className="p-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-cyan/40 text-slate-300 hover:text-white transition-all text-xs"
          >
            <BookOpen className="w-4 h-4 text-bio-cyan" />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="p-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-emerald/40 text-slate-300 hover:text-white transition-all text-xs"
          >
            <HelpCircle className="w-4 h-4 text-bio-emerald" />
          </button>

          <div className="w-px h-5 bg-bio-border mx-0.5" />

          {/* User Profile & Firebase Auth Menu */}
          <UserProfileMenu
            onOpenAuth={onOpenAuth}
            onOpenPublish={onOpenPublish}
            onFilterMyVideos={() => onSelectView('gallery')}
          />
        </div>
      </div>
    </header>
  );
};
