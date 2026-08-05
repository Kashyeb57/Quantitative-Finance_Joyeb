import React from 'react';
import styles from './charts.module.css';

/*
 * TimeSeriesChart — a zero-dependency, theme-aware SVG line/area chart for the
 * "Big Events" section. It draws a single trajectory that can change colour at a
 * peak (green on the way up, red on the way down) so a rise-and-collapse story
 * reads at a glance. Points carry an optional `tag` which is drawn as a labelled
 * marker with a date underneath.
 *
 *   data: [{ t, value, tag?, tagSide? }]   t = x position (any numeric scale)
 *   peakT:  x value where the line flips from "up/green" to "down/red"
 *   unit:   { prefix, suffix }  e.g. { prefix: '$', suffix: 'B' }
 *
 * All colours come from the site's --viz-* CSS variables so it matches every
 * other chart and follows light/dark mode automatically.
 */

const W = 780;
const H = 360;
const PAD = { top: 28, right: 20, bottom: 46, left: 58 };

function fmtMoney(v, unit) {
  const { prefix = '', suffix = '' } = unit || {};
  // Show sub-billion values as millions so "$225M" reads correctly on a $-billions axis.
  if (suffix === 'B' && v > 0 && v < 1) return `${prefix}${Math.round(v * 1000)}M`;
  const rounded = Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${prefix}${rounded}${suffix}`;
}

export default function TimeSeriesChart({
  data,
  peakT,
  unit = { prefix: '$', suffix: 'B' },
  yTicks = 5,
  ariaLabel = 'Time series chart',
}) {
  const ts = data.map((d) => d.t);
  const vs = data.map((d) => d.value);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const vMax = Math.max(...vs);
  const vMin = 0;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (t) => PAD.left + ((t - tMin) / (tMax - tMin || 1)) * innerW;
  const y = (v) => PAD.top + innerH - ((v - vMin) / (vMax - vMin || 1)) * innerH;

  const pts = data.map((d) => ({ ...d, cx: x(d.t), cy: y(d.value) }));

  // Split the path at the peak so the ascent and the collapse render in
  // different colours. We interpolate an exact point at peakT if needed.
  const upPts = [];
  const downPts = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (peakT == null || p.t <= peakT) upPts.push(p);
    if (peakT == null || p.t >= peakT) downPts.push(p);
  }

  const line = (arr) => arr.map((p, i) => `${i ? 'L' : 'M'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');
  const areaPath = (arr) => {
    if (!arr.length) return '';
    const top = line(arr);
    const x0 = arr[0].cx;
    const x1 = arr[arr.length - 1].cx;
    const base = PAD.top + innerH;
    return `${top} L${x1.toFixed(1)},${base} L${x0.toFixed(1)},${base} Z`;
  };

  // Y grid + labels
  const gridVals = [];
  for (let i = 0; i <= yTicks; i++) gridVals.push((vMax / yTicks) * i);

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="tsUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--viz-good)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--viz-good)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="tsDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--viz-crit)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--viz-crit)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Y grid lines + labels */}
      {gridVals.map((gv, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(gv)}
            y2={y(gv)}
            stroke="var(--viz-grid)"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 10}
            y={y(gv) + 4}
            textAnchor="end"
            className={styles.axisText}
          >
            {fmtMoney(gv, unit)}
          </text>
        </g>
      ))}

      {/* Area fills */}
      <path d={areaPath(upPts)} fill="url(#tsUp)" />
      <path d={areaPath(downPts)} fill="url(#tsDown)" />

      {/* Lines */}
      <path d={line(upPts)} fill="none" stroke="var(--viz-good)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={line(downPts)} fill="none" stroke="var(--viz-crit)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Annotated markers */}
      {pts.filter((p) => p.tag).map((p, i) => {
        const down = p.t >= (peakT ?? Infinity);
        const color = down ? 'var(--viz-crit)' : 'var(--viz-good)';
        const side = p.tagSide || (p.cx > W * 0.6 ? 'left' : 'right');
        const anchor = side === 'left' ? 'end' : 'start';
        const dx = side === 'left' ? -10 : 10;
        return (
          <g key={`m${i}`}>
            <circle cx={p.cx} cy={p.cy} r="4.5" fill={color} stroke="var(--viz-card-bg)" strokeWidth="1.5" />
            <text x={p.cx + dx} y={p.cy - 8} textAnchor={anchor} className={styles.tagText} fill={color}>
              {p.tag}
            </text>
            {p.sub && (
              <text x={p.cx + dx} y={p.cy + 8} textAnchor={anchor} className={styles.tagSub}>
                {p.sub}
              </text>
            )}
          </g>
        );
      })}

      {/* X axis labels (tagged points only) */}
      {pts.filter((p) => p.xLabel).map((p, i) => (
        <text key={`x${i}`} x={p.cx} y={H - PAD.bottom + 22} textAnchor="middle" className={styles.axisText}>
          {p.xLabel}
        </text>
      ))}

      {/* Axis baseline */}
      <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} stroke="var(--viz-axis)" strokeWidth="1.5" />
    </svg>
  );
}
