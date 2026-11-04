/**
 * Generates an in-browser 15-second high-tech sample video with animated
 * biological visuals, timecodes, and audio tone using HTML5 Canvas + MediaRecorder.
 */
export async function generateSampleVideo(): Promise<File> {
  return new Promise((resolve, reject) => {
    const width = 1280;
    const height = 720;
    const fps = 30;
    const durationSec = 15;
    const totalFrames = fps * durationSec;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Cannot create canvas context for sample video generation'));
      return;
    }

    // Audio tone generation
    let combinedStream: MediaStream;
    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
      const dest = audioCtx.createMediaStreamDestination();
      osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.05; // soft ambient hum
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 note
      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      const canvasStream = canvas.captureStream(fps);
      const audioTracks = dest.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
      }
      combinedStream = canvasStream;
    } catch {
      combinedStream = canvas.captureStream(fps);
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 4_000_000 });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (osc) {
        try { osc.stop(); } catch {}
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], 'lorapok_sample_stream.webm', { type: mimeType });
      resolve(file);
    };

    let frame = 0;
    recorder.start(100);

    const renderLoop = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const timeSec = frame / fps;
      const progress = frame / totalFrames;

      // Deep void cybernetic background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#05070c');
      grad.addColorStop(0.5, '#0b111e');
      grad.addColorStop(1, '#080d17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Cybernetic grid
      ctx.strokeStyle = 'rgba(0, 245, 160, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 40;
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

      // Animated Biological Pulse Rings
      const centerX = width / 2;
      const centerY = height / 2 - 20;

      for (let r = 0; r < 4; r++) {
        const radius = 60 + r * 50 + (Math.sin(timeSec * 3 + r) * 15);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = r % 2 === 0 ? 'rgba(0, 245, 160, 0.4)' : 'rgba(0, 210, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Rotating cybernetic arc
      ctx.beginPath();
      const startAngle = timeSec * 2;
      const endAngle = startAngle + Math.PI * 1.2;
      ctx.arc(centerX, centerY, 130, startAngle, endAngle);
      ctx.strokeStyle = '#00f5a0';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Center title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LORAPOK LABS • LORAGI DEMO', centerX, centerY - 10);

      // Subtitle
      ctx.fillStyle = '#00f5a0';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText('BIO-DIGITAL PRECISION VIDEO TEST STREAM', centerX, centerY + 30);

      // Live animated timecode counter
      const mm = String(Math.floor(timeSec / 60)).padStart(2, '0');
      const ss = String(Math.floor(timeSec % 60)).padStart(2, '0');
      const ms = String(Math.floor((timeSec % 1) * 1000)).padStart(3, '0');
      ctx.fillStyle = '#00d2ff';
      ctx.font = 'bold 52px "JetBrains Mono", monospace';
      ctx.fillText(`${mm}:${ss}.${ms}`, centerX, centerY + 120);

      // Frame number & duration bar
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillText(`FRAME ${frame + 1} / ${totalFrames} (FPS: ${fps})`, centerX, centerY + 160);

      // Bottom progress bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(80, height - 60, width - 160, 12);
      ctx.fillStyle = '#00f5a0';
      ctx.fillRect(80, height - 60, (width - 160) * progress, 12);

      frame++;
      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  });
}
