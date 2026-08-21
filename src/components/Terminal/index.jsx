import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { SECTIONS } from './tickers';
import styles from './styles.module.css';

/*
 * Market Terminal.
 * Left: live price chart (candles refresh on a timer, every timeframe).
 * Right: live RSS news feed, which can be filtered to the selected ticker.
 *
 * Tickers are grouped into sectors (mirrors the Robinhood watchlists +
 * the space / neocloud themes). Pick a sector tab → its symbols appear;
 * pick a symbol → the chart + news follow it. Every symbol supports every
 * timeframe offered by the chart (1m · 3m · 5m · 15m · 1H · 1D).
 */

const tickerLabel = (t) => (t === 'BTC-USD' ? '₿ BTC' : t);
const sectionOf = (t) => (SECTIONS.find((s) => s.tickers.includes(t)) || SECTIONS[0]).name;

export default function Terminal() {
  const [ticker, setTicker] = useState('AMD');
  const [section, setSection] = useState(() => sectionOf('AMD'));
  const [timeframe, setTimeframe] = useState('5Min');
  const [source, setSource] = useState(null);

  const active = SECTIONS.find((s) => s.name === section) || SECTIONS[0];

  return (
    <div className={styles.wrap}>
      <div className={styles.sectionBar}>
        {SECTIONS.map((s) => (
          <button
            key={s.name}
            className={`${styles.sectionBtn} ${s.name === section ? styles.sectionBtnActive : ''}`}
            onClick={() => setSection(s.name)}
          >
            {s.name}
            <span className={styles.sectionCount}>{s.tickers.length}</span>
          </button>
        ))}
      </div>

      <div className={styles.tickerBar}>
        <span className={styles.tickerLabel}>{active.name}:</span>
        {active.tickers.map((t) => (
          <button
            key={t}
            className={`${styles.tickerBtn} ${t === ticker ? styles.tickerBtnActive : ''}`}
            onClick={() => setTicker(t)}
          >
            {tickerLabel(t)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <BrowserOnly fallback={<div className={styles.panelBody}><div className={styles.placeholder}>Loading price…</div></div>}>
            {() => {
              const PriceHeader = require('./PriceHeader').default;
              return <PriceHeader ticker={ticker} />;
            }}
          </BrowserOnly>

          <BrowserOnly fallback={<div className={styles.panelBody}><div className={styles.placeholder}>Loading chart…</div></div>}>
            {() => {
              const Chart = require('./Chart').default;
              return <Chart ticker={ticker} timeframe={timeframe} setTimeframe={setTimeframe} onStatus={(s) => setSource(s.source)} />;
            }}
          </BrowserOnly>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span>Market News</span>
            <span className={styles.panelTicker}>LIVE</span>
          </div>
          <BrowserOnly fallback={<div className={styles.panelBody}><div className={styles.placeholder}>Loading news…</div></div>}>
            {() => {
              const News = require('./News').default;
              return <News ticker={ticker} />;
            }}
          </BrowserOnly>
        </div>
      </div>

      <BrowserOnly fallback={<div className={styles.portfolio}><div className={styles.pfEmpty}>Loading portfolio…</div></div>}>
        {() => {
          const Portfolio = require('./Portfolio').default;
          return <Portfolio />;
        }}
      </BrowserOnly>

      <p className={styles.note}>
        Symbols are grouped by sector — pick a sector, then a symbol; every
        symbol supports all timeframes. Live candles refresh automatically while
        this tab is open; the news feed merges fresh headlines from ~22 RSS
        sources. Chart times are shown in Central Time (CT).
        {source === 'fallback' && ' Prices are currently coming from the public fallback source.'}
      </p>
    </div>
  );
}
