import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clapperboard,
  Sparkles,
  Upload,
  Play,
  Pause,
  Check,
  Palette,
  Clock,
  Video
} from 'lucide-react';
import { OutroConfig, SEGMENT_COLORS } from '../types';
import { drawBioOutroFrame } from '../utils/outroRenderer';

interface OutroStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OutroConfig;
  onSaveConfig: (newConfig: OutroConfig) => void;
}

export const OutroStudioModal: React.FC<OutroStudioModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<OutroConfig>(config);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Live Canvas Animation for Bio Card
  useEffect(() => {
    if (!isOpen || localConfig.type !== 'bio_card') return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = Date.now();

    const loop = () => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const totalSec = localConfig.durationSeconds || 3;

      // Loop animation
      const loopTime = elapsedSec % (totalSec + 0.5);

      drawBioOutroFrame(ctx, canvas.width, canvas.height, loopTime, totalSec, localConfig);

      if (isPreviewPlaying) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, localConfig, isPreviewPlaying]);

  if (!isOpen) return null;

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);

      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        setLocalConfig({
          ...localConfig,
          type: 'custom_video',
          videoFile: file,
          videoSrc: url,
          duration: tempVideo.duration || 3,
        });
      };
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-bio-violet/15 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-violet/10 text-bio-violet border border-bio-violet/20">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Outro & Ending Scene Studio</h3>
              <p className="text-xs text-slate-400">Append a custom branding or ending scene to your sliced video</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1 pr-1">
          {/* Enable / Disable Outro Toggle */}
          <div className="p-4 rounded-2xl bg-bio-void/80 border border-bio-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Append Ending Scene on Export</span>
              <span className="text-[11px] text-slate-400">
                Smoothly stitches your outro after all selected video cuts
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                localConfig.enabled ? 'bg-bio-emerald' : 'bg-bio-surface'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  localConfig.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {localConfig.enabled && (
            <>
              {/* Outro Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, type: 'bio_card' })}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    localConfig.type === 'bio_card'
                      ? 'bg-bio-surface border-bio-violet text-white shadow-bio-violet'
                      : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-bio-violet shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">Bio-Digital Outro Card</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Animated cybernetic title, credits & logo pulse
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, type: 'custom_video' })}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    localConfig.type === 'custom_video'
                      ? 'bg-bio-surface border-bio-cyan text-white shadow-bio-cyan'
                      : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-5 h-5 text-bio-cyan shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">Upload Custom Clip</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Append your own MP4/WebM video ending clip
                    </p>
                  </div>
                </button>
              </div>

              {/* Mode 1: Bio-Card Settings & Live Preview */}
              {localConfig.type === 'bio_card' ? (
                <div className="space-y-4">
                  {/* Live Canvas Preview */}
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-bio-border aspect-video max-h-52 w-full flex items-center justify-center">
                    <canvas
                      ref={previewCanvasRef}
                      width={640}
                      height={360}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-bio-void/80 text-[10px] font-mono text-bio-violet border border-bio-violet/40">
                      LIVE PREVIEW
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Title / Main Text
                      </label>
                      <input
                        type="text"
                        value={localConfig.title}
                        onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                        placeholder="Created with LoraGi"
                        className="w-full px-3 py-2 rounded-xl bg-bio-void border border-bio-border text-xs text-white focus:outline-none focus:border-bio-violet"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Subtitle / Credits
                      </label>
                      <input
                        type="text"
                        value={localConfig.subtitle}
                        onChange={(e) => setLocalConfig({ ...localConfig, subtitle: e.target.value })}
                        placeholder="Lorapok Labs • Open-Source"
                        className="w-full px-3 py-2 rounded-xl bg-bio-void border border-bio-border text-xs text-white focus:outline-none focus:border-bio-violet"
                      />
                    </div>
                  </div>

                  {/* Duration Slider and Color Palette */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Outro Duration</span>
                        <span className="text-bio-violet font-mono font-bold">{localConfig.durationSeconds}s</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="0.5"
                        value={localConfig.durationSeconds}
                        onChange={(e) => setLocalConfig({ ...localConfig, durationSeconds: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-bio-surface rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Theme Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        {SEGMENT_COLORS.slice(0, 5).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setLocalConfig({ ...localConfig, themeColor: color })}
                            className={`w-6 h-6 rounded-full transition-transform ${
                              localConfig.themeColor === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode 2: Custom Video Clip Upload */
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleCustomVideoUpload}
                  />

                  {localConfig.videoSrc ? (
                    <div className="p-3 rounded-2xl bg-bio-void border border-bio-border space-y-2">
                      <video
                        src={localConfig.videoSrc}
                        controls
                        className="w-full rounded-xl max-h-48 bg-black object-contain"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold truncate max-w-[200px]">
                          {localConfig.videoFile?.name || 'Custom Outro Clip'}
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-[11px] text-bio-cyan"
                        >
                          Change Video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 rounded-2xl border-2 border-dashed border-bio-border hover:border-bio-cyan text-center cursor-pointer bg-bio-void/60 hover:bg-bio-surface/40 transition-all"
                    >
                      <Upload className="w-8 h-8 text-bio-cyan mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">Click to upload your ending scene clip</p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports MP4, WebM, MOV</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-bio-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-bio-violet to-bio-cyan text-white font-bold text-xs tracking-wide shadow-bio-violet hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Outro Scene</span>
          </button>
        </div>
      </div>
    </div>
  );
};
