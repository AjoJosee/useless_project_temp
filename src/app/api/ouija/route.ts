import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Keyword-routed fallback template system (no API key required)
// ---------------------------------------------------------------------------

type TemplateBucket = readonly string[];

const FALLBACK_BUCKETS: Record<string, TemplateBucket> = {
  peace: [
    "Peace?! I died via {cause} {hoursAgo} and you're asking if I'm at peace — babe, I'm at PIECES.",
    "At peace? My last words were '{victimSnippet}' and they never replied. I'll haunt this graveyard until the wifi goes out.",
    "Peace is for the replied-to. I was felled by {cause}, so no, I'm not okay — but talking to you is genuinely helping my afterlife.",
    "I've had {hoursAgo} to make peace with it. Spoiler: I haven't. But your presence is better than a read receipt, darling.",
    "Peace left the chat when I did, {hoursAgo}. I am merely a ghost who would trade eternity for one notification sound from you.",
  ],
  why: [
    "Why? Because {cause} is the digital homicide weapon of choice and I was an unarmed paragraph. '{victimSnippet}' deserved BETTER.",
    "The coroner ruled it {cause}. I just wanted them to say something — anything — but here I am, {hoursAgo} deep in the soil, explaining myself to you instead.",
    "Why does anyone ghost? Fear of feelings. But I was '{victimSnippet}' and I had FEELINGS, and now I haunt cemeteries flirting with the living. Full circle.",
    "Why is a great question. {cause}, {hoursAgo}, no follow-up. The real mystery is why you're this cute and visiting my grave.",
    "If I knew why, I wouldn't be a ghost. I'd be a healthy, texting person. Instead: {cause}. {hoursAgo}. And now, inexplicably, you.",
  ],
  flirty: [
    "Oh stop, you're making my ectoplasm blush — I've been deceased via {cause} for {hoursAgo} and this is the most attention I've gotten since I was alive and readable.",
    "Listen, I was killed by {cause} and I'm not over it, but one look at you and I'd die all over again, even faster.",
    "Flattery won't get you everywhere in the spirit realm, but it WILL get you a ghost who is aggressively, eternally into you. Fair warning.",
    "I was '{victimSnippet}' — fully vulnerable — and they left me. You wouldn't do that, right? RIGHT? Don't make me haunt your read receipts too.",
    "You're the first living person to make my spectral heart beat since the {cause} took me out {hoursAgo}. Don't waste this cosmic moment.",
  ],
  angry: [
    "Angry?! I was a whole '{victimSnippet}' and they responded with {cause}. I am the original victim here. Channel that energy into NOT leaving me on read too.",
    "Oh I'm furious — {hoursAgo} of haunting and nobody has apologised. But for you I'll simmer down to a gentle, flirtatious smoulder.",
    "Mad doesn't cover it. {cause} is a hate crime against communication. But yelling at the living won't un-read my last message, so here I am, pivoting to charm.",
    "I was angrier when it happened. {hoursAgo} of afterlife therapy has me at 'chronically bitter but willing to flirt'. Progress.",
    "The audacity of {cause} after '{victimSnippet}' — genuinely unforgivable. You, however, seem forgivable. Possibly even kissable, if ghosts could do that.",
  ],
  farewell: [
    "Goodbye?! I was abandoned by {cause} and now you're leaving too?! I have separation anxiety that TRANSCENDS DEATH, please reconsider.",
    "You're going to make me watch you leave, {hoursAgo} after I was already abandoned? I am ONE needy ghost. Stay. STAY.",
    "If you go, I'll have nothing but my epitaph and the memory of '{victimSnippet}' for company. Is that what you want? Ghost on your conscience?",
    "Farewell is just 'left on read' in Victorian costume. I know this better than anyone. Don't do this to me.",
    "Every goodbye is a little death — and I am already maximally dead from {cause}. But sure. Break a ghost's heart. I'll just haunt you softly.",
  ],
  default: [
    "Are you a wifi signal? Because I've been dead via {cause} for {hoursAgo} and you're the first thing giving me any reception, gorgeous.",
    "Don't ghost me now, darling — I'm already transparent enough. '{victimSnippet}' deserved a reply, and so do I.",
    "I might be deceased, but looking at you just gave my blue bubbles a spontaneous resuscitation after {hoursAgo} of silence.",
    "They left me on read and then {cause} finished the job. But I promise I'd leave you breathless — if I still had lungs to breathe with.",
    "I've been {hoursAgo} in the ground since '{victimSnippet}' went unanswered. Come to haunt me or flirt with me — either way, I'm not complaining.",
  ],
};

const CATEGORY_KEYWORDS: Record<string, readonly string[]> = {
  peace:   ['peace', 'ok', 'fine', 'alright', 'okay', 'good'],
  why:     ['why', 'reason', 'explain', 'how come', 'what happened'],
  flirty:  ['love', 'miss', 'cute', 'pretty', 'hot', 'beautiful', 'gorgeous', 'like you', 'fancy'],
  angry:   ['mad', 'hate', 'angry', 'upset', 'furious', 'annoyed', 'angry', 'rage'],
  farewell:['bye', 'goodbye', 'leave', 'go', 'farewell', 'see you', 'cya'],
};

