import { useEffect, useState } from 'react';
import {
  ACHIEVEMENTS,
  AchievementId,
  MedalTier,
} from '../game/achievements';

interface AchievementsModalProps {
  unlockedAchievements: AchievementId[];
  onClose: () => void;
}

const MEDAL_PALETTE: Record<
  MedalTier,
  { rim: string; core: string; ribbon: string; text: string }
> = {
  Bronze: {
    rim: '#C88557',
    core: '#8C5230',
    ribbon: '#6D412A',
    text: 'text-[#D69B72]',
  },
  Silver: {
    rim: '#CBD6DA',
    core: '#7B9098',
    ribbon: '#4F646C',
    text: 'text-[#CBD6DA]',
  },
  Gold: {
    rim: '#F3C784',
    core: '#C48136',
    ribbon: '#8F5A24',
    text: 'text-[#F3C784]',
  },
};

function MedalIcon({
  tier,
  unlocked,
}: {
  tier: MedalTier;
  unlocked: boolean;
}) {
  const palette = MEDAL_PALETTE[tier];
  return (
    <svg
      viewBox="0 0 36 36"
      className="h-9 w-9 shrink-0"
      aria-hidden="true"
    >
      {/* Top ribbon */}
      <path
        d="M12 4h5l1 7h-4L12 4Zm12 0h-5l-1 7h4l2-7Z"
        fill={unlocked ? palette.ribbon : '#1E2A2E'}
        stroke={unlocked ? palette.rim : '#415055'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Outer medal circle */}
      <circle
        cx="18"
        cy="22"
        r="10"
        fill={unlocked ? palette.core : '#10191C'}
        stroke={unlocked ? palette.rim : '#415055'}
        strokeWidth="1.75"
      />
      {/* Inner star / crescent emblem */}
      <path
        d="m18 16.5 1.55 3.3 3.65.45-2.7 2.5.7 3.6L18 24.55l-3.2 1.8.7-3.6-2.7-2.5 3.65-.45L18 16.5Z"
        fill={unlocked ? palette.rim : '#2C393D'}
      />
    </svg>
  );
}

export function AchievementsModal({
  unlockedAchievements,
  onClose,
}: AchievementsModalProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked'>('all');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  const displayed =
    filterTab === 'unlocked'
      ? ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id))
      : ACHIEVEMENTS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-title"
      data-testid="achievements-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B0D]/86 px-4 py-6"
    >
      <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-[#94A39E]/30 bg-[#0E171B] shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#94A39E]/20 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h2
                id="achievements-title"
                className="font-display text-2xl font-semibold text-[#F2ECE1]"
              >
                Achievements
              </h2>
              <p
                data-testid="achievements-count"
                className="mt-0.5 font-mono-num text-xs text-[#E09F5A]"
              >
                {unlockedAchievements.length}/{ACHIEVEMENTS.length} Medals Unlocked
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter achievement medals"
              className="flex items-center gap-1 rounded-md border border-[#94A39E]/25 bg-[#091013] p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === 'all'}
                onClick={() => setFilterTab('all')}
                className={`min-h-[36px] cursor-pointer rounded px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  filterTab === 'all'
                    ? 'bg-[#E09F5A] text-[#0B1215]'
                    : 'text-[#CBD4D0] hover:text-[#F2ECE1]'
                }`}
              >
                All Medals ({ACHIEVEMENTS.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === 'unlocked'}
                onClick={() => setFilterTab('unlocked')}
                className={`min-h-[36px] cursor-pointer rounded px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  filterTab === 'unlocked'
                    ? 'bg-[#E09F5A] text-[#0B1215]'
                    : 'text-[#CBD4D0] hover:text-[#F2ECE1]'
                }`}
              >
                Unlocked ({unlockedAchievements.length})
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
          {displayed.length === 0 ? (
            <div className="rounded-md border border-[#94A39E]/20 bg-[#121D22] px-6 py-10 text-center">
              <p className="font-display text-xl text-[#F2ECE1]">
                No medals unlocked yet
              </p>
              <p className="mt-1.5 text-sm text-[#94A39E]">
                Make choices beneath the pines, finish side quests, or discover
                endings to earn your first medal.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {displayed.map((achievement) => {
                const isUnlocked = unlockedAchievements.includes(
                  achievement.id
                );
                const tierColor = MEDAL_PALETTE[achievement.medalTier].text;
                return (
                  <li
                    key={achievement.id}
                    data-testid={`achievement-card-${achievement.id}`}
                    data-unlocked={isUnlocked ? 'true' : 'false'}
                    className={`flex items-start gap-3.5 rounded-md border p-4 transition-colors duration-150 ${
                      isUnlocked
                        ? 'border-[#E09F5A]/45 bg-[#132025]'
                        : 'border-[#94A39E]/20 bg-[#0F181C] opacity-75'
                    }`}
                  >
                    <MedalIcon
                      tier={achievement.medalTier}
                      unlocked={isUnlocked}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider uppercase">
                        <span
                          className={
                            isUnlocked ? tierColor : 'text-[#738288]'
                          }
                        >
                          {achievement.medalTier} Medal
                        </span>
                        <span
                          className={
                            isUnlocked ? 'text-[#E09F5A]' : 'text-[#738288]'
                          }
                        >
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug text-[#F2ECE1]">
                        {achievement.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#A6B5B0]">
                        {achievement.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
