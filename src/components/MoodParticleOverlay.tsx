import { useEffect, useRef } from 'react';
import {
  createParticlePool,
  getMoodParticleProfile,
  MAX_PARTICLE_COUNT,
  MoodParticleProfile,
  Particle,
  stepParticle,
} from '../game/moodParticles';
import { CharacterMood } from '../game/storyData';

interface MoodParticleOverlayProps {
  mood: CharacterMood;
  paused?: boolean;
}

function drawFallingLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.72, -size * 0.25, 0, size);
  ctx.quadraticCurveTo(-size * 0.72, -size * 0.25, 0, -size);
  ctx.fill();

  ctx.strokeStyle = 'rgba(11, 18, 21, 0.25)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.75);
  ctx.lineTo(0, size * 0.75);
  ctx.stroke();
  ctx.restore();
}

function drawSwirlingMist(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  phase: number,
  color: string,
  alpha: number
) {
  const rx = size * (1.25 + 0.18 * Math.sin(phase));
  const ry = size * 0.36;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(phase * 0.5) * 0.14);
  ctx.scale(1, ry / rx);

  const grad = ctx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(11, 18, 21, 0)');

  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWarmEmber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.32;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  pool: Particle[],
  profile: MoodParticleProfile,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
  const count = Math.min(profile.activeCount, pool.length);

  for (let i = 0; i < count; i++) {
    const p = pool[i];
    const x = p.xNorm * width;
    const y = p.yNorm * height;
    const size =
      profile.minSize + p.sizeNorm * (profile.maxSize - profile.minSize);
    const pulse = 0.65 + 0.35 * Math.sin(p.phase * 1.4);
    const alpha =
      (profile.minAlpha + p.alphaFactor * (profile.maxAlpha - profile.minAlpha)) *
      pulse;
    const color = profile.colors[p.colorSlot % profile.colors.length];

    if (profile.effectName === 'falling-leaves') {
      drawFallingLeaf(ctx, x, y, size, p.rotation, color, alpha);
    } else if (profile.effectName === 'swirling-mist') {
      // Keep mist wisps mostly over lower/mid atmosphere for readability
      const mistY = height * (0.28 + p.yNorm * 0.68);
      drawSwirlingMist(ctx, x, mistY, size, p.phase, color, alpha);
    } else {
      drawWarmEmber(ctx, x, y, size, color, alpha);
    }
  }
}

export function MoodParticleOverlay({
  mood,
  paused = false,
}: MoodParticleOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moodRef = useRef<CharacterMood>(mood);
  const pausedRef = useRef<boolean>(paused);

  const profile = getMoodParticleProfile(mood);

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

    const pool = createParticlePool(MAX_PARTICLE_COUNT);
    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const activeProfile = getMoodParticleProfile(moodRef.current);
      const isFrozen = pausedRef.current || prefersReduced;

      if (!isFrozen) {
        for (let i = 0; i < activeProfile.activeCount; i++) {
          stepParticle(pool[i], activeProfile, dt, width, height);
        }
      }

      renderParticles(ctx, pool, activeProfile, width, height);
      if (!prefersReduced) {
        rafId = requestAnimationFrame(frame);
      }
    };

    if (prefersReduced) {
      renderParticles(ctx, pool, getMoodParticleProfile(moodRef.current), width, height);
    } else {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="mood-particle-overlay"
      data-mood={mood}
      data-effect={profile.effectName}
      className="pointer-events-none fixed inset-0 z-15 h-full w-full"
      aria-hidden="true"
    />
  );
}
