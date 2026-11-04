/**
 * Formats seconds into HH:MM:SS.mmm or MM:SS.mmm
 */
export function formatTime(seconds: number, includeMs: boolean = true): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z: number = 2) => String(n).padStart(z, '0');

  if (hrs > 0) {
    return includeMs
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`
      : `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return includeMs
    ? `${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`
    : `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats seconds into SMPTE-like timecode HH:MM:SS:FF based on fps
 */
export function formatTimecode(seconds: number, fps: number = 30): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

/**
 * Parses user input string (e.g. "01:23.456", "00:02:10", "45.2") to seconds
 */
export function parseTimeToSeconds(timeStr: string): number | null {
  const clean = timeStr.trim();
  if (!clean) return null;

  // Single number like "45" or "12.5"
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return parseFloat(clean);
  }

  // Format HH:MM:SS or MM:SS with optional .ms
  const parts = clean.split(':');
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]);
    const secs = parseFloat(parts[1]);
    if (!isNaN(mins) && !isNaN(secs)) {
      return mins * 60 + secs;
    }
  } else if (parts.length === 3) {
    const hrs = parseFloat(parts[0]);
    const mins = parseFloat(parts[1]);
    const secs = parseFloat(parts[2]);
    if (!isNaN(hrs) && !isNaN(mins) && !isNaN(secs)) {
      return hrs * 3600 + mins * 60 + secs;
    }
  }
  return null;
}

/**
 * Formats byte size into human readable string
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Clamps value between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
