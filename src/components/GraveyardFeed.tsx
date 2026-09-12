'use client';

import React, { useState } from 'react';
import { Grave, CauseOfDeath } from '../types';
import { TombstoneCard } from './TombstoneCard';
import { Compass, Ghost, Search, Filter, Mountain, Layers, Flame, ArrowUp } from 'lucide-react';
import { AmbientFog } from './AmbientFog';

interface GraveyardFeedProps {
  graves: Grave[];
  onOpenOuija: (grave: Grave) => void;
  onOpenComments: (grave: Grave) => void;
  onReactionUpdate: () => void;
  onScrollToIntake: () => void;
}

export const GraveyardFeed: React.FC<GraveyardFeedProps> = ({
  graves,
  onOpenOuija,
  onOpenComments,
  onReactionUpdate,
  onScrollToIntake
}) => {
  const [filterZone, setFilterZone] = useState<'all' | 'trench' | 'hill'>('all');
  const [onlyHaunted, setOnlyHaunted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCause, setSelectedCause] = useState<string>('all');

  // Filter graves
  const filteredGraves = graves.filter((g) => {
    if (filterZone !== 'all' && g.zone !== filterZone) return false;
    if (onlyHaunted && !g.is_haunted) return false;
    if (selectedCause !== 'all' && g.cause_of_death !== selectedCause) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = g.victim_text.toLowerCase().includes(q);
      const matchEpitaph = g.epitaph.toLowerCase().includes(q);
      return matchText || matchEpitaph;
    }
    return true;
  });

  const trenchGraves = filteredGraves.filter((g) => g.zone === 'trench');
  const hillGraves = filteredGraves.filter((g) => g.zone === 'hill');
  const totalHaunted = graves.filter((g) => g.is_haunted).length;

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Continuous ambient fog drifting behind the graveyard feed (z-0) */}
      <AmbientFog />
      {/* Cemetery Entrance Arch */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-mono text-zinc-400">
          <span>⚰️</span>
          <span>CYBER CEMETERY & COMMUNICABLE OSSUARY</span>
          <span>⚰️</span>
        </div>
        <h2 className="mt-3 font-gothic text-3xl font-black tracking-wider text-zinc-100 sm:text-5xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          THE COMMUNAL GRAVEYARD
        </h2>
        <p className="mx-auto mt-2 max-w-2xl font-tombstone text-base sm:text-lg italic text-zinc-400">
          Where unanswered confessions, neglected paragraphs, and single-syllable assassinations rest together beneath cold silicon.
        </p>
      </div>

      {/* Filter & Search Control Panel */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search graves by text excerpt or epitaph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-red-600 focus:outline-none"
            />
          </div>

          {/* Zone Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setFilterZone('all')}
              className={`rounded-lg px-3 py-2 transition-all ${
                filterZone === 'all'
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-600'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              All Grounds ({filteredGraves.length})
            </button>

            <button
              onClick={() => setFilterZone('hill')}
              className={`flex items-center space-x-1 rounded-lg px-3 py-2 transition-all ${
                filterZone === 'hill'
                  ? 'bg-cyan-950 border border-cyan-600/80 text-cyan-300 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Mountain className="h-3.5 w-3.5 text-cyan-400" />
              <span>Hill of Memes (&le;200ch)</span>
            </button>

            <button
              onClick={() => setFilterZone('trench')}
              className={`flex items-center space-x-1 rounded-lg px-3 py-2 transition-all ${
                filterZone === 'trench'
                  ? 'bg-purple-950 border border-purple-600/80 text-purple-300 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Trench of Paragraphs (&gt;200ch)</span>
            </button>

            {/* Haunted toggle */}
            <button
              onClick={() => setOnlyHaunted(!onlyHaunted)}
              className={`flex items-center space-x-1 rounded-lg px-3 py-2 transition-all ${
                onlyHaunted
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Ghost className="h-3.5 w-3.5 text-emerald-400" />
              <span>Haunted Only ({totalHaunted})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Zones: If filterZone is 'all', show two visually distinct terrain sections */}
      {filterZone === 'all' ? (
        <div className="space-y-16">
          {/* SECTION 1: Hill of Left-on-Read Memes (Rolling misty hills, short texts) */}
          <div className="relative rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-cyan-950/20 via-zinc-950 to-zinc-950 p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between border-b border-cyan-900/40 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⛰️</span>
                  <h3 className="font-gothic text-2xl font-bold tracking-wide text-cyan-200 sm:text-3xl">
                    HILL OF LEFT-ON-READ MEMES
                  </h3>
                </div>
                <p className="mt-1 text-xs font-mono text-cyan-400/80">
                  SHORTER DISPATCHES &middot; CASUAL REEL SHARES &middot; UNANSWERED PLANS (&le; 200 CHARS)
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-400 mt-2 sm:mt-0">
                {hillGraves.length} interned headstones
              </span>
            </div>

            {hillGraves.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center font-mono text-xs text-zinc-500">
                No short texts currently interned in this section.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hillGraves.map((grave) => (
                  <TombstoneCard
                    key={grave.id}
                    grave={grave}
                    onOpenOuija={onOpenOuija}
                    onOpenComments={onOpenComments}
                    onReactionUpdate={onReactionUpdate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: Trench of Tragic Paragraphs (Deep muddy ravine, essay confessions) */}
          <div className="relative rounded-2xl border border-purple-900/40 bg-gradient-to-b from-purple-950/25 via-zinc-950 to-zinc-950 p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between border-b border-purple-900/40 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🕳️</span>
                  <h3 className="font-gothic text-2xl font-bold tracking-wide text-purple-200 sm:text-3xl">
                    TRENCH OF TRAGIC PARAGRAPHS
                  </h3>
                </div>
                <p className="mt-1 text-xs font-mono text-purple-400/80">
                  THE MULTI-SENTENCE ESSAYS &middot; VULNERABLE NOVELS &middot; DEEPLY SOUGHT VALIDATION (&gt; 200 CHARS)
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-400 mt-2 sm:mt-0">
                {trenchGraves.length} interned monuments
              </span>
            </div>

            {trenchGraves.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center font-mono text-xs text-zinc-500">
                No paragraphs currently interned in this deep trench.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trenchGraves.map((grave) => (
                  <TombstoneCard
                    key={grave.id}
                    grave={grave}
                    onOpenOuija={onOpenOuija}
                    onOpenComments={onOpenComments}
                    onReactionUpdate={onReactionUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Filtered Single Grid View */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGraves.map((grave) => (
            <TombstoneCard
              key={grave.id}
              grave={grave}
              onOpenOuija={onOpenOuija}
              onOpenComments={onOpenComments}
              onReactionUpdate={onReactionUpdate}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Quick Action to Bury a Message */}
      <div className="mt-12 flex items-center justify-center">
        <button
          onClick={onScrollToIntake}
          className="flex items-center space-x-2 rounded-full border border-red-800/80 bg-red-950/80 px-6 py-3 font-gothic text-sm font-bold text-red-200 shadow-xl shadow-red-950/60 hover:bg-red-900 transition-all hover:scale-105"
        >
          <span>⛏️</span>
          <span>Bury Another Text at Intake Desk</span>
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};
