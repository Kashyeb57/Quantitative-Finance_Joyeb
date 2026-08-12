import React, { useEffect, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { fetchBars, tfConfig, isCrypto, cryptoGran, TIMEFRAMES, fmtPrice } from './marketData';
import { subscribeCryptoTicker } from './cryptoStream';
import { subscribeStockTrades } from './stockStream';
import styles from './styles.module.css';

/*
 * Live price chart.
 *
 * Rendered in-page with TradingView's open-source lightweight-charts library
 * (loaded from CDN, drawn into our own canvas). Candles refresh on a timer:
 * the newest bar is updated in place as it ticks, and completed bars are
 * appended — so the chart moves with the market instead of sitting still.
 */

const LIB = 'https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js';

let _libPromise = null;
function loadLib() {
  if (typeof window !== 'undefined' && window.LightweightCharts) {
    return Promise.resolve(window.LightweightCharts);
  }
  if (_libPromise) return _libPromise;
  _libPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = LIB;
    s.async = true;
    s.onload = () => resolve(window.LightweightCharts);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _libPromise;
}

// Seconds -> "m:ss" (or "h:mm:ss" for long intervals like 1D).
function fmtCountdown(s) {
  if (s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${m}:${p(sec)}`;
}

// Render chart times in US Central Time (America/Chicago), regardless of the
// viewer's locale. lightweight-charts is UTC by default and has no tz setting,
// so we format the axis ticks and the crosshair tooltip ourselves.
function ctToDate(t) {
  if (typeof t === 'number') return new Date(t * 1000);
  if (t && typeof t === 'object' && t.year) return new Date(Date.UTC(t.year, (t.month || 1) - 1, t.day || 1));
  return new Date();
}
function ctTickFormatter(time, tickMarkType) {
  const base = { timeZone: 'America/Chicago' };
  let opts;
  if (tickMarkType === 0) opts = { ...base, year: 'numeric' };
  else if (tickMarkType === 1) opts = { ...base, month: 'short' };
  else if (tickMarkType === 2) opts = { ...base, month: 'short', day: 'numeric' };
  else opts = { ...base, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  return new Intl.DateTimeFormat('en-US', opts).format(ctToDate(time));
}
function ctTimeFormatter(time) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(ctToDate(time));
}

export default function Chart({ ticker, timeframe, setTimeframe, onStatus }) {
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const lastBarRef = useRef(null);
  const pollRef = useRef(null);
  const areaRef = useRef(null);
  const { colorMode } = useColorMode();
  const [status, setStatus] = useState('loading');
  const [countdown, setCountdown] = useState('');
  const [cdTop, setCdTop] = useState(8);
  const [isFs, setIsFs] = useState(false);
  const [pos, setPos] = useState(null);   // open position in this ticker (or null)
  const [pl, setPl] = useState(null);      // live { value, pct } for that position
  const [plY, setPlY] = useState(null);    // y-pixel of the entry line (for the pill)
  const entryLineRef = useRef(null);

  const toggleFs = () => {
    const el = areaRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
    else el.requestFullscreen && el.requestFullscreen();
  };

  // Track fullscreen state + resize the chart to fill (or leave) the screen.
  useEffect(() => {
    const onFs = () => {
      setIsFs(document.fullscreenElement === areaRef.current);
      setTimeout(() => {
        if (chartRef.current && wrapRef.current && wrapRef.current.clientWidth) {
          chartRef.current.applyOptions({
            width: wrapRef.current.clientWidth,
            height: wrapRef.current.clientHeight || 460,
          });
        }
      }, 60);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  /* ---- create the chart once (and re-create on theme change) ---- */
  useEffect(() => {
    let disposed = false;
    let resizeObs = null;

    loadLib()
      .then((LC) => {
        if (disposed || !wrapRef.current) return;
        const dark = colorMode === 'dark';
        const el = wrapRef.current;
        el.innerHTML = '';

        const chart = LC.createChart(el, {
          width: el.clientWidth || 600,
          height: el.clientHeight || 460,
          layout: {
            background: { type: 'solid', color: 'transparent' },
            textColor: dark ? '#cbd5e1' : '#334155',
          },
          grid: {
            vertLines: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
            horzLines: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          },
          rightPriceScale: { borderColor: 'rgba(127,127,127,0.2)' },
          localization: { timeFormatter: ctTimeFormatter },
          timeScale: {
            borderColor: 'rgba(127,127,127,0.2)',
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: ctTickFormatter,
          },
          crosshair: { mode: 0 },
        });

        const series = chart.addCandlestickSeries({
          upColor: '#22c55e', downColor: '#ef4444',
          borderUpColor: '#22c55e', borderDownColor: '#ef4444',
          wickUpColor: '#22c55e', wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = series;

        resizeObs = new ResizeObserver(() => {
          if (chartRef.current && el.clientWidth) {
            chartRef.current.applyOptions({
              width: el.clientWidth,
              height: el.clientHeight || 460,
            });
          }
        });
        resizeObs.observe(el);
      })
      .catch(() => setStatus('error'));

    return () => {
      disposed = true;
      if (resizeObs) resizeObs.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode]);

  /* ---- load data + keep it live ---- */
  useEffect(() => {
    let cancelled = false;
    let unsub = null;
    lastBarRef.current = null;

    async function fullLoad() {
      setStatus('loading');
      const { bars, source } = await fetchBars(ticker, timeframe);
      if (cancelled || !seriesRef.current) return;
      if (!bars.length) {
        setStatus('error');
        if (onStatus) onStatus({ source: 'none' });
        return;
      }
      seriesRef.current.setData(bars);
      chartRef.current.timeScale().fitContent();
      lastBarRef.current = bars[bars.length - 1];
      setStatus('ok');
      if (onStatus) onStatus({ source });
    }

    // Incremental tick: only touch the newest bar(s), never redraw everything.
    async function tick() {
      if (document.visibilityState === 'hidden') return;
      const { bars, source } = await fetchBars(ticker, timeframe);
      if (cancelled || !seriesRef.current || !bars.length) return;
      const prev = lastBarRef.current;
      if (!prev) {
        seriesRef.current.setData(bars);
        lastBarRef.current = bars[bars.length - 1];
      } else {
        for (const b of bars) {
          if (b.time >= prev.time) seriesRef.current.update(b);
        }
        lastBarRef.current = bars[bars.length - 1];
      }
      setStatus('ok');
      if (onStatus) onStatus({ source });
    }

    // Wait for the chart instance, then load and start polling.
    const startTimer = setInterval(() => {
      if (seriesRef.current) {
        clearInterval(startTimer);
        fullLoad().then(() => {
          if (cancelled) return;
          const gran = cryptoGran(timeframe);
          // Rebuild the forming candle from one live trade (shared by crypto & stocks).
          const applyTrade = (t) => {
            if (cancelled || !seriesRef.current) return;
            const bucket = Math.floor(t.timeSec / gran) * gran;
            const prev = lastBarRef.current;
            let bar;
            if (prev && bucket === prev.time) {
              bar = { time: bucket, open: prev.open, high: Math.max(prev.high, t.price), low: Math.min(prev.low, t.price), close: t.price };
            } else if (!prev || bucket > prev.time) {
              bar = { time: bucket, open: t.price, high: t.price, low: t.price, close: t.price };
            } else {
              return; // out-of-order tick older than the current bar
            }
            seriesRef.current.update(bar);
            lastBarRef.current = bar;
            setStatus('ok');
            const y = seriesRef.current.priceToCoordinate(bar.close);
            if (y != null && !Number.isNaN(y)) setCdTop(y + 11);
          };

          if (isCrypto(ticker)) {
            unsub = subscribeCryptoTicker(ticker, applyTrade);
          } else {
            // Stocks: polling is the always-on baseline (works when closed, or if
            // the stream Worker isn't deployed); the WS adds tick-by-tick when open.
            const { pollMs } = tfConfig(timeframe);
            pollRef.current = setInterval(tick, pollMs);
            unsub = subscribeStockTrades(ticker, applyTrade);
          }
        });
      }
    }, 120);

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(startTimer);
      if (pollRef.current) clearInterval(pollRef.current);
      if (unsub) unsub();
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, timeframe, colorMode]);

  /* ---- countdown to the current candle's close (updates every second) ---- */
  useEffect(() => {
    const gran = cryptoGran(timeframe);
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      setCountdown(fmtCountdown(gran - (now % gran)));
      // pin the badge just under the live price label on the right axis
      const s = seriesRef.current;
      const lp = lastBarRef.current ? lastBarRef.current.close : null;
      if (s && lp != null) {
        const y = s.priceToCoordinate(lp);
        if (y != null && !Number.isNaN(y)) setCdTop(y + 11);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeframe]);

  /* ---- open-position overlay: is there a position in THIS ticker? ---- */
  useEffect(() => {
    let cancelled = false;
    setPos(null); setPl(null); setPlY(null);
    const sym = (ticker || '').toUpperCase();
    async function pull() {
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await fetch('/_m/portfolio', { cache: 'no-store' });
        if (!res.ok) return;
        const d = await res.json();
        if (cancelled || !d || !Array.isArray(d.positions)) return;
        setPos(d.positions.find((x) => (x.symbol || '').toUpperCase() === sym) || null);
      } catch (_) { /* overlay is optional — never break the chart */ }
    }
    pull();
    const id = setInterval(pull, 20000);
    const onVis = () => { if (document.visibilityState === 'visible') pull(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [ticker]);

  /* ---- draw the entry line + keep the live P/L in sync (TradingView-style) ---- */
  useEffect(() => {
    const removeLine = () => {
      if (entryLineRef.current && seriesRef.current) {
        try { seriesRef.current.removePriceLine(entryLineRef.current); } catch (_) {}
      }
      entryLineRef.current = null;
    };
    removeLine();
    if (!pos || pos.avgEntry == null) { setPl(null); setPlY(null); return undefined; }

    const signedQty = pos.side === 'short' ? -Math.abs(pos.qty) : Math.abs(pos.qty);
    const cost = Math.abs(pos.avgEntry * pos.qty);

    const update = () => {
      const s = seriesRef.current;
      if (!s) return;
      if (!entryLineRef.current) {
        try {
          entryLineRef.current = s.createPriceLine({
            price: pos.avgEntry,
            color: '#3b82f6',
            lineWidth: 1,
            lineStyle: 2, // dashed
            axisLabelVisible: true,
            title: `${pos.side === 'short' ? 'SHORT' : 'LONG'} ${pos.qty}`,
          });
        } catch (_) {}
      }
      const last = lastBarRef.current ? lastBarRef.current.close : null;
      if (last != null) {
        const value = (last - pos.avgEntry) * signedQty;
        setPl({ value, pct: cost ? (value / cost) * 100 : null });
      }
      const y = s.priceToCoordinate(pos.avgEntry);
      setPlY(y != null && !Number.isNaN(y) && y >= 0 ? y : null);
    };
    update();
    const id = setInterval(update, 1000);
    return () => { clearInterval(id); removeLine(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  return (
    <div className={styles.chartArea} ref={areaRef}>
      <div className={styles.chartToolbar}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.key}
            className={`${styles.tfBtn} ${tf.key === timeframe ? styles.tfBtnActive : ''}`}
            onClick={() => setTimeframe && setTimeframe(tf.key)}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <button
        className={styles.fsBtn}
        onClick={toggleFs}
        title={isFs ? 'Exit full screen (Esc)' : 'Full-screen chart'}
        aria-label={isFs ? 'Exit full screen' : 'Full-screen chart'}
      >
        {isFs ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
      </button>
      {status !== 'ok' && (
        <div className={styles.chartMsg}>
          {status === 'error'
            ? 'Could not load price data — retrying on the next tick.'
            : 'Loading chart…'}
        </div>
      )}
      {status === 'ok' && countdown && (
        <div
          className={styles.candleCountdown}
          style={{ top: cdTop }}
          title="Time until the current candle closes"
        >
          <span className={styles.cdDot} />
          {countdown}
        </div>
      )}
      {status === 'ok' && pos && pl && plY != null && (
        <div
          className={styles.posPill}
          style={{ top: plY }}
          title={`${pos.side === 'short' ? 'Short' : 'Long'} ${pos.qty} ${pos.symbol} @ ${fmtPrice(pos.avgEntry)}`}
        >
          <span className={styles.posMeta}>{pos.side === 'short' ? 'SHORT' : 'LONG'} {pos.qty}</span>
          <span className={pl.value >= 0 ? styles.up : styles.down}>
            {pl.value >= 0 ? '+' : '−'}${fmtPrice(Math.abs(pl.value))}
            {pl.pct != null && ` (${pl.value >= 0 ? '+' : '−'}${Math.abs(pl.pct).toFixed(2)}%)`}
          </span>
        </div>
      )}
      <div ref={wrapRef} className={styles.chartWrap} />
    </div>
  );
}
