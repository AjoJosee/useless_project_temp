'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grave } from '../types';
import { askOuijaGhost } from '../lib/llm';
import { sound } from '../lib/audio';
import { X, Send, Ghost, Key, Zap, Flame, User, Check, Trash2, Eye, EyeOff } from 'lucide-react';

interface OuijaBoardModalProps {
  grave: Grave | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fallback baseline coordinates (% x, % y)
const FALLBACK_COORDINATES: Record<string, { x: number; y: number }> = {
  YES: { x: 18, y: 16 },
  NO: { x: 82, y: 16 },
  GOODBYE: { x: 50, y: 88 },
  CENTER: { x: 50, y: 56 },
  A: { x: 14, y: 36 }, B: { x: 20, y: 33 }, C: { x: 26, y: 31 }, D: { x: 32, y: 29 },
  E: { x: 38, y: 28 }, F: { x: 44, y: 27 }, G: { x: 50, y: 27 }, H: { x: 56, y: 27 },
  I: { x: 62, y: 28 }, J: { x: 68, y: 29 }, K: { x: 74, y: 31 }, L: { x: 80, y: 33 },
  M: { x: 86, y: 36 }, N: { x: 16, y: 48 }, O: { x: 22, y: 46 }, P: { x: 28, y: 44 },
  Q: { x: 34, y: 43 }, R: { x: 40, y: 42 }, S: { x: 46, y: 41 }, T: { x: 54, y: 41 },
  U: { x: 60, y: 42 }, V: { x: 66, y: 43 }, W: { x: 72, y: 44 }, X: { x: 78, y: 46 },
  Y: { x: 84, y: 48 }, Z: { x: 89, y: 51 },
  '0': { x: 18, y: 68 }, '1': { x: 25, y: 68 }, '2': { x: 32, y: 68 }, '3': { x: 39, y: 68 },
  '4': { x: 46, y: 68 }, '5': { x: 54, y: 68 }, '6': { x: 61, y: 68 }, '7': { x: 68, y: 68 },
  '8': { x: 75, y: 68 }, '9': { x: 82, y: 68 }
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
  const [planchettePos, setPlanchettePos] = useState<{ x: number; y: number }>(FALLBACK_COORDINATES.CENTER);
  const [planchetteAngle, setPlanchetteAngle] = useState(0);
  const [escalationCount, setEscalationCount] = useState(0);

  // API Key state
  const [apiKey, setApiKey] = useState('');
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);

