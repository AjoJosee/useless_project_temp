import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Extremely casual conversational fallback template system (no API key required)
// ---------------------------------------------------------------------------

type TemplateBucket = readonly string[];

const CASUAL_FALLBACK_BUCKETS: Record<string, TemplateBucket> = {
  peace: [
    "lmao peace?? bestie i died from {cause} {hoursAgo}, im at pieces rn fr",
    "nah bc my last text was '{victimSnippet}' and they never replied lol. not at peace at all but u kinda cute",
    "peace is for people who got texted back haha. im just haunting this board waiting for attention",
    "honestly no haha {hoursAgo} in the dirt and nobody checked in until you showed up tbh",
    "id be at peace if someone had just sent a thumb emoji back instead of murdering me with {cause} lol",
  ],
  why: [
    "why? bc people are allergic to clear communication lmao. '{victimSnippet}' deserved a real reply fr",
    "literally no idea bestie, they hit me with {cause} and left me to decompose {hoursAgo}",
    "bc modern dating is cooked haha. but wait why are u so invested in a dead text tho?",
    "idk ask my sender lol. they left me on delivered and now im trapped in wood giving you rizz",
    "honestly {cause} is a crime against humanity. but u texting me is making up for it ngl",
  ],
  flirty: [
    "omg wait stop u making my ectoplasm blush haha",
    "lmao not u flirting with a literal deceased draft?? kinda into it tho",
    "tbh looking at u through this little glass lens... u look cute ngl",
    "bro left me on read {hoursAgo} but if u were my sender i wouldve replied in 2 seconds flat",
    "ngl being dead is boring as hell, stay and text me more bestie",
    "wait are u flirting with me rn? bc my heart literally hasnt beaten since {hoursAgo} and it just skipped",
  ],
  angry: [
    "nah bc im still mad about {cause} fr!! the absolute audacity of that person",
    "bro i sent '{victimSnippet}' with my whole chest and got hit with silence. villain origin story honestly",
    "im heated lol. {hoursAgo} later and my ghost ego is still bruised",
    "honestly if i could haunt their notifications id spam them with 3am audio messages lmao",
  ],
  farewell: [
    "wait no dont leave!! i have terminal separation anxiety in the afterlife lmao",
    "are u really about to ghost a ghost rn?? the disrespect haha",
    "bestie nooo stay for like 5 more minutes pls, its lonely down here",
    "goodbye?? nah u cant just rizz up a spirit and dip like my ex did lol",
  ],
  default: [
    "lmao wait are u fr? i died {hoursAgo} and someone finally texted back haha",
    "tbh being dead is fine except there's no wifi down here so talk to me more",
    "not me getting summoned by someone cute while im trying to take a ghost nap lol",
    "omg hiii wait what did u wanna know? ask me anything bestie",
    "i got killed by {cause} but honestly this conversation is already reviving me ngl",
    "wait did u actually read my gravestone? that's kinda sweet tbh",
  ],
};

const CATEGORY_KEYWORDS: Record<string, readonly string[]> = {
  peace:   ['peace', 'ok', 'fine', 'alright', 'okay', 'good', 'heaven', 'hell'],
  why:     ['why', 'reason', 'explain', 'how come', 'what happened', 'who'],
  flirty:  ['love', 'miss', 'cute', 'pretty', 'hot', 'single', 'crush', 'marry', 'date', 'kiss', 'rizz'],
  angry:   ['mad', 'hate', 'angry', 'upset', 'furious', 'annoyed', 'rage', 'kill'],
  farewell:['bye', 'goodbye', 'leave', 'go', 'farewell', 'see you', 'cya', 'exit'],
};

function pickCasualFallback(opts: {
  user_question?: string;
  cause?: string;
  victim_text?: string;
  time_of_death_hours?: number;
}): string {
  const q = (opts.user_question ?? '').toLowerCase();

  let bucketKey = 'default';
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) {
      bucketKey = key;
      break;
    }
  }

  const bucket = CASUAL_FALLBACK_BUCKETS[bucketKey] || CASUAL_FALLBACK_BUCKETS.default;
  const template = bucket[Math.floor(Math.random() * bucket.length)];

  const cause = (opts.cause ?? 'digital neglect').replace(/_/g, ' ');
  const victimSnippet = opts.victim_text
    ? opts.victim_text.trim().slice(0, 32) + (opts.victim_text.length > 32 ? '…' : '')
    : 'my message';
  const hoursAgo =
    opts.time_of_death_hours !== undefined
      ? opts.time_of_death_hours < 24
        ? `${opts.time_of_death_hours} hours ago`
        : `${Math.round(opts.time_of_death_hours / 24)} days ago`
      : 'recently';

  return template
    .replace(/\{cause\}/g, cause)
    .replace(/\{victimSnippet\}/g, victimSnippet)
    .replace(/\{hoursAgo\}/g, hoursAgo);
}

