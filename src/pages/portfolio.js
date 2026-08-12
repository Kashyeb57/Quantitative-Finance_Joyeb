import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PageHeader from '@site/src/components/PageHeader';
import {fmtPrice} from '@site/src/components/Terminal/marketData';
import styles from './portfolio.module.css';

/*
 * Portfolio — a full read-only view of the Alpaca *paper* trading account:
 * capital over time, open positions, closed round-trips (realized P/L, FIFO),
 * and order history. Data comes from the market Worker's /_m/ledger endpoint,
 * which reads Alpaca server-side. No real money; nothing here places trades.
 */

const POLL_MS = 30000;

const money = (v) => (v == null || Number.isNaN(v) ? '—' : `$${fmtPrice(v)}`);
const signedMoney = (v) => (v == null || Number.isNaN(v) ? '—' : `${v >= 0 ? '+' : '−'}$${fmtPrice(Math.abs(v))}`);
const signedPct = (v) => (v == null || Number.isNaN(v) ? '' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}%`);
const dirCls = (v) => (v == null ? '' : v >= 0 ? styles.up : styles.down);

function fmtWhen(iso, withTime) {
  if (!iso) return '—';
  try {
    const o = {timeZone: 'America/Chicago', month: 'short', day: '2-digit'};
    if (withTime) { o.hour = '2-digit'; o.minute = '2-digit'; o.hour12 = false; }
    return new Intl.DateTimeFormat('en-US', o).format(new Date(iso)) + (withTime ? ' CT' : '');
  } catch (_) { return '—'; }
}

function EquityChart({points}) {
  if (!points || points.length < 2) {
    return <div className={styles.chartEmpty}>Your equity curve appears here once the account has a few days of history.</div>;
  }
  const W = 860, H = 240, PAD = {t: 16, r: 18, b: 8, l: 62};
  const vals = points.map((p) => p.value);
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  const span = (vmax - vmin) || Math.max(1, vmax * 0.01);
  const lo = vmin - span * 0.12, hi = vmax + span * 0.12;
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (i / (points.length - 1)) * iw;
  const y = (v) => PAD.t + ih - ((v - lo) / (hi - lo)) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(PAD.t + ih).toFixed(1)} L${PAD.l.toFixed(1)},${(PAD.t + ih).toFixed(1)} Z`;
  const up = points[points.length - 1].value >= points[0].value;
  const stroke = up ? 'var(--viz-good)' : 'var(--viz-crit)';
  const ticks = [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15];
  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Account equity over time">
      <defs>
        <linearGradient id="eqArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="1" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth="1" />
          <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className={styles.axis}>{`$${fmtPrice(t)}`}</text>
        </g>
      ))}
      <path d={area} fill="url(#eqArea)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

