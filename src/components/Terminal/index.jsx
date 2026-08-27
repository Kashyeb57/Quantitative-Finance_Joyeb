import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { SECTIONS } from './tickers';
import styles from './styles.module.css';

/*
 * Market Terminal.
 * One "deck" panel holds two sections side by side — the live price chart and
 * the live RSS news feed — joined by a divider. Each section can be collapsed
 * to a slim rail (the chart stays mounted, so collapsing doesn't reload it) and
 * the other section expands to fill; at least one stays open.
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
  const [chartOpen, setChartOpen] = useState(true);
  const [newsOpen, setNewsOpen] = useState(true);

  // Keep at least one section open — you can't collapse the last one.
  const toggleChart = () => { if (chartOpen && !newsOpen) return; setChartOpen(!chartOpen); };
  const toggleNews = () => { if (newsOpen && !chartOpen) return; setNewsOpen(!newsOpen); };

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

      <div className={styles.deck}>
        <section className={`${styles.deckSection} ${styles.chartSection} ${chartOpen ? '' : styles.collapsed}`}>
          <button type="button" className={styles.deckHead} onClick={toggleChart} aria-expanded={chartOpen} title={chartOpen ? 'Collapse chart' : 'Expand chart'}>
            <span className={styles.deckTitle}>Chart</span>
            <span className={styles.collapseIcon} aria-hidden="true">{chartOpen ? '−' : '+'}</span>
          </button>
          <div className={styles.deckBody}>
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
          <button type="button" className={styles.rail} onClick={toggleChart} aria-label="Expand chart">
            <span className={styles.railChevron} aria-hidden="true">›</span>
            <span className={styles.railTitle}>Chart</span>
          </button>
        </section>

        <section className={`${styles.deckSection} ${styles.newsSection} ${newsOpen ? '' : styles.collapsed}`}>
          <button type="button" className={styles.deckHead} onClick={toggleNews} aria-expanded={newsOpen} title={newsOpen ? 'Collapse news' : 'Expand news'}>
            <span className={styles.deckTitle}>Market News <span className={styles.liveTag}>LIVE</span></span>
            <span className={styles.collapseIcon} aria-hidden="true">{newsOpen ? '−' : '+'}</span>
          </button>
          <div className={styles.deckBody}>
            <BrowserOnly fallback={<div className={styles.panelBody}><div className={styles.placeholder}>Loading news…</div></div>}>
              {() => {
                const News = require('./News').default;
                return <News ticker={ticker} />;
              }}
            </BrowserOnly>
          </div>
          <button type="button" className={styles.rail} onClick={toggleNews} aria-label="Expand news">
            <span className={styles.railChevron} aria-hidden="true">‹</span>
            <span className={styles.railTitle}>News</span>
          </button>
        </section>
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
