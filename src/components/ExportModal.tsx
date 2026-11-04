import React, { useState } from 'react';
import {
  X,
  Download,
  Film,
  Archive,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoSegment, CutMode, ExportFormat, ExportQuality, ExportType } from '../types';
import {
  computeEffectiveIntervals,
  renderIntervalToBlob,
  renderMergedIntervalsToBlob,
  downloadBlob,
  exportPortionsToZip
} from '../utils/videoProcessor';
import { formatTime } from '../utils/timeFormat';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  duration: number;
  segments: VideoSegment[];
  cutMode: CutMode;
  fileName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videoSrc,
  duration,
  segments,
  cutMode,
  fileName,
}) => {
  const [exportType, setExportType] = useState<ExportType>('merged');
  const [format, setFormat] = useState<ExportFormat>('webm');
  const [quality, setQuality] = useState<ExportQuality>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const intervals = computeEffectiveIntervals(segments, duration, cutMode);
  const totalExportDuration = intervals.reduce((acc, curr) => acc + (curr.end - curr.start), 0);

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgressPercent(0);
    setErrorMessage(null);
    setIsFinished(false);

    try {
      const baseName = fileName.replace(/\.[^/.]+$/, '');

      if (exportType === 'merged') {
        setStatusMessage('Initializing merged video pipeline...');
        const mergedBlob = await renderMergedIntervalsToBlob(
          videoSrc,
          intervals,
          format,
          quality,
          (pct, part, total) => {
            setProgressPercent(Math.round(pct));
            setStatusMessage(`Rendering and stitching part ${part} of ${total} (${Math.round(pct)}%)...`);
          }
        );

        setStatusMessage('Generating download...');
        downloadBlob(mergedBlob, `${baseName}_merged`, format);
      } else if (exportType === 'separate') {
        const blobsToDownload: { blob: Blob; name: string }[] = [];

        for (let i = 0; i < intervals.length; i++) {
          const interval = intervals[i];
          const partNum = i + 1;
          setStatusMessage(`Rendering portion ${partNum} of ${intervals.length}: "${interval.name}"...`);

          const blob = await renderIntervalToBlob(
            videoSrc,
            interval,
            format,
            quality,
            (pct) => {
              const overallPct = Math.round(((i + pct / 100) / intervals.length) * 100);
              setProgressPercent(overallPct);
            }
          );

          blobsToDownload.push({
            blob,
            name: `${baseName}_cut_${partNum}_${interval.name.replace(/\s+/g, '_')}`
          });
        }

        setStatusMessage('Triggering downloads for all cut portions...');
        blobsToDownload.forEach((item) => {
          downloadBlob(item.blob, item.name, format);
        });
      } else if (exportType === 'zip') {
        const renderedPortions: { name: string; blob: Blob; format: ExportFormat }[] = [];

        for (let i = 0; i < intervals.length; i++) {
          const interval = intervals[i];
          const partNum = i + 1;
          setStatusMessage(`Rendering portion ${partNum} of ${intervals.length} for ZIP package...`);

          const blob = await renderIntervalToBlob(
            videoSrc,
            interval,
            format,
            quality,
            (pct) => {
              const overallPct = Math.round(((i + pct / 100) / intervals.length) * 100);
              setProgressPercent(overallPct);
            }
          );

          renderedPortions.push({
            name: interval.name,
            blob,
            format
          });
        }

        setStatusMessage('Compressing clips into ZIP archive...');
        await exportPortionsToZip(renderedPortions, `${baseName}_loragi_cuts.zip`);
      }

      setProgressPercent(100);
      setStatusMessage('Export completed successfully!');
      setIsFinished(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during video rendering.';
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-bio-emerald/15 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Video Portions</h3>
              <p className="text-xs text-slate-400">
                {intervals.length} {intervals.length === 1 ? 'portion' : 'portions'} • Total duration:{' '}
                <span className="font-mono text-bio-emerald">{formatTime(totalExportDuration)}</span>
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-5">
          {/* Export Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Export Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Merged */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setExportType('merged')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  exportType === 'merged'
                    ? 'bg-bio-surface border-bio-emerald text-white shadow-bio-emerald'
                    : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-5 h-5 mb-1 text-bio-emerald" />
                <span className="text-xs font-bold">Single Merged</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Stitch cuts together</span>
              </button>

              {/* Separate */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setExportType('separate')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  exportType === 'separate'
                    ? 'bg-bio-surface border-bio-cyan text-white shadow-bio-cyan'
                    : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-5 h-5 mb-1 text-bio-cyan" />
                <span className="text-xs font-bold">Separate Clips</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Individual video files</span>
              </button>

              {/* ZIP Bundle */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setExportType('zip')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  exportType === 'zip'
                    ? 'bg-bio-surface border-bio-violet text-white shadow-bio-violet'
                    : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Archive className="w-5 h-5 mb-1 text-bio-violet" />
                <span className="text-xs font-bold">ZIP Archive</span>
                <span className="text-[10px] text-slate-400 mt-0.5">All in one zip file</span>
              </button>
            </div>
          </div>

          {/* Format and Quality Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Output Format
              </label>
              <div className="flex rounded-lg bg-bio-void p-1 border border-bio-border">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFormat('webm')}
                  className={`flex-1 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                    format === 'webm' ? 'bg-bio-surface text-bio-emerald' : 'text-slate-400'
                  }`}
                >
                  WebM (VP9)
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFormat('mp4')}
                  className={`flex-1 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                    format === 'mp4' ? 'bg-bio-surface text-bio-cyan' : 'text-slate-400'
                  }`}
                >
                  MP4 / AVC
                </button>
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bitrate Quality
              </label>
              <div className="flex rounded-lg bg-bio-void p-1 border border-bio-border">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setQuality('high')}
                  className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all ${
                    quality === 'high' ? 'bg-bio-surface text-bio-emerald' : 'text-slate-400'
                  }`}
                >
                  High (8M)
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setQuality('original')}
                  className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all ${
                    quality === 'original' ? 'bg-bio-surface text-bio-cyan' : 'text-slate-400'
                  }`}
                >
                  Max (12M)
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar & Status Display */}
          {(isExporting || isFinished || errorMessage) && (
            <div className="p-4 rounded-2xl bg-bio-surface/80 border border-bio-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  {isExporting && <Loader2 className="w-3.5 h-3.5 text-bio-emerald animate-spin" />}
                  {isFinished && <CheckCircle2 className="w-4 h-4 text-bio-emerald" />}
                  {errorMessage && <AlertCircle className="w-4 h-4 text-bio-rose" />}
                  <span>{statusMessage}</span>
                </span>
                <span className="font-mono text-bio-cyan font-bold">{progressPercent}%</span>
              </div>

              {/* Glowing Progress Track */}
              <div className="w-full h-2 rounded-full bg-bio-void overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bio-emerald to-bio-cyan transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-bio-rose mt-1">{errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-bio-border">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-bio-surface transition-all"
          >
            {isFinished ? 'Close' : 'Cancel'}
          </button>

          {!isFinished ? (
            <button
              type="button"
              disabled={isExporting}
              onClick={handleStartExport}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Export</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsFinished(false);
                setProgressPercent(0);
                setStatusMessage('');
              }}
              className="px-5 py-2.5 rounded-xl bg-bio-emerald text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald"
            >
              Export Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
