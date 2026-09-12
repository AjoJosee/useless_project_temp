'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grave } from './../types';
import { fetchAllGraves } from './../lib/storage';
import { Header } from './../components/Header';
import { MorgueIntake } from './../components/MorgueIntake';
import { GraveyardFeed } from './../components/GraveyardFeed';
import { OuijaBoardModal } from './../components/OuijaBoardModal';
import { ExhumationDrawer } from './../components/ExhumationDrawer';
import { GraveyardStatsModal } from './../components/GraveyardStatsModal';
import { Footer } from './../components/Footer';
import { JumpscareOverlay } from './../components/JumpscareOverlay';

import { motion } from 'framer-motion';
import { Ghost } from 'lucide-react';
import { sound } from './../lib/audio';

const TRANSITION_GHOSTS = [
  { id: 1, left: 12, driftX: 45, duration: 4.2, delay: 0.1, size: 36 },
  { id: 2, left: 28, driftX: -30, duration: 5.0, delay: 0.4, size: 48 },
  { id: 3, left: 42, driftX: 60, duration: 4.6, delay: 0.2, size: 40 },
  { id: 4, left: 58, driftX: -40, duration: 4.8, delay: 0.5, size: 52 },
  { id: 5, left: 72, driftX: 35, duration: 5.2, delay: 0.3, size: 38 },
  { id: 6, left: 85, driftX: -50, duration: 4.4, delay: 0.6, size: 44 },
  { id: 7, left: 93, driftX: 20, duration: 5.5, delay: 0.7, size: 32 },
];

