export type SceneId = 'clearing' | 'bridge' | 'watchtower' | 'hearth';
export type CharacterMood = 'neutral' | 'warm' | 'guarded';
export type ChoiceTone = 'warm' | 'curious' | 'guarded';
export type EndingId =
  | 'hearthbound'
  | 'silver_truce'
  | 'midnight_enigma'
  | 'guarded_parting';

export interface DialogueChoice {
  label: string;
  next: string;
  points: number;
  tone: ChoiceTone;
  minScore?: number;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  chapter: string;
  scene: SceneId;
  mood: CharacterMood;
  text: string;
  choices: DialogueChoice[];
  isEnding?: boolean;
  endingId?: EndingId;
  endingTitle?: string;
  endingSummary?: string;
}

export const LOGO_EMBLEM_SRC =
  '/src/assets/images/game_logo_emblem_1794821535836.jpg';
export const COVER_POSTER_SRC =
  '/src/assets/images/cover_poster_1794821536303.jpg';

export interface DisplayArtwork {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  aspect: '16:9' | '3:4' | '1:1';
}

export const DISPLAY_GALLERY: DisplayArtwork[] = [
  {
    id: 'cover',
    title: 'After Midnight — Key Poster',
    subtitle: 'Julian on the misty ridge path with his brass lantern',
    src: COVER_POSTER_SRC,
    aspect: '3:4',
  },
  {
    id: 'emblem',
    title: 'Crescent & Lantern Crest',
    subtitle: 'Official game medallion and emblem',
    src: LOGO_EMBLEM_SRC,
    aspect: '1:1',
  },
  {
    id: 'clearing',
    title: 'Blackpine Clearing',
    subtitle: 'Chapter I · Where the midnight encounter begins',
    src: '/src/assets/images/title_bg_1794820290121.jpg',
    aspect: '16:9',
  },
  {
    id: 'bridge',
    title: 'Old Stone Bridge',
    subtitle: 'Chapter II · Fog drifting across the forest creek',
    src: '/src/assets/images/scene_bridge_1794820290379.jpg',
    aspect: '16:9',
  },
  {
    id: 'watchtower',
    title: 'Ridge Watchtower',
    subtitle: 'Chapter III · Weathered stone ruins beneath the moon',
    src: '/src/assets/images/scene_watchtower_1794820291210.jpg',
    aspect: '16:9',
  },
  {
    id: 'hearth',
    title: 'Watchtower Hearth',
    subtitle: 'Chapter IV · Cedar embers while midnight rain falls',
    src: '/src/assets/images/scene_hearth_1794821536529.jpg',
    aspect: '16:9',
  },
  {
    id: 'julian_moon',
    title: 'Julian · Moonlight',
    subtitle: 'Calm, guarded expression on the night watch',
    src: '/src/assets/images/damian_neutral_1794820291183.jpg',
    aspect: '3:4',
  },
  {
    id: 'julian_lantern',
    title: 'Julian · Lantern Light',
    subtitle: 'Softened gaze beside warm amber flame',
    src: '/src/assets/images/damian_warm_1794820292843.jpg',
    aspect: '3:4',
  },
];

export const SCENE_ASSETS: Record<SceneId, { src: string; label: string }> = {
  clearing: {
    src: '/src/assets/images/title_bg_1794820290121.jpg',
    label: 'Blackpine Clearing',
  },
  bridge: {
    src: '/src/assets/images/scene_bridge_1794820290379.jpg',
    label: 'Old Stone Bridge',
  },
  watchtower: {
    src: '/src/assets/images/scene_watchtower_1794820291210.jpg',
    label: 'Ridge Watchtower',
  },
  hearth: {
    src: '/src/assets/images/scene_hearth_1794821536529.jpg',
    label: 'Watchtower Hearth',
  },
};

