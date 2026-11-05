import React, { useState } from 'react';
import {
  Scissors,
  Sparkles,
  Send,
  Eraser,
  Music,
  Share2,
  ShieldCheck,
  Zap,
  Play,
  Film,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sliders,
  Globe,
  Flame,
  Key,
  Ratio,
  Palette,
  Shield,
  Check,
  X as XIcon,
} from 'lucide-react';
import { LoragiLogo } from './LoragiLogo';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface LandingPageProps {
  onLaunchStudio: () => void;
  onExploreGallery: () => void;
  onOpenAiCaptions: () => void;
  onOpenAiGenerator: () => void;
  onOpenObjectRemoval: () => void;
  onOpenDirectPublish: () => void;
  onOpenApiSettings: () => void;
  onLoadSample: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchStudio,
  onExploreGallery,
  onOpenAiCaptions,
  onOpenAiGenerator,
  onOpenObjectRemoval,
  onOpenDirectPublish,
  onOpenApiSettings,
  onLoadSample,
}) => {
  const [previewRatio, setPreviewRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [previewFilter, setPreviewFilter] = useState<'none' | 'cyberpunk' | 'portra' | 'bio_emerald'>('none');

  const getPreviewFilterStyle = () => {
    switch (previewFilter) {
      case 'cyberpunk':
        return 'contrast(1.25) saturate(1.4) hue-rotate(-15deg)';
      case 'portra':
        return 'contrast(1.1) saturate(1.15) sepia(0.15)';
      case 'bio_emerald':
        return 'contrast(1.15) saturate(1.25) hue-rotate(25deg)';
      default:
        return 'none';
    }
  };

  const getPreviewRatioClass = () => {
    switch (previewRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[280px] mx-auto';
      case '1:1':
        return 'aspect-square max-w-[340px] mx-auto';
      default:
        return 'aspect-video w-full';
    }
  };

  return (
    <div className="min-h-screen bg-bio-deep text-slate-200 flex flex-col selection:bg-bio-cyan/30 selection:text-white">
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-bio-cyan/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-bio-purple/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-bio-emerald/10 rounded-full blur-[160px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
          {/* Lorapok Studio Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bio-surface/80 border border-bio-cyan/30 text-xs font-mono text-bio-cyan shadow-lg shadow-bio-cyan/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-bio-emerald animate-ping" />
            <span className="font-semibold text-white">Lorapok Labs</span>
            <span className="text-slate-500">•</span>
            <span>Biological UI Video Studio</span>
            <span className="text-slate-500">•</span>
            <span className="text-bio-emerald">100% In-Browser Privacy</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
            Slice, Inpaint & Broadcast Video at{' '}
            <span className="bg-gradient-to-r from-bio-cyan via-bio-emerald to-bio-purple bg-clip-text text-transparent">
              Neural Precision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            The multi-purpose bio-digital creative suite. Multi-segment sub-frame video slicing,
            AI object & watermark inpainting, Google Flow Music synthesis, and instant 1-click
            direct API broadcasting with platform-tailored AI copywriting.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={onLaunchStudio}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-bio-cyan to-bio-emerald hover:opacity-95 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-bio-cyan/25 transition-all flex items-center gap-2.5 group"
            >
              <Scissors className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Launch Studio Slicer</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreGallery}
              className="px-6 py-4 rounded-2xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-purple/50 text-white font-semibold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2.5"
            >
              <YoutubeIcon className="w-5 h-5 text-rose-400" />
              <span>Explore Community Gallery</span>
            </button>

            <button
              onClick={onOpenAiCaptions}
              className="px-6 py-4 rounded-2xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-cyan/50 text-slate-200 hover:text-white font-semibold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-bio-cyan" />
              <span>AI Caption Writer</span>
            </button>
          </div>

          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-bio-border/60">
            <div className="p-4 rounded-2xl bg-bio-surface/40 border border-bio-border/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-bio-emerald mb-1">100%</div>
              <div className="text-xs text-slate-400 font-medium">In-Browser Privacy (Zero Leak)</div>
            </div>

            <div className="p-4 rounded-2xl bg-bio-surface/40 border border-bio-border/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-bio-cyan mb-1">0 sec</div>
              <div className="text-xs text-slate-400 font-medium">Cloud Queue Wait Times</div>
            </div>

            <div className="p-4 rounded-2xl bg-bio-surface/40 border border-bio-border/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-bio-purple mb-1">6+ APIs</div>
              <div className="text-xs text-slate-400 font-medium">Direct Platform Broadcasting</div>
            </div>

            <div className="p-4 rounded-2xl bg-bio-surface/40 border border-bio-border/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mb-1">0.01s</div>
              <div className="text-xs text-slate-400 font-medium">Sub-Frame Slicing Fidelity</div>
            </div>
          </div>
        </section>

        {/* CANVA & ADOBE INSPIRED INTERACTIVE STUDIO PLAYGROUND */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-28">
          <div className="relative rounded-3xl bg-bio-card/90 border border-bio-border/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
            {/* Ambient edge flare */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-bio-cyan to-transparent" />

            {/* Studio Header Controls */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-bio-border/60 mb-5 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-bio-emerald/80 inline-block" />
                <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">
                  Interactive Studio Sandbox
                </span>
              </div>

              {/* Interactive Aspect Ratio & LUT Filter Pickers */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Ratio Toggles */}
                <div className="flex items-center p-1 rounded-xl bg-bio-surface border border-bio-border text-[11px] font-mono">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setPreviewRatio(r)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        previewRatio === r
                          ? 'bg-bio-cyan text-bio-void font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* LUT Filter Toggles */}
                <div className="flex items-center p-1 rounded-xl bg-bio-surface border border-bio-border text-[11px]">
                  {[
                    { id: 'none', label: 'Raw' },
                    { id: 'cyberpunk', label: 'Neon' },
                    { id: 'portra', label: 'Portra' },
                    { id: 'bio_emerald', label: 'Bio' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPreviewFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        previewFilter === f.id
                          ? 'bg-bio-emerald text-bio-void font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={onLoadSample}
                  className="text-xs px-3 py-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-bio-cyan" />
                  <span>Launch Live Video</span>
                </button>
              </div>
            </div>

            {/* Simulated Timeline & Viewport */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left: Dynamic Video Canvas Preview */}
              <div className="md:col-span-7 bg-black rounded-2xl relative overflow-hidden border border-bio-border flex items-center justify-center p-4 min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-br from-bio-purple/20 via-transparent to-bio-cyan/20 pointer-events-none" />

                {/* Dynamic Ratio Frame with live CSS Filter */}
                <div
                  style={{ filter: getPreviewFilterStyle() }}
                  className={`relative rounded-xl overflow-hidden border border-bio-border/80 bg-bio-card shadow-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${getPreviewRatioClass()}`}
                >
                  {/* Safe Zone Margin for 9:16 */}
                  {previewRatio === '9:16' && (
                    <div className="absolute inset-0 pointer-events-none border border-rose-500/40 p-2 flex flex-col justify-between font-mono text-[9px] text-rose-300">
                      <div className="h-6 bg-rose-500/10 border-b border-rose-500/20 px-1 flex items-center">
                        Top Safe Margin
                      </div>
                      <div className="h-10 bg-rose-500/10 border-t border-rose-500/20 px-1 flex items-center">
                        Bottom Safe Margin
                      </div>
                    </div>
                  )}

                  {/* Simulated Inpaint Box */}
                  <div className="absolute top-4 right-4 w-20 h-12 border-2 border-dashed border-bio-emerald bg-bio-emerald/15 rounded-lg flex items-center justify-center text-[9px] font-mono text-bio-emerald shadow-sm">
                    Inpaint Eraser
                  </div>

                  <LoragiLogo size={56} className="mx-auto mb-3" />
                  <p className="text-sm font-bold text-white tracking-wide">LoraGi Precision Viewport</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mode: {previewRatio} • Grading: {previewFilter.toUpperCase()}
                  </p>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  <span>Portion 1: 00:00.00 – 00:04.20</span>
                  <span className="text-bio-cyan">60 FPS • 1080p WebAssembly</span>
                </div>
              </div>

              {/* Right: Sliced Portions & Broadcasting Palette */}
              <div className="md:col-span-5 space-y-3">
                <div className="p-3.5 rounded-xl bg-bio-surface/60 border border-bio-border/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-bio-cyan" />
                      Portion Slices (Keep & Merge)
                    </span>
                    <span className="text-[10px] font-mono text-bio-emerald">2 Portions Selected</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-bio-card border-l-4 border-bio-cyan flex justify-between">
                      <span className="text-slate-200">Intro Hook</span>
                      <span className="text-slate-400">00:00 - 00:04</span>
                    </div>
                    <div className="p-2 rounded-lg bg-bio-card border-l-4 border-bio-emerald flex justify-between">
                      <span className="text-slate-200">Highlight Segment</span>
                      <span className="text-slate-400">00:09 - 00:15</span>
                    </div>
                  </div>
                </div>

                {/* Direct Platform Quick Action */}
                <div className="p-3.5 rounded-xl bg-bio-surface/60 border border-bio-border/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-bio-purple" />
                      1-Click Direct Broadcasting
                    </span>
                    <button
                      onClick={onOpenDirectPublish}
                      className="text-[10px] text-bio-cyan hover:underline"
                    >
                      Broadcast Now →
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-bio-card border border-bio-border text-slate-300 font-medium">YouTube</div>
                    <div className="p-1.5 rounded-lg bg-bio-card border border-bio-border text-slate-300 font-medium">X / Twitter</div>
                    <div className="p-1.5 rounded-lg bg-bio-card border border-bio-border text-slate-300 font-medium">LinkedIn</div>
                    <div className="p-1.5 rounded-lg bg-bio-card border border-bio-border text-slate-300 font-medium">Discord</div>
                  </div>
                </div>

                <button
                  onClick={onLaunchStudio}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-slate-950 font-bold text-xs shadow-lg shadow-bio-cyan/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Open Full Video Studio</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6 POWER FEATURES GRID */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-bio-cyan mb-2 block">
              Architectural Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Modern Video Distribution
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Combining tactile Biological UI micro-interactions with hardware-accelerated media APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-bio-card border border-bio-border/70 hover:border-bio-cyan/50 transition-all group shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-bio-surface border border-bio-cyan/30 flex items-center justify-center text-bio-cyan mb-4 group-hover:scale-105 transition-transform">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Segment Precision Slicer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add unlimited colored intervals to keep or cut. Rearrange scenes, eliminate filler portions, and export clean merged MP4s or individual zip bundles without re-encoding quality degradation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-bio-card border border-bio-border/70 hover:border-bio-emerald/50 transition-all group shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-bio-surface border border-bio-emerald/30 flex items-center justify-center text-bio-emerald mb-4 group-hover:scale-105 transition-transform">
                <Eraser className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Object & Watermark Removal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Draw bounding boxes over watermarks, logos, or distracting elements. Features 3 inpainting models: Content-Aware Spatial Diffusion, Smart Gaussian Blur, and Texture Patching.
              </p>
              <button
                onClick={onOpenObjectRemoval}
                className="mt-4 text-xs text-bio-emerald hover:underline font-semibold flex items-center gap-1"
              >
                Launch Object Inpainter →
              </button>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-bio-card border border-bio-border/70 hover:border-bio-purple/50 transition-all group shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-bio-surface border border-bio-purple/30 flex items-center justify-center text-bio-purple mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Caption & Hook Writer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate high-converting titles, timestamps, and niche tags tailored specifically for YouTube, TikTok, Instagram Reels, X/Twitter, and LinkedIn with character-limit validation.
              </p>
              <button
                onClick={onOpenAiCaptions}
                className="mt-4 text-xs text-bio-purple hover:underline font-semibold flex items-center gap-1"
              >
                Open Caption Writer →
              </button>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-bio-card border border-bio-border/70 hover:border-bio-cyan/50 transition-all group shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-bio-surface border border-bio-cyan/30 flex items-center justify-center text-bio-cyan mb-4 group-hover:scale-105 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Direct Platform API Publishing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your YouTube, X/Twitter, LinkedIn, Discord, or Slack tokens into our zero-leak browser vault. Publish finished videos directly from your browser without complex manual downloads.
              </p>
              <button
                onClick={onOpenApiSettings}
                className="mt-4 text-xs text-bio-cyan hover:underline font-semibold flex items-center gap-1"
              >
                Configure API Connections →
              </button>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-bio-card border border-bio-border/70 hover:border-bio-emerald/50 transition-all group shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-bio-surface border border-bio-emerald/30 flex items-center justify-center text-bio-emerald mb-4 group-hover:scale-105 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Flow Music AI Synthesizer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synthesize high-fidelity ambient, lo-fi, and cyberpunk video clips directly from text prompts using Google Cloud Flow Music synthesis pipelines with zero subscription costs.
              </p>
              <button
                onClick={onOpenAiGenerator}
                className="mt-4 text-xs text-bio-emerald hover:underline font-semibold flex items-center gap-1"
              >
                Generate Free AI Video →
              </button>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-bio-card border border-bio-border/70 hover:border-bio-purple/50 transition-all group shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-bio-surface border border-bio-purple/30 flex items-center justify-center text-bio-purple mb-4 group-hover:scale-105 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bio-Digital Outro Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attach customizable Lorapok Biological UI credit cards, social handles, and studio watermarks onto the tail of any merged video export with customizable duration and neon themes.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: LORAGI VS TRADITIONAL EDITORS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-bio-emerald mb-2 block">
              Architectural Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Creators Choose LoraGi
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              How LoraGi outperforms heavy desktop suites and restrictive cloud SaaS editors.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-bio-border/80 bg-bio-card/90 shadow-2xl backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-bio-border/60 bg-bio-surface/50">
                  <th className="p-4 sm:p-5 font-bold text-white">Feature & Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-bio-emerald bg-bio-emerald/5 border-x border-bio-emerald/20">
                    <div className="flex items-center gap-1.5">
                      <LoragiLogo size={20} />
                      <span>LoraGi Studio</span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Desktop NLEs (Premiere)</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Cloud Web Cutters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bio-border/40 text-slate-300">
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">100% Client-Side Privacy</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-bio-emerald" /> Yes (Zero Server Upload)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">Local Disk</td>
                  <td className="p-4 sm:p-5 text-rose-400 font-medium">No (Uploaded to Cloud Servers)</td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Direct Social API Broadcasting</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-bio-emerald" /> 1-Click (YouTube, X, LinkedIn)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">Manual Render & Upload</td>
                  <td className="p-4 sm:p-5 text-slate-400">Requires Heavy Paid Subscription</td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">AI Caption & Hashtag Engine</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-bio-emerald" /> Built-In (6 Platforms)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">None / External Tool Needed</td>
                  <td className="p-4 sm:p-5 text-slate-400">Third-Party Add-on</td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">AI Object & Watermark Removal</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-bio-emerald" /> 3 Inpainting Models Included
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">Requires After Effects Plugin</td>
                  <td className="p-4 sm:p-5 text-slate-400">High Token Cost / Watermarked</td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Flow Music Sound Synthesis</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-bio-emerald" /> 100% Free Built-In
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">Stock Music Library Paid</td>
                  <td className="p-4 sm:p-5 text-slate-400">Paid Add-on</td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Rendering Speed & Queue</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-bio-emerald" /> Instant Native GPU
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">Heavy CPU Render Time</td>
                  <td className="p-4 sm:p-5 text-slate-400">Cloud Render Queue Wait</td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Subscription Cost</td>
                  <td className="p-4 sm:p-5 bg-bio-emerald/5 border-x border-bio-emerald/20 text-bio-emerald font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-bio-emerald/20 text-bio-emerald text-[11px]">Free & Open-Source</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">$35 – $60 / month</td>
                  <td className="p-4 sm:p-5 text-slate-400">$20 – $40 / month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* WORKFLOW STEPS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-bio-emerald mb-2 block">
              Streamlined Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How LoraGi Works in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-bio-surface/40 border border-bio-border relative">
              <div className="text-3xl font-extrabold text-bio-cyan/40 font-mono mb-2">01</div>
              <h4 className="text-sm font-bold text-white mb-1">Import or Generate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag any video file, paste a Flow Music session or YouTube URL, or generate a fresh clip with AI.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bio-surface/40 border border-bio-border relative">
              <div className="text-3xl font-extrabold text-bio-emerald/40 font-mono mb-2">02</div>
              <h4 className="text-sm font-bold text-white mb-1">Slice & Inpaint</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pinpoint portions on the visual waveform, trim frame-by-frame, and erase unwanted watermarks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bio-surface/40 border border-bio-border relative">
              <div className="text-3xl font-extrabold text-bio-purple/40 font-mono mb-2">03</div>
              <h4 className="text-sm font-bold text-white mb-1">AI Copywriting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick your tone (viral, professional, humorous) and generate timestamps, chapters, and hashtags.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bio-surface/40 border border-bio-border relative">
              <div className="text-3xl font-extrabold text-amber-400/40 font-mono mb-2">04</div>
              <h4 className="text-sm font-bold text-white mb-1">Broadcast Direct</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publish directly via connected API or launch deep share links to X, YouTube, LinkedIn, and Discord.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-24 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-bio-surface to-bio-card border border-bio-border/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bio-cyan/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <LoragiLogo size={60} className="mx-auto mb-4" />
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Experience Frictionless Video Slicing?
              </h2>
              <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
                No sign-up required to start slicing. Everything runs client-side with native hardware acceleration.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onLaunchStudio}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-slate-950 font-bold text-sm shadow-xl shadow-bio-cyan/20 hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Scissors className="w-4 h-4 text-slate-950" />
                  <span>Open Video Studio Slicer</span>
                </button>
                <button
                  onClick={onExploreGallery}
                  className="px-6 py-3.5 rounded-2xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-white font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <YoutubeIcon className="w-4 h-4 text-rose-400" />
                  <span>Browse Community Creations</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LORAPOK LABS ECOSYSTEM FOOTER */}
        <footer className="border-t border-bio-border/60 bg-bio-card/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto backdrop-blur-md">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <LoragiLogo size={28} />
                <span className="font-bold text-base text-white tracking-wide">LoraGi</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Precision video slicing, neural object inpainting, and multi-platform broadcasting studio by Lorapok Labs.
              </p>
              <div className="text-[11px] font-mono text-bio-cyan">
                loragi.lorapok.tech
              </div>
            </div>

            {/* Studio Tools */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Studio Engine</h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><button onClick={onLaunchStudio} className="hover:text-bio-cyan transition-colors">Precision Slicer</button></li>
                <li><button onClick={onOpenObjectRemoval} className="hover:text-bio-emerald transition-colors">AI Object Removal</button></li>
                <li><button onClick={onOpenAiCaptions} className="hover:text-bio-purple transition-colors">AI Caption Writer</button></li>
                <li><button onClick={onOpenAiGenerator} className="hover:text-bio-cyan transition-colors">Flow Music Generator</button></li>
                <li><button onClick={onOpenDirectPublish} className="hover:text-bio-emerald transition-colors">Direct API Publisher</button></li>
              </ul>
            </div>

            {/* Lorapok Ecosystem */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Lorapok Labs Catalog</h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <a href="https://lorapok.tech" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                    Lorapok Labs Central <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://atlas.lorapok.tech" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                    Lorapok API Atlas <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://cursor.lorapok.tech" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                    Cursor Curse Monitor (CCM) <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://seeyou.lorapok.tech" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                    SeeYou (AI SEO Platform) <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://media.lorapok.tech" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                    Lorapok Media Player <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Architectural & Privacy */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Architecture</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built with React, TypeScript, HTML5 Canvas, Web Audio API, and Cloudflare Pages.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-surface border border-bio-border text-slate-400">
                  Client-First
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-surface border border-bio-border text-slate-400">
                  Zero Re-encode Loss
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-surface border border-bio-border text-slate-400">
                  Firebase Sync
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-6 border-t border-bio-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © 2024–2026 Lorapok Labs. Designed & Engineered by Maizied Hasan.
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Lorapok/LoraGi" target="_blank" rel="noreferrer" className="hover:text-slate-300">
                GitHub Repository
              </a>
              <span>•</span>
              <button onClick={onOpenApiSettings} className="hover:text-slate-300">
                API Vault
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
