import { CauseOfDeath, CauseOfDeathInfo, KublerRossStage, Grave } from '../types';

export const CAUSES_OF_DEATH: Record<CauseOfDeath, CauseOfDeathInfo> = {
  one_word_assassin: {
    id: 'one_word_assassin',
    name: 'The One-Word Assassin',
    flavor: 'Bludgeoned to death by a single syllable: "K", "cool", or "nice"',
    icon: '🗡️',
    tagline: 'Terminated with extreme brevity',
    color: 'border-red-800 text-red-400 bg-red-950/40'
  },
  ghosting: {
    id: 'ghosting',
    name: 'The Ghosting',
    flavor: 'Vanished without a trace into the digital ether. Delivered, but never avenged',
    icon: '👻',
    tagline: 'Missing in action since read receipt',
    color: 'border-cyan-800 text-cyan-400 bg-cyan-950/40'
  },
  reaction_only: {
    id: 'reaction_only',
    name: 'The Reaction-Only Fatality',
    flavor: 'Hearted, liked, or thumbed up as a conversational DNR order',
    icon: '💔',
    tagline: 'A double-tap straight through the aorta',
    color: 'border-amber-800 text-amber-400 bg-amber-950/40'
  },
  topic_pivot: {
    id: 'topic_pivot',
    name: 'The Topic Pivot',
    flavor: 'Your emotional vulnerability was met with "anyway did you see that reel"',
    icon: '🔀',
    tagline: 'Conversation abruptly derailed and buried in unmarked terrain',
    color: 'border-purple-800 text-purple-400 bg-purple-950/40'
  }
};

export const KUBLER_ROSS_STAGES: KublerRossStage[] = [
  {
    stage: 'Denial',
    subtitle: 'Maybe their phone fell into the Mariana Trench.',
    flavor: 'Checking iMessage read receipts every 12 seconds...'
  },
  {
    stage: 'Anger',
    subtitle: 'They literally posted on their Instagram story 4 minutes ago.',
    flavor: 'Imagining an aggressive unsent double-text...'
  },
  {
    stage: 'Bargaining',
    subtitle: 'If I just follow up with "haha ignore that", will dignity return?',
    flavor: 'Consulting the council of groupchat screenshots...'
  },
  {
    stage: 'Depression',
    subtitle: 'It is fine. Becoming a monk in the high Himalayas was always plan B.',
    flavor: 'Staring into the blue message bubble void...'
  },
  {
    stage: 'Acceptance',
    subtitle: 'Declaring conversational time of death. Consigning remains to the dirt.',
    flavor: 'Preparing the official Certificate of Closure...'
  }
];

export const INTAKE_PRESETS = [
  {
    label: 'Paragraph Confession',
    cause: 'ghosting' as CauseOfDeath,
    hours: 72,
    text: 'Hey, I just wanted to say that I really enjoyed our conversation the other night. I don\'t usually open up about my childhood fear of escalators or my obsession with artisanal pickles, but with you it felt effortless. Would you want to grab coffee or maybe visit that weird antique shop this weekend? No pressure at all though, totally understand if your week is swamped!'
  },
  {
    label: 'The Dreaded "K"',
    cause: 'one_word_assassin' as CauseOfDeath,
    hours: 18,
    text: 'Spent 45 minutes cooking your grandmother\'s chicken cacciatore recipe and I even bought that expensive imported parmesan you insisted on. Table is set whenever you arrive!'
  },
  {
    label: 'Hearted & Abandoned',
    cause: 'reaction_only' as CauseOfDeath,
    hours: 120,
    text: 'My doctor said the biopsy came back clear and I finally have my energy back! Thank you for checking in on me last week, really meant the world to have your support.'
  },
  {
    label: 'The Brutal Pivot',
    cause: 'topic_pivot' as CauseOfDeath,
    hours: 36,
    text: 'I\'m honestly feeling pretty burnt out and overwhelmed with this family situation, feels like everything is collapsing at once and I have no one to talk to about it.'
  }
];

