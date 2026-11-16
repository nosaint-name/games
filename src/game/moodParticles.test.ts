import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createParticlePool,
  getMoodParticleProfile,
  MAX_PARTICLE_COUNT,
  stepParticle,
} from './moodParticles';

test('getMoodParticleProfile maps each mood to its subtle atmospheric effect', () => {
  const neutral = getMoodParticleProfile('neutral');
  assert.equal(neutral.effectName, 'falling-leaves');
  assert.ok(neutral.baseVy > 0);

  const guarded = getMoodParticleProfile('guarded');
  assert.equal(guarded.effectName, 'swirling-mist');
  assert.ok(guarded.baseVx > 0);
  assert.ok(guarded.maxAlpha <= 0.15);

  const warm = getMoodParticleProfile('warm');
  assert.equal(warm.effectName, 'warm-embers');
  assert.ok(warm.baseVy < 0);
});

test('stepParticle updates positions according to mood direction and wraps cleanly', () => {
  let seed = 0.25;
  const deterministicRng = () => {
    seed = (seed * 9301 + 49297) % 233280 / 233280;
    return seed;
  };
  const pool = createParticlePool(MAX_PARTICLE_COUNT, deterministicRng);
  assert.equal(pool.length, MAX_PARTICLE_COUNT);

  // Neutral falling leaf moves downward and wraps from bottom to top
  const leaf = { ...pool[0], xNorm: 0.5, yNorm: 1.0495 };
  const neutralProfile = getMoodParticleProfile('neutral');
  stepParticle(leaf, neutralProfile, 0.05, 1280, 720);
  assert.ok(leaf.yNorm < 0, 'falling leaf wraps above top edge after crossing bottom');

  // Warm ember moves upward and wraps from top to bottom
  const ember = { ...pool[1], xNorm: 0.5, yNorm: -0.0495 };
  const warmProfile = getMoodParticleProfile('warm');
  stepParticle(ember, warmProfile, 0.05, 1280, 720);
  assert.ok(ember.yNorm > 1, 'rising ember wraps below bottom edge after crossing top');

  // Swirling mist moves horizontally across the viewport and wraps smoothly
  const mist = { ...pool[2], xNorm: 1.1795, yNorm: 0.5 };
  const guardedProfile = getMoodParticleProfile('guarded');
  stepParticle(mist, guardedProfile, 0.05, 1280, 720);
  assert.ok(mist.xNorm < 0, 'swirling mist wraps cleanly to left entry edge');
});
