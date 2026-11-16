import { SceneId } from './storyData';

export type SideQuestId =
  | 'firefly_signal'
  | 'bridge_riddle'
  | 'watchtower_kindling';

export interface SideQuestDefinition {
  id: SideQuestId;
  title: string;
  scene: SceneId;
  sceneName: string;
  rewardPoints: number;
  rewardItem: string;
  summary: string;
  julianNote: string;
}

export const SIDE_QUESTS: SideQuestDefinition[] = [
  {
    id: 'firefly_signal',
    title: 'The Firefly Signal',
    scene: 'clearing',
    sceneName: 'Blackpine Clearing',
    rewardPoints: 5,
    rewardItem: 'Amber Firefly Vial',
    summary:
      'Tap the three carved trail markers in the nocturnal order shown by the fireflies to guide Julian’s path.',
    julianNote:
      '“Old watchmen used those carvings to signal safely through the fog.”',
  },
  {
    id: 'bridge_riddle',
    title: 'Maren’s Stone Cipher',
    scene: 'bridge',
    sceneName: 'Old Stone Bridge',
    rewardPoints: 5,
    rewardItem: 'Maren’s Brass Keyring',
    summary:
      'Solve the weathered riddle carved beneath the third arch of the stone bridge.',
    julianNote:
      '“Maren never locked a door without leaving a verse for anyone clever enough to read it.”',
  },
  {
    id: 'watchtower_kindling',
    title: 'Embers for the Kettle',
    scene: 'watchtower',
    sceneName: 'Ridge Watchtower',
    rewardPoints: 8,
    rewardItem: 'Cedarwood Charm',
    summary:
      'Search the mist-covered ridge spots and gather 3 bundles of dry cedar kindling before the rain breaks.',
    julianNote:
      '“Dry cedar catches fast—even when the mountain air turns damp.”',
  },
];

export const FIREFLY_SEQUENCE = ['North Pine', 'Creek Cairn', 'Birch Hollow'] as const;

export const BRIDGE_RIDDLE = {
  verse:
    '“I drink the dark without a mouth, warm cold hands on the ridge, and vanish when the morning breathes across the stone bridge.”',
  options: [
    { id: 'frost', label: 'Silver Frost', hint: 'Frost retreats at dawn, yet never warms cold hands.' },
    { id: 'lantern', label: 'Brass Lantern', hint: 'Correct — flame pushes back the dark and warms chilled hands.' },
    { id: 'echo', label: 'Creek Echo', hint: 'Sound carries across the water, yet leaves no warmth.' },
  ],
  answerId: 'lantern',
} as const;

export interface KindlingSpot {
  id: string;
  label: string;
  isDryCedar: boolean;
  clue: string;
}

export const KINDLING_SPOTS: KindlingSpot[] = [
  {
    id: 'hollow_root',
    label: 'Sheltered Pine Root',
    isDryCedar: true,
    clue: 'Dry heartwood tucked out of the wind.',
  },
  {
    id: 'creek_moss',
    label: 'Creekside Moss Bank',
    isDryCedar: false,
    clue: 'Too damp from the rising mist.',
  },
  {
    id: 'stone_ledge',
    label: 'Lower Arch Ledge',
    isDryCedar: true,
    clue: 'Split cedar splinters kept dry beneath the overhang.',
  },
  {
    id: 'fern_patch',
    label: 'Dewy Fern Hollow',
    isDryCedar: false,
    clue: 'Soaked with midnight condensation.',
  },
  {
    id: 'watch_alcove',
    label: 'Watchtower Door Alcove',
    isDryCedar: true,
    clue: 'Resin-rich cedar twigs stacked behind the threshold.',
  },
];

export function getSideQuestById(
  questId: SideQuestId
): SideQuestDefinition | undefined {
  return SIDE_QUESTS.find((q) => q.id === questId);
}