async function fetchLedger() {
  const res = await fetch('/_m/ledger', {cache: 'no-store'});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function Content() {
  const [state, setState] = useState({status: 'loading'});

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      if (document.visibilityState === 'hidden') return;
      try {
        const d = await fetchLedger();
        if (cancelled) return;
        if (d && d.account && !d.error) setState({status: 'ok', data: d});
        else setState((s) => (s.status === 'ok' ? s : {status: 'idle'}));
      } catch (_) {
        if (!cancelled) setState((s) => (s.status === 'ok' ? s : {status: 'idle'}));
      }
    }
    pull();
    const timer = setInterval(pull, POLL_MS);
    const onVis = () => { if (document.visibilityState === 'visible') pull(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelled = true; clearInterval(timer); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  if (state.status === 'loading') {
    return <p className={styles.msg}>Loading the trading account…</p>;
  }
  if (state.status === 'idle') {
    return (
      <div className={styles.notice}>
        <strong>The paper account isn’t reachable right now.</strong>
        <span>This page reads a live Alpaca paper account through the site’s market worker. If it stays blank, the worker or its keys need attention — no real money is ever involved.</span>
      </div>
    );
  }

  const {account: a, positions, orders, closed, realizedTotal, history, asOf} = state.data;
  const unrealTotal = positions.reduce((s, p) => s + (p.unrealizedPL || 0), 0);

  return (
    <>
      {/* Overview */}
      <section className={styles.section}>
        <div className={styles.statStrip}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Equity</div>
            <div className={styles.statVal}>{money(a.portfolioValue != null ? a.portfolioValue : a.equity)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Today</div>
            <div className={`${styles.statVal} ${dirCls(a.dayPL)}`}>{signedMoney(a.dayPL)} <span className={styles.sub}>{signedPct(a.dayPLpct)}</span></div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Realized P/L</div>
            <div className={`${styles.statVal} ${dirCls(realizedTotal)}`}>{signedMoney(realizedTotal)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Unrealized P/L</div>
            <div className={`${styles.statVal} ${dirCls(unrealTotal)}`}>{signedMoney(unrealTotal)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Cash</div>
            <div className={styles.statVal}>{money(a.cash)}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Buying power</div>
            <div className={styles.statVal}>{money(a.buyingPower)}</div>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Trading capital · equity curve</div>
          <EquityChart points={history} />
        </div>
      </section>

      {/* Open positions */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Open positions <span className={styles.count}>{positions.length}</span></h2>
        {positions.length === 0 ? (
          <p className={styles.empty}>No open positions right now.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Symbol</th><th className={styles.num}>Qty</th><th className={styles.num}>Avg entry</th><th className={styles.num}>Last</th><th className={styles.num}>Mkt value</th><th className={styles.num}>Unrealized P/L</th></tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.symbol}>
                    <td><span className={styles.sym}>{p.symbol}</span>{p.side === 'short' && <span className={styles.short}>SHORT</span>}</td>
                    <td className={styles.num}>{p.qty}</td>
                    <td className={styles.num}>{money(p.avgEntry)}</td>
                    <td className={styles.num}>{money(p.price)}</td>
                    <td className={styles.num}>{money(p.marketValue)}</td>
                    <td className={`${styles.num} ${dirCls(p.unrealizedPL)}`}>{signedMoney(p.unrealizedPL)} <span className={styles.sub}>{signedPct(p.unrealizedPLpct)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Closed positions (realized) */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Closed positions <span className={styles.count}>realized {signedMoney(realizedTotal)}</span></h2>
        {closed.length === 0 ? (
          <p className={styles.empty}>No closed round-trips yet. Once a position is fully exited, its realized profit or loss appears here.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Symbol</th><th>Side</th><th className={styles.num}>Qty</th><th className={styles.num}>Entry</th><th className={styles.num}>Exit</th><th className={styles.num}>Realized P/L</th><th className={styles.num}>Closed</th></tr>
              </thead>
              <tbody>
                {closed.map((c, i) => (
                  <tr key={i}>
                    <td><span className={styles.sym}>{c.symbol}</span></td>
                    <td><span className={c.side === 'short' ? styles.tagSell : styles.tagBuy}>{c.side}</span></td>
                    <td className={styles.num}>{+c.qty.toFixed(4)}</td>
                    <td className={styles.num}>{money(c.entry)}</td>
                    <td className={styles.num}>{money(c.exit)}</td>
                    <td className={`${styles.num} ${dirCls(c.pl)}`}>{signedMoney(c.pl)} <span className={styles.sub}>{signedPct(c.plpct)}</span></td>
                    <td className={styles.num}>{fmtWhen(c.closedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Order history */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Order history <span className={styles.count}>{orders.length}</span></h2>
        {orders.length === 0 ? (
          <p className={styles.empty}>No orders yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Time</th><th>Symbol</th><th>Side</th><th className={styles.num}>Qty</th><th>Type</th><th className={styles.num}>Fill price</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.slice(0, 50).map((o) => (
                  <tr key={o.id}>
                    <td className={styles.dim}>{fmtWhen(o.submittedAt, true)}</td>
                    <td><span className={styles.sym}>{o.symbol}</span></td>
                    <td><span className={o.side === 'buy' ? styles.tagBuy : styles.tagSell}>{o.side}</span></td>
                    <td className={styles.num}>{o.qty}</td>
                    <td className={styles.dim}>{o.type}</td>
                    <td className={styles.num}>{o.filledAvgPrice != null ? money(o.filledAvgPrice) : '—'}</td>
                    <td><span className={`${styles.status} ${styles['st_' + (o.status || '').replace(/[^a-z_]/gi, '')]}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className={styles.foot}>
        Read-only paper account via Alpaca · auto-refreshes every 30s
        {asOf && <> · updated {fmtWhen(asOf, true)}</>} · closed P/L is computed FIFO from fills ·
        {' '}watch the tape on the <Link to="/terminal">market terminal</Link>.
      </p>
    </>
  );
}

export default function PortfolioPage() {
  return (
    <Layout
      title="Portfolio"
      description="A live, read-only view of my Alpaca paper-trading account — capital over time, open positions, closed positions with realized P/L, and full order history.">
      <PageHeader
        eyebrow="Trading capital · Alpaca paper"
        title="Portfolio"
        subtitle="A live, read-only view of the paper-trading account — capital over time, open and closed positions, and the full order log. Play money; no real capital at risk."
      />
      <main className={`container ${styles.wrap}`}>
        <Content />
      </main>
    </Layout>
  );
}
