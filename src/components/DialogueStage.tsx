import { useEffect, useState } from 'react';
import {
  DialogueChoice,
  DialogueNode,
} from '../game/storyData';
import { soundEngine } from '../game/audio';
import { CharacterPortrait } from './CharacterPortrait';
import { SceneBackdrop } from './SceneBackdrop';

interface DialogueStageProps {
  node: DialogueNode;
  choices: DialogueChoice[];
  isPaused: boolean;
  isSkipping?: boolean;
  hideDialogueBox?: boolean;
  onSelectChoice: (index: number) => void;
  onAdvanceDialogue: () => void;
}

export function DialogueStage({
  node,
  choices,
  isPaused,
  isSkipping = false,
  hideDialogueBox = false,
  onSelectChoice,
  onAdvanceDialogue,
}: DialogueStageProps) {
  const [visibleChars, setVisibleChars] = useState(0);

  const isComplete = visibleChars >= node.text.length;
  const hasContinuation =
    choices.length === 0 && Boolean(node.next) && !node.isEnding;

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

  // Accelerated typewriter reveal when Skip is held
  useEffect(() => {
    if (isPaused || isComplete) return;
    const stepChars = isSkipping ? 8 : 2;
    const stepMs = isSkipping ? 10 : 22;
    const timer = window.setTimeout(() => {
      setVisibleChars((prev) => {
        const next = Math.min(prev + stepChars, node.text.length);
        if (!isSkipping && next % 4 === 0 && next < node.text.length) {
          soundEngine.playTypeTick();
        }
        return next;
      });
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [visibleChars, isPaused, isComplete, isSkipping, node.text.length]);

  // Automatically progress through linear dialogue nodes while Skip is held until a user choice is encountered
  useEffect(() => {
    if (isPaused || !isSkipping || !isComplete || !hasContinuation) return;
    const timer = window.setTimeout(() => {
      onAdvanceDialogue();
    }, 110);
    return () => window.clearTimeout(timer);
  }, [isPaused, isSkipping, isComplete, hasContinuation, onAdvanceDialogue]);

  const handleCompleteText = () => {
    if (!isComplete) {
      setVisibleChars(node.text.length);
    } else if (hasContinuation) {
      onAdvanceDialogue();
    }
  };

  // Space/Enter completes text or advances linear dialogue; 1-3 selects choices
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!isComplete) {
          e.preventDefault();
          setVisibleChars(node.text.length);
        } else if (hasContinuation) {
          e.preventDefault();
          onAdvanceDialogue();
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
  }, [
    isPaused,
    isComplete,
    hasContinuation,
    node.text.length,
    choices,
    onSelectChoice,
    onAdvanceDialogue,
  ]);

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#0B1215]">
      {/* Cross-fading atmospheric scene backdrop */}
      <SceneBackdrop scene={node.scene} />

      {/* Character Portrait Stage keyed dynamically by dialogue speaker */}
      <CharacterPortrait speaker={node.speaker} mood={node.mood} />

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
              {isSkipping ? (
                <span className="font-mono-num text-[11px] font-medium tracking-wide text-[#E09F5A]">
                  {choices.length > 0 && isComplete
                    ? 'Choice reached'
                    : 'Skipping >>'}
                </span>
              ) : (
                !isComplete && (
                  <span className="text-[11px] tracking-wide text-[#94A39E]">
                    Click or Space to reveal
                  </span>
                )
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

          {/* Choice List or Linear Continue Action */}
          {choices.length > 0 ? (
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
          ) : (
            hasContinuation && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onAdvanceDialogue();
                  }}
                  className="group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-[#94A39E]/30 bg-[#101B20]/94 px-5 py-2.5 text-sm font-medium text-[#F2ECE1] transition-all duration-150 hover:border-[#E09F5A]/80 hover:bg-[#17252B] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
                >
                  <span className="font-mono-num text-xs text-[#E09F5A]">
                    [Space]
                  </span>
                  <span>Continue</span>
                  <span
                    aria-hidden="true"
                    className="text-xs text-[#94A39E] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#E09F5A]"
                  >
                    &rarr;
                  </span>
                </button>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}
