import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sliders,
  Settings,
  Share2,
  FileText,
  Clock,
  Hash,
  Flame,
  Briefcase,
  Feather,
  Film,
  Smile,
  GraduationCap,
} from 'lucide-react';
import {
  SocialPlatform,
  CaptionTone,
  GeneratedCaptionResult,
  generateSocialCaption,
  PLATFORM_NAMES,
  PLATFORM_LIMITS,
} from '../utils/aiCaptionEngine';
import { VideoSegment } from '../types';

interface AiCaptionWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  durationSeconds?: number;
  segments?: VideoSegment[];
  videoSrc?: string | null;
  onOpenDirectPublish?: (caption: string, title: string, platform: SocialPlatform) => void;
  onOpenApiSettings?: () => void;
}

const TONES: Array<{ id: CaptionTone; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'viral', label: 'Viral Hook', icon: Flame },
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'aesthetic', label: 'Aesthetic', icon: Feather },
  { id: 'cinematic', label: 'Cinematic', icon: Film },
  { id: 'humorous', label: 'Humorous', icon: Smile },
  { id: 'educational', label: 'How-To / Step', icon: GraduationCap },
];

export const AiCaptionWriterModal: React.FC<AiCaptionWriterModalProps> = ({
  isOpen,
  onClose,
  videoTitle = 'My LoraGi Creation',
  durationSeconds = 30,
  segments = [],
  videoSrc,
  onOpenDirectPublish,
  onOpenApiSettings,
}) => {
  const [platform, setPlatform] = useState<SocialPlatform>('twitter');
  const [tone, setTone] = useState<CaptionTone>('viral');
  const [title, setTitle] = useState<string>(videoTitle);
  const [keywords, setKeywords] = useState<string>('video editing, biological ui, creative tools');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratedCaptionResult | null>(null);
  const [copiedType, setCopiedType] = useState<'all' | 'hook' | 'hashtags' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(videoTitle || 'My LoraGi Creation');
      handleGenerate();
    }
  }, [isOpen, platform, tone]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateSocialCaption({
        title,
        topicOrKeywords: keywords,
        durationSeconds,
        segments: segments.filter((s) => s.enabled),
        targetPlatform: platform,
        tone,
        customNotes,
      });
      setResult(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, type: 'all' | 'hook' | 'hashtags') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleBroadcast = () => {
    if (onOpenDirectPublish && result) {
      onOpenDirectPublish(result.fullFormattedText, title, platform);
      onClose();
    }
  };

  const limit = PLATFORM_LIMITS[platform];
  const charCount = result ? result.characterCount : 0;
  const isOver = limit ? charCount > limit : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-bio-card/95 border border-bio-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow ambient header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bio-purple via-bio-cyan to-bio-emerald" />

        {/* Header */}
        <div className="p-5 border-b border-bio-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bio-surface border border-bio-purple/40 flex items-center justify-center text-bio-purple shadow-lg shadow-bio-purple/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  AI Caption & Hook Writer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-purple/10 text-bio-purple border border-bio-purple/30">
                  Multi-Platform Copy Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate high-converting viral hooks, formatted chapters, and niche hashtags tailored for each platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenApiSettings && (
              <button
                onClick={onOpenApiSettings}
                title="Configure Platform API Keys"
                className="p-2 rounded-xl bg-bio-surface/80 hover:bg-bio-surface text-slate-400 hover:text-white border border-bio-border transition-colors text-xs flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4 text-bio-cyan" />
                <span className="hidden sm:inline">API Keys</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-bio-surface/80 hover:bg-bio-surface text-slate-400 hover:text-white border border-bio-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Platform Selector Ribbon */}
        <div className="flex items-center border-b border-bio-border/40 px-5 bg-bio-surface/30 overflow-x-auto no-scrollbar gap-1">
          {(['twitter', 'youtube', 'tiktok', 'instagram', 'linkedin', 'facebook'] as SocialPlatform[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  platform === p
                    ? 'border-bio-cyan text-bio-cyan'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {PLATFORM_NAMES[p]}
              </button>
            )
          )}
        </div>

        {/* Main Grid: Left Controls, Right Output */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tone Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-bio-emerald" />
                <span>Audience Tone</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all text-left ${
                        isSelected
                          ? 'bg-bio-cyan/10 border-bio-cyan text-bio-cyan shadow-sm'
                          : 'bg-bio-surface/40 border-bio-border/60 text-slate-400 hover:text-slate-200 hover:bg-bio-surface'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Title */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Video Title / Concept</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of your video..."
                className="w-full bg-bio-card border border-bio-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-bio-cyan"
              />
            </div>

            {/* Topic Keywords */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Keywords / Topic Tags</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="tech, editing, tutorial, futuristic..."
                className="w-full bg-bio-card border border-bio-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-bio-cyan"
              />
            </div>

            {/* Custom Directives */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Custom Instruction <span className="text-slate-500">(Optional)</span>
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. emphasize our 60fps frame rate or mention discount link..."
                rows={2}
                className="w-full bg-bio-card border border-bio-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-bio-cyan resize-none"
              />
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-bio-purple via-bio-cyan to-bio-emerald text-slate-950 font-bold text-xs shadow-lg shadow-bio-cyan/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Copy...' : 'Regenerate Platform Copy'}</span>
            </button>

            {/* Tips Card */}
            {result?.platformTips && (
              <div className="p-3 rounded-xl bg-bio-surface/40 border border-bio-border/60 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-bio-cyan font-semibold block mb-0.5">Platform Best Practice:</span>
                {result.platformTips}
              </div>
            )}
          </div>

          {/* Output Display Column */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Generated Caption Preview
                </span>
                {limit && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      isOver
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-bio-surface text-slate-400 border-bio-border'
                    }`}
                  >
                    {charCount} / {limit} chars
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => result && handleCopy(result.hook, 'hook')}
                  className="px-2 py-1 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                >
                  {copiedType === 'hook' ? <Check className="w-3 h-3 text-bio-emerald" /> : <Copy className="w-3 h-3" />}
                  <span>Hook</span>
                </button>

                <button
                  onClick={() => result && handleCopy(result.hashtags.join(' '), 'hashtags')}
                  className="px-2 py-1 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                >
                  {copiedType === 'hashtags' ? <Check className="w-3 h-3 text-bio-emerald" /> : <Hash className="w-3 h-3" />}
                  <span>Tags</span>
                </button>

                <button
                  onClick={() => result && handleCopy(result.fullFormattedText, 'all')}
                  className="px-2.5 py-1 rounded-lg bg-bio-cyan/10 hover:bg-bio-cyan/20 border border-bio-cyan/40 text-[11px] text-bio-cyan font-medium transition-all flex items-center gap-1"
                >
                  {copiedType === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Full Post</span>
                </button>
              </div>
            </div>

            {/* Formatted Text Box */}
            <div className="flex-1 bg-bio-surface/50 border border-bio-border/70 rounded-xl p-4 overflow-y-auto text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed min-h-[260px] max-h-[380px] shadow-inner selection:bg-bio-cyan/30">
              {result?.fullFormattedText || 'Synthesizing neural caption...'}
            </div>

            {/* Direct Broadcast to Platform Footer */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Ready to publish? Send directly to your connected platforms via API.
              </span>
              <button
                onClick={handleBroadcast}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-slate-950 font-bold text-xs shadow-lg shadow-bio-cyan/20 hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast via API / Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
