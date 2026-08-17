import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

/*
 * GEX-by-strike histogram — a left sidebar next to the price chart (and it
 * stays on the left in full-screen too). Vertical axis = strike (high at top);
 * horizontal bars = net dealer gamma at that strike (green +, red −), with
 * dashed spot / call-wall / put-wall / flip markers. Renders at its true
 * measured pixel size (ResizeObserver), so it stays crisp at any height.
 */
export default function GexProfile({ profile, spot, callWall, putWall, gammaFlip }) {
  const boxRef = useRef(null);
  const [dim, setDim] = useState({ w: 188, h: 440 });

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

  let content = null;
  if (ready && W > 30 && H > 30) {
    const strikes = profile.map((p) => p.strike);
    let minK = Math.min(...strikes), maxK = Math.max(...strikes);
    for (const m of [spot, callWall, putWall, gammaFlip]) {
      if (m != null) { minK = Math.min(minK, m); maxK = Math.max(maxK, m); }
    }
    const spanK = (maxK - minK) || 1;
    minK -= spanK * 0.04; maxK += spanK * 0.04;
    const maxAbs = Math.max(...profile.map((p) => Math.abs(p.net)), 1);

    const padT = 8, padB = 8, padR = 46, padL = 6;
    const plotW = W - padL - padR;
    const zeroX = padL + plotW * 0.44;
    const sy = (k) => padT + ((maxK - k) / (maxK - minK)) * (H - padT - padB);
    const rowH = Math.max(1.5, ((H - padT - padB) / profile.length) * 0.7);

    const marker = (price, color, label) => (price == null ? null : (
      <g key={label}>
        <line x1={padL} y1={sy(price)} x2={W - padR + 40} y2={sy(price)}
          stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.85" />
        <text x={W - padR + 42} y={sy(price) + 3.5} fill={color} fontSize="10" textAnchor="end">
          {label} {Math.round(price)}
        </text>
      </g>
    ));

    content = (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}
        role="img" aria-label="Net gamma exposure by strike">
        <line x1={zeroX} y1={padT} x2={zeroX} y2={H - padB} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        {profile.map((p, i) => {
          const bw = (p.net / maxAbs) * plotW * 0.5;
          const y = sy(p.strike) - rowH / 2;
          const x = bw >= 0 ? zeroX : zeroX + bw;
          return <rect key={i} x={x} y={y} width={Math.abs(bw)} height={rowH} rx="1"
            fill={p.net >= 0 ? '#22c55e' : '#ef4444'} opacity="0.85" />;
        })}
        <text x={padL} y={sy(maxK) + 9} fill="var(--ifm-color-emphasis-500)" fontSize="9">{Math.round(maxK)}</text>
        <text x={padL} y={sy(minK) - 3} fill="var(--ifm-color-emphasis-500)" fontSize="9">{Math.round(minK)}</text>
        {marker(gammaFlip, '#a855f7', 'Flip')}
        {marker(putWall, '#14b8a6', 'PW')}
        {marker(callWall, '#f97316', 'CW')}
        {marker(spot, '#eab308', 'Spot')}
      </svg>
    );
  }

  return (
    <div className={styles.gexProfile}>
      <div className={styles.gexProfileTitle}>GEX by strike</div>
      <div className={styles.gexProfilePlot} ref={boxRef}>{content}</div>
    </div>
  );
}
