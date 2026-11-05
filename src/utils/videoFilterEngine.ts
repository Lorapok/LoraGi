/**
 * LoraGi Video Filter & Aspect Ratio Engine
 * Provides real-time CSS filters, LUT presets, and Canvas-based color grading
 * inspired by Adobe Premiere Pro and Canva Video Studio.
 */

import { VideoAdjustments, VideoFilterPreset, AspectRatioMode } from '../types';

export const FILTER_PRESETS: Array<{
  id: VideoFilterPreset;
  name: string;
  description: string;
  badge: string;
}> = [
  { id: 'none', name: 'Original', description: 'Clean natural footage with zero grading', badge: 'Natural' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'Vibrant cyan/magenta accents and deep shadows', badge: 'Neon High-Contrast' },
  { id: 'portra', name: 'Cinematic Portra', description: 'Warm analog film tones with soft highlights', badge: 'Kodak Portra' },
  { id: 'bio_emerald', name: 'Bio Emerald', description: 'Lorapok Labs signature mint-phosphor grading', badge: 'Sensory Bio' },
  { id: 'noir', name: 'Noir Monochrome', description: 'Dramatic black & white with rich dynamic range', badge: 'Classic 35mm' },
  { id: 'vibrant', name: 'Vibrant Boost', description: 'Punchy saturation and clarity for social feeds', badge: 'Social Pop' },
];

export const ASPECT_RATIOS: Array<{
  id: AspectRatioMode;
  label: string;
  ratio: string;
  target: string;
  dimensionsText: string;
}> = [
  { id: 'original', label: 'Native', ratio: 'auto', target: 'Source Video', dimensionsText: 'Original' },
  { id: '16:9', label: '16:9 Landscape', ratio: '16/9', target: 'YouTube, Web, TV', dimensionsText: '1920 × 1080' },
  { id: '9:16', label: '9:16 Portrait', ratio: '9/16', target: 'TikTok, Reels, Shorts', dimensionsText: '1080 × 1920' },
  { id: '1:1', label: '1:1 Square', ratio: '1/1', target: 'Instagram Feed', dimensionsText: '1080 × 1080' },
  { id: '4:5', label: '4:5 Portrait', ratio: '4/5', target: 'Social Carousels', dimensionsText: '1080 × 1350' },
  { id: '21:9', label: '21:9 Ultrawide', ratio: '21/9', target: 'Cinematic Scope', dimensionsText: '2560 × 1080' },
];

/**
 * Computes CSS filter string for live video playback
 */
export function computeCssFilter(adjustments: VideoAdjustments): string {
  const parts: string[] = [];

  // Brightness
  if (adjustments.brightness !== 1) {
    parts.push(`brightness(${adjustments.brightness})`);
  }

  // Contrast
  if (adjustments.contrast !== 1) {
    parts.push(`contrast(${adjustments.contrast})`);
  }

  // Saturation
  if (adjustments.saturation !== 1) {
    parts.push(`saturate(${adjustments.saturation})`);
  }

  // Preset LUTs
  switch (adjustments.filter) {
    case 'cyberpunk':
      parts.push('contrast(1.2) saturate(1.35) hue-rotate(-12deg)');
      break;
    case 'portra':
      parts.push('contrast(1.08) saturate(1.15) sepia(0.12)');
      break;
    case 'bio_emerald':
      parts.push('contrast(1.12) saturate(1.2) hue-rotate(25deg)');
      break;
    case 'noir':
      parts.push('grayscale(1) contrast(1.3) brightness(0.95)');
      break;
    case 'vibrant':
      parts.push('contrast(1.15) saturate(1.4) brightness(1.05)');
      break;
    default:
      break;
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Apply canvas filter to 2D rendering context
 */
export function applyCanvasFilter(ctx: CanvasRenderingContext2D, adjustments: VideoAdjustments) {
  const filterString = computeCssFilter(adjustments);
  ctx.filter = filterString === 'none' ? 'none' : filterString;
}

/**
 * Draw Canva/TikTok safe-zone guides over canvas viewport
 */
export function drawSafeZoneOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  aspectRatio: AspectRatioMode
) {
  if (aspectRatio !== '9:16') return;

  ctx.save();

  // Top header safe margin (top 12% is profile/search in TikTok/Reels)
  const topSafeHeight = height * 0.12;
  ctx.fillStyle = 'rgba(255, 51, 102, 0.15)';
  ctx.fillRect(0, 0, width, topSafeHeight);

  // Bottom action bar safe margin (bottom 22% is caption/music disc)
  const bottomSafeHeight = height * 0.22;
  const bottomSafeY = height - bottomSafeHeight;
  ctx.fillStyle = 'rgba(255, 51, 102, 0.15)';
  ctx.fillRect(0, bottomSafeY, width, bottomSafeHeight);

  // Right-hand interaction rail safe margin (right 16%)
  const rightSafeWidth = width * 0.16;
  const rightSafeX = width - rightSafeWidth;
  ctx.fillStyle = 'rgba(255, 184, 0, 0.12)';
  ctx.fillRect(rightSafeX, topSafeHeight, rightSafeWidth, height - topSafeHeight - bottomSafeHeight);

  // Safe-zone text badges
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('TikTok / Reels UI Safe Zone', 16, topSafeHeight - 8);
  ctx.fillText('Keep key visuals inside center bounds', 16, bottomSafeY + 20);

  ctx.restore();
}
