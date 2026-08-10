import {useEffect, useState} from 'react';
import clsx from 'clsx';
import katex from 'katex';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

// Render a LaTeX string to KaTeX HTML for the hero equation chips.
function tex(s) {
  return {__html: katex.renderToString(s, {throwOnError: false})};
}

// ── Monochrome inline-SVG icon set (stroke = currentColor, 1.5px, 24px) ──
const P = {fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round'};
function Icon({name}) {
  const svg = {
    finance: (
      <>
        <line x1="4" y1="20" x2="20" y2="20" {...P} />
        <rect x="6" y="9" width="3" height="7" {...P} /><line x1="7.5" y1="6" x2="7.5" y2="9" {...P} /><line x1="7.5" y1="16" x2="7.5" y2="18" {...P} />
        <rect x="12.5" y="12" width="3" height="5" {...P} /><line x1="14" y1="9" x2="14" y2="12" {...P} /><line x1="14" y1="17" x2="14" y2="19" {...P} />
        <path d="M18 5l0 6" {...P} /><rect x="16.5" y="7" width="3" height="4" {...P} />
      </>
    ),
    math: (
      <>
        <path d="M17 5H7l6 7-6 7h10" {...P} />
      </>
    ),
    stats: (
      <>
        <path d="M4 5v15h16" {...P} />
        <path d="M4 15c3 0 3-7 6-7s3 5 6 5 3-6 4-6" {...P} />
      </>
    ),
    probability: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" {...P} />
        <circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none" />
      </>
    ),
    code: (
      <>
        <path d="M8.5 8L4.5 12l4 4" {...P} />
        <path d="M15.5 8l4 4-4 4" {...P} />
        <line x1="13" y1="6" x2="11" y2="18" {...P} />
      </>
    ),
    econ: (
      <>
        <path d="M4 20L20 4" {...P} />
        <path d="M4 8c5 0 11 4 16 8" {...P} opacity="0.55" />
        <path d="M4 15c5-4 11-8 16-8" {...P} opacity="0.55" />
      </>
    ),
    ml: (
      <>
        <circle cx="5" cy="12" r="2" {...P} /><circle cx="14" cy="6" r="2" {...P} /><circle cx="14" cy="18" r="2" {...P} /><circle cx="20" cy="12" r="2" {...P} />
        <path d="M7 12l5-5M7 12l5 5M16 7l3 4M16 17l3-4" {...P} />
      </>
    ),
    notebook: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2" {...P} />
        <line x1="9" y1="4" x2="9" y2="20" {...P} />
        <line x1="12" y1="9" x2="16" y2="9" {...P} /><line x1="12" y1="13" x2="16" y2="13" {...P} />
      </>
    ),
    run: (
      <>
        <circle cx="12" cy="12" r="8.5" {...P} />
        <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
      </>
    ),
    labs: (
      <>
        <line x1="4" y1="8" x2="20" y2="8" {...P} /><circle cx="9" cy="8" r="2.2" {...P} fill="var(--surface)" />
        <line x1="4" y1="16" x2="20" y2="16" {...P} /><circle cx="15" cy="16" r="2.2" {...P} fill="var(--surface)" />
      </>
    ),
    quiz: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" {...P} />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" {...P} />
      </>
    ),
    terminal: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" {...P} />
        <path d="M7 10l2.5 2L7 14" {...P} /><line x1="12" y1="14" x2="16" y2="14" {...P} />
      </>
    ),
  }[name];
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      {svg}
    </svg>
  );
}

