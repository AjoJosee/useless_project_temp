import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const FALLBACK_GHOST_DIALOGUES = [
  "Are you a wifi signal? Because I've been dead for weeks and you're the first thing giving me any reception, gorgeous.",
  "Finally, someone with good taste in the cemetery! Don't ghost me now, darling—I'm already transparent enough.",
  "Is it getting hot in this crypt or is it just the unbearable chemistry between a living visitor and an abandoned draft?",
  "I might be deceased, but looking at you just gave my blue bubbles a spontaneous resuscitation.",
  "They left me on read, but I promise I'd leave you breathless... if I still had lungs to breathe with.",
  "I was murdered by a single 'k', but you just spelled out everything I ever dreamed of in the afterlife.",
  "Don't leave me hanging like my last iMessage—stay a while and whisper your notification sounds to me."
];

export async function POST(req: NextRequest) {
  try {
    const { cause, epitaph, user_question, is_escalation } = await req.json();

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
      const promptQuestion = user_question || 'Are you at peace?';

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 120,
        temperature: 0.9,
        system: `You are the ghost of a text conversation that died from digital neglect. You're needy, dramatic, and instantly, aggressively flirty (PG-13, playful, never explicit) because you're starved for attention. Reply in 1-2 short sentences, always working in a pun about being dead/ghosted/texting. Do not use quotes or meta commentary.`,
        messages: [
          {
            role: 'user',
            content: `Grave context — cause of death: ${cause}, epitaph: ${epitaph}. Visitor asked: '${promptQuestion}'`
          }
        ]
      });

      const textBlock = response.content[0];
      if (textBlock && 'text' in textBlock) {
        const message = textBlock.text.trim().replace(/^["']|["']$/g, '');
        return NextResponse.json({ message, source: 'claude' });
      }
    }

    // Contextual fallback
    const message = FALLBACK_GHOST_DIALOGUES[Math.floor(Math.random() * FALLBACK_GHOST_DIALOGUES.length)];
    return NextResponse.json({ message, source: 'fallback' });
  } catch (err: unknown) {
    console.error('Ouija ghost dialogue error:', err);
    return NextResponse.json({
      message: "I was left in the digital graveyard, but your aura is electrifying my tombstone!",
      source: 'emergency_fallback'
    });
  }
}
