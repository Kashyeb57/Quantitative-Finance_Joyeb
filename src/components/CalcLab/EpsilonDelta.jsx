import React, { useState } from 'react';

/*
 * EpsilonDelta — the precise (ε–δ) definition of a limit, made visible.
 * Pick a tolerance ε around L; the lab finds a δ around a so that every x
 * within δ of a lands within ε of L. Shrink ε and watch δ shrink too.
 * Demo function f(x)=x² at a=1, L=1.  Pure SVG + state, SSR-safe.
 */
export default function EpsilonDelta() {
  const a = 1, L = 1;
  const f = (x) => x * x;
  const [eps, setEps] = useState(0.5);

  // largest symmetric δ so |x−a|<δ ⇒ |f(x)−L|<ε, for f=x² near 1
  const dRight = Math.sqrt(1 + eps) - 1;
  const dLeft = 1 - Math.sqrt(Math.max(0, 1 - eps));
  const delta = Math.min(dRight, dLeft);

  const xmin = 0, xmax = 2, ymin = 0, ymax = 4;
  const W = 560, H = 380, pad = 34;
  const sx = (x) => pad + ((x - xmin) / (xmax - xmin)) * (W - 2 * pad);
  const sy = (y) => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);

  const G = '#25c2a0', AMBER = '#e0a44a', INK = '#e8e8ea', MUT = '#8a8a92', BLUE = '#5b9bd5';

  let curve = '';
  for (let i = 0; i <= 140; i++) {
    const x = xmin + (xmax - xmin) * (i / 140);
    curve += (i ? ' L' : 'M') + sx(x).toFixed(1) + ',' + sy(f(x)).toFixed(1);
  }

  return (
    <div style={{
      border: '1px solid var(--ifm-color-emphasis-300, #2a2a2e)', borderRadius: 12,
      background: 'var(--ifm-background-surface-color, #141416)', padding: '1rem 1.1rem 1.2rem',
      margin: '1.25rem 0',
    }}>
      <div style={{ fontFamily: 'var(--ifm-font-family-monospace)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUT, marginBottom: '0.6rem' }}>
        The ε–δ definition · lim(x→1) x² = 1
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: 640, margin: '0 auto' }} role="img"
        aria-label="Epsilon band around L and the corresponding delta band around a">
        {/* ε band (horizontal) */}
        <rect x={sx(xmin)} y={sy(L + eps)} width={sx(xmax) - sx(xmin)} height={sy(L - eps) - sy(L + eps)}
          fill={AMBER} opacity="0.12" />
        <line x1={sx(xmin)} y1={sy(L + eps)} x2={sx(xmax)} y2={sy(L + eps)} stroke={AMBER} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
        <line x1={sx(xmin)} y1={sy(L - eps)} x2={sx(xmax)} y2={sy(L - eps)} stroke={AMBER} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
        <text x={sx(xmax) - 4} y={sy(L + eps) - 4} fill={AMBER} fontSize="11" textAnchor="end">L+ε</text>
        <text x={sx(xmax) - 4} y={sy(L - eps) + 12} fill={AMBER} fontSize="11" textAnchor="end">L−ε</text>

        {/* δ band (vertical) */}
        <rect x={sx(a - delta)} y={sy(ymax)} width={sx(a + delta) - sx(a - delta)} height={sy(ymin) - sy(ymax)}
          fill={G} opacity="0.12" />
        <line x1={sx(a - delta)} y1={sy(ymin)} x2={sx(a - delta)} y2={sy(ymax)} stroke={G} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
        <line x1={sx(a + delta)} y1={sy(ymin)} x2={sx(a + delta)} y2={sy(ymax)} stroke={G} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />

        {/* axes + L and a markers */}
        <line x1={sx(xmin)} y1={sy(0)} x2={sx(xmax)} y2={sy(0)} stroke={MUT} strokeWidth="1" opacity="0.5" />
        <line x1={sx(0)} y1={sy(ymin)} x2={sx(0)} y2={sy(ymax)} stroke={MUT} strokeWidth="1" opacity="0.5" />
        <line x1={sx(xmin)} y1={sy(L)} x2={sx(xmax)} y2={sy(L)} stroke={BLUE} strokeWidth="1" opacity="0.5" />
        <text x={sx(xmin) + 4} y={sy(L) - 4} fill={BLUE} fontSize="11">L = 1</text>
        <text x={sx(a)} y={sy(0) + 15} fill={G} fontSize="11" textAnchor="middle">a = 1</text>

        {/* curve + point */}
        <path d={curve} fill="none" stroke={INK} strokeWidth="2.4" />
        <circle cx={sx(a)} cy={sy(L)} r="4.5" fill={BLUE} />
      </svg>

      <div style={{ marginTop: '0.7rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: INK }}>
          <span style={{ color: AMBER, whiteSpace: 'nowrap' }}>tolerance ε</span>
          <input type="range" min="0.05" max="0.9" step="0.01" value={eps}
            onChange={(e) => setEps(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: AMBER }} />
          <span style={{ fontFamily: 'var(--ifm-font-family-monospace)', color: MUT, whiteSpace: 'nowrap' }}>ε = {eps.toFixed(2)}</span>
        </label>
      </div>

      <div style={{ marginTop: '0.6rem', fontFamily: 'var(--ifm-font-family-monospace)', fontSize: '0.86rem', color: INK }}>
        <span style={{ color: AMBER }}>ε = {eps.toFixed(2)}</span>
        {'  ⇒  choose  '}
        <span style={{ color: G }}>δ = {delta.toFixed(3)}</span>
        <span style={{ color: MUT }}>{'  →  |x−1| < δ  guarantees  |f(x)−1| < ε'}</span>
      </div>
      <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: MUT }}>
        Tighten ε (the amber band) and a smaller δ (the green band) is forced — but one always exists. That is exactly what “the limit is 1” means.
      </div>
    </div>
  );
}
