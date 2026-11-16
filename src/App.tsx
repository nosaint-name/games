import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AchievementsModal } from './components/AchievementsModal';
import { DialogueStage } from './components/DialogueStage';
import { GameHUD } from './components/GameHUD';
import { IntroSequence } from './components/IntroSequence';
import { MoodParticleOverlay } from './components/MoodParticleOverlay';
import { StudioSplash } from './components/StudioSplash';
import {
  EndingModal,
  EndingsGalleryModal,
  HistoryModal,
  PauseModal,
} from './components/Modals';
import { SaveSlotsModal } from './components/SaveSlotsModal';
import { SideQuestsModal } from './components/SideQuestsModal';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/audio';
import {
  ACHIEVEMENTS,
  AchievementDefinition,
  getAchievementById,
} from './game/achievements';
import {
  advanceDialogue,
  completeIntro,
  completeSideQuest,
  completeSplash,
  createInitialGameState,
  deleteSlot,
  GameState,
  getAvailableChoices,
  loadFromSlot,
  loadProgress,
  resumeSavedRun,
  returnToTitle,
  saveProgress,
  SaveSlotIndex,
  SaveSlotsTuple,
  saveToSlot,
  selectChoice,
  startNewStory,
  togglePause,
} from './game/engine';
import { getSideQuestById, SIDE_QUESTS, SideQuestId } from './game/quests';
import { ALL_ENDINGS, DIALOGUE_TREE, SCENE_ASSETS } from './game/storyData';

