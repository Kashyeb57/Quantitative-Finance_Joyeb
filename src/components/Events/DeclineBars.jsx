import React from 'react';
import styles from './charts.module.css';

/*
 * DeclineBars — horizontal bar chart for negative percentage moves.
 * Used to visualise the July 2026 drawdown in each of the fund's core
 * holdings versus benchmark / hedge names.
 *
 * Props:
 *   rows: [{ label, pct, note?, kind? }]
 *     pct  — negative number (e.g. -47)
 *     note — optional sub-label (position size, role in book)
 *     kind — 'long' | 'hedge' | 'index'   (controls bar colour)
 */

const W     = 780;
const ROW_H = 62;
const PAD_L = 220;
const PAD_R = 90;
const TOP   = 16;

const KIND_COLOR = {
  long:  'var(--viz-crit)',
  hedge: 'var(--viz-s3)',
  index: 'var(--viz-muted)',
};

export default function DeclineBars({ rows }) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.pct)), 1);
  const innerW = W - PAD_L - PAD_R;
  const H      = TOP + rows.length * ROW_H + 8;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="July 2026 stock drawdowns from June peak to July-29 lows"
      preserveAspectRatio="xMidYMid meet"
    >
      {rows.map((r, i) => {
        const cy    = TOP + i * ROW_H + ROW_H / 2;
        const barW  = (Math.abs(r.pct) / maxAbs) * innerW;
        const color = KIND_COLOR[r.kind ?? 'long'];
        const heavy = Math.abs(r.pct) >= maxAbs * 0.85;

        return (
          <g key={i}>
            {/* label + note */}
            <text
              x={PAD_L - 14}
              y={cy - (r.note ? 6 : 0)}
              textAnchor="end"
              className={styles.barLabel}
            >
              {r.label}
            </text>
            {r.note && (
              <text x={PAD_L - 14} y={cy + 11} textAnchor="end" className={styles.barNote}>
                {r.note}
              </text>
            )}

            {/* track */}
            <rect
              x={PAD_L} y={cy - 14}
              width={innerW} height="28"
              rx="4" fill="var(--viz-panel-bg)"
            />

            {/* value bar */}
            <rect
              x={PAD_L} y={cy - 14}
              width={barW} height="28"
              rx="4" fill={color} opacity={heavy ? 1 : 0.78}
            />

            {/* value label */}
            <text
              x={PAD_L + barW + 11}
              y={cy + 5}
              className={styles.barValue}
              fill={color}
            >
              {r.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
