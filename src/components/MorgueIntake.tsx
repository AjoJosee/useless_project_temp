'use client';

import React, { useState } from 'react';
import { CauseOfDeath, Grave } from '../types';
import { CAUSES_OF_DEATH, INTAKE_PRESETS } from '../lib/constants';
import { generateEpitaph } from '../lib/llm';
import { saveNewGrave } from '../lib/storage';
import { DustParticles } from './DustParticles';
import { GriefLoadingSequence } from './GriefLoadingSequence';
import { DeathCertificate } from './DeathCertificate';
import { Clock, HelpCircle, FileText, AlertTriangle, Sparkles, Send } from 'lucide-react';
import { sound } from '../lib/audio';

interface MorgueIntakeProps {
  onBuryComplete: (grave: Grave) => void;
  onGoToGraveyard: () => void;
}

export const MorgueIntake: React.FC<MorgueIntakeProps> = ({
  onBuryComplete,
  onGoToGraveyard
}) => {
  const [victimText, setVictimText] = useState('');
  const [timeHours, setTimeHours] = useState<number>(48);
  const [causeOfDeath, setCauseOfDeath] = useState<CauseOfDeath>('ghosting');
  const [forceHaunted, setForceHaunted] = useState<boolean>(false);

  // States for burial sequence
  const [isDimming, setIsDimming] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [showGriefStages, setShowGriefStages] = useState(false);
  const [generatedGrave, setGeneratedGrave] = useState<Grave | null>(null);
  const [backendReady, setBackendReady] = useState(false);

  // Zone derivation
  const isTrench = victimText.trim().length > 200;
  const zoneName = isTrench ? 'Trench of Tragic Paragraphs' : 'Hill of Left-on-Read Memes';

  const handleApplyPreset = (preset: typeof INTAKE_PRESETS[0]) => {
    setVictimText(preset.text);
    setCauseOfDeath(preset.cause);
    setTimeHours(preset.hours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimText.trim()) return;

    // Sequence Step 1: Screen dims (overlay fades to ~70% black, 400ms)
    setIsDimming(true);

    // Sequence Step 2: Play shovel-dig sound effect
    sound.playShovelDig();

    // Sequence Step 3: Dust particles fall across screen (~1.5s)
    setShowDust(true);

    // Sequence Step 4: Start Grief stage loading sequence
    setShowGriefStages(true);

    // Kick off LLM epitaph generation in background while grief sequence plays
    try {
      const epitaph = await generateEpitaph({
        victim_text: victimText.trim(),
        cause_of_death: causeOfDeath,
        time_of_death_hours: timeHours
      });

      const newGrave = await saveNewGrave({
        victim_text: victimText.trim(),
        time_of_death_hours: timeHours,
        cause_of_death: causeOfDeath,
        epitaph,
        is_haunted: forceHaunted ? true : undefined
      });

      setGeneratedGrave(newGrave);
      setBackendReady(true);
      onBuryComplete(newGrave);
    } catch (err) {
      console.error('Failed burial processing:', err);
      // Fallback grave if network/LLM crashes
      const fallbackGrave = await saveNewGrave({
        victim_text: victimText.trim(),
        time_of_death_hours: timeHours,
        cause_of_death: causeOfDeath,
        epitaph: 'Sent with hope; buried in silent indifference.',
        is_haunted: forceHaunted ? true : undefined
      });
      setGeneratedGrave(fallbackGrave);
      setBackendReady(true);
      onBuryComplete(fallbackGrave);
    }
  };

  const handleGriefComplete = () => {
    setShowGriefStages(false);
    setShowDust(false);
    setIsDimming(false);
  };

  const handleResetForAnother = () => {
    setGeneratedGrave(null);
    setBackendReady(false);
    setVictimText('');
    setTimeHours(48);
  };

  // If a certificate is ready, display it
  if (generatedGrave && !showGriefStages) {
    return (
      <DeathCertificate
        grave={generatedGrave}
        onGoToGraveyard={onGoToGraveyard}
        onBuryAnother={handleResetForAnother}
      />
    );
  }

  return (
    <section className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Screen Dimming Overlay */}
      {isDimming && (
        <div className="fixed inset-0 z-45 bg-black/75 transition-opacity duration-400 pointer-events-none" />
      )}

      {/* Dust Particles */}
      <DustParticles active={showDust} />

      {/* Grief Loading Stepper */}
      {showGriefStages && (
        <GriefLoadingSequence
          onComplete={handleGriefComplete}
          isReady={backendReady}
        />
      )}

      {/* Coroner Intake Container */}
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        {/* Top File Folder Tab */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-red-950/80 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest text-red-400 border border-red-800/60">
                FORM CR-404
              </span>
              <h2 className="font-gothic text-2xl font-bold tracking-wide text-zinc-100 sm:text-3xl">
                CORONER&apos;S INTAKE DESK
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400 font-mono">
              OFFICIAL INVESTIGATION INTO UNRETURNED DIGITAL DISPATCHES
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="mt-3 sm:mt-0 flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-mono text-zinc-500 mr-1">Load Preset:</span>
            {INTAKE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="rounded border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-300 hover:border-red-600/60 hover:text-white transition-colors whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Field 1: The Victim (Textarea) */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="victim-text" className="flex items-center space-x-1.5 text-sm font-semibold text-zinc-200">
                <span>The Victim</span>
                <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-zinc-400">
                  (Paste the deceased text message verbatim)
                </span>
              </label>

              {/* Dynamic Zone Allocation Badge */}
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono border transition-colors ${
                  isTrench
                    ? 'border-purple-800/80 bg-purple-950/60 text-purple-300'
                    : 'border-cyan-800/80 bg-cyan-950/60 text-cyan-300'
                }`}
              >
                Destined for: {zoneName} ({victimText.length} chars)
              </span>
            </div>

            <div className="relative mt-2">
              <textarea
                id="victim-text"
                rows={4}
                required
                value={victimText}
                onChange={(e) => setVictimText(e.target.value)}
                placeholder="e.g. 'Hey, had a great time last night! Let me know if you want to get tacos again this Thursday?'"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/90 p-3.5 font-tombstone text-base text-zinc-100 placeholder-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 leading-relaxed shadow-inner"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 font-mono">
              &gt; 200 characters qualifies as a paragraph and will be interned in the muddy Trench of Tragic Paragraphs.
            </p>
          </div>

          {/* Field 2: Suspected Cause of Death (Cards Selection) */}
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">
              Suspected Cause of Death
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(Object.values(CAUSES_OF_DEATH)).map((cause) => {
                const isSelected = causeOfDeath === cause.id;
                return (
                  <div
                    key={cause.id}
                    onClick={() => setCauseOfDeath(cause.id)}
                    className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {(() => { const CauseIcon = cause.icon; return <CauseIcon className="h-5 w-5 flex-shrink-0" />; })()}
                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-red-300' : 'text-zinc-200'}`}>
                          {cause.name}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {cause.tagline}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400 font-tombstone italic line-clamp-2">
                      &ldquo;{cause.flavor}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field 3: Time of Death (Hours/Days since read) */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="time-slider" className="flex items-center space-x-1.5 text-sm font-semibold text-zinc-200">
                <Clock className="h-4 w-4 text-red-400" />
                <span>Time of Death</span>
              </label>

              <span className="font-mono text-sm font-bold text-red-400">
                {timeHours >= 48
                  ? `${Math.round(timeHours / 24)} days (${timeHours} hours)`
                  : `${timeHours} hours`} ago
              </span>
            </div>

            <div className="mt-3">
              <input
                id="time-slider"
                type="range"
                min={1}
                max={720}
                step={1}
                value={timeHours}
                onChange={(e) => setTimeHours(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Quick time labels */}
            <div className="mt-2 flex justify-between text-[10px] font-mono text-zinc-500">
              <span onClick={() => setTimeHours(6)} className="cursor-pointer hover:text-zinc-300">Fresh (6h)</span>
              <span onClick={() => setTimeHours(24)} className="cursor-pointer hover:text-zinc-300">Rigor Mortis (24h)</span>
              <span onClick={() => setTimeHours(72)} className="cursor-pointer hover:text-zinc-300">Decomp (3d)</span>
              <span onClick={() => setTimeHours(336)} className="cursor-pointer hover:text-zinc-300">Fossilized (2w)</span>
              <span onClick={() => setTimeHours(720)} className="cursor-pointer hover:text-zinc-300">Ancient (1mo)</span>
            </div>
          </div>

          {/* Optional: Paranormal Testing Checkbox */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/30 px-3 py-2">
            <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={forceHaunted}
                onChange={(e) => setForceHaunted(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              />
              <span>Guarantee Paranormal Haunting (~15% natural probability)</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-400/80">👻 Enables Ouija Spirit</span>
          </div>

          {/* Burial Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!victimText.trim()}
              className="group relative flex w-full items-center justify-center space-x-3 rounded-lg bg-gradient-to-r from-red-800 via-red-700 to-red-800 py-4 font-gothic text-lg font-bold tracking-wider text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-xl transition-transform group-hover:rotate-12">⛏️</span>
              <span>BURY IN GRAVEYARD</span>
              <span className="text-xs font-mono font-normal opacity-70 ml-2 tracking-normal">
                (Initiate Autopsy & Closure)
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
