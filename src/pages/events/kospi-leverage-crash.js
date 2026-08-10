import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import TimeSeriesChart from '@site/src/components/Events/TimeSeriesChart';
import DeclineBars from '@site/src/components/Events/DeclineBars';
import LeverageBars from '@site/src/components/Events/LeverageBars';
import styles from './styles.module.css';

// KOSPI index level — the "mad bull" run to the June-19 all-time high, then the
// July collapse. Green up to the peak, red into the crash. Intermediate points
// are illustrative; the labelled endpoints (the +116% run, the 9,385.59 ATH,
// and the ~−38.6% fall to the 5,600 range) are as reported.
const KOSPI = [
  { t: 0,   value: 4340, xLabel: 'Jan 2026' },
  { t: 2.4, value: 6050 },
  { t: 4.2, value: 8000, xLabel: 'May 2026' },
  { t: 5.6, value: 9385.59, tag: 'ATH 9,385.59', sub: 'Jun 19, 2026', xLabel: 'Jun 19', tagSide: 'left' },
  { t: 6.4, value: 7040, xLabel: 'Jul 16' },
  { t: 7.3, value: 5760, tag: '−38.6%', sub: '≈5,600 · Jul 30', xLabel: 'Jul 30', tagSide: 'left' },
];

// The crash, measured a few ways. Grey = whole-index aggregates; red = the two
// worst single sessions.
const CRASH = [
  { label: 'KOSPI, Jun 22 → Jul 30', pct: -38.6, note: 'peak-to-trough', kind: 'index' },
  { label: 'From the Jun-19 all-time high', pct: -40, note: '≈ −40% off 9,385.59', kind: 'index' },
  { label: 'Tuesday, Jul 28', pct: -11, note: 'single session', kind: 'long' },
  { label: 'Wednesday, Jul 29', pct: -6, note: 'single session', kind: 'long' },
];

// The leverage stack that turned a bad month into 360,000 wipe-outs.
// Illustrative — labelled approximate — to make the mechanism obvious.
const LEV = [
  { label: 'The KOSPI itself', note: 'peak-to-trough', pct: -40 },
  { label: 'A 2× single-stock ETF', note: '~twice the move — before decay', pct: -80 },
  { label: '…held on ~3× margin', note: 'equity gone: the margin call', pct: -100 },
];

const STATS = [
  { v: '+116%', label: 'KOSPI’s 2026 run to its June peak', dir: 'up' },
  { v: '9,385.59', label: 'All-time high — June 19, 2026' },
  { v: '−38.6%', label: 'KOSPI, Jun 22 → Jul 30', dir: 'down' },
  { v: '~₩60T', label: 'Peak margin-loan balances (a record)' },
  { v: '~360,000', label: 'Retail accounts force-liquidated', dir: 'down' },
  { v: '62%', label: 'Of those wiped out, under age 35', dir: 'down' },
];

const GLOSSARY = [
  ['Leveraged ETF', 'A fund engineered to deliver a multiple of an index’s daily move — a 2× ETF aims to go up (or down) twice as much as its benchmark each day. The multiple resets every day, which quietly erodes returns in choppy markets (see “volatility decay”).'],
  ['Single-stock leveraged ETF', 'The same idea aimed at one company instead of an index — e.g. a 2× Samsung or 2× SK Hynix product. Korea let these list to retail in May 2026; by July they and their underlying shares were ~70% of daily trading volume.'],
  ['Volatility decay', 'Because a leveraged ETF resets daily, a stock that falls 10% then rises 11% (roughly flat) leaves a 2× ETF down. Over a violent month, the leveraged product loses far more than “twice the period move” — the crash made this textbook example real.'],
  ['Margin loan', 'Money borrowed from a broker to buy more stock than your cash allows. It magnifies gains and losses, and the broker can demand repayment at the worst possible moment.'],
  ['Margin call → forced liquidation', 'When a margined position falls enough, the broker demands more collateral. Miss it and the broker sells your holdings automatically — at whatever price the market offers — to repay the loan. You don’t choose the timing or the exit.'],
  ['KOSPI', 'The Korea Composite Stock Price Index — the country’s benchmark. Its two heaviest members, Samsung Electronics and SK Hynix, together make up more than half its weight, so the index is really a bet on two memory-chip makers.'],
  ['FSC / FSS', 'The Financial Services Commission (Korea’s top financial regulator) and the Financial Supervisory Service (its examiner) — the two bodies that scrambled to rewrite the leveraged-ETF rulebook mid-crash.'],
];

