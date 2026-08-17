import React from 'react';
import styles from './styles.module.css';

/*
 * GEX-by-strike histogram — a left sidebar next to the price chart.
 * Vertical axis = strike (aligned to price, high at top); horizontal bars =
 * net dealer gamma at that strike (green positive, red negative). Dashed
 * markers for spot, call wall, put wall and the gamma flip. Re-prices live
 * with the rest of the overlay (the parent recomputes `profile` every ~2s).
 */
export default function GexProfile({ profile, spot, callWall, putWall, gammaFlip }) {
  if (!profile || profile.length < 2) return null;

  const strikes = profile.map((p) => p.strike);
  let minK = Math.min(...strikes);
  let maxK = Math.max(...strikes);
  for (const m of [spot, callWall, putWall, gammaFlip]) {
    if (m != null) { minK = Math.min(minK, m); maxK = Math.max(maxK, m); }
  }
  const span = maxK - minK || 1;
  minK -= span * 0.04; maxK += span * 0.04;
  const maxAbs = Math.max(...profile.map((p) => Math.abs(p.net)), 1);

  const W = 190, H = 460, padT = 8, padB = 8, padR = 42, padL = 6;
  const plotW = W - padL - padR;
  const zeroX = padL + plotW * 0.44;
  const sy = (k) => padT + ((maxK - k) / (maxK - minK)) * (H - padT - padB);
  const rowH = Math.max(2, ((H - padT - padB) / profile.length) * 0.7);

  const marker = (price, color, label) => (price == null ? null : (
    <g key={label}>
      <line x1={padL} y1={sy(price)} x2={W - padR + 36} y2={sy(price)}
        stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.85" />
      <text x={W - padR + 38} y={sy(price) + 3} fill={color} fontSize="9" textAnchor="end">
        {label} {Math.round(price)}
      </text>
    </g>
  ));

  return (
    <div className={styles.gexProfile}>
      <div className={styles.gexProfileTitle}>GEX by strike</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}
        role="img" aria-label="Net gamma exposure by strike">
        {/* zero baseline */}
        <line x1={zeroX} y1={padT} x2={zeroX} y2={H - padB} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        {/* bars */}
        {profile.map((p, i) => {
          const w = (p.net / maxAbs) * plotW * 0.5;
          const y = sy(p.strike) - rowH / 2;
          const x = w >= 0 ? zeroX : zeroX + w;
          return <rect key={i} x={x} y={y} width={Math.abs(w)} height={rowH} rx="1"
            fill={p.net >= 0 ? '#22c55e' : '#ef4444'} opacity="0.85" />;
        })}
        {/* strike range labels */}
        <text x={padL} y={sy(maxK) + 8} fill="var(--ifm-color-emphasis-500)" fontSize="8">{Math.round(maxK)}</text>
        <text x={padL} y={sy(minK) - 2} fill="var(--ifm-color-emphasis-500)" fontSize="8">{Math.round(minK)}</text>
        {/* level markers */}
        {marker(gammaFlip, '#a855f7', 'Flip')}
        {marker(putWall, '#14b8a6', 'PW')}
        {marker(callWall, '#f97316', 'CW')}
        {marker(spot, '#eab308', 'Spot')}
      </svg>
    </div>
  );
}
