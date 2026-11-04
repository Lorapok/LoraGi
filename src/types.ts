export interface VideoSegment {
  id: string;
  name: string;
  start: number; // in seconds
  end: number;   // in seconds
  color: string;
  enabled: boolean;
}

export type CutMode = 'keep' | 'remove';

export type ExportType = 'merged' | 'separate' | 'zip' | 'screenshot';

export type ExportFormat = 'webm' | 'mp4';

export type ExportQuality = 'original' | 'high' | 'balanced';

export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  estimatedFps: number;
}

export interface OutroConfig {
  enabled: boolean;
  type: 'custom_video' | 'bio_card';
  videoFile?: File | null;
  videoSrc?: string | null;
  duration?: number;
  title: string;
  subtitle: string;
  durationSeconds: number;
  themeColor: string;
}

export interface ExportProgress {
  isExporting: boolean;
  type: ExportType;
  currentSegmentIndex: number;
  totalSegments: number;
  progressPercent: number;
  statusMessage: string;
}

export const SEGMENT_COLORS = [
  '#00f5a0', // Bio Emerald
  '#00d2ff', // Bio Cyan
  '#a855f7', // Bio Violet
  '#ffb800', // Bio Amber
  '#ff3366', // Bio Rose
  '#38bdf8', // Sky
  '#f43f5e', // Coral
  '#10b981', // Mint
  '#c084fc', // Lilac
];
