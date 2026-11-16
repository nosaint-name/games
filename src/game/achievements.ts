import { ALL_ENDINGS, EndingId } from './storyData';
import { SIDE_QUESTS, SideQuestId } from './quests';

export type AchievementId =
  | 'first_meeting'
  | 'trail_scout'
  | 'all_quests'
  | 'growing_closer'
  | 'true_ending'
  | 'all_endings';

export type MedalTier = 'Bronze' | 'Silver' | 'Gold';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  medalTier: MedalTier;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_meeting',
    title: 'First Meeting',
    description:
      'Meet Julian under the Blackpine moon and make your first choice.',
    medalTier: 'Bronze',
  },
  {
    id: 'trail_scout',
    title: 'Midnight Trailblazer',
    description: 'Complete your first Midnight Side Quest along the trail.',
    medalTier: 'Bronze',
  },
  {
    id: 'all_quests',
    title: 'Completed All Quests',
    description:
      'Solve all three Midnight Side Quests in a single playthrough.',
    medalTier: 'Silver',
  },
  {
    id: 'growing_closer',
    title: 'Lantern Warmth',
    description: 'Reach the Devoted relationship tier (+25 Affinity or higher).',
    medalTier: 'Silver',
  },
  {
    id: 'true_ending',
    title: 'Reached True Ending',
    description: 'Unlock the Hearthbound ending beside the watchtower fire.',
    medalTier: 'Gold',
  },
  {
    id: 'all_endings',
    title: 'Every Path Walked',
    description: 'Discover all four endings of After Midnight.',
    medalTier: 'Gold',
  },
];

export interface AchievementCheckContext {
  currentAchievements: AchievementId[];
  romanceScore: number;
  bestScore: number;
  choicesCount: number;
  completedQuests: SideQuestId[];
  unlockedEndings: EndingId[];
}

export function evaluateUnlockedAchievements(
  ctx: AchievementCheckContext
): AchievementId[] {
  const unlocked = new Set<AchievementId>(ctx.currentAchievements);

  if (ctx.choicesCount >= 1) {
    unlocked.add('first_meeting');
  }
  if (ctx.completedQuests.length >= 1) {
    unlocked.add('trail_scout');
  }
  if (ctx.completedQuests.length >= SIDE_QUESTS.length) {
    unlocked.add('all_quests');
  }
  if (ctx.romanceScore >= 25 || ctx.bestScore >= 25) {
    unlocked.add('growing_closer');
  }
  if (ctx.unlockedEndings.includes('hearthbound')) {
    unlocked.add('true_ending');
  }
  if (ctx.unlockedEndings.length >= ALL_ENDINGS.length) {
    unlocked.add('all_endings');
  }

  return ACHIEVEMENTS.map((a) => a.id).filter((id) => unlocked.has(id));
}

export function getAchievementById(
  id: AchievementId
): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
