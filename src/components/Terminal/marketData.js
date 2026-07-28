/*
 * Market data client for the Terminal.
 *
 * Primary source is our own Cloudflare Worker at /_m/* (see market/README.md),
 * which holds the Alpaca credentials server-side. If that Worker is not
 * deployed yet — or is briefly unavailable — we fall back to a keyless public
 * source so the Terminal keeps working instead of showing an empty panel.
 */

const WORKER = '/_m';

const PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
];

// Our timeframe keys -> Yahoo's (interval, range) for the fallback path.
export const TIMEFRAMES = [
  { key: '1Min',  label: '1m',  yahoo: { interval: '1m',  range: '1d'  }, pollMs: 15000 },
  { key: '5Min',  label: '5m',  yahoo: { interval: '5m',  range: '5d'  }, pollMs: 30000 },
  { key: '1Hour', label: '1H',  yahoo: { interval: '60m', range: '1mo' }, pollMs: 60000 },
  { key: '1Day',  label: '1D',  yahoo: { interval: '1d',  range: '1y'  }, pollMs: 300000 },
];

export function tfConfig(key) {
  return TIMEFRAMES.find((t) => t.key === key) || TIMEFRAMES[0];
}

/* ---------------------------------------------------------------- helpers */

async function getJson(url, opts) {
  const res = await fetch(url, { cache: 'no-store', ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function viaProxy(target) {
  for (const p of PROXIES) {
    try {
      const res = await fetch(p(target), { cache: 'no-store' });
      if (!res.ok) continue;
      const text = await res.text();
      let j = JSON.parse(text);
      if (j && typeof j.contents === 'string') j = JSON.parse(j.contents);
      return j;
    } catch (e) {
      /* try next proxy */
    }
  }
  throw new Error('All proxies failed');
}

function parseYahooChart(j) {
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.timestamp || !r.indicators || !r.indicators.quote) {
    return { bars: [], meta: null };
  }
  const ts = r.timestamp;
  const q = r.indicators.quote[0];
  const bars = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i];
    if (o == null || h == null || l == null || c == null) continue;
    bars.push({ time: ts[i], open: o, high: h, low: l, close: c, volume: q.volume ? q.volume[i] : null });
  }
  return { bars, meta: r.meta || null };
}

/* ------------------------------------------------------------------ bars */

export async function fetchBars(symbol, tfKey) {
  // 1. our Worker (real feed, credentials stay server-side)
  try {
    const j = await getJson(`${WORKER}/bars?symbol=${encodeURIComponent(symbol)}&tf=${tfKey}`);
    if (j && Array.isArray(j.bars) && j.bars.length) {
      return { bars: j.bars, source: 'worker' };
    }
  } catch (e) {
    /* fall through */
  }

  // 2. keyless fallback
  const { yahoo } = tfConfig(tfKey);
  const bucket = Math.floor(Date.now() / 30000); // cache-bust every 30s
  const target =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?range=${yahoo.range}&interval=${yahoo.interval}&includePrePost=false&_=${bucket}`;
  try {
    const { bars } = parseYahooChart(await viaProxy(target));
    return { bars, source: 'fallback' };
  } catch (e) {
    return { bars: [], source: 'none' };
  }
}

/* -------------------------------------------------------------- snapshot */

export async function fetchSnapshot(symbol) {
  // 1. our Worker
  try {
    const j = await getJson(`${WORKER}/snapshot?symbol=${encodeURIComponent(symbol)}`);
    if (j && j.last != null) return { ...j, source: 'worker' };
  } catch (e) {
    /* fall through */
  }

  // 2. keyless fallback — derive the same numbers from Yahoo's chart meta
  const bucket = Math.floor(Date.now() / 30000);
  const target =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?range=1d&interval=1m&_=${bucket}`;
  try {
    const j = await viaProxy(target);
    const { bars, meta } = parseYahooChart(j);
    const last = (meta && meta.regularMarketPrice) || (bars.length ? bars[bars.length - 1].close : null);
    const prevClose = (meta && (meta.chartPreviousClose || meta.previousClose)) || null;
    const change = last != null && prevClose != null ? last - prevClose : null;
    return {
      symbol,
      last,
      prevClose,
      change,
      changePct: change != null && prevClose ? (change / prevClose) * 100 : null,
      dayHigh: meta && meta.regularMarketDayHigh != null ? meta.regularMarketDayHigh : null,
      dayLow: meta && meta.regularMarketDayLow != null ? meta.regularMarketDayLow : null,
      volume: meta && meta.regularMarketVolume != null ? meta.regularMarketVolume : null,
      source: 'fallback',
    };
  } catch (e) {
    return null;
  }
}

/* --------------------------------------------------------- market status */

/**
 * US equities regular session: Mon-Fri 09:30-16:00 America/New_York.
 * (Holidays are not tracked — it will say "open" on a market holiday.)
 */
export function marketStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t) => (parts.find((p) => p.type === t) || {}).value;

  const day = get('weekday');
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const mins = hour * 60 + minute;

  if (day === 'Sat' || day === 'Sun') return { state: 'closed', label: 'Market closed — weekend' };
  if (mins >= 570 && mins < 960) return { state: 'open', label: 'Market open' };
  if (mins >= 240 && mins < 570) return { state: 'pre', label: 'Pre-market' };
  if (mins >= 960 && mins < 1200) return { state: 'after', label: 'After hours' };
  return { state: 'closed', label: 'Market closed' };
}

export function fmtPrice(v) {
  if (v == null || Number.isNaN(v)) return '—';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtVolume(v) {
  if (v == null || Number.isNaN(v)) return '—';
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}
