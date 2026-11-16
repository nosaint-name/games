import { useCallback, useEffect, useState } from 'react';
import { SCENE_ASSETS } from '../game/storyData';
import { soundEngine } from '../game/audio';

export interface IntroBeat {
  kicker: string;
  line: string;
  subline: string;
}

const INTRO_BEATS: IntroBeat[] = [
  {
    kicker: '12:04 AM · Blackpine Hollow',
    line: 'The village lanterns faded half a mile behind you.',
    subline:
      'Silver frost gathers along the pine needles as mist rises from the creek below.',
  },
  {
    kicker: 'The Old Trail',
    line: 'Through the fog, a single brass flame sways—and stops.',
    subline:
      'Footsteps crunch on frozen moss. Whoever keeps the night watch has already noticed you.',
  },
  {
    kicker: 'First Encounter',
    line: 'A dark-coated silhouette steps into the silver clearing.',
    subline:
      'Warm amber light catches sharp hazel eyes as the lantern lowers between you.',
  },
];

interface IntroSequenceProps {
  onComplete: () => void;
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [bgError, setBgError] = useState(false);

  const beat = INTRO_BEATS[beatIndex];
  const isLast = beatIndex >= INTRO_BEATS.length - 1;

  const handleAdvance = useCallback(() => {
    soundEngine.startMusic();
    if (isLast) {
      soundEngine.playStartChime();
      onComplete();
    } else {
      soundEngine.playIntroBeat();
      setBeatIndex((i) => i + 1);
    }
  }, [isLast, onComplete]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.startMusic();
        onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAdvance, onComplete]);

  return (
    <main
      data-intro="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0B1215] px-6 select-none"
    >
      {!bgError ? (
        <img
          src={SCENE_ASSETS.clearing.src}
          alt="Moonlit pine clearing at midnight"
          referrerPolicy="no-referrer"
          onError={() => setBgError(true)}
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.04] opacity-55 transition-transform duration-700"
          style={{
            transform: `scale(${1.04 + beatIndex * 0.025})`,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1a2c32_0%,#0b1215_75%)]"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#080E11] via-[#0B1215]/60 to-[#080E11]/75"
      />

      {/* Skip Intro Action */}
      <div className="fixed top-5 right-5 z-30 sm:top-7 sm:right-8">
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            soundEngine.startMusic();
            onComplete();
          }}
          className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#0B1215]/88 px-5 py-2 text-xs font-medium tracking-wide text-[#CBD4D0] transition-colors duration-150 hover:border-[#E09F5A]/75 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
        >
          Skip Intro
        </button>
      </div>

      {/* Centered Editorial Prologue Card */}
      <section className="relative z-20 flex w-full max-w-2xl flex-col items-center text-center">
        <span className="font-mono-num text-xs font-medium tracking-widest text-[#E09F5A] uppercase">
          {beat.kicker}
        </span>

        <h2 className="mt-4 font-display text-3xl font-semibold leading-snug text-[#F2ECE1] sm:text-5xl [text-wrap:balance]">
          {beat.line}
        </h2>

        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#C2CCC8] sm:text-lg">
          {beat.subline}
        </p>

        {/* Step progress indicator (3 simple horizontal hairline bars, no pills/dots) */}
        <div
          aria-label={`Prologue step ${beatIndex + 1} of ${INTRO_BEATS.length}`}
          className="mt-8 flex items-center gap-2.5"
        >
          {INTRO_BEATS.map((_, idx) => (
            <span
              key={idx}
              className={`h-[2px] w-10 transition-colors duration-200 ${
                idx <= beatIndex ? 'bg-[#E09F5A]' : 'bg-[#94A39E]/30'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          data-intro-next="true"
          onClick={(e) => {
            e.currentTarget.blur();
            handleAdvance();
          }}
          className="mt-8 min-h-[44px] cursor-pointer rounded-md bg-[#E09F5A] px-8 py-3 text-sm font-semibold tracking-wide text-[#0B1215] transition-transform duration-150 hover:bg-[#EBB06E] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2ECE1]"
        >
          {isLast ? 'Step Into the Clearing' : 'Continue'}
        </button>

        <p className="mt-5 text-xs tracking-wide text-[#94A39E]">
          Space or Enter Continue <span aria-hidden="true">·</span> Esc Skip
        </p>
      </section>
    </main>
  );
}
