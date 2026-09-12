'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Grave } from '../types';
import { TombstoneCard } from './TombstoneCard';
import { Ghost, Search, ArrowUp } from 'lucide-react';
import { AmbientFog } from './AmbientFog';
import { sound } from '../lib/audio';

interface GraveyardFeedProps {
  graves: Grave[];
  onOpenOuija: (grave: Grave) => void;
  onReactionUpdate: () => void;
  onScrollToIntake: () => void;
}

export const GraveyardFeed: React.FC<GraveyardFeedProps> = ({
  graves,
  onOpenOuija,
  onReactionUpdate,
  onScrollToIntake
}) => {
  const [onlyHaunted, setOnlyHaunted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const rootContainerRef = useRef<HTMLElement | null>(null);
  const hasTriggeredAmbientRef = useRef(false);

  // Set up an IntersectionObserver on the graveyard section's root container.
  // The first time it enters the viewport, call sound.startAmbientWind() once per page load.
  useEffect(() => {
    const el = rootContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasTriggeredAmbientRef.current) {
          hasTriggeredAmbientRef.current = true;
          sound.startAmbientWind();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filter graves
  const filteredGraves = graves.filter((g) => {
    if (onlyHaunted && !g.is_haunted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = g.victim_text.toLowerCase().includes(q);
      const matchEpitaph = g.epitaph.toLowerCase().includes(q);
      const matchGhostedBy = (g.ghosted_by || '').toLowerCase().includes(q);
      return matchText || matchEpitaph || matchGhostedBy;
    }
    return true;
  });

  const totalHaunted = graves.filter((g) => g.is_haunted).length;

  return (
    <section ref={rootContainerRef} className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AmbientFog />

      {/* Simplified Graveyard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1 text-xs font-mono text-zinc-400">
          <span>⚰️</span>
          <span>THE GRAVEYARD</span>
        </div>
        <h2 className="mt-3 font-gothic text-3xl font-black tracking-wider text-zinc-100 sm:text-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          THE COMMUNAL GRAVEYARD
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-zinc-400">
          Where ignored texts and unanswered hopes rest together.
        </p>
      </div>

      {/* Clean Search & Filter Control */}
      <div className="mb-8 mx-auto max-w-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search dead texts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-red-600 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlyHaunted(!onlyHaunted)}
          className={`flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-mono transition-all select-none ${
            onlyHaunted
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'border border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Ghost className="h-4 w-4 text-emerald-400" />
          <span>Haunted ({totalHaunted})</span>
        </button>
      </div>

      {/* Single Unified Grid of All Graves */}
      {filteredGraves.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center text-xs font-mono text-zinc-500">
          No graves match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredGraves.map((grave) => (
            <TombstoneCard
              key={grave.id}
              grave={grave}
              onOpenOuija={onOpenOuija}
              onReactionUpdate={onReactionUpdate}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Quick Action */}
      <div className="mt-12 flex items-center justify-center">
        <button
          onClick={onScrollToIntake}
          className="flex items-center space-x-2 rounded-full border border-red-800/80 bg-red-950/80 px-5 py-2.5 font-gothic text-xs font-bold text-red-200 shadow-xl hover:bg-red-900 transition-all hover:scale-105"
        >
          <span>⛏️</span>
          <span>Bury Another Text</span>
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
};
