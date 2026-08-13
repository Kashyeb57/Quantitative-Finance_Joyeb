import React, { useState } from 'react';

/*
 * SecantTangent — the secant→tangent limit, made interactive.
 * Fix P = (a, f(a)); drag Q = (a+h, f(a+h)) toward P with the slider.
 * The secant slope (f(a+h)−f(a))/h converges to the tangent slope f'(a).
 * Pure SVG + state — no chart lib, SSR-safe. Dark-theme colours.
 */
export default function SecantTangent({
  a = 1,
  fExpr = 'x²',
  f = (x) => x * x,
  fPrime = (x) => 2 * x,
}) {
  const [h, setH] = useState(1.4);

  // math window
  const xmin = -0.4, xmax = 3.2, ymin = -0.6, ymax = 9.6;
  const W = 560, H = 380, pad = 34;
  const sx = (x) => pad + ((x - xmin) / (xmax - xmin)) * (W - 2 * pad);
  const sy = (y) => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);

  const b = a + h;
  const fa = f(a), fb = f(b);
  const secSlope = (fb - fa) / h;
  const tanSlope = fPrime(a);
  const close = Math.abs(secSlope - tanSlope) < 0.1;

  const G = '#25c2a0', AMBER = '#e0a44a', INK = '#e8e8ea', MUT = '#8a8a92';

  // curve
  let curve = '';
  for (let i = 0; i <= 140; i++) {
    const x = xmin + (xmax - xmin) * (i / 140);
    curve += (i ? ' L' : 'M') + sx(x).toFixed(1) + ',' + sy(f(x)).toFixed(1);
  }
  // line helpers (draw across the window)
  const lineAt = (slope) => {
    const y0 = fa + slope * (xmin - a), y1 = fa + slope * (xmax - a);
    return { x1: sx(xmin), y1: sy(y0), x2: sx(xmax), y2: sy(y1) };
  };
  const sec = lineAt(secSlope), tan = lineAt(tanSlope);

  return (
    <div style={{
      border: '1px solid var(--ifm-color-emphasis-300, #2a2a2e)', borderRadius: 12,
      background: 'var(--ifm-background-surface-color, #141416)', padding: '1rem 1.1rem 1.2rem',
      margin: '1.25rem 0',
    }}>
      <div style={{ fontFamily: 'var(--ifm-font-family-monospace)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUT, marginBottom: '0.6rem' }}>
        Secant → Tangent · f(x) = {fExpr}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: 640, margin: '0 auto' }} role="img"
        aria-label="Interactive secant line approaching the tangent line as Q approaches P">
        {/* axes */}
        <line x1={sx(xmin)} y1={sy(0)} x2={sx(xmax)} y2={sy(0)} stroke={MUT} strokeWidth="1" opacity="0.5" />
        <line x1={sx(0)} y1={sy(ymin)} x2={sx(0)} y2={sy(ymax)} stroke={MUT} strokeWidth="1" opacity="0.5" />
        <text x={sx(xmax) - 6} y={sy(0) - 6} fill={MUT} fontSize="11" textAnchor="end">x</text>

        {/* Δx / Δy guide */}
        <line x1={sx(a)} y1={sy(fa)} x2={sx(b)} y2={sy(fa)} stroke={MUT} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <line x1={sx(b)} y1={sy(fa)} x2={sx(b)} y2={sy(fb)} stroke={MUT} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <text x={sx((a + b) / 2)} y={sy(fa) + 14} fill={MUT} fontSize="11" textAnchor="middle">h = {h.toFixed(2)}</text>

        {/* tangent (target) */}
        <line x1={tan.x1} y1={tan.y1} x2={tan.x2} y2={tan.y2} stroke={G} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />
        {/* secant (live) */}
        <line x1={sec.x1} y1={sec.y1} x2={sec.x2} y2={sec.y2} stroke={AMBER} strokeWidth="2.2" />
        {/* curve */}
        <path d={curve} fill="none" stroke={INK} strokeWidth="2.4" />

        {/* points */}
        <circle cx={sx(b)} cy={sy(fb)} r="5.5" fill={AMBER} />
        <text x={sx(b) + 9} y={sy(fb) + 4} fill={AMBER} fontSize="12" fontWeight="700">Q</text>
        <circle cx={sx(a)} cy={sy(fa)} r="5.5" fill={G} />
        <text x={sx(a) - 9} y={sy(fa) + 16} fill={G} fontSize="12" fontWeight="700" textAnchor="end">P</text>
      </svg>

      <div style={{ marginTop: '0.7rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: INK }}>
          <span style={{ color: MUT, whiteSpace: 'nowrap' }}>Move Q → P</span>
          <input type="range" min="0.05" max="2" step="0.01" value={h}
            onChange={(e) => setH(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: G }} />
          <span style={{ fontFamily: 'var(--ifm-font-family-monospace)', color: MUT, whiteSpace: 'nowrap' }}>h = {h.toFixed(2)}</span>
        </label>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.4rem', marginTop: '0.7rem',
        fontFamily: 'var(--ifm-font-family-monospace)', fontSize: '0.86rem',
      }}>
        <span style={{ color: AMBER }}>
          secant slope = (f({b.toFixed(2)}) − f({a})) / {h.toFixed(2)} ={' '}
          <b style={{ color: close ? G : AMBER }}>{secSlope.toFixed(3)}</b>
        </span>
        <span style={{ color: G }}>tangent slope f′({a}) = {tanSlope.toFixed(3)}</span>
      </div>
      <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: close ? G : MUT }}>
        {close
          ? '✓ As h → 0 the secant becomes the tangent — that limit IS the derivative.'
          : 'Slide h toward 0 and watch the amber secant slope converge to the green tangent slope.'}
      </div>
    </div>
  );
}
