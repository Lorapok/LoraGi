import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Eraser,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Play,
  Pause,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ObjectRemovalMask } from '../types';
import { applyObjectRemovalToCanvas } from '../utils/objectRemovalProcessor';
import { formatTime } from '../utils/timeFormat';

interface ObjectRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string | null;
  duration: number;
  currentTime: number;
  activeMasks: ObjectRemovalMask[];
  onSaveMasks: (masks: ObjectRemovalMask[]) => void;
}

export const ObjectRemovalModal: React.FC<ObjectRemovalModalProps> = ({
  isOpen,
  onClose,
  videoSrc,
  duration,
  currentTime,
  activeMasks,
  onSaveMasks,
}) => {
  const [masks, setMasks] = useState<ObjectRemovalMask[]>(activeMasks);
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(
    activeMasks[0]?.id || null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [previewBeforeAfter, setPreviewBeforeAfter] = useState<boolean>(true); // true = show inpaint, false = original
  const [playheadTime, setPlayheadTime] = useState<number>(currentTime);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMasks(activeMasks);
    if (activeMasks.length > 0 && !selectedMaskId) {
      setSelectedMaskId(activeMasks[0].id);
    }
  }, [activeMasks, isOpen]);

  // Sync canvas with video frame and render inpainting
  const renderFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    // 1. Draw raw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. If inpainting preview is enabled, apply object removal
    if (previewBeforeAfter) {
      applyObjectRemovalToCanvas(ctx, canvas.width, canvas.height, masks, video.currentTime);
    }

    // 3. Draw active bounding boxes for visual editing
    for (const mask of masks) {
      if (!mask.enabled) continue;
      const isSelected = mask.id === selectedMaskId;
      const rx = (mask.x / 100) * canvas.width;
      const ry = (mask.y / 100) * canvas.height;
      const rw = (mask.width / 100) * canvas.width;
      const rh = (mask.height / 100) * canvas.height;

      ctx.save();
      ctx.strokeStyle = isSelected ? '#00f5a0' : '#00d2ff';
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.setLineDash(isSelected ? [6, 4] : [4, 4]);
      ctx.strokeRect(rx, ry, rw, rh);

      // Label badge
      ctx.fillStyle = isSelected ? '#00f5a0' : '#00d2ff';
      ctx.fillRect(rx, Math.max(0, ry - 20), 80, 18);
      ctx.fillStyle = '#030712';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(mask.name, rx + 4, Math.max(12, ry - 7));
      ctx.restore();
    }
  };

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrame();
      animId = requestAnimationFrame(loop);
    };
    if (isOpen) {
      loop();
    }
    return () => cancelAnimationFrame(animId);
  }, [isOpen, masks, previewBeforeAfter, selectedMaskId]);

  if (!isOpen) return null;

  // Handle drawing new bounding box on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) {
      setIsDrawing(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const curX = ((e.clientX - rect.left) / rect.width) * 100;
    const curY = ((e.clientY - rect.top) / rect.height) * 100;

    const minX = Math.min(drawStart.x, curX);
    const minY = Math.min(drawStart.y, curY);
    const w = Math.abs(curX - drawStart.x);
    const h = Math.abs(curY - drawStart.y);

    setIsDrawing(false);
    setDrawStart(null);

    // Minimum size check (must be at least 3% width and height)
    if (w > 2 && h > 2) {
      const newMask: ObjectRemovalMask = {
        id: `mask-${Date.now()}`,
        name: `Object #${masks.length + 1}`,
        x: Math.max(0, minX),
        y: Math.max(0, minY),
        width: Math.min(100 - minX, w),
        height: Math.min(100 - minY, h),
        method: 'content_aware',
        featherRadius: 8,
        startSec: 0,
        endSec: duration || 60,
        enabled: true,
      };
      setMasks([...masks, newMask]);
      setSelectedMaskId(newMask.id);
    }
  };

  const selectedMask = masks.find((m) => m.id === selectedMaskId);

  const updateSelectedMask = (patch: Partial<ObjectRemovalMask>) => {
    if (!selectedMaskId) return;
    setMasks((prev) =>
      prev.map((m) => (m.id === selectedMaskId ? { ...m, ...patch } : m))
    );
  };

  const deleteMask = (id: string) => {
    const remaining = masks.filter((m) => m.id !== id);
    setMasks(remaining);
    setSelectedMaskId(remaining[0]?.id || null);
  };

  const handleSave = () => {
    onSaveMasks(masks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-bio-emerald/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-bio-cyan/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
              <Eraser className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">AI Video Object Removal Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-bio-emerald/10 border border-bio-emerald/20 text-bio-emerald text-[10px] font-mono font-bold">
                  Inpainting Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click & drag on the video frame to erase watermarks, microphones, unwanted people, or artifacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body: Canvas Left (7 cols), Mask Inspector Right (5 cols) */}
        <div className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto flex-1 pr-1">
          {/* Left Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-bio-border shadow-xl">
              <video
                ref={videoRef}
                src={videoSrc || ''}
                className="hidden"
                crossOrigin="anonymous"
                playsInline
                muted
                onTimeUpdate={() => {
                  if (videoRef.current) setPlayheadTime(videoRef.current.currentTime);
                }}
              />
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseUp={handleCanvasMouseUp}
                className="w-full h-full object-contain cursor-crosshair select-none"
              />

              {/* Inpaint / Original Toggle Button in Corner */}
              <button
                type="button"
                onClick={() => setPreviewBeforeAfter(!previewBeforeAfter)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-bio-void/80 hover:bg-bio-void border border-bio-border text-[11px] font-bold text-white flex items-center gap-1.5 backdrop-blur-md shadow transition-all"
              >
                {previewBeforeAfter ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-bio-emerald" />
                    <span>Inpainted (AI)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-bio-rose" />
                    <span>Original Raw</span>
                  </>
                )}
              </button>
            </div>

            {/* Video Scrubber & Play Controller */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-bio-surface/50 border border-bio-border text-xs">
              <button
                type="button"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  if (v.paused) v.play();
                  else v.pause();
                }}
                className="p-1.5 rounded-lg bg-bio-void hover:bg-bio-surface text-bio-emerald"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
              <span className="font-mono text-[11px] text-slate-300">
                {formatTime(playheadTime)} / {formatTime(duration)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.05}
                value={playheadTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlayheadTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="flex-1 accent-bio-emerald cursor-pointer"
              />
            </div>
          </div>

          {/* Right Mask Controller */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Masks List */}
            <div className="p-3.5 rounded-2xl bg-bio-surface/60 border border-bio-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-bio-cyan" />
                  <span>Removal Masks ({masks.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Click canvas to add</span>
              </div>

              {masks.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-bio-border rounded-xl text-slate-400 text-xs">
                  Drag a box on the video frame to select an object.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {masks.map((mask) => (
                    <div
                      key={mask.id}
                      onClick={() => setSelectedMaskId(mask.id)}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-all ${
                        mask.id === selectedMaskId
                          ? 'bg-bio-emerald/15 border-bio-emerald text-white'
                          : 'bg-bio-void/60 border-bio-border text-slate-300 hover:bg-bio-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={mask.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            setMasks(
                              masks.map((m) =>
                                m.id === mask.id ? { ...m, enabled: e.target.checked } : m
                              )
                            );
                          }}
                          className="accent-bio-emerald"
                        />
                        <span className="text-xs font-semibold">{mask.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({mask.method === 'content_aware' ? 'AI Inpaint' : mask.method === 'smart_blur' ? 'Blur' : 'Patch'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMask(mask.id);
                        }}
                        className="p-1 text-slate-400 hover:text-bio-rose"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Mask Properties Inspector */}
            {selectedMask && (
              <div className="p-4 rounded-2xl bg-bio-surface/60 border border-bio-border space-y-3.5 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-bio-emerald" />
                  <span>Inpainting Settings ({selectedMask.name})</span>
                </h4>

                {/* Method Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Inpainting Algorithm
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'content_aware', label: 'AI Diffusion' },
                      { id: 'smart_blur', label: 'Smart Blur' },
                      { id: 'background_patch', label: 'BG Patch' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateSelectedMask({ method: m.id as any })}
                        className={`p-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                          selectedMask.method === m.id
                            ? 'bg-bio-emerald/20 border-bio-emerald text-bio-emerald font-bold'
                            : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feather Softness Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Feather Edge Softness
                    </label>
                    <span className="text-[10px] font-mono text-bio-cyan">
                      {selectedMask.featherRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={25}
                    value={selectedMask.featherRadius}
                    onChange={(e) =>
                      updateSelectedMask({ featherRadius: parseInt(e.target.value) })
                    }
                    className="w-full accent-bio-cyan"
                  />
                </div>

                {/* Duration Range (StartSec - EndSec) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Active Time Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Start (s)</span>
                      <input
                        type="number"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={selectedMask.startSec}
                        onChange={(e) =>
                          updateSelectedMask({ startSec: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-bio-void/80 border border-bio-border text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">End (s)</span>
                      <input
                        type="number"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={selectedMask.endSec}
                        onChange={(e) =>
                          updateSelectedMask({ endSec: parseFloat(e.target.value) || duration })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-bio-void/80 border border-bio-border text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-bio-border flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 text-bio-emerald">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Real-time in-browser inpainting</span>
          </span>

          <div className="flex items-center gap-2">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Object Removal ({masks.filter((m) => m.enabled).length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
