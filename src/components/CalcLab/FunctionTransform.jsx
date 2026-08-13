import React, { useState } from 'react';

/*
 * FunctionTransform — handwritten-notebook style interactive.
 * A hand-drawn base curve f(x) with sliders/toggles for every transformation:
 * vertical & horizontal shift, vertical stretch, reflect over x- and y-axis.
 * Pure SVG + state, SSR-safe (deterministic "hand" wobble — no Math.random,
 * so no hydration mismatch). Cream graph-paper + Caveat/Kalam handwriting.
 */

// deterministic pseudo-jitter so the "hand-drawn" wobble is stable across renders
function jit(i, k, seed, amp) {
  const s = Math.sin(i * 12.9898 + k * 78.233 + seed * 3.71) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 2 * amp;
}
// build a slightly wobbly path from SVG-space points
function handPath(pts, seed, amp = 1.1) {
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const x = pts[i][0] + jit(i, 1, seed, amp);
    const y = pts[i][1] + jit(i, 2, seed, amp);
    d += (i ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }
  return d;
}

const HAND = "'Kalam', 'Caveat', cursive";
const MARKER = "'Caveat', cursive";
const INK = '#26323a', PENCIL = '#9aa7ad', GRID = '#cfe0ec', PAPER = '#faf7ee';
const RED = '#d1615b', BLUE = '#3f7cac';

