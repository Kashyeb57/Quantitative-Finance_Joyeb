import React from 'react';
import styles from './charts.module.css';

/*
 * RecoveryBars — illustrates the price bounce that happened the instant
 * Situational Awareness's forced selling was finished (Jul 30, 2026 intraday
 * and Aug 3 multi-day recovery from Jul-29 lows).
 *
 * Two groups of bars:
 *   group A  — same-day (Jul 30) intraday bounce from the block-trade low
 *   group B  — multi-day recovery by Aug 3 from the Jul-29 lows
 *
 * Props:
 *   rowsA  [{ label, pct }]  — same-day pops
 *   rowsB  [{ label, pct }]  — Aug 3 recoveries
 */

const W = 780;
const ROW_H = 52;
const PAD_L = 180;
const PAD_R = 100;
const TOP = 16;
const GROUP_GAP = 28; // extra vertical gap between the two groups

function BarGroup({ rows, offsetY, maxAbs, label, color }) {
  const innerW = W - PAD_L - PAD_R;
  return (
    <g>
      {/* group header */}
      <text
        x={PAD_L}
        y={offsetY - 6}
        className={styles.barNote}
        fill="var(--viz-muted)"
        fontWeight="700"
        fontSize="11"
        textTransform="uppercase"
        letterSpacing="0.04em"
      >
        {label}
      </text>
      {rows.map((r, i) => {
        const cy = offsetY + i * ROW_H + ROW_H / 2;
        const barW = (Math.abs(r.pct) / maxAbs) * innerW;
        const highlight = r.pct >= 35;
        const fill = highlight ? 'var(--viz-good)' : color;
        return (
          <g key={i}>
            <text x={PAD_L - 12} y={cy + 5} textAnchor="end" className={styles.barLabel}>
              {r.label}
            </text>
            {/* track */}
            <rect x={PAD_L} y={cy - 13} width={innerW} height="26" rx="4" fill="var(--viz-panel-bg)" />
            {/* value bar */}
            <rect x={PAD_L} y={cy - 13} width={barW} height="26" rx="4" fill={fill} opacity={highlight ? 1 : 0.82} />
            <text
              x={PAD_L + barW + 10}
              y={cy + 5}
              className={styles.barValue}
              fill={fill}
            >
              +{r.pct}%
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function RecoveryBars({ rowsA, rowsB }) {
  const allPcts = [...rowsA, ...rowsB].map(r => r.pct);
  const maxAbs = Math.max(...allPcts, 1);

  const heightA = rowsA.length * ROW_H;
  const heightB = rowsB.length * ROW_H;

  // vertical positions: top padding + group label space + rows
  const labelPad = 20;
  const offsetA = TOP + labelPad;
  const offsetB = offsetA + heightA + GROUP_GAP + labelPad;
  const totalH = offsetB + heightB + 16;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${totalH}`}
      role="img"
      aria-label="Stock price recovery after the Citadel block trade"
      preserveAspectRatio="xMidYMid meet"
    >
      <BarGroup
        rows={rowsA}
        offsetY={offsetA}
        maxAbs={maxAbs}
        label="Same-day bounce — Jul 30, by 3 p.m. (from block-trade low)"
        color="var(--viz-s2)"
      />
      <BarGroup
        rows={rowsB}
        offsetY={offsetB}
        maxAbs={maxAbs}
        label="Multi-day recovery by Aug 3 (from Jul-29 lows)"
        color="var(--viz-good)"
      />
    </svg>
  );
}
