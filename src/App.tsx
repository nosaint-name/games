import { useCallback, useEffect, useMemo, useState } from 'react';
import { AmbientCanvas } from './components/AmbientCanvas';
import { DialogueStage } from './components/DialogueStage';
import { GameHUD } from './components/GameHUD';
import { IntroSequence } from './components/IntroSequence';
import { StudioSplash } from './components/StudioSplash';
import {
  EndingModal,
  EndingsGalleryModal,
  HistoryModal,
  PauseModal,
} from './components/Modals';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/audio';
import {
  completeIntro,
  completeSplash,
  createInitialGameState,
  GameState,
  getAvailableChoices,
  loadProgress,
  resumeSavedRun,
  returnToTitle,
  saveProgress,
  selectChoice,
  startNewStory,
  togglePause,
} from './game/engine';
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
    })
  );

  const [savedRun, setSavedRun] = useState(initialPersisted.savedRun);
  const [showHistory, setShowHistory] = useState(false);
  const [showEndingsGallery, setShowEndingsGallery] = useState(false);
  const [muted, setMuted] = useState(false);
  const [deltaKey, setDeltaKey] = useState(0);

  const currentNode =
    DIALOGUE_TREE[gameState.currentNodeId] ?? DIALOGUE_TREE.start;
  const availableChoices = useMemo(
    () => getAvailableChoices(currentNode, gameState.romanceScore),
    [currentNode, gameState.romanceScore]
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

  // Persist progress whenever relevant state changes
  useEffect(() => {
    saveProgress(gameState);
    if (gameState.screen === 'playing' || gameState.screen === 'paused') {
      setSavedRun({
        romanceScore: gameState.romanceScore,
        currentNodeId: gameState.currentNodeId,
        history: gameState.history,
      });
    } else if (gameState.screen === 'gameover') {
      setSavedRun(null);
    }
  }, [gameState]);

  const handleStartNew = useCallback(() => {
    soundEngine.startMusic();
    soundEngine.playStartChime();
    setShowEndingsGallery(false);
    setShowHistory(false);
    setGameState((prev) => startNewStory(prev));
  }, []);

  const handleRestartImmediate = useCallback(() => {
    soundEngine.startMusic();
    soundEngine.playStartChime();
    setShowEndingsGallery(false);
    setShowHistory(false);
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
    setGameState((prev) => resumeSavedRun(prev, savedRun));
  }, [savedRun]);

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

  const handleTogglePause = useCallback(() => {
    setShowHistory(false);
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
    setGameState((prev) => returnToTitle(prev));
  }, []);

  // Global keyboard shortcuts (Title Enter/Space, Esc/P Pause, L Log, M Mute)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (gameState.screen === 'title') {
        if (showEndingsGallery) {
          if (e.key === 'Escape') {
            e.preventDefault();
            setShowEndingsGallery(false);
          }
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
        if (showHistory) {
          if (e.key === 'Escape' || e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            setShowHistory(false);
          }
          return;
        }
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          setShowHistory(true);
        }
        return;
      }

      if (gameState.screen === 'paused') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      if (gameState.screen === 'gameover') {
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
    handleStartNew,
    handleRestartImmediate,
    handleTogglePause,
    handleToggleMute,
  ]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0B1215] text-[#F2ECE1]">
      <AmbientCanvas
        mood={
          gameState.screen === 'splash' ||
          gameState.screen === 'title' ||
          gameState.inIntro
            ? 'neutral'
            : currentNode.mood
        }
        paused={gameState.screen === 'paused'}
      />

      {gameState.screen === 'splash' ? (
        <StudioSplash onComplete={handleCompleteSplash} />
      ) : gameState.screen === 'title' ? (
        <>
          <TitleScreen
            hasSavedRun={Boolean(savedRun)}
            unlockedEndingsCount={gameState.unlockedEndings.length}
            totalEndingsCount={ALL_ENDINGS.length}
            bestScore={gameState.bestScore}
            muted={muted}
            onStartNew={handleStartNew}
            onContinue={handleContinue}
            onOpenEndings={() => setShowEndingsGallery(true)}
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
            onToggleHistory={() => setShowHistory((v) => !v)}
            onToggleMute={handleToggleMute}
            onTogglePause={handleTogglePause}
          />

          <DialogueStage
            node={currentNode}
            choices={availableChoices}
            isPaused={gameState.screen !== 'playing' || showHistory}
            hideDialogueBox={gameState.screen === 'gameover'}
            onSelectChoice={handleSelectChoice}
          />

          {gameState.screen === 'paused' && (
            <PauseModal
              onResume={handleTogglePause}
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
    </div>
  );
}
