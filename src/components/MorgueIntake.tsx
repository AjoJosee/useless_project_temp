'use client';

import React, { useState } from 'react';
import { Grave } from '../types';
import { INTAKE_PRESETS } from '../lib/constants';
import { generateEpitaph } from '../lib/llm';
import { saveNewGrave } from '../lib/storage';
import { DustParticles } from './DustParticles';
import { GriefLoadingSequence } from './GriefLoadingSequence';
import { DeathCertificate } from './DeathCertificate';
import { Clock } from 'lucide-react';
import { sound } from '../lib/audio';

interface MorgueIntakeProps {
  onBuryComplete: (grave: Grave) => void;
  onGoToGraveyard: () => void;
}

const GHOSTED_BY_OPTIONS = [
  'Crush',
  'Coworker',
  'Friend',
  'Mom',
  'Dad',
  'Bro',
  'Sis',
  'Other'
];

export const MorgueIntake: React.FC<MorgueIntakeProps> = ({
  onBuryComplete,
  onGoToGraveyard
}) => {
  const [victimText, setVictimText] = useState('');
  const [timeHours, setTimeHours] = useState<number>(48);
  const [ghostedBySelect, setGhostedBySelect] = useState<string>('');
  const [ghostedByOther, setGhostedByOther] = useState<string>('');
  const [forceHaunted, setForceHaunted] = useState<boolean>(false);

  // States for burial sequence
  const [isDimming, setIsDimming] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [showGriefStages, setShowGriefStages] = useState(false);
  const [generatedGrave, setGeneratedGrave] = useState<Grave | null>(null);
  const [backendReady, setBackendReady] = useState(false);

  const effectiveGhostedBy = ghostedBySelect === 'Other' ? ghostedByOther.trim() : ghostedBySelect;

  const handleApplyPreset = (preset: typeof INTAKE_PRESETS[0]) => {
    setVictimText(preset.text);
    setTimeHours(preset.hours);
    if ('ghosted_by' in preset && typeof preset.ghosted_by === 'string') {
      setGhostedBySelect(preset.ghosted_by);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimText.trim()) return;

    // Sequence Step 1: Screen dims
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
        cause_of_death: 'ghosting',
        time_of_death_hours: timeHours,
        ghosted_by: effectiveGhostedBy || undefined
      });

      const newGrave = await saveNewGrave({
        victim_text: victimText.trim(),
        time_of_death_hours: timeHours,
        cause_of_death: 'ghosting',
        epitaph,
        is_haunted: forceHaunted ? true : undefined,
        ghosted_by: effectiveGhostedBy || undefined
      });

      setGeneratedGrave(newGrave);
      setBackendReady(true);
      onBuryComplete(newGrave);
    } catch (err) {
      console.error('Failed burial processing:', err);
      const fallbackGrave = await saveNewGrave({
        victim_text: victimText.trim(),
        time_of_death_hours: timeHours,
        cause_of_death: 'ghosting',
        epitaph: 'Sent with hope; buried in silent indifference.',
        is_haunted: forceHaunted ? true : undefined,
        ghosted_by: effectiveGhostedBy || undefined
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
    setGhostedBySelect('');
    setGhostedByOther('');
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
    <section className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6">
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

      {/* Clean Intake Card */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-red-950/80 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest text-red-400 border border-red-800/60">
                RIP
              </span>
              <h2 className="font-gothic text-2xl font-bold tracking-wide text-zinc-100 sm:text-3xl">
                Bury a Ghosted Text
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Give your unread messages a proper resting place.
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="mt-3 sm:mt-0 flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {INTAKE_PRESETS.slice(0, 3).map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="rounded border border-zinc-800 bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-300 hover:border-red-600/60 hover:text-white transition-colors whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Message Textarea */}
          <div>
            <label htmlFor="victim-text" className="block text-sm font-medium text-zinc-200 mb-1.5">
              The message that got ghosted
            </label>
            <textarea
              id="victim-text"
              rows={4}
              required
              value={victimText}
              onChange={(e) => setVictimText(e.target.value)}
              placeholder="Paste the message you sent that was left to die on read..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/90 p-3.5 font-sans text-sm sm:text-base text-zinc-100 placeholder-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 leading-relaxed shadow-inner"
            />
          </div>

          {/* New Optional Field: Who ghosted you? */}
          <div>
            <label htmlFor="ghosted-by-select" className="block text-sm font-medium text-zinc-200 mb-1.5">
              Who ghosted you? <span className="text-zinc-500 font-normal text-xs">(Optional)</span>
            </label>
            <select
              id="ghosted-by-select"
              value={ghostedBySelect}
              onChange={(e) => setGhostedBySelect(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-200 focus:border-red-600 focus:outline-none"
            >
              <option value="">Select someone...</option>
              {GHOSTED_BY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {/* Free text input if Other is picked */}
            {ghostedBySelect === 'Other' && (
              <input
                type="text"
                placeholder="e.g. Hinge match, Landlord, My personal trainer..."
                value={ghostedByOther}
                onChange={(e) => setGhostedByOther(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-red-600 focus:outline-none"
              />
            )}
          </div>

          {/* Time of Death (Hours/Days since read - kept as-is) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="time-slider" className="flex items-center space-x-1.5 text-sm font-medium text-zinc-200">
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

          {/* Simplified Vague Tempt Fate Checkbox */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/30 px-3.5 py-2.5">
            <label className="flex items-center space-x-2.5 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={forceHaunted}
                onChange={(e) => setForceHaunted(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
              />
              <span>Tempt fate?</span>
            </label>
          </div>

          {/* Clean Bury Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!victimText.trim()}
              className="group relative flex w-full items-center justify-center space-x-2 rounded-xl bg-red-700 hover:bg-red-600 py-3.5 font-gothic text-base font-bold tracking-wider text-white shadow-lg shadow-red-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>⛏️</span>
              <span>Bury Text</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