// Retail-leverage manias for comparison.
const MANIAS = [
  {
    name: 'China A-shares',
    year: '2015',
    vehicle: 'Margin financing (retail)',
    move: '+150% then −40%+ in months',
    response: 'Trading halts, state “national team” buying, margin crackdown',
  },
  {
    name: 'US “meme” stocks',
    year: '2021',
    vehicle: 'Short-dated call options',
    move: 'Parabolic single-name spikes, sharp reversals',
    response: 'Broker trading limits, later options-disclosure scrutiny',
  },
  {
    name: 'Korea KOSPI',
    year: '2026',
    vehicle: 'Single-stock leveraged ETFs + margin',
    move: '+116% then −38.6% (Jun 22 → Jul 30)',
    response: 'Ban on new listings, 20% caps, suitability tests, stabilization framework',
  },
];

const TIMELINE = [
  { d: '2025 – early 2026', b: 'Riding an AI-memory boom (HBM chips for AI data centres) and a government “value-up” push, the KOSPI climbs relentlessly. Officials openly encourage citizens to move savings into stocks.' },
  { d: 'May 2026', b: 'Regulators let single-stock leveraged ETFs list to retail. Assets in leveraged ETFs balloon from ~$5B at the year’s start toward $40B+. Margin-loan balances top ₩60 trillion — an all-time record, ~2.6% of GDP.' },
  { d: 'June 19, 2026', b: 'The KOSPI prints an all-time high of 9,385.59 — a reported ~116% run — briefly making Korea the world’s 6th-largest equity market. Its volatility index (VKOSPI) also hits a record 97.99: a market swinging like a small-cap.' },
  { d: 'July 10, 2026', b: 'SK Hynix — a top-two KOSPI name — lists in the U.S. This helps kick off an unwind of crowded, leveraged Korean-equity positions. (It is the same trigger behind the Situational Awareness fund blow-up the same month.)' },
  { d: 'July 16, 2026', b: 'The KOSPI is already ~25% below its June peak. The FSC announces its first measures: a halt on new single-stock leveraged ETF listings and a ban on promotional events.' },
  { d: 'July 28, 2026', b: 'The index falls ~11% in a single session as a soft Samsung earnings report, global-rate worries and China-slowdown fears converge.', crash: true },
  { d: 'July 29, 2026', b: 'Another ~6% down; Seoul’s market loses ~$2.18 trillion over the two sessions. Finance Minister Koo Yun-cheol apologizes for introducing single-stock leveraged ETFs — they “had not been considered carefully enough” — and the Ministry of Finance unveils 20% per-product caps, higher deposits, mandatory simulated trading, and a legal framework for emergency stabilization.', crash: true },
  { d: 'July 30, 2026', b: 'The KOSPI trades down into the ~5,600 range — about −38.6% from June 22, its steepest monthly drop on record. Cumulatively, ~1.2M margin accounts had hit calls and ~360,000 were force-liquidated; a reported 62% of those wiped out were under 35.', crash: true },
  { d: 'Early August 2026', b: 'Forced selling slows; some foreign brokers say the peak of the deleveraging has passed. Despite the crash, the KOSPI is still up ~41.5% in USD for 2026 — a measure of how far the “mad bull” had run.' },
];

