'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Grave } from '../types';
import { CAUSES_OF_DEATH } from '../lib/constants';
import { toPng } from 'html-to-image';
import { Download, ArrowRight, Share2, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { sound } from '../lib/audio';

interface DeathCertificateProps {
  grave: Grave;
  onGoToGraveyard: () => void;
  onBuryAnother?: () => void;
}

export const DeathCertificate: React.FC<DeathCertificateProps> = ({
  grave,
  onGoToGraveyard,
  onBuryAnother
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stampSoundPlayed, setStampSoundPlayed] = useState(false);

  useEffect(() => {
    // Play stamp thud when certificate appears
    if (!stampSoundPlayed) {
      const timer = setTimeout(() => {
        sound.playStamp();
        setStampSoundPlayed(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [stampSoundPlayed]);

  const causeInfo = CAUSES_OF_DEATH[grave.cause_of_death] || CAUSES_OF_DEATH.ghosting;

  const handleDownloadPng = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      // Use toPng from html-to-image
      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95
      });
      const link = document.createElement('a');
      link.download = `rest-in-read-certificate-${grave.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export certificate:', err);
      alert('Unable to generate PNG directly. You can take a screenshot of your official certificate!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/?grave=${grave.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const timeFormatted = grave.time_of_death_hours >= 48
    ? `${Math.round(grave.time_of_death_hours / 24)} DAYS`
    : `${grave.time_of_death_hours} HOURS`;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Official Certificate Container */}
      <div
        ref={certificateRef}
        id="death-certificate-document"
        className="parchment-texture relative max-w-2xl w-full rounded-lg border-8 border-double border-zinc-800 p-6 sm:p-10 shadow-2xl text-zinc-900 overflow-hidden"
      >
        {/* Vintage corner ornaments */}
        <div className="absolute top-2 left-2 text-xs font-serif text-zinc-500 select-none">❖</div>
        <div className="absolute top-2 right-2 text-xs font-serif text-zinc-500 select-none">❖</div>
        <div className="absolute bottom-2 left-2 text-xs font-serif text-zinc-500 select-none">❖</div>
        <div className="absolute bottom-2 right-2 text-xs font-serif text-zinc-500 select-none">❖</div>

        {/* Rotated RED "DECLARATION OF CLOSURE" Stamp */}
        <div className="pointer-events-none absolute top-1/2 right-6 sm:right-12 -translate-y-1/2 z-20">
          <div className="animate-stamp-slam">
            <div className="animate-stamp-jitter rounded-md border-4 border-dashed border-red-700/85 px-4 py-2 text-center shadow-[0_0_15px_rgba(185,28,28,0.25)] bg-red-500/10 backdrop-blur-[0.5px]">
              <span className="block font-typewriter text-lg sm:text-2xl font-black tracking-widest text-red-700 uppercase">
                DECLARATION OF CLOSURE
              </span>
              <span className="block text-[10px] font-mono tracking-wider text-red-800 font-bold mt-0.5">
                NO RESUSCITATION AUTHORIZED · DECEASED
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Header */}
        <div className="border-b-2 border-zinc-800 pb-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-zinc-800">
            <span className="text-xl">⚖️</span>
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              DEPARTMENT OF DIGITAL MORTALITY & UNREAD REMAINS
            </span>
          </div>
          <h1 className="mt-2 font-gothic text-2xl sm:text-3xl font-bold tracking-wider text-zinc-950">
            OFFICIAL CORONER&apos;S DEATH CERTIFICATE
          </h1>
          <p className="mt-1 font-typewriter text-xs text-zinc-700">
            CASE FILE #{grave.id.toUpperCase()} · JURISDICTION: CYBERSPACE PARISH
          </p>
        </div>

        {/* Main Body Grid */}
        <div className="mt-6 space-y-5 font-typewriter text-sm">
          {/* Victim Text Box */}
          <div className="rounded border border-zinc-400 bg-white/70 p-4">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              EXHIBIT A: THE VICTIM (DECEASED DISPATCH)
            </span>
            <blockquote className="mt-2 font-tombstone text-base italic text-zinc-900 line-clamp-4 leading-relaxed">
              &ldquo;{grave.victim_text}&rdquo;
            </blockquote>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded border border-zinc-400 bg-white/60 p-3">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                OFFICIAL CAUSE OF DEATH
              </span>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-lg">{causeInfo.icon}</span>
                <span className="font-bold text-zinc-900">{causeInfo.name}</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-600 font-sans">
                {causeInfo.flavor}
              </p>
            </div>

            <div className="rounded border border-zinc-400 bg-white/60 p-3">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                TIME OF DEATH (SINCE READ)
              </span>
              <div className="mt-1 text-base font-bold text-zinc-900">
                {timeFormatted} POST-DELIVERY
              </div>
              <p className="mt-1 text-[11px] text-zinc-600 font-sans">
                Rigor mortis firmly settled into blue message bubbles.
              </p>
            </div>
          </div>

          {/* Epitaph Banner */}
          <div className="rounded border-2 border-dashed border-zinc-800 bg-zinc-100/90 p-4 text-center">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-900">
              CERTIFIED TOMBSTONE EPITAPH
            </span>
            <p className="mt-2 font-gothic text-lg sm:text-xl font-bold tracking-wide text-zinc-950">
              &ldquo;{grave.epitaph}&rdquo;
            </p>
          </div>

          {/* Coroner Signature & Cemetery Zone */}
          <div className="flex flex-wrap items-end justify-between border-t border-zinc-400 pt-4 text-xs">
            <div>
              <span className="block text-[10px] text-zinc-500 uppercase">Assigned Burial Ground:</span>
              <span className="font-bold text-zinc-800 uppercase">
                {grave.zone === 'trench' ? 'Trench of Tragic Paragraphs' : 'Hill of Left-on-Read Memes'}
              </span>
            </div>

            <div className="text-right mt-2 sm:mt-0">
              <div className="font-serif italic text-base text-zinc-800 select-none">
                Chief Coroner Dr. G. Mortis, M.D.
              </div>
              <div className="border-t border-zinc-700 text-[10px] text-zinc-500 uppercase">
                Authorized Signature & Seal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Below Certificate */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadPng}
          disabled={isExporting}
          className="flex items-center space-x-2 rounded-lg bg-red-700 px-5 py-2.5 font-medium text-white shadow-lg shadow-red-950/50 hover:bg-red-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{isExporting ? 'Exporting...' : 'Download Certificate (PNG)'}</span>
        </button>

        <button
          onClick={onGoToGraveyard}
          className="flex items-center space-x-2 rounded-lg border border-purple-600/60 bg-purple-950/40 px-5 py-2.5 font-medium text-purple-300 hover:bg-purple-900/60 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <span>Visit in Graveyard</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={handleCopyShareLink}
          className="flex items-center space-x-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
        >
          {copiedLink ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Share Grave</span>
            </>
          )}
        </button>

        {onBuryAnother && (
          <button
            onClick={onBuryAnother}
            className="flex items-center space-x-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Bury Another Text</span>
          </button>
        )}
      </div>
    </div>
  );
};
