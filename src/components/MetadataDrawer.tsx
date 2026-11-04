import React from 'react';
import { X, Film, Info, HardDrive, Clock, Ratio, Zap } from 'lucide-react';
import { VideoMetadata } from '../types';
import { formatTime, formatFileSize } from '../utils/timeFormat';

interface MetadataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: VideoMetadata | null;
  totalSegmentsCount: number;
  totalKeptDuration: number;
}

export const MetadataDrawer: React.FC<MetadataDrawerProps> = ({
  isOpen,
  onClose,
  metadata,
  totalSegmentsCount,
  totalKeptDuration,
}) => {
  if (!isOpen || !metadata) return null;

  const originalDuration = metadata.duration || 1;
  const removedDuration = Math.max(0, originalDuration - totalKeptDuration);
  const reductionPercent = Math.round((removedDuration / originalDuration) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-bio-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Video Technical Inspector</h3>
              <p className="text-xs text-slate-400">Stream & Container Metadata</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3">
          {/* File Name */}
          <div className="p-3 rounded-xl bg-bio-void/60 border border-bio-border">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">File Name</span>
            <p className="text-xs font-semibold text-white truncate mt-0.5">{metadata.name}</p>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-bio-void/60 border border-bio-border">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Resolution</span>
              <p className="text-xs font-mono font-bold text-bio-cyan mt-0.5">
                {metadata.width} × {metadata.height}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-bio-void/60 border border-bio-border">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Aspect Ratio</span>
              <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">{metadata.aspectRatio}</p>
            </div>

            <div className="p-3 rounded-xl bg-bio-void/60 border border-bio-border">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Original Length</span>
              <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                {formatTime(metadata.duration)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-bio-void/60 border border-bio-border">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">File Size</span>
              <p className="text-xs font-mono font-bold text-bio-amber mt-0.5">
                {formatFileSize(metadata.size)}
              </p>
            </div>
          </div>

          {/* Slice Efficiency Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-bio-surface to-bio-card border border-bio-emerald/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-bio-emerald" />
                <span>Estimated Trim Savings</span>
              </span>
              <span className="font-mono font-bold text-bio-emerald">{reductionPercent}% trimmed</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Retaining {formatTime(totalKeptDuration)} across {totalSegmentsCount} cut portions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-bio-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-xs font-semibold text-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
