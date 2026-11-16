import {
  DIALOGUE_TREE,
  DialogueChoice,
  DialogueNode,
  EndingId,
  SCENE_ASSETS,
} from './storyData';
import { getSideQuestById, SideQuestId } from './quests';
import {
  AchievementId,
  evaluateUnlockedAchievements,
} from './achievements';

export type GameScreenState =
  | 'splash'
  | 'title'
  | 'playing'
  | 'paused'
  | 'gameover';

export type AffinityTier = 'Devoted' | 'Intrigued' | 'Guarded' | 'Estranged';
export type RelationshipTone =
  | 'distant'
  | 'acquaintance'
  | 'closer'
  | 'devoted';

export interface RelationshipStatusInfo {
  label: 'Distant' | 'Acquaintance' | 'Growing Closer' | 'Devoted';
  tone: RelationshipTone;
  progressPct: number;
}

export type SaveSlotIndex = 0 | 1 | 2;

export interface HistoryEntry {
  nodeId: string;
  chapter: string;
  speaker: string;
  text: string;
  choiceLabel: string;
  pointsDelta: number;
  kind?: 'choice' | 'beat' | 'quest';
}

export interface SaveSlotData {
  slotIndex: SaveSlotIndex;
  romanceScore: number;
  currentNodeId: string;
  history: HistoryEntry[];
  completedQuests: SideQuestId[];
  chapter: string;
  sceneLabel: string;
  savedAt: string;
}

export type SaveSlotsTuple = [
  SaveSlotData | null,
  SaveSlotData | null,
  SaveSlotData | null,
];

export interface EndingSnapshot {
  endingId: EndingId;
  endingTitle: string;
  endingSummary: string;
  finalScore: number;
  bestScore: number;
  choicesMade: number;
  questsCompleted: number;
  tier: AffinityTier;
}

export interface GameState {
  screen: GameScreenState;
  inIntro: boolean;
  romanceScore: number;
  bestScore: number;
  currentNodeId: string;
  history: HistoryEntry[];
  completedQuests: SideQuestId[];
  unlockedEndings: EndingId[];
  unlockedAchievements: AchievementId[];
  lastDelta: number | null;
  endingSnapshot: EndingSnapshot | null;
  activeSlotIndex: SaveSlotIndex | null;
}

export interface PersistedProgress {
  bestScore: number;
  unlockedEndings: EndingId[];
  unlockedAchievements: AchievementId[];
  savedRun: {
    romanceScore: number;
    currentNodeId: string;
    history: HistoryEntry[];
    completedQuests?: SideQuestId[];
  } | null;
  activeSlotIndex: SaveSlotIndex | null;
  saveSlots: SaveSlotsTuple;
}

export function evaluateAffinityTier(score: number): AffinityTier {
  if (score >= 25) return 'Devoted';
  if (score >= 10) return 'Intrigued';
  if (score >= 0) return 'Guarded';
  return 'Estranged';
}

export function evaluateRelationshipStatus(
  score: number
): RelationshipStatusInfo {
  const clamped = Math.max(-25, Math.min(45, score));
  const progressPct = Math.round(((clamped + 25) / 70) * 100);

  if (score >= 25) {
    return { label: 'Devoted', tone: 'devoted', progressPct };
  }
  if (score >= 10) {
    return { label: 'Growing Closer', tone: 'closer', progressPct };
  }
  if (score >= 0) {
    return { label: 'Acquaintance', tone: 'acquaintance', progressPct };
  }
  return { label: 'Distant', tone: 'distant', progressPct };
}

export function getAvailableChoices(
  node: DialogueNode,
  romanceScore: number
): DialogueChoice[] {
  return node.choices.filter(
    (choice) => choice.minScore === undefined || romanceScore >= choice.minScore
  );
}

export function createEmptySaveSlots(): SaveSlotsTuple {
  return [null, null, null];
}

