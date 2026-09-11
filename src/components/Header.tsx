'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Skull, Flame, FileSpreadsheet, Compass } from 'lucide-react';
import { sound } from '../lib/audio';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  onOpenRegistry: () => void;
  activeSection: 'morgue' | 'graveyard';
  onNavigate: (section: 'morgue' | 'graveyard') => void;
  hauntedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegistry,
  activeSection,
  onNavigate,
  hauntedCount
}) => {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setIsMuted(sound.getIsMuted());
    const unsub = sound.subscribe((muted) => setIsMuted(muted));
    return unsub;
  }, []);

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo & Subtitle */}
        <div 
          onClick={() => onNavigate('morgue')}
          className="group flex cursor-pointer items-center space-x-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 shadow-inner group-hover:border-red-600/70 transition-colors">
            <Skull className="h-6 w-6 text-red-500 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-gothic text-xl font-bold tracking-wider text-zinc-100 sm:text-2xl">
                REST IN READ
              </span>
              <span className="hidden rounded bg-red-950/80 px-1.5 py-0.5 text-[10px] font-mono tracking-widest text-red-400 border border-red-800/50 md:inline-block">
                MORGUE DIV.
              </span>
            </div>
            <p className="text-xs text-zinc-400 tracking-tight hidden sm:block">
              Official Digital Necropolis for Deceased Conversations
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3 text-sm">
          <button
            onClick={() => onNavigate('morgue')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              activeSection === 'morgue'
                ? 'bg-red-950/60 text-red-300 border border-red-800/60 shadow-[0_0_12px_rgba(220,38,38,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span className="text-xs">📋</span>
            <span>Intake Desk</span>
          </button>

          <button
            onClick={() => onNavigate('graveyard')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              activeSection === 'graveyard'
                ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Compass className="h-4 w-4 text-purple-400" />
            <span>The Graveyard</span>
            {hauntedCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/60 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300 animate-pulse">
                👻 {hauntedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center space-x-2">
          {/* Cemetery Stats/Registry */}
          <button
            onClick={onOpenRegistry}
            title="View Coroner Registry & Stats"
            className="flex items-center space-x-1 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden lg:inline">Registry</span>
          </button>

          {/* Sound Toggle (Off by default per policy) */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center space-x-1.5 rounded-md border px-2.5 py-1.5 text-xs font-mono transition-all ${
              isMuted
                ? 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                : 'border-emerald-700/60 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            }`}
            title={isMuted ? "Unmute atmospheric audio & sound effects" : "Mute all sounds"}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Audio Off</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                <span className="hidden sm:inline">Soundscapes On</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
