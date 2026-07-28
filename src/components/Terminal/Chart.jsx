import React, { useEffect, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { fetchBars, tfConfig, isCrypto, cryptoGran } from './marketData';
import { subscribeCryptoTicker } from './cryptoStream';
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

export default function Chart({ ticker, timeframe, onStatus }) {
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
          timeScale: {
            borderColor: 'rgba(127,127,127,0.2)',
            timeVisible: true,
            secondsVisible: false,
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
          if (isCrypto(ticker)) {
            // Live tick-by-tick stream: rebuild the forming candle on each trade.
            const gran = cryptoGran(timeframe);
            unsub = subscribeCryptoTicker(ticker, (t) => {
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
            });
          } else {
            const { pollMs } = tfConfig(timeframe);
            pollRef.current = setInterval(tick, pollMs);
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

  return (
    <div className={styles.chartArea} ref={areaRef}>
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
      <div ref={wrapRef} className={styles.chartWrap} />
    </div>
  );
}