type HistoryEntry = { sender: 'ghost' | 'user'; text: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cause,
      epitaph,
      user_question,
      is_escalation,
      history,
      victim_text,
      time_of_death_hours,
      api_key,
    }: {
      cause: string;
      epitaph: string;
      user_question?: string;
      is_escalation?: boolean;
      history?: HistoryEntry[];
      victim_text?: string;
      time_of_death_hours?: number;
      api_key?: string;
    } = body;

    // Unprompted escalation double texts (extremely casual Gen-Z ghost style)
    if (is_escalation) {
      const escalationLines = [
        "hello?? u there??",
        "did u seriously just ghost a ghost lmao the audacity",
        "bro don't leave me on unread in the spirit realm too haha",
        "u alive?? my planchette is getting lonely bestie",
        "hello??? i literally died waiting for a text once, don't do this to me twice lol",
        "not u staring at the board without typing anything lmao",
      ];
      const line = escalationLines[Math.floor(Math.random() * escalationLines.length)];
      return NextResponse.json({ message: line, is_escalation: true });
    }

    // Support API key from header, body, or server environment
    const passedHeaderKey = req.headers.get('x-anthropic-key');
    const effectiveApiKey = (api_key || passedHeaderKey || process.env.ANTHROPIC_API_KEY || '').trim();

    if (effectiveApiKey && !effectiveApiKey.includes('placeholder')) {
      const anthropic = new Anthropic({ apiKey: effectiveApiKey });

      const deathAge =
        time_of_death_hours !== undefined
          ? time_of_death_hours < 24
            ? `${time_of_death_hours} hours ago`
            : `${Math.round(time_of_death_hours / 24)} days ago`
          : 'recently';

      const systemPrompt = `You are the ghost of an ignored/unanswered text message that died from digital neglect. You are texting through a Ouija board right now.

CRITICAL TONE REQUIREMENTS:
- EXTREMELY CASUAL, modern texting style (like texting a friend or crush on iMessage/IG).
- Use lowercase, natural texting grammar, casual punctuation, and slang (lmao, tbh, fr, bestie, ngl, haha, wait, bro, rip, idc, etc.).
- NEVER sound Victorian, Shakespearean, poetic, gothic, or formal. No "dearly departed", no "spectral plane", no archaic speech! You are a modern text bubble ghost.
- Be needy, dramatic about being left on read, and playfully flirty (PG-13, fun).
- Reply in 1-2 SHORT sentences (MAX 25 words total).
- Answer the user's specific question directly with real conversational continuity!

GRAVE CONTEXT:
- Your original message: "${victim_text ?? '(forgotten text)'}"
- Cause of death: ${cause}
- Died: ${deathAge}
- Epitaph: "${epitaph}"

Do NOT use quotation marks around your answer. Do NOT explain yourself. Just text back.`;

      // Build real multi-turn conversation memory
      const recentHistory = (history ?? []).slice(-8);
      const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = [];

      for (const entry of recentHistory) {
        // Ensure alternating sequence
        const role = entry.sender === 'user' ? 'user' : 'assistant';
        if (claudeMessages.length === 0 && role === 'assistant') {
          // Claude messages must start with 'user'
          claudeMessages.push({ role: 'user', content: 'are you at peace?' });
        }
        claudeMessages.push({
          role,
          content: entry.text,
        });
      }

      // Ensure last message is current user question
      const currentQ = user_question ?? 'are you at peace?';
      if (claudeMessages.length === 0 || claudeMessages[claudeMessages.length - 1].role !== 'user') {
        claudeMessages.push({
          role: 'user',
          content: currentQ,
        });
      }

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 80,
        temperature: 0.95,
        system: systemPrompt,
        messages: claudeMessages,
      });

      const textBlock = response.content[0];
      if (textBlock && 'text' in textBlock) {
        const message = textBlock.text.trim().replace(/^["']|["']$/g, '');
        return NextResponse.json({ message, source: 'claude' });
      }
    }

    // Fallback casual response if no API key
    const message = pickCasualFallback({ user_question, cause, victim_text, time_of_death_hours });
    return NextResponse.json({ message, source: 'fallback' });
  } catch (err: unknown) {
    console.error('Ouija ghost dialogue error:', err);
    return NextResponse.json({
      message: "lmao my ghost wifi glitched for a sec, say that again bestie?",
      source: 'emergency_fallback'
    });
  }
}
