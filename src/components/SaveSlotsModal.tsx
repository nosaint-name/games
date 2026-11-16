import { useState } from 'react';
import {
  evaluateAffinityTier,
  SaveSlotIndex,
  SaveSlotsTuple,
} from '../game/engine';
import { SIDE_QUESTS } from '../game/quests';

interface SaveSlotsModalProps {
  saveSlots: SaveSlotsTuple;
  activeSlotIndex: SaveSlotIndex | null;
  canSave: boolean;
  hasAutosave?: boolean;
  onResumeAutosave?: () => void;
  onSaveSlot: (slotIndex: SaveSlotIndex) => void;
  onLoadSlot: (slotIndex: SaveSlotIndex) => void;
  onDeleteSlot: (slotIndex: SaveSlotIndex) => void;
  onClose: () => void;
}

function formatSavedTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function SaveSlotsModal({
  saveSlots,
  activeSlotIndex,
  canSave,
  hasAutosave = false,
  onResumeAutosave,
  onSaveSlot,
  onLoadSlot,
  onDeleteSlot,
  onClose,
}: SaveSlotsModalProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = (idx: SaveSlotIndex) => {
    onSaveSlot(idx);
    setNotice(`Progress saved to Slot ${idx + 1}.`);
  };

  const handleDelete = (idx: SaveSlotIndex) => {
    onDeleteSlot(idx);
    setNotice(`Cleared Slot ${idx + 1}.`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-slots-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B0D]/84 px-4 py-6"
    >
      <div className="flex max-h-[86vh] w-full max-w-2xl flex-col rounded-md border border-[#94A39E]/30 bg-[#0E171B] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#94A39E]/20 px-6 py-4">
          <div>
            <h2
              id="save-slots-title"
              className="font-display text-2xl font-semibold text-[#F2ECE1]"
            >
              Progress Slots
            </h2>
            <p className="mt-0.5 text-xs text-[#94A39E]">
              {canSave
                ? 'Save your current branch or switch to another path.'
                : 'Load a saved branching path or clear a slot.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] cursor-pointer rounded-md border border-[#94A39E]/30 px-4 py-1.5 text-xs font-medium text-[#CBD4D0] hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Close
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="border-b border-[#94A39E]/15 bg-[#132025] px-6 py-2.5 text-xs font-medium text-[#E09F5A]"
          >
            {notice}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
          {!canSave && hasAutosave && onResumeAutosave && (
            <div className="flex flex-col justify-between gap-3 rounded-md border border-[#E09F5A]/35 bg-[#152227] p-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-semibold tracking-wider text-[#E09F5A] uppercase">
                  Recent Session
                </div>
                <p className="mt-0.5 text-sm text-[#E6E0D4]">
                  Continue your latest autosaved path before opening a slot.
                </p>
              </div>
              <button
                type="button"
                onClick={onResumeAutosave}
                className="min-h-[42px] shrink-0 cursor-pointer rounded-md border border-[#E09F5A]/60 bg-[#0E171B] px-4 py-2 text-xs font-semibold text-[#F2ECE1] transition-colors duration-150 hover:bg-[#E09F5A] hover:text-[#0B1215] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
              >
                Resume Autosave
              </button>
            </div>
          )}
          {([0, 1, 2] as SaveSlotIndex[]).map((idx) => {
            const slot = saveSlots[idx];
            const isActive = activeSlotIndex === idx;
            const slotNumber = idx + 1;

            if (!slot) {
              return (
                <div
                  key={idx}
                  data-testid={`save-slot-${slotNumber}`}
                  className="flex flex-col justify-between gap-3 rounded-md border border-[#94A39E]/20 bg-[#121D22] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-xs font-semibold tracking-wider text-[#94A39E] uppercase">
                        Slot {slotNumber}
                      </span>
                      <span aria-hidden="true" className="text-[#738288]">
                        ·
                      </span>
                      <span className="text-xs text-[#738288]">Empty</span>
                    </div>
                    <p className="mt-1 text-sm text-[#94A39E]">
                      No branching path saved in this slot.
                    </p>
                  </div>

                  {canSave ? (
                    <button
                      type="button"
                      onClick={() => handleSave(idx)}
                      className="min-h-[42px] shrink-0 cursor-pointer rounded-md bg-[#E09F5A] px-5 py-2 text-xs font-semibold text-[#0B1215] transition-colors duration-150 hover:bg-[#EBB06E] focus-visible:outline-2 focus-visible:outline-[#F2ECE1]"
                    >
                      Save Here
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-[#738288]">
                      Empty Slot
                    </span>
                  )}
                </div>
              );
            }

            const scoreStr =
              slot.romanceScore > 0
                ? `+${slot.romanceScore}`
                : `${slot.romanceScore}`;
            const tier = evaluateAffinityTier(slot.romanceScore);

            return (
              <div
                key={idx}
                data-testid={`save-slot-${slotNumber}`}
                className="flex flex-col justify-between gap-4 rounded-md border border-[#94A39E]/30 bg-[#132025] p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono-num font-semibold tracking-wider text-[#E09F5A] uppercase">
                      Slot {slotNumber}
                    </span>
                    {isActive && (
                      <>
                        <span aria-hidden="true" className="text-[#94A39E]">
                          ·
                        </span>
                        <span className="font-medium text-[#F2ECE1]">
                          Active
                        </span>
                      </>
                    )}
                    <span aria-hidden="true" className="text-[#94A39E]">
                      ·
                    </span>
                    <span className="text-[#94A39E]">
                      {formatSavedTime(slot.savedAt)}
                    </span>
                  </div>

                  <div className="mt-1 truncate font-display text-xl font-semibold text-[#F2ECE1]">
                    {slot.chapter} · {slot.sceneLabel}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#C2CCC8]">
                    <span className="font-mono-num">
                      Affinity {scoreStr} ({tier})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">
                      {slot.history.length}{' '}
                      {slot.history.length === 1 ? 'choice' : 'choices'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">
                      {slot.completedQuests.length}/{SIDE_QUESTS.length} quests
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadSlot(idx)}
                    aria-label={`Load Slot ${slotNumber}`}
                    className="min-h-[42px] cursor-pointer rounded-md bg-[#E09F5A] px-4 py-2 text-xs font-semibold text-[#0B1215] transition-colors duration-150 hover:bg-[#EBB06E] focus-visible:outline-2 focus-visible:outline-[#F2ECE1]"
                  >
                    Load
                  </button>

                  {canSave && (
                    <button
                      type="button"
                      onClick={() => handleSave(idx)}
                      aria-label={`Overwrite Slot ${slotNumber}`}
                      className="min-h-[42px] cursor-pointer rounded-md border border-[#94A39E]/35 bg-[#0E171B] px-3.5 py-2 text-xs font-medium text-[#F2ECE1] transition-colors duration-150 hover:border-[#E09F5A]/70 focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
                    >
                      Overwrite
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    aria-label={`Delete Slot ${slotNumber}`}
                    className="min-h-[42px] cursor-pointer rounded-md border border-[#94A39E]/25 bg-transparent px-3 py-2 text-xs font-medium text-[#A6B5B0] transition-colors duration-150 hover:border-[#94A39E]/55 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
