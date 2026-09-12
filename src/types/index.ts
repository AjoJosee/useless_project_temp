import type React from 'react';

export type CauseOfDeath = 
  | 'one_word_assassin'
  | 'ghosting'
  | 'reaction_only'
  | 'topic_pivot';

export type GraveZone = 'trench' | 'hill';

export type ReactionType = 'incense' | 'pour_one_out' | 'fallen_soldier';

export interface GraveReaction {
  id: string;
  grave_id: string;
  type: ReactionType;
  created_at: string;
  session_id?: string;
}

export interface GraveComment {
  id: string;
  grave_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export interface Grave {
  id: string;
  victim_text: string;
  time_of_death_hours: number;
  cause_of_death: CauseOfDeath;
  zone: GraveZone;
  epitaph: string;
  is_haunted: boolean;
  created_at: string;
  reactions?: {
    incense: number;
    pour_one_out: number;
    fallen_soldier: number;
    recent_incense_count?: number; // active in last 24h
  };
  comments?: GraveComment[];
}

export interface CauseOfDeathInfo {
  id: CauseOfDeath;
  name: string;
  flavor: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  color: string;
}

export interface KublerRossStage {
  stage: 'Denial' | 'Anger' | 'Bargaining' | 'Depression' | 'Acceptance';
  subtitle: string;
  flavor: string;
}
