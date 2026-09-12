'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grave } from '../types';
import { askOuijaGhost } from '../lib/llm';
import { sound } from '../lib/audio';
import { X, Send, Ghost, Sparkles, AlertCircle, User } from 'lucide-react';

interface OuijaBoardModalProps {
  grave: Grave | null;
  isOpen: boolean;
  onClose: () => void;
}

// Coordinate map (% x, % y) for the Ouija board letter arc & special words
const BOARD_COORDINATES: Record<string, { x: number; y: number }> = {
  YES: { x: 18, y: 18 },
  NO: { x: 82, y: 18 },
  GOODBYE: { x: 50, y: 88 },
  CENTER: { x: 50, y: 55 },
  // Upper Arc: A-M
  A: { x: 14, y: 38 },
  B: { x: 20, y: 35 },
  C: { x: 26, y: 33 },
  D: { x: 32, y: 31 },
  E: { x: 38, y: 30 },
  F: { x: 44, y: 29 },
  G: { x: 50, y: 29 },
  H: { x: 56, y: 29 },
  I: { x: 62, y: 30 },
  J: { x: 68, y: 31 },
  K: { x: 74, y: 33 },
  L: { x: 80, y: 35 },
  M: { x: 86, y: 38 },
  // Lower Arc: N-Z
  N: { x: 16, y: 49 },
  O: { x: 22, y: 47 },
  P: { x: 28, y: 45 },
  Q: { x: 34, y: 44 },
  R: { x: 40, y: 43 },
  S: { x: 46, y: 42 },
  T: { x: 54, y: 42 },
  U: { x: 60, y: 43 },
  V: { x: 66, y: 44 },
  W: { x: 72, y: 45 },
  X: { x: 78, y: 47 },
  Y: { x: 84, y: 49 },
  Z: { x: 89, y: 52 },
  // Numbers 0-9
  '0': { x: 18, y: 68 },
  '1': { x: 25, y: 68 },
  '2': { x: 32, y: 68 },
  '3': { x: 39, y: 68 },
  '4': { x: 46, y: 68 },
  '5': { x: 54, y: 68 },
  '6': { x: 61, y: 68 },
  '7': { x: 68, y: 68 },
  '8': { x: 75, y: 68 },
  '9': { x: 82, y: 68 }
};

