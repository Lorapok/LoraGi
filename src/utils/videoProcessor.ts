import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { VideoSegment, CutMode, ExportFormat, ExportQuality } from '../types';

export interface ExportInterval {
  start: number;
  end: number;
  name: string;
}

/**
 * Computes the actual intervals to keep based on 'keep' or 'remove' mode
 */
export function computeEffectiveIntervals(
  segments: VideoSegment[],
  totalDuration: number,
  mode: CutMode
): ExportInterval[] {
  const activeSegments = segments
    .filter(s => s.enabled && s.end > s.start)
    .sort((a, b) => a.start - b.start);

  if (activeSegments.length === 0) {
    return [{ start: 0, end: totalDuration, name: 'Full Video' }];
  }

  if (mode === 'keep') {
    return activeSegments.map((s, idx) => ({
      start: Math.max(0, s.start),
      end: Math.min(totalDuration, s.end),
      name: s.name || `Portion ${idx + 1}`
    }));
  }

  // Remove mode (ripple cut out): keep everything EXCEPT activeSegments
  const keptIntervals: ExportInterval[] = [];
  let currentPos = 0;

  for (let i = 0; i < activeSegments.length; i++) {
    const seg = activeSegments[i];
    const segStart = Math.max(0, Math.min(totalDuration, seg.start));
    const segEnd = Math.max(0, Math.min(totalDuration, seg.end));

    if (segStart > currentPos + 0.05) {
      keptIntervals.push({
        start: currentPos,
        end: segStart,
        name: `Retained Part ${keptIntervals.length + 1}`
      });
    }
    currentPos = Math.max(currentPos, segEnd);
  }

  if (currentPos < totalDuration - 0.05) {
    keptIntervals.push({
      start: currentPos,
      end: totalDuration,
      name: `Retained Part ${keptIntervals.length + 1}`
    });
  }

  return keptIntervals;
}

/**
 * Detects the best supported MediaRecorder mimeType for the browser
 */
export function getSupportedMimeType(formatPreference: ExportFormat = 'webm'): string {
  const candidates = formatPreference === 'mp4'
    ? [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ]
    : [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4;codecs=avc1',
        'video/mp4'
      ];

  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'video/webm';
}

/**
 * Calculates target bitrate based on quality preference
 */
export function getBitrateForQuality(quality: ExportQuality): number {
  switch (quality) {
    case 'high':
      return 8_000_000; // 8 Mbps
    case 'balanced':
      return 4_000_000; // 4 Mbps
    case 'original':
    default:
      return 12_000_000; // 12 Mbps
  }
}

/**
 * Cuts a single interval from a video file into a Blob using Canvas + MediaRecorder
 */
export async function renderIntervalToBlob(
  videoSrc: string,
  interval: { start: number; end: number },
  format: ExportFormat = 'webm',
  quality: ExportQuality = 'high',
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.muted = false;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const duration = interval.end - interval.start;

      if (duration <= 0.05) {
        reject(new Error('Segment duration is too short to cut.'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) {
        reject(new Error('Could not initialize 2D canvas context.'));
        return;
      }

      // Audio setup using AudioContext to preserve audio track in recording
      let combinedStream: MediaStream;
      let audioCtx: AudioContext | null = null;
      let sourceNode: MediaElementAudioSourceNode | null = null;

      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const dest = audioCtx.createMediaStreamDestination();
        sourceNode = audioCtx.createMediaElementSource(video);
        sourceNode.connect(dest);
        // Also connect to silent or let video play
        const canvasStream = canvas.captureStream(30);
        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          canvasStream.addTrack(audioTracks[0]);
        }
        combinedStream = canvasStream;
      } catch {
        // Fallback if AudioContext is restricted
        combinedStream = canvas.captureStream(30);
      }

      const mimeType = getSupportedMimeType(format);
      const bitrate = getBitrateForQuality(quality);

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: bitrate
        });
      } catch {
        recorder = new MediaRecorder(combinedStream);
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        video.pause();
        video.src = '';
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
        const finalBlob = new Blob(chunks, { type: mimeType });
        resolve(finalBlob);
      };

      recorder.onerror = (err) => {
        reject(err);
      };

      let animationId: number;

      const drawLoop = () => {
        if (video.currentTime >= interval.end || video.ended) {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          cancelAnimationFrame(animationId);
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);

        const currentElapsed = video.currentTime - interval.start;
        const progress = Math.min(100, Math.max(0, (currentElapsed / duration) * 100));
        onProgress?.(progress);

        animationId = requestAnimationFrame(drawLoop);
      };

      video.currentTime = interval.start;
      video.onseeked = () => {
        video.onseeked = null;
        recorder.start(100);
        video.play().then(() => {
          animationId = requestAnimationFrame(drawLoop);
        }).catch(reject);
      };
    };

    video.onerror = () => {
      reject(new Error('Failed to load video element for cutting.'));
    };
  });
}

