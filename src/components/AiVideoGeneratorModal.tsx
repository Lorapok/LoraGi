import React, { useState } from 'react';
import {
  X,
  Wand2,
  Sparkles,
  Music,
  Play,
  Film,
  Download,
  Scissors,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Disc,
} from 'lucide-react';
import {
  generateFlowMusicVideo,
  GeneratedVideoResult,
  FLOW_MUSIC_PRESETS,
} from '../utils/flowMusicGenerator';

interface AiVideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoEditor: (file: File) => void;
  onPublishToGallery: (videoUrl: string, title: string, duration: number) => void;
}

export const AiVideoGeneratorModal: React.FC<AiVideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onLoadIntoEditor,
  onPublishToGallery,
}) => {
  const [prompt, setPrompt] = useState('Cyberpunk neon nocturnal rain with deep rolling 808 sub-bass');
  const [selectedGenre, setSelectedGenre] = useState('Cyberpunk Synthwave');
  const [selectedMood, setSelectedMood] = useState('High Energy & Nocturnal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideoResult | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgressPercent(5);
    setStatusMessage('Connecting to Google Flow Music AI engine...');
    setGeneratedVideo(null);

    try {
      const result = await generateFlowMusicVideo(
        prompt,
        selectedGenre,
        selectedMood,
        (p, msg) => {
          setProgressPercent(p);
          setStatusMessage(msg);
        }
      );
      setGeneratedVideo(result);
    } catch (err) {
      console.error('Generation failed:', err);
      setStatusMessage('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadIntoStudio = async () => {
    if (!generatedVideo) return;
    setIsGenerating(true);
    setStatusMessage('Downloading stream buffer into LoraGi slicer...');

    try {
      const res = await fetch(generatedVideo.proxyUrl);
      const blob = await res.blob();
      const file = new File([blob], `${generatedVideo.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`, {
        type: 'video/mp4',
      });
      onLoadIntoEditor(file);
      onClose();
    } catch (err) {
      console.error('Failed to buffer video:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    'Cyberpunk neon nocturnal rain with deep 808 bass',
    'Tokyo midnight lo-fi chillout beats and gentle rain',
    'Bio-Digital metamorphosis spore growth and electronic pulse',
    'Dark hypnotic warehouse techno with relentless synths',
    'Astral space voyage with ambient ethereal vocals',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-bio-cyan/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-bio-emerald/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-bio-cyan/20 to-bio-emerald/20 text-bio-cyan border border-bio-cyan/30">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Flow Music AI Video Generator</h3>
                <span className="px-2 py-0.5 rounded-full bg-bio-cyan/10 border border-bio-cyan/20 text-bio-cyan text-[10px] font-mono font-bold">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-slate-400">Generate studio-quality music videos from text prompts</p>
            </div>
          </div>

          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Video Description & Sonic Prompt
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder="Describe the mood, instruments, rhythm, and visual style..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Quick Prompt Ideas */}
          <div>
            <span className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
              Inspirational Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setPrompt(p)}
                  className="px-2.5 py-1 rounded-lg bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-[10px] text-slate-300 hover:text-bio-cyan transition-all text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Genre / Style Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Genre & Sonic Vibe
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FLOW_MUSIC_PRESETS.map((preset) => (
                <button
                  key={preset.genre}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    setSelectedGenre(preset.genre);
                    setSelectedMood(preset.mood);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedGenre === preset.genre
                      ? 'bg-gradient-to-r from-bio-cyan/15 to-bio-emerald/15 border-bio-cyan text-white shadow-bio-cyan'
                      : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{preset.genre}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{preset.bpm} BPM • {preset.key}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generating Progress State */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-bio-surface/80 border border-bio-cyan/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-bio-cyan animate-spin" />
                  <span>{statusMessage}</span>
                </span>
                <span className="font-mono text-bio-cyan font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-bio-void overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bio-cyan to-bio-emerald transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Card */}
          {generatedVideo && !isGenerating && (
            <div className="p-4 rounded-2xl bg-bio-surface/80 border border-bio-emerald/40 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-bio-emerald/20 text-bio-emerald text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Video Synthesized Successfully!</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {generatedVideo.bpm} BPM • {generatedVideo.key}
                </span>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                <video
                  src={generatedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Metadata */}
              <div>
                <h4 className="text-sm font-bold text-white">{generatedVideo.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genre: <strong className="text-bio-cyan">{generatedVideo.genre}</strong> • Duration: {generatedVideo.durationFormatted}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-bio-border">
                <button
                  type="button"
                  onClick={handleLoadIntoStudio}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Cut & Slice in Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPublishToGallery(generatedVideo.videoUrl, generatedVideo.title, generatedVideo.duration);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-violet/40 text-bio-violet font-bold text-xs tracking-wide shadow-bio-violet hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Publish to Gallery</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-bio-border flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-mono">
            Powered by Google Flow Music & Lorapok Labs
          </p>

          {!generatedVideo && (
            <button
              type="button"
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan via-bio-emerald to-bio-violet text-bio-void font-extrabold text-xs tracking-wide shadow-bio-cyan hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Free Video</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
