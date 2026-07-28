import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { TIMEFRAMES } from './marketData';
import styles from './styles.module.css';

/*
 * Market Terminal.
 * Left: live price chart (candles refresh on a timer).
 * Right: live RSS news feed, which can be filtered to the selected ticker.
 */

const TICKERS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY'];

export default function Terminal() {
  const [ticker, setTicker] = useState(TICKERS[0]);
  const [timeframe, setTimeframe] = useState('5Min');
  const [source, setSource] = useState(null);

  return (
    <div className={styles.wrap}>
      <div className={styles.tickerBar}>
        <span className={styles.tickerLabel}>Ticker:</span>
        {TICKERS.map((t) => (
          <button
            key={t}
            className={`${styles.tickerBtn} ${t === ticker ? styles.tickerBtnActive : ''}`}
            onClick={() => setTicker(t)}
          >
            {t}
          </button>
        ))}

        <span className={styles.tfSpacer} />

        <span className={styles.tickerLabel}>Interval:</span>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.key}
            className={`${styles.tickerBtn} ${tf.key === timeframe ? styles.tickerBtnActive : ''}`}
            onClick={() => setTimeframe(tf.key)}
          >
            {tf.label}
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
              return <Chart ticker={ticker} timeframe={timeframe} onStatus={(s) => setSource(s.source)} />;
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

      <p className={styles.note}>
        Live candles refresh automatically while this tab is open; the news feed
        merges fresh headlines from ~22 RSS sources.
        {source === 'fallback' && ' Prices are currently coming from the public fallback source.'}
      </p>
    </div>
  );
}
