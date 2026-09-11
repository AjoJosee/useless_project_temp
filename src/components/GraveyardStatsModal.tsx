'use client';

import React from 'react';
import { Grave } from '../types';
import { X, Database, Skull, Flame, Beer, Award, Ghost, FileText, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface GraveyardStatsModalProps {
  graves: Grave[];
  isOpen: boolean;
  onClose: () => void;
}

export const GraveyardStatsModal: React.FC<GraveyardStatsModalProps> = ({
  graves,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const totalGraves = graves.length;
  const trenchCount = graves.filter(g => g.zone === 'trench').length;
  const hillCount = graves.filter(g => g.zone === 'hill').length;
  const hauntedCount = graves.filter(g => g.is_haunted).length;

  const totalCharactersBuried = graves.reduce((acc, g) => acc + g.victim_text.length, 0);
  const totalIncenseBurned = graves.reduce((acc, g) => acc + (g.reactions?.incense || 0), 0);
  const totalActiveIncense = graves.reduce((acc, g) => acc + (g.reactions?.recent_incense_count || 0), 0);
  const totalAlcoholPoured = graves.reduce((acc, g) => acc + (g.reactions?.pour_one_out || 0), 0);
  const totalSalutes = graves.reduce((acc, g) => acc + (g.reactions?.fallen_soldier || 0), 0);

  const oneWordKills = graves.filter(g => g.cause_of_death === 'one_word_assassin').length;
  const ghostings = graves.filter(g => g.cause_of_death === 'ghosting').length;
  const reactionsOnly = graves.filter(g => g.cause_of_death === 'reaction_only').length;
  const pivots = graves.filter(g => g.cause_of_death === 'topic_pivot').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/80 border border-red-800/60">
              <Skull className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-gothic text-xl font-bold tracking-wider text-zinc-100">
                NECROPOLIS REGISTRY & STATS
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Department of Unread Digital Remains · Vital Statistics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Big numbers grid */}
        <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <span className="text-2xl">⚰️</span>
            <div className="mt-1 text-xl font-bold font-mono text-zinc-100">{totalGraves}</div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Interned Texts</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <span className="text-2xl">🕯️</span>
            <div className="mt-1 text-xl font-bold font-mono text-amber-400">{totalActiveIncense}</div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Smoking (24h)</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <span className="text-2xl">🍺</span>
            <div className="mt-1 text-xl font-bold font-mono text-yellow-400">{totalAlcoholPoured}</div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Drinks Poured</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <span className="text-2xl">👻</span>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-400">{hauntedCount}</div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Haunted Spirits</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <span className="text-2xl">🎖️</span>
            <div className="mt-1 text-xl font-bold font-mono text-red-400">{totalSalutes}</div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Fallen Salutes</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <span className="text-2xl">📜</span>
            <div className="mt-1 text-xl font-bold font-mono text-purple-400">
              {Math.round(totalCharactersBuried / 1000)}k
            </div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Chars Buried</div>
          </div>
        </div>

        {/* Cause of Death Breakdown */}
        <div className="space-y-2 border-t border-zinc-800 pt-4 font-mono text-xs">
          <div className="text-[11px] text-zinc-400 uppercase font-bold mb-2">
            MORTALITY CASUALTIES BY CAUSE
          </div>

          <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded">
            <span className="flex items-center space-x-1.5">
              <span>🗡️</span>
              <span>The One-Word Assassin</span>
            </span>
            <span className="text-red-400 font-bold">{oneWordKills}</span>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded">
            <span className="flex items-center space-x-1.5">
              <span>👻</span>
              <span>The Ghosting</span>
            </span>
            <span className="text-cyan-400 font-bold">{ghostings}</span>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded">
            <span className="flex items-center space-x-1.5">
              <span>💔</span>
              <span>The Reaction-Only Fatality</span>
            </span>
            <span className="text-amber-400 font-bold">{reactionsOnly}</span>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded">
            <span className="flex items-center space-x-1.5">
              <span>🔀</span>
              <span>The Topic Pivot</span>
            </span>
            <span className="text-purple-400 font-bold">{pivots}</span>
          </div>
        </div>

        {/* Storage status */}
        <div className="mt-6 rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-3 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-zinc-400" />
            <span>Database Backend:</span>
          </div>
          <span className={isSupabaseConfigured ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
            {isSupabaseConfigured ? 'Supabase Postgres + Realtime Connected' : 'Local Storage Cache (Zero Config Ready)'}
          </span>
        </div>
      </div>
    </div>
  );
};
