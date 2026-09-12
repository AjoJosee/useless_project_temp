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
  api_key?: string;
}): Promise<string> {
  try {
    // If no key explicitly passed, check localStorage
    let keyToUse = params.api_key;
    if (!keyToUse && typeof window !== 'undefined') {
      keyToUse = localStorage.getItem('rest_in_read_anthropic_key') || undefined;
    }

    const payload = {
      ...params,
      api_key: keyToUse
    };

    const res = await fetch('/api/ouija', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(keyToUse ? { 'x-anthropic-key': keyToUse } : {})
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message) return data.message;
    }
  } catch (err) {
    console.warn('Ouija API request failed:', err);
  }

  if (params.is_escalation) {
    return "hello?? u there?? did u seriously just ghost a ghost lmao";
  }
  return "lmao wait they left me on read, but you're kinda making my ghost heart flutter ngl";
}
