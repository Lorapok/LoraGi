import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

interface AudioVisualizerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ videoRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setupAudio = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.8;

          // Note: createMediaElementSource can only be called once per HTMLMediaElement
          const source = ctx.createMediaElementSource(video);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          sourceRef.current = source;
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      } catch {
        // Handled silently for cross-origin or existing source
      }
    };

    const handlePlay = () => {
      setupAudio();
    };

    video.addEventListener('play', handlePlay);
    return () => {
      video.removeEventListener('play', handlePlay);
    };
  }, [videoRef]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current?.frequencyBinCount || 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Idle organic biological pulse
        const time = Date.now() * 0.003;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(10, Math.sin(time + i * 0.3) * 20 + 25);
        }
      }

      const barWidth = (width / bufferLength) - 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const barHeight = Math.max(3, (val / 255) * height);

        // Gradient from bio-emerald to bio-cyan
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 245, 160, 0.3)');
        gradient.addColorStop(0.7, 'rgba(0, 245, 160, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 210, 255, 1)');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00f5a0';
        ctx.shadowBlur = isPlaying ? 6 : 2;

        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, Math.max(2, barWidth), barHeight, [2, 2, 0, 0]);
        ctx.fill();

        x += barWidth + 1.5;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bio-glass border border-bio-border">
      <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-bio-emerald animate-pulse' : 'text-slate-500'}`} />
      <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase hidden sm:inline">Sensory FFT</span>
      <canvas
        ref={canvasRef}
        width={140}
        height={24}
        className="w-24 sm:w-32 h-5 rounded overflow-hidden"
      />
    </div>
  );
};