export function createInitialGameState(
  options: {
    autostart?: boolean;
    skipSplash?: boolean;
    bestScore?: number;
    unlockedEndings?: EndingId[];
    unlockedAchievements?: AchievementId[];
    activeSlotIndex?: SaveSlotIndex | null;
  } = {}
): GameState {
  const screen: GameScreenState = options.autostart
    ? 'playing'
    : options.skipSplash
      ? 'title'
      : 'splash';
  const bestScore = options.bestScore ?? 0;
  const unlockedEndings = options.unlockedEndings ?? [];
  const unlockedAchievements = evaluateUnlockedAchievements({
    currentAchievements: options.unlockedAchievements ?? [],
    romanceScore: 0,
    bestScore,
    choicesCount: 0,
    completedQuests: [],
    unlockedEndings,
  });
  return {
    screen,
    inIntro: false,
    romanceScore: 0,
    bestScore,
    currentNodeId: 'start',
    history: [],
    completedQuests: [],
    unlockedEndings,
    unlockedAchievements,
    lastDelta: null,
    endingSnapshot: null,
    activeSlotIndex: options.activeSlotIndex ?? null,
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
    completedQuests: [],
    lastDelta: null,
    endingSnapshot: null,
    activeSlotIndex: null,
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
  const completedQuests = Array.isArray(savedRun.completedQuests)
    ? savedRun.completedQuests
    : [];
  const choicesCount = savedRun.history.filter(
    (entry) => entry.choiceLabel.length > 0 && entry.kind !== 'quest'
  ).length;
  const unlockedAchievements = evaluateUnlockedAchievements({
    currentAchievements: state.unlockedAchievements,
    romanceScore: savedRun.romanceScore,
    bestScore: state.bestScore,
    choicesCount,
    completedQuests,
    unlockedEndings: state.unlockedEndings,
  });
  return {
    ...state,
    screen: 'playing',
    inIntro: false,
    romanceScore: savedRun.romanceScore,
    currentNodeId: savedRun.currentNodeId,
    history: savedRun.history,
    completedQuests,
    unlockedAchievements,
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
      kind: 'choice',
    },
  ];

  const choicesCount = nextHistory.filter(
    (entry) => entry.choiceLabel.length > 0 && entry.kind !== 'quest'
  ).length;

  if (nextNode.isEnding && nextNode.endingId) {
    const unlockedEndings = state.unlockedEndings.includes(nextNode.endingId)
      ? state.unlockedEndings
      : [...state.unlockedEndings, nextNode.endingId];

    const unlockedAchievements = evaluateUnlockedAchievements({
      currentAchievements: state.unlockedAchievements,
      romanceScore: nextScore,
      bestScore: nextBestScore,
      choicesCount,
      completedQuests: state.completedQuests,
      unlockedEndings,
    });

    const endingSnapshot: EndingSnapshot = {
      endingId: nextNode.endingId,
      endingTitle: nextNode.endingTitle ?? 'End of the Night',
      endingSummary: nextNode.endingSummary ?? '',
      finalScore: nextScore,
      bestScore: nextBestScore,
      choicesMade: choicesCount,
      questsCompleted: state.completedQuests.length,
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
      unlockedAchievements,
      lastDelta: choice.points,
      endingSnapshot,
    };
  }

  const unlockedAchievements = evaluateUnlockedAchievements({
    currentAchievements: state.unlockedAchievements,
    romanceScore: nextScore,
    bestScore: nextBestScore,
    choicesCount,
    completedQuests: state.completedQuests,
    unlockedEndings: state.unlockedEndings,
  });

  return {
    ...state,
    romanceScore: nextScore,
    bestScore: nextBestScore,
    currentNodeId: nextNode.id,
    history: nextHistory,
    unlockedAchievements,
    lastDelta: choice.points,
  };
}

