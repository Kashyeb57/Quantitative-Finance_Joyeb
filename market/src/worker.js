/**
 * Live market data proxy for joyebkashyeb.com.np
 * ---------------------------------------------
 * Runs as a Cloudflare Worker on the route  joyebkashyeb.com.np/_m/*
 * (everything else on the domain passes straight through to GitHub Pages).
 *
 *   GET /_m/bars?symbol=AAPL&tf=1Min      -> OHLC candles for the chart
 *   GET /_m/snapshot?symbol=AAPL          -> latest trade + day change (price header)
 *   GET /_m/stream?symbol=AAPL  (WebSocket) -> live trades relayed from Alpaca's
 *                                             IEX stream (auth done server-side)
 *
 * Why a Worker: Alpaca requires an API key AND secret. Putting those in the
 * site's JavaScript would expose them to everyone. Here they live as Worker
 * secrets (set with `wrangler secret put`), so the browser only ever talks to
 * our own domain and never sees the credentials.
 *
 * Secrets used:  ALPACA_KEY_ID , ALPACA_SECRET_KEY
 */

const ALPACA = 'https://data.alpaca.markets/v2/stocks';

const ALLOWED_ORIGINS = [
  'https://joyebkashyeb.com.np',
  'http://localhost:3000',
];

const TIMEFRAMES = {
  '1Min':  { tf: '1Min',  lookbackMs: 2 * 24 * 3600e3,   cache: 10 },
  '3Min':  { tf: '3Min',  lookbackMs: 5 * 24 * 3600e3,   cache: 12 },
  '5Min':  { tf: '5Min',  lookbackMs: 7 * 24 * 3600e3,   cache: 20 },
  '15Min': { tf: '15Min', lookbackMs: 20 * 24 * 3600e3,  cache: 30 },
  '1Hour': { tf: '1Hour', lookbackMs: 45 * 24 * 3600e3,  cache: 45 },
  '1Day':  { tf: '1Day',  lookbackMs: 400 * 24 * 3600e3, cache: 300 },
};

const SYMBOL_RE = /^[A-Z.]{1,10}$/;

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(request, body, status = 200, cacheSeconds = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheSeconds ? `public, max-age=${cacheSeconds}` : 'no-store',
      ...corsHeaders(request),
    },
  });
}

