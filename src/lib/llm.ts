import { CauseOfDeath } from '../types';

export async function generateEpitaph(params: {
  victim_text: string;
  cause_of_death: CauseOfDeath;
  time_of_death_hours: number;
}): Promise<string> {
  try {
    const res = await fetch('/api/epitaph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.epitaph) return data.epitaph;
    }
  } catch (err) {
    console.warn('Epitaph API request failed:', err);
  }

  // Client-side emergency fallback
  return "Consigned to the eternal drafts folder; rest in unread peace.";
}

export async function askOuijaGhost(params: {
  cause: string;
  epitaph: string;
  user_question?: string;
  is_escalation?: boolean;
  history?: { sender: 'ghost' | 'user'; text: string }[];
  victim_text?: string;
  time_of_death_hours?: number;
}): Promise<string> {
  try {
    const res = await fetch('/api/ouija', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message) return data.message;
    }
  } catch (err) {
    console.warn('Ouija API request failed:', err);
  }

  if (params.is_escalation) {
    return "Hello?? u there?? Did u seriously just ghost a ghost?!";
  }
  return "They left me on read, but you're making my ethereal spirit blush!";
}
