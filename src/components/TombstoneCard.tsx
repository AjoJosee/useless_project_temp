'use client';

import React, { useState } from 'react';
import { Grave, ReactionType } from '../types';
import { hasUserReacted, addGraveReaction } from '../lib/storage';
import { sound } from '../lib/audio';
import { Flame, Beer, Award } from 'lucide-react';

interface TombstoneCardProps {
  grave: Grave;
  onOpenOuija: (grave: Grave) => void;
  onReactionUpdate: () => void;
}

export const TombstoneCard: React.FC<TombstoneCardProps> = ({
  grave,
  onOpenOuija,
  onReactionUpdate
}) => {
  const [showSplash, setShowSplash] = useState(false);
  const [reactionNotice, setReactionNotice] = useState<string | null>(null);

  // Calculate relative time
  const getRelativeBurialTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just laid to rest';
    if (diffHours < 24) return `${diffHours}h in the ground`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day in the ground';
    return `${diffDays} days in the ground`;
  };

  // Reactions
  const candleCount = grave.reactions?.incense || 0;
  const activeCandleCount = grave.reactions?.recent_incense_count ?? 0;
  const pourCount = grave.reactions?.pour_one_out || 0;
  const soldierCount = grave.reactions?.fallen_soldier || 0;

  const hasActiveCandle = activeCandleCount > 0;
  const isOldGrave = grave.time_of_death_hours >= 168; // 1 week+
  const tiltClass = isOldGrave
    ? grave.time_of_death_hours % 2 === 0
      ? '-rotate-1 hover:rotate-0'
      : 'rotate-1 hover:rotate-0'
    : '';

  const handleReaction = async (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (type === 'pour_one_out') {
      setShowSplash(true);
      sound.playPourSplash();
      setTimeout(() => setShowSplash(false), 1000);
    } else if (type === 'incense') {
      sound.playShovelDig();
    } else if (type === 'fallen_soldier') {
      sound.playGraveToll();
    }

    const res = await addGraveReaction(grave.id, type);
    if (!res.success && res.reason) {
      setReactionNotice(res.reason);
      setTimeout(() => setReactionNotice(null), 3000);
    } else {
      onReactionUpdate();
    }
  };

  const handleCardClick = () => {
    if (grave.is_haunted) {
      onOpenOuija(grave);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative mx-auto flex w-full max-w-[280px] flex-col justify-between rounded-t-[4.5rem] rounded-b-md border-2 p-5 sm:p-6 shadow-2xl transition-all duration-300 ${tiltClass} ${
        grave.is_haunted
          ? 'haunted-card cursor-pointer bg-gradient-to-b from-[#242c26] via-[#1a211c] to-[#121613] hover:scale-[1.03]'
          : 'border-zinc-700/80 bg-gradient-to-b from-[#2a2e3a] via-[#1e222c] to-[#13161e] hover:border-zinc-500 hover:scale-[1.02]'
      }`}
    >
      {/* Weathering crack lines for older graves (>1 week) */}
      {isOldGrave && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
          viewBox="0 0 280 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 50 15 L 65 50 L 58 85 L 75 120 M 230 40 L 210 75 L 225 110 L 205 160"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Splash Animation Overlay for Pour One Out */}
      {showSplash && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="animate-splash">
            <Beer className="h-12 w-12 text-yellow-400" />
          </div>
        </div>
      )}

      {/* Burning candle smoke wisps on top */}
      {hasActiveCandle && (
        <div className="pointer-events-none absolute -top-8 right-6 z-20 flex space-x-1 select-none">
          <div className="relative">
            <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
            <div className="smoke-particle-1 absolute -top-3 left-1 text-base text-zinc-300 opacity-60">~</div>
            <div className="smoke-particle-2 absolute -top-6 left-0 text-sm text-zinc-400 opacity-40">~</div>
          </div>
        </div>
      )}

      {/* Top Headstone Header: Traditional R.I.P Inscription */}
      <div className="text-center pt-2">
        <span className="font-gothic text-xs tracking-[0.3em] text-zinc-400 select-none">
          + R · I · P +
        </span>
        {grave.ghosted_by && (
          <div className="mt-1 text-[11px] font-mono text-zinc-400">
            Ghosted by: <span className="font-bold text-zinc-200">{grave.ghosted_by}</span>
          </div>
        )}
      </div>

      {/* Main Gravestone Face: Epitaph & Victim Text */}
      <div className="my-4 text-center space-y-3">
        {/* Epitaph carved deeply into stone */}
        <p className={`font-gothic text-base sm:text-lg font-bold tracking-wide text-zinc-100 leading-snug drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] ${isOldGrave ? 'flicker-text' : ''}`}>
          &ldquo;{grave.epitaph}&rdquo;
        </p>

        {/* The ghosted message shown directly on the face of the stone */}
        <div className="rounded border border-zinc-800/80 bg-black/40 p-2.5 text-xs font-tombstone text-zinc-300 italic leading-relaxed line-clamp-4">
          &ldquo;{grave.victim_text}&rdquo;
        </div>

        {/* Time in ground */}
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {getRelativeBurialTime(grave.created_at)}
        </div>
      </div>

      {/* Reaction Notice Toast */}
      {reactionNotice && (
        <div className="mb-2 rounded bg-red-950/90 border border-red-800/80 p-1 text-center text-[10px] font-mono text-red-300">
          {reactionNotice}
        </div>
      )}

      {/* Offerings / Reactions Bar */}
      <div className="grid grid-cols-3 gap-1 border-t border-zinc-800/80 pt-3">
        {/* 1. Light a Candle */}
        <button
          type="button"
          onClick={(e) => handleReaction(e, 'incense')}
          title="Light a Candle (Active smoke for 24h)"
          className={`flex flex-col items-center justify-center rounded py-1.5 px-0.5 text-center transition-all ${
            hasUserReacted(grave.id, 'incense')
              ? 'border border-amber-600/60 bg-amber-950/40 text-amber-300'
              : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono text-xs font-bold">{candleCount}</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 mt-0.5 leading-none">Candle</span>
        </button>

        {/* 2. Pour One Out */}
        <button
          type="button"
          onClick={(e) => handleReaction(e, 'pour_one_out')}
          title="Pour One Out"
          className={`flex flex-col items-center justify-center rounded py-1.5 px-0.5 text-center transition-all ${
            hasUserReacted(grave.id, 'pour_one_out')
              ? 'border border-yellow-600/60 bg-yellow-950/40 text-yellow-300'
              : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs">
            <Beer className="h-3.5 w-3.5 text-yellow-400" />
            <span className="font-mono text-xs font-bold">{pourCount}</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 mt-0.5 leading-none">Pour Out</span>
        </button>

        {/* 3. Press F to Pay Respects */}
        <button
          type="button"
          onClick={(e) => handleReaction(e, 'fallen_soldier')}
          title="Press F to Pay Respects"
          className={`flex flex-col items-center justify-center rounded py-1.5 px-0.5 text-center transition-all ${
            hasUserReacted(grave.id, 'fallen_soldier')
              ? 'border border-red-600/60 bg-red-950/40 text-red-300'
              : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs">
            <Award className="h-3.5 w-3.5 text-red-400" />
            <span className="font-mono text-xs font-bold">{soldierCount}</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 mt-0.5 leading-none">Pay Respects</span>
        </button>
      </div>
    </div>
  );
};