// Seed graves to make the graveyard rich, funny, and alive from day one
export const INITIAL_GRAVES: Grave[] = [
  {
    id: 'grave-seed-1',
    victim_text: 'Hey! I know it has been six months since we spoke, but I saw a raccoon eating half a croissant behind Trader Joe\'s and it immediately made me think of that road trip to Joshua Tree where we argued about whether raccoons have a democratic system of government. Hope you are thriving and your cactus is still alive!',
    time_of_death_hours: 312,
    cause_of_death: 'ghosting',
    zone: 'trench',
    epitaph: 'Joshua Tree remembered; your message was left in the desert dust.',
    is_haunted: true,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    reactions: {
      incense: 8,
      pour_one_out: 14,
      fallen_soldier: 19,
      recent_incense_count: 3
    },
    comments: [
      {
        id: 'c-1',
        grave_id: 'grave-seed-1',
        author_name: 'Dr. G. Mortis',
        text: 'The raccoon definitely had more respect for boundaries. Rest in power.',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'c-2',
        grave_id: 'grave-seed-1',
        author_name: 'Fellow Mourner',
        text: 'Pouring out a whole bottle of kombucha for this one. Beautiful prose, tragic recipient.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  },
  {
    id: 'grave-seed-2',
    victim_text: 'Are you alive? We had reservations at 7:30 and the hostess is giving me the look of deep pity usually reserved for Victorian orphans.',
    time_of_death_hours: 48,
    cause_of_death: 'one_word_assassin',
    zone: 'hill',
    epitaph: 'Table for one, forever inscribed upon the reservations book of eternity.',
    is_haunted: true,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    reactions: {
      incense: 15,
      pour_one_out: 32,
      fallen_soldier: 27,
      recent_incense_count: 5
    },
    comments: [
      {
        id: 'c-3',
        grave_id: 'grave-seed-2',
        author_name: 'Sommelier of Sorrow',
        text: 'Did they at least comp the bread basket while your soul evacuated?',
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ]
  },
  {
    id: 'grave-seed-3',
    victim_text: 'I poured my entire heart out explaining how much your friendship meant to me over the last four years, including all the sacrifices we made during sophomore year, and you hit me with the thumbs-up emoji like I just notified you of an updated Terms of Service agreement.',
    time_of_death_hours: 96,
    cause_of_death: 'reaction_only',
    zone: 'trench',
    epitaph: 'Four years of kinship reduced to a single digitized cyan thumb.',
    is_haunted: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    reactions: {
      incense: 4,
      pour_one_out: 21,
      fallen_soldier: 12,
      recent_incense_count: 1
    },
    comments: [
      {
        id: 'c-4',
        grave_id: 'grave-seed-3',
        author_name: 'Anonymous Paramedic',
        text: 'The thumbs up emoji should be classified under the Geneva Convention.',
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ]
  },
  {
    id: 'grave-seed-4',
    victim_text: 'So... what are we? Like officially?',
    time_of_death_hours: 720,
    cause_of_death: 'ghosting',
    zone: 'hill',
    epitaph: 'Official status: Deceased on impact with reality.',
    is_haunted: true,
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    reactions: {
      incense: 22,
      pour_one_out: 68,
      fallen_soldier: 84,
      recent_incense_count: 7
    },
    comments: [
      {
        id: 'c-5',
        grave_id: 'grave-seed-4',
        author_name: 'Grave Digger #4',
        text: 'Bravery grade: A+. Survival probability: 0%. Salute the fallen.',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ]
  },
  {
    id: 'grave-seed-5',
    victim_text: 'My cat of 16 years passed away this afternoon and I just feel completely gutted. She was with me through college and every breakup.',
    time_of_death_hours: 18,
    cause_of_death: 'topic_pivot',
    zone: 'hill',
    epitaph: 'A feline mourning hijacked by a meme about crypto taxes.',
    is_haunted: false,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    reactions: {
      incense: 35,
      pour_one_out: 49,
      fallen_soldier: 16,
      recent_incense_count: 12
    },
    comments: [
      {
        id: 'c-6',
        grave_id: 'grave-seed-5',
        author_name: 'Bastet Priest',
        text: 'May your cat judge them from celestial heights for that pivot.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'grave-seed-6',
    victim_text: 'I know this sounds completely unhinged but I wrote a five-verse folk song about our inside jokes and I recorded it on my acoustic guitar. The file was too big to iMessage so here is the Google Drive link with public viewing permissions. Verse 3 is about that taco truck where you spilled salsa on your white Converse.',
    time_of_death_hours: 168,
    cause_of_death: 'one_word_assassin',
    zone: 'trench',
    epitaph: 'Five folk verses silenced by the single letter "K".',
    is_haunted: true,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    reactions: {
      incense: 19,
      pour_one_out: 53,
      fallen_soldier: 91,
      recent_incense_count: 6
    },
    comments: [
      {
        id: 'c-7',
        grave_id: 'grave-seed-6',
        author_name: 'Grammy Committee',
        text: 'The acoustic guitar detail sealed your casket. True warrior death.',
        created_at: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  }
];