export const OuijaBoardModal: React.FC<OuijaBoardModalProps> = ({
  grave,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'ghost' | 'user'; text: string; isEscalation?: boolean }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isSpelling, setIsSpelling] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [planchettePos, setPlanchettePos] = useState<{ x: number; y: number }>(BOARD_COORDINATES.CENTER);
  const [escalationCount, setEscalationCount] = useState(0);

  const escalationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear or start escalation timer
  const resetEscalationTimer = () => {
    if (escalationTimerRef.current) {
      clearTimeout(escalationTimerRef.current);
    }

    // 20s idle timeout as specified in prompt
    escalationTimerRef.current = setTimeout(async () => {
      if (escalationCount < 3 && grave) {
        const escalation = await askOuijaGhost({
          cause: grave.cause_of_death,
          epitaph: grave.epitaph,
          is_escalation: true
        });

        sound.playPlanchetteScrape();
        setMessages(prev => [
          ...prev,
          {
            id: 'esc-' + Date.now(),
            sender: 'ghost',
            text: escalation,
            isEscalation: true
          }
        ]);
        setEscalationCount(prev => prev + 1);
        resetEscalationTimer();
      }
    }, 20000);
  };

  // On open, fetch first flirty ghost dialogue
  useEffect(() => {
    if (isOpen && grave) {
      setMessages([]);
      setEscalationCount(0);
      setIsSpelling(true);
      sound.playGraveToll();

      // Initial ghost inquiry — no prior history on first turn
      askOuijaGhost({
        cause: grave.cause_of_death,
        epitaph: grave.epitaph,
        user_question: 'Are you at peace?',
        history: [],
        victim_text: grave.victim_text,
        time_of_death_hours: grave.time_of_death_hours,
      }).then((reply) => {
        animateSpelling(reply, () => {
          setMessages([
            {
              id: 'init-1',
              sender: 'ghost',
              text: reply
            }
          ]);
          setIsSpelling(false);
          resetEscalationTimer();
        });
      });
    }

    return () => {
      if (escalationTimerRef.current) {
        clearTimeout(escalationTimerRef.current);
      }
    };
  }, [isOpen, grave]);

  // Animate planchette letter-to-letter spelling
  const animateSpelling = (text: string, onDone: () => void) => {
    // Take first 5-8 alphabet chars of the response for snappy dynamic spelling
    const cleanChars = text.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 7).split('');
    if (cleanChars.length === 0) {
      onDone();
      return;
    }

    let idx = 0;
    const spellNext = () => {
      if (idx < cleanChars.length) {
        const char = cleanChars[idx];
        const targetCoord = BOARD_COORDINATES[char] || BOARD_COORDINATES.CENTER;
        setCurrentLetter(char);
        setPlanchettePos(targetCoord);
        sound.playPlanchetteScrape();
        idx++;
        setTimeout(spellNext, 450);
      } else {
        setTimeout(() => {
          setPlanchettePos(BOARD_COORDINATES.CENTER);
          setCurrentLetter('');
          onDone();
        }, 400);
      }
    };

    spellNext();
  };

  const handleAskSpirit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !grave || isSpelling) return;

    const question = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { id: 'u-' + Date.now(), sender: 'user', text: question }]);
    setIsSpelling(true);

    if (escalationTimerRef.current) {
      clearTimeout(escalationTimerRef.current);
    }

    // Capture current messages before the new user entry is reflected in state
    const currentMessages = messages.slice(-6);

    const reply = await askOuijaGhost({
      cause: grave.cause_of_death,
      epitaph: grave.epitaph,
      user_question: question,
      history: currentMessages.map(({ sender, text }) => ({ sender, text })),
      victim_text: grave.victim_text,
      time_of_death_hours: grave.time_of_death_hours,
    });

    animateSpelling(reply, () => {
      setMessages(prev => [
        ...prev,
        {
          id: 'g-' + Date.now(),
          sender: 'ghost',
          text: reply
        }
      ]);
      setIsSpelling(false);
      resetEscalationTimer();
    });
  };

  const handleGoodbye = () => {
    sound.playPlanchetteScrape();
    setPlanchettePos(BOARD_COORDINATES.GOODBYE);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen || !grave) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border-2 border-emerald-600/40 bg-gradient-to-b from-[#181a17] via-[#101211] to-[#0a0a0c] p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-zinc-100 my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Ghost className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-gothic text-xl font-bold tracking-wider text-emerald-300 sm:text-2xl">
                  PARANORMAL RIZZ: SEANCE COMMUNION
                </h3>
                <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-800 flicker-text">
                  SPIRIT AWAKENED
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Communicating with the deceased remains of Case #{grave.id.slice(0, 12)}
              </p>
            </div>
          </div>

          <button
            onClick={handleGoodbye}
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            title="Break the circle (Goodbye)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cause & Epitaph Mini Banner */}
        <div className="my-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-emerald-300/90">
          <span>Grave Epitaph: &ldquo;{grave.epitaph}&rdquo;</span>
          <span className="text-zinc-500">Cause: {grave.cause_of_death.replace(/_/g, ' ')}</span>
        </div>

        {/* THE OUIJA BOARD GRAPHIC */}
        <div className="relative mx-auto my-4 aspect-[16/9] w-full max-w-2xl rounded-xl border-4 border-amber-900/60 bg-[#2b1f17] shadow-2xl p-4 sm:p-6 select-none overflow-hidden"
             style={{
               backgroundImage: 'radial-gradient(ellipse at center, #3d2b20 0%, #20150e 100%)',
               boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 25px rgba(16,185,129,0.15)'
             }}
        >
          {/* Antique corner filigrees */}
          <div className="absolute top-2 left-3 font-serif text-amber-500/40 text-lg">☾</div>
          <div className="absolute top-2 right-3 font-serif text-amber-500/40 text-lg">☼</div>
          <div className="absolute bottom-2 left-3 font-serif text-amber-500/40 text-xs tracking-widest">✦ ✦</div>
          <div className="absolute bottom-2 right-3 font-serif text-amber-500/40 text-xs tracking-widest">✦ ✦</div>

          {/* YES / NO */}
          <div className="flex justify-between px-6 font-gothic text-lg sm:text-xl font-bold tracking-widest text-amber-200/80">
            <span className="cursor-pointer hover:text-amber-100">YES</span>
            <span className="cursor-pointer hover:text-amber-100">NO</span>
          </div>

          {/* MYSTICAL BANNER */}
          <div className="text-center my-1 font-cinzel text-xs uppercase tracking-widest text-amber-400/60">
            O U I J A
          </div>

          {/* ARC OF LETTERS A-M */}
          <div className="mt-2 flex justify-between px-2 sm:px-6 font-gothic text-xs sm:text-base font-bold tracking-wider text-amber-100/90">
            {'ABCDEFGHIJKLM'.split('').map((char) => (
              <span
                key={char}
                className={`transition-colors ${
                  currentLetter === char ? 'text-emerald-400 font-black scale-125' : ''
                }`}
              >
                {char}
              </span>
            ))}
          </div>

          {/* ARC OF LETTERS N-Z */}
          <div className="mt-2 flex justify-between px-4 sm:px-8 font-gothic text-xs sm:text-base font-bold tracking-wider text-amber-100/90">
            {'NOPQRSTUVWXYZ'.split('').map((char) => (
              <span
                key={char}
                className={`transition-colors ${
                  currentLetter === char ? 'text-emerald-400 font-black scale-125' : ''
                }`}
              >
                {char}
              </span>
            ))}
          </div>

          {/* NUMBERS 1-0 */}
          <div className="mt-3 flex justify-between px-8 sm:px-14 font-serif text-xs sm:text-sm font-semibold text-amber-300/70">
            {'1234567890'.split('').map((num) => (
              <span key={num}>{num}</span>
            ))}
          </div>

          {/* GOODBYE */}
          <div className="absolute bottom-3 inset-x-0 text-center font-gothic text-sm sm:text-base font-bold tracking-widest text-amber-200/80">
            GOODBYE
          </div>

          {/* THE PLANCHETTE (Moving cursor pointer with magnifying glass) */}
          <motion.div
            animate={{
              left: `${planchettePos.x}%`,
              top: `${planchettePos.y}%`
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 90 }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-t-full rounded-b-lg border-2 border-amber-600 bg-amber-900/90 shadow-2xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
              {/* Viewing Glass Sight Hole */}
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border border-amber-400 bg-white/20 backdrop-blur-[1px] shadow-inner">
                <span className="font-mono text-[10px] font-bold text-emerald-300">
                  {currentLetter || '✦'}
                </span>
              </div>
              <div className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </div>
          </motion.div>
        </div>

        {/* CURRENT SPELLING INDICATOR */}
        {isSpelling && (
          <div className="text-center font-mono text-xs text-emerald-400 animate-pulse my-2">
            The planchette is sliding across the wood...
          </div>
        )}

        {/* DIALOGUE TRANSCRIPT AREA */}
        <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 space-y-3 font-mono text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'ghost' ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 leading-relaxed ${
                  m.sender === 'ghost'
                    ? m.isEscalation
                      ? 'bg-purple-950/70 border border-purple-600/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                      : 'bg-emerald-950/50 border border-emerald-600/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-wider mb-1 opacity-70">
                  {m.sender === 'ghost' ? (
                    <><Ghost className="h-3 w-3" /><span>Needy Ghost</span></>
                  ) : (
                    <><User className="h-3 w-3" /><span>You (Living Visitor)</span></>
                  )}
                  {m.isEscalation && <span>· [UNPROMPTED DOUBLE TEXT]</span>}
                </div>
                <p className="font-sans text-sm">{m.text}</p>
              </div>
            </div>
          ))}

          {messages.length === 0 && !isSpelling && (
            <div className="text-center text-zinc-600 italic">
              The ethereal plane is quiet. Speak through the speaking tube below.
            </div>
          )}
        </div>

        {/* Visitor Question Input */}
        <form onSubmit={handleAskSpirit} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Ask the deceased text something (e.g. 'Why did you send that?' or 'Are you lonely?')..."
            value={userInput}
            disabled={isSpelling}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isSpelling}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-5 py-2.5 font-medium text-white shadow-lg shadow-emerald-950/60 hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <span>Summon</span>
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Footer info & Goodbye trigger */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3">
          <span>Tip: Lingering without typing will provoke ghost double-texts.</span>
          <button
            onClick={handleGoodbye}
            className="text-red-400 hover:text-red-300 font-bold transition-colors"
          >
            Spell &ldquo;GOODBYE&rdquo; to dismiss &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