const SUBJECTS = [
  {icon: 'finance', title: 'Finance', blurb: 'Options, payoffs and Black–Scholes, with live labs you can drag and explore.', meta: 'Pricer · Greeks · payoff explorer', status: 'live', to: '/docs/Finance/derivatives'},
  {icon: 'math', title: 'Mathematics', blurb: 'Calculus, linear algebra, and the stochastic calculus behind every pricing model.', meta: 'Live GBM simulator · runnable Python', status: 'live', to: '/docs/Mathematics/stochastic-calculus'},
  {icon: 'stats', title: 'Statistics', blurb: 'Inference, regression and time series — drawing conclusions you can defend.', meta: 'ANOVA · Bayes · hypothesis labs', status: 'live', to: '/docs/Statistics/bayesian-inference'},
  {icon: 'probability', title: 'Probability', blurb: 'Distributions and stochastic processes — the language uncertainty is written in.', meta: 'Interactive bell-curve lab · CLT', status: 'live', to: '/docs/Probability/distributions'},
  {icon: 'code', title: 'Programming', blurb: 'A full Python course where every code block runs in your browser — no setup at all.', meta: 'Five modules · FIFO ledger project', status: 'live', to: '/docs/Programming/Python'},
  {icon: 'econ', title: 'Economics', blurb: 'Rates, macro and policy — the forces that move the markets quants model.', meta: 'Compound-interest lab · quiz', status: 'progress', to: '/docs/Economics/interest-rates'},
  {icon: 'ml', title: 'Machine Learning', blurb: 'From regression to deep learning, aimed squarely at financial applications.', meta: 'Eight lessons · scikit-learn', status: 'live', to: '/docs/Machine_Learning/overview'},
];

const FEATURES = [
  {icon: 'notebook', title: 'A real Python notebook', blurb: 'Jupyter-style cells with numpy, pandas and matplotlib — running fully in your browser.', to: '/notebook'},
  {icon: 'run', title: 'Runnable Python', blurb: 'Every Python snippet on the site has a Run button. Edit it, break it, learn from it.', to: '/docs/Programming/Python'},
  {icon: 'labs', title: 'Interactive labs', blurb: 'Price options with sliders, simulate Brownian motion, bend the bell curve.', to: '/docs/Finance/derivatives'},
  {icon: 'quiz', title: 'Quizzes on completed topics', blurb: 'Instant-feedback questions with explanations at the end of every finished lesson.', to: '/tutorial'},
  {icon: 'terminal', title: 'A live market terminal', blurb: 'Charts and market news, right inside the site — theory meets the tape.', to: '/terminal'},
];

function useLiveBTCData() {
  const [data, setData] = useState({ loading: true, points: [], error: null });

  useEffect(() => {
    let mounted = true;
    let ws = null;

    const initData = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=1');
        if (!res.ok) throw new Error('API Error');
        const json = await res.json();
        
        const initialPoints = json.map(d => ({
          time: d[0],
          close: d[4]
        }));
        
        if (mounted) {
          setData({ loading: false, points: initialPoints, error: null });
          
          // Connect to Kraken WebSocket for instant tick-by-tick live updates
          ws = new WebSocket('wss://ws.kraken.com/');
          ws.onopen = () => {
            ws.send(JSON.stringify({ event: 'subscribe', pair: ['XBT/USD'], subscription: { name: 'ticker' } }));
          };
          ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (Array.isArray(message) && message[1] && message[1].c) {
              const livePrice = parseFloat(message[1].c[0]);
              setData(prev => {
                if (prev.points.length === 0) return prev;
                const newPoints = [...prev.points];
                // Wiggle the very last point on the chart to the exact live tick price
                newPoints[newPoints.length - 1] = {
                  ...newPoints[newPoints.length - 1],
                  close: livePrice
                };
                return { ...prev, points: newPoints };
              });
            }
          };
        }
      } catch (err) {
        if (mounted) {
          setData(prev => ({ ...prev, loading: false, error: err.message }));
        }
      }
    };
    
    initData();
    
    return () => { 
      mounted = false; 
      if (ws) ws.close(); 
    };
  }, []);

  return data;
}

