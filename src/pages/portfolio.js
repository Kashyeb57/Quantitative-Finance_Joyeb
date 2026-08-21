import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PageHeader from '@site/src/components/PageHeader';
import {fmtPrice, isCrypto} from '@site/src/components/Terminal/marketData';
import {subscribeStockTrades} from '@site/src/components/Terminal/stockStream';
import {SECTIONS} from '@site/src/components/Terminal/tickers';
import styles from './portfolio.module.css';

/*
 * Portfolio — "THE DESK": the paper account rendered as a restored trading
 * console. The equity line dominates; every scattered fact docks into one
 * hairline-ruled instrument rail; allocation IS the header rule of Positions.
 * The empty state is a feature — a cluster of zeroed gauges beside a flat,
 * armed line reads as "powered on, waiting," never a half-built dashboard.
 *
 *   • Everyone  — live, read-only. Held-symbol trade streams tick equity + marks.
 *   • The owner — a passphrase (browser-only, sent as X-Trade-Token) unlocks the
 *                 buy/sell panel. The real gate is the Worker: /_m/order and
 *                 /_m/cancel reject anything without a valid TRADE_TOKEN. Paper.
 */

const POLL_MS = 30000;
const TRADE_TOKEN_KEY = 'pf_trade_token';
// Tradeable universe = the terminal's sectors, minus crypto (the equity order
// path can't place -USD pairs). Grouped so the picker mirrors the terminal.
const TRADE_SECTIONS = SECTIONS
  .map((s) => ({name: s.name, tickers: s.tickers.filter((t) => !isCrypto(t))}))
  .filter((s) => s.tickers.length);
const DEFAULT_SYMBOL = 'AMD';
const PENDING = ['new', 'accepted', 'partially_filled', 'pending_new', 'held', 'accepted_for_bidding'];

// The line-draw fires once per page load, not on every 30s poll re-render.
let hasDrawn = false;

