import {
  DIALOGUE_TREE,
  DialogueChoice,
  DialogueNode,
  EndingId,
} from './storyData';

export type GameScreenState =
  | 'splash'
  | 'title'
  | 'playing'
  | 'paused'
  | 'gameover';

export type AffinityTier = 'Devoted' | 'Intrigued' | 'Guarded' | 'Estranged';

export interface HistoryEntry {
  nodeId: string;
  chapter: string;
  speaker: string;
  text: string;
  choiceLabel: string;
  pointsDelta: number;
}

export interface EndingSnapshot {
  endingId: EndingId;
  endingTitle: string;
  endingSummary: string;
  finalScore: number;
  bestScore: number;
  choicesMade: number;
  tier: AffinityTier;
}

export interface GameState {
  screen: GameScreenState;
  inIntro: boolean;
  romanceScore: number;
  bestScore: number;
  currentNodeId: string;
  history: HistoryEntry[];
  unlockedEndings: EndingId[];
  lastDelta: number | null;
  endingSnapshot: EndingSnapshot | null;
}

export interface PersistedProgress {
  bestScore: number;
  unlockedEndings: EndingId[];
  savedRun: {
    romanceScore: number;
    currentNodeId: string;
    history: HistoryEntry[];
  } | null;
}

export function evaluateAffinityTier(score: number): AffinityTier {
  if (score >= 25) return 'Devoted';
  if (score >= 10) return 'Intrigued';
  if (score >= 0) return 'Guarded';
  return 'Estranged';
}

export function getAvailableChoices(
  node: DialogueNode,
  romanceScore: number
): DialogueChoice[] {
  return node.choices.filter(
    (choice) => choice.minScore === undefined || romanceScore >= choice.minScore
  );
}

export function createInitialGameState(
  options: {
    autostart?: boolean;
    skipSplash?: boolean;
    bestScore?: number;
    unlockedEndings?: EndingId[];
  } = {}
): GameState {
  const screen: GameScreenState = options.autostart
    ? 'playing'
    : options.skipSplash
      ? 'title'
      : 'splash';
  return {
    screen,
    inIntro: false,
    romanceScore: 0,
    bestScore: options.bestScore ?? 0,
    currentNodeId: 'start',
    history: [],
    unlockedEndings: options.unlockedEndings ?? [],
    lastDelta: null,
    endingSnapshot: null,
  };
}

export function completeSplash(state: GameState): GameState {
  if (state.screen !== 'splash') return state;
  return {
    ...state,
    screen: 'title',
  };
}

export function startNewStory(
  state: GameState,
  options: { skipIntro?: boolean } = {}
): GameState {
  return {
    ...state,
    screen: 'playing',
    inIntro: !options.skipIntro,
    romanceScore: 0,
    currentNodeId: 'start',
    history: [],
    lastDelta: null,
    endingSnapshot: null,
  };
}

export function completeIntro(state: GameState): GameState {
  if (!state.inIntro) return state;
  return {
    ...state,
    inIntro: false,
  };
}

export function resumeSavedRun(
  state: GameState,
  savedRun: NonNullable<PersistedProgress['savedRun']>
): GameState {
  if (!DIALOGUE_TREE[savedRun.currentNodeId]) {
    return startNewStory(state);
  }
  const node = DIALOGUE_TREE[savedRun.currentNodeId];
  if (node.isEnding) {
    return startNewStory(state);
  }
  return {
    ...state,
    screen: 'playing',
    inIntro: false,
    romanceScore: savedRun.romanceScore,
    currentNodeId: savedRun.currentNodeId,
    history: savedRun.history,
    lastDelta: null,
    endingSnapshot: null,
  };
}

export function selectChoice(state: GameState, choiceIndex: number): GameState {
  if (state.screen !== 'playing' || state.inIntro) {
    return state;
  }

  const currentNode = DIALOGUE_TREE[state.currentNodeId];
  if (!currentNode) {
    return state;
  }

  const available = getAvailableChoices(currentNode, state.romanceScore);
  const choice = available[choiceIndex];
  if (!choice) {
    return state;
  }

  const nextNode = DIALOGUE_TREE[choice.next];
  if (!nextNode) {
    return state;
  }

  const nextScore = state.romanceScore + choice.points;
  const nextBestScore = Math.max(state.bestScore, nextScore);
  const nextHistory: HistoryEntry[] = [
    ...state.history,
    {
      nodeId: currentNode.id,
      chapter: currentNode.chapter,
      speaker: currentNode.speaker,
      text: currentNode.text,
      choiceLabel: choice.label,
      pointsDelta: choice.points,
    },
  ];

  if (nextNode.isEnding && nextNode.endingId) {
    const unlockedEndings = state.unlockedEndings.includes(nextNode.endingId)
      ? state.unlockedEndings
      : [...state.unlockedEndings, nextNode.endingId];

    const endingSnapshot: EndingSnapshot = {
      endingId: nextNode.endingId,
      endingTitle: nextNode.endingTitle ?? 'End of the Night',
      endingSummary: nextNode.endingSummary ?? '',
      finalScore: nextScore,
      bestScore: nextBestScore,
      choicesMade: nextHistory.length,
      tier: evaluateAffinityTier(nextScore),
    };

    return {
      ...state,
      screen: 'gameover',
      romanceScore: nextScore,
      bestScore: nextBestScore,
      currentNodeId: nextNode.id,
      history: nextHistory,
      unlockedEndings,
      lastDelta: choice.points,
      endingSnapshot,
    };
  }

  return {
    ...state,
    romanceScore: nextScore,
    bestScore: nextBestScore,
    currentNodeId: nextNode.id,
    history: nextHistory,
    lastDelta: choice.points,
  };
}

export function togglePause(state: GameState): GameState {
  if (state.screen === 'playing') {
    return { ...state, screen: 'paused' };
  }
  if (state.screen === 'paused') {
    return { ...state, screen: 'playing' };
  }
  return state;
}

export function returnToTitle(state: GameState): GameState {
  return {
    ...state,
    screen: 'title',
  };
}

const STORAGE_KEY = 'after_midnight_vn_progress_v1';

export function loadProgress(): PersistedProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { bestScore: 0, unlockedEndings: [], savedRun: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bestScore: 0, unlockedEndings: [], savedRun: null };
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    return {
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      unlockedEndings: Array.isArray(parsed.unlockedEndings)
        ? parsed.unlockedEndings
        : [],
      savedRun: parsed.savedRun ?? null,
    };
  } catch {
    return { bestScore: 0, unlockedEndings: [], savedRun: null };
  }
}

export function saveProgress(state: GameState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const payload: PersistedProgress = {
      bestScore: state.bestScore,
      unlockedEndings: state.unlockedEndings,
      savedRun:
        state.screen === 'playing' || state.screen === 'paused'
          ? {
              romanceScore: state.romanceScore,
              currentNodeId: state.currentNodeId,
              history: state.history,
            }
          : null,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