async function alpaca(path, env) {
  if (!env.ALPACA_KEY_ID || !env.ALPACA_SECRET_KEY) {
    return { ok: false, status: 503, error: 'Worker is missing Alpaca credentials.' };
  }
  const res = await fetch(`${ALPACA}${path}`, {
    headers: {
      'APCA-API-KEY-ID': env.ALPACA_KEY_ID,
      'APCA-API-SECRET-KEY': env.ALPACA_SECRET_KEY,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: text.slice(0, 300) || 'Upstream error' };
  }
  return { ok: true, data: await res.json() };
}

async function handleBars(request, env, url) {
  const symbol = (url.searchParams.get('symbol') || '').toUpperCase();
  const tfKey = url.searchParams.get('tf') || '1Min';
  if (!SYMBOL_RE.test(symbol)) return json(request, { error: 'Bad symbol' }, 400);
  const conf = TIMEFRAMES[tfKey];
  if (!conf) return json(request, { error: 'Bad timeframe' }, 400);

  const start = new Date(Date.now() - conf.lookbackMs).toISOString();
  const qs = new URLSearchParams({
    timeframe: conf.tf,
    start,
    limit: '1000',
    adjustment: 'raw',
    feed: 'iex',
    sort: 'asc',
  });

  const out = await alpaca(`/${symbol}/bars?${qs}`, env);
  if (!out.ok) return json(request, { error: out.error }, out.status);

  const bars = (out.data.bars || []).map((b) => ({
    time: Math.floor(new Date(b.t).getTime() / 1000),
    open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v,
  }));
  return json(request, { symbol, tf: tfKey, bars }, 200, conf.cache);
}

async function handleSnapshot(request, env, url) {
  const symbol = (url.searchParams.get('symbol') || '').toUpperCase();
  if (!SYMBOL_RE.test(symbol)) return json(request, { error: 'Bad symbol' }, 400);

  const out = await alpaca(`/${symbol}/snapshot?feed=iex`, env);
  if (!out.ok) return json(request, { error: out.error }, out.status);

  const d = out.data || {};
  const last = (d.latestTrade && d.latestTrade.p) || (d.minuteBar && d.minuteBar.c) || (d.dailyBar && d.dailyBar.c) || null;
  const prevClose = (d.prevDailyBar && d.prevDailyBar.c) || null;
  const change = last != null && prevClose != null ? last - prevClose : null;
  const changePct = change != null && prevClose ? (change / prevClose) * 100 : null;

  return json(request, {
    symbol,
    last,
    prevClose,
    change,
    changePct,
    dayOpen: (d.dailyBar && d.dailyBar.o) || null,
    dayHigh: (d.dailyBar && d.dailyBar.h) || null,
    dayLow: (d.dailyBar && d.dailyBar.l) || null,
    volume: (d.dailyBar && d.dailyBar.v) || null,
    at: (d.latestTrade && d.latestTrade.t) || null,
  }, 200, 5);
}

// WebSocket proxy: browser <-> this Worker <-> Alpaca's live trade stream.
// The Alpaca key/secret are used only here (server-side) to authenticate the
// upstream connection; the browser never sees them.
async function handleStream(request, env, url) {
  if ((request.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') {
    return json(request, { error: 'Expected a WebSocket upgrade' }, 426);
  }
  const symbol = (url.searchParams.get('symbol') || '').toUpperCase();
  if (!SYMBOL_RE.test(symbol)) return json(request, { error: 'Bad symbol' }, 400);
  if (!env.ALPACA_KEY_ID || !env.ALPACA_SECRET_KEY) {
    return json(request, { error: 'Worker is missing Alpaca credentials.' }, 503);
  }

  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  server.accept();
  const send = (obj) => { try { server.send(JSON.stringify(obj)); } catch (_) {} };

  let upstream = null;
  try {
    const resp = await fetch('https://stream.data.alpaca.markets/v2/iex', {
      headers: { Upgrade: 'websocket' },
    });
    upstream = resp.webSocket;
  } catch (_) {
    upstream = null;
  }
  if (!upstream) {
    send({ type: 'error', msg: 'Could not reach the data stream.' });
    try { server.close(1011, 'upstream failed'); } catch (_) {}
    return new Response(null, { status: 101, webSocket: client });
  }
  upstream.accept();

  upstream.addEventListener('message', (ev) => {
    let msgs;
    try { msgs = JSON.parse(ev.data); } catch (_) { return; }
    if (!Array.isArray(msgs)) return;
    for (const m of msgs) {
      if (m.T === 'success' && m.msg === 'connected') {
        upstream.send(JSON.stringify({ action: 'auth', key: env.ALPACA_KEY_ID, secret: env.ALPACA_SECRET_KEY }));
      } else if (m.T === 'success' && m.msg === 'authenticated') {
        upstream.send(JSON.stringify({ action: 'subscribe', trades: [symbol] }));
        send({ type: 'ready' });
      } else if (m.T === 't') {
        send({
          type: 'trade',
          price: m.p,
          size: m.s,
          time: m.t ? Math.floor(new Date(m.t).getTime() / 1000) : Math.floor(Date.now() / 1000),
        });
      } else if (m.T === 'error') {
        send({ type: 'error', msg: m.msg || 'stream error', code: m.code });
      }
    }
  });
  upstream.addEventListener('close', () => { try { server.close(); } catch (_) {} });
  upstream.addEventListener('error', () => { try { server.close(); } catch (_) {} });
  server.addEventListener('close', () => { try { upstream.close(); } catch (_) {} });
  server.addEventListener('error', () => { try { upstream.close(); } catch (_) {} });

  return new Response(null, { status: 101, webSocket: client });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/_m/stream') return handleStream(request, env, url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (request.method !== 'GET') {
      return json(request, { error: 'Method not allowed' }, 405);
    }

    if (url.pathname === '/_m/bars')     return handleBars(request, env, url);
    if (url.pathname === '/_m/snapshot') return handleSnapshot(request, env, url);
    if (url.pathname === '/_m/health')   return json(request, { ok: true });

    return json(request, { error: 'Not found' }, 404);
  },
};