const SOURCES = [
  { t: 'Al Jazeera — “South Korea’s stock market plunges as AI-driven boom fades” (Jul 29, 2026)', u: 'https://www.aljazeera.com/economy/2026/7/29/south-koreas-stock-market-plunges-as-ai-driven-boom-fades' },
  { t: 'Korea JoongAng Daily — “Gov’t scrambles to crack down on single-stock leveraged ETFs with Kospi in free fall”', u: 'https://www.koreajoongangdaily.com/business/govt-scrambles-to-crack-down-on-singlestock-leveraged-etfs-with-kospi-in-free-fall/12799542' },
  { t: 'Reuters (via Yahoo Finance) — “South Korea to ban new listings of single-stock leveraged ETFs”', u: 'https://finance.yahoo.com/markets/options/articles/south-korea-regulator-announce-measures-020040424.html' },
  { t: 'Reuters (via U.S. News) — “‘I couldn’t breathe’: South Korea’s frenzied stock trading exposes margin-loan risks” (Jul 20, 2026)', u: 'https://money.usnews.com/investing/news/articles/2026-07-20/i-couldnt-breathe-south-koreas-frenzied-stock-trading-exposes-margin-loan-risks' },
  { t: 'Yahoo Finance — “Explainer: What are leveraged ETFs and how are they driving South Korean markets?”', u: 'https://finance.yahoo.com/markets/options/articles/explainer-leveraged-etfs-driving-south-100011656.html' },
  { t: 'indmoney — “KOSPI Sell-Off: SK Hynix, Samsung and Korea’s Leveraged ETF Crisis Explained”', u: 'https://www.indmoney.com/blog/us-stocks/kospi-fall-explained-sk-hynix-samsung-leveraged-etf-crisis-analysis' },
  { t: 'BigGo Finance — “1.2 Million Retail Accounts Hit Margin Calls, 360,000 Liquidated…”', u: 'https://finance.biggo.com/news/1046f613-8e0d-4326-bd38-2d90a094e2cb' },
  { t: '36Kr — “South Korea Stock Market Plunges Into Bear Market After ‘Mad Bull’ Rally… President Steps In”', u: 'https://eu.36kr.com/en/p/3899037763864453' },
  { t: 'Korea Economic Institute of America — “Explaining South Korea’s Stock Market Boom”', u: 'https://keia.org/analysis/explaining-south-koreas-stock-market-boom/' },
];

function Stat({ s }) {
  const cls = s.dir === 'up' ? styles.statValUp : s.dir === 'down' ? styles.statValDown : '';
  return (
    <div className={styles.stat}>
      <div className={`${styles.statVal} ${cls}`}>{s.v}</div>
      <div className={styles.statLabel}>{s.label}</div>
    </div>
  );
}

