/*
 * Live crypto stream via Coinbase's public WebSocket feed.
 *
 * wss://ws-feed.exchange.coinbase.com is keyless, CORS/browser-accessible, and
 * pushes a `ticker` message on every trade — so we get true tick-by-tick data
 * straight from the browser (no keys, no Worker, no proxy), 24/7.
 *
 *   subscribeCryptoTicker('BTC-USD', onTick) -> returns an unsubscribe fn
 *
 * onTick receives: { price, timeSec, open24h, high24h, low24h, volume24h }
 */

export function subscribeCryptoTicker(productId, onTick) {
  let ws = null;
  let closed = false;
  let reconnectTimer = null;

  function connect() {
    if (closed) return;
    try {
      ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
    } catch (e) {
      reconnectTimer = setTimeout(connect, 2500);
      return;
    }

    ws.onopen = () => {
      try {
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            product_ids: [productId],
            channels: ['ticker'],
          })
        );
      } catch (e) {
        /* ignore */
      }
    };

    ws.onmessage = (e) => {
      let m;
      try {
        m = JSON.parse(e.data);
      } catch (_) {
        return;
      }
      if (m.type === 'ticker' && m.product_id === productId && m.price != null) {
        onTick({
          price: +m.price,
          timeSec: m.time
            ? Math.floor(new Date(m.time).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          open24h: m.open_24h != null ? +m.open_24h : null,
          high24h: m.high_24h != null ? +m.high_24h : null,
          low24h: m.low_24h != null ? +m.low_24h : null,
          volume24h: m.volume_24h != null ? +m.volume_24h : null,
        });
      }
    };

    // Auto-reconnect on drop (unless we intentionally closed).
    ws.onclose = () => {
      if (!closed) reconnectTimer = setTimeout(connect, 2000);
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch (_) {
        /* ignore */
      }
    };
  }

  connect();

  return () => {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    try {
      if (ws) ws.close();
    } catch (_) {
      /* ignore */
    }
  };
}
