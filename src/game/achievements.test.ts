import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACHIEVEMENTS,
  evaluateUnlockedAchievements,
} from './achievements';

test('evaluateUnlockedAchievements unlocks milestones accurately and never relocks medals', () => {
  const none = evaluateUnlockedAchievements({
    currentAchievements: [],
    romanceScore: 0,
    bestScore: 0,
    choicesCount: 0,
    completedQuests: [],
    unlockedEndings: [],
  });
  assert.deepEqual(none, []);

  const step1 = evaluateUnlockedAchievements({
    currentAchievements: none,
    romanceScore: 10,
    bestScore: 10,
    choicesCount: 1,
    completedQuests: ['firefly_signal'],
    unlockedEndings: [],
  });
  assert.deepEqual(step1, ['first_meeting', 'trail_scout']);

  // All quests + Devoted + True Ending + All Endings
  const all = evaluateUnlockedAchievements({
    currentAchievements: step1,
    romanceScore: 30,
    bestScore: 55,
    choicesCount: 5,
    completedQuests: ['firefly_signal', 'bridge_riddle', 'watchtower_kindling'],
    unlockedEndings: [
      'hearthbound',
      'silver_truce',
      'midnight_enigma',
      'guarded_parting',
    ],
  });
  assert.equal(all.length, ACHIEVEMENTS.length);

  // Starting a fresh run retains previously unlocked medals
  const preserved = evaluateUnlockedAchievements({
    currentAchievements: ['first_meeting', 'true_ending'],
    romanceScore: 0,
    bestScore: 0,
    choicesCount: 0,
    completedQuests: [],
    unlockedEndings: [],
  });
  assert.deepEqual(preserved, ['first_meeting', 'true_ending']);
});
