import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceDialogue,
  completeIntro,
  completeSideQuest,
  completeSplash,
  createEmptySaveSlots,
  createInitialGameState,
  deleteSlot,
  evaluateAffinityTier,
  evaluateRelationshipStatus,
  getAvailableChoices,
  loadFromSlot,
  resumeSavedRun,
  saveToSlot,
  selectChoice,
  startNewStory,
  togglePause,
} from './engine';
import { DIALOGUE_TREE } from './storyData';

test('default initial state boots into splash and transitions to title', () => {
  const splashState = createInitialGameState();
  assert.equal(splashState.screen, 'splash');

  const titleState = completeSplash(splashState);
  assert.equal(titleState.screen, 'title');

  // Calling completeSplash when not in splash is a no-op
  assert.equal(completeSplash(titleState).screen, 'title');
});

test('opening node matches seed dialogue and positive/negative choice deltas', () => {
  const startNode = DIALOGUE_TREE.start;
  assert.equal(startNode.speaker, 'Julian');
  assert.equal(startNode.text, "You shouldn't be out in the woods after midnight.");
  assert.equal(startNode.choices.length, 2);

  const initial = createInitialGameState({ autostart: true });
  assert.equal(initial.screen, 'playing');
  assert.equal(initial.inIntro, false);
  assert.equal(initial.romanceScore, 0);

  // Positive choice (+10) -> flirt
  const flirtState = selectChoice(initial, 0);
  assert.equal(flirtState.currentNodeId, 'flirt');
  assert.equal(flirtState.romanceScore, 10);
  assert.equal(flirtState.lastDelta, 10);
  assert.equal(
    DIALOGUE_TREE[flirtState.currentNodeId].text,
    'Careful... you might find more than you bargained for.'
  );

  // Negative choice (-5) -> cold
  const coldState = selectChoice(initial, 1);
  assert.equal(coldState.currentNodeId, 'cold');
  assert.equal(coldState.romanceScore, -5);
  assert.equal(coldState.lastDelta, -5);
  assert.equal(
    DIALOGUE_TREE[coldState.currentNodeId].text,
    'Suit yourself. Stay safe.'
  );
});

test('startNewStory enters intro by default and completeIntro unlocks choices', () => {
  const titleState = createInitialGameState({ skipSplash: true });
  assert.equal(titleState.screen, 'title');
  const started = startNewStory(titleState);
  assert.equal(started.screen, 'playing');
  assert.equal(started.inIntro, true);

  // Choices are ignored while intro is active
  const blocked = selectChoice(started, 0);
  assert.equal(blocked.currentNodeId, 'start');
  assert.equal(blocked.romanceScore, 0);

  const afterIntro = completeIntro(started);
  assert.equal(afterIntro.inIntro, false);

  const picked = selectChoice(afterIntro, 0);
  assert.equal(picked.currentNodeId, 'flirt');
  assert.equal(picked.romanceScore, 10);
});

test('reaches hearthbound ending with frozen snapshot and unlocked ending', () => {
  let state = createInitialGameState({ autostart: true });
  state = selectChoice(state, 0); // +10 -> flirt
  state = selectChoice(state, 0); // +10 -> bridge_warm
  state = selectChoice(state, 0); // +10 -> bridge_confide
  state = selectChoice(state, 0); // +10 -> tower_hearth
  state = selectChoice(state, 0); // +15 -> ending_hearthbound

  assert.equal(state.screen, 'gameover');
  assert.equal(state.romanceScore, 55);
  assert.equal(state.bestScore, 55);
  assert.deepEqual(state.unlockedEndings, ['hearthbound']);
  assert.ok(state.endingSnapshot);
  assert.equal(state.endingSnapshot.endingId, 'hearthbound');
  assert.equal(state.endingSnapshot.tier, 'Devoted');
  assert.equal(state.endingSnapshot.choicesMade, 5);
});

test('reaches guarded parting ending on cold path and restarts cleanly', () => {
  let state = createInitialGameState({ autostart: true });
  state = selectChoice(state, 1); // -5 -> cold
  state = selectChoice(state, 2); // -5 -> bridge_chill
  state = selectChoice(state, 1); // -5 -> tower_cold
  state = selectChoice(state, 1); // -10 -> ending_guarded_parting

  assert.equal(state.screen, 'gameover');
  assert.equal(state.romanceScore, -25);
  assert.equal(state.endingSnapshot?.endingId, 'guarded_parting');
  assert.equal(state.endingSnapshot?.tier, 'Estranged');

  const restarted = startNewStory(state, { skipIntro: true });
  assert.equal(restarted.screen, 'playing');
  assert.equal(restarted.inIntro, false);
  assert.equal(restarted.romanceScore, 0);
  assert.equal(restarted.currentNodeId, 'start');
  assert.equal(restarted.history.length, 0);
  assert.deepEqual(restarted.unlockedEndings, ['guarded_parting']);
});

