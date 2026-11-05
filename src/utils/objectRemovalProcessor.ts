import { ObjectRemovalMask } from '../types';

/**
 * AI Video Object Removal & Inpainting Engine
 * Applies content-aware spatial interpolation, smart Gaussian blend, or background patch
 * to seamlessly remove unwanted objects, watermarks, microphones, or artifacts in video frames.
 */
export function applyObjectRemovalToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  masks: ObjectRemovalMask[],
  currentTime: number
): void {
  if (!masks || masks.length === 0) return;

  for (const mask of masks) {
    if (!mask.enabled) continue;
    if (currentTime < mask.startSec || currentTime > mask.endSec) continue;

    const rx = (mask.x / 100) * width;
    const ry = (mask.y / 100) * height;
    const rw = (mask.width / 100) * width;
    const rh = (mask.height / 100) * height;

    if (rw <= 2 || rh <= 2) continue;

    ctx.save();

    if (mask.method === 'smart_blur') {
      // Smart Gaussian blur with soft feathering
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(rx, ry, rw, rh, Math.min(mask.featherRadius, 12));
      } else {
        ctx.rect(rx, ry, rw, rh);
      }
      ctx.clip();
      ctx.filter = `blur(${Math.max(6, mask.featherRadius || 12)}px)`;
      ctx.drawImage(ctx.canvas, 0, 0);
    } else if (mask.method === 'content_aware') {
      // Content-Aware inpaint: Sample surrounding perimeter pixels and diffuse inward
      const pad = Math.max(12, mask.featherRadius * 1.5);
      const sx = Math.max(0, rx - pad);
      const sy = Math.max(0, ry - pad);
      const sw = Math.min(width - sx, rw + pad * 2);
      const sh = Math.min(height - sy, rh + pad * 2);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = rw;
      tempCanvas.height = rh;
      const tCtx = tempCanvas.getContext('2d');

      if (tCtx) {
        // Multi-stage diffusion
        tCtx.filter = `blur(${Math.max(10, mask.featherRadius * 2)}px)`;
        tCtx.drawImage(ctx.canvas, sx, sy, sw, sh, -pad / 2, -pad / 2, rw + pad, rh + pad);

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(rx, ry, rw, rh, Math.min(mask.featherRadius, 8));
        } else {
          ctx.rect(rx, ry, rw, rh);
        }
        ctx.clip();
        ctx.drawImage(tempCanvas, rx, ry);
      }
    } else if (mask.method === 'background_patch') {
      // Patch from adjacent spatial sector (horizontal clone with soft feathering)
      const sampleOffset = rx > width / 2 ? -rw - 15 : rw + 15;
      const sampleX = Math.max(0, Math.min(width - rw, rx + sampleOffset));

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(rx, ry, rw, rh, Math.min(mask.featherRadius, 8));
      } else {
        ctx.rect(rx, ry, rw, rh);
      }
      ctx.clip();
      ctx.filter = `blur(2px)`;
      ctx.drawImage(ctx.canvas, sampleX, ry, rw, rh, rx, ry, rw, rh);
    }

    ctx.restore();
  }
}