export const PORTRAIT_ASSETS: Record<CharacterMood, { src: string; alt: string }> = {
  neutral: {
    src: '/src/assets/images/damian_neutral_1794820291183.jpg',
    alt: 'Julian watching calmly under silver moonlight',
  },
  guarded: {
    src: '/src/assets/images/damian_neutral_1794820291183.jpg',
    alt: 'Julian standing guarded in the shadows of the pines',
  },
  warm: {
    src: '/src/assets/images/damian_warm_1794820292843.jpg',
    alt: 'Julian smiling faintly in warm lantern light',
  },
};

export const ALL_ENDINGS: { id: EndingId; title: string; hint: string }[] = [
  {
    id: 'hearthbound',
    title: 'Hearthbound Before Dawn',
    hint: 'Seek warmth and reach high affinity by the watchtower embers.',
  },
  {
    id: 'silver_truce',
    title: 'A Silver Truce',
    hint: 'Share honest curiosity and stay beneath the arch as rain falls.',
  },
  {
    id: 'midnight_enigma',
    title: 'Echoes on the Bridge',
    hint: 'Walk the middle path between distance and intrigue.',
  },
  {
    id: 'guarded_parting',
    title: 'Alone in the Pines',
    hint: 'Keep your guard raised until the village road.',
  },
];

