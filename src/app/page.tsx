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

function MainGraveyardApp() {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [activeSection, setActiveSection] = useState<'morgue' | 'graveyard'>('morgue');
  const [activeOuijaGrave, setActiveOuijaGrave] = useState<Grave | null>(null);
  const [activeCommentsGrave, setActiveCommentsGrave] = useState<Grave | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* Navigation Header */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenRegistry={() => setShowStatsModal(true)}
        hauntedCount={hauntedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Act 1 — The Morgue (Coroner's Intake Desk) */}
        <div ref={morgueRef} className="pt-4 sm:pt-6">
          <MorgueIntake
            onBuryComplete={handleBuryComplete}
            onGoToGraveyard={() => handleNavigate('graveyard')}
          />
        </div>

        {/* Separator Fog / Terrain Divide */}
        <div className="my-12 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800/80"></div>
          </div>
          <div className="relative flex items-center space-x-3 bg-[#090a0f] px-6 text-zinc-500 font-mono text-xs">
            <span>🪦</span>
            <span>LEAVING THE CORONER&apos;S CLINIC &middot; ENTERING UNHALLOWED GROUNDS</span>
            <span>🪦</span>
          </div>
        </div>

        {/* Act 2 — The Graveyard (Communal Feed & Trench / Hill Zones) */}
        <div ref={graveyardRef}>
          <GraveyardFeed
            graves={graves}
            onOpenOuija={handleOpenOuija}
            onOpenComments={(grave) => setActiveCommentsGrave(grave)}
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

