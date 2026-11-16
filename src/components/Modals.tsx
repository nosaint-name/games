import { useEffect, useState } from 'react';
import { EndingSnapshot, HistoryEntry } from '../game/engine';
import {
  ALL_ENDINGS,
  DISPLAY_GALLERY,
  DisplayArtwork,
  EndingId,
  GAME_CREDITS,
} from '../game/storyData';
import { SIDE_QUESTS } from '../game/quests';
import { CreditsModal } from './CreditsModal';

interface PauseModalProps {
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  onResume: () => void;
  onOpenSaveSlots: () => void;
  onOpenAchievements: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
}

export function PauseModal({
  unlockedAchievementsCount,
  totalAchievementsCount,
  onResume,
  onOpenSaveSlots,
  onOpenAchievements,
  onRestart,
  onReturnToTitle,
}: PauseModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#070B0D]/80 px-4"
    >
      <div className="w-full max-w-sm rounded-md border border-[#94A39E]/30 bg-[#0E171B] p-7 shadow-2xl">
        <h2
          id="pause-title"
          className="font-display text-3xl font-semibold text-[#F2ECE1]"
        >
          Story Paused
        </h2>
        <p className="mt-1.5 text-sm text-[#A6B5B0]">
          Your progress along the trail is held in place.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onResume();
            }}
            className="min-h-[44px] w-full cursor-pointer rounded-md bg-[#E09F5A] px-5 py-2.5 text-sm font-semibold text-[#0B1215] transition-colors duration-150 hover:bg-[#EBB06E] focus-visible:outline-2 focus-visible:outline-[#F2ECE1]"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenSaveSlots();
            }}
            className="min-h-[44px] w-full cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#132025] px-5 py-2.5 text-sm font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Save / Load Slots
          </button>
          <button
            type="button"
            data-testid="pause-achievements-button"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenAchievements();
            }}
            className="flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-md border border-[#94A39E]/35 bg-[#132025] px-5 py-2.5 text-sm font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            <span>Achievements</span>
            <span className="font-mono-num text-xs font-semibold text-[#E09F5A]">
              {unlockedAchievementsCount}/{totalAchievementsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className="min-h-[44px] w-full cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#132025] px-5 py-2.5 text-sm font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Restart Story
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onReturnToTitle();
            }}
            className="min-h-[44px] w-full cursor-pointer rounded-md border border-[#94A39E]/25 bg-transparent px-5 py-2.5 text-sm font-medium text-[#CBD4D0] transition-colors duration-150 hover:border-[#94A39E]/55 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Title Screen
          </button>
        </div>
      </div>
    </div>
  );
}

interface HistoryModalProps {
  history: HistoryEntry[];
  onClose: () => void;
}

