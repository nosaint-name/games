import { useEffect, useState } from 'react';
import {
  DialogueChoice,
  DialogueNode,
  PORTRAIT_ASSETS,
  SCENE_ASSETS,
} from '../game/storyData';
import { soundEngine } from '../game/audio';

interface DialogueStageProps {
  node: DialogueNode;
  choices: DialogueChoice[];
  isPaused: boolean;
  hideDialogueBox?: boolean;
  onSelectChoice: (index: number) => void;
}

export function DialogueStage({
  node,
  choices,
  isPaused,
  hideDialogueBox = false,
  onSelectChoice,
}: DialogueStageProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [sceneError, setSceneError] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  const sceneAsset = SCENE_ASSETS[node.scene];
  const portraitAsset = PORTRAIT_ASSETS[node.mood];
  const isComplete = visibleChars >= node.text.length;

  useEffect(() => {
    setSceneError(false);
  }, [node.scene]);

  useEffect(() => {
    setPortraitError(false);
  }, [node.mood]);

  // Reset typewriter when node changes
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      setVisibleChars(node.text.length);
      return;
    }
    setVisibleChars(0);
  }, [node.id, node.text.length]);

  useEffect(() => {
    if (isPaused || isComplete) return;
    const timer = window.setTimeout(() => {
      setVisibleChars((prev) => {
        const next = Math.min(prev + 2, node.text.length);
        if (next % 4 === 0 && next < node.text.length) {
          soundEngine.playTypeTick();
        }
        return next;
      });
    }, 22);
    return () => window.clearTimeout(timer);
  }, [visibleChars, isPaused, isComplete, node.text.length]);

  const handleCompleteText = () => {
    if (!isComplete) {
      setVisibleChars(node.text.length);
    }
  };

  // Space completes typewriter text if still typing; 1-3 selects choices
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!isComplete) {
          e.preventDefault();
          setVisibleChars(node.text.length);
        }
        return;
      }
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1;
        if (choices[idx]) {
          e.preventDefault();
          onSelectChoice(idx);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPaused, isComplete, node.text.length, choices, onSelectChoice]);

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#0B1215]">
      {/* Full-bleed atmospheric scene backdrop */}
      {!sceneError ? (
        <img
          key={sceneAsset.src}
          src={sceneAsset.src}
          alt={sceneAsset.label}
          referrerPolicy="no-referrer"
          onError={() => setSceneError(true)}
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.04] transition-opacity duration-500"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#1a2c32_0%,#0b1215_75%)]"
        />
      )}

      {/* Subtle nocturnal lighting scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#080E11] via-[#0B1215]/30 to-[#080E11]/45"
      />

      {/* Character Portrait Stage with soft radial vignette feathering */}
      <div className="pointer-events-none fixed inset-x-0 bottom-16 z-15 flex justify-center sm:bottom-12 md:justify-end md:pr-[8%] lg:pr-[12%]">
        <div className="relative h-[56vh] max-h-[620px] w-[300px] sm:h-[64vh] sm:w-[360px] lg:h-[72vh] lg:w-[420px]">
          {!portraitError ? (
            <img
              key={portraitAsset.src}
              src={portraitAsset.src}
              alt={portraitAsset.alt}
              referrerPolicy="no-referrer"
              onError={() => setPortraitError(true)}
              className="h-full w-full object-cover object-top transition-opacity duration-300"
              style={{
                maskImage:
                  'radial-gradient(ellipse 68% 78% at 50% 45%, black 42%, transparent 95%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 68% 78% at 50% 45%, black 42%, transparent 95%)',
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-t-lg border border-[#94A39E]/20 bg-[#121D22]">
              <span className="font-display text-5xl text-[#E09F5A]">J</span>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Lower Dialogue & Choices Stage */}
      {!hideDialogueBox && (
        <section
          aria-label="Dialogue"
          className="fixed inset-x-0 bottom-0 z-25 mx-auto flex w-full max-w-4xl flex-col gap-2.5 px-3 pb-4 sm:gap-3 sm:px-8 sm:pb-8"
        >
          {/* Dialogue Box */}
          <div
            onClick={handleCompleteText}
            className="rounded-md border border-[#94A39E]/30 bg-[#0B1215]/92 px-5 py-4 shadow-2xl sm:px-8 sm:py-6"
          >
            <div className="mb-1.5 flex items-center justify-between gap-4 sm:mb-2">
              <span className="font-display text-xl font-semibold tracking-wide text-[#E09F5A] sm:text-2xl">
                {node.speaker}
              </span>
              {!isComplete && (
                <span className="text-[11px] tracking-wide text-[#94A39E]">
                  Click or Space to reveal
                </span>
              )}
            </div>

            <p
              data-testid="dialogue-text"
              className="max-w-[68ch] font-display text-lg leading-relaxed text-[#F2ECE1] sm:text-2xl"
            >
              {node.text.slice(0, visibleChars)}
              {!isComplete && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 bg-[#E09F5A]"
                />
              )}
            </p>
          </div>

          {/* Choice List */}
          {choices.length > 0 && (
            <div
              role="group"
              aria-label="Dialogue choices"
              className="grid grid-cols-1 gap-2 sm:gap-2.5"
            >
              {choices.map((choice, idx) => (
                <button
                  key={`${node.id}-${choice.next}-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSelectChoice(idx);
                  }}
                  className="group flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-[#94A39E]/30 bg-[#101B20]/94 px-4 py-2.5 text-left transition-all duration-150 hover:border-[#E09F5A]/80 hover:bg-[#17252B] active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F5A] sm:min-h-[46px] sm:gap-4 sm:px-5 sm:py-3"
                >
                  <span className="flex items-center gap-3 sm:gap-3.5">
                    <span className="font-mono-num text-xs font-medium text-[#E09F5A]">
                      [{idx + 1}]
                    </span>
                    <span className="text-sm font-medium text-[#F2ECE1] sm:text-base">
                      {choice.label}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xs text-[#94A39E] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#E09F5A]"
                  >
                    &rarr;
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