const money = (v) => (v == null || Number.isNaN(v) ? '—' : `$${fmtPrice(v)}`);
const signedMoney = (v) => (v == null || Number.isNaN(v) ? '—' : `${v >= 0 ? '+' : '−'}$${fmtPrice(Math.abs(v))}`);
// Decimal discipline: every percentage is 1dp, so right-aligned columns lock.
const signedPct = (v) => (v == null || Number.isNaN(v) ? '' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`);
const pct1 = (v) => (v == null || Number.isNaN(v) ? '—' : `${v.toFixed(1)}%`);

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

// Which two reads are the headlines — a deterministic function of account state,
// never a per-render guess, so every state degrades sensibly.
function readHeadlines(closedLen, posLen) {
  if (closedLen > 0) return ['realized', 'winRate']; // a track record to show off
  if (posLen > 0) return ['exposure', 'unrealized']; // risk is on, nothing closed
  return ['cash', 'buyingPower'];                     // armed and idle
}

async function fetchLedger() {
  const res = await fetch('/_m/ledger', {cache: 'no-store'});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postJson(path, token, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Trade-Token': token},
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* The dominant instrument: a full-bleed equity line, no axes/grid, a dashed
 * open-baseline, a scrub that drives the readout above it, and a one-time
 * line-draw on load. Controlled — the parent owns the scrub index. Paths live
 * in a stretched SVG; markers are HTML overlays so dots stay round. */
function EquityChart({points, scrubIdx, onScrub}) {
  const ref = useRef(null);

  if (!points || points.length < 2) {
    // Funded-but-flat is a deliberate state, not an error: a still baseline.
    return (
      <div className={styles.chartFlat}>
        <div className={styles.flatRule} />
        <span className={styles.flatTag}>flat · no open risk</span>
      </div>
    );
  }

  const draw = !hasDrawn;
  if (draw) hasDrawn = true;

  const W = 900, H = 260, PAD = {t: 18, r: 8, b: 18, l: 8};
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const vals = points.map((p) => p.value);
  const vmin = Math.min(...vals), vmax = Math.max(...vals);
  const span = (vmax - vmin) || Math.max(1, vmax * 0.01);
  const lo = vmin - span * 0.18, hiV = vmax + span * 0.18;
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
            <stop offset="0" stopColor={stroke} stopOpacity="0.20" />
            <stop offset="1" stopColor={stroke} stopOpacity="0.012" />
          </linearGradient>
        </defs>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(start)} y2={y(start)} stroke="var(--rule-3)" strokeWidth="1" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#eqArea)" />
        <path
          className={draw ? styles.drawIn : undefined}
          pathLength="1"
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {scrubIdx != null && (
          <line x1={sx} x2={sx} y1={PAD.t} y2={PAD.t + ih} stroke="var(--rule-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
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

/* Owner-only buy/sell — the ONE bordered surface on the page (a control earns
 * containment). Hidden from visitors; gated for real by the Worker. */
function TradePanel({token, symbols, onPlaced, onLock}) {
  const [form, setForm] = useState({symbol: DEFAULT_SYMBOL, side: 'buy', qty: ''});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const listed = new Set(TRADE_SECTIONS.flatMap((s) => s.tickers));
  const heldExtra = symbols.filter((s) => !listed.has(s));

  const submit = async (e) => {
    e.preventDefault();
    const qty = parseInt(form.qty, 10);
    const symbol = form.symbol.trim().toUpperCase();
    if (!symbol || !(qty > 0)) { setMsg({ok: false, text: 'Enter a symbol and a whole share count.'}); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await postJson('/_m/order', token, {symbol, side: form.side, qty});
      setMsg({ok: true, text: `${form.side === 'buy' ? 'Bought' : 'Sold'} ${qty} ${symbol} — order ${r.order && r.order.status ? r.order.status : 'submitted'}.`});
      setForm((f) => ({...f, qty: ''}));
      onPlaced && onPlaced();
    } catch (err) {
      const m = String(err.message || err);
      setMsg({ok: false, text: m === 'unauthorized' ? 'Passphrase rejected — lock and re-unlock.' : `Order failed: ${m}`});
    } finally { setBusy(false); }
  };

  return (
    <div className={styles.tradeCard}>
      <div className={styles.tradeHead}>
        <span className={styles.railEyebrow}>Trade · owner · paper</span>
        <button type="button" className={styles.lockBtn} onClick={onLock}>Lock</button>
      </div>
      <form className={styles.tradeForm} onSubmit={submit}>
        <div className={styles.sideToggle} role="group" aria-label="Order side">
          <button type="button" className={`${styles.sideBtn} ${form.side === 'buy' ? styles.sideBuy : ''}`} onClick={() => setForm((f) => ({...f, side: 'buy'}))}>Buy</button>
          <button type="button" className={`${styles.sideBtn} ${form.side === 'sell' ? styles.sideSell : ''}`} onClick={() => setForm((f) => ({...f, side: 'sell'}))}>Sell</button>
        </div>
        <select className={`${styles.tradeInput} ${styles.tradeSelect}`} value={form.symbol} onChange={(e) => setForm((f) => ({...f, symbol: e.target.value}))} aria-label="Symbol">
          {heldExtra.length > 0 && (
            <optgroup label="Holdings">{heldExtra.map((t) => <option key={t} value={t}>{t}</option>)}</optgroup>
          )}
          {TRADE_SECTIONS.map((s) => (
            <optgroup key={s.name} label={s.name}>{s.tickers.map((t) => <option key={t} value={t}>{t}</option>)}</optgroup>
          ))}
        </select>
        <input className={styles.tradeInput} type="number" min="1" step="1" value={form.qty} onChange={(e) => setForm((f) => ({...f, qty: e.target.value}))} placeholder="Shares" aria-label="Shares" />
        <button className={`${styles.submitBtn} ${form.side === 'sell' ? styles.submitSell : ''}`} type="submit" disabled={busy}>
          {busy ? 'Placing…' : `${form.side === 'buy' ? 'Buy' : 'Sell'} at market`}
        </button>
      </form>
      {msg && <p className={`${styles.tradeMsg} ${msg.ok ? styles.tradeOk : styles.tradeErr}`}>{msg.text}</p>}
      <p className={styles.tradeNote}>Market orders · whole shares · paper account.</p>
    </div>
  );
}

function Content() {
  const [state, setState] = useState({status: 'loading'});
  const [scrubIdx, setScrubIdx] = useState(null);
  const [ledgerTab, setLedgerTab] = useState('closed');
  const [livePrices, setLivePrices] = useState({});
  const [token, setToken] = useState('');
  const [session, setSession] = useState('');
  const pullRef = useRef(null);

  useEffect(() => {
    try { const t = localStorage.getItem(TRADE_TOKEN_KEY); if (t) setToken(t); } catch (_) { /* ignore */ }
    // Static session stamp, set once on mount — not a live-ticking clock.
    try {
      setSession(new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false}).format(new Date()) + ' CT');
    } catch (_) { /* ignore */ }
  }, []);

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
    pullRef.current = pull;
    pull();
    const timer = setInterval(pull, POLL_MS);
    const onVis = () => { if (document.visibilityState === 'visible') pull(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelled = true; clearInterval(timer); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const okData = state.status === 'ok' ? state.data : null;
  const symbolsKey = okData ? okData.positions.map((p) => p.symbol).sort().join(',') : '';
  useEffect(() => {
    if (!symbolsKey) return undefined;
    const syms = symbolsKey.split(',').filter(Boolean);
    const unsubs = syms.map((sym) =>
      subscribeStockTrades(sym, ({price}) => {
        setLivePrices((prev) => (prev[sym] === price ? prev : {...prev, [sym]: price}));
      })
    );
    return () => unsubs.forEach((u) => u && u());
  }, [symbolsKey]);

  const unlock = () => {
    const t = window.prompt('Owner passphrase to enable trading:');
    if (t == null) return;
    const v = t.trim();
    if (!v) return;
    try { localStorage.setItem(TRADE_TOKEN_KEY, v); } catch (_) { /* ignore */ }
    setToken(v);
  };
  const lock = () => { try { localStorage.removeItem(TRADE_TOKEN_KEY); } catch (_) { /* ignore */ } setToken(''); };
  const owner = !!token;

  if (state.status === 'loading') {
    return <p className={styles.loading}><span className="p-pip" aria-hidden="true" /> Reading the paper account…</p>;
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

  const hist = (history || []).filter((p) => p && Number.isFinite(p.value) && p.value > 0);
  const canScrub = hist.length > 1;
  const sel = scrubIdx == null || !canScrub ? null : Math.min(scrubIdx, hist.length - 1);

  // Live-adjust positions from streamed prices, then roll into live equity.
  const equityBase = a.portfolioValue != null ? a.portfolioValue : a.equity;
  const livePos = positions.map((p) => {
    const lp = livePrices[p.symbol];
    if (lp == null || !p.price) return p;
    const mv = p.marketValue != null ? p.marketValue * (lp / p.price) : p.marketValue;
    const dMV = mv != null && p.marketValue != null ? mv - p.marketValue : 0;
    return {...p, price: lp, marketValue: mv, unrealizedPL: (p.unrealizedPL || 0) + dMV};
  });
  const liveDelta = livePos.reduce((s, p, i) => s + ((p.marketValue || 0) - (positions[i].marketValue || 0)), 0);
  const equity = equityBase != null ? equityBase + liveDelta : equityBase;

  const unrealTotal = livePos.reduce((s, p) => s + (p.unrealizedPL || 0), 0);
  const invested = livePos.reduce((s, p) => s + Math.abs(p.marketValue || 0), 0);
  const exposure = equity ? (invested / equity) * 100 : 0;
  const cash = a.cash != null ? a.cash : Math.max(0, (equity || 0) - invested);

  const lastEq = equityBase != null ? equityBase - (a.dayPL || 0) : null;
  const dayPLlive = (a.dayPL || 0) + liveDelta;
  const dayPctLive = lastEq ? (dayPLlive / lastEq) * 100 : a.dayPLpct;

  const wins = closed.filter((c) => c.pl > 0);
  const losses = closed.filter((c) => c.pl < 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : null;
  const best = closed.length ? closed.reduce((m, c) => (c.pl > m.pl ? c : m)) : null;
  const worst = closed.length ? closed.reduce((m, c) => (c.pl < m.pl ? c : m)) : null;

  const scrubbing = sel != null;
  const heroValue = scrubbing ? hist[sel].value : equity;
  const heroDelta = scrubbing
    ? {v: hist[sel].value - hist[0].value, pct: hist[0].value ? ((hist[sel].value - hist[0].value) / hist[0].value) * 100 : null, label: fmtDay(hist[sel].t)}
    : {v: dayPLlive, pct: dayPctLive, label: 'Today'};
  const openVal = hist.length ? hist[0].value : equity;

  // The instrument rail: two deterministic headlines + a quiet gauge stack.
  const READ = {
    realized: {label: 'Realized P/L', val: signedMoney(realizedTotal), tone: dirCls(realizedTotal)},
    winRate: {label: 'Win rate', val: winRate != null ? pct1(winRate) : '0.0%', tone: winRate != null && winRate >= 50 ? styles.up : ''},
    exposure: {label: 'Exposure', val: pct1(exposure), tone: ''},
    unrealized: {label: 'Unrealized', val: signedMoney(unrealTotal), tone: dirCls(unrealTotal)},
    cash: {label: 'Cash', val: money(cash), tone: ''},
    buyingPower: {label: 'Buying power', val: money(a.buyingPower), tone: ''},
  };
  const [h1, h2] = readHeadlines(closed.length, positions.length);
  const headlines = [READ[h1], READ[h2]];
  const gauges = ['realized', 'winRate', 'exposure', 'unrealized', 'cash', 'buyingPower']
    .filter((k) => k !== h1 && k !== h2)
    .map((k) => READ[k]);
  const bestWorst = closed.length ? `best ${best.symbol} ${signedMoney(best.pl)} · worst ${worst.symbol} ${signedMoney(worst.pl)}` : null;

  // Allocation — the segmented bar that heads the Positions section.
  const allocTotal = invested + Math.max(0, cash) || 1;
  const segs = livePos.map((p) => ({key: p.symbol, w: (Math.abs(p.marketValue || 0) / allocTotal) * 100, side: p.side}));
  const cashW = (Math.max(0, cash) / allocTotal) * 100;

  return (
    <section className={styles.console}>
      {/* ── Status rail ── */}
      <div className={styles.statusRail}>
        <span className={styles.statusLeft}><span className="p-pip" aria-hidden="true" /> LIVE · PAPER · ALPACA</span>
        {session && <span className={styles.statusRight}>SESSION {session}</span>}
      </div>

      {/* ── Instrument deck: chart + rail ── */}
      <div className={styles.deck}>
        <div className={styles.chartCell}>
          <div className={styles.railEyebrow}>Account equity</div>
          <div className={styles.equityVal}>{money(heroValue)}</div>
          <div className={`${styles.heroDelta} ${heroDelta.v == null || heroDelta.v === 0 ? styles.flat : dirCls(heroDelta.v)}`}>
            <span className={styles.caret} aria-hidden="true">{caret(heroDelta.v)}</span>
            <span className={styles.deltaNum}>{signedMoney(heroDelta.v)}</span>
            {heroDelta.pct != null && <span className={styles.deltaPct}>({signedPct(heroDelta.pct)})</span>}
            <span className={styles.deltaLabel}>{heroDelta.label}</span>
          </div>
          <EquityChart points={hist} scrubIdx={scrubIdx} onScrub={setScrubIdx} />
          <div className={styles.chartCaption}>
            <span>3-month · daily</span>
            <span className={styles.captionOpen}>open · {money(openVal)}</span>
          </div>
        </div>

        <div className={styles.rail}>
          <div className={styles.railEyebrow}>The read</div>
          <div className={styles.headlines}>
            {headlines.map((m, i) => (
              <div key={i} className={styles.headline}>
                <div className={styles.hlLabel}>{m.label}</div>
                <div className={`${styles.hlVal} ${m.tone || ''}`}>{m.val}</div>
              </div>
            ))}
          </div>
          <dl className={styles.gauges}>
            {gauges.map((g, i) => (
              <div key={i} className={styles.gauge}>
                <dt>{g.label}</dt>
                <dd className={g.tone || ''}>{g.val}</dd>
              </div>
            ))}
          </dl>
          {bestWorst && <div className={styles.footnote}>{bestWorst}</div>}
          {owner && <TradePanel token={token} symbols={positions.map((p) => p.symbol)} onPlaced={() => pullRef.current && pullRef.current()} onLock={lock} />}
        </div>
      </div>

      {/* ── Positions — allocation IS the header rule ── */}
      <div className={styles.section}>
        <div className={styles.secHead}>
          <span className={styles.railEyebrow}>Positions</span>
          <span className={styles.secCount}>{positions.length} open · {pct1(exposure)} invested</span>
        </div>
        <div className={styles.allocBar}>
          {segs.map((s) => (
            <span key={s.key} className={`${styles.allocSeg} ${s.side === 'short' ? styles.allocShort : ''}`} style={{width: `${s.w}%`}} title={`${s.key} ${s.w.toFixed(1)}%`} />
          ))}
          {cashW > 0 && <span className={styles.allocCash} style={{width: `${cashW}%`}} title={`Cash ${cashW.toFixed(1)}%`} />}
        </div>
        {livePos.length === 0 ? (
          <p className={styles.emptyLine}>No open risk — capital is staged in cash.</p>
        ) : (
          <div className={styles.holdings}>
            {livePos.map((p) => (
              <div key={p.symbol} className={styles.holding}>
                <span className={styles.hSym}>{p.symbol}{p.side === 'short' && <span className={styles.short}>S</span>}</span>
                <span className={styles.hMeta}>{p.qty} sh · avg {money(p.avgEntry)}</span>
                <span className={styles.hLast}>{money(p.price)}</span>
                <span className={`${styles.hChg} ${dirCls(p.changeToday)}`}>{signedPct(p.changeToday)}</span>
                <span className={styles.hMkt}>{money(p.marketValue)}</span>
                <span className={`${styles.hUnreal} ${dirCls(p.unrealizedPL)}`}>{signedMoney(p.unrealizedPL)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Ledger — text toggle, bare table scrolling inside its cell ── */}
      <div className={styles.section}>
        <div className={styles.secHead}>
          <span className={styles.railEyebrow}>Ledger</span>
          <span className={styles.ledgerToggle}>
            <button className={`${styles.toggleBtn} ${ledgerTab === 'closed' ? styles.toggleActive : ''}`} onClick={() => setLedgerTab('closed')}>Round-trips ({closed.length})</button>
            <span className={styles.toggleSep}>·</span>
            <button className={`${styles.toggleBtn} ${ledgerTab === 'orders' ? styles.toggleActive : ''}`} onClick={() => setLedgerTab('orders')}>Orders ({orders.length})</button>
          </span>
        </div>
        <div className={styles.ledgerScroller}>
          {ledgerTab === 'closed' && (
            closed.length === 0 ? <p className={styles.emptyLine}>No closed round-trips yet.</p> : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Symbol</th><th>Side</th><th className={styles.num}>Qty</th><th className={styles.num}>Entry</th><th className={styles.num}>Exit</th><th className={styles.num}>Realized</th><th className={styles.num}>Closed</th></tr>
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
            orders.length === 0 ? <p className={styles.emptyLine}>No orders yet.</p> : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Time</th><th>Symbol</th><th>Side</th><th className={styles.num}>Qty</th><th className={styles.colType}>Type</th><th className={styles.num}>Fill</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.slice(0, 50).map((o) => {
                    const cancelable = owner && PENDING.includes((o.status || '').toLowerCase());
                    return (
                      <tr key={o.id}>
                        <td className={styles.dim}>{fmtWhen(o.submittedAt, true)}</td>
                        <td><span className={styles.sym}>{o.symbol}</span></td>
                        <td><span className={o.side === 'buy' ? styles.tagBuy : styles.tagSell}>{o.side}</span></td>
                        <td className={styles.num}>{o.qty}</td>
                        <td className={`${styles.dim} ${styles.colType}`}>{o.type}</td>
                        <td className={styles.num}>{o.filledAvgPrice != null ? money(o.filledAvgPrice) : '—'}</td>
                        <td>
                          <span className={`${styles.status} ${styles['st_' + (o.status || '').replace(/[^a-z_]/gi, '')]}`}>{o.status}</span>
                          {cancelable && <button className={styles.cancelBtn} onClick={() => postJson('/_m/cancel', token, {id: o.id}).then(() => pullRef.current && pullRef.current()).catch(() => {})}>cancel</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* ── Footer — one line, always present ── */}
      <div className={styles.consoleFoot}>
        <span>read-only paper · via Alpaca · refreshes 30s{asOf && <> · {fmtWhen(asOf, true)}</>}</span>
        <button className={styles.ownerLink} onClick={owner ? lock : unlock}>{owner ? 'lock trading' : 'owner access'}</button>
      </div>
    </section>
  );
}

export default function PortfolioPage() {
  return (
    <Layout
      title="Portfolio"
      description="A live, read-only view of my Alpaca paper-trading account — a scrubable equity console with allocation, the performance read, positions, and the full order ledger.">
      <PageHeader
        eyebrow="Trading capital · Alpaca paper"
        title="Portfolio"
        subtitle="The paper account as a live trading console — one dominant equity line, a fixed instrument rail, and the full ledger. Play money; no real capital at risk."
      />
      <main className={`container ${styles.wrap}`}>
        <Content />
      </main>
    </Layout>
  );
}
