import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completeIntro,
  completeSplash,
  createInitialGameState,
  evaluateAffinityTier,
  getAvailableChoices,
  resumeSavedRun,
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