export function advanceDialogue(state: GameState): GameState {
  if (state.screen !== 'playing' || state.inIntro) {
    return state;
  }

  const currentNode = DIALOGUE_TREE[state.currentNodeId];
  if (!currentNode || currentNode.isEnding) {
    return state;
  }

  const available = getAvailableChoices(currentNode, state.romanceScore);
  if (available.length > 0 || !currentNode.next) {
    return state;
  }

  const nextNode = DIALOGUE_TREE[currentNode.next];
  if (!nextNode) {
    return state;
  }

  const nextHistory: HistoryEntry[] = [
    ...state.history,
    {
      nodeId: currentNode.id,
      chapter: currentNode.chapter,
      speaker: currentNode.speaker,
      text: currentNode.text,
      choiceLabel: '',
      pointsDelta: 0,
      kind: 'beat',
    },
  ];

  if (nextNode.isEnding && nextNode.endingId) {
    const unlockedEndings = state.unlockedEndings.includes(nextNode.endingId)
      ? state.unlockedEndings
      : [...state.unlockedEndings, nextNode.endingId];

    const choicesCount = nextHistory.filter(
      (entry) => entry.choiceLabel.length > 0 && entry.kind !== 'quest'
    ).length;

    const unlockedAchievements = evaluateUnlockedAchievements({
      currentAchievements: state.unlockedAchievements,
      romanceScore: state.romanceScore,
      bestScore: state.bestScore,
      choicesCount,
      completedQuests: state.completedQuests,
      unlockedEndings,
    });

    const endingSnapshot: EndingSnapshot = {
      endingId: nextNode.endingId,
      endingTitle: nextNode.endingTitle ?? 'End of the Night',
      endingSummary: nextNode.endingSummary ?? '',
      finalScore: state.romanceScore,
      bestScore: state.bestScore,
      choicesMade: choicesCount,
      questsCompleted: state.completedQuests.length,
      tier: evaluateAffinityTier(state.romanceScore),
    };

    return {
      ...state,
      screen: 'gameover',
      currentNodeId: nextNode.id,
      history: nextHistory,
      unlockedEndings,
      unlockedAchievements,
      lastDelta: null,
      endingSnapshot,
    };
  }

  return {
    ...state,
    currentNodeId: nextNode.id,
    history: nextHistory,
    lastDelta: null,
  };
}

export function completeSideQuest(
  state: GameState,
  questId: SideQuestId
): GameState {
  if (
    (state.screen !== 'playing' && state.screen !== 'paused') ||
    state.inIntro
  ) {
    return state;
  }

  const currentNode = DIALOGUE_TREE[state.currentNodeId];
  if (!currentNode || currentNode.isEnding) {
    return state;
  }

  if (state.completedQuests.includes(questId)) {
    return state;
  }

  const quest = getSideQuestById(questId);
  if (!quest) {
    return state;
  }

  const nextScore = state.romanceScore + quest.rewardPoints;
  const nextBestScore = Math.max(state.bestScore, nextScore);
  const nextCompletedQuests = [...state.completedQuests, questId];
  const choicesCount = state.history.filter(
    (entry) => entry.choiceLabel.length > 0 && entry.kind !== 'quest'
  ).length;
  const unlockedAchievements = evaluateUnlockedAchievements({
    currentAchievements: state.unlockedAchievements,
    romanceScore: nextScore,
    bestScore: nextBestScore,
    choicesCount,
    completedQuests: nextCompletedQuests,
    unlockedEndings: state.unlockedEndings,
  });

  return {
    ...state,
    romanceScore: nextScore,
    bestScore: nextBestScore,
    completedQuests: nextCompletedQuests,
    unlockedAchievements,
    history: [
      ...state.history,
      {
        nodeId: currentNode.id,
        chapter: quest.sceneName,
        speaker: 'Side Quest',
        text: `${quest.title} — Earned ${quest.rewardItem}.`,
        choiceLabel: `Side Quest: ${quest.title}`,
        pointsDelta: quest.rewardPoints,
        kind: 'quest',
      },
    ],
    lastDelta: quest.rewardPoints,
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

export function saveToSlot(
  slots: SaveSlotsTuple,
  state: GameState,
  slotIndex: SaveSlotIndex,
  savedAt: string = new Date().toISOString()
): SaveSlotsTuple {
  const node = DIALOGUE_TREE[state.currentNodeId];
  if (!node || node.isEnding) {
    return slots;
  }
  const nextSlots: SaveSlotsTuple = [slots[0], slots[1], slots[2]];
  nextSlots[slotIndex] = {
    slotIndex,
    romanceScore: state.romanceScore,
    currentNodeId: state.currentNodeId,
    history: [...state.history],
    completedQuests: [...state.completedQuests],
    chapter: node.chapter,
    sceneLabel: SCENE_ASSETS[node.scene].label,
    savedAt,
  };
  return nextSlots;
}

export function loadFromSlot(
  state: GameState,
  slot: SaveSlotData | null
): GameState {
  if (!slot) return state;
  const node = DIALOGUE_TREE[slot.currentNodeId];
  if (!node || node.isEnding) {
    return startNewStory(state, { skipIntro: true });
  }
  const completedQuests = Array.isArray(slot.completedQuests)
    ? [...slot.completedQuests]
    : [];
  const choicesCount = slot.history.filter(
    (entry) => entry.choiceLabel.length > 0 && entry.kind !== 'quest'
  ).length;
  const nextBestScore = Math.max(state.bestScore, slot.romanceScore);
  const unlockedAchievements = evaluateUnlockedAchievements({
    currentAchievements: state.unlockedAchievements,
    romanceScore: slot.romanceScore,
    bestScore: nextBestScore,
    choicesCount,
    completedQuests,
    unlockedEndings: state.unlockedEndings,
  });
  return {
    ...state,
    screen: 'playing',
    inIntro: false,
    romanceScore: slot.romanceScore,
    bestScore: nextBestScore,
    currentNodeId: slot.currentNodeId,
    history: [...slot.history],
    completedQuests,
    unlockedAchievements,
    lastDelta: null,
    endingSnapshot: null,
    activeSlotIndex: slot.slotIndex,
  };
}

export function deleteSlot(
  slots: SaveSlotsTuple,
  slotIndex: SaveSlotIndex
): SaveSlotsTuple {
  const nextSlots: SaveSlotsTuple = [slots[0], slots[1], slots[2]];
  nextSlots[slotIndex] = null;
  return nextSlots;
}

const STORAGE_KEY = 'after_midnight_vn_progress_v1';

function normalizeSaveSlots(raw: unknown): SaveSlotsTuple {
  const empty = createEmptySaveSlots();
  if (!Array.isArray(raw)) return empty;
  for (let i = 0; i < 3; i++) {
    const item = raw[i];
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as SaveSlotData).currentNodeId === 'string' &&
      typeof (item as SaveSlotData).romanceScore === 'number' &&
      DIALOGUE_TREE[(item as SaveSlotData).currentNodeId]
    ) {
      const slot = item as SaveSlotData;
      const node = DIALOGUE_TREE[slot.currentNodeId];
      empty[i] = {
        slotIndex: i as SaveSlotIndex,
        romanceScore: slot.romanceScore,
        currentNodeId: slot.currentNodeId,
        history: Array.isArray(slot.history) ? slot.history : [],
        completedQuests: Array.isArray(slot.completedQuests)
          ? slot.completedQuests
          : [],
        chapter: typeof slot.chapter === 'string' ? slot.chapter : node.chapter,
        sceneLabel:
          typeof slot.sceneLabel === 'string'
            ? slot.sceneLabel
            : SCENE_ASSETS[node.scene].label,
        savedAt:
          typeof slot.savedAt === 'string'
            ? slot.savedAt
            : new Date().toISOString(),
      };
    }
  }
  return empty;
}

