import React, { useState } from 'react';
import {
  X,
  Link,
  Download,
  Sparkles,
  AlertCircle,
  Loader2,
  Film,
  Music,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface UrlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoLoaded: (file: File) => void;
}

export const UrlImportModal: React.FC<UrlImportModalProps> = ({
  isOpen,
  onClose,
  onVideoLoaded,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedClips, setResolvedClips] = useState<{ id: string; url: string; proxyUrl: string; title: string }[]>([]);

  if (!isOpen) return null;

  const handleImport = async (targetUrl: string = url) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setErrorMessage('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Analyzing and resolving video stream...');
    setResolvedClips([]);

    try {
      // 1. Call /api/resolve-video
      const res = await fetch('/api/resolve-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json() as {
        success?: boolean;
        error?: string;
        videoUrl?: string;
        proxyUrl?: string;
        title?: string;
        allClips?: { id: string; url: string; proxyUrl: string; title: string }[];
      };

      if (!data.success || !data.videoUrl) {
        throw new Error(data.error || 'Failed to detect video stream from URL');
      }

      // If multiple clips found in session, provide selection or download primary
      if (data.allClips && data.allClips.length > 1) {
        setResolvedClips(data.allClips);
        setStatusMessage(`Found ${data.allClips.length} video clips in this Flow Music session. Select one to load:`);
        setIsLoading(false);
        return;
      }

      await loadVideoFromUrl(data.proxyUrl || data.videoUrl, data.title || 'Imported Video');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error importing video from link';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const loadVideoFromUrl = async (videoStreamUrl: string, title: string) => {
    setIsLoading(true);
    setStatusMessage('Streaming and downloading video buffer into browser...');

    try {
      const videoRes = await fetch(videoStreamUrl);
      if (!videoRes.ok) {
        throw new Error(`Failed to download stream (${videoRes.status})`);
      }

      const blob = await videoRes.blob();
      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`;
      const file = new File([blob], fileName, { type: blob.type || 'video/mp4' });

      onVideoLoaded(file);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to buffer video stream';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleFlowMusicLink = 'https://www.flowmusic.app/session/806433e8-679a-4ed3-b224-2920ad7ff8a3?t=true';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-bio-cyan/15 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Video from URL</h3>
              <p className="text-xs text-slate-400">Flow Music sessions, MP4, WebM, or public video streams</p>
            </div>
          </div>

          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paste Video or Flow Music Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="https://www.flowmusic.app/session/... or https://example.com/video.mp4"
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => handleImport()}
                disabled={isLoading || !url.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-bio-void font-bold text-xs tracking-wide shadow-bio-cyan hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          {/* Quick FlowMusic Sample button */}
          <div className="p-3 rounded-2xl bg-bio-surface/60 border border-bio-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Music className="w-4 h-4 text-bio-cyan shrink-0" />
              <div>
                <p className="font-semibold text-white">Try Flow Music Session</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-xs">
                  806433e8-679a-4ed3-b224-2920ad7ff8a3
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setUrl(sampleFlowMusicLink);
                handleImport(sampleFlowMusicLink);
              }}
              className="px-3 py-1.5 rounded-lg bg-bio-void hover:bg-bio-surface border border-bio-cyan/40 text-[11px] font-semibold text-bio-cyan hover:text-white transition-all flex items-center gap-1"
            >
              <span>Load Session</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Multi-clip session selector (if session has multiple clips) */}
          {resolvedClips.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-bio-border">
              <span className="text-xs font-semibold text-slate-300">
                Choose a clip from this session:
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {resolvedClips.map((clip, i) => (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => loadVideoFromUrl(clip.proxyUrl, clip.title)}
                    className="w-full p-2.5 rounded-xl bg-bio-void/70 hover:bg-bio-surface border border-bio-border hover:border-bio-emerald flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-bio-emerald" />
                      <div>
                        <p className="text-xs font-semibold text-white">{clip.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Clip #{i + 1}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-bio-emerald/10 text-bio-emerald text-[10px] font-bold">
                      Load Clip
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress / Status Display */}
          {isLoading && (
            <div className="p-3.5 rounded-xl bg-bio-void/80 border border-bio-cyan/30 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-bio-cyan animate-spin shrink-0" />
              <p className="text-xs text-slate-200">{statusMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-bio-rose/10 border border-bio-rose/30 flex items-start gap-2.5 text-xs text-bio-rose">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-bio-border">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
