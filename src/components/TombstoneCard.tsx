'use client';

import React, { useState } from 'react';
import { Grave, ReactionType } from '../types';
import { CAUSES_OF_DEATH } from '../lib/constants';
import { hasUserReacted, addGraveReaction } from '../lib/storage';
import { sound } from '../lib/audio';
import { Sparkles, MessageSquare, ChevronDown, ChevronUp, Share2, Award, Flame, Beer, Ghost, Check } from 'lucide-react';

interface TombstoneCardProps {
  grave: Grave;
  onOpenOuija: (grave: Grave) => void;
  onOpenComments: (grave: Grave) => void;
  onReactionUpdate: () => void;
}

export const TombstoneCard: React.FC<TombstoneCardProps> = ({
  grave,
  onOpenOuija,
  onOpenComments,
  onReactionUpdate
}) => {
  const [isExhumed, setIsExhumed] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reactionNotice, setReactionNotice] = useState<string | null>(null);

  const causeInfo = CAUSES_OF_DEATH[grave.cause_of_death] || CAUSES_OF_DEATH.ghosting;
  
  // Calculate relative time
  const getRelativeBurialTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just laid to rest';
    if (diffHours < 24) return `${diffHours} hours in the ground`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day in the ground';
    return `${diffDays} days in the ground`;
  };

  // Reactions
  const incenseCount = grave.reactions?.incense || 0;
  const activeIncenseCount = grave.reactions?.recent_incense_count ?? 0;
  const pourCount = grave.reactions?.pour_one_out || 0;
  const soldierCount = grave.reactions?.fallen_soldier || 0;
  const commentsCount = grave.comments?.length || 0;

  // Has active incense smoking
  const hasActiveIncense = activeIncenseCount > 0;

  const handleReaction = async (type: ReactionType) => {
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

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/?grave=${grave.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div
      className={`group relative flex flex-col rounded-t-3xl rounded-b-lg border-2 bg-gradient-to-b from-[#1c1f2b] to-[#12141c] p-5 sm:p-6 shadow-xl transition-all duration-300 ${
        grave.is_haunted
          ? 'haunted-card hover:scale-[1.02] cursor-pointer'
          : 'border-zinc-800 hover:border-zinc-700 hover:shadow-2xl hover:scale-[1.01]'
      }`}
    >
      {/* Splash Animation Overlay for Pour One Out */}
      {showSplash && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="animate-splash text-6xl select-none">
            🍺💦
          </div>
        </div>
      )}

      {/* Incense Smoke Wisps Animation if active (< 24h) */}
      {hasActiveIncense && (
        <div className="pointer-events-none absolute -top-8 right-6 z-20 flex space-x-1 select-none">
          <div className="relative">
            <span className="text-xs">🕯️</span>
            <div className="smoke-particle-1 absolute -top-3 left-1 text-base text-zinc-300 opacity-60">
              ~
            </div>
            <div className="smoke-particle-2 absolute -top-6 left-0 text-sm text-zinc-400 opacity-40">
              ~
            </div>
            <div className="smoke-particle-3 absolute -top-9 left-2 text-xs text-zinc-500 opacity-30">
              ~
            </div>
          </div>
        </div>
      )}

      {/* Haunted Ghost Banner if is_haunted */}
      {grave.is_haunted && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenOuija(grave);
          }}
          className="mb-3 flex items-center justify-between rounded-lg border border-emerald-500/50 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:bg-emerald-900/40 transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <Ghost className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="font-mono font-bold">HAUNTED REMAINS</span>
          </div>
          <span className="font-mono text-[11px] underline underline-offset-2">
            Summon Spirit via Ouija &rarr;
          </span>
        </div>
      )}

      {/* Tombstone Arch Top & Cause of Death */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl" title={causeInfo.name}>{causeInfo.icon}</span>
          <span className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {causeInfo.name}
          </span>
        </div>

        {/* Fallen Soldier Ribbon Badge if awarded or high bravery */}
        {(soldierCount > 0 || grave.cause_of_death === 'one_word_assassin') && (
          <div
            title="Fallen Soldier: Commended for tragic conversational bravery"
            className="flex items-center space-x-1 rounded bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 text-[10px] font-mono text-amber-300"
          >
            <Award className="h-3 w-3 text-amber-400" />
            <span>SALUTE</span>
          </div>
        )}
      </div>

      {/* Stone Carved Epitaph */}
      <div className="my-4 min-h-[56px] flex items-center justify-center text-center">
        <p className="font-gothic text-lg font-bold tracking-wide text-zinc-100 sm:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          &ldquo;{grave.epitaph}&rdquo;
        </p>
      </div>

      {/* Burial Metadata */}
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>{getRelativeBurialTime(grave.created_at)}</span>
        <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-300">
          {grave.zone === 'trench' ? 'Trench (Long)' : 'Hill (Short)'}
        </span>
      </div>

      {/* Exhume Original Message Dropdown */}
      <div className="mt-4 border-t border-zinc-800/80 pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExhumed(!isExhumed);
          }}
          className="flex w-full items-center justify-between text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <span className="flex items-center space-x-1">
            <span>{isExhumed ? 'Re-inter Remains' : 'Exhume Original Text'}</span>
            <span className="text-[10px] opacity-70">({grave.victim_text.length} chars)</span>
          </span>
          {isExhumed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isExhumed && (
          <div className="mt-2 rounded border border-zinc-700/60 bg-zinc-950/90 p-3 text-xs font-tombstone text-zinc-200 italic leading-relaxed">
            &ldquo;{grave.victim_text}&rdquo;
            <div className="mt-2 text-[10px] font-mono text-zinc-500 not-italic">
              Deceased after {grave.time_of_death_hours}h without reply.
            </div>
          </div>
        )}
      </div>

      {/* Reaction Notice Toast */}
      {reactionNotice && (
        <div className="mt-2 rounded bg-red-950/90 border border-red-800/80 p-1.5 text-center text-[11px] font-mono text-red-300 animate-fade-in">
          {reactionNotice}
        </div>
      )}

      {/* Interactive Reactions Bar */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-zinc-800/80 pt-3">
        {/* Incense Reaction */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReaction('incense');
          }}
          title="Burn Incense (Active smoke trail for 24h)"
          className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all ${
            hasUserReacted(grave.id, 'incense')
              ? 'border-amber-700/50 bg-amber-950/30 text-amber-300'
              : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs">
            <span>🕯️</span>
            <span className="font-mono font-bold text-xs">{incenseCount}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
            {hasActiveIncense ? 'Smoking' : 'Incense'}
          </span>
        </button>

        {/* Pour One Out */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReaction('pour_one_out');
          }}
          title="Pour One Out (Splash drink on grave)"
          className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all ${
            hasUserReacted(grave.id, 'pour_one_out')
              ? 'border-yellow-700/50 bg-yellow-950/30 text-yellow-300'
              : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs">
            <span>🍺</span>
            <span className="font-mono font-bold text-xs">{pourCount}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-0.5">Pour Out</span>
        </button>

        {/* Fallen Soldier */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReaction('fallen_soldier');
          }}
          title="Fallen Soldier badge for brave texts"
          className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all ${
            hasUserReacted(grave.id, 'fallen_soldier')
              ? 'border-red-700/50 bg-red-950/30 text-red-300'
              : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs">
            <span>🎖️</span>
            <span className="font-mono font-bold text-xs">{soldierCount}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-0.5">Salute</span>
        </button>
      </div>

      {/* Card Footer: Exhumation Comments & Share */}
      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-xs font-mono text-zinc-400">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(grave);
          }}
          className="flex items-center space-x-1.5 hover:text-zinc-200 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
          <span>Eulogies ({commentsCount})</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyLink();
          }}
          title="Copy permalink to this grave"
          className="flex items-center space-x-1 hover:text-zinc-200 transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3 w-3 text-zinc-500" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