export default function KospiLeverageCrash() {
  return (
    <Layout
      title="The KOSPI leverage crash"
      description="A post-mortem of South Korea’s summer-2026 stock-market crash: how government-blessed single-stock leveraged ETFs, stacked on record margin loans and concentrated in Samsung and SK Hynix, turned a 116% boom into a 38.6% collapse — 360,000 retail accounts force-liquidated, and an emergency rewrite of the rules.">
      <header className="hero hero--primary" style={{ padding: '2.2rem 1rem' }}>
        <div className="container">
          <Heading as="h1" className="hero__title" style={{ fontSize: '2rem' }}>
            The KOSPI leverage crash
          </Heading>
          <p className="hero__subtitle">Summer 2026 · How single-stock leveraged ETFs turned a 116% boom into a 38.6% bust</p>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <article className={styles.article}>
          <Link className={styles.backLink} to="/events">← All Big Events</Link>
          <div className={styles.articleMeta}>
            <span className={styles.developing}>Post-mortem</span>
            <span>Compiled August 2026 · ~12 min read · by Joyeb Kashyeb</span>
          </div>

          <p className={styles.dek}>
            South Korea spent a year cheering its citizens into the stock market. Then it handed them
            a loaded weapon: <strong>single-stock leveraged ETFs</strong>, stacked on top of record
            margin debt and pointed at just two chip stocks. The KOSPI ran <strong>+116%</strong> to
            an all-time high — and then fell <strong>38.6%</strong> in five weeks, force-liquidating
            roughly <strong>360,000</strong> retail accounts. The thesis (an AI-memory boom) was real.
            The <em>plumbing</em> — leverage on leverage, aimed at a two-stock index — is what detonated.
          </p>

          <div className={styles.plainBox}>
            <Heading as="h2">The short version</Heading>
            <p>
              Through 2025 and early 2026, a genuine boom in AI-memory chips (the high-bandwidth memory
              that feeds AI data centres) — plus a government “value-up” campaign that openly nudged
              households into equities — sent the KOSPI vertical. Retail investors didn’t just buy; they
              borrowed. Margin-loan balances hit a record <strong>~₩60 trillion</strong>, and in May 2026
              regulators let <strong>single-stock leveraged ETFs</strong> list to the public. By July,
              those products and their underlying shares were about <strong>70% of daily trading volume</strong>.
            </p>
            <p>
              The problem: the KOSPI’s two heaviest names, <strong>Samsung Electronics and SK Hynix,
              are more than half the index</strong> — so the whole market was a leveraged bet on two
              memory makers. When a soft Samsung report and the U.S. listing of SK Hynix cracked the
              trade in late July, leveraged ETFs and margined accounts sold in a cascade. The index fell
              ~11% in one day and ~6% the next, dropping <strong>38.6%</strong> from its June peak. The
              government banned new leveraged listings, capped positions, and the finance minister
              publicly <em>apologized</em> for approving the products. Even so, the KOSPI ended the
              episode still up ~41.5% for the year — proof of how absurd the run had been, and of how
              unevenly the pain landed: the people wiped out were the ones who bought last, with borrowed
              money, near the top.
            </p>
          </div>

          <div className={styles.stats}>
            {STATS.map((s) => <Stat key={s.label} s={s} />)}
          </div>

          <nav className={styles.toc} aria-label="Table of contents">
            <div className={styles.tocTitle}>In this post-mortem</div>
            <ol className={styles.tocList}>
              <li><a href="#s-boom"><span className={styles.tocNum}>1</span>The state-sponsored bull</a></li>
              <li><a href="#s-etf"><span className={styles.tocNum}>2</span>The accelerant: single-stock leveraged ETFs</a></li>
              <li><a href="#s-conc"><span className={styles.tocNum}>3</span>A two-stock index</a></li>
              <li><a href="#s-stack"><span className={styles.tocNum}>4</span>Leverage on leverage</a></li>
              <li><a href="#s-crack"><span className={styles.tocNum}>5</span>The crack</a></li>
              <li><a href="#s-cascade"><span className={styles.tocNum}>6</span>The liquidation cascade</a></li>
              <li><a href="#s-rules"><span className={styles.tocNum}>7</span>The rules change mid-crash</a></li>
              <li><a href="#s-twin"><span className={styles.tocNum}>8</span>The twin blow-up</a></li>
              <li><a href="#s-lessons"><span className={styles.tocNum}>★</span>Why it matters — the lessons</a></li>
            </ol>
          </nav>

          <div className={styles.glossary}>
            <strong>Terms used on this page</strong>
            <dl>
              {GLOSSARY.map(([term, def]) => (
                <React.Fragment key={term}>
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>

          <section className={styles.section}>
            <h2 id="s-boom">1. The state-sponsored bull</h2>
            <p>
              Korea’s crash didn’t start with a villain; it started with a <em>policy</em>. For over a
              year, the government ran a “value-up” programme to close the “Korea discount” — the market’s
              chronic cheapness — and encouraged ordinary households to move savings into domestic stocks.
              Layered on top was a real earnings story: the AI build-out made Korea’s memory-chip makers,
              Samsung and SK Hynix, indispensable suppliers of high-bandwidth memory.
            </p>
            <p>
              The result was one of the most violent bull markets in modern history. The KOSPI ran a
              reported <strong>+116%</strong> to an all-time high of <strong>9,385.59 on June 19, 2026</strong>,
              briefly making Korea the world’s sixth-largest equity market. Its volatility index hit a
              record <strong>97.99</strong> the same day — a benchmark that had spent decades below 30 was
              now swinging like a meme stock. That was the tell: a market this jumpy is a market running on
              borrowed money.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>KOSPI: the “mad bull” run and the July collapse</p>
              <TimeSeriesChart
                data={KOSPI}
                peakT={5.6}
                unit={{ prefix: '', suffix: '' }}
                yTicks={5}
                ariaLabel="The KOSPI index rising about 116% to an all-time high of 9,385.59 in June 2026, then collapsing about 38.6% to the 5,600 range by July 30"
              />
              <figcaption className={styles.figCaption}>
                Green is the climb, red is the collapse. Intermediate points are illustrative; the
                labelled endpoints — the reported +116% run, the 9,385.59 June-19 all-time high, and
                the ~−38.6% fall into the 5,600 range by July 30 — are as reported. Index levels this
                high are extraordinary and describe a widely-reported bubble; treat exact numbers as
                reported and the <em>shape</em> as the reliable part.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2 id="s-etf">2. The accelerant: single-stock leveraged ETFs</h2>
            <p>
              A leveraged ETF is a fund built to deliver a <em>multiple</em> of an index’s daily move —
              a 2× fund tries to rise or fall twice as much as its benchmark each day. Because the
              multiple resets daily, these products quietly bleed value in choppy markets (see
              <em> volatility decay</em> in the glossary). They are, by design, short-term trading tools,
              not buy-and-hold investments.
            </p>
            <p>
              In <strong>May 2026</strong>, Korean regulators let a more dangerous variant list to
              retail: the <strong>single-stock</strong> leveraged ETF — 2× exposure to <em>one</em>
              company. Assets across leveraged ETFs ballooned from about <strong>$5 billion</strong> at
              the start of the year toward <strong>$40 billion+</strong>, and by July the leveraged
              products plus their underlying shares made up roughly <strong>70% of the exchange’s daily
              trading volume</strong>. A market that size, dominated by daily-reset leverage, is a market
              primed to move in violent, self-reinforcing steps.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-conc">3. A two-stock index</h2>
            <p>
              Here is the structural flaw that turned a product problem into a national one.
              <strong> Samsung Electronics and SK Hynix together make up more than half of the KOSPI’s
              weight.</strong> The most popular single-stock leveraged ETFs were built on exactly those
              two names. So the leverage wasn’t spread across a diversified market — it was piled onto
              the same two chip stocks that already <em>were</em> the index.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>Two stocks, more than half the market</p>
              <svg
                viewBox="0 0 780 120"
                role="img"
                aria-label="Samsung Electronics and SK Hynix together make up more than half of the KOSPI's weight; all other stocks make up the rest"
                preserveAspectRatio="xMidYMid meet"
                style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'var(--ifm-font-family-base)' }}
              >
                {[
                  { label: 'Samsung + SK Hynix', note: 'the two memory giants', pct: 52, fill: 'var(--viz-s1)' },
                  { label: 'Every other KOSPI stock', note: '~2,000 companies', pct: 48, fill: 'var(--viz-muted)' },
                ].map((r, i) => {
                  const cy = 20 + i * 52 + 17;
                  const innerW = 780 - 230 - 60;
                  const barW = (r.pct / 100) * innerW;
                  return (
                    <g key={r.label}>
                      <text x={218} y={cy - 3} textAnchor="end" style={{ fill: 'var(--viz-ink)', fontSize: '13px', fontWeight: 600 }}>{r.label}</text>
                      <text x={218} y={cy + 12} textAnchor="end" style={{ fill: 'var(--viz-muted)', fontSize: '10.5px' }}>{r.note}</text>
                      <rect x={230} y={cy - 13} width={innerW} height={24} rx={4} fill="var(--viz-panel-bg)" />
                      <rect x={230} y={cy - 13} width={barW} height={24} rx={4} fill={r.fill} opacity={i === 0 ? 0.9 : 0.5} />
                      <text x={230 + barW + 8} y={cy + 5} style={{ fill: r.fill, fontSize: '14px', fontWeight: 800 }}>{'>'}{r.pct - 2}%</text>
                    </g>
                  );
                })}
              </svg>
              <figcaption className={styles.figCaption}>
                When two companies are more than half the benchmark, a “diversified” index fund is
                secretly a concentrated bet — and a single-stock leveraged ETF on those names is that
                bet, doubled and reset daily. Weights are approximate and drift with price.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2 id="s-stack">4. Leverage on leverage</h2>
            <p>
              Retail investors didn’t stop at the ETF’s built-in 2×. Many bought those leveraged funds
              with <strong>margin loans</strong> — borrowed money — on top. Margin balances hit a record
              <strong> ~₩60 trillion</strong> (roughly 2.6% of GDP), with retail margin trading around a
              third of activity at average leverage near 3×. Stack a 2× product on ~3× borrowed money and
              a household is carrying something like <em>six times</em> the exposure of the index it’s
              tracking — usually without realizing it.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>How a −40% index became a 100% wipe-out</p>
              <LeverageBars rows={LEV} />
              <figcaption className={styles.figCaption}>
                Illustrative and approximate. The index fell ~40% from its peak; a 2× single-stock ETF
                fell roughly twice as much (and <em>more</em> once daily-reset decay is counted); held on
                ~3× margin, that’s a full loss of the investor’s own capital — the moment the broker
                stops asking and starts selling. This is the arithmetic behind 360,000 liquidations.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2 id="s-crack">5. The crack</h2>
            <p>
              The unwind had several fuses lit at once. On <strong>July 10</strong>, SK Hynix listed in
              the U.S., which helped start an unwind of crowded, leveraged Korean-equity positions. Then a
              <strong> soft Samsung earnings report</strong> collided with worries about global interest
              rates and China’s slowdown, and a genuine question the whole market had started asking:
              <em> will the hundreds of billions pouring into AI infrastructure actually pay off soon?</em>
            </p>
            <p>
              The fall wasn’t orderly. By <strong>July 16</strong> the KOSPI was already ~25% below its
              June peak. Then came the two sessions that defined the crash: <strong>−11% on July 28</strong>
              and <strong>−6% on July 29</strong>, wiping ~$2.18 trillion off Seoul’s market in two days —
              its steepest monthly drop on record.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>The crash, measured a few ways</p>
              <DeclineBars rows={CRASH} />
              <figcaption className={styles.figCaption}>
                <span style={{ color: 'var(--viz-muted)', fontWeight: 700 }}>Grey</span> = whole-index
                aggregates (peak-to-trough and from the all-time high).{' '}
                <span style={{ color: 'var(--viz-crit)', fontWeight: 700 }}>Red</span> = the two worst
                single sessions. Percentages are approximate and vary slightly by source and measurement
                window.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2 id="s-cascade">6. The liquidation cascade</h2>
            <p>
              This is where leverage stops being a number and starts being a doom loop. As prices fell,
              margined accounts breached their thresholds; brokers issued margin calls; investors who
              couldn’t post more collateral were <strong>force-liquidated</strong> — their holdings sold
              automatically, at market, into a falling tape. Because everyone owned the <em>same</em> two
              stocks through the <em>same</em> leveraged products, that forced selling pushed those exact
              names lower, which triggered the next wave of calls. Reflexivity, in real time.
            </p>
            <p>
              The toll was staggering and young. Over the episode, roughly <strong>1.2 million</strong>
              margin accounts hit call thresholds and about <strong>360,000</strong> were force-liquidated,
              with total forced sales reported around <strong>₩2.3 trillion</strong>. A reported
              <strong> 62% of those wiped out were under the age of 35</strong> — the cohort most likely
              to have bought late, on borrowed money, into a product marketed as an easy way to double a
              bet. One Reuters dispatch was headlined with an investor’s words: <em>“I couldn’t breathe.”</em>
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-rules">7. The rules change mid-crash</h2>
            <p>
              Regulators moved while the market was still falling — a sign of how fast the product had
              outgrown its safeguards. In two steps:
            </p>
            <div className={styles.lessons}>
              <ul>
                <li>
                  <strong>July 16 — the FSC hits the brakes.</strong> Korea’s Financial Services
                  Commission halted <em>new</em> single-stock leveraged ETF listings and banned
                  promotional events around them.
                </li>
                <li>
                  <strong>July 29 — the Finance Ministry rewrites the rulebook.</strong> With the index in
                  free fall, the Ministry of Finance imposed a <strong>~20% cap</strong> on how much of a
                  portfolio can sit in a single leveraged product, raised <strong>deposit / margin
                  requirements</strong>, required investors to complete <strong>simulated (paper) trading
                  and a suitability quiz</strong> before trading them, lifted trading costs to discourage
                  churn, and readied a <strong>legal framework for emergency market-stabilization</strong>.
                </li>
                <li>
                  <strong>The apology.</strong> Finance Minister <strong>Koo Yun-cheol</strong> publicly
                  apologized for introducing single-stock leveraged ETFs, conceding they “had not been
                  considered carefully enough.” The president — who had spent a year encouraging citizens
                  into stocks — convened an emergency stabilization meeting.
                </li>
              </ul>
            </div>
            <p className={styles.analogy}>
              Note what the rules did <em>not</em> do: they didn’t ban short-selling or blame speculators
              from abroad. Korea diagnosed this correctly as a <strong>domestic product-and-leverage
              failure</strong> — too much borrowed exposure, sold to people without the guardrails
              (position caps, suitability tests, decay warnings) that the products required. The fix was
              to make the leverage harder to reach, not to prop up the price.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-twin">8. The twin blow-up</h2>
            <p>
              The KOSPI crash wasn’t an isolated Korean story — it was one face of a single global unwind
              in the AI-infrastructure trade. The very same SK Hynix U.S. listing that helped light the
              fuse in Seoul also helped detonate a <strong>$20-billion American hedge fund</strong> the
              same month: Leopold Aschenbrenner’s Situational Awareness LP, which held leveraged Korean
              chip exposure among concentrated AI-infra bets and lost roughly two-thirds of its value in
              days. One macro crack; two blow-ups; the same lesson about leverage and concentration — one
              at the level of a marquee fund, the other spread across 360,000 households.
            </p>
            <div className={styles.learnBox}>
              <strong>Read / learn more →</strong>
              <ul>
                <li><Link to="/events/situational-awareness-collapse">The Situational Awareness fund collapse</Link> — the $20B side of the same July-2026 AI-infra unwind.</li>
                <li><Link to="/docs/Finance/valuation-and-risk">Valuation &amp; risk</Link> — position limits, leverage and stress testing.</li>
                <li><Link to="/docs/Finance/derivatives">Derivatives</Link> — how leverage and daily-reset products actually behave.</li>
                <li><Link to="/terminal">Market terminal</Link> — watch chip names and the tape in real time.</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Timeline</h2>
            <ul className={styles.timeline}>
              {TIMELINE.map((e, i) => (
                <li key={i} className={`${styles.tItem} ${e.crash ? styles.tItemCrash : ''}`}>
                  <div className={styles.tDate}>{e.d}</div>
                  <p className={styles.tBody}>{e.b}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 id="s-lessons">Why it matters — the lessons</h2>
            <div className={styles.lessons}>
              <ul>
                <li>
                  <strong>Leverage on leverage is the real danger.</strong> A 2× ETF is a trading tool;
                  a 2× ETF <em>bought on 3× margin</em> is a time bomb. The multiplier that made the
                  boom feel effortless is the same one that erased the account in an afternoon.
                </li>
                <li>
                  <strong>Concentration hides inside “the index.”</strong> When two stocks are more than
                  half the market, buying the benchmark — or a leveraged product on it — is a concentrated
                  bet in disguise. Diversification you don’t actually have is the most dangerous kind.
                </li>
                <li>
                  <strong>Leveraged ETFs are not what they look like.</strong> Daily resetting means they
                  don’t deliver “2× the period return” — in a volatile month they decay well past it. A
                  product that’s fine for a day-trade is ruinous as a hold.
                </li>
                <li>
                  <strong>Forced selling is reflexive.</strong> When everyone owns the same names through
                  the same leverage, margin calls feed on themselves: selling begets lower prices begets
                  more selling. The crash was a plumbing failure, not (only) a change of mind about AI.
                </li>
                <li>
                  <strong>Averages hide the ruin.</strong> The KOSPI ended the episode still up ~41.5% for
                  2026, yet 360,000 accounts were wiped out. Index returns are a terrible measure of who
                  got hurt: the losses concentrated on those who bought last, youngest, and most levered.
                </li>
                <li>
                  <strong>Product design is risk management.</strong> Letting single-stock leveraged ETFs
                  loose on retail — without position caps or suitability tests — was the policy error the
                  finance minister apologized for. The guardrails imposed mid-crash are the ones that
                  should have shipped with the product.
                </li>
              </ul>
            </div>
            <p>
              It rhymes with every retail-leverage mania before it: a real story, a borrowing boom, a
              product that made the leverage effortless, and a reflexive unwind that punished the last
              ones in.
            </p>

            <table className={styles.posTable} style={{ marginTop: '1.4rem' }}>
              <thead>
                <tr>
                  <th>Episode</th>
                  <th>Year</th>
                  <th>Leverage vehicle</th>
                  <th>The move</th>
                  <th>Official response</th>
                </tr>
              </thead>
              <tbody>
                {MANIAS.map((m) => (
                  <tr key={m.name}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.year}</td>
                    <td>{m.vehicle}</td>
                    <td>{m.move}</td>
                    <td>{m.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.posCaption} style={{ marginBottom: 0 }}>
              Different countries, different vehicles, same physics: cheap leverage plus a crowded bet,
              unwound by a move the buyers assumed couldn’t happen.
            </p>
          </section>

          <div className={styles.sources}>
            <strong>Sources &amp; further reading</strong>
            <ol>
              {SOURCES.map((s) => (
                <li key={s.u}>
                  <a href={s.u} target="_blank" rel="noreferrer">{s.t}</a>
                </li>
              ))}
            </ol>
            <p className={styles.disclaimer}>
              Figures are as reported by news outlets and analysts in July–August 2026 and vary between
              sources — notably the exact index levels, the size of forced liquidations, and account
              counts. Treat the specific numbers as approximate and the sequence of events and the
              mechanism (leverage, concentration, forced selling) as the reliable part. Written after my
              January-2026 knowledge cutoff and compiled from the cited reporting. This is an educational
              post-mortem, not investment advice.
            </p>
          </div>
        </article>
      </main>
    </Layout>
  );
}
