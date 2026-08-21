import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PageHeader from '@site/src/components/PageHeader';
import {fmtPrice} from '@site/src/components/Terminal/marketData';
import styles from './portfolio.module.css';

/*
 * Portfolio — "Command Deck": a Robinhood-grade read of the Alpaca *paper*
 * account, plus the analytics Robinhood never ships. The equity value is the
 * hero; SCRUBBING the equity line re-renders that hero value + day-change to
 * the point under the cursor. Below it: a segmented allocation bar, a six-stat
 * performance read, and holdings as a data-forward list. Read-only; no trades.
 *
 * Data source: the market Worker's /_m/ledger (reads Alpaca server-side).
 * Range pills (1D/1W/…) are a deliberate fast-follow — they need a Worker
 * endpoint that returns other windows; this v1 renders the 3-month history the
 * ledger already provides.
 */

const POLL_MS = 30000;

const money = (v) => (v == null || Number.isNaN(v) ? '—' : `$${fmtPrice(v)}`);
const signedMoney = (v) => (v == null || Number.isNaN(v) ? '—' : `${v >= 0 ? '+' : '−'}$${fmtPrice(Math.abs(v))}`);
const signedPct = (v) => (v == null || Number.isNaN(v) ? '' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}%`);
const pctWhole = (v) => (v == null || Number.isNaN(v) ? '—' : `${v.toFixed(0)}%`);

// Zero is NEUTRAL — a flat/dead account must not glow green. null → neutral too.
const dirCls = (v) => (v == null || v === 0 ? '' : v > 0 ? styles.up : styles.down);
const caret = (v) => (v == null || v === 0 ? '' : v > 0 ? '▲' : '▾');

// Order/closed timestamps are ISO strings.
function fmtWhen(iso, withTime) {
  if (!iso) return '—';
  try {
    const o = {timeZone: 'America/Chicago', month: 'short', day: '2-digit'};
    if (withTime) { o.hour = '2-digit'; o.minute = '2-digit'; o.hour12 = false; }
    return new Intl.DateTimeFormat('en-US', o).format(new Date(iso)) + (withTime ? ' CT' : '');
  } catch (_) { return '—'; }
}

// Equity-curve timestamps are Alpaca epoch *seconds* (guard covers ms too).
function fmtDay(t) {
  if (t == null) return '';
  const ms = typeof t === 'number' ? (t < 1e12 ? t * 1000 : t) : Date.parse(t);
  if (Number.isNaN(ms)) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', month: 'short', day: '2-digit'}).format(new Date(ms));
  } catch (_) { return ''; }
}

/* The signature line: full-bleed, no axes/grid, a dashed open-baseline, and a
 * scrub that drives the hero above it. Controlled — the parent owns the scrub
 * index so the hero and the chart read from one source of truth. The paths live
 * in a stretched (aspect-none) SVG for responsive height; the markers are HTML
 * overlays positioned by percent, so dots stay round instead of squashing. */
function EquityChart({points, scrubIdx, onScrub}) {
  const ref = useRef(null);

  if (!points || points.length < 2) {
    return <div className={styles.chartFlat}>Flat line — no open risk. The curve comes alive once the account has a few days of activity.</div>;
  }

  const W = 900, H = 260, PAD = {t: 16, r: 8, b: 16, l: 8};
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const vals = points.map((p) => p.value);
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  const span = (vmax - vmin) || Math.max(1, vmax * 0.01);
  const lo = vmin - span * 0.16, hiV = vmax + span * 0.16;
  const x = (i) => PAD.l + (i / (points.length - 1)) * iw;
  const y = (v) => PAD.t + ih - ((v - lo) / (hiV - lo)) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(PAD.t + ih).toFixed(1)} L${PAD.l.toFixed(1)},${(PAD.t + ih).toFixed(1)} Z`;

  const start = points[0].value;
  const last = points[points.length - 1].value;
  const up = last >= start;
  const stroke = up ? 'var(--g-500)' : 'var(--amber-500)';

  const sel = scrubIdx == null ? points.length - 1 : scrubIdx;
  const sx = x(sel), sy = y(points[sel].value);
  const pctX = (px) => `${(px / W) * 100}%`;
  const pctY = (py) => `${(py / H) * 100}%`;
  const labelLeft = Math.max(9, Math.min(91, (sx / W) * 100));

  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
    const vx = ((cx - r.left) / r.width) * W;
    let i = Math.round(((vx - PAD.l) / iw) * (points.length - 1));
    i = Math.max(0, Math.min(points.length - 1, i));
    onScrub(i);
  };

  return (
    <div
      ref={ref}
      className={styles.chartBox}
      onMouseMove={move}
      onMouseLeave={() => onScrub(null)}
      onTouchStart={move}
      onTouchMove={move}
      onTouchEnd={() => onScrub(null)}>
      <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Account equity over time">
        <defs>
          <linearGradient id="eqArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="1" stopColor={stroke} stopOpacity="0.012" />
          </linearGradient>
        </defs>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(start)} y2={y(start)} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#eqArea)" />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {scrubIdx != null && (
          <line x1={sx} x2={sx} y1={PAD.t} y2={PAD.t + ih} stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      {scrubIdx == null ? (
        <span className={styles.endDot} style={{left: pctX(x(points.length - 1)), top: pctY(y(last)), background: stroke}} aria-hidden="true" />
      ) : (
        <>
          <span className={styles.scrubDot} style={{left: pctX(sx), top: pctY(sy), borderColor: stroke, '--glow': stroke}} aria-hidden="true" />
          <span className={styles.scrubTime} style={{left: `${labelLeft}%`}} aria-hidden="true">{fmtDay(points[sel].t)}</span>
        </>
      )}
    </div>
  );
}

