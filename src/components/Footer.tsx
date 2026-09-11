'use client';

import React from 'react';
import { Skull, Heart, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-900 bg-black/90 py-10 text-center font-mono text-xs text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 space-y-4 sm:px-6">
        <div className="flex items-center justify-center space-x-2 text-zinc-400">
          <Skull className="h-4 w-4 text-red-600" />
          <span className="font-gothic text-sm font-bold tracking-widest text-zinc-200">
            REST IN READ
          </span>
          <span>&middot;</span>
          <span>Digital Morgue for Ignored Texts</span>
        </div>

        <p className="max-w-xl mx-auto text-[11px] text-zinc-500 leading-relaxed font-tombstone italic text-sm">
          &ldquo;Gallows humor for conversational trauma. No read receipts were harmed in the making of this cemetery. If you have been left on read for more than 72 hours, please seek closure or a new hobby.&rdquo;
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-600 pt-2 border-t border-zinc-900">
          <span>Next.js 16 + React 19</span>
          <span>&bull;</span>
          <span>Tailwind CSS</span>
          <span>&bull;</span>
          <span>Framer Motion</span>
          <span>&bull;</span>
          <span>Supabase Postgres</span>
          <span>&bull;</span>
          <span>Anthropic Claude</span>
          <span>&bull;</span>
          <span>Web Audio Synthesis</span>
        </div>

        <div className="text-[10px] text-zinc-700">
          Official Necropolis Jurisdiction &middot; Digital Mortality Seal #404-RIP
        </div>
      </div>
    </footer>
  );
};
