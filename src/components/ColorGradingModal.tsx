import React from 'react';
import {
  X,
  Sliders,
  Palette,
  RotateCcw,
  Sparkles,
  Check,
  Eye,
  Sun,
  Contrast,
  Droplet,
} from 'lucide-react';
import { VideoAdjustments, VideoFilterPreset } from '../types';
import { FILTER_PRESETS } from '../utils/videoFilterEngine';

interface ColorGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: VideoAdjustments;
  onChangeAdjustments: (adj: VideoAdjustments) => void;
  onReset: () => void;
}

export const ColorGradingModal: React.FC<ColorGradingModalProps> = ({
  isOpen,
  onClose,
  adjustments,
  onChangeAdjustments,
  onReset,
}) => {
  if (!isOpen) return null;

  const handlePresetSelect = (preset: VideoFilterPreset) => {
    onChangeAdjustments({
      ...adjustments,
      filter: preset,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-bio-card/95 border border-bio-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bio-cyan via-bio-emerald to-bio-purple" />

        {/* Header */}
        <div className="p-5 border-b border-bio-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bio-surface border border-bio-emerald/40 flex items-center justify-center text-bio-emerald shadow-lg shadow-bio-emerald/10">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Color Grading & Film LUTs
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30">
                  GPU Accelerated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Adobe Premiere & Canva inspired cinematic color grading and live film presets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bio-surface/80 hover:bg-bio-surface text-slate-400 hover:text-white border border-bio-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset LUT Cards */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider">
              Cinematic LUT Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FILTER_PRESETS.map((p) => {
                const isSelected = adjustments.filter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePresetSelect(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-bio-emerald/15 border-bio-emerald shadow-md shadow-bio-emerald/10'
                        : 'bg-bio-surface/50 border-bio-border/60 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-bio-emerald" />}
                    </div>
                    <span className="text-[10px] text-bio-cyan font-mono block mb-1">{p.badge}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{p.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Precision Fine-Tuning Sliders */}
          <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 space-y-4">
            <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              Fine-Tuning Controls
            </span>

            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(adjustments.brightness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={adjustments.brightness}
                onChange={(e) =>
                  onChangeAdjustments({ ...adjustments, brightness: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-bio-surface rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-bio-cyan" /> Contrast
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(adjustments.contrast * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={adjustments.contrast}
                onChange={(e) =>
                  onChangeAdjustments({ ...adjustments, contrast: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-bio-surface rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-bio-purple" /> Saturation
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(adjustments.saturation * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={adjustments.saturation}
                onChange={(e) =>
                  onChangeAdjustments({ ...adjustments, saturation: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-bio-surface rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Vignette Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-bio-border/40">
              <span className="text-xs text-slate-300">Film Vignette (Soft Corner Shadow)</span>
              <button
                type="button"
                onClick={() => onChangeAdjustments({ ...adjustments, vignette: !adjustments.vignette })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  adjustments.vignette ? 'bg-bio-emerald' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    adjustments.vignette ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-bio-border/60 flex items-center justify-between">
          <button
            onClick={onReset}
            className="px-3.5 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-slate-950 font-bold text-xs shadow-lg shadow-bio-cyan/20 hover:opacity-95 transition-all"
          >
            Apply to Studio Viewport
          </button>
        </div>
      </div>
    </div>
  );
};
