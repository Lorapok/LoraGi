import React, { useState, useRef } from 'react';
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
  ArrowRight,
  Copy,
  ExternalLink,
  Upload,
  BookOpen
} from 'lucide-react';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface UrlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoLoaded: (file: File) => void;
  onOpenInstructions?: () => void;
}

interface YouTubeInfo {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  videoUrl: string;
  cleanFileName: string;
  directStreamAvailable: boolean;
  proxyUrl?: string;
  helperCommands?: {
    ytdlp: string;
    cobaltUrl: string;
  };
}

export const UrlImportModal: React.FC<UrlImportModalProps> = ({
  isOpen,
  onClose,
  onVideoLoaded,
  onOpenInstructions,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedClips, setResolvedClips] = useState<{ id: string; url: string; proxyUrl: string; title: string }[]>([]);
  const [youtubeInfo, setYoutubeInfo] = useState<YouTubeInfo | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  const localFileInputRef = useRef<HTMLInputElement>(null);

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
    setYoutubeInfo(null);

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
        type?: string;
        videoUrl?: string;
        proxyUrl?: string;
        title?: string;
        author?: string;
        thumbnail?: string;
        videoId?: string;
        cleanFileName?: string;
        directStreamAvailable?: boolean;
        helperCommands?: { ytdlp: string; cobaltUrl: string };
        allClips?: { id: string; url: string; proxyUrl: string; title: string }[];
      };

      if (!data.success) {
        throw new Error(data.error || 'Failed to detect video stream from URL');
      }

      // Case 1: YouTube video detected
      if (data.type === 'youtube_stream' && data.proxyUrl) {
        setStatusMessage(`Direct stream detected for "${data.title}"! Loading into editor...`);
        await loadVideoFromUrl(data.proxyUrl, data.title || 'YouTube Video');
        return;
      }

      if (data.type === 'youtube_guide') {
        setIsLoading(false);
        setYoutubeInfo({
          videoId: data.videoId || '',
          title: data.title || 'YouTube Video',
          author: data.author || 'YouTube Creator',
          thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
          videoUrl: data.videoUrl || cleanUrl,
          cleanFileName: data.cleanFileName || 'youtube_video',
          directStreamAvailable: false,
          helperCommands: data.helperCommands,
        });
        return;
      }

      // Case 2: Multi-clip Flow Music session
      if (data.allClips && data.allClips.length > 1) {
        setResolvedClips(data.allClips);
        setStatusMessage(`Found ${data.allClips.length} video takes in this Flow Music session. Select one:`);
        setIsLoading(false);
        return;
      }

      // Case 3: Direct stream or single clip
      if (data.videoUrl) {
        await loadVideoFromUrl(data.proxyUrl || data.videoUrl, data.title || 'Imported Video');
      } else {
        throw new Error('No valid video stream could be extracted.');
      }
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

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleLocalFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLocal(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoLoaded(file);
        onClose();
      } else {
        setErrorMessage('Please drop a valid video file (.mp4, .webm, .mov).');
      }
    }
  };

  const sampleFlowMusicLink = 'https://www.flowmusic.app/session/806433e8-679a-4ed3-b224-2920ad7ff8a3?t=true';
  const sampleYouTubeLink = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-bio-cyan/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-bio-rose/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Video from URL</h3>
              <p className="text-xs text-slate-400">YouTube, Google Flow Music, MP4, WebM, or public video streams</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenInstructions && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstructions();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-bio-cyan" />
                <span className="hidden sm:inline">Guide</span>
              </button>
            )}

            {!isLoading && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paste YouTube or Flow Music Video Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="https://youtube.com/watch?v=... or https://www.flowmusic.app/session/..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => handleImport()}
                disabled={isLoading || !url.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-bio-void font-bold text-xs tracking-wide shadow-bio-cyan hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          {/* Quick Samples Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400">Quick Samples:</span>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setUrl(sampleFlowMusicLink);
                handleImport(sampleFlowMusicLink);
              }}
              className="px-2.5 py-1 rounded-lg bg-bio-surface/80 hover:bg-bio-surface border border-bio-cyan/30 text-[11px] font-semibold text-bio-cyan flex items-center gap-1 transition-all"
            >
              <Music className="w-3 h-3" />
              <span>Flow Music Sample</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setUrl(sampleYouTubeLink);
                handleImport(sampleYouTubeLink);
              }}
              className="px-2.5 py-1 rounded-lg bg-bio-surface/80 hover:bg-bio-surface border border-bio-rose/30 text-[11px] font-semibold text-bio-rose flex items-center gap-1 transition-all"
            >
              <YoutubeIcon className="w-3 h-3" />
              <span>YouTube Sample</span>
            </button>
          </div>

          {/* YouTube Video Detected Card */}
          {youtubeInfo && (
            <div className="p-4 rounded-2xl bg-bio-surface/80 border border-bio-border space-y-3.5 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-bio-void border border-bio-border shrink-0 shadow">
                  <img
                    src={youtubeInfo.thumbnail}
                    alt={youtubeInfo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-bio-void/30 flex items-center justify-center">
                    <YoutubeIcon className="w-6 h-6 text-bio-rose" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-bio-rose/20 text-bio-rose text-[10px] font-bold font-mono">
                    YouTube Stream
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1 line-clamp-2">
                    {youtubeInfo.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{youtubeInfo.author}</p>
                </div>
              </div>

              {/* YouTube Cipher Protection & 1-Click Tools */}
              <div className="p-3 rounded-xl bg-bio-void/90 border border-bio-border space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Instant Download Options:</span>
                  <span className="text-[10px] text-bio-emerald font-mono">Zero Quality Loss</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Cobalt 1-Click Link */}
                  <a
                    href={`https://cobalt.tools/`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-gradient-to-r from-bio-rose/20 to-bio-violet/20 hover:from-bio-rose/30 hover:to-bio-violet/30 border border-bio-rose/40 text-white flex items-center justify-between transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Cobalt Web Tool</span>
                        <ExternalLink className="w-3 h-3 text-bio-rose group-hover:translate-x-0.5 transition-transform" />
                      </p>
                      <p className="text-[10px] text-slate-300">Clean 1080p MP4 download</p>
                    </div>
                  </a>

                  {/* Copy yt-dlp Command */}
                  <button
                    type="button"
                    onClick={() => handleCopyCmd(youtubeInfo.helperCommands?.ytdlp || '')}
                    className="p-2.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-bio-cyan flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        <span>{copiedCmd ? 'Command Copied!' : 'Copy yt-dlp 1-Liner'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Terminal command for direct MP4</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dropzone for downloaded file */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLocal(true);
                }}
                onDragLeave={() => setIsDraggingLocal(false)}
                onDrop={handleLocalFileDrop}
                onClick={() => localFileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  isDraggingLocal
                    ? 'border-bio-emerald bg-bio-emerald/10'
                    : 'border-bio-border hover:border-bio-cyan/40 bg-bio-void/60'
                }`}
              >
                <input
                  ref={localFileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onVideoLoaded(e.target.files[0]);
                      onClose();
                    }
                  }}
                />
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-200">
                  <Upload className="w-4 h-4 text-bio-emerald" />
                  <span>Drop the downloaded MP4 here or <strong className="text-bio-cyan underline">Browse</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Loads directly into timeline with frame-accurate multi-portion cutting
                </p>
              </div>
            </div>
          )}

          {/* Multi-clip session selector (for Flow Music sessions) */}
          {resolvedClips.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-bio-border">
              <span className="text-xs font-semibold text-slate-300">
                Choose a clip from this Flow Music session:
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
        <div className="flex items-center justify-between pt-3 border-t border-bio-border shrink-0">
          <p className="text-[11px] text-slate-400">100% private in-browser video processing</p>

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