function MainGraveyardApp() {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [activeSection, setActiveSection] = useState<'morgue' | 'graveyard'>('morgue');
  const [activeOuijaGrave, setActiveOuijaGrave] = useState<Grave | null>(null);
  const [activeCommentsGrave, setActiveCommentsGrave] = useState<Grave | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Scroll Atmosphere Transition ---
  const [isScreenFlickering, setIsScreenFlickering] = useState(false);
  const [showTransitionGhosts, setShowTransitionGhosts] = useState(false);
  const hasTransitionTriggeredRef = useRef(false);

  // --- Jumpscare state ---
  const [jumpscareActive, setJumpscareActive] = useState(false);
  // Tracks whether we've fired the guaranteed first-Ouija scare this session
  const hasFirstOuijaFiredRef = useRef(false);
  // If a Ouija open is queued behind an active scare, store the grave here
  const pendingOuijaGraveRef = useRef<Grave | null>(null);
  // Graveyard idle timer ref
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether the user is currently in the graveyard section
  const isInGraveyardRef = useRef(false);

  const morgueRef = useRef<HTMLDivElement | null>(null);
  const graveyardRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  // Scroll-triggered atmosphere transition when moving into graveyard
  useEffect(() => {
    const target = graveyardRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasTransitionTriggeredRef.current) {
          hasTransitionTriggeredRef.current = true;
          // Trigger screen flicker
          setIsScreenFlickering(true);
          setTimeout(() => setIsScreenFlickering(false), 500);

          // Start eerie ambient wind loop
          sound.startAmbientWind();

          // Spawn drifting ghost shapes
          setShowTransitionGhosts(true);
          setTimeout(() => setShowTransitionGhosts(false), 6500);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Load graves
  const reloadGraves = async () => {
    const list = await fetchAllGraves();
    setGraves(list);
  };

  useEffect(() => {
    reloadGraves().then(() => setIsLoading(false));
  }, []);

  // Handle URL query parameter `?grave=<id>`
  useEffect(() => {
    const graveId = searchParams.get('grave');
    if (graveId && graves.length > 0) {
      const match = graves.find((g) => g.id === graveId);
      if (match) {
        if (match.is_haunted) {
          setActiveOuijaGrave(match);
        } else {
          setActiveCommentsGrave(match);
        }
        setActiveSection('graveyard');
      }
    }
  }, [searchParams, graves]);

  // ---------------------------------------------------------------------------
  // Idle graveyard jumpscare (1-in-8 chance after 25 s of no interaction)
  // ---------------------------------------------------------------------------
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isInGraveyardRef.current) return;

    idleTimerRef.current = setTimeout(() => {
      // Don't interrupt an open modal or an already-active scare
      if (jumpscareActive || activeOuijaGrave) return;
      if (Math.random() < 1 / 8) {
        setJumpscareActive(true);
      }
    }, 25000);
  }, [jumpscareActive, activeOuijaGrave]);

  // Attach interaction listeners that reset the idle timer while in graveyard
  useEffect(() => {
    const events = ['scroll', 'mousemove', 'touchstart', 'keydown'] as const;
    const handler = () => resetIdleTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const handleNavigate = (section: 'morgue' | 'graveyard') => {
    setActiveSection(section);
    isInGraveyardRef.current = section === 'graveyard';

    if (section === 'morgue') {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      morgueRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      graveyardRef.current?.scrollIntoView({ behavior: 'smooth' });
      resetIdleTimer();
    }
  };

  const handleBuryComplete = (newGrave: Grave) => {
    setGraves((prev) => [newGrave, ...prev.filter((g) => g.id !== newGrave.id)]);
  };

  // ---------------------------------------------------------------------------
  // Ouija open — guaranteed first-open scare, then normal opens thereafter
  // ---------------------------------------------------------------------------
  const handleOpenOuija = (grave: Grave) => {
    if (!hasFirstOuijaFiredRef.current) {
      // First time: queue the grave, fire the scare, open modal in onDone()
      hasFirstOuijaFiredRef.current = true;
      pendingOuijaGraveRef.current = grave;
      setJumpscareActive(true);
    } else {
      setActiveOuijaGrave(grave);
    }
  };

  // Called when the jumpscare overlay finishes its fade-out
  const handleJumpscareDone = () => {
    setJumpscareActive(false);
    // If a Ouija open was queued, open it now
    if (pendingOuijaGraveRef.current) {
      setActiveOuijaGrave(pendingOuijaGraveRef.current);
      pendingOuijaGraveRef.current = null;
    }
  };

  const hauntedCount = graves.filter((g) => g.is_haunted).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 selection:bg-red-800 selection:text-white">
      {/* Fake jumpscare overlay — z-9999, above everything */}
      <JumpscareOverlay active={jumpscareActive} onDone={handleJumpscareDone} />

      {/* Screen flicker effect on transition */}
      {isScreenFlickering && (
        <div className="pointer-events-none fixed inset-0 z-40 animate-screen-flicker" />
      )}

      {/* 5-8 Drifting Ghost Shapes on Atmosphere Transition */}
      {showTransitionGhosts && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {TRANSITION_GHOSTS.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: '100vh', x: 0 }}
              animate={{
                opacity: [0, 0.45, 0.65, 0.35, 0],
                y: '-20vh',
                x: g.driftX,
              }}
              transition={{
                duration: g.duration,
                delay: g.delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{ left: `${g.left}%` }}
            >
              <Ghost
                style={{ width: `${g.size}px`, height: `${g.size}px` }}
                className="text-emerald-300/40 drop-shadow-[0_0_18px_rgba(52,211,153,0.4)]"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenRegistry={() => setShowStatsModal(true)}
        hauntedCount={hauntedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Act 1 — The Morgue (Bury a Ghosted Text) */}
        <div ref={morgueRef} className="pt-4 sm:pt-6">
          <MorgueIntake
            onBuryComplete={handleBuryComplete}
            onGoToGraveyard={() => handleNavigate('graveyard')}
          />
        </div>

        {/* Separator / Terrain Divide */}
        <div className="my-12 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800/80"></div>
          </div>
          <div className="relative flex items-center space-x-3 bg-[#090a0f] px-6 text-zinc-500 font-mono text-xs uppercase tracking-widest">
            <span>🪦</span>
            <span>Resting Grounds</span>
            <span>🪦</span>
          </div>
        </div>

        {/* Act 2 — The Graveyard */}
        <div ref={graveyardRef}>
          <GraveyardFeed
            graves={graves}
            onOpenOuija={handleOpenOuija}
            onReactionUpdate={reloadGraves}
            onScrollToIntake={() => handleNavigate('morgue')}
          />
        </div>
      </main>

      {/* Act 3 — Paranormal Rizz (Ouija Board Modal) */}
      <OuijaBoardModal
        grave={activeOuijaGrave}
        isOpen={Boolean(activeOuijaGrave)}
        onClose={() => setActiveOuijaGrave(null)}
      />

      {/* Exhumation Comment Thread Drawer (P2 Stretch) */}
      <ExhumationDrawer
        grave={activeCommentsGrave}
        isOpen={Boolean(activeCommentsGrave)}
        onClose={() => setActiveCommentsGrave(null)}
        onCommentAdded={reloadGraves}
      />

      {/* Necropolis Registry & Stats Modal */}
      <GraveyardStatsModal
        graves={graves}
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />

      {/* Dark Comedy Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-mono">Loading Morgue Records...</div>}>
      <MainGraveyardApp />
    </Suspense>
  );
}

