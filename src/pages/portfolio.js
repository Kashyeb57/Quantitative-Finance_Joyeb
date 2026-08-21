import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PageHeader from '@site/src/components/PageHeader';
import {fmtPrice} from '@site/src/components/Terminal/marketData';
import styles from './portfolio.module.css';

/*
 * Portfolio — a full read-only view of the Alpaca *paper* trading account:
 * capital over time, the analyst's read on it (returns, win rate, exposure),
 * open positions with allocation weight, closed FIFO round-trips, and the
 * order ledger. Data comes from the market Worker's /_m/ledger endpoint, which
 * reads Alpaca server-side. No real money; nothing here places trades.
 *
 * Design note: this page leads with ONE number (equity) and the equity curve,
 * then an editorial performance read, then the receipts — deliberately built
 * with hierarchy rather than an even grid of raw API fields.
 */

const POLL_MS = 30000;

const money = (v) => (v == null || Number.isNaN(v) ? '—' : `$${fmtPrice(v)}`);
const signedMoney = (v) => (v == null || Number.isNaN(v) ? '—' : `${v >= 0 ? '+' : '−'}$${fmtPrice(Math.abs(v))}`);
const signedPct = (v) => (v == null || Number.isNaN(v) ? '' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}%`);
const pctWhole = (v) => (v == null || Number.isNaN(v) ? '—' : `${v.toFixed(0)}%`);
const dirCls = (v) => (v == null ? '' : v >= 0 ? styles.up : styles.down);

// Order/closed timestamps arrive as ISO strings.
function fmtWhen(iso, withTime) {
  if (!iso) return '—';
  try {
    const o = {timeZone: 'America/Chicago', month: 'short', day: '2-digit'};
    if (withTime) { o.hour = '2-digit'; o.minute = '2-digit'; o.hour12 = false; }
    return new Intl.DateTimeFormat('en-US', o).format(new Date(iso)) + (withTime ? ' CT' : '');
  } catch (_) { return '—'; }
}

// Equity-curve timestamps come from Alpaca portfolio history as epoch *seconds*
// (a bare number), not ISO — so convert before formatting. Guard covers the
// off chance the upstream ever hands back milliseconds instead.
function fmtDay(t) {
  if (t == null) return '';
  const ms = typeof t === 'number' ? (t < 1e12 ? t * 1000 : t) : Date.parse(t);
  if (Number.isNaN(ms)) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', month: 'short', day: '2-digit'}).format(new Date(ms));
  } catch (_) { return ''; }
}

/* The centerpiece: a hoverable equity curve with a window-start baseline and a
 * mono readout chip that tracks the cursor (defaults to the latest point). */
function EquityChart({points}) {
  const [hov, setHov] = useState(null);
  const ref = useRef(null);

  if (!points || points.length < 2) {
    return <div className={styles.chartEmpty}>The equity curve fills in once the account has a few days of history.</div>;
  }

  const W = 900, H = 280;
  const PAD = {t: 22, r: 20, b: 26, l: 66};
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const vals = points.map((p) => p.value);
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  const span = (vmax - vmin) || Math.max(1, vmax * 0.01);
  const lo = vmin - span * 0.14, hiV = vmax + span * 0.14;
  const x = (i) => PAD.l + (i / (points.length - 1)) * iw;
  const y = (v) => PAD.t + ih - ((v - lo) / (hiV - lo)) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(PAD.t + ih).toFixed(1)} L${PAD.l.toFixed(1)},${(PAD.t + ih).toFixed(1)} Z`;

  const start = points[0].value;
  const last = points[points.length - 1].value;
  const up = last >= start;
  const stroke = up ? 'var(--g-500)' : 'var(--amber-500)';
  const ticks = [lo + (hiV - lo) * 0.18, (lo + hiV) / 2, hiV - (hiV - lo) * 0.18];

  const sel = hov == null ? points.length - 1 : hov;
  const sx = x(sel), sy = y(points[sel].value);
  const chipW = 150, chipH = 44;
  const chipX = Math.max(PAD.l, Math.min(W - PAD.r - chipW, sx - chipW / 2));

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    let i = Math.round(((vx - PAD.l) / iw) * (points.length - 1));
    i = Math.max(0, Math.min(points.length - 1, i));
    setHov(i);
  };

  return (
    <svg
      ref={ref}
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Account equity over time"
      onMouseMove={onMove}
      onMouseLeave={() => setHov(null)}>
      <defs>
        <linearGradient id="eqArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.20" />
          <stop offset="1" stopColor={stroke} stopOpacity="0.015" />
        </linearGradient>
      </defs>

      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--line-faint)" strokeWidth="1" />
          <text x={PAD.l - 10} y={y(t) + 4} textAnchor="end" className={styles.axis}>{`$${fmtPrice(t)}`}</text>
        </g>
      ))}

      {/* window-start baseline — the reference the run is measured against */}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(start)} y2={y(start)} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 4" />
      <text x={W - PAD.r} y={y(start) - 6} textAnchor="end" className={styles.axisFaint}>{`start $${fmtPrice(start)}`}</text>

      <path d={area} fill="url(#eqArea)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      <text x={PAD.l} y={H - 7} textAnchor="start" className={styles.axisFaint}>{fmtDay(points[0].t)}</text>
      <text x={W - PAD.r} y={H - 7} textAnchor="end" className={styles.axisFaint}>{fmtDay(points[points.length - 1].t)}</text>

      {/* cursor crosshair + marker + readout */}
      <line x1={sx} x2={sx} y1={PAD.t} y2={PAD.t + ih} stroke="var(--line-strong)" strokeWidth="1" />
      <circle cx={sx} cy={sy} r="4" fill="var(--bg-base)" stroke={stroke} strokeWidth="2" />
      <g transform={`translate(${chipX.toFixed(1)},${PAD.t - 2})`}>
        <rect width={chipW} height={chipH} rx="6" fill="var(--overlay)" stroke="var(--line)" />
        <text x="11" y="19" className={styles.chipVal}>{`$${fmtPrice(points[sel].value)}`}</text>
        <text x="11" y="35" className={styles.chipDate}>{fmtDay(points[sel].t)}{sel === points.length - 1 ? ' · now' : ''}</text>
      </g>
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
    return (
      <p className={styles.loading}>
        <span className="p-pip" aria-hidden="true" />
        Reading the paper account…
      </p>
    );
  }
  if (state.status === 'idle') {
    return (
      <div className={styles.notice}>
        <div className={styles.noticeTag}>account offline</div>
        <strong>The paper account isn’t reachable right now.</strong>
        <span>This page reads a live Alpaca paper account through the site’s market worker. If it stays blank, the worker or its keys need attention — no real money is ever involved. Meanwhile you can still <Link to="/terminal">watch the tape on the terminal</Link>.</span>
      </div>
    );
  }

  const {account: a, positions, orders, closed, realizedTotal, history, asOf} = state.data;

  const equity = a.portfolioValue != null ? a.portfolioValue : a.equity;
  const unrealTotal = positions.reduce((s, p) => s + (p.unrealizedPL || 0), 0);
  const invested = positions.reduce((s, p) => s + Math.abs(p.marketValue || 0), 0);
  const exposure = equity ? (invested / equity) * 100 : null;

  const startEq = history && history.length ? history[0].value : null;
  const periodPL = (equity != null && startEq != null) ? equity - startEq : null;
  const periodPct = (periodPL != null && startEq) ? (periodPL / startEq) * 100 : null;

  const wins = closed.filter((c) => c.pl > 0);
  const losses = closed.filter((c) => c.pl < 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : null;
  const mean = (arr) => (arr.length ? arr.reduce((s, c) => s + c.pl, 0) / arr.length : null);
  const avgWin = mean(wins);
  const avgLoss = mean(losses);

  const metrics = [
    {label: 'Realized P/L', value: signedMoney(realizedTotal), tone: dirCls(realizedTotal)},
    {label: 'Unrealized P/L', value: signedMoney(unrealTotal), tone: dirCls(unrealTotal)},
    {label: 'Round-trips', value: closed.length ? String(closed.length) : '—', sub: closed.length ? `${wins.length}W · ${losses.length}L` : null},
    {label: 'Win rate', value: winRate != null ? pctWhole(winRate) : '—', tone: winRate != null && winRate >= 50 ? styles.up : ''},
    {label: 'Avg win', value: avgWin != null ? signedMoney(avgWin) : '—', tone: avgWin != null ? styles.up : ''},
    {label: 'Avg loss', value: avgLoss != null ? signedMoney(avgLoss) : '—', tone: avgLoss != null ? styles.down : ''},
  ];

  return (
    <>
      {/* ── Hero: the account, stated once ─────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroTag}>
            <span className="p-pip" aria-hidden="true" />
            Account equity · Alpaca paper
          </div>
          <div className={styles.heroEquity}>{money(equity)}</div>
          <div className={styles.heroDeltas}>
            <span className={`${styles.delta} ${dirCls(a.dayPL)}`}>
              {signedMoney(a.dayPL)} <i>{signedPct(a.dayPLpct)}</i> <em>today</em>
            </span>
            {periodPL != null && (
              <span className={`${styles.delta} ${dirCls(periodPL)}`}>
                {signedMoney(periodPL)} <i>{signedPct(periodPct)}</i> <em>since {fmtDay(history[0].t)}</em>
              </span>
            )}
          </div>
          <dl className={styles.rail}>
            <div><dt>Cash</dt><dd>{money(a.cash)}</dd></div>
            <div><dt>Buying power</dt><dd>{money(a.buyingPower)}</dd></div>
            <div><dt>Invested</dt><dd>{pctWhole(exposure)}</dd></div>
            <div><dt>Positions</dt><dd>{positions.length}</dd></div>
          </dl>
        </div>
        <div className={styles.heroChart}>
          <div className={styles.chartHead}>
            <span className={styles.chartTitle}>Equity curve</span>
            {history && history.length > 1 && (
              <span className={styles.chartRange}>{fmtDay(history[0].t)} – {fmtDay(history[history.length - 1].t)}</span>
            )}
          </div>
          <EquityChart points={history} />
        </div>
      </section>

      {/* ── Performance: the analyst's read ────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Performance <span className={styles.count}>the read</span></h2>
        <dl className={styles.metrics}>
          {metrics.map((m, i) => (
            <div key={i} className={styles.metric}>
              <dt className={styles.metricLabel}>{m.label}</dt>
              <dd className={`${styles.metricVal} ${m.tone || ''}`}>
                {m.value}{m.sub && <span className={styles.sub}> {m.sub}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Open positions, with allocation weight ─────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Open positions <span className={styles.count}>{positions.length}</span></h2>
        {positions.length === 0 ? (
          <p className={styles.empty}>No open positions right now.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className={styles.num}>Qty</th>
                  <th className={styles.num}>Avg entry</th>
                  <th className={styles.num}>Last</th>
                  <th className={styles.num}>Mkt value</th>
                  <th className={styles.wtHead}>Weight</th>
                  <th className={styles.num}>Unrealized P/L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const w = invested ? (Math.abs(p.marketValue || 0) / invested) * 100 : 0;
                  return (
                    <tr key={p.symbol}>
                      <td><span className={styles.sym}>{p.symbol}</span>{p.side === 'short' && <span className={styles.short}>SHORT</span>}</td>
                      <td className={styles.num}>{p.qty}</td>
                      <td className={styles.num}>{money(p.avgEntry)}</td>
                      <td className={styles.num}>{money(p.price)}</td>
                      <td className={styles.num}>{money(p.marketValue)}</td>
                      <td className={styles.wtCell}>
                        <span className={styles.wtBar}>
                          <span className={`${styles.wtFill} ${p.side === 'short' ? styles.wtShort : ''}`} style={{width: `${Math.max(2, w).toFixed(1)}%`}} />
                        </span>
                        <span className={styles.wtPct}>{w.toFixed(0)}%</span>
                      </td>
                      <td className={`${styles.num} ${dirCls(p.unrealizedPL)}`}>{signedMoney(p.unrealizedPL)} <span className={styles.sub}>{signedPct(p.unrealizedPLpct)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Closed round-trips (realized, FIFO) ────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Closed round-trips <span className={`${styles.count} ${dirCls(realizedTotal)}`}>realized {signedMoney(realizedTotal)}</span></h2>
        {closed.length === 0 ? (
          <p className={styles.empty}>No closed round-trips yet. Once a position is fully exited, its realized profit or loss appears here.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th className={styles.num}>Qty</th>
                  <th className={styles.num}>Entry</th>
                  <th className={styles.num}>Exit</th>
                  <th className={styles.num}>Realized P/L</th>
                  <th className={styles.num}>Closed</th>
                </tr>
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
                    <td className={`${styles.num} ${styles.dim}`}>{fmtWhen(c.closedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Order ledger (the receipts) ────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Order ledger <span className={styles.count}>{orders.length}</span></h2>
        {orders.length === 0 ? (
          <p className={styles.empty}>No orders yet.</p>
        ) : (
          <div className={`${styles.tableWrap} ${styles.ledger}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th className={styles.num}>Qty</th>
                  <th>Type</th>
                  <th className={styles.num}>Fill price</th>
                  <th>Status</th>
                </tr>
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
        subtitle="A live, read-only view of the paper-trading account — capital over time, the performance read, open and closed positions, and the full order log. Play money; no real capital at risk."
      />
      <main className={`container ${styles.wrap}`}>
        <Content />
      </main>
    </Layout>
  );
}
