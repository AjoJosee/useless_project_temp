'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shovel } from 'lucide-react';
import { KUBLER_ROSS_STAGES } from '../lib/constants';
import { sound } from '../lib/audio';

interface GriefLoadingSequenceProps {
  onComplete: () => void;
  isReady: boolean;
}

export const GriefLoadingSequence: React.FC<GriefLoadingSequenceProps> = ({
  onComplete,
  isReady
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    // Play initial shovel dig
    sound.playShovelDig();

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < KUBLER_ROSS_STAGES.length - 1) {
          const next = prev + 1;
          // Play dirt dig sound on every other stage transition
          if (next % 2 === 1) {
            sound.playShovelDig();
          }
          return next;
        }
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  // When reached acceptance and backend is ready, complete sequence
  useEffect(() => {
    if (currentStep >= KUBLER_ROSS_STAGES.length - 1 && isReady) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, isReady, onComplete]);

  const currentStage = KUBLER_ROSS_STAGES[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md px-4 text-center"
    >
      <div className="relative max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl">
        {/* Decorative spade icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-red-900/60 bg-red-950/40 text-2xl shadow-inner">
          <motion.span
            animate={{ rotate: [0, -25, 25, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="inline-flex"
          >
            <Shovel className="h-6 w-6 text-red-400" />
          </motion.span>
        </div>

        {/* Stage Title with Animation */}
        <p className="font-mono text-xs uppercase tracking-widest text-red-400">
          Coroner Burial Protocol · Stage {currentStep + 1} of 5
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="my-4 min-h-[100px] flex flex-col justify-center"
          >
            <h3 className="font-gothic text-2xl font-bold tracking-wider text-zinc-100">
              {currentStage.stage}
            </h3>
            <p className="mt-2 text-sm italic font-tombstone text-zinc-300 text-base">
              &ldquo;{currentStage.subtitle}&rdquo;
            </p>
            <p className="mt-2 text-xs font-mono text-zinc-500">
              {currentStage.flavor}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 5-dot Stepper */}
        <div className="mt-6 flex justify-center space-x-2">
          {KUBLER_ROSS_STAGES.map((s, idx) => (
            <div
              key={s.stage}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : idx < currentStep
                  ? 'w-2.5 bg-red-900'
                  : 'w-2.5 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Sub text */}
        <p className="mt-6 text-[11px] font-mono text-zinc-600">
          Digging six feet into the server memory banks...
        </p>
      </div>
    </motion.div>
  );
};
