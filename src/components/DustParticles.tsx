'use client';

import React, { useEffect, useRef } from 'react';

interface DustParticlesProps {
  active: boolean;
}

export const DustParticles: React.FC<DustParticlesProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Create 120 dirt, ash and soil particles
    const particles = Array.from({ length: 140 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height * 0.5, // Start above
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 4 + 2, // Falling downward
      size: Math.random() * 5 + 1.5,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.1,
      color: [
        'rgba(80, 60, 45, 0.85)',   // Moist cemetery soil
        'rgba(110, 95, 80, 0.75)',  // Graveyard silt
        'rgba(45, 35, 30, 0.9)',    // Dark clay
        'rgba(160, 150, 140, 0.65)', // Tombstone granite dust
        'rgba(190, 40, 40, 0.4)'    // Flecks of red wax
      ][Math.floor(Math.random() * 5)],
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
};
