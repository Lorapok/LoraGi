import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoSegment } from '../types';
import { formatTime, clamp } from '../utils/timeFormat';
import { ZoomIn, ZoomOut, Maximize, Scissors, Plus } from 'lucide-react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: VideoSegment[];
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<VideoSegment>) => void;
  onAddSegment: () => void;
  onSeek: (time: number) => void;
  videoSrc: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  segments,
  selectedSegmentId,
  onSelectSegment,
  onUpdateSegment,
  onAddSegment,
  onSeek,
  videoSrc,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false);

  // Dragging state: 'playhead' | 'start' | 'end' | 'body'
  const [dragState, setDragState] = useState<{
    type: 'playhead' | 'start' | 'end' | 'body';
    segmentId?: string;
    initialMouseX: number;
    initialStart?: number;
    initialEnd?: number;
  } | null>(null);

  // Generate lightweight thumbnails for visual filmstrip
  useEffect(() => {
    if (!videoSrc || duration <= 0) return;

    let isCancelled = false;
    const generateFilmstrip = async () => {
      setIsGeneratingThumbs(true);
      const thumbsCount = 12;
      const extracted: string[] = [];

      try {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;

        await new Promise((res) => {
          video.onloadedmetadata = () => res(true);
          video.onerror = () => res(false);
        });

        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 68;
        const ctx = canvas.getContext('2d');

        for (let i = 0; i < thumbsCount; i++) {
          if (isCancelled) break;
          const targetTime = (i / (thumbsCount - 1 || 1)) * duration;
          video.currentTime = targetTime;

          await new Promise((res) => {
            video.onseeked = () => {
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                extracted.push(canvas.toDataURL('image/jpeg', 0.5));
              }
              res(true);
            };
          });
        }

        if (!isCancelled) {
          setThumbnails(extracted);
        }
      } catch {
        // Handled silently
      } finally {
        if (!isCancelled) setIsGeneratingThumbs(false);
      }
    };

    generateFilmstrip();

    return () => {
      isCancelled = true;
    };
  }, [videoSrc, duration]);

  // Convert mouse X to time
  const getTimeFromMouseX = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const ratio = clamp(relativeX / rect.width, 0, 1);
      return ratio * duration;
    },
    [duration]
  );

  // Mouse Move on Track (Hover preview & Dragging)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragState) {
        const currentMouseTime = getTimeFromMouseX(e.clientX);

        if (dragState.type === 'playhead') {
          onSeek(currentMouseTime);
        } else if (dragState.segmentId) {
          const seg = segments.find((s) => s.id === dragState.segmentId);
          if (!seg) return;

          if (dragState.type === 'start') {
            const newStart = clamp(currentMouseTime, 0, seg.end - 0.1);
            onUpdateSegment(dragState.segmentId, { start: newStart });
            onSeek(newStart);
          } else if (dragState.type === 'end') {
            const newEnd = clamp(currentMouseTime, seg.start + 0.1, duration);
            onUpdateSegment(dragState.segmentId, { end: newEnd });
            onSeek(newEnd);
          } else if (dragState.type === 'body') {
            const initialMouseTime = getTimeFromMouseX(dragState.initialMouseX);
            const delta = currentMouseTime - initialMouseTime;
            const segDuration = (dragState.initialEnd || seg.end) - (dragState.initialStart || seg.start);

            let newStart = (dragState.initialStart || seg.start) + delta;
            let newEnd = newStart + segDuration;

            if (newStart < 0) {
              newStart = 0;
              newEnd = segDuration;
            } else if (newEnd > duration) {
              newEnd = duration;
              newStart = duration - segDuration;
            }

            onUpdateSegment(dragState.segmentId, { start: newStart, end: newEnd });
            onSeek(newStart);
          }
        }
      } else {
        // Just hovering
        if (trackRef.current) {
          const rect = trackRef.current.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          if (relX >= 0 && relX <= rect.width) {
            setHoverX(relX);
            setHoverTime(clamp((relX / rect.width) * duration, 0, duration));
          } else {
            setHoverTime(null);
          }
        }
      }
    },
    [dragState, getTimeFromMouseX, onSeek, segments, onUpdateSegment, duration]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Click on Track directly
  const handleTrackClick = (e: React.MouseEvent) => {
    // If not dragging, seek to clicked position
    if (!dragState) {
      const time = getTimeFromMouseX(e.clientX);
      onSeek(time);
    }
  };

  // Time ticks calculation
  const tickCount = Math.max(5, Math.floor(10 * zoom));
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => (i / tickCount) * duration);

  return (
    <div className="flex flex-col w-full rounded-2xl bio-glass border border-bio-border p-4 shadow-xl select-none">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bio-emerald" />
            Biological Filmstrip Timeline
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            ({segments.length} {segments.length === 1 ? 'Portion' : 'Portions'} defined)
          </span>
        </div>

        {/* Zoom and Add Segment Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddSegment}
            className="px-2.5 py-1 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-emerald/40 text-bio-emerald text-xs font-semibold flex items-center gap-1 transition-all"
            title="Add New Portion"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Portion</span>
          </button>

          <div className="h-4 w-px bg-bio-border" />

          {/* Zoom Buttons */}
          <div className="flex items-center bg-bio-surface rounded-lg border border-bio-border p-0.5">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 1))}
              disabled={zoom <= 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-bio-cyan font-bold">{zoom}x</span>
            <button
              onClick={() => setZoom(Math.min(6, zoom + 1))}
              disabled={zoom >= 6}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Timeline Area */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            setHoverX(relX);
            setHoverTime(clamp((relX / rect.width) * duration, 0, duration));
          }}
          onMouseLeave={() => setHoverTime(null)}
          className="relative h-28 rounded-xl bg-bio-void border border-bio-border cursor-pointer overflow-hidden transition-all"
          style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
        >
          {/* Filmstrip Background */}
          <div className="absolute inset-0 flex items-stretch opacity-35 filter brightness-75 pointer-events-none">
            {thumbnails.length > 0 ? (
              thumbnails.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`thumb-${i}`}
                  className="flex-1 h-full object-cover border-r border-bio-border/30"
                />
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                {isGeneratingThumbs ? 'Generating Filmstrip...' : 'Filmstrip Timeline'}
              </div>
            )}
          </div>

          {/* Time Ruler Ticks */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-between pointer-events-none border-b border-bio-border/40 bg-bio-card/60 backdrop-blur-sm z-10 px-1">
            {ticks.map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 pt-0.5">
                  {formatTime(t, false)}
                </span>
                <span className="w-px h-1.5 bg-slate-600" />
              </div>
            ))}
          </div>

          {/* Segments Overlays */}
          {duration > 0 &&
            segments.map((seg, idx) => {
              const startPercent = clamp((seg.start / duration) * 100, 0, 100);
              const endPercent = clamp((seg.end / duration) * 100, 0, 100);
              const widthPercent = Math.max(0.5, endPercent - startPercent);
              const isSelected = seg.id === selectedSegmentId;

              return (
                <div
                  key={seg.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSegment(seg.id);
                  }}
                  className={`absolute top-6 bottom-0 rounded-md transition-all group/seg z-20 ${
                    seg.enabled ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: `${seg.color}25`,
                    borderLeft: `3px solid ${seg.color}`,
                    borderRight: `3px solid ${seg.color}`,
                    boxShadow: isSelected ? `0 0 16px ${seg.color}60` : undefined,
                  }}
                >
                  {/* Segment Top Label */}
                  <div
                    className="absolute top-1 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-bio-void/90 border border-bio-border text-[10px] font-mono text-white pointer-events-none truncate max-w-[90%]"
                    style={{ borderColor: seg.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="font-semibold">{seg.name || `P${idx + 1}`}</span>
                    <span className="text-slate-400 text-[9px]">({formatTime(seg.end - seg.start, false)})</span>
                  </div>

                  {/* Left Drag Handle (Start Time) */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectSegment(seg.id);
                      setDragState({
                        type: 'start',
                        segmentId: seg.id,
                        initialMouseX: e.clientX,
                        initialStart: seg.start,
                        initialEnd: seg.end,
                      });
                    }}
                    className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 flex items-center justify-center transition-colors z-30"
                    title="Drag to adjust Start time"
                  >
                    <div className="w-1 h-6 rounded-full bg-white shadow-md" />
                  </div>

                  {/* Center Body Drag Area (Move entire segment) */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectSegment(seg.id);
                      setDragState({
                        type: 'body',
                        segmentId: seg.id,
                        initialMouseX: e.clientX,
                        initialStart: seg.start,
                        initialEnd: seg.end,
                      });
                    }}
                    className="absolute inset-x-3 top-0 bottom-0 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                    title="Drag to reposition portion"
                  />

                  {/* Right Drag Handle (End Time) */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectSegment(seg.id);
                      setDragState({
                        type: 'end',
                        segmentId: seg.id,
                        initialMouseX: e.clientX,
                        initialStart: seg.start,
                        initialEnd: seg.end,
                      });
                    }}
                    className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 flex items-center justify-center transition-colors z-30"
                    title="Drag to adjust End time"
                  >
                    <div className="w-1 h-6 rounded-full bg-white shadow-md" />
                  </div>
                </div>
              );
            })}

          {/* Hover Time Indicator & Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute top-0 bottom-0 w-px bg-white/60 pointer-events-none z-30 flex flex-col items-center"
              style={{ left: `${hoverX}px` }}
            >
              <div className="absolute top-1 px-1.5 py-0.5 rounded bg-bio-surface border border-bio-border text-[9px] font-mono text-white shadow-lg -translate-x-1/2">
                {formatTime(hoverTime)}
              </div>
            </div>
          )}

          {/* Playhead Needle */}
          {duration > 0 && (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setDragState({
                  type: 'playhead',
                  initialMouseX: e.clientX,
                });
              }}
              className="absolute top-0 bottom-0 w-1 bg-bio-emerald cursor-ew-resize shadow-bio-emerald z-40 flex flex-col items-center -translate-x-1/2 group/playhead"
              style={{ left: `${clamp((currentTime / duration) * 100, 0, 100)}%` }}
            >
              {/* Playhead Top Knob */}
              <div className="w-3.5 h-3.5 rounded-full bg-bio-emerald border-2 border-bio-void shadow-lg transform -translate-y-1 group-hover/playhead:scale-125 transition-transform" />
              {/* Vertical line pulse */}
              <div className="w-full flex-1 bg-gradient-to-b from-bio-emerald via-bio-cyan to-bio-emerald opacity-90" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
