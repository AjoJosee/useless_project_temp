'use client';

import React, { useEffect, useRef } from 'react';

/**
 * AmbientFog
 * Continuous looping canvas-based fog effect for the graveyard feed background.
 * Modelled on DustParticles.tsx but tuned for ambient ambience rather than a burial burst:
 *  - Fewer particles (28), larger, very translucent soft blur circles.
 *  - Very slow horizontal drift with a gentle vertical wobble — no falling.
 *  - Infinite loop: particles wrap around from right edge back to left.
 *
 * Render this as a z-0 background layer inside the graveyard section container,
 * NOT globally (DustParticles handles the burial-specific burst at z-50).
 */
export const AmbientFog: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 400);

    const resize = () => {
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 400;
    };
    window.addEventListener('resize', resize);

    // 28 large, near-invisible fog blobs
    const particles = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 120 + 60,       // 60–180 px blur circles
      vx: (Math.random() * 0.25 + 0.05),      // slow rightward drift 0.05–0.30 px/frame
      vy: (Math.random() - 0.5) * 0.08,       // tiny vertical wobble
      opacity: Math.random() * 0.07 + 0.03,   // 0.03–0.10 — very translucent
      // Hue drifts slowly; start anywhere in grey/blue-grey range
      hue: Math.random() * 30 + 195,          // 195–225 (grey-blue)
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap horizontally so the fog is truly continuous
        if (p.x - p.radius > width) p.x = -p.radius;

        // Soft circular gradient (radial blur simulation)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `hsla(${p.hue}, 20%, 85%, ${p.opacity})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 10%, 75%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
};
