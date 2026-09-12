'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Ghost } from 'lucide-react';
import { sound } from '../lib/audio';

/**
 * JumpscareOverlay
 * Fixed full-viewport overlay for the fake jumpscare.
 * No camera / getUserMedia anywhere — purely visual + synthesized audio.
 *
 * Lifecycle (controlled by `active` prop):
 *   1. active → true  : fire sound immediately, begin 80 ms CSS fade-in
 *   2. After 900 ms   : begin 120 ms CSS fade-out
 *   3. After fade-out : call onDone() so parent can reset `active`
 *
 * CSS shake is applied via a keyframe class for the duration of the overlay.
 */
interface JumpscareOverlayProps {
  active: boolean;
  onDone: () => void;
}

export const JumpscareOverlay: React.FC<JumpscareOverlayProps> = ({ active, onDone }) => {
  // 'idle' | 'in' | 'hold' | 'out'
  const [phase, setPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (!active) {
      clearTimers();
      setPhase('idle');
      return;
    }

    // Fire audio immediately (respects mute internally)
    sound.playJumpscareSting();

    setPhase('in');

    // After fade-in (80 ms) → hold
    const t1 = setTimeout(() => setPhase('hold'), 80);
    // After hold (900 ms total from start) → fade out
    const t2 = setTimeout(() => setPhase('out'), 900);
    // After fade-out (120 ms) → signal done
    const t3 = setTimeout(() => {
      setPhase('idle');
      onDone();
    }, 1020);

    timersRef.current = [t1, t2, t3];
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (phase === 'idle') return null;

  const opacity =
    phase === 'in' ? '0' :     // starts transparent, CSS transition handles it
    phase === 'hold' ? '1' :
    '0';                        // fade-out

  const transitionDuration =
    phase === 'in'   ? '80ms'  :
    phase === 'hold' ? '0ms'   :
    '120ms';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(10,40,20,0.97) 0%, rgba(0,0,0,0.99) 100%)',
        opacity,
        transition: `opacity ${transitionDuration} linear`,
        pointerEvents: 'all',
      }}
    >
      {/* Screen-shake container — shake for the full 'in' + 'hold' phases */}
      <div
        className={(phase === 'in' || phase === 'hold') ? 'jumpscare-shake' : undefined}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
      >
        {/* Giant ghost icon with spectral glow */}
        <div
          style={{
            position: 'relative',
            filter: 'drop-shadow(0 0 40px rgba(52,211,153,0.9)) drop-shadow(0 0 80px rgba(52,211,153,0.5))',
          }}
        >
          <Ghost
            style={{ width: '14rem', height: '14rem', color: '#6ee7b7' }}
            strokeWidth={1.2}
          />
          {/* Inner pulsing eye-glow overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 42% 42%, rgba(52,211,153,0.35) 0%, transparent 55%)',
              borderRadius: '50%',
              animation: 'ghostPulse 0.15s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* Flavour text */}
        <p
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '1.1rem',
            letterSpacing: '0.25em',
            color: '#6ee7b7',
            textShadow: '0 0 20px rgba(52,211,153,0.8)',
            textTransform: 'uppercase',
            opacity: phase === 'hold' ? 1 : 0,
            transition: 'opacity 60ms linear',
            userSelect: 'none',
          }}
        >
          I&#39;M STILL HERE
        </p>
      </div>

      {/* Inline keyframes for shake + ghostPulse — no external CSS file needed */}
      <style>{`
        @keyframes jumpscareShake {
          0%   { transform: translate(0,  0)   rotate(0deg);   }
          10%  { transform: translate(-8px, -5px) rotate(-1deg); }
          20%  { transform: translate(7px,  6px)  rotate(1deg);  }
          30%  { transform: translate(-6px, 3px)  rotate(-0.5deg);}
          40%  { transform: translate(5px, -4px)  rotate(0.5deg); }
          50%  { transform: translate(-4px, 5px)  rotate(-1deg);  }
          60%  { transform: translate(6px, -3px)  rotate(1deg);   }
          70%  { transform: translate(-5px, 4px)  rotate(-0.5deg);}
          80%  { transform: translate(4px,  3px)  rotate(0.5deg); }
          90%  { transform: translate(-3px,-2px)  rotate(0deg);   }
          100% { transform: translate(0,   0)    rotate(0deg);   }
        }
        .jumpscare-shake {
          animation: jumpscareShake 0.12s linear infinite;
        }
        @keyframes ghostPulse {
          from { opacity: 0.6; }
          to   { opacity: 1.0; }
        }
      `}</style>
    </div>
  );
};
