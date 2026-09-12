/**
 * GrainOverlay
 * Fixed full-viewport overlay providing two visual effects:
 *  1. Film grain — inline SVG feTurbulence noise at ~4% opacity.
 *  2. Vignette  — radial-gradient darkening toward the viewport edges at ~50% opacity.
 *
 * z-40 sits above page content but below all modals (z-50).
 * pointer-events-none ensures zero interactivity impact.
 */
export function GrainOverlay() {
  // Inline SVG data-URI for the noise filter — no external asset required.
  const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    >
      {/* Film grain layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: noiseSvg,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignette layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
