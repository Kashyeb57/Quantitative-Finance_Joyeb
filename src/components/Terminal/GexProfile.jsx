import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

/*
 * GEX-by-strike histogram sidebar. Vertical axis = strike (high at top),
 * horizontal bars = net dealer gamma at that strike (green +, red −). The
 * strike price is printed at each bar's tip in the bar's colour. When a
 * priceRange is supplied (the chart's visible price window) the panel zooms
 * to match the chart, so scrolling/zooming the chart zooms the profile too.
 * Hovering a bar shows its exact net GEX.
 */
const fmtGex = (v) => {
  const a = Math.abs(v), s = v < 0 ? '−' : '+';
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return s + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return s + (a / 1e3).toFixed(0) + 'K';
  return s + a.toFixed(0);
};

export default function GexProfile({ profile, spot, callWall, putWall, gammaFlip, priceRange }) {
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

  let bars = [], sy = null, zeroX = 0, rowH = 8, minK = 0, maxK = 0;
  if (ready && W > 30 && H > 30) {
    if (priceRange && priceRange[1] > priceRange[0]) {
      minK = priceRange[0]; maxK = priceRange[1];          // follow the chart's zoom
    } else {
      const ks = profile.map((p) => p.strike);
      minK = Math.min(...ks); maxK = Math.max(...ks);
      for (const m of [spot, callWall, putWall, gammaFlip]) if (m != null) { minK = Math.min(minK, m); maxK = Math.max(maxK, m); }
      const sp = (maxK - minK) || 1; minK -= sp * 0.04; maxK += sp * 0.04;
    }
    const maxAbs = Math.max(...profile.map((p) => Math.abs(p.net)), 1);
    const padT = 6, padB = 6, padR = 6, padL = 6;
    const plotW = W - padL - padR;
    zeroX = padL + plotW * 0.4;
    sy = (k) => padT + ((maxK - k) / (maxK - minK)) * (H - padT - padB);
    const vis = profile.filter((p) => p.strike >= minK && p.strike <= maxK);
    bars = vis.map((p) => ({ strike: p.strike, net: p.net, y: sy(p.strike), bw: (p.net / maxAbs) * (plotW * 0.46) }));
    if (bars.length > 1) {
      const ys = bars.map((b) => b.y).sort((a, b) => a - b);
      const gaps = [];
      for (let i = 1; i < ys.length; i++) gaps.push(ys[i] - ys[i - 1]);
      gaps.sort((a, b) => a - b);
      rowH = Math.max(2, Math.min(gaps[Math.floor(gaps.length / 2)] * 0.72, 22));
    }
  }

  const onMove = (e) => {
    if (!bars.length || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const my = e.clientY - rect.top;
    let best = null, bd = Infinity;
    for (const b of bars) { const d = Math.abs(b.y - my); if (d < bd) { bd = d; best = b; } }
    setHover(best && bd < 16 ? best : null);
  };

  const marker = (price, color, label) => (price == null || !sy || price < minK || price > maxK) ? null : (
    <g key={label}>
      <line x1={0} y1={sy(price)} x2={W} y2={sy(price)} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <text x={W - 2} y={sy(price) - 2} fill={color} fontSize="9" textAnchor="end">{label} {Math.round(price)}</text>
    </g>
  );

  const labelFont = Math.max(6.5, Math.min(rowH * 0.9, 10));

  return (
    <div className={styles.gexProfile}>
      <div className={styles.gexProfileTitle}>GEX by strike</div>
      <div className={styles.gexProfilePlot} ref={boxRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {bars.length > 0 && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            <line x1={zeroX} y1={4} x2={zeroX} y2={H - 4} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {bars.map((b, i) => {
              const x = b.bw >= 0 ? zeroX : zeroX + b.bw;
              const hl = hover && hover.strike === b.strike;
              const col = b.net >= 0 ? '#22c55e' : '#ef4444';
              const tx = b.bw >= 0 ? zeroX + b.bw + 3 : zeroX + b.bw - 3;
              return (
                <g key={i}>
                  <rect x={x} y={b.y - rowH / 2} width={Math.abs(b.bw)} height={rowH} rx="1" fill={col} opacity={hl ? 1 : 0.82} />
                  {rowH >= 6 && (
                    <text x={tx} y={b.y + labelFont * 0.34} fill={col} fontSize={labelFont}
                      fontWeight={hl ? 700 : 400} textAnchor={b.bw >= 0 ? 'start' : 'end'}>
                      {Math.round(b.strike)}
                    </text>
                  )}
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
          <div className={styles.gexTip} style={{ top: hover.y, left: zeroX + 8 }}>
            <b>{Math.round(hover.strike)}</b> · {fmtGex(hover.net)}
          </div>
        )}
      </div>
    </div>
  );
}
