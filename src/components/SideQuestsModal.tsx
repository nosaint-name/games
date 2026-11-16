import { useState } from 'react';
import {
  BRIDGE_RIDDLE,
  FIREFLY_SEQUENCE,
  KINDLING_SPOTS,
  SIDE_QUESTS,
  SideQuestId,
} from '../game/quests';
import { SceneId } from '../game/storyData';

interface SideQuestsModalProps {
  currentScene: SceneId;
  completedQuests: SideQuestId[];
  onCompleteQuest: (questId: SideQuestId) => void;
  onClose: () => void;
}

const DISPLAY_MARKERS: ReadonlyArray<(typeof FIREFLY_SEQUENCE)[number]> = [
  'Creek Cairn',
  'North Pine',
  'Birch Hollow',
];

export function SideQuestsModal({
  currentScene,
  completedQuests,
  onCompleteQuest,
  onClose,
}: SideQuestsModalProps) {
  const defaultQuestId: SideQuestId =
    SIDE_QUESTS.find((q) => q.scene === currentScene)?.id ?? 'firefly_signal';
  const [selectedQuestId, setSelectedQuestId] =
    useState<SideQuestId>(defaultQuestId);

  // Quest 1 state: Firefly Signal 3-step sequence
  const [fireflyStep, setFireflyStep] = useState(0);
  const [fireflyStatus, setFireflyStatus] = useState<string>(
    'Tap the markers in order: North Pine → Creek Cairn → Birch Hollow.'
  );

  // Quest 2 state: Bridge Riddle choice
  const [riddleFeedback, setRiddleFeedback] = useState<string | null>(null);
  const [selectedRiddleOption, setSelectedRiddleOption] = useState<
    string | null
  >(null);

  // Quest 3 state: Watchtower Kindling 3 dry cedar bundles out of 5 spots
  const [checkedSpots, setCheckedSpots] = useState<string[]>([]);
  const [foundDrySpots, setFoundDrySpots] = useState<string[]>([]);
  const [kindlingStatus, setKindlingStatus] = useState<string>(
    'Inspect the ridge spots to collect 3 dry cedar bundles.'
  );

  const selectedQuest =
    SIDE_QUESTS.find((q) => q.id === selectedQuestId) ?? SIDE_QUESTS[0];
  const isSelectedCompleted = completedQuests.includes(selectedQuest.id);

  const handleMarkerClick = (
    marker: (typeof FIREFLY_SEQUENCE)[number]
  ) => {
    if (completedQuests.includes('firefly_signal')) return;
    const expected = FIREFLY_SEQUENCE[fireflyStep];
    if (marker === expected) {
      const nextStep = fireflyStep + 1;
      setFireflyStep(nextStep);
      if (nextStep >= FIREFLY_SEQUENCE.length) {
        setFireflyStatus(
          'Signal complete — Julian pockets the Amber Firefly Vial.'
        );
        onCompleteQuest('firefly_signal');
      } else {
        setFireflyStatus(
          `${marker} lit (${nextStep}/${FIREFLY_SEQUENCE.length}) — follow the glow to ${FIREFLY_SEQUENCE[nextStep]}.`
        );
      }
    } else {
      setFireflyStep(0);
      setFireflyStatus(
        `${marker} flickers out of sequence. Begin again at North Pine.`
      );
    }
  };

  const handleRiddleOption = (optionId: string, hint: string) => {
    if (completedQuests.includes('bridge_riddle')) return;
    setSelectedRiddleOption(optionId);
    setRiddleFeedback(hint);
    if (optionId === BRIDGE_RIDDLE.answerId) {
      onCompleteQuest('bridge_riddle');
    }
  };

  const handleInspectSpot = (
    spotId: string,
    isDryCedar: boolean,
    clue: string
  ) => {
    if (completedQuests.includes('watchtower_kindling')) return;
    if (!checkedSpots.includes(spotId)) {
      setCheckedSpots((prev) => [...prev, spotId]);
    }
    if (isDryCedar && !foundDrySpots.includes(spotId)) {
      const nextDry = [...foundDrySpots, spotId];
      setFoundDrySpots(nextDry);
      if (nextDry.length >= 3) {
        setKindlingStatus(
          'All 3 dry cedar bundles gathered — enough for a steady kettle fire.'
        );
        onCompleteQuest('watchtower_kindling');
      } else {
        setKindlingStatus(
          `${clue} (${nextDry.length}/3 dry cedar bundles gathered.)`
        );
      }
    } else if (!isDryCedar) {
      setKindlingStatus(clue);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-quests-title"
      data-testid="side-quests-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B0D]/84 px-4 py-6"
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-[#94A39E]/30 bg-[#0E171B] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#94A39E]/20 px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="side-quests-title"
                className="font-display text-2xl font-semibold text-[#F2ECE1]"
              >
                Midnight Side Quests
              </h2>
              <span
                data-testid="quests-progress-count"
                className="font-mono-num text-xs font-semibold text-[#E09F5A]"
              >
                {completedQuests.length}/{SIDE_QUESTS.length} Completed
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#94A39E]">
              Complete small trail challenges anytime to earn extra Affinity with Julian.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] shrink-0 cursor-pointer rounded-md border border-[#94A39E]/30 px-4 py-1.5 text-xs font-medium text-[#CBD4D0] hover:border-[#E09F5A]/70 hover:text-[#F2ECE1] focus-visible:outline-2 focus-visible:outline-[#E09F5A]"
          >
            Close
          </button>
        </div>

        {/* Quest Selector Tabs */}
        <div
          role="tablist"
          aria-label="Available side quests"
          className="grid grid-cols-1 gap-2 border-b border-[#94A39E]/20 bg-[#091013] px-6 py-3 sm:grid-cols-3"
        >
          {SIDE_QUESTS.map((quest) => {
            const done = completedQuests.includes(quest.id);
            const active = selectedQuest.id === quest.id;
            const here = quest.scene === currentScene;
            return (
              <button
                key={quest.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedQuestId(quest.id)}
                className={`flex min-h-[44px] cursor-pointer flex-col justify-between rounded-md border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#E09F5A] ${
                  active
                    ? 'border-[#E09F5A] bg-[#142228]'
                    : 'border-[#94A39E]/20 bg-[#0E171B] hover:border-[#94A39E]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider uppercase">
                  <span className={here ? 'text-[#E09F5A]' : 'text-[#94A39E]'}>
                    {here ? 'Here Now' : quest.sceneName}
                  </span>
                  <span
                    className={`font-mono-num ${
                      done ? 'text-[#E09F5A]' : 'text-[#94A39E]'
                    }`}
                  >
                    {done ? 'Done' : `+${quest.rewardPoints}`}
                  </span>
                </div>
                <span className="mt-0.5 text-xs font-semibold text-[#F2ECE1]">
                  {quest.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Quest Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-[11px] font-medium tracking-wider text-[#94A39E] uppercase">
                {selectedQuest.sceneName}
                {selectedQuest.scene === currentScene
                  ? ' · Current Location'
                  : ''}
              </div>
              <h3 className="mt-1 font-display text-2xl font-semibold text-[#F2ECE1]">
                {selectedQuest.title}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-wider text-[#94A39E] uppercase">
                Reward
              </div>
              <div className="font-mono-num text-sm font-semibold text-[#E09F5A]">
                +{selectedQuest.rewardPoints} Affinity · {selectedQuest.rewardItem}
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-sm leading-relaxed text-[#CBD4D0]">
            {selectedQuest.summary}
          </p>

          {isSelectedCompleted ? (
            <div
              data-testid={`quest-completed-${selectedQuest.id}`}
              className="mt-5 rounded-md border border-[#E09F5A]/45 bg-[#142228] p-4"
            >
              <div className="font-mono-num text-xs font-semibold tracking-wider text-[#E09F5A] uppercase">
                Completed · +{selectedQuest.rewardPoints} Affinity ·{' '}
                {selectedQuest.rewardItem}
              </div>
              <p className="mt-2 font-display text-lg italic text-[#E6E0D4]">
                {selectedQuest.julianNote}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-[#94A39E]/25 bg-[#121D22] p-4">
              {selectedQuest.id === 'firefly_signal' && (
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#94A39E]">
                    <span>Trail Sequence</span>
                    <span className="font-mono-num font-semibold text-[#E09F5A]">
                      {fireflyStep}/{FIREFLY_SEQUENCE.length}
                    </span>
                  </div>
                  <p role="status" className="mt-1.5 text-sm text-[#E6E0D4]">
                    {fireflyStatus}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {DISPLAY_MARKERS.map((marker) => {
                      const sequencePos = FIREFLY_SEQUENCE.indexOf(marker);
                      const isLit = sequencePos < fireflyStep;
                      return (
                        <button
                          key={marker}
                          type="button"
                          onClick={() => handleMarkerClick(marker)}
                          className={`min-h-[46px] cursor-pointer rounded-md border px-3.5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#E09F5A] ${
                            isLit
                              ? 'border-[#E09F5A] bg-[#1E2E2B] text-[#F2ECE1]'
                              : 'border-[#94A39E]/30 bg-[#0E171B] text-[#E6E0D4] hover:border-[#E09F5A]/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">
                              {marker}
                            </span>
                            {isLit && (
                              <span className="font-mono-num text-xs font-semibold text-[#E09F5A]">
                                #{sequencePos + 1}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedQuest.id === 'bridge_riddle' && (
                <div>
                  <div className="text-xs font-medium tracking-wider text-[#94A39E] uppercase">
                    Carved Verse
                  </div>
                  <blockquote className="mt-2 border-l-2 border-[#E09F5A]/70 pl-3.5 font-display text-lg italic leading-relaxed text-[#F2ECE1]">
                    {BRIDGE_RIDDLE.verse}
                  </blockquote>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {BRIDGE_RIDDLE.options.map((option) => {
                      const chosen = selectedRiddleOption === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            handleRiddleOption(option.id, option.hint)
                          }
                          className={`min-h-[46px] cursor-pointer rounded-md border px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#E09F5A] ${
                            chosen
                              ? 'border-[#E09F5A] bg-[#19282E] text-[#F2ECE1]'
                              : 'border-[#94A39E]/30 bg-[#0E171B] text-[#E6E0D4] hover:border-[#E09F5A]/70'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {riddleFeedback && (
                    <p
                      role="status"
                      className="mt-3 text-xs leading-relaxed text-[#E09F5A]"
                    >
                      {riddleFeedback}
                    </p>
                  )}
                </div>
              )}

              {selectedQuest.id === 'watchtower_kindling' && (
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#94A39E]">
                    <span>Dry Cedar Bundles</span>
                    <span className="font-mono-num font-semibold text-[#E09F5A]">
                      {foundDrySpots.length}/3
                    </span>
                  </div>
                  <p role="status" className="mt-1.5 text-sm text-[#E6E0D4]">
                    {kindlingStatus}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {KINDLING_SPOTS.map((spot) => {
                      const isFound = foundDrySpots.includes(spot.id);
                      const isCheckedDamp =
                        checkedSpots.includes(spot.id) && !spot.isDryCedar;
                      return (
                        <button
                          key={spot.id}
                          type="button"
                          disabled={isFound || isCheckedDamp}
                          onClick={() =>
                            handleInspectSpot(
                              spot.id,
                              spot.isDryCedar,
                              spot.clue
                            )
                          }
                          className={`flex min-h-[46px] cursor-pointer items-center justify-between gap-2 rounded-md border px-3.5 py-2 text-left text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#E09F5A] disabled:cursor-default ${
                            isFound
                              ? 'border-[#E09F5A] bg-[#1E2E2B] font-semibold text-[#F2ECE1]'
                              : isCheckedDamp
                                ? 'border-[#94A39E]/15 bg-[#0B1215]/70 text-[#738288]'
                                : 'border-[#94A39E]/30 bg-[#0E171B] font-medium text-[#E6E0D4] hover:border-[#E09F5A]/70'
                          }`}
                        >
                          <span>{spot.label}</span>
                          <span className="font-mono-num text-xs text-[#94A39E]">
                            {isFound
                              ? 'Dry Cedar'
                              : isCheckedDamp
                                ? 'Damp'
                                : 'Search'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