async function fetchLedger() {
  const res = await fetch('/_m/ledger', {cache: 'no-store'});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function Content() {
  const [state, setState] = useState({status: 'loading'});
  const [scrubIdx, setScrubIdx] = useState(null);
  const [ledgerTab, setLedgerTab] = useState('closed');

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

  // Drop Alpaca's pre-funding value:0 padding so the curve doesn't rocket from $0.
  const hist = (history || []).filter((p) => p && Number.isFinite(p.value) && p.value > 0);
  const canScrub = hist.length > 1;
  const sel = scrubIdx == null || !canScrub ? null : Math.min(scrubIdx, hist.length - 1);

  const equity = a.portfolioValue != null ? a.portfolioValue : a.equity;
  const unrealTotal = positions.reduce((s, p) => s + (p.unrealizedPL || 0), 0);
  const invested = positions.reduce((s, p) => s + Math.abs(p.marketValue || 0), 0);
  const exposure = equity ? (invested / equity) * 100 : null;
  const cash = a.cash != null ? a.cash : Math.max(0, (equity || 0) - invested);

  const wins = closed.filter((c) => c.pl > 0);
  const losses = closed.filter((c) => c.pl < 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : null;
  const best = closed.length ? closed.reduce((m, c) => (c.pl > m.pl ? c : m)) : null;
  const worst = closed.length ? closed.reduce((m, c) => (c.pl < m.pl ? c : m)) : null;

  // Hero: resting = live equity + today's move; scrubbing = the hovered point,
  // its change measured from the window's open, labelled with that day.
  const scrubbing = sel != null;
  const heroValue = scrubbing ? hist[sel].value : equity;
  const heroDelta = scrubbing
    ? {v: hist[sel].value - hist[0].value, pct: hist[0].value ? ((hist[sel].value - hist[0].value) / hist[0].value) * 100 : null, label: fmtDay(hist[sel].t)}
    : {v: a.dayPL, pct: a.dayPLpct, label: 'Today'};

  const metrics = [
    {label: 'Realized P/L', val: signedMoney(realizedTotal), tone: dirCls(realizedTotal), sub: closed.length ? `${closed.length} round-trips` : null},
    {label: 'Unrealized', val: signedMoney(unrealTotal), tone: dirCls(unrealTotal), sub: positions.length ? `${positions.length} open` : null},
    {label: 'Win rate', val: winRate != null ? pctWhole(winRate) : '—', tone: winRate != null && winRate >= 50 ? styles.up : '', sub: closed.length ? `${wins.length}W · ${losses.length}L` : null},
    {label: 'Exposure', val: pctWhole(exposure), tone: '', sub: `${money(invested)} in`},
    {label: 'Best trade', val: best ? signedMoney(best.pl) : '—', tone: best && best.pl > 0 ? styles.up : '', sub: best ? best.symbol : null},
    {label: 'Worst trade', val: worst ? signedMoney(worst.pl) : '—', tone: worst && worst.pl < 0 ? styles.down : '', sub: worst ? worst.symbol : null},
  ];

  // Allocation segments — share of equity, with a neutral cash remainder so the
  // bar sums to the whole account (not just what's invested).
  const allocTotal = invested + Math.max(0, cash) || 1;
  const segs = positions.map((p) => ({key: p.symbol, w: (Math.abs(p.marketValue || 0) / allocTotal) * 100, side: p.side}));
  const cashW = (Math.max(0, cash) / allocTotal) * 100;

  return (
  return (
    <div className={styles.dashboard}>
      {/* ── Top Hero: Equity & Chart ── */}
      <div className={`p-card ${styles.heroArea}`} data-reveal style={{'--i': 0}}>
        <div className={styles.heroHeader}>
          <div className={styles.heroLeft}>
            <div className={styles.heroTag}>
              <span className={styles.heroTagLeft}>
                <span className="p-pip" aria-hidden="true" /> Account equity · Alpaca paper
              </span>
              {asOf && <span className={styles.heroTagRight}>updated {fmtWhen(asOf, true)}</span>}
            </div>
            <div className={styles.heroValue}>{money(heroValue)}</div>
            <div className={`${styles.heroDelta} ${heroDelta.v == null || heroDelta.v === 0 ? styles.flat : dirCls(heroDelta.v)}`}>
              <span className={styles.caret} aria-hidden="true">{caret(heroDelta.v)}</span>
              <span className={styles.deltaNum}>{signedMoney(heroDelta.v)}</span>
              {heroDelta.pct != null && <span className={styles.deltaPct}>({signedPct(heroDelta.pct)})</span>}
              <span className={styles.deltaLabel}>{heroDelta.label}</span>
            </div>
          </div>
          <div className={styles.factsRail}>
            <div className={styles.factItem}><dt>Cash</dt><dd>{money(cash)}</dd></div>
            <div className={styles.factItem}><dt>Buying power</dt><dd>{money(a.buyingPower)}</dd></div>
            <div className={styles.factItem}><dt>Invested</dt><dd>{pctWhole(exposure)}</dd></div>
            <div className={styles.factItem}><dt>Positions</dt><dd>{positions.length}</dd></div>
          </div>
        </div>

        <EquityChart points={hist} scrubIdx={scrubIdx} onScrub={setScrubIdx} />

        <div className={styles.pills} aria-hidden="true">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((r) => (
            <span key={r} className={`${styles.pill} ${r === '3M' ? styles.pillOn : styles.pillSoon}`}>{r}</span>
          ))}
          <span className={styles.pillNote}>3-month · daily</span>
        </div>
      </div>

      {/* ── Left Column: Allocation & Holdings ── */}
      <div className={styles.leftCol}>
        <div className={`p-card ${styles.allocCard}`} data-reveal style={{'--i': 1}}>
          <h2 className={styles.h2}>Allocation <span className={styles.count}>{pctWhole(exposure)} invested</span></h2>
          <div className={styles.allocBar}>
            {segs.map((s) => (
              <span key={s.key} className={`${styles.allocSeg} ${s.side === 'short' ? styles.allocShort : ''}`} style={{width: `${s.w}%`}} title={`${s.key} ${s.w.toFixed(1)}%`} />
            ))}
            {cashW > 0 && <span className={styles.allocCash} style={{width: `${cashW}%`}} title={`Cash ${cashW.toFixed(1)}%`} />}
          </div>
          <div className={styles.allocLegend}>
            {segs.map((s) => (
              <span key={s.key} className={styles.legItem}>
                <i className={`${styles.legDot} ${s.side === 'short' ? styles.legShort : ''}`} />{s.key} <b>{s.w.toFixed(0)}%</b>
              </span>
            ))}
            {cashW > 0 && (
              <span className={styles.legItem}><i className={`${styles.legDot} ${styles.legCash}`} />Cash <b>{cashW.toFixed(0)}%</b></span>
            )}
          </div>
        </div>

        <div className={`p-card ${styles.holdingsCard}`} data-reveal style={{'--i': 2}}>
          <h2 className={styles.h2}>Holdings <span className={styles.count}>{positions.length} open</span></h2>
          {positions.length === 0 ? (
            <p className={styles.empty}>No open positions.</p>
          ) : (
            <div className={styles.holdings}>
              {positions.map((p) => {
                const w = invested ? (Math.abs(p.marketValue || 0) / invested) * 100 : 0;
                return (
                  <div key={p.symbol} className={styles.holding}>
                    <div className={styles.hName}>
                      <span className={styles.hSym}>{p.symbol}</span>
                      {p.side === 'short' && <span className={styles.short}>SHORT</span>}
                      <span className={styles.hSub}>{p.qty} sh · avg {money(p.avgEntry)}</span>
                    </div>
                    <div className={styles.hWeight}>
                      <span className={styles.wtBar}><span className={`${styles.wtFill} ${p.side === 'short' ? styles.wtShort : ''}`} style={{width: `${Math.max(3, w)}%`}} /></span>
                      <span className={styles.wtPct}>{w.toFixed(0)}%</span>
                    </div>
                    <div className={styles.hPrice}>
                      <span className={styles.hLast}>{money(p.price)}</span>
                      <span className={`${styles.hChg} ${dirCls(p.changeToday)}`}>{caret(p.changeToday)} {signedPct(p.changeToday)}</span>
                    </div>
                    <div className={styles.hVal}>
                      <span className={styles.hMkt}>{money(p.marketValue)}</span>
                      <span className={`${styles.hUnreal} ${dirCls(p.unrealizedPL)}`}>{signedMoney(p.unrealizedPL)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: Performance & Ledger ── */}
      <div className={styles.rightCol}>
        <div className={`p-card ${styles.metricsCard}`} data-reveal style={{'--i': 3}}>
          <h2 className={styles.h2}>The read <span className={styles.count}>performance</span></h2>
          <dl className={styles.metrics}>
            {metrics.map((m, i) => (
              <div key={i} className={styles.metric}>
                <dt className={styles.metricLabel}>{m.label}</dt>
                <dd className={`${styles.metricVal} ${m.tone || ''}`}>{m.val}</dd>
                {m.sub && <div className={styles.metricSub}>{m.sub}</div>}
              </div>
            ))}
          </dl>
        </div>

        <div className={`p-card ${styles.ledgerCard}`} data-reveal style={{'--i': 4}}>
          <div className={styles.ledgerHeader}>
            <h2 className={styles.h2}>Ledger</h2>
            <div className={styles.ledgerTabs}>
              <button className={`${styles.tabBtn} ${ledgerTab === 'closed' ? styles.tabActive : ''}`} onClick={() => setLedgerTab('closed')}>
                Round-trips <span className={styles.tabCount}>{closed.length}</span>
              </button>
              <button className={`${styles.tabBtn} ${ledgerTab === 'orders' ? styles.tabActive : ''}`} onClick={() => setLedgerTab('orders')}>
                Orders <span className={styles.tabCount}>{orders.length}</span>
              </button>
            </div>
          </div>

          <div className={styles.ledgerScroller}>
            {ledgerTab === 'closed' && (
              closed.length === 0 ? <p className={styles.empty}>No closed round-trips yet.</p> : (
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
                        <td className={`${styles.num} ${styles.dim}`}>{fmtWhen(c.closedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
            {ledgerTab === 'orders' && (
              orders.length === 0 ? <p className={styles.empty}>No orders yet.</p> : (
                <table className={styles.table}>
                  <thead>
                    <tr><th>Time</th><th>Symbol</th><th>Side</th><th className={styles.num}>Qty</th><th>Type</th><th className={styles.num}>Fill</th><th>Status</th></tr>
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
              )
            )}
          </div>
        </div>
      </div>

      <p className={styles.foot} data-reveal style={{'--i': 5}}>
        Read-only paper account via Alpaca · auto-refreshes every 30s
        {asOf && <> · updated {fmtWhen(asOf, true)}</>} · scrub the curve to read any day ·
        {' '}watch the tape on the <Link to="/terminal">market terminal</Link>.
      </p>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Layout
      title="Portfolio"
      description="A live, read-only view of my Alpaca paper-trading account — a scrubable equity curve, allocation, a performance read, open positions, closed round-trips, and the full order log.">
      <PageHeader
        eyebrow="Trading capital · Alpaca paper"
        title="Portfolio"
        subtitle="A live, read-only command deck for the paper-trading account — scrub the curve to read any day, then the allocation, the performance read, and every position and order. Play money; no real capital at risk."
      />
      <main className={`container ${styles.wrap}`}>
        <Content />
      </main>
    </Layout>
  );
}
