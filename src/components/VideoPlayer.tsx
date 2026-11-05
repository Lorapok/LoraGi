import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Bookmark,
  Camera,
  Gauge,
  Palette,
  Ratio,
  Shield,
  Sliders,
} from 'lucide-react';
import { formatTime, formatTimecode } from '../utils/timeFormat';
import { AudioVisualizer } from './AudioVisualizer';
import { captureVideoFrame } from '../utils/videoProcessor';
import { AspectRatioMode, VideoAdjustments } from '../types';
import { computeCssFilter, ASPECT_RATIOS } from '../utils/videoFilterEngine';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSrc: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSetInPoint: () => void;
  onSetOutPoint: () => void;
  onSplitAtPlayhead: () => void;
  onNotify?: (text: string, type?: 'success' | 'info' | 'warning') => void;
  fileName: string;
  aspectRatio: AspectRatioMode;
  onSelectAspectRatio: (ratio: AspectRatioMode) => void;
  adjustments: VideoAdjustments;
  onOpenColorGrading: () => void;
  onToggleSafeZone: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  videoSrc,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onSetInPoint,
  onSetOutPoint,
  onSplitAtPlayhead,
  onNotify,
  fileName,
  aspectRatio,
  onSelectAspectRatio,
  adjustments,
  onOpenColorGrading,
  onToggleSafeZone,
}) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Volume synchronization
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

  // Playback rate synchronization
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, videoRef]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const stepFrame = (delta: number) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    onSeek(newTime);
  };

  const handleCaptureFrame = () => {
    if (videoRef.current) {
      captureVideoFrame(videoRef.current, fileName.replace(/\.[^/.]+$/, ''));
      onNotify?.('Frame snapshot captured and saved as PNG', 'success');
    }
  };

  const cssFilter = computeCssFilter(adjustments);

  // Aspect ratio framing style
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16] max-h-[70vh]';
      case '1:1':
        return 'aspect-square max-h-[60vh]';
      case '4:5':
        return 'aspect-[4/5] max-h-[65vh]';
      case '21:9':
        return 'aspect-[21/9]';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full rounded-2xl overflow-hidden bio-glass border border-bio-border shadow-2xl group"
    >
      {/* Video Display Area with Canvas Aspect-Ratio Framing */}
      <div
        className="relative w-full bg-black/90 flex items-center justify-center cursor-pointer select-none overflow-hidden min-h-[320px] max-h-[65vh]"
        onClick={onPlayPause}
      >
        {/* Frame container matching selected aspect ratio */}
        <div className={`relative w-full h-full flex items-center justify-center transition-all ${getAspectRatioClass()}`}>
          <video
            ref={videoRef}
            src={videoSrc}
            style={{ filter: cssFilter }}
            className="w-full h-full object-contain transition-all"
            playsInline
          />

          {/* Vignette Overlay if enabled */}
          {adjustments.vignette && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.85)',
              }}
            />
          )}

          {/* TikTok / Reels UI Safe Zone Overlay */}
          {aspectRatio === '9:16' && adjustments.safeZoneOverlay && (
            <div className="absolute inset-0 pointer-events-none border border-rose-500/30 flex flex-col justify-between p-3 font-mono text-[10px]">
              {/* Top Bar Safe Margin */}
              <div className="w-full h-12 bg-rose-500/10 border-b border-rose-500/20 flex items-center px-2 text-rose-300">
                <span>Top UI Margin (Profile & Search)</span>
              </div>

              {/* Center Safe Zone */}
              <div className="flex-1 flex items-center justify-center">
                <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-bio-emerald/40 text-bio-emerald backdrop-blur-sm text-center">
                  <span>Center Safe Content Area</span>
                </div>
              </div>

              {/* Bottom Action Margin */}
              <div className="w-full h-24 bg-rose-500/10 border-t border-rose-500/20 flex items-center px-2 text-rose-300">
                <span>Bottom UI Margin (Captions, Audio & Likes)</span>
              </div>
            </div>
          )}
        </div>

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-bio-void/60 via-transparent to-bio-void/20" />

        {/* Center Big Play/Pause Flash Icon */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-bio-surface/80 border border-bio-emerald/40 flex items-center justify-center text-bio-emerald shadow-bio-emerald backdrop-blur-md transform scale-100 hover:scale-110 transition-transform">
              <Play className="w-8 h-8 translate-x-0.5 fill-bio-emerald/20" />
            </div>
          </div>
        )}

        {/* Top Floating Timecode & Status Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-bio-void/80 backdrop-blur-md border border-bio-border text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-bio-emerald animate-pulse" />
            <span className="text-bio-emerald font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-bio-cyan text-[11px] hidden sm:inline">{formatTimecode(currentTime)}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Color Grading Active Badge */}
            {adjustments.filter !== 'none' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenColorGrading();
                }}
                className="px-2.5 py-1 rounded-lg bg-bio-emerald/20 border border-bio-emerald/40 text-[10px] font-mono text-bio-emerald flex items-center gap-1 backdrop-blur-md hover:bg-bio-emerald/30 transition-all"
              >
                <Palette className="w-3 h-3" />
                <span className="capitalize">{adjustments.filter.replace('_', ' ')} LUT</span>
              </button>
            )}

            {/* Current Ratio Badge */}
            <span className="px-2.5 py-1 rounded-lg bg-bio-void/80 backdrop-blur-md border border-bio-border text-[11px] font-mono text-slate-300">
              {aspectRatio}
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-3 bg-bio-card/95 border-t border-bio-border flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Play / Pause Button */}
          <button
            onClick={onPlayPause}
            className="p-2.5 rounded-xl bg-bio-emerald text-bio-void hover:bg-bio-emerald/90 active:scale-95 shadow-bio-emerald transition-all font-bold"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
          </button>

          {/* Jump -5s */}
          <button
            onClick={() => stepFrame(-5)}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all text-xs"
            title="Rewind 5s (J)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Frame Step Backward (-0.05s) */}
          <button
            onClick={() => stepFrame(-0.05)}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all"
            title="Previous Frame (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Frame Step Forward (+0.05s) */}
          <button
            onClick={() => stepFrame(0.05)}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all"
            title="Next Frame (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-bio-border mx-1 hidden sm:block" />

          {/* Mark In (I) */}
          <button
            onClick={onSetInPoint}
            className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-emerald/40 text-bio-emerald text-xs font-mono font-semibold flex items-center gap-1 transition-all"
            title="Set In-Point for Active Segment (I)"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>In (I)</span>
          </button>

          {/* Mark Out (O) */}
          <button
            onClick={onSetOutPoint}
            className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-cyan/40 text-bio-cyan text-xs font-mono font-semibold flex items-center gap-1 transition-all"
            title="Set Out-Point for Active Segment (O)"
          >
            <Bookmark className="w-3.5 h-3.5 rotate-180" />
            <span>Out (O)</span>
          </button>

          {/* Razor Split At Playhead (C) */}
          <button
            onClick={onSplitAtPlayhead}
            className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-violet/40 text-bio-violet text-xs font-mono font-semibold flex items-center gap-1 transition-all"
            title="Razor Cut: Split Segment At Playhead (C)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cut (C)</span>
          </button>
        </div>

        {/* Right Section: Canva & Adobe Pro Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Aspect Ratio Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRatioMenu(!showRatioMenu)}
              className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
              title="Canvas Framing & Aspect Ratio"
            >
              <Ratio className="w-3.5 h-3.5 text-bio-cyan" />
              <span className="hidden sm:inline font-mono">{aspectRatio}</span>
            </button>

            {showRatioMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-bio-card border border-bio-border shadow-2xl p-1.5 z-50 backdrop-blur-xl">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block uppercase">
                  Framing Aspect Ratio
                </span>
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectAspectRatio(r.id);
                      setShowRatioMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      aspectRatio === r.id
                        ? 'bg-bio-cyan/20 text-bio-cyan font-bold'
                        : 'text-slate-300 hover:bg-bio-surface'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{r.dimensionsText}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TikTok Safe Zone Guide Toggle */}
          {aspectRatio === '9:16' && (
            <button
              onClick={onToggleSafeZone}
              className={`p-2 rounded-lg border text-xs transition-all ${
                adjustments.safeZoneOverlay
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm'
                  : 'bg-bio-surface hover:bg-bio-hover border-bio-border text-slate-400'
              }`}
              title="Toggle TikTok / Reels UI Safe Zone Guides"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Color Grading & LUTs Modal Trigger */}
          <button
            onClick={onOpenColorGrading}
            className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-emerald/40 text-bio-emerald hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Color Grading & Film LUTs"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">LUT Filters</span>
          </button>

          {/* Audio Gain & Volume */}
          <div className="flex items-center gap-1.5 bg-bio-surface px-2 py-1 rounded-lg border border-bio-border">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-bio-rose" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-14 h-1 bg-bio-card rounded-lg appearance-none cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
              title="Playback Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-bio-cyan" />
              <span className="font-mono text-[11px] hidden sm:inline">{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-28 rounded-xl bg-bio-card border border-bio-border shadow-xl p-1 z-50">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      playbackRate === rate ? 'bg-bio-emerald/20 text-bio-emerald font-bold' : 'text-slate-300 hover:bg-bio-surface'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Capture Frame Snapshot */}
          <button
            onClick={handleCaptureFrame}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all text-xs"
            title="Capture Frame (PNG)"
          >
            <Camera className="w-3.5 h-3.5 text-bio-amber" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all text-xs"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Audio Waveform Spectrum Strip */}
      <AudioVisualizer videoRef={videoRef} isPlaying={isPlaying} />
    </div>
  );
};
