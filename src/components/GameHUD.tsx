import {
  evaluateRelationshipStatus,
  RelationshipTone,
} from '../game/engine';

interface GameHUDProps {
  chapter: string;
  sceneLabel: string;
  romanceScore: number;
  lastDelta: number | null;
  deltaKey: number;
  muted: boolean;
  isSkipping: boolean;
  skipDisabled?: boolean;
  completedQuestsCount: number;
  totalQuestsCount: number;
  onSkipStart: () => void;
  onSkipEnd: () => void;
  onToggleQuests: () => void;
  onToggleSaveSlots: () => void;
  onToggleHistory: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

const STATUS_STYLES: Record<
  RelationshipTone,
  {
    cardBorder: string;
    dotColor: string;
    labelText: string;
    scoreText: string;
    barFill: string;
    lanternFill: string;
    lanternCore: string;
  }
> = {
  distant: {
    cardBorder: 'border-[#7C97A8]/45',
    dotColor: 'bg-[#8FA8B8]',
    labelText: 'text-[#8FA8B8]',
    scoreText: 'text-[#CBD9E0]',
    barFill: 'bg-[#7C97A8]',
    lanternFill: '#7C97A8',
    lanternCore: '#D2E0E7',
  },
  acquaintance: {
    cardBorder: 'border-[#94A39E]/30',
    dotColor: 'bg-[#94A39E]',
    labelText: 'text-[#C8D3CF]',
    scoreText: 'text-[#F2ECE1]',
    barFill: 'bg-[#94A39E]',
    lanternFill: '#94A39E',
    lanternCore: '#D6DFDC',
  },
  closer: {
    cardBorder: 'border-[#E09F5A]/55',
    dotColor: 'bg-[#E09F5A]',
    labelText: 'text-[#E09F5A]',
    scoreText: 'text-[#F6D39D]',
    barFill: 'bg-[#E09F5A]',
    lanternFill: '#E09F5A',
    lanternCore: '#FFF3D6',
  },
  devoted: {
    cardBorder: 'border-[#F3C784]/75',
    dotColor: 'bg-[#F3C784]',
    labelText: 'text-[#F3C784]',
    scoreText: 'text-[#FFF3D6]',
    barFill: 'bg-[#F3C784]',
    lanternFill: '#F3C784',
    lanternCore: '#FFF9E8',
  },
};

function getProgressWidthClass(pct: number): string {
  if (pct >= 90) return 'w-full';
  if (pct >= 75) return 'w-4/5';
  if (pct >= 60) return 'w-2/3';
  if (pct >= 45) return 'w-1/2';
  if (pct >= 30) return 'w-1/3';
  if (pct >= 18) return 'w-1/5';
  return 'w-1/12';
}

export function GameHUD({
  chapter,
  sceneLabel,
  romanceScore,
  lastDelta,
  deltaKey,
  muted,
  isSkipping,
  skipDisabled = false,
  completedQuestsCount,
  totalQuestsCount,
  onSkipStart,
  onSkipEnd,
  onToggleQuests,
  onToggleSaveSlots,
  onToggleHistory,
  onToggleMute,
  onTogglePause,
}: GameHUDProps) {
  const status = evaluateRelationshipStatus(romanceScore);
  const toneStyle = STATUS_STYLES[status.tone];
  const barWidthClass = getProgressWidthClass(status.progressPct);
  const scoreDisplay =
    romanceScore > 0 ? `+${Math.round(romanceScore)}` : `${Math.round(romanceScore)}`;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-wrap items-start justify-between gap-2 px-3 py-3 sm:flex-nowrap sm:items-center sm:gap-3 sm:px-8 sm:py-5">
      {/* Left Perimeter Cluster: Chapter & Scene */}
      <div className="pointer-events-auto flex min-w-0 max-w-[46%] flex-col rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 px-3 py-2 shadow-lg sm:max-w-none sm:px-4 sm:py-2.5">
        <span className="truncate text-[10px] font-medium tracking-wider text-[#94A39E] uppercase sm:text-[11px]">
          {chapter}
        </span>
        <span className="truncate font-display text-base font-semibold leading-tight text-[#F2ECE1] sm:text-lg">
          {sceneLabel}
        </span>
      </div>

      {/* Color-Coded Relationship Status Card */}
      <div
        className={`pointer-events-auto relative ml-auto flex shrink-0 items-center gap-2.5 rounded-md border ${toneStyle.cardBorder} bg-[#0B1215]/90 px-3 py-2 shadow-lg transition-colors duration-300 sm:gap-3 sm:px-4`}
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
              fill={toneStyle.lanternFill}
              stroke="#080E11"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12.5"
              r="2"
              fill={toneStyle.lanternCore}
            />
          </svg>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider text-[#94A39E] uppercase">
                Relationship
              </span>
              <span
                data-testid="relationship-status"
                data-tone={status.tone}
                className={`flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-colors duration-300 ${toneStyle.labelText}`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-1.5 w-1.5 rotate-45 ${toneStyle.dotColor} transition-colors duration-300`}
                />
                <span>{status.label}</span>
              </span>
            </div>
            <span
              data-testid="affinity-score"
              className={`font-mono-num text-xl font-medium leading-none transition-colors duration-300 sm:text-2xl ${toneStyle.scoreText}`}
            >
              {scoreDisplay}
            </span>
          </div>

          {/* Hairline progression bar */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-b-md bg-[#94A39E]/15"
          >
            <div
              className={`h-full ${barWidthClass} ${toneStyle.barFill} transition-all duration-300`}
            />
          </div>

          {lastDelta !== null && lastDelta !== 0 && (
            <span
              key={deltaKey}
              className={`animate-delta pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 font-mono-num text-sm font-semibold sm:top-auto sm:right-3 sm:mr-0 sm:-bottom-6 sm:translate-y-0 ${
                lastDelta > 0 ? 'text-[#E09F5A]' : 'text-[#8FA8B8]'
              }`}
            >
              {lastDelta > 0 ? `+${lastDelta}` : lastDelta}
            </span>
          )}
      </div>

      {/* Utility Square Controls */}
      <div className="pointer-events-auto flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-skip-button"
            disabled={skipDisabled}
            aria-label="Hold to skip dialogue"
            aria-pressed={isSkipping}
            title="Hold to skip until next choice"
            onPointerDown={(e) => {
              if (skipDisabled) return;
              if (e.pointerType === 'mouse' && e.button !== 0) return;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              onSkipStart();
            }}
            onPointerUp={() => onSkipEnd()}
            onPointerCancel={() => onSkipEnd()}
            onLostPointerCapture={() => onSkipEnd()}
            onBlur={() => onSkipEnd()}
            onContextMenu={(e) => e.preventDefault()}
            className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium tracking-wide transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-[#E09F5A] disabled:cursor-not-allowed disabled:opacity-45 ${
              isSkipping
                ? 'border-[#E09F5A] bg-[#E09F5A]/22 text-[#E09F5A]'
                : 'border-[#94A39E]/25 bg-[#0B1215]/88 text-[#D6DFDC] hover:border-[#E09F5A]/70 hover:text-[#F2ECE1]'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 6.5v11l7.5-5.5L4 6.5Zm8.5 0v11L20 12l-7.5-5.5Z" />
            </svg>
            <span>Skip</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-quests-button"
            aria-label="Side quests"
            title="Side Quests (Q)"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleQuests();
            }}
            className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 px-2.5 text-xs font-medium tracking-wide text-[#D6DFDC] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A] sm:px-3"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-[#E09F5A]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path
                d="m14.8 9.2-1.8 4.6-4.6 1.8 1.8-4.6 4.6-1.8Z"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Quests</span>
            <span
              data-testid="hud-quests-count"
              className="font-mono-num text-[#E09F5A]"
            >
              {completedQuestsCount}/{totalQuestsCount}
            </span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Save or load slots"
            title="Save Slots (S)"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleSaveSlots();
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-[#94A39E]/25 bg-[#0B1215]/88 text-[#D6DFDC] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
              <path d="M9 4v5h6V4M8 21v-6h8v6" strokeLinejoin="round" />
            </svg>
          </button>

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
    </header>
  );
}