export const DIALOGUE_TREE: Record<string, DialogueNode> = {
  start: {
    id: 'start',
    speaker: 'Julian',
    chapter: 'I · The Clearing',
    scene: 'clearing',
    mood: 'neutral',
    text: "You shouldn't be out in the woods after midnight.",
    choices: [
      { label: 'I was looking for you.', next: 'flirt', points: 10, tone: 'warm' },
      { label: 'Mind your own business.', next: 'cold', points: -5, tone: 'guarded' },
    ],
  },
  flirt: {
    id: 'flirt',
    speaker: 'Julian',
    chapter: 'I · The Clearing',
    scene: 'clearing',
    mood: 'warm',
    text: 'Careful... you might find more than you bargained for.',
    choices: [
      {
        label: "I'll take my chances. Walk with me to the bridge.",
        next: 'bridge_warm',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'What are you guarding out here so late?',
        next: 'bridge_curious',
        points: 5,
        tone: 'curious',
      },
      {
        label: 'Maybe I already did. Goodnight, Julian.',
        next: 'bridge_tease',
        points: 0,
        tone: 'guarded',
      },
    ],
  },
  cold: {
    id: 'cold',
    speaker: 'Julian',
    chapter: 'I · The Clearing',
    scene: 'clearing',
    mood: 'guarded',
    text: 'Suit yourself. Stay safe.',
    choices: [
      {
        label: "Wait—I didn't mean to snap. The fog turned me around.",
        next: 'bridge_curious',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'I know these trails better than you think.',
        next: 'bridge_tense',
        points: 0,
        tone: 'curious',
      },
      {
        label: 'Keep your lantern to yourself and let me pass.',
        next: 'bridge_chill',
        points: -5,
        tone: 'guarded',
      },
    ],
  },
  bridge_warm: {
    id: 'bridge_warm',
    speaker: 'Julian',
    chapter: 'II · The Stone Bridge',
    scene: 'bridge',
    mood: 'warm',
    text: "The creek rises fast after rain, and the old stones get slick. If you're determined to stay out past twelve, you're staying beside my lantern.",
    choices: [
      {
        label: "Step closer to share the lantern's warmth.",
        next: 'bridge_confide',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'Ask why he keeps the night watch alone.',
        next: 'watch_secret',
        points: 5,
        tone: 'curious',
      },
    ],
  },
  bridge_curious: {
    id: 'bridge_curious',
    speaker: 'Julian',
    chapter: 'II · The Stone Bridge',
    scene: 'bridge',
    mood: 'neutral',
    text: "Poachers, mostly. And stray travelers who mistake the creek mist for the town road. Though tonight, I had a feeling you weren't lost by accident.",
    choices: [
      {
        label: "Admit you came out because you couldn't sleep.",
        next: 'bridge_confide',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'Press him about the lights near the old watchtower.',
        next: 'watch_secret',
        points: 5,
        tone: 'curious',
      },
      {
        label: 'Deflect—say you only wanted quiet air.',
        next: 'bridge_tense',
        points: -5,
        tone: 'guarded',
      },
    ],
  },
  bridge_tease: {
    id: 'bridge_tease',
    speaker: 'Julian',
    chapter: 'II · The Stone Bridge',
    scene: 'bridge',
    mood: 'warm',
    text: "Hold on. You don't walk half a mile into Blackpine Hollow just to say goodnight. At least let me see you across the stone bridge.",
    choices: [
      {
        label: 'Smile and let him take the lead.',
        next: 'bridge_confide',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'Agree, if he stops acting so cryptic.',
        next: 'watch_secret',
        points: 5,
        tone: 'curious',
      },
    ],
  },
  bridge_tense: {
    id: 'bridge_tense',
    speaker: 'Julian',
    chapter: 'II · The Stone Bridge',
    scene: 'bridge',
    mood: 'guarded',
    text: 'Stubborn. The bridge ahead is half-washed out, and the pines swallow sound out here. Walk behind me—at least until we clear the gorge.',
    choices: [
      {
        label: 'Fall into step beside him without arguing.',
        next: 'watch_secret',
        points: 5,
        tone: 'warm',
      },
      {
        label: 'Stay two paces back and watch the treeline.',
        next: 'bridge_chill',
        points: -5,
        tone: 'guarded',
      },
    ],
  },
  bridge_chill: {
    id: 'bridge_chill',
    speaker: 'Julian',
    chapter: 'II · The Stone Bridge',
    scene: 'bridge',
    mood: 'guarded',
    text: "Have it your way. Just watch the third arch of the bridge—the mortar gave out last autumn, and nobody's coming down here at this hour to pull you out.",
    choices: [
      {
        label: 'Pause when a stone shifts underfoot and catch his sleeve.',
        next: 'tower_shelter',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'Cross alone in silence toward the watchtower.',
        next: 'tower_cold',
        points: -5,
        tone: 'guarded',
      },
    ],
  },
  bridge_confide: {
    id: 'bridge_confide',
    speaker: 'Julian',
    chapter: 'III · The Watchtower',
    scene: 'watchtower',
    mood: 'warm',
    text: "Look up there—someone lit the hearth inside the old watchtower before dusk, and it wasn't the ranger. Stay close while we check the archway.",
    choices: [
      {
        label: 'Take his hand as mist thickens along the ridge.',
        next: 'tower_hearth',
        points: 10,
        tone: 'warm',
      },
      {
        label: "Offer to watch the ridge while he checks inside.",
        next: 'tower_shelter',
        points: 5,
        tone: 'curious',
      },
    ],
  },
  watch_secret: {
    id: 'watch_secret',
    speaker: 'Julian',
    chapter: 'III · The Watchtower',
    scene: 'watchtower',
    mood: 'neutral',
    text: "Years ago, Maren left keys to the watchtower under the loose flagstone so travelers caught by frost wouldn't freeze. Tonight the chimney's smoking.",
    choices: [
      {
        label: 'Suggest stepping inside together before the rain breaks.',
        next: 'tower_hearth',
        points: 10,
        tone: 'warm',
      },
      {
        label: 'Ask who else knows about that hiding spot.',
        next: 'tower_shelter',
        points: 5,
        tone: 'curious',
      },
      {
        label: 'Insist on heading straight back toward the village road.',
        next: 'tower_cold',
        points: -5,
        tone: 'guarded',
      },
    ],
  },
  tower_hearth: {
    id: 'tower_hearth',
    speaker: 'Julian',
    chapter: 'III · The Watchtower',
    scene: 'hearth',
    mood: 'warm',
    text: "It's just banked cedar embers—Maren must have checked the flue earlier. Still, the rain's starting. Sit by the arch for a minute. You're shivering.",
    choices: [
      {
        label: 'Lean against his shoulder under the coat he drapes over you.',
        next: 'ending_hearthbound',
        points: 15,
        tone: 'warm',
      },
      {
        label: 'Stand by the doorway, watching moonlight through the pines.',
        next: 'ending_silver_truce',
        points: 5,
        tone: 'curious',
      },
    ],
  },
  tower_shelter: {
    id: 'tower_shelter',
    speaker: 'Julian',
    chapter: 'III · The Watchtower',
    scene: 'hearth',
    mood: 'warm',
    text: "Nothing inside but dry kindling and an old brass kettle. Still... I'm glad you didn't turn back at the clearing. The woods are quieter with you here.",
    choices: [
      {
        label: "Promise to meet him at the bridge tomorrow night too.",
        next: 'ending_hearthbound',
        points: 10,
        tone: 'warm',
        minScore: 10,
      },
      {
        label: 'Share a warm cup of pine tea until the mist clears.',
        next: 'ending_silver_truce',
        points: 5,
        tone: 'curious',
      },
      {
        label: 'Thank him politely and slip out while the rain eases.',
        next: 'ending_midnight_enigma',
        points: -5,
        tone: 'guarded',
      },
    ],
  },
  tower_cold: {
    id: 'tower_cold',
    speaker: 'Julian',
    chapter: 'III · The Watchtower',
    scene: 'watchtower',
    mood: 'guarded',
    text: "You made it across on your own. I'll give you that. The village road lies straight past the watchtower wall—just follow the iron mileposts.",
    choices: [
      {
        label: "Glance back once and admit you're glad he kept watch.",
        next: 'ending_midnight_enigma',
        points: 5,
        tone: 'curious',
      },
      {
        label: 'Disappear into the pines without a backward look.',
        next: 'ending_guarded_parting',
        points: -10,
        tone: 'guarded',
      },
    ],
  },
  ending_hearthbound: {
    id: 'ending_hearthbound',
    speaker: 'Julian',
    chapter: 'IV · Before Dawn',
    scene: 'hearth',
    mood: 'warm',
    text: "Midnight's nearly over. Next time you come looking for me in the dark, bring two lanterns—or just ask.",
    choices: [],
    isEnding: true,
    endingId: 'hearthbound',
    endingTitle: 'Hearthbound Before Dawn',
    endingSummary:
      "Wrapped in Julian's wool coat beside the watchtower embers, midnight caution gives way to an unspoken promise to meet again when the moon rises.",
  },
  ending_silver_truce: {
    id: 'ending_silver_truce',
    speaker: 'Julian',
    chapter: 'IV · Before Dawn',
    scene: 'hearth',
    mood: 'warm',
    text: 'Funny. I came out here tonight expecting trouble, and instead I found good company. Walk slow on the road back.',
    choices: [],
    isEnding: true,
    endingId: 'silver_truce',
    endingTitle: 'A Silver Truce',
    endingSummary:
      'Standing beneath the stone arch as rain patters across the pines, you and Julian trade quiet truths rather than guarded warnings.',
  },
  ending_midnight_enigma: {
    id: 'ending_midnight_enigma',
    speaker: 'Julian',
    chapter: 'IV · Before Dawn',
    scene: 'bridge',
    mood: 'neutral',
    text: "You're harder to read than the river fog. Take care of yourself out there—until our paths cross again.",
    choices: [],
    isEnding: true,
    endingId: 'midnight_enigma',
    endingTitle: 'Echoes on the Bridge',
    endingSummary:
      'You part at the ridge with lingering curiosity—neither strangers nor allies yet, bound only by a second glance through the mist.',
  },
  ending_guarded_parting: {
    id: 'ending_guarded_parting',
    speaker: 'Julian',
    chapter: 'IV · Before Dawn',
    scene: 'clearing',
    mood: 'guarded',
    text: "The road's clear from here. Don't make a habit of wandering Blackpine Hollow alone.",
    choices: [],
    isEnding: true,
    endingId: 'guarded_parting',
    endingTitle: 'Alone in the Pines',
    endingSummary:
      'Sharp words keep the distance intact. Julian dims his lantern behind you, leaving only silver moonlight and the rustle of evergreens.',
  },
};
