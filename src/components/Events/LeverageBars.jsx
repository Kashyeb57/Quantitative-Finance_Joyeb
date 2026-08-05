import React from 'react';
import styles from './charts.module.css';

/*
 * LeverageBars — a tiny SVG illustration of how leverage turns a moderate move
 * in the underlying basket into a fund-killing loss on equity. Purely
 * illustrative (the numbers are labelled as approximate), it exists to make the
 * mechanism obvious at a glance: a ~17% drop at ~4x leverage ≈ a ~67% loss.
 *
 *   rows: [{ label, pct, note? }]   pct is negative for a loss
 */

const W = 780;
const ROW_H = 62;
const PAD_L = 210;
const PAD_R = 90;
const TOP = 16;

export default function LeverageBars({ rows }) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.pct)), 1);
  const innerW = W - PAD_L - PAD_R;
  const H = TOP + rows.length * ROW_H + 8;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="How leverage amplified the loss"
      preserveAspectRatio="xMidYMid meet"
    >
      {rows.map((r, i) => {
        const cy = TOP + i * ROW_H + ROW_H / 2;
        const barW = (Math.abs(r.pct) / maxAbs) * innerW;
        const strong = Math.abs(r.pct) >= maxAbs * 0.9;
        const fill = strong ? 'var(--viz-crit)' : 'var(--viz-s4)';
        return (
          <g key={i}>
            <text x={PAD_L - 16} y={cy - 4} textAnchor="end" className={styles.barLabel}>
              {r.label}
            </text>
            {r.note && (
              <text x={PAD_L - 16} y={cy + 14} textAnchor="end" className={styles.barNote}>
                {r.note}
              </text>
            )}
            <rect x={PAD_L} y={cy - 15} width={innerW} height="30" rx="5" fill="var(--viz-panel-bg)" />
            <rect x={PAD_L} y={cy - 15} width={barW} height="30" rx="5" fill={fill} opacity={strong ? 1 : 0.85} />
            <text x={PAD_L + barW + 12} y={cy + 5} className={styles.barValue} fill={fill}>
              {r.pct > 0 ? '+' : '−'}{Math.abs(r.pct)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