export default function FunctionTransform() {
  const [c, setC] = useState(0);      // vertical shift
  const [d, setD] = useState(0);      // horizontal shift (right +)
  const [k, setK] = useState(1);      // vertical stretch
  const [rx, setRx] = useState(false); // reflect over x-axis
  const [ry, setRy] = useState(false); // reflect over y-axis

  const f = (x) => 3 * Math.exp(-Math.pow(x - 1.3, 2) / 1.6); // asymmetric "hill"
  const g = (x) => c + k * (rx ? -1 : 1) * f((ry ? -1 : 1) * (x - d));

  const xmin = -6, xmax = 6, ymin = -6, ymax = 6;
  const W = 560, H = 420, pad = 26;
  const sx = (x) => pad + ((x - xmin) / (xmax - xmin)) * (W - 2 * pad);
  const sy = (y) => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);

  const sample = (fn) => {
    const p = [];
    for (let i = 0; i <= 120; i++) {
      const x = xmin + (xmax - xmin) * (i / 120);
      const y = fn(x);
      if (y >= ymin - 1 && y <= ymax + 1) p.push([sx(x), sy(y)]);
    }
    return p;
  };
  const fPts = sample(f), gPts = sample(g);

  // live equation, written the way you'd jot it
  const eqInner = `${ry ? '−' : ''}(x${d ? (d > 0 ? ` − ${d}` : ` + ${-d}`) : ''})`;
  const eq = `y = ${rx ? '−' : ''}${k !== 1 ? `${k}·` : ''}f(${eqInner})${c ? (c > 0 ? ` + ${c}` : ` − ${-c}`) : ''}`;

  const gridLines = [];
  for (let x = xmin; x <= xmax; x++) gridLines.push(<line key={'v' + x} x1={sx(x)} y1={sy(ymin)} x2={sx(x)} y2={sy(ymax)} stroke={GRID} strokeWidth={x === 0 ? 0 : 1} />);
  for (let y = ymin; y <= ymax; y++) gridLines.push(<line key={'h' + y} x1={sx(xmin)} y1={sy(y)} x2={sx(xmax)} y2={sy(y)} stroke={GRID} strokeWidth={y === 0 ? 0 : 1} />);

  const Toggle = ({ on, set, label }) => (
    <button onClick={() => set(!on)} style={{
      fontFamily: HAND, fontSize: '1rem', padding: '0.15rem 0.7rem', borderRadius: 10,
      border: `1.5px solid ${on ? INK : PENCIL}`, cursor: 'pointer',
      background: on ? INK : 'transparent', color: on ? PAPER : INK,
    }}>{label}</button>
  );
  const Slider = ({ val, set, min, max, step, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: HAND, fontSize: '1rem', color: INK }}>
      <span style={{ minWidth: 78 }}>{label} = {val}</span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => set(parseFloat(e.target.value))} style={{ flex: 1, accentColor: RED }} />
    </label>
  );

  return (
    <div style={{
      background: PAPER, borderRadius: 14, padding: '1rem 1.1rem 1.2rem', margin: '1.25rem 0',
      boxShadow: '0 2px 14px rgba(0,0,0,0.28)', border: '1px solid #e7e0cf',
    }}>
      <div style={{ fontFamily: MARKER, fontSize: '1.7rem', color: INK, lineHeight: 1, marginBottom: '0.2rem' }}>
        Function Transformations
      </div>
      <div style={{ fontFamily: HAND, fontSize: '1.05rem', color: BLUE, marginBottom: '0.5rem' }}>{eq}</div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: 620, margin: '0 auto' }}
        role="img" aria-label="Hand-drawn graph of a function and its live transformation">
        {/* red ruled margin, like notebook paper */}
        <line x1={pad + 10} y1="0" x2={pad + 10} y2={H} stroke={RED} strokeWidth="1" opacity="0.35" />
        {gridLines}
        {/* axes (hand-drawn, bolder) */}
        <path d={handPath([[sx(xmin), sy(0)], [sx(xmax), sy(0)]], 5, 0.6)} fill="none" stroke={INK} strokeWidth="1.6" />
        <path d={handPath([[sx(0), sy(ymin)], [sx(0), sy(ymax)]], 6, 0.6)} fill="none" stroke={INK} strokeWidth="1.6" />
        <text x={sx(xmax) - 4} y={sy(0) - 8} fontFamily={HAND} fontSize="16" fill={INK}>x</text>
        <text x={sx(0) + 8} y={sy(ymax) + 14} fontFamily={HAND} fontSize="16" fill={INK}>y</text>

        {/* original f(x) — pencil */}
        <path d={handPath(fPts, 1, 1.2)} fill="none" stroke={PENCIL} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" opacity="0.9" />
        {/* transformed g(x) — ink, double stroke for a sketchy feel */}
        <path d={handPath(gPts, 2, 1.2)} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
        <path d={handPath(gPts, 3, 1.0)} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />

        <text x={sx(xmax) - 6} y={sy(ymax) + 20} fontFamily={HAND} fontSize="15" fill={PENCIL} textAnchor="end">· · · original f(x)</text>
        <text x={sx(xmax) - 6} y={sy(ymax) + 40} fontFamily={HAND} fontSize="15" fill={INK} textAnchor="end">— transformed</text>
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.35rem 1.4rem', marginTop: '0.7rem' }}>
        <Slider val={c} set={setC} min={-4} max={4} step={1} label="c ↑↓" />
        <Slider val={d} set={setD} min={-4} max={4} step={1} label="shift x" />
        <Slider val={k} set={setK} min={0.2} max={3} step={0.1} label="k ·f" />
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
        <Toggle on={rx} set={setRx} label="reflect x-axis  −f(x)" />
        <Toggle on={ry} set={setRy} label="reflect y-axis  f(−x)" />
      </div>

      {/* preserved legend, in handwriting */}
      <div style={{ marginTop: '0.9rem', paddingTop: '0.7rem', borderTop: `1px dashed ${PENCIL}`, fontFamily: HAND, fontSize: '1.02rem', color: INK, lineHeight: 1.7 }}>
        <b style={{ fontFamily: MARKER, fontSize: '1.25rem' }}>The rules —</b><br />
        y + c → shift <b>up</b> &nbsp;·&nbsp; y − c → shift <b>down</b> &nbsp;·&nbsp; y = −f(x) → reflect over <b>x-axis</b> &nbsp;·&nbsp; y = f(−x) → reflect over <b>y-axis</b> &nbsp;·&nbsp; y = f(x−c) → shift <b>right</b> &nbsp;·&nbsp; y = f(x+c) → shift <b>left</b> &nbsp;·&nbsp; y = k·f(x) → <b>vertical stretch</b>
      </div>
    </div>
  );
}
