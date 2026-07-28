import React, { useEffect, useRef, useState } from 'react';
import { fetchSnapshot, marketStatus, fmtPrice, fmtVolume } from './marketData';
import styles from './styles.module.css';

/*
 * Live price header: last trade, day change, session high/low/volume and a
 * market open/closed badge. Refreshes every 10s while the tab is visible,
 * and flashes green/red briefly whenever the price moves.
 */

const REFRESH_MS = 10000;

export default function PriceHeader({ ticker }) {
  const [snap, setSnap] = useState(null);
  const [flash, setFlash] = useState(null);
  const [status, setStatus] = useState(marketStatus());
  const prevPrice = useRef(null);
  const flashTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    prevPrice.current = null;
    setSnap(null);

    async function pull() {
      if (document.visibilityState === 'hidden') return;
      const s = await fetchSnapshot(ticker);
      if (cancelled || !s) return;
      if (prevPrice.current != null && s.last != null && s.last !== prevPrice.current) {
        setFlash(s.last > prevPrice.current ? 'up' : 'down');
        clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(null), 700);
      }
      prevPrice.current = s.last;
      setSnap(s);
    }

    pull();
    const dataTimer = setInterval(pull, REFRESH_MS);
    const clockTimer = setInterval(() => setStatus(marketStatus()), 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') pull(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(dataTimer);
      clearInterval(clockTimer);
      clearTimeout(flashTimer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ticker]);

  const up = snap && snap.change != null && snap.change >= 0;
  const dirClass = !snap || snap.change == null ? '' : up ? styles.up : styles.down;
  const flashClass = flash === 'up' ? styles.flashUp : flash === 'down' ? styles.flashDown : '';

  return (
    <div className={styles.priceHeader}>
      <div className={styles.priceMain}>
        <span className={styles.priceSymbol}>{ticker}</span>
        <span className={`${styles.priceLast} ${dirClass} ${flashClass}`}>
          {snap ? fmtPrice(snap.last) : '—'}
        </span>
        {snap && snap.change != null && (
          <span className={`${styles.priceChange} ${dirClass}`}>
            {up ? '▲' : '▼'} {fmtPrice(Math.abs(snap.change))}
            {snap.changePct != null && ` (${up ? '+' : '−'}${Math.abs(snap.changePct).toFixed(2)}%)`}
          </span>
        )}
      </div>

      <div className={styles.priceStats}>
        {snap && snap.dayHigh != null && (
          <span className={styles.stat}>H <b>{fmtPrice(snap.dayHigh)}</b></span>
        )}
        {snap && snap.dayLow != null && (
          <span className={styles.stat}>L <b>{fmtPrice(snap.dayLow)}</b></span>
        )}
        {snap && snap.prevClose != null && (
          <span className={styles.stat}>PC <b>{fmtPrice(snap.prevClose)}</b></span>
        )}
        {snap && snap.volume != null && (
          <span className={styles.stat}>Vol <b>{fmtVolume(snap.volume)}</b></span>
        )}
        <span className={`${styles.marketBadge} ${styles['mkt_' + status.state]}`}>
          <span className={styles.marketDot} />
          {status.label}
        </span>
      </div>
    </div>
  );
}