/**
 * Merges multiple intervals into a single continuous video Blob
 */
export async function renderMergedIntervalsToBlob(
  videoSrc: string,
  intervals: ExportInterval[],
  format: ExportFormat = 'webm',
  quality: ExportQuality = 'high',
  onProgress?: (percent: number, currentPart: number, totalParts: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (intervals.length === 0) {
      reject(new Error('No intervals to merge.'));
      return;
    }

    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.muted = false;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const totalMergeDuration = intervals.reduce((acc, curr) => acc + (curr.end - curr.start), 0);
      if (totalMergeDuration <= 0.1) {
        reject(new Error('Total merged duration is too short.'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) {
        reject(new Error('Could not initialize canvas context.'));
        return;
      }

      let combinedStream: MediaStream;
      let audioCtx: AudioContext | null = null;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const dest = audioCtx.createMediaStreamDestination();
        const sourceNode = audioCtx.createMediaElementSource(video);
        sourceNode.connect(dest);
        const canvasStream = canvas.captureStream(30);
        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          canvasStream.addTrack(audioTracks[0]);
        }
        combinedStream = canvasStream;
      } catch {
        combinedStream = canvas.captureStream(30);
      }

      const mimeType = getSupportedMimeType(format);
      const bitrate = getBitrateForQuality(quality);

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: bitrate
        });
      } catch {
        recorder = new MediaRecorder(combinedStream);
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        video.pause();
        video.src = '';
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(() => {});
        resolve(new Blob(chunks, { type: mimeType }));
      };

      let currentIntervalIndex = 0;
      let completedDurationBefore = 0;
      let animationId: number;

      const playNextInterval = () => {
        if (currentIntervalIndex >= intervals.length) {
          if (recorder.state === 'recording') recorder.stop();
          cancelAnimationFrame(animationId);
          return;
        }

        const currentInterval = intervals[currentIntervalIndex];
        video.currentTime = currentInterval.start;

        video.onseeked = () => {
          video.onseeked = null;
          video.play().then(() => {
            animationId = requestAnimationFrame(drawIntervalLoop);
          }).catch(reject);
        };
      };

      const drawIntervalLoop = () => {
        const currentInterval = intervals[currentIntervalIndex];

        if (video.currentTime >= currentInterval.end || video.ended) {
          video.pause();
          cancelAnimationFrame(animationId);
          completedDurationBefore += (currentInterval.end - currentInterval.start);
          currentIntervalIndex++;
          playNextInterval();
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);

        const currentPartElapsed = Math.max(0, video.currentTime - currentInterval.start);
        const totalElapsedSoFar = completedDurationBefore + currentPartElapsed;
        const progress = Math.min(100, Math.max(0, (totalElapsedSoFar / totalMergeDuration) * 100));

        onProgress?.(progress, currentIntervalIndex + 1, intervals.length);

        animationId = requestAnimationFrame(drawIntervalLoop);
      };

      // Start initial recording and sequence
      recorder.start(100);
      playNextInterval();
    };

    video.onerror = () => {
      reject(new Error('Failed to load video element for merge process.'));
    };
  });
}

/**
 * Downloads a Blob as a file with proper extension
 */
export function downloadBlob(blob: Blob, fileName: string, format: ExportFormat = 'webm') {
  const extension = format === 'mp4' && blob.type.includes('mp4') ? 'mp4' : 'webm';
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  saveAs(blob, `${cleanName}.${extension}`);
}

/**
 * Exports multiple cut portions into a single downloaded ZIP archive
 */
export async function exportPortionsToZip(
  blobs: { name: string; blob: Blob; format: ExportFormat }[],
  zipFilename: string = 'loragi_video_cuts.zip'
) {
  const zip = new JSZip();
  blobs.forEach((item, idx) => {
    const ext = item.format === 'mp4' && item.blob.type.includes('mp4') ? 'mp4' : 'webm';
    const filename = `${String(idx + 1).padStart(2, '0')}_${item.name.replace(/\s+/g, '_')}.${ext}`;
    zip.file(filename, item.blob);
  });

  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, zipFilename);
}

/**
 * Captures a single crisp frame from the video element at natural resolution
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  fileName: string = 'frame_capture'
) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1920;
  canvas.height = video.videoHeight || 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `${fileName}_${Math.floor(video.currentTime)}s.png`);
    }
  }, 'image/png');
}
