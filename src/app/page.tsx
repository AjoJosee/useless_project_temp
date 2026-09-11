'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
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

function MainGraveyardApp() {
  const [graves, setGraves] = useState<Grave[]>([]);
  const [activeSection, setActiveSection] = useState<'morgue' | 'graveyard'>('morgue');
  const [activeOuijaGrave, setActiveOuijaGrave] = useState<Grave | null>(null);
  const [activeCommentsGrave, setActiveCommentsGrave] = useState<Grave | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleNavigate = (section: 'morgue' | 'graveyard') => {
    setActiveSection(section);
    if (section === 'morgue') {
      morgueRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      graveyardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBuryComplete = (newGrave: Grave) => {
    setGraves((prev) => [newGrave, ...prev.filter((g) => g.id !== newGrave.id)]);
  };

  const hauntedCount = graves.filter((g) => g.is_haunted).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 selection:bg-red-800 selection:text-white">
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
            onOpenOuija={(grave) => setActiveOuijaGrave(grave)}
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
