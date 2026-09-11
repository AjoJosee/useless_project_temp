import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const FALLBACK_EPITAPHS: Record<string, string[]> = {
  one_word_assassin: [
    "Slain by a single keystroke; resurrected in our collective trauma.",
    "A symphony of emotional vulnerability dismantled by the letter 'K'.",
    "Here lies a masterpiece silenced by a one-syllable executioner.",
    "Died instantly of acute monosyllabic bludgeoning.",
    "Buried under the immense, crushing weight of 'cool'."
  ],
  ghosting: [
    "Delivered into the void; floating among satellites without a reply.",
    "Gone without a trace, survived only by unread timestamps.",
    "Left on read, consigned to earth, forever unacknowledged.",
    "A phantom message haunting the server towers forevermore.",
    "Blue bubbles sent; radio silence returned from beyond the grave."
  ],
  reaction_only: [
    "A life extinguished by a casual tap of the thumb.",
    "Sentenced to death by a solitary, lukewarm heart emoji.",
    "Treated to an emoji reaction when words were desperately needed.",
    "Received a digital thumbs-up as a conversational DNR order.",
    "Terminated by a double-tap straight through the fragile aorta."
  ],
  topic_pivot: [
    "An existential plea buried alive beneath an unprompted TikTok link.",
    "Derailed at high speed by 'anyway did you see that meme'.",
    "Crushed under the sudden redirection of conversational traffic.",
    "Vulnerability offered; completely ignored for random gossip.",
    "Swept under the digital rug with breathtaking conversational agility."
  ]
};

export async function POST(req: NextRequest) {
  try {
    const { victim_text, cause_of_death, time_of_death_hours } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && !apiKey.includes('placeholder')) {
      const anthropic = new Anthropic({ apiKey });
      const timeStr = time_of_death_hours >= 48 
        ? `${Math.round(time_of_death_hours / 24)} days` 
        : `${time_of_death_hours} hours`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        temperature: 0.8,
        system: `You write one darkly funny, one-sentence epitaph (max 15 words) for a dead text-message conversation, in the voice of a tombstone inscription. Self-aware and comedic, never cruel to the person who submitted it. Do not include quotation marks or commentary.`,
        messages: [
          {
            role: 'user',
            content: `Cause of death: ${cause_of_death}. Time since read: ${timeStr}. The message: ${victim_text}`
          }
        ]
      });

      const textBlock = response.content[0];
      if (textBlock && 'text' in textBlock) {
        const epitaph = textBlock.text.trim().replace(/^["']|["']$/g, '');
        return NextResponse.json({ epitaph, source: 'claude' });
      }
    }

    // Contextual fallback generator
    const list = FALLBACK_EPITAPHS[cause_of_death] || FALLBACK_EPITAPHS.ghosting;
    const randomFallback = list[Math.floor(Math.random() * list.length)];
    return NextResponse.json({ epitaph: randomFallback, source: 'fallback' });
  } catch (err: unknown) {
    console.error('Epitaph generation error:', err);
    return NextResponse.json(
      { epitaph: 'Left on read, consigned to dust, forever unanswered.', source: 'emergency_fallback' },
      { status: 200 }
    );
  }
}
