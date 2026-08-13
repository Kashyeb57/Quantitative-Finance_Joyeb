import React from 'react';

/*
 * HandPlot — reusable hand-drawn function plot in the "handwritten notebook"
 * style: cream graph-paper, wobbly ink/pencil curves, handwriting labels.
 * Static illustration (SSR-safe; deterministic wobble, no Math.random).
 *
 * Props:
 *   title, xLabel='x', yLabel='y', caption, height=340
 *   domain=[xmin,xmax]              (required)
 *   range=[ymin,ymax]              (optional — auto-fit from curves)
 *   curves=[{ f:(x)=>y, color?, dash?, width?, label? }]
 *   points=[{ x, y, label?, color? }]
 *   marks=[{ x?|y?, label?, color? }]   // dashed guide line (asymptote, level)
 */

const COLORS = { ink: '#26323a', pencil: '#9aa7ad', blue: '#3f7cac', red: '#d1615b', green: '#3f8f6f', amber: '#c98a2b' };
const HAND = "'Kalam', 'Caveat', cursive";
const MARKER = "'Caveat', cursive";
const GRID = '#cfe0ec', PAPER = '#faf7ee';

function jit(i, k, seed, amp) {
  const s = Math.sin(i * 12.9898 + k * 78.233 + seed * 3.71) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 2 * amp;
}
function handSegments(segPts, seed, amp) {
  // segPts: array of segments, each an array of [x,y] SVG points
  return segPts.map((pts) => {
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      const x = pts[i][0] + jit(i, 1, seed, amp);
      const y = pts[i][1] + jit(i, 2, seed, amp);
      d += (i ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    return d;
  }).join(' ');
}

export default function HandPlot({
  title, xLabel = 'x', yLabel = 'y', caption,
  domain, range, curves = [], points = [], marks = [], height = 340,
}) {
  const [xmin, xmax] = domain;
  const N = 140;
  const xs = Array.from({ length: N + 1 }, (_, i) => xmin + (xmax - xmin) * (i / N));

  // evaluate curves once
  const evald = curves.map((c) => ({ ...c, ys: xs.map((x) => c.f(x)) }));

  // auto range
  let [ymin, ymax] = range || [Infinity, -Infinity];
  if (!range) {
    for (const c of evald) for (const y of c.ys) if (Number.isFinite(y)) { ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
    for (const p of points) { ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y); }
    if (!Number.isFinite(ymin) || ymin === ymax) { ymin = -1; ymax = 1; }
    const padY = (ymax - ymin) * 0.15 || 1;
    ymin -= padY; ymax += padY;
  }

  const W = 560, H = height, pad = 26;
  const sx = (x) => pad + ((x - xmin) / (xmax - xmin)) * (W - 2 * pad);
  const sy = (y) => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);

  // split each curve into on-screen segments (breaks at ±∞ / big jumps)
  const yLo = ymin - (ymax - ymin) * 0.5, yHi = ymax + (ymax - ymin) * 0.5;
  const segsOf = (ys) => {
    const segs = []; let cur = [];
    for (let i = 0; i <= N; i++) {
      const y = ys[i];
      const ok = Number.isFinite(y) && y >= yLo && y <= yHi;
      const jump = i > 0 && Number.isFinite(y) && Number.isFinite(ys[i - 1]) && Math.abs(y - ys[i - 1]) > (ymax - ymin) * 1.5;
      if (!ok || jump) { if (cur.length > 1) segs.push(cur); cur = ok ? [[sx(xs[i]), sy(y)]] : []; }
      else cur.push([sx(xs[i]), sy(y)]);
    }
    if (cur.length > 1) segs.push(cur);
    return segs;
  };

  const gridLines = [];
  for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++) gridLines.push(<line key={'v' + x} x1={sx(x)} y1={sy(ymin)} x2={sx(x)} y2={sy(ymax)} stroke={GRID} strokeWidth="1" />);
  for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++) gridLines.push(<line key={'h' + y} x1={sx(xmin)} y1={sy(y)} x2={sx(xmax)} y2={sy(y)} stroke={GRID} strokeWidth="1" />);

  const axisY0 = ymin <= 0 && ymax >= 0 ? 0 : ymin;
  const axisX0 = xmin <= 0 && xmax >= 0 ? 0 : xmin;

  return (
    <div style={{ background: PAPER, borderRadius: 14, padding: '0.9rem 1.05rem 1.05rem', margin: '1.25rem 0', boxShadow: '0 2px 14px rgba(0,0,0,0.28)', border: '1px solid #e7e0cf' }}>
      {title && <div style={{ fontFamily: MARKER, fontSize: '1.5rem', color: COLORS.ink, lineHeight: 1.1, marginBottom: '0.35rem' }}>{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: 620, margin: '0 auto' }} role="img" aria-label={title || 'hand-drawn plot'}>
        <line x1={pad + 10} y1="0" x2={pad + 10} y2={H} stroke={COLORS.red} strokeWidth="1" opacity="0.3" />
        {gridLines}
        {/* axes */}
        <path d={handSegments([[[sx(xmin), sy(axisY0)], [sx(xmax), sy(axisY0)]]], 5, 0.6)} fill="none" stroke={COLORS.ink} strokeWidth="1.6" />
        <path d={handSegments([[[sx(axisX0), sy(ymin)], [sx(axisX0), sy(ymax)]]], 6, 0.6)} fill="none" stroke={COLORS.ink} strokeWidth="1.6" />
        <text x={sx(xmax) - 4} y={sy(axisY0) - 7} fontFamily={HAND} fontSize="15" fill={COLORS.ink}>{xLabel}</text>
        <text x={sx(axisX0) + 8} y={sy(ymax) + 14} fontFamily={HAND} fontSize="15" fill={COLORS.ink}>{yLabel}</text>

        {/* marks (dashed guide lines) */}
        {marks.map((m, i) => m.x != null
          ? <g key={'m' + i}><line x1={sx(m.x)} y1={sy(ymin)} x2={sx(m.x)} y2={sy(ymax)} stroke={COLORS[m.color] || COLORS.pencil} strokeWidth="1.2" strokeDasharray="5 4" opacity="0.8" />{m.label && <text x={sx(m.x) + 4} y={sy(ymax) + 26} fontFamily={HAND} fontSize="13" fill={COLORS[m.color] || COLORS.pencil}>{m.label}</text>}</g>
          : <g key={'m' + i}><line x1={sx(xmin)} y1={sy(m.y)} x2={sx(xmax)} y2={sy(m.y)} stroke={COLORS[m.color] || COLORS.pencil} strokeWidth="1.2" strokeDasharray="5 4" opacity="0.8" />{m.label && <text x={sx(xmax) - 4} y={sy(m.y) - 5} textAnchor="end" fontFamily={HAND} fontSize="13" fill={COLORS[m.color] || COLORS.pencil}>{m.label}</text>}</g>
        )}

        {/* curves */}
        {evald.map((c, i) => {
          const col = COLORS[c.color] || COLORS.ink;
          const segs = segsOf(c.ys);
          const w = c.width || 2.6;
          if (c.dash) return <path key={'c' + i} d={handSegments(segs, 1 + i, 1.15)} fill="none" stroke={col} strokeWidth={w - 0.6} strokeLinecap="round" strokeDasharray="1 5" opacity="0.9" />;
          return <g key={'c' + i}>
            <path d={handSegments(segs, 2 + i, 1.15)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" opacity="0.5" />
            <path d={handSegments(segs, 12 + i, 0.9)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" opacity="0.85" />
          </g>;
        })}

        {/* points */}
        {points.map((p, i) => <g key={'p' + i}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r="5" fill={COLORS[p.color] || COLORS.red} />
          {p.label && <text x={sx(p.x) + 8} y={sy(p.y) - 6} fontFamily={HAND} fontSize="15" fill={COLORS[p.color] || COLORS.red}>{p.label}</text>}
        </g>)}

        {/* curve labels */}
        {evald.map((c, i) => c.label
          ? <text key={'l' + i} x={sx(xmax) - 6} y={pad + 16 + i * 20} textAnchor="end" fontFamily={HAND} fontSize="15" fill={COLORS[c.color] || COLORS.ink}>{c.label}</text>
          : null)}
      </svg>
      {caption && <div style={{ fontFamily: HAND, fontSize: '1rem', color: COLORS.ink, marginTop: '0.4rem', textAlign: 'center' }}>{caption}</div>}
    </div>
  );
}
