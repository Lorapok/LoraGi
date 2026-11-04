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
  Gauge
} from 'lucide-react';
import { formatTime, formatTimecode } from '../utils/timeFormat';
import { AudioVisualizer } from './AudioVisualizer';
import { captureVideoFrame } from '../utils/videoProcessor';

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
  fileName: string;
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
  fileName,
}) => {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
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
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full rounded-2xl overflow-hidden bio-glass border border-bio-border shadow-2xl group"
    >
      {/* Video Display Area */}
      <div
        className="relative w-full bg-black flex items-center justify-center cursor-pointer aspect-video max-h-[60vh] select-none"
        onClick={onPlayPause}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          playsInline
        />

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

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-bio-void/80 backdrop-blur-md border border-bio-border text-[11px] font-mono text-slate-300">
              {playbackRate}x Speed
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

          {/* Quick Mark In & Out Buttons */}
          <button
            onClick={onSetInPoint}
            className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-emerald/40 text-bio-emerald text-xs font-mono font-semibold flex items-center gap-1 transition-all"
            title="Set In Point ([)"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Mark In</span>
          </button>

          <button
            onClick={onSetOutPoint}
            className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-cyan/40 text-bio-cyan text-xs font-mono font-semibold flex items-center gap-1 transition-all"
            title="Set Out Point (])"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Mark Out</span>
          </button>

          {/* Split at Playhead */}
          <button
            onClick={onSplitAtPlayhead}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-bio-emerald/20 to-bio-cyan/20 hover:from-bio-emerald/30 hover:to-bio-cyan/30 border border-bio-emerald/40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Split Segment at Playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-bio-emerald" />
            <span className="hidden md:inline">Split</span>
          </button>
        </div>

        {/* Center: Live Sensory Audio Visualizer */}
        <div className="hidden lg:flex items-center">
          <AudioVisualizer videoRef={videoRef} isPlaying={isPlaying} />
        </div>

        {/* Right Section: Volume, Speed, Capture, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Capture Snapshot */}
          <button
            onClick={handleCaptureFrame}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all"
            title="Capture Current Frame Snapshot (PNG)"
          >
            <Camera className="w-4 h-4 text-bio-amber" />
          </button>

          {/* Playback Speed Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2.5 py-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-xs font-mono text-slate-200 flex items-center gap-1 transition-all"
              title="Change Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-bio-cyan" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 py-1 bg-bio-card border border-bio-border rounded-xl shadow-xl z-50 flex flex-col min-w-[90px]">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-3 py-1 text-xs font-mono text-left hover:bg-bio-surface transition-colors ${
                      playbackRate === speed ? 'text-bio-emerald font-bold' : 'text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-bio-rose" />
              ) : (
                <Volume2 className="w-4 h-4 text-bio-emerald" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-bio-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