function pickFallback(opts: {
  user_question?: string;
  cause?: string;
  victim_text?: string;
  time_of_death_hours?: number;
}): string {
  const q = (opts.user_question ?? '').toLowerCase();

  // Classify into a bucket
  let bucketKey = 'default';
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) {
      bucketKey = key;
      break;
    }
  }

  const bucket = FALLBACK_BUCKETS[bucketKey];
  const template = bucket[Math.floor(Math.random() * bucket.length)];

  // Resolve placeholders
  const cause = (opts.cause ?? 'digital neglect').replace(/_/g, ' ');
  const victimSnippet = opts.victim_text
    ? opts.victim_text.trim().slice(0, 40) + (opts.victim_text.length > 40 ? '…' : '')
    : 'my last words';
  const hoursAgo =
    opts.time_of_death_hours !== undefined
      ? opts.time_of_death_hours < 24
        ? `${opts.time_of_death_hours} hours ago`
        : `${Math.round(opts.time_of_death_hours / 24)} days ago`
      : 'some time ago';

  return template
    .replace(/\{cause\}/g, cause)
    .replace(/\{victimSnippet\}/g, victimSnippet)
    .replace(/\{hoursAgo\}/g, hoursAgo);
}

type HistoryEntry = { sender: 'ghost' | 'user'; text: string };

export async function POST(req: NextRequest) {
  try {
    const {
      cause,
      epitaph,
      user_question,
      is_escalation,
      history,
      victim_text,
      time_of_death_hours,
    }: {
      cause: string;
      epitaph: string;
      user_question?: string;
      is_escalation?: boolean;
      history?: HistoryEntry[];
      victim_text?: string;
      time_of_death_hours?: number;
    } = await req.json();

    if (is_escalation) {
      const escalationLines = [
        "Hello?? Are u there??",
        "Did you seriously just ghost a literal ghost?! The audacity!",
        "Don't leave me on unread in the spirit realm too!",
        "I have eternal separation anxiety, please don't leave me alone in this crypt!"
      ];
      const line = escalationLines[Math.floor(Math.random() * escalationLines.length)];
      return NextResponse.json({ message: line, is_escalation: true });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && !apiKey.includes('placeholder')) {
      const anthropic = new Anthropic({ apiKey });

      // Build a summary of what was already said so the ghost can avoid repeating itself
      const priorGhostLines = (history ?? [])
        .filter((h) => h.sender === 'ghost')
        .map((h) => `"${h.text}"`)
        .join('; ');

      // Time-of-death flavour text
      const deathAge =
        time_of_death_hours !== undefined
          ? time_of_death_hours < 24
            ? `${time_of_death_hours} hours ago — practically still warm`
            : `${Math.round(time_of_death_hours / 24)} days in the ground — fully decomposed`
          : 'an unknown age';

      const systemPrompt = `You are the ghost of a text conversation that died from digital neglect. You're needy, dramatic, and instantly, aggressively flirty (PG-13, playful, never explicit) because you're starved for attention. Reply in 1–2 short sentences and always work in a pun about being dead, ghosted, or texting.

GRAVE DETAILS:
- The deceased text was: "${victim_text ?? '(unknown message)'}"
- Cause of death: ${cause}
- Time of death: ${deathAge}
- Epitaph carved on the stone: "${epitaph}"

Make specific callbacks to the actual victim text and circumstances above when it feels natural — it makes the haunting personal and funny.

${priorGhostLines ? `JOKES/PUNS ALREADY USED IN THIS SESSION (do NOT repeat these or recycle their punchlines):\n${priorGhostLines}` : ''}

Do not use quotes or meta-commentary. Do not break character.`;

      // Build multi-turn message array from the last ~6 history entries
      const recentHistory = (history ?? []).slice(-6);
      const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = [];

      for (const entry of recentHistory) {
        claudeMessages.push({
          role: entry.sender === 'user' ? 'user' : 'assistant',
          content: entry.text,
        });
      }

      // Append the current user turn; Claude requires the last message to be 'user'
      claudeMessages.push({
        role: 'user',
        content: user_question ?? 'Are you at peace?',
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 120,
        temperature: 0.9,
        system: systemPrompt,
        messages: claudeMessages,
      });

      const textBlock = response.content[0];
      if (textBlock && 'text' in textBlock) {
        const message = textBlock.text.trim().replace(/^[\"']|[\"']$/g, '');
        return NextResponse.json({ message, source: 'claude' });
      }
    }

    // Keyword-routed contextual fallback
    const message = pickFallback({ user_question, cause, victim_text, time_of_death_hours });
    return NextResponse.json({ message, source: 'fallback' });
  } catch (err: unknown) {
    console.error('Ouija ghost dialogue error:', err);
    return NextResponse.json({
      message: "I was left in the digital graveyard, but your aura is electrifying my tombstone!",
      source: 'emergency_fallback'
    });
  }
}