function Tearsheet({ data }) {
  if (data.loading || data.points.length === 0) {
    return (
      <svg viewBox="0 0 440 300" className={styles.tearsheet} role="img" aria-label="Loading BTC chart...">
        <rect x="40" y="26" width="366" height="228" rx="8" fill="var(--bg-sunken)" stroke="var(--line-strong)" />
      </svg>
    );
  }

  const { points } = data;
  const pMin = Math.min(...points.map(p => p.close));
  const pMax = Math.max(...points.map(p => p.close));
  const currentPrice = points[points.length - 1].close;
  const prevPrice = points.length > 1 ? points[points.length - 2].close : currentPrice;
  const isUp = currentPrice >= prevPrice;

  const pad = (pMax - pMin) * 0.1 || currentPrice * 0.01;
  const yMin = pMin - pad;
  const yMax = pMax + pad;
  const range = yMax - yMin;

  const width = 366;
  const height = 228;
  const xOffset = 40;
  const yOffset = 26;

  const scaled = points.map((p, i) => {
    const x = xOffset + (i / (points.length - 1)) * width;
    const y = yOffset + height - ((p.close - yMin) / range) * height;
    return [x, y];
  });

  const equityPath = scaled.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const areaPath = `${equityPath} L${xOffset + width} ${yOffset + height} L${xOffset} ${yOffset + height} Z`;

  const fmtTime = (ts) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };
  
  const labelsX = [
    fmtTime(points[0].time),
    fmtTime(points[Math.floor(points.length * 0.33)].time),
    fmtTime(points[Math.floor(points.length * 0.66)].time),
    fmtTime(points[points.length - 1].time)
  ];

  const formatY = (val) => val > 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0);
  const color = isUp ? "var(--g-500)" : "var(--r-500)";

  return (
    <svg viewBox="0 0 440 300" className={styles.tearsheet} role="img" aria-label="Live BTC chart">
      <defs>
        <linearGradient id="equityArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id="plotClip"><rect x="40" y="26" width="366" height="228" /></clipPath>
      </defs>

      <rect x="40" y="26" width="366" height="228" rx="8" fill="var(--bg-sunken)" stroke="var(--line-strong)" />

      {[yOffset + height*0.25, yOffset + height*0.5, yOffset + height*0.75].map((y) => (
        <line key={`h${y}`} x1="40" x2="406" y1={y} y2={y} stroke="var(--line-faint)" />
      ))}
      {[xOffset + width*0.33, xOffset + width*0.66].map((x) => (
        <line key={`v${x}`} x1={x} x2={x} y1="26" y2="254" stroke="var(--line-faint)" />
      ))}

      <g clipPath="url(#plotClip)">
        <path className={styles.area} d={areaPath} fill="url(#equityArea)" />
        <path className={styles.equity} d={equityPath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g className={styles.tip}>
        <line x1="400" x2="400" y1="30" y2="250" stroke="var(--line-strong)" strokeDasharray="2 3" />
        <circle cx="400" cy={scaled[scaled.length - 1][1]} r="4" fill={color} />
      </g>

      <g fontFamily="var(--ff-mono)" fontSize="9" fill="var(--tx-muted)">
        <text x="410" y="32">{formatY(pMax)}</text>
        <text x="410" y="145">{formatY((pMax + pMin) / 2)}</text>
        <text x="410" y="254">{formatY(pMin)}</text>
        
        <text x="44" y="270">{labelsX[0]}</text>
        <text x="144" y="270">{labelsX[1]}</text>
        <text x="264" y="270">{labelsX[2]}</text>
        <text x="374" y="270">{labelsX[3]}</text>
      </g>
    </svg>
  );
}

function LiveClock() {
  const [t, setT] = useState('--:--:--');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago', hour12: false,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={styles.tbClock}><span className="p-pip" />{t} CT</span>;
}

