import React, { useState } from 'react';
import {
  Play,
  Trash2,
  Copy,
  Clock,
  Eye,
  EyeOff,
  Check,
  Scissors,
  Download,
  Layers,
  ChevronRight,
  Filter,
  Sparkles,
  Clapperboard,
  Plus
} from 'lucide-react';
import { VideoSegment, CutMode, SEGMENT_COLORS } from '../types';
import { formatTime, parseTimeToSeconds } from '../utils/timeFormat';

interface SegmentsListProps {
  segments: VideoSegment[];
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<VideoSegment>) => void;
  onDeleteSegment: (id: string) => void;
  onDuplicateSegment: (id: string) => void;
  onPreviewSegment: (seg: VideoSegment) => void;
  cutMode: CutMode;
  onToggleCutMode: (mode: CutMode) => void;
  onOpenExportModal: () => void;
  onOpenOutroStudio?: () => void;
  isOutroEnabled?: boolean;
  totalKeptDuration: number;
}

export const SegmentsList: React.FC<SegmentsListProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  onUpdateSegment,
  onDeleteSegment,
  onDuplicateSegment,
  onPreviewSegment,
  cutMode,
  onToggleCutMode,
  onOpenExportModal,
  onOpenOutroStudio,
  isOutroEnabled = false,
  totalKeptDuration,
}) => {
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  const handleStartEditTime = (seg: VideoSegment) => {
    setEditingTimeId(seg.id);
    setStartInput(formatTime(seg.start));
    setEndInput(formatTime(seg.end));
  };

  const handleSaveEditTime = (segId: string) => {
    const parsedStart = parseTimeToSeconds(startInput);
    const parsedEnd = parseTimeToSeconds(endInput);

    if (parsedStart !== null && parsedEnd !== null && parsedEnd > parsedStart) {
      onUpdateSegment(segId, { start: parsedStart, end: parsedEnd });
    }
    setEditingTimeId(null);
  };

  return (
    <div className="flex flex-col w-full rounded-2xl bio-glass border border-bio-border p-4 shadow-xl">
      {/* Top Header & Cut Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-bio-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Portions & Slices</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-bio-surface text-slate-300 border border-bio-border">
                {segments.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Manage your video cuts, labels, and exact millisecond boundaries
            </p>
          </div>
        </div>

        {/* Mode Selector: Keep vs Remove */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bio-void border border-bio-border">
          <button
            onClick={() => onToggleCutMode('keep')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cutMode === 'keep'
                ? 'bg-bio-emerald text-bio-void shadow-bio-emerald font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Keep Portions</span>
          </button>

          <button
            onClick={() => onToggleCutMode('remove')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cutMode === 'remove'
                ? 'bg-bio-rose text-white font-bold shadow-lg shadow-bio-rose/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ripple delete: Remove portions and keep the rest"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Remove Portions</span>
          </button>
        </div>
      </div>

      {/* Segments Items List */}
      <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {segments.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center text-slate-500">
            <Scissors className="w-8 h-8 mb-2 opacity-40 text-bio-emerald animate-bounce" />
            <p className="text-xs">No portions created yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Press <kbd className="px-1.5 py-0.5 bg-bio-surface rounded border border-bio-border text-slate-300">S</kbd> to split at current time or <kbd className="px-1.5 py-0.5 bg-bio-surface rounded border border-bio-border text-slate-300">[</kbd> and <kbd className="px-1.5 py-0.5 bg-bio-surface rounded border border-bio-border text-slate-300">]</kbd> to mark in/out.
            </p>
          </div>
        ) : (
          segments.map((seg, idx) => {
            const isSelected = seg.id === selectedSegmentId;
            const duration = Math.max(0, seg.end - seg.start);
            const isEditing = editingTimeId === seg.id;

            return (
              <div
                key={seg.id}
                onClick={() => onSelectSegment(seg.id)}
                className={`relative rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-bio-surface/90 border-bio-emerald shadow-bio-emerald'
                    : 'bg-bio-card/70 hover:bg-bio-surface/50 border-bio-border'
                } ${!seg.enabled ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Left: Color dot, Name input & Duration badge */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Color Picker / Indicator */}
                    <div className="relative group/color">
                      <div
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-bio-void shadow"
                        style={{ backgroundColor: seg.color }}
                      />
                      {/* Color flyout */}
                      <div className="absolute left-0 top-full mt-1 hidden group-hover/color:flex p-1 bg-bio-card border border-bio-border rounded-lg shadow-xl z-50 gap-1">
                        {SEGMENT_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateSegment(seg.id, { color: c });
                            }}
                            className="w-4 h-4 rounded-full hover:scale-125 transition-transform"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Title Input */}
                    <input
                      type="text"
                      value={seg.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateSegment(seg.id, { name: e.target.value })}
                      placeholder={`Portion ${idx + 1}`}
                      className="bg-transparent hover:bg-bio-void focus:bg-bio-void px-2 py-0.5 rounded text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-bio-emerald border border-transparent hover:border-bio-border/50 max-w-[150px] truncate"
                    />

                    {/* Duration Badge */}
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-bio-void border border-bio-border text-bio-cyan font-semibold">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right: Actions (Preview, Duplicate, Delete, Enable/Disable) */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Preview Button */}
                    <button
                      onClick={() => onPreviewSegment(seg)}
                      className="p-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-emerald/40 text-slate-300 hover:text-bio-emerald transition-all"
                      title="Preview this portion"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Duplicate Button */}
                    <button
                      onClick={() => onDuplicateSegment(seg.id)}
                      className="p-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-400 hover:text-white transition-all"
                      title="Duplicate portion"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Active Button */}
                    <button
                      onClick={() => onUpdateSegment(seg.id, { enabled: !seg.enabled })}
                      className={`p-1.5 rounded-lg border transition-all ${
                        seg.enabled
                          ? 'bg-bio-surface text-bio-emerald border-bio-emerald/30'
                          : 'bg-bio-void text-slate-600 border-bio-border'
                      }`}
                      title={seg.enabled ? 'Include in export' : 'Exclude from export'}
                    >
                      {seg.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteSegment(seg.id)}
                      className="p-1.5 rounded-lg bg-bio-surface hover:bg-bio-rose/20 border border-bio-border hover:border-bio-rose/40 text-slate-400 hover:text-bio-rose transition-all"
                      title="Delete portion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom: In / Out timestamps */}
                <div className="mt-2.5 pt-2 border-t border-bio-border/40 flex items-center justify-between text-xs font-mono">
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">IN:</span>
                        <input
                          type="text"
                          value={startInput}
                          onChange={(e) => setStartInput(e.target.value)}
                          className="w-20 px-1.5 py-0.5 rounded bg-bio-void border border-bio-emerald/40 text-[11px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">OUT:</span>
                        <input
                          type="text"
                          value={endInput}
                          onChange={(e) => setEndInput(e.target.value)}
                          className="w-20 px-1.5 py-0.5 rounded bg-bio-void border border-bio-cyan/40 text-[11px] text-white focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEditTime(seg.id)}
                        className="px-2 py-0.5 rounded bg-bio-emerald text-bio-void font-bold text-[10px]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditTime(seg);
                      }}
                      title="Click to edit In/Out time manually"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">IN:</span>
                        <span className="text-bio-emerald font-semibold">{formatTime(seg.start)}</span>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">OUT:</span>
                        <span className="text-bio-cyan font-semibold">{formatTime(seg.end)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 underline ml-2">Edit</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Outro Ending Scene Quick Access Banner */}
      {onOpenOutroStudio && (
        <div
          onClick={onOpenOutroStudio}
          className={`mt-3 p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
            isOutroEnabled
              ? 'bg-bio-violet/15 border-bio-violet shadow-bio-violet'
              : 'bg-bio-surface/60 hover:bg-bio-surface border-bio-border hover:border-bio-violet/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              isOutroEnabled ? 'bg-bio-violet text-white border-bio-violet' : 'bg-bio-void text-bio-violet border-bio-border'
            }`}>
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Final Scene / Outro</span>
                {isOutroEnabled && (
                  <span className="px-1.5 py-0.2 rounded-full bg-bio-violet text-white text-[9px] font-mono">
                    ACTIVE
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-400">
                {isOutroEnabled
                  ? 'Ending scene will be automatically attached on export'
                  : 'Add your own final few seconds clip or bio-card'}
              </p>
            </div>
          </div>
          <span className="text-xs text-bio-violet font-semibold hover:underline">
            {isOutroEnabled ? 'Edit' : 'Configure'}
          </span>
        </div>
      )}

      {/* Bottom Summary Bar & Export Action Button */}
      <div className="mt-4 pt-3 border-t border-bio-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Total Duration:</span>
          <span className="font-mono font-bold text-bio-emerald">
            {formatTime(totalKeptDuration)}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Mode:</span>
          <span className={`font-semibold ${cutMode === 'keep' ? 'text-bio-emerald' : 'text-bio-rose'}`}>
            {cutMode === 'keep' ? 'Keep Portions' : 'Ripple Cut'}
          </span>
        </div>

        <button
          onClick={onOpenExportModal}
          disabled={segments.length === 0}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Export Video Cuts</span>
        </button>
      </div>
    </div>
  );
};