  // Effects & Jumpscares state
  const [isQuaking, setIsQuaking] = useState(false);
  const [isJumpscare, setIsJumpscare] = useState(false);
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const escalationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load API key from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rest_in_read_anthropic_key');
      if (stored) setApiKey(stored);
    }
  }, []);

  // AUTO-SCROLL: Keep conversation scrolled to bottom smoothly
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSpelling, scrollToBottom]);

  // Accurate Coordinate Calculator based on actual DOM elements
  const getAccurateCharCoord = useCallback((char: string): { x: number; y: number } => {
    if (!boardRef.current) return FALLBACK_COORDINATES[char] || FALLBACK_COORDINATES.CENTER;
    const targetEl = boardRef.current.querySelector(`[data-char="${char.toUpperCase()}"]`);
    if (!targetEl) return FALLBACK_COORDINATES[char] || FALLBACK_COORDINATES.CENTER;

    const boardRect = boardRef.current.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Center of target element relative to board
    const x = ((targetRect.left + targetRect.width / 2 - boardRect.left) / boardRect.width) * 100;
    const y = ((targetRect.top + targetRect.height / 2 - boardRect.top) / boardRect.height) * 100;

    return { x, y };
  }, []);

  // Jumpscare trigger
  const triggerJumpscare = useCallback(() => {
    sound.playJumpscareSting();
    sound.playEerieGlitch();
    setIsQuaking(true);
    setIsJumpscare(true);
    setCandlesBlownOut(true);

    setTimeout(() => {
      setIsJumpscare(false);
      setIsQuaking(false);
    }, 450);

    setTimeout(() => {
      setCandlesBlownOut(false);
    }, 1200);
  }, []);

  // Reset escalation timer (20s unprompted double text)
  const resetEscalationTimer = useCallback(() => {
    if (escalationTimerRef.current) {
      clearTimeout(escalationTimerRef.current);
    }

    escalationTimerRef.current = setTimeout(async () => {
      if (escalationCount < 3 && grave) {
        // Sudden spontaneous jumpscare on double text!
        triggerJumpscare();

        const escalation = await askOuijaGhost({
          cause: grave.cause_of_death,
          epitaph: grave.epitaph,
          is_escalation: true,
          api_key: apiKey || undefined
        });

        sound.playPlanchetteScrape();
        setMessages((prev) => [
          ...prev,
          {
            id: 'esc-' + Date.now(),
            sender: 'ghost',
            text: escalation,
            isEscalation: true
          }
        ]);
        setEscalationCount((prev) => prev + 1);
        resetEscalationTimer();
      }
    }, 20000);
  }, [escalationCount, grave, apiKey, triggerJumpscare]);

  // Spelling animation that lands dead-center on letters and handles YES/NO
  const animateSpelling = useCallback((text: string, onDone: () => void) => {
    const lower = text.toLowerCase().trim();

    // Check if reply directly starts with yes or no
    if (lower.startsWith('yes') || lower.startsWith('yeah') || lower.startsWith('yep')) {
      const coord = getAccurateCharCoord('YES');
      sound.playPlanchetteScrape();
      setCurrentLetter('YES');
      setPlanchettePos(coord);
      setPlanchetteAngle(-6);
      setTimeout(() => {
        setPlanchettePos(FALLBACK_COORDINATES.CENTER);
        setPlanchetteAngle(0);
        setCurrentLetter('');
        onDone();
      }, 900);
      return;
    }

    if (lower.startsWith('no') || lower.startsWith('nah') || lower.startsWith('nope')) {
      const coord = getAccurateCharCoord('NO');
      sound.playPlanchetteScrape();
      setCurrentLetter('NO');
      setPlanchettePos(coord);
      setPlanchetteAngle(6);
      setTimeout(() => {
        setPlanchettePos(FALLBACK_COORDINATES.CENTER);
        setPlanchetteAngle(0);
        setCurrentLetter('');
        onDone();
      }, 900);
      return;
    }

    // Pick 1-2 key words to physically spell (e.g. "LMAO", "DEAD", "WAIT", "BESTIE", "BOO")
    const words = text.toUpperCase().replace(/[^A-Z\s]/g, '').split(/\s+/).filter(w => w.length >= 2);
    const chosenWord = words[0] || 'GHOST';
    const lettersToSpell = chosenWord.slice(0, 6).split('');

    let idx = 0;
    const spellNext = () => {
      if (idx < lettersToSpell.length) {
        const char = lettersToSpell[idx];
        const coord = getAccurateCharCoord(char);
        setCurrentLetter(char);
        setPlanchettePos(coord);
        // Tilt slightly towards the letter for natural physical motion
        const angle = (coord.x - 50) * 0.2;
        setPlanchetteAngle(angle);
        sound.playPlanchetteScrape();
        idx++;
        setTimeout(spellNext, 380);
      } else {
        setTimeout(() => {
          setPlanchettePos(FALLBACK_COORDINATES.CENTER);
          setPlanchetteAngle(0);
          setCurrentLetter('');
          onDone();
        }, 350);
      }
    };

    spellNext();
  }, [getAccurateCharCoord]);

  // Initial ghost conversation on open
  useEffect(() => {
    if (isOpen && grave) {
      setMessages([]);
      setEscalationCount(0);
      setIsSpelling(true);
      sound.playGraveToll();

      askOuijaGhost({
        cause: grave.cause_of_death,
        epitaph: grave.epitaph,
        user_question: 'Are you at peace?',
        history: [],
        victim_text: grave.victim_text,
        time_of_death_hours: grave.time_of_death_hours,
        api_key: apiKey || undefined
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
  }, [isOpen, grave, apiKey, animateSpelling, resetEscalationTimer]);

  const handleAskSpirit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !grave || isSpelling) return;

    const question = userInput.trim();
    setUserInput('');
    setMessages((prev) => [...prev, { id: 'u-' + Date.now(), sender: 'user', text: question }]);
    setIsSpelling(true);

    if (escalationTimerRef.current) {
      clearTimeout(escalationTimerRef.current);
    }

    // Taboo questions trigger small creepy board quakes
    if (/die|dead|kill|ghost|who|ex|hate/i.test(question) && Math.random() < 0.4) {
      setTimeout(() => {
        sound.playHeartbeat();
        setIsQuaking(true);
        setTimeout(() => setIsQuaking(false), 300);
      }, 600);
    }

    const currentMessages = messages.slice(-6);

    const reply = await askOuijaGhost({
      cause: grave.cause_of_death,
      epitaph: grave.epitaph,
      user_question: question,
      history: currentMessages.map(({ sender, text }) => ({ sender, text })),
      victim_text: grave.victim_text,
      time_of_death_hours: grave.time_of_death_hours,
      api_key: apiKey || undefined
    });

    animateSpelling(reply, () => {
      setMessages((prev) => [
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

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rest_in_read_anthropic_key', apiKey.trim());
      setKeySavedToast(true);
      setTimeout(() => setKeySavedToast(false), 2000);
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rest_in_read_anthropic_key');
    }
  };

  const handleGoodbye = () => {
    sound.playPlanchetteScrape();
    const goodbyeCoord = getAccurateCharCoord('GOODBYE');
    setPlanchettePos(goodbyeCoord);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen || !grave) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      {/* Jumpscare Spectral Overlay */}
      {isJumpscare && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-red-950/80 animate-jumpscare-flash backdrop-blur-sm">
          <div className="relative text-center">
            <span className="text-9xl filter drop-shadow-[0_0_40px_#ef4444] animate-ping">
              👻
            </span>
            <div className="mt-4 font-gothic text-4xl font-black text-red-100 tracking-widest uppercase animate-pulse">
              DID U MISS ME?!
            </div>
          </div>
        </div>
      )}

      {/* Main Modal Container */}
      <div
        className={`relative w-full max-w-4xl rounded-2xl border-2 border-emerald-600/50 bg-gradient-to-b from-[#181a17] via-[#101211] to-[#0a0a0c] p-4 sm:p-7 shadow-[0_0_60px_rgba(16,185,129,0.3)] text-zinc-100 my-auto transition-transform ${
          isQuaking ? 'animate-violent-quake' : ''
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950/90 border border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <Ghost className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-gothic text-lg font-bold tracking-wider text-emerald-300 sm:text-2xl">
                  PARANORMAL RIZZ: OUIJA COMMUNION
                </h3>
                <span className="hidden sm:inline-flex rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-800 flicker-text">
                  GHOST CONNECTED
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-mono">
                Deceased text: &ldquo;{grave.victim_text.slice(0, 35)}...&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* API Key Toggle Button */}
            <button
              onClick={() => setShowKeyDrawer(!showKeyDrawer)}
              className={`flex items-center space-x-1 rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-all ${
                apiKey.trim()
                  ? 'border-emerald-600/70 bg-emerald-950/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Configure Anthropic Claude API Key for real-time AI conversations"
            >
              <Key className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {apiKey.trim() ? 'Claude AI (Live)' : 'Set API Key'}
              </span>
            </button>

            {/* Provoke Spirit Jumpscare Button */}
            <button
              onClick={triggerJumpscare}
              className="flex items-center space-x-1 rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1.5 text-xs font-mono text-red-300 hover:bg-red-900/60 hover:text-white transition-all active:scale-95"
              title="Rattle the casket (Triggers jumpscare & shaking!)"
            >
              <Zap className="h-3.5 w-3.5 text-red-400" />
              <span className="hidden sm:inline">Provoke Spirit</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleGoodbye}
              className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
              title="Break the circle (Goodbye)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* API Key Drawer (if expanded) */}
        {showKeyDrawer && (
          <div className="my-3 rounded-xl border border-emerald-800/60 bg-zinc-950 p-3.5 text-xs font-mono shadow-inner animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <Key className="h-3.5 w-3.5" />
                <span>Anthropic Claude API Key (Channeling Real AI Ghost)</span>
              </span>
              <span className="text-zinc-500 text-[10px]">Stored in browser localStorage</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKeyPassword ? 'text' : 'password'}
                  placeholder="Paste sk-ant-... key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyPassword(!showKeyPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showKeyPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <button
                onClick={handleSaveApiKey}
                className="flex items-center space-x-1 rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white hover:bg-emerald-600 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>

              {apiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="rounded-lg border border-red-900/60 bg-red-950/40 p-1.5 text-red-300 hover:bg-red-900 transition-colors"
                  title="Remove saved key"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {keySavedToast && (
              <p className="mt-1 text-[11px] text-emerald-400 font-bold animate-pulse">
                ✓ Claude API Key saved! Ghost will now hold real conversational AI dialogue.
              </p>
            )}
          </div>
        )}

        {/* THE OUIJA BOARD GRAPHIC CONTAINER */}
        <div className="relative mx-auto my-3 sm:my-4 aspect-[16/9] w-full max-w-2xl select-none">
          {/* Candle Left */}
          <div className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className={`h-4 w-2 sm:h-6 sm:w-2.5 rounded-full bg-gradient-to-t from-amber-600 via-yellow-400 to-white ${candlesBlownOut ? 'opacity-0' : 'animate-candle-flame'}`} />
            <div className="h-10 sm:h-16 w-2 sm:w-3 rounded-b-sm bg-zinc-300 shadow-md" />
          </div>

          {/* Candle Right */}
          <div className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className={`h-4 w-2 sm:h-6 sm:w-2.5 rounded-full bg-gradient-to-t from-amber-600 via-yellow-400 to-white ${candlesBlownOut ? 'opacity-0' : 'animate-candle-flame'}`} />
            <div className="h-10 sm:h-16 w-2 sm:w-3 rounded-b-sm bg-zinc-300 shadow-md" />
          </div>

          {/* The Physical Board Surface */}
          <div
            ref={boardRef}
            className="relative h-full w-full rounded-xl border-4 border-amber-950/80 bg-[#271b12] shadow-2xl p-3 sm:p-6 overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(ellipse at center, #3c291d 0%, #1a100a 100%)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9), 0 0 35px rgba(16,185,129,0.2)'
            }}
          >
            {/* Antique corner filigrees */}
            <div data-char="MOON" className="absolute top-2 left-3 font-serif text-amber-500/50 text-base sm:text-xl">☾</div>
            <div data-char="SUN" className="absolute top-2 right-3 font-serif text-amber-500/50 text-base sm:text-xl">☼</div>
            <div className="absolute bottom-2 left-3 font-serif text-amber-500/30 text-[10px] sm:text-xs tracking-widest">✦ ✦</div>
            <div className="absolute bottom-2 right-3 font-serif text-amber-500/30 text-[10px] sm:text-xs tracking-widest">✦ ✦</div>

            {/* YES / NO Targets with explicit data-char */}
            <div className="flex justify-between px-6 sm:px-12 font-gothic text-base sm:text-xl font-bold tracking-widest text-amber-200/90">
              <span
                data-char="YES"
                className={`transition-all duration-200 ${currentLetter === 'YES' ? 'text-emerald-400 scale-125 drop-shadow-[0_0_12px_#34d399]' : ''}`}
              >
                YES
              </span>
              <span
                data-char="NO"
                className={`transition-all duration-200 ${currentLetter === 'NO' ? 'text-emerald-400 scale-125 drop-shadow-[0_0_12px_#34d399]' : ''}`}
              >
                NO
              </span>
            </div>

            {/* Mystic Center Banner */}
            <div className="text-center my-0.5 sm:my-1 font-cinzel text-[10px] sm:text-xs uppercase tracking-widest text-amber-400/70">
              O U I J A
            </div>

            {/* ARC OF LETTERS A-M */}
            <div className="mt-1 sm:mt-2 flex justify-between px-2 sm:px-6 font-gothic text-xs sm:text-lg font-bold tracking-wider text-amber-100/90">
              {'ABCDEFGHIJKLM'.split('').map((char) => (
                <span
                  key={char}
                  data-char={char}
                  className={`transition-all duration-150 inline-block text-center ${
                    currentLetter === char ? 'text-emerald-400 font-black scale-150 drop-shadow-[0_0_10px_#10b981]' : ''
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* ARC OF LETTERS N-Z */}
            <div className="mt-1.5 sm:mt-2.5 flex justify-between px-3 sm:px-8 font-gothic text-xs sm:text-lg font-bold tracking-wider text-amber-100/90">
              {'NOPQRSTUVWXYZ'.split('').map((char) => (
                <span
                  key={char}
                  data-char={char}
                  className={`transition-all duration-150 inline-block text-center ${
                    currentLetter === char ? 'text-emerald-400 font-black scale-150 drop-shadow-[0_0_10px_#10b981]' : ''
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* NUMBERS 0-9 */}
            <div className="mt-2 sm:mt-4 flex justify-between px-8 sm:px-14 font-serif text-[11px] sm:text-sm font-semibold text-amber-300/80">
              {'1234567890'.split('').map((num) => (
                <span
                  key={num}
                  data-char={num}
                  className={`transition-all duration-150 ${
                    currentLetter === num ? 'text-emerald-400 font-black scale-125' : ''
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>

            {/* GOODBYE TARGET */}
            <div className="absolute bottom-2.5 sm:bottom-3 inset-x-0 text-center font-gothic text-xs sm:text-base font-bold tracking-widest text-amber-200/90">
              <span
                data-char="GOODBYE"
                className={`transition-all duration-200 ${currentLetter === 'GOODBYE' ? 'text-red-400 scale-125 drop-shadow-[0_0_15px_#ef4444]' : ''}`}
              >
                GOODBYE
              </span>
            </div>

            {/* THE WOODEN PLANCHETTE (Physically accurate centering) */}
            <motion.div
              animate={{
                left: `${planchettePos.x}%`,
                top: `${planchettePos.y}%`,
                rotate: planchetteAngle
              }}
              transition={{
                type: 'spring',
                damping: 22,
                stiffness: 110,
                mass: 0.8
              }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="relative flex h-14 w-12 sm:h-18 sm:w-16 items-center justify-center rounded-t-full rounded-b-lg border-2 border-amber-500 bg-gradient-to-b from-amber-800 to-amber-950 shadow-2xl drop-shadow-[0_12px_14px_rgba(0,0,0,0.9)]">
                {/* Viewing Glass Sight Hole: Centers EXACTLY on the targeted letter */}
                <div className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-amber-300 bg-white/15 backdrop-blur-[1px] shadow-inner">
                  <span className="font-mono text-[11px] sm:text-xs font-black text-emerald-300 drop-shadow-[0_0_5px_#34d399]">
                    {currentLetter || '✦'}
                  </span>
                </div>
                <div className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_#fbbf24]" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Planchette dragging indicator */}
        {isSpelling && (
          <div className="text-center font-mono text-xs text-emerald-400 animate-pulse mb-2">
            The planchette is sliding across the wood...
          </div>
        )}

        {/* DIALOGUE TRANSCRIPT AREA WITH AUTO-SCROLL */}
        <div
          ref={messagesContainerRef}
          className="mt-3 max-h-52 sm:max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/90 p-3 sm:p-4 space-y-3 font-mono text-xs scroll-smooth"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'ghost' ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 leading-relaxed transition-all ${
                  m.sender === 'ghost'
                    ? m.isEscalation
                      ? 'bg-purple-950/80 border border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-bounce'
                      : 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-wider mb-1 opacity-75">
                  {m.sender === 'ghost' ? (
                    <>
                      <Ghost className="h-3 w-3 text-emerald-400" />
                      <span className="font-bold text-emerald-300">Needy Ghost</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 text-zinc-400" />
                      <span className="font-bold">You</span>
                    </>
                  )}
                  {m.isEscalation && <span className="text-purple-300 font-bold">· [DOUBLE TEXT]</span>}
                </div>
                <p className="font-sans text-sm font-medium">{m.text}</p>
              </div>
            </div>
          ))}

          {messages.length === 0 && !isSpelling && (
            <div className="text-center text-zinc-500 italic py-4">
              The ghost is waiting in the wood. Send a message below.
            </div>
          )}

          {/* Anchor element for reliable auto-scroll */}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Visitor Question Input */}
        <form onSubmit={handleAskSpirit} className="mt-3 sm:mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Text the deceased message back (e.g. 'why did you send that?' or 'are u seeing someone else?')..."
            value={userInput}
            disabled={isSpelling}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 sm:px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isSpelling}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-4 sm:px-5 py-2.5 font-medium text-white shadow-lg shadow-emerald-950/60 hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-2.5">
          <span>Tip: Idle for 20s = ghost double texts + jumpscare.</span>
          <button
            onClick={handleGoodbye}
            className="text-red-400 hover:text-red-300 font-bold transition-colors"
          >
            Spell &ldquo;GOODBYE&rdquo; to leave &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
