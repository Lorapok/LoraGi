import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header, AppViewMode } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { SegmentsList } from './components/SegmentsList';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { InstructionsModal } from './components/InstructionsModal';
import { MetadataDrawer } from './components/MetadataDrawer';
import { UrlImportModal } from './components/UrlImportModal';
import { OutroStudioModal } from './components/OutroStudioModal';
import { GalleryView } from './components/GalleryView';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PublishModal } from './components/PublishModal';
import { AiVideoGeneratorModal } from './components/AiVideoGeneratorModal';
import { ObjectRemovalModal } from './components/ObjectRemovalModal';
import { AiCaptionWriterModal } from './components/AiCaptionWriterModal';
import { DirectPublishModal } from './components/DirectPublishModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ColorGradingModal } from './components/ColorGradingModal';
import { SocialPlatform } from './utils/aiCaptionEngine';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  VideoSegment,
  CutMode,
  VideoMetadata,
  SEGMENT_COLORS,
  OutroConfig,
  ObjectRemovalMask,
  AspectRatioMode,
  VideoAdjustments,
} from './types';
import { formatTime } from './utils/timeFormat';
import { generateSampleVideo } from './utils/sampleGenerator';
import { computeEffectiveIntervals } from './utils/videoProcessor';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppViewMode>('landing');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [cutMode, setCutMode] = useState<CutMode>('keep');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState<boolean>(false);
  const [isUrlImportOpen, setIsUrlImportOpen] = useState<boolean>(false);
  const [isOutroStudioOpen, setIsOutroStudioOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
  const [isObjectRemovalOpen, setIsObjectRemovalOpen] = useState<boolean>(false);
  const [isAiCaptionsOpen, setIsAiCaptionsOpen] = useState<boolean>(false);
  const [isDirectPublishOpen, setIsDirectPublishOpen] = useState<boolean>(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isColorGradingOpen, setIsColorGradingOpen] = useState<boolean>(false);

  // Canva / Adobe Pro Aspect Ratio & Color Adjustments
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('original');
  const [videoAdjustments, setVideoAdjustments] = useState<VideoAdjustments>({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    vignette: false,
    filter: 'none',
    safeZoneOverlay: false,
  });

  // Direct Publish data payload
  const [directPublishData, setDirectPublishData] = useState<{
    caption: string;
    title: string;
    platform: SocialPlatform;
  }>({
    caption: '',
    title: 'My LoraGi Creation',
    platform: 'twitter',
  });

  // Object Removal inpainting masks
  const [objectRemovalMasks, setObjectRemovalMasks] = useState<ObjectRemovalMask[]>([]);

  // Publish target info
  const [publishTarget, setPublishTarget] = useState<{
    src: string | null;
    title: string;
    duration: number;
  }>({
    src: null,
    title: 'My LoraGi Creation',
    duration: 30,
  });

  // Outro ending scene configuration
  const [outroConfig, setOutroConfig] = useState<OutroConfig>({
    enabled: false,
    type: 'bio_card',
    title: 'Created With LoraGi',
    subtitle: 'Lorapok Labs • Open-Source Products That Feel Alive',
    durationSeconds: 3,
    themeColor: '#a855f7',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewTimerRef = useRef<number | null>(null);

  const addToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, text, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handle video file selection
  const handleVideoSelected = useCallback((file: File) => {
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveView('studio');

    // Initial default metadata
    setMetadata({
      name: file.name,
      size: file.size,
      type: file.type || 'video/mp4',
      duration: 0,
      width: 0,
      height: 0,
      aspectRatio: '16:9',
      estimatedFps: 30,
    });
  }, [videoSrc]);

  // Load in-browser sample video
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const sampleFile = await generateSampleVideo();
      handleVideoSelected(sampleFile);
    } catch (err) {
      console.error('Error generating sample:', err);
      alert('Could not generate sample video.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Video metadata loaded listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const dur = video.duration || 0;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(width, height);
      const aspect = `${width / divisor}:${height / divisor}`;

      setDuration(dur);
      setMetadata((prev) =>
        prev
          ? {
              ...prev,
              duration: dur,
              width,
              height,
              aspectRatio: aspect,
            }
          : null
      );

      // Initialize with default logical portions
      if (dur > 0 && segments.length === 0) {
        const seg1End = Math.min(dur * 0.4, 5);
        const seg2Start = Math.min(dur * 0.5, dur - 4);
        const seg2End = Math.min(seg2Start + 5, dur);

        const initialSegments: VideoSegment[] = [
          {
            id: 'seg-1',
            name: 'Intro Cut',
            start: 0,
            end: seg1End,
            color: SEGMENT_COLORS[0],
            enabled: true,
          },
          {
            id: 'seg-2',
            name: 'Highlight Clip',
            start: seg2Start,
            end: seg2End,
            color: SEGMENT_COLORS[1],
            enabled: true,
          },
        ];
        setSegments(initialSegments);
        setSelectedSegmentId('seg-1');
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoSrc, segments.length]);

  // Load video directly from Community Gallery
  const handleLoadVideoFromGallery = useCallback(async (targetUrl: string, title: string) => {
    addToast(`Loading "${title}" into Studio Slicer...`, 'info');
    try {
      const proxyUrl = `/api/resolve-video?stream=1&url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Stream download failed');
      const blob = await res.blob();
      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`;
      const file = new File([blob], fileName, { type: blob.type || 'video/mp4' });
      handleVideoSelected(file);
      addToast(`"${title}" loaded into Studio!`, 'success');
    } catch {
      // Fallback direct stream loading
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
      setVideoFile(null);
      setVideoSrc(targetUrl);
      setCurrentTime(0);
      setIsPlaying(false);
      setActiveView('studio');
      addToast(`"${title}" loaded in streaming mode!`, 'success');
    }
  }, [videoSrc, handleVideoSelected, addToast]);

  // Open Publish Modal
  const handleStartPublish = useCallback(() => {
    setPublishTarget({
      src: videoSrc || 'https://storage.googleapis.com/producer-app-public/assets/3bcaf576-a168-476f-a7bf-14a725c10d96.mp4',
      title: videoFile?.name || 'My LoraGi Creation',
      duration: duration || 30,
    });
    setIsPublishModalOpen(true);
  }, [videoSrc, videoFile, duration]);

  // Play / Pause toggle
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  // Seek video
  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(video.currentTime);
  }, [duration]);

  // Set In Point ([ key)
  const handleSetInPoint = useCallback(() => {
    if (segments.length === 0) {
      const newSeg: VideoSegment = {
        id: `seg-${Date.now()}`,
        name: 'Portion 1',
        start: currentTime,
        end: Math.min(duration, currentTime + 5),
        color: SEGMENT_COLORS[0],
        enabled: true,
      };
      setSegments([newSeg]);
      setSelectedSegmentId(newSeg.id);
      addToast(`Marked In point at ${formatTime(currentTime)}`, 'success');
      return;
    }

    const targetId = selectedSegmentId || segments[0].id;
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id === targetId) {
          const newStart = Math.min(currentTime, s.end - 0.1);
          return { ...s, start: Math.max(0, newStart) };
        }
        return s;
      })
    );
    addToast(`Marked In point at ${formatTime(currentTime)}`, 'success');
  }, [currentTime, duration, segments, selectedSegmentId, addToast]);

  // Set Out Point (] key)
  const handleSetOutPoint = useCallback(() => {
    if (segments.length === 0) {
      const newSeg: VideoSegment = {
        id: `seg-${Date.now()}`,
        name: 'Portion 1',
        start: Math.max(0, currentTime - 5),
        end: currentTime,
        color: SEGMENT_COLORS[0],
        enabled: true,
      };
      setSegments([newSeg]);
      setSelectedSegmentId(newSeg.id);
      addToast(`Marked Out point at ${formatTime(currentTime)}`, 'success');
      return;
    }

    const targetId = selectedSegmentId || segments[segments.length - 1].id;
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id === targetId) {
          const newEnd = Math.max(currentTime, s.start + 0.1);
          return { ...s, end: Math.min(duration, newEnd) };
        }
        return s;
      })
    );
    addToast(`Marked Out point at ${formatTime(currentTime)}`, 'success');
  }, [currentTime, duration, segments, selectedSegmentId, addToast]);

  // Split Segment at Current Playhead (S key)
  const handleSplitAtPlayhead = useCallback(() => {
    if (duration <= 0) return;

    // Check if current time falls within an existing segment
    const intersecting = segments.find(
      (s) => currentTime > s.start + 0.1 && currentTime < s.end - 0.1
    );

    if (intersecting) {
      const firstHalf: VideoSegment = {
        ...intersecting,
        end: currentTime,
      };
      const secondHalf: VideoSegment = {
        id: `seg-${Date.now()}`,
        name: `${intersecting.name} (Part 2)`,
        start: currentTime,
        end: intersecting.end,
        color: SEGMENT_COLORS[(segments.length + 1) % SEGMENT_COLORS.length],
        enabled: true,
      };

      setSegments((prev) =>
        prev.flatMap((s) => (s.id === intersecting.id ? [firstHalf, secondHalf] : s))
      );
      setSelectedSegmentId(secondHalf.id);
      addToast(`Split portion at ${formatTime(currentTime)}`, 'info');
    } else {
      // Create a new segment starting at playhead
      const newSeg: VideoSegment = {
        id: `seg-${Date.now()}`,
        name: `Portion ${segments.length + 1}`,
        start: currentTime,
        end: Math.min(duration, currentTime + Math.max(2, duration * 0.15)),
        color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length],
        enabled: true,
      };
      setSegments((prev) => [...prev, newSeg]);
      setSelectedSegmentId(newSeg.id);
      addToast(`Added new portion starting at ${formatTime(currentTime)}`, 'info');
    }
  }, [currentTime, duration, segments, addToast]);

  // Add Segment Button
  const handleAddSegment = () => {
    const newSeg: VideoSegment = {
      id: `seg-${Date.now()}`,
      name: `Portion ${segments.length + 1}`,
      start: currentTime,
      end: Math.min(duration, currentTime + 5),
      color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length],
      enabled: true,
    };
    setSegments([...segments, newSeg]);
    setSelectedSegmentId(newSeg.id);
  };

  // Update Segment
  const handleUpdateSegment = (id: string, updates: Partial<VideoSegment>) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Delete Segment
  const handleDeleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
    if (selectedSegmentId === id) {
      setSelectedSegmentId(null);
    }
  };

  // Duplicate Segment
  const handleDuplicateSegment = (id: string) => {
    const target = segments.find((s) => s.id === id);
    if (!target) return;

    const segDuration = target.end - target.start;
    const newStart = Math.min(duration - segDuration, target.end);
    const newEnd = Math.min(duration, newStart + segDuration);

    const dup: VideoSegment = {
      id: `seg-${Date.now()}`,
      name: `${target.name} (Copy)`,
      start: newStart,
      end: newEnd,
      color: SEGMENT_COLORS[(segments.length + 1) % SEGMENT_COLORS.length],
      enabled: true,
    };
    setSegments([...segments, dup]);
    setSelectedSegmentId(dup.id);
  };

  // Preview specific portion
  const handlePreviewSegment = (seg: VideoSegment) => {
    const video = videoRef.current;
    if (!video) return;

    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current);
    }

    video.currentTime = seg.start;
    video.play().then(() => {
      previewTimerRef.current = window.setInterval(() => {
        if (video.currentTime >= seg.end) {
          video.pause();
          if (previewTimerRef.current) {
            clearInterval(previewTimerRef.current);
            previewTimerRef.current = null;
          }
        }
      }, 50);
    }).catch(() => {});
  };

  // Reset video to dropzone
  const handleResetVideo = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoFile(null);
    setVideoSrc(null);
    setSegments([]);
    setMetadata(null);
    setCurrentTime(0);
    setDuration(0);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case '[':
          e.preventDefault();
          handleSetInPoint();
          break;
        case ']':
          e.preventDefault();
          handleSetOutPoint();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          handleSplitAtPlayhead();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(currentTime - (e.shiftKey ? 1 : 0.05));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(currentTime + (e.shiftKey ? 1 : 0.05));
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          handleSeek(currentTime - 5);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          handleSeek(currentTime + 5);
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          if (videoRef.current) videoRef.current.pause();
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          break;
        case 'Escape':
          setIsShortcutsOpen(false);
          setIsExportModalOpen(false);
          setIsMetadataOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handlePlayPause,
    handleSetInPoint,
    handleSetOutPoint,
    handleSplitAtPlayhead,
    handleSeek,
    currentTime,
  ]);

  // Total kept duration calculation
  const effectiveIntervals = computeEffectiveIntervals(segments, duration, cutMode);
  const totalKeptDuration = effectiveIntervals.reduce(
    (acc, curr) => acc + (curr.end - curr.start),
    0
  );

  return (
    <div className="flex flex-col min-h-screen bg-bio-void text-slate-100">
      {/* Header */}
      <Header
        hasVideo={!!videoSrc}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
        onOpenMetadata={() => setIsMetadataOpen(true)}
        onOpenUrlImport={() => setIsUrlImportOpen(true)}
        onOpenOutroStudio={() => setIsOutroStudioOpen(true)}
        onOpenObjectRemoval={() => setIsObjectRemovalOpen(true)}
        onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
        onOpenAiCaptions={() => setIsAiCaptionsOpen(true)}
        onOpenDirectPublish={() => setIsDirectPublishOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenPublish={handleStartPublish}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onResetVideo={handleResetVideo}
        totalSegmentsCount={segments.filter((s) => s.enabled).length}
        totalKeptDurationFormatted={formatTime(totalKeptDuration)}
        isOutroEnabled={outroConfig.enabled}
        activeMasksCount={objectRemovalMasks.filter((m) => m.enabled).length}
      />

      {/* Main Workspace or Landing Page */}
      {activeView === 'landing' ? (
        <LandingPage
          onLaunchStudio={() => setActiveView('studio')}
          onExploreGallery={() => setActiveView('gallery')}
          onOpenAiCaptions={() => setIsAiCaptionsOpen(true)}
          onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
          onOpenObjectRemoval={() => setIsObjectRemovalOpen(true)}
          onOpenDirectPublish={() => setIsDirectPublishOpen(true)}
          onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          onLoadSample={handleLoadSample}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
          {activeView === 'gallery' ? (
            /* YouTube-Style Community Gallery Feed */
            <GalleryView
              onLoadVideoIntoEditor={handleLoadVideoFromGallery}
              onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
              onOpenPublish={handleStartPublish}
              onSwitchToStudio={() => setActiveView('studio')}
            />
          ) : !videoSrc ? (
            /* Empty / Dropzone State */
            <Dropzone
              onVideoSelected={handleVideoSelected}
              onLoadSample={handleLoadSample}
              onOpenUrlImport={() => setIsUrlImportOpen(true)}
              onOpenInstructions={() => setIsInstructionsOpen(true)}
              isLoadingSample={isLoadingSample}
            />
          ) : (
            /* Active Editing Workspace */
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 Columns: Video Player & Interactive Timeline */}
              <div className="w-full lg:col-span-8 flex flex-col gap-5">
                <VideoPlayer
                  videoRef={videoRef}
                  videoSrc={videoSrc}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  onSetInPoint={handleSetInPoint}
                  onSetOutPoint={handleSetOutPoint}
                  onSplitAtPlayhead={handleSplitAtPlayhead}
                  onNotify={addToast}
                  fileName={videoFile?.name || 'video'}
                  aspectRatio={aspectRatio}
                  onSelectAspectRatio={setAspectRatio}
                  adjustments={videoAdjustments}
                  onOpenColorGrading={() => setIsColorGradingOpen(true)}
                  onToggleSafeZone={() =>
                    setVideoAdjustments((prev) => ({
                      ...prev,
                      safeZoneOverlay: !prev.safeZoneOverlay,
                    }))
                  }
                />

                <Timeline
                  duration={duration}
                  currentTime={currentTime}
                  segments={segments}
                  selectedSegmentId={selectedSegmentId}
                  onSelectSegment={setSelectedSegmentId}
                  onUpdateSegment={handleUpdateSegment}
                  onAddSegment={handleAddSegment}
                  onSeek={handleSeek}
                  videoSrc={videoSrc}
                />
              </div>

              {/* Right 4 Columns: Segments Manager & Cut Modes */}
              <div className="w-full lg:col-span-4 flex flex-col gap-5">
                <SegmentsList
                  segments={segments}
                  selectedSegmentId={selectedSegmentId}
                  onSelectSegment={setSelectedSegmentId}
                  onUpdateSegment={handleUpdateSegment}
                  onDeleteSegment={handleDeleteSegment}
                  onDuplicateSegment={handleDuplicateSegment}
                  onPreviewSegment={handlePreviewSegment}
                  cutMode={cutMode}
                  onToggleCutMode={setCutMode}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                  onOpenOutroStudio={() => setIsOutroStudioOpen(true)}
                  isOutroEnabled={outroConfig.enabled}
                  totalKeptDuration={totalKeptDuration}
                />
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer (for studio and gallery views) */}
      {activeView !== 'landing' && (
        <footer className="w-full border-t border-bio-border/60 bg-bio-void py-6 px-4 text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bio-emerald" />
              <span>LoraGi • Bio-Digital Multi-Purpose Video Precision Cutter & AI Studio</span>
            </div>
            <div>
              Built by{' '}
              <a
                href="https://lorapok.tech"
                target="_blank"
                rel="noreferrer"
                className="text-bio-cyan hover:underline font-semibold"
              >
                Lorapok Labs
              </a>{' '}
              • Open-Source Products That Feel Alive
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        videoSrc={videoSrc || ''}
        duration={duration}
        segments={segments}
        cutMode={cutMode}
        fileName={videoFile?.name || 'loragi_cut'}
        outroConfig={outroConfig}
        masks={objectRemovalMasks}
        adjustments={videoAdjustments}
        onOpenPublish={handleStartPublish}
      />

      <ColorGradingModal
        isOpen={isColorGradingOpen}
        onClose={() => setIsColorGradingOpen(false)}
        adjustments={videoAdjustments}
        onChangeAdjustments={setVideoAdjustments}
        onReset={() => {
          setVideoAdjustments({
            brightness: 1,
            contrast: 1,
            saturation: 1,
            vignette: false,
            filter: 'none',
            safeZoneOverlay: false,
          });
          addToast('Color adjustments reset to natural defaults', 'info');
        }}
      />

      <UrlImportModal
        isOpen={isUrlImportOpen}
        onClose={() => setIsUrlImportOpen(false)}
        onVideoLoaded={(file) => {
          handleVideoSelected(file);
          addToast(`Imported ${file.name} from URL!`, 'success');
        }}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
      />

      <OutroStudioModal
        isOpen={isOutroStudioOpen}
        onClose={() => setIsOutroStudioOpen(false)}
        config={outroConfig}
        onSaveConfig={(cfg) => {
          setOutroConfig(cfg);
          if (cfg.enabled) {
            addToast('Outro ending scene configured and enabled!', 'success');
          } else {
            addToast('Outro scene disabled', 'info');
          }
        }}
      />

      <ObjectRemovalModal
        isOpen={isObjectRemovalOpen}
        onClose={() => setIsObjectRemovalOpen(false)}
        videoSrc={videoSrc}
        duration={duration}
        currentTime={currentTime}
        activeMasks={objectRemovalMasks}
        onSaveMasks={(masks) => {
          setObjectRemovalMasks(masks);
          const activeCount = masks.filter((m) => m.enabled).length;
          addToast(
            `AI Object Removal updated (${activeCount} active inpaint mask${activeCount === 1 ? '' : 's'})`,
            'success'
          );
        }}
      />

      <AiVideoGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onLoadIntoEditor={(file) => {
          handleVideoSelected(file);
          addToast(`AI Video "${file.name}" loaded into Studio!`, 'success');
        }}
        onPublishToGallery={(vUrl, title, dur) => {
          setPublishTarget({ src: vUrl, title, duration: dur });
          setIsPublishModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => addToast('Successfully signed in to Lorapok Labs!', 'success')}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        videoSrc={publishTarget.src}
        videoFile={videoFile}
        duration={publishTarget.duration}
        fileName={publishTarget.title}
        hasOutro={outroConfig.enabled}
        hasObjectRemoval={objectRemovalMasks.length > 0}
        onVideoPublished={(newVid) => {
          addToast(`"${newVid.title}" published to Community Gallery!`, 'success');
          setActiveView('gallery');
        }}
      />

      <AiCaptionWriterModal
        isOpen={isAiCaptionsOpen}
        onClose={() => setIsAiCaptionsOpen(false)}
        videoTitle={videoFile?.name || publishTarget.title}
        durationSeconds={duration || publishTarget.duration}
        segments={segments}
        videoSrc={videoSrc}
        onOpenDirectPublish={(caption, title, platform) => {
          setDirectPublishData({ caption, title, platform });
          setIsDirectPublishOpen(true);
        }}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
      />

      <DirectPublishModal
        isOpen={isDirectPublishOpen}
        onClose={() => setIsDirectPublishOpen(false)}
        videoTitle={directPublishData.title || videoFile?.name || publishTarget.title}
        initialCaption={directPublishData.caption}
        videoSrc={videoSrc || publishTarget.src}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenAiCaptions={() => setIsAiCaptionsOpen(true)}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        onSaved={() => addToast('API Vault credentials updated in local storage!', 'success')}
      />

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        onOpenUrlImport={() => setIsUrlImportOpen(true)}
        onOpenOutroStudio={() => setIsOutroStudioOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <MetadataDrawer
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        metadata={metadata}
        totalSegmentsCount={segments.filter((s) => s.enabled).length}
        totalKeptDuration={totalKeptDuration}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
