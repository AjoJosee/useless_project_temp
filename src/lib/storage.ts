import { Grave, CauseOfDeath, ReactionType, GraveComment } from '../types';
import { INITIAL_GRAVES } from './constants';
import { supabase, isSupabaseConfigured } from './supabase';

const GRAVES_STORAGE_KEY = 'rest_in_read_graves_v1';
const REACTIONS_STORAGE_KEY = 'rest_in_read_user_reactions_v1';
const SESSION_STORAGE_KEY = 'rest_in_read_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = 'mourner-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export function getUserReactions(): Record<string, ReactionType[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function hasUserReacted(graveId: string, type: ReactionType): boolean {
  const all = getUserReactions();
  return Boolean(all[graveId]?.includes(type));
}

export function recordUserReaction(graveId: string, type: ReactionType): void {
  if (typeof window === 'undefined') return;
  const all = getUserReactions();
  if (!all[graveId]) {
    all[graveId] = [];
  }
  if (!all[graveId].includes(type)) {
    all[graveId].push(type);
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(all));
  }
}

// Client-side 24-hour incense expiry filter
export function calculateActiveIncense(reactionsList: Array<{ type: string; created_at: string }>): {
  totalIncense: number;
  activeIncense: number;
} {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let total = 0;
  let active = 0;

  reactionsList.forEach(r => {
    if (r.type === 'incense') {
      total++;
      const reactionTime = new Date(r.created_at).getTime();
      if (!isNaN(reactionTime) && reactionTime > oneDayAgo) {
        active++;
      }
    }
  });

  return { totalIncense: total, activeIncense: active };
}

// Local storage storage engine
export function getLocalGraves(): Grave[] {
  if (typeof window === 'undefined') return INITIAL_GRAVES;
  try {
    const raw = localStorage.getItem(GRAVES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GRAVES_STORAGE_KEY, JSON.stringify(INITIAL_GRAVES));
      return INITIAL_GRAVES;
    }
    const parsed: Grave[] = JSON.parse(raw);
    return parsed;
  } catch {
    return INITIAL_GRAVES;
  }
}

export function saveLocalGraves(graves: Grave[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GRAVES_STORAGE_KEY, JSON.stringify(graves));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

export async function fetchAllGraves(): Promise<Grave[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: gravesData, error: gravesError } = await supabase
        .from('graves')
        .select('*')
        .order('created_at', { ascending: false });

      if (!gravesError && gravesData && gravesData.length > 0) {
        const { data: reactionsData } = await supabase.from('reactions').select('*');
        const { data: commentsData } = await supabase.from('comments').select('*').order('created_at', { ascending: true });

        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        const graves: Grave[] = gravesData.map(g => {
          const gReactions = (reactionsData || []).filter(r => r.grave_id === g.id);
          const gComments = (commentsData || []).filter(c => c.grave_id === g.id);

          const incenseReactions = gReactions.filter(r => r.type === 'incense');
          const activeIncense = incenseReactions.filter(r => new Date(r.created_at).getTime() > oneDayAgo).length;

          return {
            id: g.id,
            victim_text: g.victim_text,
            time_of_death_hours: Number(g.time_of_death_hours),
            cause_of_death: g.cause_of_death as CauseOfDeath,
            zone: g.zone,
            epitaph: g.epitaph,
            is_haunted: Boolean(g.is_haunted),
            created_at: g.created_at,
            reactions: {
              incense: incenseReactions.length,
              pour_one_out: gReactions.filter(r => r.type === 'pour_one_out').length,
              fallen_soldier: gReactions.filter(r => r.type === 'fallen_soldier').length,
              recent_incense_count: activeIncense
            },
            comments: gComments
          };
        });

        // Also merge any local graves not in Supabase so nothing is lost
        saveLocalGraves(graves);
        return graves;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local storage fallback:', err);
    }
  }

  // Fallback to local storage
  return getLocalGraves();
}

