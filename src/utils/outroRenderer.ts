import { OutroConfig } from '../types';

/**
 * Draws a single frame of the Bio-Digital Outro onto a canvas
 */
export function drawBioOutroFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedSec: number,
  totalSec: number,
  config: OutroConfig
) {
  const progress = Math.min(1, Math.max(0, elapsedSec / totalSec));

  // 1. Deep Void background with gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#04060a');
  bgGrad.addColorStop(0.5, '#090e18');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Animated Cybernetic Grid
  ctx.strokeStyle = `${config.themeColor}12`;
  ctx.lineWidth = 1;
  const gridSize = Math.max(30, Math.floor(width / 32));
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Central Bio-Luminescent Pulsing Rings
  const centerX = width / 2;
  const centerY = height / 2 - (height * 0.05);

  const pulseScale = 1 + Math.sin(elapsedSec * 4) * 0.06;
  const baseRadius = Math.min(width, height) * 0.18;

  for (let i = 1; i <= 3; i++) {
    const r = (baseRadius * i * 0.6) * pulseScale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.strokeStyle = i === 1 ? config.themeColor : `${config.themeColor}40`;
    ctx.lineWidth = i === 1 ? 3 : 1.5;
    ctx.stroke();
  }

  // 4. Rotating Energy Orbit
  ctx.beginPath();
  const orbitAngle = elapsedSec * 2.5;
  ctx.arc(centerX, centerY, baseRadius * 1.1, orbitAngle, orbitAngle + Math.PI * 0.8);
  ctx.strokeStyle = config.themeColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 5. Vaultie Emblem in Center
  ctx.save();
  ctx.translate(centerX, centerY);
  const iconSize = baseRadius * 0.6;
  ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
  ctx.strokeStyle = config.themeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, iconSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cybernetic Larva icon dots
  ctx.fillStyle = config.themeColor;
  ctx.beginPath();
  ctx.arc(0, -iconSize * 0.25, iconSize * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, iconSize * 0.2, iconSize * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Typography
  ctx.textAlign = 'center';

  // Title
  const titleFontSize = Math.max(22, Math.floor(width * 0.038));
  ctx.font = `bold ${titleFontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = config.themeColor;
  ctx.shadowBlur = 15;
  ctx.fillText(config.title || 'Created With LoraGi', centerX, centerY + baseRadius * 1.5);
  ctx.shadowBlur = 0;

  // Subtitle / Credits
  const subFontSize = Math.max(13, Math.floor(width * 0.018));
  ctx.font = `500 ${subFontSize}px "JetBrains Mono", monospace`;
  ctx.fillStyle = config.themeColor;
  ctx.fillText(config.subtitle || 'Lorapok Labs • Open-Source Products That Feel Alive', centerX, centerY + baseRadius * 1.5 + titleFontSize + 12);

  // 7. Smooth Fade In / Fade Out vignette
  if (progress < 0.15) {
    const alpha = 1 - (progress / 0.15);
    ctx.fillStyle = `rgba(5, 7, 12, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  } else if (progress > 0.85) {
    const alpha = (progress - 0.85) / 0.15;
    ctx.fillStyle = `rgba(5, 7, 12, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }
}
