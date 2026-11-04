import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { SegmentsList } from './components/SegmentsList';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { MetadataDrawer } from './components/MetadataDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { VideoSegment, CutMode, VideoMetadata, SEGMENT_COLORS } from './types';
import { formatTime } from './utils/timeFormat';
import { generateSampleVideo } from './utils/sampleGenerator';
import { computeEffectiveIntervals } from './utils/videoProcessor';

export const App: React.FC = () => {
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
  const [isMetadataOpen, setIsMetadataOpen] = useState<boolean>(false);

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
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setCurrentTime(0);
    setIsPlaying(false);

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

      // Initialize with 2 default logical portions for instant productivity
      if (dur > 0) {
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
  }, [videoSrc]);

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
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenMetadata={() => setIsMetadataOpen(true)}
        onResetVideo={handleResetVideo}
        totalSegmentsCount={segments.filter((s) => s.enabled).length}
        totalKeptDurationFormatted={formatTime(totalKeptDuration)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        {!videoSrc ? (
          /* Empty / Dropzone State */
          <Dropzone
            onVideoSelected={handleVideoSelected}
            onLoadSample={handleLoadSample}
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
                totalKeptDuration={totalKeptDuration}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-bio-border/60 bg-bio-void py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bio-emerald" />
            <span>LoraGi • Bio-Digital Synthesis Video Precision Cutter</span>
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

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        videoSrc={videoSrc || ''}
        duration={duration}
        segments={segments}
        cutMode={cutMode}
        fileName={videoFile?.name || 'loragi_cut'}
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
