import { useEffect } from 'react';
import { GAME_CREDITS } from '../game/storyData';
import { GameLogo } from './GameLogo';

interface CreditsModalProps {
  endingTitle: string;
  onClose: () => void;
  onReturnToTitle: () => void;
}

export function CreditsModal({
  endingTitle,
  onClose,
  onReturnToTitle,
}: CreditsModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-credits-title"
      data-testid="credits-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090B]/92 px-4 py-6"
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-[#94A39E]/30 bg-[#0C1418] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#94A39E]/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <GameLogo variant="crest" className="h-10 w-10" />
            <div>
              <h2
                id="full-credits-title"
                className="font-display text-2xl font-semibold text-[#F2ECE1]"
              >
                End Credits
              </h2>
              <p className="text-xs text-[#94A39E]">
                Completed: {endingTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onClose();
            }}
            className="min-h-[40px] cursor-pointer rounded-md border border-[#94A39E]/30 px-4 py-1.5 text-xs font-medium text-[#CBD4D0] transition-colors duration-150 hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Back to Ending
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="text-[11px] font-medium tracking-[0.28em] text-[#E09F5A] uppercase">
              Party Cow Studios Presents
            </span>
            <h3 className="mt-2 font-display text-4xl font-semibold text-[#F2ECE1]">
              After Midnight
            </h3>
            <div
              aria-hidden="true"
              className="mt-3 h-[1px] w-24 bg-[#E09F5A]/60"
            />
          </div>

          <dl className="flex flex-col divide-y divide-[#94A39E]/15">
            {GAME_CREDITS.map((credit) => (
              <div
                key={credit.role}
                className="flex flex-col justify-between gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <dt className="text-xs font-medium tracking-wider text-[#94A39E] uppercase">
                  {credit.role}
                </dt>
                <dd className="sm:text-right">
                  <div className="font-display text-xl font-semibold text-[#F2ECE1]">
                    {credit.name}
                  </div>
                  {credit.detail && (
                    <div className="text-xs text-[#A6B5B0]">{credit.detail}</div>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 border-t border-[#94A39E]/20 pt-6 text-center">
            <p className="font-display text-lg italic text-[#E6E0D4]">
              “Thank you for walking the Blackpine Hollow trails after midnight.”
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#94A39E]/20 bg-[#091013] px-6 py-4">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onClose();
            }}
            className="min-h-[42px] cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#132025] px-5 py-2 text-xs font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Back to Ending
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onReturnToTitle();
            }}
            className="min-h-[42px] cursor-pointer rounded-md bg-[#E09F5A] px-5 py-2 text-xs font-semibold text-[#0B1215] transition-colors duration-150 hover:bg-[#EBB06E] focus-visible:outline-2 focus-visible:outline-[#F2ECE1]"
          >
            Title Screen
          </button>
        </div>
      </div>
    </div>
  );
}