export function HistoryModal({ history, onClose }: HistoryModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#070B0D]/80 px-4"
    >
      <div className="flex max-h-[80vh] w-full max-w-xl flex-col rounded-md border border-[#94A39E]/30 bg-[#0E171B] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#94A39E]/20 px-6 py-4">
          <h2
            id="history-title"
            className="font-display text-2xl font-semibold text-[#F2ECE1]"
          >
            Dialogue Log
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] cursor-pointer rounded-md border border-[#94A39E]/30 px-4 py-1.5 text-xs font-medium text-[#CBD4D0] hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94A39E]">
              No choices recorded yet in this scene.
            </p>
          ) : (
            <ol className="flex flex-col gap-5">
              {history.map((entry, idx) => (
                <li
                  key={`${entry.nodeId}-${idx}`}
                  className="border-b border-[#94A39E]/15 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="mb-1 flex items-center justify-between text-xs text-[#94A39E]">
                    <span>
                      {entry.speaker} · {entry.chapter}
                    </span>
                    {entry.choiceLabel && (
                      <span
                        className={`font-mono-num font-medium ${
                          entry.pointsDelta > 0
                            ? 'text-[#E09F5A]'
                            : entry.pointsDelta < 0
                              ? 'text-[#9CB3BA]'
                              : 'text-[#94A39E]'
                        }`}
                      >
                        {entry.pointsDelta > 0
                          ? `+${entry.pointsDelta}`
                          : entry.pointsDelta}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-lg text-[#E6E0D4]">
                    “{entry.text}”
                  </p>
                  {entry.choiceLabel && (
                    <p className="mt-1.5 text-sm text-[#A6B5B0]">
                      {entry.kind === 'quest' ? 'Completed:' : 'You chose:'}{' '}
                      <span className="text-[#F2ECE1]">
                        {entry.choiceLabel}
                      </span>
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

interface EndingsGalleryModalProps {
  unlockedEndings: EndingId[];
  onClose: () => void;
}

export function EndingsGalleryModal({
  unlockedEndings,
  onClose,
}: EndingsGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'endings'>('gallery');
  const [selectedArt, setSelectedArt] = useState<DisplayArtwork | null>(null);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedArt) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedArt(null);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [selectedArt]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="endings-gallery-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#070B0D]/86 px-4 py-6"
    >
      <div className="flex max-h-[86vh] w-full max-w-4xl flex-col rounded-md border border-[#94A39E]/30 bg-[#0E171B] shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#94A39E]/20 px-6 py-4">
          <div className="flex items-center gap-4">
            <h2
              id="endings-gallery-title"
              className="font-display text-2xl font-semibold text-[#F2ECE1]"
            >
              Artwork & Endings
            </h2>

            <div className="flex items-center gap-1 rounded-md border border-[#94A39E]/25 bg-[#091013] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`min-h-[36px] cursor-pointer rounded px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  activeTab === 'gallery'
                    ? 'bg-[#E09F5A] text-[#0B1215]'
                    : 'text-[#CBD4D0] hover:text-[#F2ECE1]'
                }`}
              >
                Display Pictures ({DISPLAY_GALLERY.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('endings')}
                className={`min-h-[36px] cursor-pointer rounded px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  activeTab === 'endings'
                    ? 'bg-[#E09F5A] text-[#0B1215]'
                    : 'text-[#CBD4D0] hover:text-[#F2ECE1]'
                }`}
              >
                Endings ({unlockedEndings.length}/{ALL_ENDINGS.length})
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] cursor-pointer rounded-md border border-[#94A39E]/30 px-4 py-1.5 text-xs font-medium text-[#CBD4D0] hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'gallery' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DISPLAY_GALLERY.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedArt(art)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-md border border-[#94A39E]/25 bg-[#121E23] text-left transition-colors duration-150 hover:border-[#E09F5A]/75 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-[#091013]">
                    {!failedIds[art.id] ? (
                      <img
                        src={art.src}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedIds((prev) => ({ ...prev, [art.id]: true }))
                        }
                        className={`h-full w-full scale-[1.04] object-cover transition-transform duration-300 group-hover:scale-[1.08] ${
                          art.aspect === '3:4' ? 'object-top' : 'object-center'
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#132025] text-xs text-[#94A39E]">
                        {art.title}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 p-3.5">
                    <span className="font-display text-lg font-semibold text-[#F2ECE1]">
                      {art.title}
                    </span>
                    <span className="text-xs leading-relaxed text-[#A6B5B0]">
                      {art.subtitle}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {ALL_ENDINGS.map((ending) => {
                const unlocked = unlockedEndings.includes(ending.id);
                return (
                  <li
                    key={ending.id}
                    className="rounded-md border border-[#94A39E]/20 bg-[#131F24] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-lg font-semibold text-[#F2ECE1]">
                        {unlocked ? ending.title : 'Undiscovered Ending'}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          unlocked ? 'text-[#E09F5A]' : 'text-[#738288]'
                        }`}
                      >
                        {unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#A6B5B0]">
                      {ending.hint}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox View for Selected Display Artwork */}
      {selectedArt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedArt.title}
          onClick={() => setSelectedArt(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040708]/94 p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] max-w-4xl flex-col items-center gap-4"
          >
            <img
              src={selectedArt.src}
              alt={selectedArt.title}
              referrerPolicy="no-referrer"
              className="max-h-[72vh] w-auto rounded-md border border-[#94A39E]/30 object-contain shadow-2xl"
            />
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#F2ECE1]">
                  {selectedArt.title}
                </h3>
                <p className="text-sm text-[#A6B5B0]">{selectedArt.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArt(null)}
                className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#0E171B] px-5 py-2 text-xs font-medium text-[#F2ECE1] hover:border-[#E09F5A]"
              >
                Back to Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EndingModalProps {
  snapshot: EndingSnapshot;
  finalLine: string;
  unlockedCount: number;
  totalEndings: number;
  onPlayAgain: () => void;
  onReturnToTitle: () => void;
}

export function EndingModal({
  snapshot,
  finalLine,
  unlockedCount,
  totalEndings,
  onPlayAgain,
  onReturnToTitle,
}: EndingModalProps) {
  const [showCredits, setShowCredits] = useState(false);

  const scoreFormatted =
    snapshot.finalScore > 0
      ? `+${snapshot.finalScore}`
      : `${snapshot.finalScore}`;
  const bestFormatted =
    snapshot.bestScore > 0 ? `+${snapshot.bestScore}` : `${snapshot.bestScore}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#070B0D]/80 px-4 py-6"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-[#94A39E]/30 bg-[#0E171B] p-7 shadow-2xl sm:p-8">
        <div className="text-xs font-medium tracking-wider text-[#E09F5A] uppercase">
          Ending Reached · {snapshot.tier}
        </div>
        <h2
          id="ending-title"
          className="mt-1.5 font-display text-3xl font-semibold text-[#F2ECE1] sm:text-4xl"
        >
          {snapshot.endingTitle}
        </h2>

        <p className="mt-3 font-display text-lg italic leading-relaxed text-[#E6E0D4]">
          “{finalLine}”
        </p>

        <p className="mt-3 text-sm leading-relaxed text-[#A6B5B0]">
          {snapshot.endingSummary}
        </p>

        {/* 4 Tabular Stat Tiles */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#94A39E]/20 py-4 sm:grid-cols-4">
          <div>
            <div className="text-[11px] text-[#94A39E] uppercase">Affinity</div>
            <div
              data-testid="ending-score"
              className="mt-0.5 font-mono-num text-2xl font-semibold text-[#F2ECE1]"
            >
              {scoreFormatted}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#94A39E] uppercase">Best</div>
            <div className="mt-0.5 font-mono-num text-2xl font-semibold text-[#E09F5A]">
              {bestFormatted}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#94A39E] uppercase">Endings</div>
            <div className="mt-0.5 font-mono-num text-2xl font-semibold text-[#F2ECE1]">
              {unlockedCount}/{totalEndings}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#94A39E] uppercase">Quests</div>
            <div
              data-testid="ending-quests"
              className="mt-0.5 font-mono-num text-2xl font-semibold text-[#F2ECE1]"
            >
              {snapshot.questsCompleted}/{SIDE_QUESTS.length}
            </div>
          </div>
        </div>

        {/* Credits Summary Section at the End of the Game */}
        <section
          aria-label="Game credits"
          data-testid="ending-credits"
          className="mt-5 rounded-md border border-[#94A39E]/20 bg-[#121D22] px-4 py-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold tracking-wider text-[#E09F5A] uppercase">
              Credits
            </span>
            <span className="text-xs text-[#94A39E]">
              After Midnight
            </span>
          </div>
          <dl className="mt-2.5 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2 sm:gap-x-4">
            {GAME_CREDITS.slice(0, 4).map((credit) => (
              <div key={credit.role} className="flex flex-col">
                <dt className="text-[10px] tracking-wider text-[#94A39E] uppercase">
                  {credit.role}
                </dt>
                <dd className="font-medium text-[#E6E0D4]">{credit.name}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onPlayAgain();
            }}
            className="min-h-[44px] flex-1 cursor-pointer rounded-md bg-[#E09F5A] px-6 py-2.5 text-sm font-semibold text-[#0B1215] transition-colors duration-150 hover:bg-[#EBB06E] focus-visible:outline-2 focus-visible:outline-[#F2ECE1]"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              setShowCredits(true);
            }}
            className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#132025] px-5 py-2.5 text-sm font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Full Credits
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onReturnToTitle();
            }}
            className="min-h-[44px] cursor-pointer rounded-md border border-[#94A39E]/25 bg-transparent px-5 py-2.5 text-sm font-medium text-[#CBD4D0] transition-colors duration-150 hover:border-[#94A39E]/55 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Title Screen
          </button>
        </div>
      </div>

      {showCredits && (
        <CreditsModal
          endingTitle={snapshot.endingTitle}
          onClose={() => setShowCredits(false)}
          onReturnToTitle={onReturnToTitle}
        />
      )}
    </div>
  );
}
