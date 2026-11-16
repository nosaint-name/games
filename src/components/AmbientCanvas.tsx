import { useEffect, useRef } from 'react';
import { CharacterMood } from '../game/storyData';

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  alpha: number;
  warm: boolean;
}

interface AmbientCanvasProps {
  mood: CharacterMood;
  paused: boolean;
}

const MOTE_COUNT = 36;

export function AmbientCanvas({ mood, paused }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moodRef = useRef<CharacterMood>(mood);
  const pausedRef = useRef<boolean>(paused);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pre-allocated mote ring buffer (zero per-frame allocations)
    const motes: Mote[] = Array.from({ length: MOTE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 14,
      vy: -6 - Math.random() * 14,
      radius: 1.1 + Math.random() * 2.1,
      phase: (i / MOTE_COUNT) * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.5,
      warm: i % 3 === 0,
    }));

    let rafId = 0;
    let lastTime = performance.now();

    const renderFrame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      ctx.clearRect(0, 0, width, height);

      const isWarm = moodRef.current === 'warm';
      const isPaused = pausedRef.current || prefersReduced;

      for (let i = 0; i < MOTE_COUNT; i++) {
        const m = motes[i];
        if (!isPaused) {
          m.phase += dt * 1.4;
          m.x += (m.vx + Math.sin(m.phase) * 8) * dt;
          m.y += m.vy * dt;

          if (m.y < -12) {
            m.y = height + 12;
            m.x = Math.random() * width;
          }
          if (m.x < -12) m.x = width + 12;
          if (m.x > width + 12) m.x = -12;
        }

        const pulse = 0.55 + 0.45 * Math.sin(m.phase * 1.3);
        const opacity = m.alpha * pulse;

        if (m.warm || (isWarm && i % 2 === 0)) {
          ctx.fillStyle = `rgba(224, 159, 90, ${opacity.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(186, 208, 212, ${(opacity * 0.72).toFixed(3)})`;
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="ambient-canvas"
      className="pointer-events-none fixed inset-0 h-full w-full z-10"
      aria-hidden="true"
    />
  );
}
