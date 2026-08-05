import React from 'react';
import styles from './charts.module.css';

/*
 * LeverageLadder — heat-map table showing how gross leverage interacts with
 * an underlying asset drawdown to produce the actual equity loss.
 *
 * Each cell = underlying_drop × leverage_multiple.
 * Cells where equity loss >= 100% are flagged deep red — "past wipe-out".
 * The actual Situational Awareness scenario (4×, ~30% drop) is outlined.
 *
 * Props:
 *   actualDrop  — the scenario drop % (negative), default -30
 *   actualLev   — the scenario leverage,           default 4
 */

const LEVELS = [1, 2, 3, 4];
const DROPS  = [-10, -15, -20, -25, -30, -33];

function equity(drop, lev) {
  const v = drop * lev;
  // show one decimal only if not a whole number
  return Number.isInteger(v) ? v : Math.round(v * 10) / 10;
}

export default function LeverageLadder({ actualDrop = -30, actualLev = 4 }) {
  return (
    <div className={styles.ladderWrap}>
      <table className={styles.ladder}>
        <thead>
          <tr>
            <th className={styles.ladderCornerCell}>
              Underlying<br />asset drop
            </th>
            {LEVELS.map(lev => (
              <th
                key={lev}
                className={`${styles.ladderHeadCell} ${lev === actualLev ? styles.ladderActualColHead : ''}`}
              >
                {lev}× leverage
                {lev === actualLev && (
                  <span className={styles.ladderActualBadge}>SA fund</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DROPS.map(drop => {
            const isActualRow = drop === actualDrop;
            return (
              <tr key={drop}>
                <td className={`${styles.ladderRowLabel} ${isActualRow ? styles.ladderActualRowLabel : ''}`}>
                  {drop}%
                  {isActualRow && <span className={styles.ladderActualBadge}>Jul 2026</span>}
                </td>
                {LEVELS.map(lev => {
                  const impact    = equity(drop, lev);
                  const isScen    = drop === actualDrop && lev === actualLev;
                  const isWipeout = impact <= -100;
                  const isBad     = impact <= -75 && !isWipeout;

                  let cellClass = styles.ladderCell;
                  if (isWipeout) cellClass += ` ${styles.ladderCrit}`;
                  else if (isBad) cellClass += ` ${styles.ladderWarn}`;
                  if (isScen)    cellClass += ` ${styles.ladderScen}`;

                  return (
                    <td key={lev} className={cellClass}>
                      {impact}%
                      {isWipeout && !isScen && (
                        <span className={styles.ladderWipeTag}>wipe-out</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={styles.ladderNote}>
        Cells in{' '}
        <strong style={{ color: 'var(--viz-crit)' }}>deep red</strong>{' '}
        represent equity losses ≥ 100% <em>before</em> hedges — mathematically worse than a
        complete wipe-out. The{' '}
        <strong style={{ color: 'var(--viz-crit)' }}>outlined cell</strong>{' '}
        is the Situational Awareness scenario: ~4× leverage on an underlying
        drawdown of roughly 30%, producing a ~120% hit to the fund's own
        capital before the short book clawed some back.
      </p>
    </div>
  );
}
