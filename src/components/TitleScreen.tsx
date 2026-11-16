import { useState } from 'react';
import { SCENE_ASSETS } from '../game/storyData';
import { GameLogo } from './GameLogo';

interface TitleScreenProps {
  usedSlotsCount: number;
  hasSavedRun: boolean;
  unlockedEndingsCount: number;
  totalEndingsCount: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  bestScore: number;
  muted: boolean;
  onStartNew: () => void;
  onOpenSaveSlots: () => void;
  onOpenEndings: () => void;
  onOpenAchievements: () => void;
  onToggleMute: () => void;
}

export function TitleScreen({
  usedSlotsCount,
  hasSavedRun,
  unlockedEndingsCount,
  totalEndingsCount,
  unlockedAchievementsCount,
  totalAchievementsCount,
  bestScore,
  muted,
  onStartNew,
  onOpenSaveSlots,
  onOpenEndings,
  onOpenAchievements,
  onToggleMute,
}: TitleScreenProps) {
  const [bgError, setBgError] = useState(false);

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#0B1215] select-none">
      {/* Full-bleed illustrated key-art backdrop */}
      {!bgError ? (
        <img
          src={SCENE_ASSETS.clearing.src}
          alt="Moonlit pine clearing at midnight"
          referrerPolicy="no-referrer"
          onError={() => setBgError(true)}
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#1e333a_0%,#0b1215_70%)]"
        />
      )}

      {/* Measured contrast scrim over left negative space for readable typography */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#080E11]/95 via-[#0B1215]/65 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#080E11]/85 via-transparent to-[#080E11]/35"
      />

      {/* Left-third negative-space title lockup & menu */}
      <div className="relative z-20 flex h-full w-full flex-col justify-between px-8 py-10 sm:px-14 sm:py-14 lg:px-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs tracking-wide text-[#A6B5B0]">
            <span>Party Cow Studios</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Romance</span>
            {unlockedEndingsCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">
                  Best {bestScore >= 0 ? `+${bestScore}` : bestScore}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Unmute music and sound' : 'Mute music and sound'}
            title={muted ? 'Unmute (M)' : 'Mute (M)'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-[#94A39E]/30 bg-[#0B1215]/82 text-[#D6DFDC] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            {muted ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
                <path d="m16 9 5 6m0-6-5 6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <section className="max-w-2xl">
          <div className="mb-6">
            <GameLogo variant="lockup" />
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#C2CCC8]">
              A chance encounter beneath the pines with Julian—where every answer
              shifts the warmth between you before dawn.
            </p>
          </div>

          {/* Menu Actions */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartNew();
              }}
              className="min-h-[44px] cursor-pointer rounded-md bg-[#E09F5A] px-7 py-3 text-sm font-semibold tracking-wide text-[#0B1215] transition-transform duration-150 hover:bg-[#EBB06E] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2ECE1] whitespace-nowrap shrink-0"
            >
              {hasSavedRun || usedSlotsCount > 0 ? 'New Story' : 'Begin Story'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenSaveSlots();
              }}
              className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/45 bg-[#121D22]/90 px-5 py-3 text-sm font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:bg-[#18262C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F5A] whitespace-nowrap shrink-0"
            >
              <span>Save Slots</span>{' '}
              <span className="font-mono-num text-[#E09F5A]">
                ({usedSlotsCount}/3)
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenEndings();
              }}
              className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/30 bg-[#0E171B]/80 px-5 py-3 text-sm font-medium text-[#CBD4D0] transition-colors duration-150 hover:border-[#94A39E]/60 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F5A] whitespace-nowrap shrink-0"
            >
              <span>Gallery &amp; Endings</span>{' '}
              <span className="font-mono-num text-[#E09F5A]">
                ({unlockedEndingsCount}/{totalEndingsCount})
              </span>
            </button>

            <button
              type="button"
              data-testid="title-achievements-button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenAchievements();
              }}
              className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/30 bg-[#0E171B]/80 px-5 py-3 text-sm font-medium text-[#CBD4D0] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F5A] whitespace-nowrap shrink-0"
            >
              <span>Achievements</span>{' '}
              <span className="font-mono-num text-[#E09F5A]">
                ({unlockedAchievementsCount}/{totalAchievementsCount})
              </span>
            </button>
          </div>
        </section>

        {/* Single flat borderless control hint line */}
        <p className="text-xs tracking-wide text-[#94A39E]">
          Enter or Space Start <span aria-hidden="true">·</span> S Save Slots{' '}
          <span aria-hidden="true">·</span> A Achievements{' '}
          <span aria-hidden="true">·</span> 1–3 or Click Choose{' '}
          <span aria-hidden="true">·</span> Esc Pause{' '}
          <span aria-hidden="true">·</span> M Mute
        </p>
      </div>
    </main>
  );
}
