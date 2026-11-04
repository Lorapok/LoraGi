import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Scissors,
  Clapperboard,
  ShieldCheck,
  Music,
  ArrowRight,
  CheckCircle2,
  Download,
  Copy,
  ExternalLink,
  Split,
  Eye,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUrlImport?: () => void;
  onOpenOutroStudio?: () => void;
}

type TabType = 'quickstart' | 'youtube' | 'flowmusic' | 'cutting' | 'outro' | 'privacy';

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  onOpenUrlImport,
  onOpenOutroStudio,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const sampleYtDlp = 'yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" "<YOUTUBE_URL>" -o "video.mp4"';

  const copyYtDlp = () => {
    navigator.clipboard.writeText(sampleYtDlp);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'quickstart', label: 'Quick Start', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'youtube', label: 'YouTube Guide', icon: <YoutubeIcon className="w-4 h-4 text-bio-rose" /> },
    { id: 'flowmusic', label: 'Flow Music', icon: <Music className="w-4 h-4 text-bio-cyan" /> },
    { id: 'cutting', label: 'Precision Cutting', icon: <Scissors className="w-4 h-4 text-bio-emerald" /> },
    { id: 'outro', label: 'Outro Studio', icon: <Clapperboard className="w-4 h-4 text-bio-violet" /> },
    { id: 'privacy', label: '100% Privacy', icon: <ShieldCheck className="w-4 h-4 text-bio-emerald" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bio-glass-card border border-bio-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-bio-emerald/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-bio-cyan/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bio-border bg-bio-surface/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-bio-emerald/20 to-bio-cyan/20 border border-bio-emerald/30 text-bio-emerald">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">LoraGi User Guide & Instructions</h3>
                <span className="px-2 py-0.5 rounded-full bg-bio-emerald/10 border border-bio-emerald/20 text-bio-emerald text-[10px] font-mono font-bold">
                  Bio-Digital v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Master video cutting, YouTube workflow, and ending scenes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-bio-border bg-bio-void/60 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-bio-surface text-white border border-bio-border shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-bio-surface/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed flex-1">
          {/* Tab 1: Quickstart */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-bio-surface to-bio-card border border-bio-border">
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-bio-emerald" />
                  The 3-Step Precision Cutting Workflow
                </h4>
                <p className="text-xs text-slate-300">
                  LoraGi allows you to cut multiple portions from any video, preview every frame, and merge them with an optional custom ending scene in seconds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-bio-surface/50 border border-bio-border flex flex-col justify-between">
                  <div>
                    <span className="w-6 h-6 rounded-lg bg-bio-emerald/20 text-bio-emerald font-bold font-mono text-xs flex items-center justify-center mb-3">
                      1
                    </span>
                    <h5 className="font-bold text-white mb-1">Load Video</h5>
                    <p className="text-[11px] text-slate-400">
                      Drop any local MP4/WebM/MOV file, paste a YouTube link, or import a Google Flow Music session link.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-bio-border/50 text-[10px] text-bio-emerald font-mono">
                    Zero server uploads
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-bio-surface/50 border border-bio-border flex flex-col justify-between">
                  <div>
                    <span className="w-6 h-6 rounded-lg bg-bio-cyan/20 text-bio-cyan font-bold font-mono text-xs flex items-center justify-center mb-3">
                      2
                    </span>
                    <h5 className="font-bold text-white mb-1">Mark Portions</h5>
                    <p className="text-[11px] text-slate-400">
                      Scrub the timeline. Press <kbd className="px-1 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">[</kbd> to Mark In, <kbd className="px-1 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">]</kbd> to Mark Out, or <kbd className="px-1 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">S</kbd> to split.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-bio-border/50 text-[10px] text-bio-cyan font-mono">
                    Frame-stepping (0.05s)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-bio-surface/50 border border-bio-border flex flex-col justify-between">
                  <div>
                    <span className="w-6 h-6 rounded-lg bg-bio-violet/20 text-bio-violet font-bold font-mono text-xs flex items-center justify-center mb-3">
                      3
                    </span>
                    <h5 className="font-bold text-white mb-1">Add Outro & Export</h5>
                    <p className="text-[11px] text-slate-400">
                      Append an animated cyber outro card or your custom ending clip, then export merged or as separate clips.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-bio-border/50 text-[10px] text-bio-violet font-mono">
                    Single MP4/WebM or ZIP
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {onOpenUrlImport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUrlImport();
                    }}
                    className="px-4 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-cyan/40 text-bio-cyan font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Import YouTube / Flow Music Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenOutroStudio && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOutroStudio();
                    }}
                    className="px-4 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-violet/40 text-bio-violet font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Configure Ending Outro Scene</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: YouTube Guide */}
          {activeTab === 'youtube' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-bio-rose/10 border border-bio-rose/30 flex items-start gap-3">
                <YoutubeIcon className="w-5 h-5 text-bio-rose shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    How YouTube Video Support Works in LoraGi
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    YouTube protects videos using dynamic rolling signature ciphers. LoraGi detects your YouTube URL, extracts metadata and official HD thumbnails, attempts direct stream resolution, and provides 1-click tools for instant import.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
                  Step-by-Step YouTube Workflow:
                </h5>

                <div className="p-3.5 rounded-2xl bg-bio-surface/40 border border-bio-border space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-md bg-bio-rose/20 text-bio-rose flex items-center justify-center font-mono text-[11px]">
                      1
                    </span>
                    <span>Copy YouTube Link</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Supports regular videos (<code className="text-bio-cyan">youtube.com/watch?v=...</code>), short links (<code className="text-bio-cyan">youtu.be/...</code>), and YouTube Shorts (<code className="text-bio-cyan">youtube.com/shorts/...</code>).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/40 border border-bio-border space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-md bg-bio-rose/20 text-bio-rose flex items-center justify-center font-mono text-[11px]">
                      2
                    </span>
                    <span>Paste into LoraGi URL Importer</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Click <strong>Import Link</strong> in the header or dropzone. LoraGi inspects the stream and fetches the video title and preview.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/40 border border-bio-border space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-md bg-bio-rose/20 text-bio-rose flex items-center justify-center font-mono text-[11px]">
                      3
                    </span>
                    <span>Instant 1-Click Download Options</span>
                  </div>
                  <div className="pl-7 space-y-2.5">
                    <div className="p-3 rounded-xl bg-bio-void border border-bio-border flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white text-[11px]">Cobalt Clean Web Downloader (Recommended)</p>
                        <p className="text-[10px] text-slate-400">100% ad-free, full 1080p/4K MP4 stream download in 1 click.</p>
                      </div>
                      <a
                        href="https://cobalt.tools/"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-bio-rose/20 hover:bg-bio-rose/30 border border-bio-rose/40 text-bio-rose font-bold text-[10px] flex items-center gap-1 shrink-0"
                      >
                        <span>Open Cobalt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="p-3 rounded-xl bg-bio-void border border-bio-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-white text-[11px]">Terminal / yt-dlp Command</span>
                        <button
                          onClick={copyYtDlp}
                          className="px-2 py-1 rounded bg-bio-surface hover:bg-bio-hover border border-bio-border text-[10px] font-mono text-bio-cyan flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedCmd ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <code className="block p-2 rounded bg-bio-surface/80 text-[10px] font-mono text-slate-300 overflow-x-auto">
                        {sampleYtDlp}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/40 border border-bio-border space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-md bg-bio-rose/20 text-bio-rose flex items-center justify-center font-mono text-[11px]">
                      4
                    </span>
                    <span>Drop and Edit in LoraGi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Drag the downloaded MP4 directly into the dropzone (or the URL modal’s drop area). You can immediately slice, trim portions, and add an ending scene with zero quality degradation!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Flow Music */}
          {activeTab === 'flowmusic' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-bio-cyan/10 border border-bio-cyan/30 flex items-start gap-3">
                <Music className="w-5 h-5 text-bio-cyan shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    Direct Google Flow Music Integration
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    LoraGi features native edge parsing for Google Flow Music sessions (<code className="text-bio-cyan">flowmusic.app/session/...</code>).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
                  How to Import a Flow Music Session:
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs">
                  <li>
                    Open your generation on <strong>flowmusic.app</strong> and copy the browser URL (e.g., <code className="text-bio-cyan">https://www.flowmusic.app/session/806433e8-679a-4ed3-b224-2920ad7ff8a3?t=true</code>).
                  </li>
                  <li>
                    In LoraGi, click <strong>Import Link / Flow Music</strong>.
                  </li>
                  <li>
                    Paste the link and click <strong>Fetch</strong>.
                  </li>
                  <li>
                    LoraGi’s edge resolver queries the session, extracts all generated MP4 streams from Google Cloud Storage, and buffers the video directly into your browser.
                  </li>
                  <li>
                    If the session contains multiple takes, a selector allows you to pick any clip instantly!
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-bio-surface/60 border border-bio-border flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-semibold text-white">Try Example Flow Music Session</p>
                  <p className="text-[11px] text-slate-400">806433e8-679a-4ed3-b224-2920ad7ff8a3</p>
                </div>
                {onOpenUrlImport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUrlImport();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-bio-cyan/20 hover:bg-bio-cyan/30 border border-bio-cyan/40 text-bio-cyan font-bold text-[11px] flex items-center gap-1"
                  >
                    <span>Open Importer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Precision Cutting */}
          {activeTab === 'cutting' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-bio-emerald/10 border border-bio-emerald/30">
                <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-bio-emerald" />
                  Frame-Accurate Multi-Portion Cutting
                </h4>
                <p className="text-[11px] text-slate-300">
                  Unlike traditional video editors that only let you trim start and end, LoraGi lets you cut unlimited non-contiguous portions simultaneously.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <kbd className="px-1.5 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">[</kbd>
                    <span>Mark In Point</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sets the beginning of the active portion at the current playhead position.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <kbd className="px-1.5 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">]</kbd>
                    <span>Mark Out Point</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sets the end of the active portion at the current playhead position.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <kbd className="px-1.5 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">S</kbd>
                    <span>Split Portion</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Splits the active segment into two independent portions at the playhead.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <kbd className="px-1.5 py-0.5 rounded bg-bio-void text-bio-emerald font-mono font-bold">← / →</kbd>
                    <span>1-Frame Step (0.05s)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Steps forward or backward by single video frames for micro-cuts.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-bio-surface/40 border border-bio-border space-y-3">
                <h5 className="font-bold text-white text-xs">Understanding Cut Modes:</h5>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-bio-emerald shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Keep Portions (Extract Mode):</strong>
                      <p className="text-[11px] text-slate-400">
                        Only the segments you marked will be kept in the final video. All unselected intervals are discarded. Best for highlight reels.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-bio-rose shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Remove Portions (Ripple Cut Mode):</strong>
                      <p className="text-[11px] text-slate-400">
                        The marked portions are deleted, and everything else is kept and stitched seamlessly. Best for removing ads, pauses, or mistakes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Outro Studio */}
          {activeTab === 'outro' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-bio-violet/10 border border-bio-violet/30 flex items-start gap-3">
                <Clapperboard className="w-5 h-5 text-bio-violet shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    Outro Studio & Ending Scenes
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Add your own branded ending to the final few seconds of your video. LoraGi seamlessly appends it when exporting merged videos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-bio-surface/50 border border-bio-border space-y-2">
                  <span className="px-2 py-0.5 rounded bg-bio-violet/20 text-bio-violet text-[10px] font-bold">
                    Option A
                  </span>
                  <h5 className="font-bold text-white text-xs">Bio-Digital Cyber Card</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Generates a high-tech animated ending card directly on canvas. Custom title, creator subtitle, glowing biological pulse, and Lorapok watermark.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bio-surface/50 border border-bio-border space-y-2">
                  <span className="px-2 py-0.5 rounded bg-bio-cyan/20 text-bio-cyan text-[10px] font-bold">
                    Option B
                  </span>
                  <h5 className="font-bold text-white text-xs">Custom Video Clip Outro</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload your own branded video clip (e.g. YouTube subscribe animation, company logo sting, or credits clip) to append to the end.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-bio-surface/40 border border-bio-border space-y-2">
                <h5 className="font-bold text-white text-xs">How to configure:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>Click <strong>Outro Scene</strong> in the top header.</li>
                  <li>Enable the toggle switch.</li>
                  <li>Choose your outro type, duration (1 to 10 seconds), and accent color.</li>
                  <li>Click <strong>Save & Enable Outro</strong>. When you export a Merged Video, your outro is rendered automatically onto the final seconds!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab 6: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-bio-emerald/10 border border-bio-emerald/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-bio-emerald shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    100% Client-Side Privacy Guarantee
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Your video never leaves your browser. Slicing, audio analysis, and video stitching happen entirely on your machine.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border">
                  <h5 className="font-bold text-white text-xs mb-1">Zero Cloud Uploads</h5>
                  <p className="text-[11px] text-slate-400">
                    Unlike traditional cloud editors that require you to upload hundreds of megabytes to third-party servers, LoraGi runs locally using WebAssembly, HTML5 Canvas, and the Web Audio API.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border">
                  <h5 className="font-bold text-white text-xs mb-1">Instant Export Performance</h5>
                  <p className="text-[11px] text-slate-400">
                    Because processing is local, export speeds depend solely on your device’s GPU and CPU. No queue times, no subscription limits, and no watermark traps.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bio-surface/50 border border-bio-border">
                  <h5 className="font-bold text-white text-xs mb-1">Offline Capable</h5>
                  <p className="text-[11px] text-slate-400">
                    Once loaded, LoraGi can edit your local files even without an active internet connection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-bio-border bg-bio-surface/40 shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            Lorapok Labs • lorapok.tech
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-bio-emerald text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