export default function App() {
  const initialPersisted = useMemo(() => loadProgress(), []);
  const autostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState({
      autostart,
      bestScore: initialPersisted.bestScore,
      unlockedEndings: initialPersisted.unlockedEndings,
      unlockedAchievements: initialPersisted.unlockedAchievements,
    })
  );

  const [savedRun, setSavedRun] = useState(initialPersisted.savedRun);
  const [saveSlots, setSaveSlots] = useState<SaveSlotsTuple>(
    () => initialPersisted.saveSlots
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showEndingsGallery, setShowEndingsGallery] = useState(false);
  const [showSaveSlots, setShowSaveSlots] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [unlockedToast, setUnlockedToast] =
    useState<AchievementDefinition | null>(null);
  const prevAchievementsRef = useRef(gameState.unlockedAchievements);
  const [isSkipping, setIsSkipping] = useState(false);
  const [muted, setMuted] = useState(false);
  const [deltaKey, setDeltaKey] = useState(0);

  const currentNode =
    DIALOGUE_TREE[gameState.currentNodeId] ?? DIALOGUE_TREE.start;
  const availableChoices = useMemo(
    () => getAvailableChoices(currentNode, gameState.romanceScore),
    [currentNode, gameState.romanceScore]
  );
  const usedSlotsCount = useMemo(
    () => saveSlots.filter(Boolean).length,
    [saveSlots]
  );

  // Sync gameState.screen to document.body.dataset.state immediately
  useEffect(() => {
    document.body.dataset.state = gameState.screen;
  }, [gameState.screen]);

  // Sync procedural music mood & pause/gameover state
  useEffect(() => {
    const mood =
      gameState.screen === 'splash' ||
      gameState.screen === 'title' ||
      gameState.inIntro
        ? 'neutral'
        : currentNode.mood;
    const section =
      gameState.screen === 'splash' ? 'title' : gameState.screen;
    soundEngine.updateMusicState(mood, section);
  }, [gameState.screen, gameState.inIntro, currentNode.mood]);

  // Start ambient music on first user gesture (browser autoplay safe)
  useEffect(() => {
    const unlockAudio = () => {
      if (!soundEngine.isMuted()) {
        soundEngine.startMusic();
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Notify player briefly whenever a new achievement medal unlocks
  useEffect(() => {
    const prev = prevAchievementsRef.current;
    const newlyUnlocked = gameState.unlockedAchievements.filter(
      (id) => !prev.includes(id)
    );
    prevAchievementsRef.current = gameState.unlockedAchievements;
    if (newlyUnlocked.length > 0) {
      const def = getAchievementById(newlyUnlocked[0]);
      if (def) {
        setUnlockedToast(def);
      }
    }
  }, [gameState.unlockedAchievements]);

  useEffect(() => {
    if (!unlockedToast) return;
    const timer = window.setTimeout(() => setUnlockedToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [unlockedToast]);

  // Persist progress & save slots whenever relevant state changes
  useEffect(() => {
    saveProgress(gameState, saveSlots);
    if (gameState.screen === 'playing' || gameState.screen === 'paused') {
      setSavedRun({
        romanceScore: gameState.romanceScore,
        currentNodeId: gameState.currentNodeId,
        history: gameState.history,
        completedQuests: gameState.completedQuests,
      });
    } else if (gameState.screen === 'gameover') {
      setSavedRun(null);
    }
  }, [gameState, saveSlots]);

  const handleStartNew = useCallback(() => {
    soundEngine.startMusic();
    soundEngine.playStartChime();
    setShowEndingsGallery(false);
    setShowHistory(false);
    setShowSaveSlots(false);
    setShowQuests(false);
    setShowAchievements(false);
    setGameState((prev) => startNewStory(prev));
  }, []);

  const handleRestartImmediate = useCallback(() => {
    soundEngine.startMusic();
    soundEngine.playStartChime();
    setShowEndingsGallery(false);
    setShowHistory(false);
    setShowSaveSlots(false);
    setShowQuests(false);
    setShowAchievements(false);
    setGameState((prev) => startNewStory(prev, { skipIntro: true }));
  }, []);

  const handleCompleteIntro = useCallback(() => {
    setGameState((prev) => completeIntro(prev));
  }, []);

  const handleCompleteSplash = useCallback(() => {
    setGameState((prev) => completeSplash(prev));
  }, []);

  const handleContinue = useCallback(() => {
    if (!savedRun) return;
    soundEngine.startMusic();
    soundEngine.playStartChime();
    setShowEndingsGallery(false);
    setShowHistory(false);
    setShowSaveSlots(false);
    setShowQuests(false);
    setGameState((prev) => resumeSavedRun(prev, savedRun));
  }, [savedRun]);

  const handleSaveSlot = useCallback(
    (slotIndex: SaveSlotIndex) => {
      const node = DIALOGUE_TREE[gameState.currentNodeId];
      if (!node || node.isEnding) return;
      setSaveSlots((prev) => saveToSlot(prev, gameState, slotIndex));
      setGameState((prev) => ({
        ...prev,
        activeSlotIndex: slotIndex,
      }));
    },
    [gameState]
  );

  const handleLoadSlot = useCallback(
    (slotIndex: SaveSlotIndex) => {
      const slot = saveSlots[slotIndex];
      if (!slot) return;
      soundEngine.startMusic();
      soundEngine.playStartChime();
      setShowEndingsGallery(false);
      setShowHistory(false);
      setShowSaveSlots(false);
      setShowQuests(false);
      setGameState((prev) => loadFromSlot(prev, slot));
    },
    [saveSlots]
  );

  const handleDeleteSlot = useCallback((slotIndex: SaveSlotIndex) => {
    setSaveSlots((prev) => deleteSlot(prev, slotIndex));
    setGameState((prev) =>
      prev.activeSlotIndex === slotIndex
        ? { ...prev, activeSlotIndex: null }
        : prev
    );
  }, []);

  const handleSelectChoice = useCallback((choiceIndex: number) => {
    setGameState((prev) => {
      const next = selectChoice(prev, choiceIndex);
      if (next !== prev) {
        setDeltaKey((k) => k + 1);
        if (next.screen === 'gameover') {
          soundEngine.playEndingCadence((next.romanceScore ?? 0) >= 10);
        } else if (next.lastDelta !== null) {
          soundEngine.playChoiceFeedback(next.lastDelta);
        }
      }
      return next;
    });
  }, []);

  const handleAdvanceDialogue = useCallback(() => {
    setGameState((prev) => {
      const next = advanceDialogue(prev);
      if (next !== prev && next.screen === 'gameover') {
        soundEngine.playEndingCadence((next.romanceScore ?? 0) >= 10);
      }
      return next;
    });
  }, []);

  const handleCompleteQuest = useCallback((questId: SideQuestId) => {
    const quest = getSideQuestById(questId);
    setGameState((prev) => {
      const next = completeSideQuest(prev, questId);
      if (next !== prev) {
        setDeltaKey((k) => k + 1);
        if (quest) {
          soundEngine.playChoiceFeedback(quest.rewardPoints);
        }
      }
      return next;
    });
  }, []);

  // Ensure hold-to-skip never gets stuck if overlay opens, state changes, or pointer leaves window
  useEffect(() => {
    if (
      gameState.screen !== 'playing' ||
      gameState.inIntro ||
      showHistory ||
      showSaveSlots ||
      showQuests
    ) {
      setIsSkipping(false);
    }
  }, [gameState.screen, gameState.inIntro, showHistory, showSaveSlots, showQuests]);

  useEffect(() => {
    const stopSkip = () => setIsSkipping(false);
    window.addEventListener('pointerup', stopSkip);
    window.addEventListener('pointercancel', stopSkip);
    window.addEventListener('blur', stopSkip);
    return () => {
      window.removeEventListener('pointerup', stopSkip);
      window.removeEventListener('pointercancel', stopSkip);
      window.removeEventListener('blur', stopSkip);
    };
  }, []);

  const handleTogglePause = useCallback(() => {
    setShowHistory(false);
    setShowSaveSlots(false);
    setShowQuests(false);
    setShowAchievements(false);
    setGameState((prev) => togglePause(prev));
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      if (!next) {
        soundEngine.startMusic();
      }
      return next;
    });
  }, []);

  const handleReturnToTitle = useCallback(() => {
    setShowHistory(false);
    setShowSaveSlots(false);
    setShowQuests(false);
    setShowAchievements(false);
    setGameState((prev) => returnToTitle(prev));
  }, []);

  // Global keyboard shortcuts (Title Enter/Space, S Save Slots, Esc/P Pause, L Log, M Mute)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (gameState.screen === 'title') {
        if (showAchievements) {
          if (e.key === 'Escape' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            setShowAchievements(false);
          }
          return;
        }
        if (showSaveSlots) {
          if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            setShowSaveSlots(false);
          }
          return;
        }
        if (showEndingsGallery) {
          if (e.key === 'Escape') {
            e.preventDefault();
            setShowEndingsGallery(false);
          }
          return;
        }
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setShowAchievements(true);
          return;
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setShowSaveSlots(true);
          return;
        }
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartNew();
        }
        return;
      }

      if (gameState.screen === 'playing') {
        if (gameState.inIntro) {
          return;
        }
        if (showSaveSlots) {
          if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            setShowSaveSlots(false);
          }
          return;
        }
        if (showHistory) {
          if (e.key === 'Escape' || e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            setShowHistory(false);
          }
          return;
        }
        if (showQuests) {
          if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
            e.preventDefault();
            setShowQuests(false);
          }
          return;
        }
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          setShowHistory(true);
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setShowSaveSlots(true);
        } else if (e.key === 'q' || e.key === 'Q') {
          e.preventDefault();
          setShowQuests(true);
        }
        return;
      }

      if (gameState.screen === 'paused') {
        if (showAchievements) {
          if (e.key === 'Escape' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            setShowAchievements(false);
          }
          return;
        }
        if (showSaveSlots) {
          if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            setShowSaveSlots(false);
          }
          return;
        }
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setShowAchievements(true);
          return;
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setShowSaveSlots(true);
          return;
        }
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      if (gameState.screen === 'gameover') {
        if (showSaveSlots) {
          if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            setShowSaveSlots(false);
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          handleRestartImmediate();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState.screen,
    gameState.inIntro,
    showHistory,
    showEndingsGallery,
    showSaveSlots,
    showQuests,
    showAchievements,
    handleStartNew,
    handleRestartImmediate,
    handleTogglePause,
    handleToggleMute,
  ]);

  const canSaveToSlot =
    (gameState.screen === 'playing' || gameState.screen === 'paused') &&
    !gameState.inIntro &&
    !currentNode.isEnding;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0B1215] text-[#F2ECE1]">
      <MoodParticleOverlay
        mood={
          gameState.screen === 'splash' ||
          gameState.screen === 'title' ||
          gameState.inIntro
            ? 'neutral'
            : currentNode.mood
        }
        paused={gameState.screen === 'paused' || showSaveSlots || showQuests}
      />

      {gameState.screen === 'splash' ? (
        <StudioSplash onComplete={handleCompleteSplash} />
      ) : gameState.screen === 'title' ? (
        <>
          <TitleScreen
            usedSlotsCount={usedSlotsCount}
            hasSavedRun={Boolean(savedRun)}
            unlockedEndingsCount={gameState.unlockedEndings.length}
            totalEndingsCount={ALL_ENDINGS.length}
            unlockedAchievementsCount={gameState.unlockedAchievements.length}
            totalAchievementsCount={ACHIEVEMENTS.length}
            bestScore={gameState.bestScore}
            muted={muted}
            onStartNew={handleStartNew}
            onOpenSaveSlots={() => setShowSaveSlots(true)}
            onOpenEndings={() => setShowEndingsGallery(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onToggleMute={handleToggleMute}
          />
          {showEndingsGallery && (
            <EndingsGalleryModal
              unlockedEndings={gameState.unlockedEndings}
              onClose={() => setShowEndingsGallery(false)}
            />
          )}
        </>
      ) : gameState.screen === 'playing' && gameState.inIntro ? (
        <IntroSequence onComplete={handleCompleteIntro} />
      ) : (
        <>
          <GameHUD
            chapter={currentNode.chapter}
            sceneLabel={SCENE_ASSETS[currentNode.scene].label}
            romanceScore={gameState.romanceScore}
            lastDelta={gameState.lastDelta}
            deltaKey={deltaKey}
            muted={muted}
            isSkipping={isSkipping}
            skipDisabled={gameState.screen !== 'playing' || gameState.inIntro}
            completedQuestsCount={gameState.completedQuests.length}
            totalQuestsCount={SIDE_QUESTS.length}
            onSkipStart={() => setIsSkipping(true)}
            onSkipEnd={() => setIsSkipping(false)}
            onToggleQuests={() => {
              setShowHistory(false);
              setShowSaveSlots(false);
              setShowQuests((v) => !v);
            }}
            onToggleSaveSlots={() => {
              setShowHistory(false);
              setShowQuests(false);
              setShowSaveSlots((v) => !v);
            }}
            onToggleHistory={() => {
              setShowSaveSlots(false);
              setShowQuests(false);
              setShowHistory((v) => !v);
            }}
            onToggleMute={handleToggleMute}
            onTogglePause={handleTogglePause}
          />

          <DialogueStage
            node={currentNode}
            choices={availableChoices}
            isPaused={
              gameState.screen !== 'playing' ||
              showHistory ||
              showSaveSlots ||
              showQuests
            }
            isSkipping={
              isSkipping &&
              gameState.screen === 'playing' &&
              !showHistory &&
              !showSaveSlots &&
              !showQuests
            }
            hideDialogueBox={gameState.screen === 'gameover'}
            onSelectChoice={handleSelectChoice}
            onAdvanceDialogue={handleAdvanceDialogue}
          />

          {gameState.screen === 'paused' &&
            !showSaveSlots &&
            !showAchievements && (
              <PauseModal
                unlockedAchievementsCount={
                  gameState.unlockedAchievements.length
                }
                totalAchievementsCount={ACHIEVEMENTS.length}
                onResume={handleTogglePause}
                onOpenSaveSlots={() => setShowSaveSlots(true)}
                onOpenAchievements={() => setShowAchievements(true)}
                onRestart={handleRestartImmediate}
                onReturnToTitle={handleReturnToTitle}
              />
            )}

          {showHistory && gameState.screen === 'playing' && (
            <HistoryModal
              history={gameState.history}
              onClose={() => setShowHistory(false)}
            />
          )}

          {showQuests && gameState.screen === 'playing' && (
            <SideQuestsModal
              currentScene={currentNode.scene}
              completedQuests={gameState.completedQuests}
              onCompleteQuest={handleCompleteQuest}
              onClose={() => setShowQuests(false)}
            />
          )}

          {gameState.screen === 'gameover' && gameState.endingSnapshot && (
            <EndingModal
              snapshot={gameState.endingSnapshot}
              finalLine={currentNode.text}
              unlockedCount={gameState.unlockedEndings.length}
              totalEndings={ALL_ENDINGS.length}
              onPlayAgain={handleRestartImmediate}
              onReturnToTitle={handleReturnToTitle}
            />
          )}
        </>
      )}

      {showSaveSlots && (
        <SaveSlotsModal
          saveSlots={saveSlots}
          activeSlotIndex={gameState.activeSlotIndex}
          canSave={canSaveToSlot}
          hasAutosave={Boolean(savedRun) && gameState.screen === 'title'}
          onResumeAutosave={handleContinue}
          onSaveSlot={handleSaveSlot}
          onLoadSlot={handleLoadSlot}
          onDeleteSlot={handleDeleteSlot}
          onClose={() => setShowSaveSlots(false)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          unlockedAchievements={gameState.unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {unlockedToast &&
        gameState.screen !== 'splash' &&
        !gameState.inIntro && (
          <div
            role="status"
            data-testid="achievement-toast"
            className="pointer-events-none fixed bottom-6 right-6 z-45 rounded-md border border-[#E09F5A]/55 bg-[#0E171B]/95 px-4 py-3 shadow-2xl"
          >
            <div className="text-[10px] font-semibold tracking-wider text-[#E09F5A] uppercase">
              Medal Unlocked · {unlockedToast.medalTier}
            </div>
            <div className="mt-0.5 font-display text-lg font-semibold text-[#F2ECE1]">
              {unlockedToast.title}
            </div>
          </div>
        )}
    </div>
  );
}
