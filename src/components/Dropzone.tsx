import React, { useState, useRef } from 'react';
import { Upload, Film, ShieldCheck, Zap, Sparkles, PlayCircle, Link as LinkIcon, BookOpen } from 'lucide-react';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface DropzoneProps {
  onVideoSelected: (file: File) => void;
  onLoadSample: () => void;
  onOpenUrlImport: () => void;
  onOpenInstructions?: () => void;
  isLoadingSample?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onVideoSelected,
  onLoadSample,
  onOpenUrlImport,
  onOpenInstructions,
  isLoadingSample = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoSelected(file);
      } else {
        alert('Please drop a valid video file (MP4, WebM, MOV, MKV, etc.).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onVideoSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Bio-Digital Main Drop Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl p-8 sm:p-14 border-2 border-dashed transition-all duration-300 text-center ${
          isDragging
            ? 'border-bio-emerald bg-bio-emerald/10 shadow-bio-emerald scale-[1.01]'
            : 'border-bio-border hover:border-bio-cyan/50 bg-bio-card/60 hover:bg-bio-card/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Ambient Biological Glow Background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-bio-emerald/10 blur-3xl pointer-events-none group-hover:bg-bio-emerald/20 transition-all" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-bio-cyan/10 blur-3xl pointer-events-none group-hover:bg-bio-cyan/20 transition-all" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Central Icon Container */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-bio-surface to-bio-card border border-bio-border flex items-center justify-center shadow-lg group-hover:border-bio-emerald/50 group-hover:shadow-bio-emerald transition-all duration-300">
              <Upload className="w-9 h-9 text-bio-emerald group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-bio-emerald to-bio-cyan opacity-20 blur group-hover:opacity-60 transition-opacity" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Drop your video here or <span className="text-bio-emerald underline decoration-bio-emerald/40 underline-offset-4">Browse</span>
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mb-8 leading-relaxed">
            Slice, trim, and cut multiple portions with frame-level millisecond precision. Zero server uploads.
          </p>

          {/* Supported Formats Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {['MP4', 'WebM', 'MOV', 'MKV', 'AVI', 'M4V'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-bio-surface/80 border border-bio-border text-slate-300"
              >
                .{fmt}
              </span>
            ))}
          </div>

          {/* Action Button & Sample Video Option */}
          <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-sm tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              Choose File
            </button>

            <button
              onClick={onOpenUrlImport}
              className="px-5 py-3 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-cyan/40 text-bio-cyan font-bold text-sm tracking-wide shadow-bio-cyan hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Import YouTube / Flow Music</span>
            </button>

            <button
              onClick={onLoadSample}
              disabled={isLoadingSample}
              className="px-5 py-3 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-emerald/40 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoadingSample ? (
                <>
                  <Zap className="w-4 h-4 text-bio-amber animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 text-bio-emerald" />
                  Sample Video
                </>
              )}
            </button>

            {onOpenInstructions && (
              <button
                onClick={onOpenInstructions}
                className="px-5 py-3 rounded-xl bg-bio-surface/80 hover:bg-bio-surface border border-bio-border hover:border-bio-cyan/50 text-slate-300 hover:text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-bio-cyan" />
                <span>Instructions</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust & Feature Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="bio-glass-card p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">100% Private & Local</h4>
            <p className="text-[11px] text-slate-400">Processed entirely in your browser. Video never leaves your computer.</p>
          </div>
        </div>

        <div className="bio-glass-card p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Multi-Portion Slicing</h4>
            <p className="text-[11px] text-slate-400">Cut multiple parts at once. Export merged or as separate clips.</p>
          </div>
        </div>

        <div className="bio-glass-card p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-bio-violet/10 text-bio-violet border border-bio-violet/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Bio-Digital Architecture</h4>
            <p className="text-[11px] text-slate-400">Crafted with Lorapok Labs sensory tactile interface standards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
