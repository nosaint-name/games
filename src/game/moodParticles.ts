import { CharacterMood } from './storyData';

export type MoodEffectKind = 'falling-leaves' | 'swirling-mist' | 'warm-embers';

export interface MoodParticleProfile {
  mood: CharacterMood;
  effectName: MoodEffectKind;
  activeCount: number;
  baseVx: number;
  baseVy: number;
  swayAmplitude: number;
  swayFrequency: number;
  minSize: number;
  maxSize: number;
  minAlpha: number;
  maxAlpha: number;
  colors: readonly string[];
}

export interface Particle {
  index: number;
  xNorm: number;
  yNorm: number;
  sizeNorm: number;
  speedFactor: number;
  alphaFactor: number;
  phase: number;
  rotation: number;
  spin: number;
  colorSlot: number;
}

export const MAX_PARTICLE_COUNT = 42;

const PROFILES: Record<CharacterMood, MoodParticleProfile> = {
  neutral: {
    mood: 'neutral',
    effectName: 'falling-leaves',
    activeCount: 28,
    baseVx: 14,
    baseVy: 24,
    swayAmplitude: 22,
    swayFrequency: 1.35,
    minSize: 3.5,
    maxSize: 7.5,
    minAlpha: 0.18,
    maxAlpha: 0.42,
    colors: ['#5F746C', '#82958B', '#A89474'],
  },
  guarded: {
    mood: 'guarded',
    effectName: 'swirling-mist',
    activeCount: 22,
    baseVx: 26,
    baseVy: 0,
    swayAmplitude: 14,
    swayFrequency: 0.75,
    minSize: 56,
    maxSize: 130,
    minAlpha: 0.045,
    maxAlpha: 0.115,
    colors: ['#9CB3BA', '#B7CAD0', '#7D969E'],
  },
  warm: {
    mood: 'warm',
    effectName: 'warm-embers',
    activeCount: 34,
    baseVx: 4,
    baseVy: -18,
    swayAmplitude: 16,
    swayFrequency: 1.6,
    minSize: 1.5,
    maxSize: 3.4,
    minAlpha: 0.22,
    maxAlpha: 0.56,
    colors: ['#E09F5A', '#F3C784', '#FCE5B4'],
  },
};

export function getMoodParticleProfile(
  mood: CharacterMood
): MoodParticleProfile {
  return PROFILES[mood] ?? PROFILES.neutral;
}

export function createParticlePool(
  count: number = MAX_PARTICLE_COUNT,
  rng: () => number = Math.random
): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    index,
    xNorm: rng(),
    yNorm: rng(),
    sizeNorm: rng(),
    speedFactor: 0.65 + rng() * 0.7,
    alphaFactor: rng(),
    phase: rng() * Math.PI * 2,
    rotation: rng() * Math.PI * 2,
    spin: (rng() - 0.5) * 1.4,
    colorSlot: index,
  }));
}

export function stepParticle(
  particle: Particle,
  profile: MoodParticleProfile,
  dt: number,
  width: number,
  height: number
): void {
  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 240);
  const clampedDt = Math.min(Math.max(dt, 0), 0.05);

  particle.phase += clampedDt * profile.swayFrequency * particle.speedFactor;
  particle.rotation += clampedDt * particle.spin;

  const swirlX = Math.cos(particle.phase) * profile.swayAmplitude;
  const swirlY =
    profile.effectName === 'swirling-mist'
      ? Math.sin(particle.phase * 1.15) * profile.swayAmplitude
      : 0;

  const dx = (profile.baseVx * particle.speedFactor + swirlX) * clampedDt;
  const dy = (profile.baseVy * particle.speedFactor + swirlY) * clampedDt;

  particle.xNorm += dx / safeW;
  particle.yNorm += dy / safeH;

  const padX = profile.effectName === 'swirling-mist' ? 0.18 : 0.04;
  const padY = profile.effectName === 'swirling-mist' ? 0.12 : 0.05;

  if (particle.xNorm > 1 + padX) particle.xNorm = -padX;
  if (particle.xNorm < -padX) particle.xNorm = 1 + padX;

  if (particle.yNorm > 1 + padY) particle.yNorm = -padY;
  if (particle.yNorm < -padY) particle.yNorm = 1 + padY;
}