export default function Home() {
  const btcData = useLiveBTCData();

  // Reveal-on-scroll — one tiny IntersectionObserver.
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, {threshold: 0.15, rootMargin: '0px 0px -8% 0px'});
    els.forEach((el, i) => { el.style.setProperty('--i', i % 8); io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <Layout
      title="Quantitative Finance"
      description="Interactive quantitative finance notes by Joyeb Kashyeb — math, markets and machine learning with runnable Python and hands-on pricing labs.">
      <header className={styles.heroWrap}>
        <div className={clsx('container', styles.heroContainer)}>
          <div className={styles.terminal}>
            <div className={styles.titlebar}>
              <span className={styles.tbDots}><i /><i /><i /></span>
              <span className={styles.tbLabel}>PHOSPHOR&nbsp;//&nbsp;QUANT-DESK v1.0</span>
              <LiveClock />
            </div>
            <div className={styles.termBody}>
              <div className={styles.heroText}>
                <p className={styles.eyebrow}>▮ Signal acquired · quantitative finance</p>
                <Heading as="h1" className={styles.heroTitle}>
                  Learning to think
                  <br />
                  in <span className={styles.accent}>probabilities</span>.
                </Heading>
                <p className={styles.heroSub}>
                  I'm Joyeb — documenting my path into quantitative finance. Every topic here is
                  interactive: run the Python, drag the sliders, take the quizzes. If I can't play
                  with an idea, I don't trust that I've learned it.
                </p>
                <div className={styles.heroButtons}>
                  <Link className="button button--primary button--lg" to="/docs/Introduction_and_Goals/overview">
                    Start learning →
                  </Link>
                  <Link className="button button--secondary button--outline button--lg" to="/roadmap">
                    See the roadmap
                  </Link>
                </div>
                <div className={styles.statRail}>
                  <div className={styles.statBlock}><span className={styles.statNum}>914</span><span className={styles.statLabel}>Symbols</span></div>
                  <span className={styles.statDivider} />
                  <div className={styles.statBlock}><span className={styles.statNum}>20</span><span className={styles.statLabel}>Flows</span></div>
                  <span className={styles.statDivider} />
                  <div className={styles.statBlock}><span className={styles.statNum}>7</span><span className={styles.statLabel}>Subjects</span></div>
                </div>
              </div>
              <div className={styles.heroVisual}>
                <Tearsheet data={btcData} />
                <span
                  className={clsx(styles.formula, styles.formulaTop)}
                  dangerouslySetInnerHTML={tex('dS = \\mu S\\,dt + \\sigma S\\,dW')}
                />
                <span
                  className={clsx(styles.formula, styles.formulaBottom)}
                  dangerouslySetInnerHTML={tex('\\Delta = \\dfrac{\\partial V}{\\partial S}')}
                />
                <span className={styles.readoutChip}>
                  {btcData.loading || btcData.points.length === 0 
                    ? 'BTC $---' 
                    : `BTC $${btcData.points[btcData.points.length - 1].close.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                  }&nbsp;<b>{(!btcData.loading && btcData.points.length > 1 && btcData.points[btcData.points.length - 1].close >= btcData.points[btcData.points.length - 2].close) ? '▲' : '▼'}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead} data-reveal>
              <p className={styles.sectionEyebrow}>01 — The curriculum</p>
              <Heading as="h2" className={styles.sectionTitle}>Seven subjects, one goal</Heading>
              <p className={styles.sectionSub}>The skill set of a working quant — each area built to be played with, not just read.</p>
            </div>
            <div className={styles.grid3}>
              {SUBJECTS.map((s) => (
                <Link key={s.title} to={s.to} className={clsx('p-card', styles.subjectCard)} data-reveal>
                  <span className={styles.subjectTop}>
                    <span className={styles.subjectIcon}><Icon name={s.icon} /></span>
                    <span className={clsx(styles.subjectStatus, s.status === 'live' ? styles.statusLive : styles.statusProgress)}>
                      {s.status === 'live' ? '● Live' : '◐ In progress'}
                    </span>
                  </span>
                  <span className={styles.subjectTitle}>{s.title}</span>
                  <span className={styles.subjectBlurb}>{s.blurb}</span>
                  <span className={styles.subjectMeta}>{s.meta}</span>
                  <span className={styles.subjectCta}>Open notes →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionAlt)}>
          <div className="container">
            <div className={styles.sectionHead} data-reveal>
              <p className={styles.sectionEyebrow}>02 — Built to be played with</p>
              <Heading as="h2" className={styles.sectionTitle}>Reading is easy. This site makes you <em>do</em> it.</Heading>
            </div>
            <div className={styles.grid4}>
              {FEATURES.map((f) => (
                <Link key={f.title} to={f.to} className={clsx('p-card', styles.featureCard)} data-reveal>
                  <span className={styles.featureIcon}><Icon name={f.icon} /></span>
                  <span className={styles.featureTitle}>{f.title}</span>
                  <span className={styles.featureBlurb}>{f.blurb}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaBand}>
          <span className={styles.ctaGlow} aria-hidden="true" />
          <div className={clsx('container', styles.ctaInner)} data-reveal>
            <p className={styles.sectionEyebrow}>03 — Theory in one tab, markets in the other</p>
            <Heading as="h2" className={styles.ctaTitle}>The desk is already streaming.</Heading>
            <p className={styles.ctaSub}>The built-in terminal streams live charts and news while you study — in Central Time, like the exchanges.</p>
            <Link className="button button--primary button--lg" to="/terminal">
              Open the terminal →
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