test('gates minScore choices and handles invalid choices or pause state safely', () => {
  const towerShelter = DIALOGUE_TREE.tower_shelter;
  assert.equal(getAvailableChoices(towerShelter, 0).length, 2);
  assert.equal(getAvailableChoices(towerShelter, 10).length, 3);

  let state = createInitialGameState({ autostart: true });
  const invalid = selectChoice(state, 99);
  assert.equal(invalid.currentNodeId, 'start');
  assert.equal(invalid.romanceScore, 0);

  state = togglePause(state);
  assert.equal(state.screen, 'paused');
  const blockedWhilePaused = selectChoice(state, 0);
  assert.equal(blockedWhilePaused.currentNodeId, 'start');

  state = togglePause(state);
  assert.equal(state.screen, 'playing');
});

test('evaluateAffinityTier maps score brackets and resumeSavedRun falls back safely', () => {
  assert.equal(evaluateAffinityTier(30), 'Devoted');
  assert.equal(evaluateAffinityTier(10), 'Intrigued');
  assert.equal(evaluateAffinityTier(0), 'Guarded');
  assert.equal(evaluateAffinityTier(-5), 'Estranged');

  const base = createInitialGameState();
  const resumed = resumeSavedRun(base, {
    romanceScore: 10,
    currentNodeId: 'flirt',
    history: [],
  });
  assert.equal(resumed.screen, 'playing');
  assert.equal(resumed.inIntro, false);
  assert.equal(resumed.currentNodeId, 'flirt');
  assert.equal(resumed.romanceScore, 10);

  const badResume = resumeSavedRun(base, {
    romanceScore: 10,
    currentNodeId: 'nonexistent',
    history: [],
  });
  assert.equal(badResume.currentNodeId, 'start');
  assert.equal(badResume.romanceScore, 0);
});

test('saves, loads, overwrites, and deletes three independent progress slots', () => {
  let slots = createEmptySaveSlots();

  // Branch A: flirt path (+20) saved to Slot 1 (index 0)
  let branchA = createInitialGameState({ autostart: true });
  branchA = selectChoice(branchA, 0); // flirt (+10)
  branchA = selectChoice(branchA, 0); // bridge_warm (+20)
  slots = saveToSlot(slots, branchA, 0, '2026-11-16T01:40:00.000Z');

  // Branch B: cold path (-10) saved to Slot 2 (index 1)
  let branchB = createInitialGameState({ autostart: true });
  branchB = selectChoice(branchB, 1); // cold (-5)
  branchB = selectChoice(branchB, 2); // bridge_chill (-10)
  slots = saveToSlot(slots, branchB, 1, '2026-11-16T01:41:00.000Z');

  // Branch C: curious path (+5) saved to Slot 3 (index 2)
  let branchC = createInitialGameState({ autostart: true });
  branchC = selectChoice(branchC, 0); // flirt (+10)
  branchC = selectChoice(branchC, 1); // bridge_curious (+15)
  slots = saveToSlot(slots, branchC, 2, '2026-11-16T01:42:00.000Z');

  assert.equal(slots[0]?.currentNodeId, 'bridge_warm');
  assert.equal(slots[0]?.romanceScore, 20);
  assert.equal(slots[1]?.currentNodeId, 'bridge_chill');
  assert.equal(slots[1]?.romanceScore, -10);
  assert.equal(slots[2]?.currentNodeId, 'bridge_curious');
  assert.equal(slots[2]?.romanceScore, 15);

  // Loading Slot 1 restores Branch A without touching Slots 2 & 3
  const loadedA = loadFromSlot(createInitialGameState(), slots[0]);
  assert.equal(loadedA.screen, 'playing');
  assert.equal(loadedA.currentNodeId, 'bridge_warm');
  assert.equal(loadedA.romanceScore, 20);
  assert.equal(loadedA.activeSlotIndex, 0);
  assert.equal(loadedA.history.length, 2);

  // Deleting Slot 2 leaves Slots 1 and 3 intact
  slots = deleteSlot(slots, 1);
  assert.equal(slots[1], null);
  assert.equal(slots[0]?.currentNodeId, 'bridge_warm');
  assert.equal(slots[2]?.currentNodeId, 'bridge_curious');
});