export function loadProgress(): PersistedProgress {
  const fallback: PersistedProgress = {
    bestScore: 0,
    unlockedEndings: [],
    unlockedAchievements: [],
    savedRun: null,
    activeSlotIndex: null,
    saveSlots: createEmptySaveSlots(),
  };
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    const activeSlot =
      parsed.activeSlotIndex === 0 ||
      parsed.activeSlotIndex === 1 ||
      parsed.activeSlotIndex === 2
        ? parsed.activeSlotIndex
        : null;
    const bestScore = typeof parsed.bestScore === 'number' ? parsed.bestScore : 0;
    const unlockedEndings = Array.isArray(parsed.unlockedEndings)
      ? parsed.unlockedEndings
      : [];
    const unlockedAchievements = evaluateUnlockedAchievements({
      currentAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      romanceScore: 0,
      bestScore,
      choicesCount: 0,
      completedQuests: [],
      unlockedEndings,
    });
    return {
      bestScore,
      unlockedEndings,
      unlockedAchievements,
      savedRun: parsed.savedRun ?? null,
      activeSlotIndex: activeSlot,
      saveSlots: normalizeSaveSlots(parsed.saveSlots),
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(
  state: GameState,
  saveSlots: SaveSlotsTuple = createEmptySaveSlots()
): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const payload: PersistedProgress = {
      bestScore: state.bestScore,
      unlockedEndings: state.unlockedEndings,
      unlockedAchievements: state.unlockedAchievements,
      savedRun:
        state.screen === 'playing' || state.screen === 'paused'
          ? {
              romanceScore: state.romanceScore,
              currentNodeId: state.currentNodeId,
              history: state.history,
              completedQuests: state.completedQuests,
            }
          : null,
      activeSlotIndex: state.activeSlotIndex,
      saveSlots,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
