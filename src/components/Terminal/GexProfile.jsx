import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

/*
 * GEX-by-strike histogram — left sidebar. Vertical axis = strike (high at top);
 * horizontal bars = net dealer gamma at that strike (green +, red −). The strike
 * price is printed on every bar, dashed spot/CW/PW/flip markers cross the panel,
 * and hovering a bar shows its exact net GEX. Renders at true measured pixel size
 * so it stays crisp at any height (incl. full-screen).
 */
const fmtGex = (v) => {
  const a = Math.abs(v);
  const s = v < 0 ? '−' : '+';
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return s + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return s + (a / 1e3).toFixed(0) + 'K';
  return s + a.toFixed(0);
};

export default function GexProfile({ profile, spot, callWall, putWall, gammaFlip }) {
  const boxRef = useRef(null);
  const [dim, setDim] = useState({ w: 210, h: 440 });
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w && h) setDim((d) => (d.w === w && d.h === h ? d : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = profile && profile.length >= 2;
  const { w: W, h: H } = dim;

  let bars = [], sy = null, zeroX = 0;
  if (ready && W > 30 && H > 30) {
    const strikes = profile.map((p) => p.strike);
    let minK = Math.min(...strikes), maxK = Math.max(...strikes);
    for (const m of [spot, callWall, putWall, gammaFlip]) {
      if (m != null) { minK = Math.min(minK, m); maxK = Math.max(maxK, m); }
    }
    const spanK = (maxK - minK) || 1;
    minK -= spanK * 0.04; maxK += spanK * 0.04;
    const maxAbs = Math.max(...profile.map((p) => Math.abs(p.net)), 1);
    const padT = 8, padB = 8, padR = 42, padL = 34;
    const plotW = W - padL - padR;
    zeroX = padL + plotW * 0.42;
    sy = (k) => padT + ((maxK - k) / (maxK - minK)) * (H - padT - padB);
    const rowH = Math.max(1.5, ((H - padT - padB) / profile.length) * 0.72);
    bars = profile.map((p) => ({
      strike: p.strike, net: p.net, y: sy(p.strike),
      bw: (p.net / maxAbs) * (plotW * 0.5), rowH,
    }));
  }

  const onMove = (e) => {
    if (!bars.length || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const my = e.clientY - rect.top;
    let best = null, bd = Infinity;
    for (const b of bars) { const d = Math.abs(b.y - my); if (d < bd) { bd = d; best = b; } }
    setHover(best && bd < 16 ? best : null);
  };

  const marker = (price, color, label) => (price == null || !sy) ? null : (
    <g key={label}>
      <line x1={0} y1={sy(price)} x2={W} y2={sy(price)} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <text x={W - 2} y={sy(price) - 2} fill={color} fontSize="9" textAnchor="end">{label} {Math.round(price)}</text>
    </g>
  );

  return (
    <div className={styles.gexProfile}>
      <div className={styles.gexProfileTitle}>GEX by strike</div>
      <div className={styles.gexProfilePlot} ref={boxRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {bars.length > 0 && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            <line x1={zeroX} y1={6} x2={zeroX} y2={H - 6} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            {bars.map((b, i) => {
              const x = b.bw >= 0 ? zeroX : zeroX + b.bw;
              const hl = hover && hover.strike === b.strike;
              return (
                <g key={i}>
                  <rect x={x} y={b.y - b.rowH / 2} width={Math.abs(b.bw)} height={b.rowH} rx="1"
                    fill={b.net >= 0 ? '#22c55e' : '#ef4444'} opacity={hl ? 1 : 0.82} />
                  <text x={2} y={b.y + 2.8} fill={hl ? '#fff' : 'var(--ifm-color-emphasis-500)'} fontSize="8">{Math.round(b.strike)}</text>
                </g>
              );
            })}
            {marker(gammaFlip, '#a855f7', 'Flip')}
            {marker(putWall, '#14b8a6', 'PW')}
            {marker(callWall, '#f97316', 'CW')}
            {marker(spot, '#eab308', 'Spot')}
          </svg>
        )}
        {hover && (
          <div className={styles.gexTip} style={{ top: hover.y, left: 34 }}>
            <b>{Math.round(hover.strike)}</b> · {fmtGex(hover.net)}
          </div>
        )}
      </div>
    </div>
  );
}