export async function saveNewGrave(params: {
  victim_text: string;
  time_of_death_hours: number;
  cause_of_death: CauseOfDeath;
  epitaph: string;
  is_haunted?: boolean;
}): Promise<Grave> {
  const id = 'grave-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
  const zone = params.victim_text.length > 200 ? 'trench' : 'hill';
  // ~15% chance of being haunted as specified
  const is_haunted = params.is_haunted !== undefined ? params.is_haunted : Math.random() < 0.15;
  const created_at = new Date().toISOString();

  const newGrave: Grave = {
    id,
    victim_text: params.victim_text,
    time_of_death_hours: params.time_of_death_hours,
    cause_of_death: params.cause_of_death,
    zone,
    epitaph: params.epitaph,
    is_haunted,
    created_at,
    reactions: {
      incense: 0,
      pour_one_out: 0,
      fallen_soldier: 0,
      recent_incense_count: 0
    },
    comments: []
  };

  // 1. Always update local storage first for snappy zero-latency UI
  const existing = getLocalGraves();
  const updated = [newGrave, ...existing];
  saveLocalGraves(updated);

  // 2. Insert into Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('graves').insert({
        id,
        victim_text: newGrave.victim_text,
        time_of_death_hours: newGrave.time_of_death_hours,
        cause_of_death: newGrave.cause_of_death,
        zone: newGrave.zone,
        epitaph: newGrave.epitaph,
        is_haunted: newGrave.is_haunted,
        created_at: newGrave.created_at
      });
    } catch (err) {
      console.warn('Failed to insert grave into Supabase:', err);
    }
  }

  return newGrave;
}

export async function addGraveReaction(graveId: string, type: ReactionType): Promise<{ success: boolean; reason?: string }> {
  // Rate limit: one reaction type per grave per session
  if (hasUserReacted(graveId, type)) {
    return { success: false, reason: `You have already offered ${type.replace(/_/g, ' ')} for this deceased text in this session.` };
  }

  recordUserReaction(graveId, type);
  const sessionId = getSessionId();
  const reactionId = 'reaction-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const createdAt = new Date().toISOString();

  // Update local storage
  const graves = getLocalGraves();
  const graveIndex = graves.findIndex(g => g.id === graveId);
  if (graveIndex >= 0) {
    const g = graves[graveIndex];
    if (!g.reactions) {
      g.reactions = { incense: 0, pour_one_out: 0, fallen_soldier: 0, recent_incense_count: 0 };
    }
    g.reactions[type] = (g.reactions[type] || 0) + 1;
    if (type === 'incense') {
      g.reactions.recent_incense_count = (g.reactions.recent_incense_count || 0) + 1;
    }
    graves[graveIndex] = { ...g };
    saveLocalGraves(graves);
  }

  // Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reactions').insert({
        id: reactionId,
        grave_id: graveId,
        type,
        created_at: createdAt,
        session_id: sessionId
      });
    } catch (err) {
      console.warn('Failed to sync reaction to Supabase:', err);
    }
  }

  return { success: true };
}

export async function addGraveComment(graveId: string, authorName: string, text: string): Promise<GraveComment> {
  const commentId = 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const createdAt = new Date().toISOString();

  const comment: GraveComment = {
    id: commentId,
    grave_id: graveId,
    author_name: authorName.trim() || 'Anonymous Mourner',
    text: text.trim(),
    created_at: createdAt
  };

  // Update local storage
  const graves = getLocalGraves();
  const graveIndex = graves.findIndex(g => g.id === graveId);
  if (graveIndex >= 0) {
    const g = graves[graveIndex];
    g.comments = [...(g.comments || []), comment];
    graves[graveIndex] = { ...g };
    saveLocalGraves(graves);
  }

  // Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('comments').insert({
        id: commentId,
        grave_id: graveId,
        author_name: comment.author_name,
        text: comment.text,
        created_at: createdAt
      });
    } catch (err) {
      console.warn('Failed to insert comment into Supabase:', err);
    }
  }

  return comment;
}