test('advanceDialogue progresses through linear beats until the next user choice', () => {
  let state = createInitialGameState({ autostart: true });
  state = selectChoice(state, 0); // flirt
  state = selectChoice(state, 2); // bridge_tease_intro (linear beat 1)
  assert.equal(state.currentNodeId, 'bridge_tease_intro');
  assert.equal(DIALOGUE_TREE[state.currentNodeId].choices.length, 0);

  state = advanceDialogue(state); // bridge_tease_step (linear beat 2)
  assert.equal(state.currentNodeId, 'bridge_tease_step');
  assert.equal(DIALOGUE_TREE[state.currentNodeId].choices.length, 0);

  state = advanceDialogue(state); // bridge_tease (choice node)
  assert.equal(state.currentNodeId, 'bridge_tease');
  assert.equal(DIALOGUE_TREE[state.currentNodeId].choices.length, 2);

  // Calling advanceDialogue at a choice node is a no-op
  const stopped = advanceDialogue(state);
  assert.equal(stopped.currentNodeId, 'bridge_tease');
});

test('completeSideQuest awards affinity once, updates bestScore, and persists in save slots', () => {
  let state = createInitialGameState({ autostart: true });
  state = completeSideQuest(state, 'firefly_signal');
  assert.equal(state.romanceScore, 5);
  assert.equal(state.bestScore, 5);
  assert.deepEqual(state.completedQuests, ['firefly_signal']);

  // Duplicate completion is ignored
  const duplicate = completeSideQuest(state, 'firefly_signal');
  assert.equal(duplicate.romanceScore, 5);
  assert.equal(duplicate.completedQuests.length, 1);

  // Save to Slot 1, clear in new story, and restore from Slot 1
  let slots = createEmptySaveSlots();
  slots = saveToSlot(slots, state, 0, '2026-11-16T03:06:00.000Z');
  assert.deepEqual(slots[0]?.completedQuests, ['firefly_signal']);

  const fresh = startNewStory(state, { skipIntro: true });
  assert.deepEqual(fresh.completedQuests, []);

  const restored = loadFromSlot(fresh, slots[0]);
  assert.deepEqual(restored.completedQuests, ['firefly_signal']);
  assert.equal(restored.romanceScore, 5);
});

test('evaluateRelationshipStatus maps romanceScore into Distant, Acquaintance, Growing Closer, and Devoted', () => {
  const distant = evaluateRelationshipStatus(-10);
  assert.equal(distant.label, 'Distant');
  assert.equal(distant.tone, 'distant');
  assert.ok(distant.progressPct < 35);

  const acquaintance = evaluateRelationshipStatus(0);
  assert.equal(acquaintance.label, 'Acquaintance');
  assert.equal(acquaintance.tone, 'acquaintance');

  const closer = evaluateRelationshipStatus(15);
  assert.equal(closer.label, 'Growing Closer');
  assert.equal(closer.tone, 'closer');

  const devoted = evaluateRelationshipStatus(35);
  assert.equal(devoted.label, 'Devoted');
  assert.equal(devoted.tone, 'devoted');
  assert.ok(devoted.progressPct >= 80);
});

test('unlocks First Meeting, Completed All Quests, and Reached True Ending milestones across playthrough', () => {
  let state = createInitialGameState({ autostart: true });
  assert.deepEqual(state.unlockedAchievements, []);

  // First choice unlocks First Meeting
  state = selectChoice(state, 0); // +10 -> flirt
  assert.ok(state.unlockedAchievements.includes('first_meeting'));

  // Completing all 3 side quests unlocks trail_scout, all_quests, and growing_closer (>= 25)
  state = completeSideQuest(state, 'firefly_signal'); // +5 -> 15
  state = completeSideQuest(state, 'bridge_riddle'); // +5 -> 20
  state = completeSideQuest(state, 'watchtower_kindling'); // +8 -> 28
  assert.ok(state.unlockedAchievements.includes('trail_scout'));
  assert.ok(state.unlockedAchievements.includes('all_quests'));
  assert.ok(state.unlockedAchievements.includes('growing_closer'));

  // Finishing hearthbound path unlocks Reached True Ending
  state = selectChoice(state, 0); // bridge_warm
  state = selectChoice(state, 0); // bridge_confide
  state = selectChoice(state, 0); // tower_hearth
  state = selectChoice(state, 0); // ending_hearthbound
  assert.ok(state.unlockedAchievements.includes('true_ending'));

  // Starting a new story retains earned achievements
  const fresh = startNewStory(state, { skipIntro: true });
  assert.ok(fresh.unlockedAchievements.includes('first_meeting'));
  assert.ok(fresh.unlockedAchievements.includes('all_quests'));
  assert.ok(fresh.unlockedAchievements.includes('true_ending'));
});
