import { evaluateAffinityTier } from '../game/engine';

interface GameHUDProps {
  chapter: string;
  sceneLabel: string;
  romanceScore: number;
  lastDelta: number | null;
  deltaKey: number;
  muted: boolean;
  onToggleHistory: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

export function GameHUD({
  chapter,
  sceneLabel,
  romanceScore,
  lastDelta,
  deltaKey,
  muted,
  onToggleHistory,
  onToggleMute,
  onTogglePause,
}: GameHUDProps) {
  const tier = evaluateAffinityTier(romanceScore);
  const scoreDisplay =
    romanceScore > 0 ? `+${Math.round(romanceScore)}` : `${Math.round(romanceScore)}`;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-5">
      {/* Left Perimeter Cluster: Chapter & Scene */}
      <div className="pointer-events-auto flex min-w-0 flex-col rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 px-3 py-2 shadow-lg sm:px-4 sm:py-2.5">
        <span className="truncate text-[10px] font-medium tracking-wider text-[#94A39E] uppercase sm:text-[11px]">
          {chapter}
        </span>
        <span className="truncate font-display text-base font-semibold leading-tight text-[#F2ECE1] sm:text-lg">
          {sceneLabel}
        </span>
      </div>

      {/* Right Perimeter Cluster: Affinity Readout + Utility Icon Controls */}
      <div className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
        <div
          className="relative flex items-center gap-2 rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 px-2.5 py-2 shadow-lg sm:gap-3 sm:px-4"
          aria-live="polite"
        >
          {/* Code-authored Lantern / Affinity SVG icon */}
          <svg
            viewBox="0 0 24 24"
            className="hidden h-5 w-5 shrink-0 sm:block"
            aria-hidden="true"
          >
            <path
              d="M9 4h6l1 3H8l1-3Zm-2 4h10l-1.5 10h-7L7 8Zm2 11h6v2H9v-2Z"
              fill={romanceScore >= 10 ? '#E09F5A' : romanceScore >= 0 ? '#94A39E' : '#738288'}
              stroke="#080E11"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12.5"
              r="2"
              fill={romanceScore >= 10 ? '#FFF3D6' : '#CBD4D0'}
            />
          </svg>

          <div className="flex items-baseline gap-2 sm:gap-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider text-[#94A39E] uppercase">
                Affinity
              </span>
              <span className="hidden text-xs font-medium text-[#C8D3CF] sm:inline">
                {tier}
              </span>
            </div>
            <span
              data-testid="affinity-score"
              className="font-mono-num text-xl font-medium leading-none text-[#F2ECE1] sm:text-2xl"
            >
              {scoreDisplay}
            </span>
          </div>

          {lastDelta !== null && lastDelta !== 0 && (
            <span
              key={deltaKey}
              className={`animate-delta pointer-events-none absolute -bottom-6 right-3 font-mono-num text-sm font-semibold ${
                lastDelta > 0 ? 'text-[#E09F5A]' : 'text-[#9CB3BA]'
              }`}
            >
              {lastDelta > 0 ? `+${lastDelta}` : lastDelta}
            </span>
          )}
        </div>

        {/* Utility Square Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Dialogue log"
            title="Dialogue log (L)"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleHistory();
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 text-[#D6DFDC] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M5 6h14M5 12h14M5 18h9" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title={muted ? 'Unmute (M)' : 'Mute (M)'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 text-[#D6DFDC] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
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

          <button
            type="button"
            tabIndex={-1}
            aria-label="Pause game"
            title="Pause (Esc)"
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 text-[#D6DFDC] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <rect x="7" y="5" width="3.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
