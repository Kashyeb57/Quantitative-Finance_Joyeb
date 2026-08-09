// Shared math + SVG helpers for the interactive labs.

export function linspace(a, b, n) {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

// Standard normal PDF / CDF (Abramowitz & Stegun 7.1.26 for the CDF)
export function normPDF(x, mu = 0, sigma = 1) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
export function normCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
}

// Inverse standard-normal CDF via bisection on normCDF (good to ~1e-5)
export function normInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -8;
  let hi = 8;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (normCDF(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Log-gamma (Lanczos approximation) — for the Student-t density
export function lgamma(x) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  }
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Student-t probability density with df degrees of freedom
export function tPDF(x, df) {
  const lead = lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  return Math.exp(lead) * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}

// Student-t CDF via Simpson integration of the (symmetric) density
export function tCDF(x, df) {
  if (!isFinite(x)) return x > 0 ? 1 : 0;
  const a = Math.abs(x);
  const n = 800; // even
  const h = a / n;
  let s = tPDF(0, df) + tPDF(a, df);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * tPDF(i * h, df);
  const half = (s * h) / 3; // area from 0 to |x|
  return x >= 0 ? 0.5 + half : 0.5 - half;
}

// Inverse Student-t CDF via bisection (critical values)
export function tInv(p, df) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -60;
  let hi = 60;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (tCDF(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Regularized lower incomplete gamma P(a, x) — series + continued fraction
// (Numerical Recipes). Underlies the chi-square CDF.
export function lowerGammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let ap = a;
    let del = 1 / a;
    let sum = del;
    for (let i = 0; i < 300; i++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  return 1 - q;
}

// Chi-square CDF with k degrees of freedom
export function chiSquareCDF(x, k) {
  if (x <= 0) return 0;
  return lowerGammaP(k / 2, x / 2);
}

// Chi-square probability density with k degrees of freedom
export function chiSquarePDF(x, k) {
  if (x <= 0) return 0;
  return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - lgamma(k / 2));
}

// Inverse chi-square CDF via bisection (critical values)
export function chiSquareInv(p, k) {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0;
  let hi = 1000;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (chiSquareCDF(mid, k) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Box–Muller standard normal sample
export function randn() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Linear scale: data domain -> pixel range
export function scaleLinear([d0, d1], [r0, r1]) {
  const m = (r1 - r0) / (d1 - d0 || 1);
  const s = (x) => r0 + (x - d0) * m;
  s.invert = (px) => d0 + (px - r0) / m;
  return s;
}

// SVG path from [x, y] pixel points
export function linePath(pts) {
  if (!pts.length) return '';
  return pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join('');
}

// "Nice" tick values covering [min, max]
export function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const step0 = Math.pow(10, Math.floor(Math.log10(span / count)));
  const err = (count * step0) / span;
  let step = step0;
  if (err <= 0.15) step = step0 * 10;
  else if (err <= 0.35) step = step0 * 5;
  else if (err <= 0.75) step = step0 * 2;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    ticks.push(+v.toFixed(10));
  }
  return ticks;
}

export function fmt(x, digits = 2) {
  if (!isFinite(x)) return '—';
  const ax = Math.abs(x);
  if (ax >= 1e6) return (x / 1e6).toFixed(1) + 'M';
  if (ax >= 1e4) return Math.round(x).toLocaleString('en-US');
  return x.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function fmtMoney(x, digits = 2) {
  if (!isFinite(x)) return '—';
  const sign = x < 0 ? '−$' : '$';
  return sign + fmt(Math.abs(x), digits);
}
