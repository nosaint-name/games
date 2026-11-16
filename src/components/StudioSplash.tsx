import { useEffect, useState } from 'react';
import { soundEngine } from '../game/audio';

interface StudioSplashProps {
  onComplete: () => void;
}

export function StudioSplash({ onComplete }: StudioSplashProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      setPhase('hold');
      const doneTimer = window.setTimeout(onComplete, 1200);
      return () => window.clearTimeout(doneTimer);
    }

    // Play bumper chime if audio is already unlocked
    soundEngine.playStudioBumper();

    const holdTimer = window.setTimeout(() => setPhase('hold'), 120);
    const exitTimer = window.setTimeout(() => setPhase('exit'), 3400);
    const completeTimer = window.setTimeout(onComplete, 4200);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        soundEngine.startMusic();
        onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onComplete]);

  const isVisible = phase === 'hold';

  return (
    <main
      data-testid="studio-splash"
      onClick={() => {
        soundEngine.startMusic();
        onComplete();
      }}
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#070B0D] px-6 select-none"
    >
      {/* Subtle radial spotlight behind studio crest */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(224,159,90,0.14)_0%,rgba(19,33,38,0.08)_45%,transparent_72%)] transition-all duration-1000 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      />

      {/* Cinematic letterbox bars */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-10 bg-[#040708] sm:h-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 h-10 bg-[#040708] sm:h-12"
      />

      {/* Center Studio Lockup */}
      <div
        className={`relative z-20 flex flex-col items-center text-center transition-all duration-700 ease-out ${
          phase === 'enter'
            ? 'translate-y-3 scale-95 opacity-0'
            : phase === 'hold'
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-2 scale-[1.02] opacity-0'
        }`}
      >
        {/* Bespoke Party Cow Studios Emblem SVG */}
        <svg
          viewBox="0 0 140 132"
          className="mb-6 h-28 w-28 sm:h-32 sm:w-32"
          role="img"
          aria-label="Party Cow Studios emblem"
        >
          {/* Outer moonlit crest ring */}
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="#0D161A"
            stroke="#E09F5A"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          <circle
            cx="70"
            cy="70"
            r="48"
            fill="none"
            stroke="#94A39E"
            strokeOpacity="0.2"
            strokeWidth="1"
          />

          {/* Jaunty Party Hat tilted on cow's head */}
          <path
            d="M66 36 L86 12 L92 42 Z"
            fill="#E09F5A"
            stroke="#070B0D"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line
            x1="73"
            y1="28"
            x2="89"
            y2="31"
            stroke="#0D161A"
            strokeWidth="1.8"
          />
          <circle cx="87" cy="11" r="4.2" fill="#F2ECE1" />

          {/* Cow Horns & Ears */}
          <path
            d="M46 46 Q38 35 45 29 Q47 38 53 43"
            fill="#F2ECE1"
            stroke="#070B0D"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M94 46 Q102 35 95 29 Q93 38 87 43"
            fill="#F2ECE1"
            stroke="#070B0D"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <ellipse
            cx="37"
            cy="55"
            rx="10"
            ry="5.5"
            transform="rotate(-18 37 55)"
            fill="#D6DFDC"
            stroke="#070B0D"
            strokeWidth="1.8"
          />
          <ellipse
            cx="103"
            cy="55"
            rx="10"
            ry="5.5"
            transform="rotate(18 103 55)"
            fill="#D6DFDC"
            stroke="#070B0D"
            strokeWidth="1.8"
          />

          {/* Stylized Cow Head */}
          <path
            d="M44 52 C44 40 96 40 96 52 L98 76 C98 94 86 104 70 104 C54 104 42 94 42 76 Z"
            fill="#F2ECE1"
            stroke="#070B0D"
            strokeWidth="2"
          />
          {/* Asymmetric midnight patch over left eye */}
          <path
            d="M45 50 C52 43 64 46 65 57 C66 66 57 72 44 69 Z"
            fill="#1A2B31"
          />
          {/* Eyes */}
          <circle cx="56" cy="60" r="3" fill="#F2ECE1" />
          <circle cx="84" cy="60" r="3" fill="#142024" />
          {/* Warm muzzle */}
          <ellipse
            cx="70"
            cy="88"
            rx="21"
            ry="13"
            fill="#DFB69D"
            stroke="#070B0D"
            strokeWidth="1.8"
          />
          <circle cx="62" cy="86" r="2.3" fill="#2A1D19" />
          <circle cx="78" cy="86" r="2.3" fill="#2A1D19" />
          <path
            d="M64 94 Q70 98 76 94"
            fill="none"
            stroke="#2A1D19"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Tiny celebratory star glints */}
          <path
            d="M27 32 L29 37 L34 39 L29 41 L27 46 L25 41 L20 39 L25 37 Z"
            fill="#E09F5A"
          />
          <path
            d="M113 36 L114.5 39.5 L118 41 L114.5 42.5 L113 46 L111.5 42.5 L108 41 L111.5 39.5 Z"
            fill="#F2ECE1"
            fillOpacity="0.8"
          />
        </svg>

        <h1 className="font-display text-3xl font-semibold tracking-[0.16em] text-[#F2ECE1] uppercase sm:text-5xl">
          Party Cow Studios
        </h1>

        <div
          aria-hidden="true"
          className={`my-4 h-[1px] bg-[#E09F5A]/70 transition-all duration-1000 ease-out ${
            isVisible ? 'w-32 opacity-100' : 'w-4 opacity-0'
          }`}
        />

        <p className="font-sans-ui text-xs font-medium tracking-[0.42em] text-[#E09F5A] uppercase sm:text-sm">
          Presents
        </p>
      </div>

      {/* Skip control */}
      <button
        type="button"
        aria-label="Skip studio intro"
        onClick={(e) => {
          e.stopPropagation();
          e.currentTarget.blur();
          soundEngine.startMusic();
          onComplete();
        }}
        className="fixed right-5 bottom-14 z-30 min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/30 bg-[#0B1215]/85 px-5 py-2 text-xs font-medium tracking-wide text-[#CBD4D0] transition-colors duration-150 hover:border-[#E09F5A]/75 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A] sm:right-8 sm:bottom-16"
      >
        Skip
      </button>

      <p className="fixed bottom-16 left-6 z-20 hidden text-xs tracking-wide text-[#738288] sm:block">
        Click or press Space to skip
      </p>
    </main>
  );
}
