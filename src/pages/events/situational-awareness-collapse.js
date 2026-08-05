import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import TimeSeriesChart from '@site/src/components/Events/TimeSeriesChart';
import LeverageBars from '@site/src/components/Events/LeverageBars';
import styles from './styles.module.css';

// Assets-under-management trajectory (t = months since the Nov-2024 launch).
// The line runs green up to the July-2026 peak, then red into the fire sale.
const AUM = [
  { t: 0,  value: 0.225, tag: 'Launch', sub: '$225M', xLabel: 'Nov 2024', tagSide: 'right' },
  { t: 4,  value: 1.2 },
  { t: 8,  value: 4,  xLabel: 'Jul 2025' },
  { t: 12, value: 9 },
  { t: 16, value: 18, xLabel: 'Mar 2026' },
  { t: 20, value: 45, tag: 'Peak ~$45B', xLabel: 'Jul 2026', tagSide: 'left' },
  { t: 21, value: 10, tag: 'Fire sale', sub: '~$10B left', xLabel: 'end of Jul', tagSide: 'left' },
];

const LEVERAGE = [
  { label: 'The AI basket, unlevered', note: 'Oracle, AMD, memory, power', pct: -17 },
  { label: 'Fund equity at ~4× leverage', note: 'what investors actually felt', pct: -67 },
];

const STATS = [
  { v: '+439%', label: 'Net return through June 2026', dir: 'up' },
  { v: '~$45B', label: 'Reported peak assets (from $225M)' },
  { v: '~4×', label: 'Leverage (reported up to ~400%)' },
  { v: '−67%', label: 'Loss in July 2026 alone', dir: 'down' },
  { v: '~$16B', label: 'Stock dumped in ~24 hours' },
  { v: '~$10B', label: 'Left afterward (mostly private)', dir: 'down' },
];

const TIMELINE = [
  { d: '2023', b: 'Aschenbrenner joins OpenAI’s “Superalignment” team (under Jan Leike and Ilya Sutskever), working on controlling AI smarter than humans.' },
  { d: 'April 2024', b: 'OpenAI fires him, citing an alleged information leak. He disputes it, saying the real trigger was a security memo he wrote warning about foreign espionage. The Superalignment team dissolves soon after.' },
  { d: 'June 2024', b: 'He publishes “Situational Awareness: The Decade Ahead,” a ~165-page manifesto arguing AGI arrives around 2027 and superintelligence soon after. It goes viral across tech and policy circles.' },
  { d: 'Late 2024', b: 'He launches Situational Awareness LP — an AI-focused hedge fund — with about $225 million, backed by Stripe’s Patrick and John Collison, Daniel Gross and Nat Friedman.' },
  { d: 'Through mid-2026', b: 'Riding the AI-infrastructure boom with heavy leverage, the fund posts a reported +439% net return and assets balloon toward a reported ~$45 billion — one of the great runs in hedge-fund history.' },
  { d: 'Early–mid July 2026', b: 'AI and semiconductor stocks roll over. Oracle and AMD each fall roughly 20%; smaller AI-infra and Asian tech names fall further. The fund’s short-software “hedge” fails to offset the damage.' },
  { d: 'July 24, 2026', b: 'Aschenbrenner tells investors the fund “failed to escape” the correction, particularly in Asian tech.', crash: true },
  { d: '~July 29–30, 2026', b: 'With ~4× leverage, margin calls cascade. Prime brokers (Goldman, JPMorgan, BofA, Citi) push the fund to unwind. It dumps its entire ~$16 billion public-equity book in about 24 hours — largely to Ken Griffin’s Citadel. Month-to-date loss: about −67%. Assets fall to ~$10 billion, mostly an illiquid stake in Anthropic.', crash: true },
];

const SOURCES = [
  { t: 'CNBC — “AI investor Leopold Aschenbrenner forced to unwind all public stock positions after steep losses” (Jul 30, 2026)', u: 'https://www.cnbc.com/2026/07/30/leopold-aschenbrenners-hedge-fund-is-facing-steep-ai-losses.html' },
  { t: 'CNBC — “Situational Awareness fund: $45B to fire sale” (Jul 31, 2026)', u: 'https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html' },
  { t: 'Bloomberg — “Situational Awareness Assets Fall to $10 Billion After Losses” (Jul 30, 2026)', u: 'https://www.bloomberg.com/news/articles/2026-07-30/situational-awareness-assets-fall-to-10-billion-after-losses' },
  { t: 'TradingKey — “How leverage amplified the crisis”', u: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262066744-ex-openai-researcher-leopold-aschenbrenner-situational-awareness-blows-up-tradingkey' },
  { t: 'CryptoBriefing — “Situational Awareness dumps entire public stock portfolio in margin-fueled fire sale”', u: 'https://cryptobriefing.com/situational-awareness-hedge-fund-liquidates-portfolio/' },
  { t: 'Wikipedia — Leopold Aschenbrenner', u: 'https://en.wikipedia.org/wiki/Leopold_Aschenbrenner' },
  { t: 'The video that prompted this write-up (YouTube)', u: 'https://youtu.be/-h8hPIlMgvs' },
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

export default function SituationalAwarenessCollapse() {
  return (
    <Layout
      title="The Situational Awareness fund collapse"
      description="How Leopold Aschenbrenner turned $225M into a reported ~$45B AI-infrastructure fund and then lost roughly two-thirds of it in one month — a textbook leverage blow-up, explained in full with charts.">
      <header className="hero hero--primary" style={{ padding: '2.2rem 1rem' }}>
        <div className="container">
          <Heading as="h1" className="hero__title" style={{ fontSize: '2rem' }}>
            The Situational Awareness fund collapse
          </Heading>
          <p className="hero__subtitle">July 2026 · A textbook leverage blow-up</p>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <article className={styles.article}>
          <Link className={styles.backLink} to="/events">← All Big Events</Link>

          <p className={styles.dek}>
            The person who wrote the most famous essay arguing that AI would change everything built
            a hedge fund on exactly that thesis — and then got liquidated when the AI trade
            corrected. His thesis may still prove right. Leverage just doesn&rsquo;t let you be early.
          </p>

          {/* The video the user shared */}
          <div className={styles.videoWrap}>
            <iframe
              src="https://www.youtube.com/embed/-h8hPIlMgvs"
              title="Leopold Aschenbrenner / Situational Awareness — video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className={styles.stats}>
            {STATS.map((s) => <Stat key={s.label} s={s} />)}
          </div>

          <section className={styles.section}>
            <h2>Who is Leopold Aschenbrenner?</h2>
            <p>
              A German-born prodigy (born around 2001), he graduated from Columbia as valedictorian
              at 19 with degrees in economics and math-statistics. He joined OpenAI in 2023 on the
              &ldquo;Superalignment&rdquo; team &mdash; the group tasked with keeping
              smarter-than-human AI under control. OpenAI fired him in April 2024 over an alleged
              information leak; he says the real reason was a memo he wrote warning that OpenAI
              wasn&rsquo;t secure against foreign espionage.
            </p>
            <p>
              Two months later, in June 2024, he published{' '}
              <a href="https://situational-awareness.ai/" target="_blank" rel="noreferrer">
                &ldquo;Situational Awareness: The Decade Ahead&rdquo;
              </a>{' '}
              &mdash; a ~165-page manifesto predicting that AI would reach human-level capability
              around 2027, trigger an intelligence explosion, and become the defining
              national-security issue of the era. It became one of the most-discussed documents in
              tech. Then he did something unusual for an essayist: he put money behind the thesis.
            </p>
          </section>

          <section className={styles.section}>
            <h2>The thesis, turned into a fund</h2>
            <p>
              In late 2024 he launched <strong>Situational Awareness LP</strong>, an AI-focused
              hedge fund seeded with about <strong>$225 million</strong> and backed by heavyweight
              names &mdash; Stripe&rsquo;s Collison brothers, Daniel Gross and Nat Friedman. The
              strategy was a concentrated, heavily leveraged bet on the <em>picks-and-shovels</em> of
              the AI boom: the compute, memory and power that every AI company has to buy. Reported
              holdings included Oracle, AMD, memory-chip and data-center names (Nebius, SanDisk),
              and power plays like Bloom Energy &mdash; hedged with short positions in software
              stocks.
            </p>
            <p>
              It worked spectacularly. Through June 2026 the fund reportedly returned{' '}
              <strong>+439% net</strong>, and its assets ballooned from $225 million to a reported
              peak near <strong>$45 billion</strong> in under two years &mdash; one of the fastest
              rises the industry had ever seen.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>Assets under management: $225M → ~$45B → ~$10B</p>
              <TimeSeriesChart
                data={AUM}
                peakT={20}
                unit={{ prefix: '$', suffix: 'B' }}
                ariaLabel="Situational Awareness fund assets rising from $225M to about $45B, then collapsing to about $10B in July 2026"
              />
              <figcaption className={styles.figCaption}>
                The curve that tells the whole story: a near-vertical rise powered by leverage, then
                a cliff. Figures are approximate and vary by source &mdash; the reported peak ranges
                from roughly $20B to $45B depending on whether you count gross exposure; what every
                account agrees on is the shape.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2>What went wrong: leverage cuts both ways</h2>
            <p>
              The same leverage that produced the +439% run is what destroyed the fund. Reported at
              up to <strong>~4× (≈400%)</strong>, it multiplied every move in the underlying
              portfolio. In early July 2026 the AI trade finally corrected: Oracle and AMD each fell
              roughly 20%, smaller AI-infrastructure and Asian tech names fell further, and the
              short-software leg that was supposed to cushion the blow didn&rsquo;t fall enough to
              help.
            </p>
            <p>
              A ~17% drawdown in an unlevered basket is a bad month. At ~4× leverage, that same drop
              becomes a fund-threatening loss:
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>How ~4× leverage turned a bad month into a blow-up</p>
              <LeverageBars rows={LEVERAGE} />
              <figcaption className={styles.figCaption}>
                Illustrative: roughly a 17% decline in the underlying basket, amplified by ~4×
                leverage, maps to about a 67% loss on the fund&rsquo;s equity &mdash; the figure
                reported for July 2026.
              </figcaption>
            </figure>

            <p>
              Then the doom loop kicked in. As the positions fell, the fund&rsquo;s prime brokers
              &mdash; Goldman Sachs, JPMorgan, Bank of America and Citi &mdash; raised margin
              requirements and demanded more collateral. To meet the calls, the fund had to sell
              into a market that was already falling, which pushed prices down further, which
              triggered more margin calls. Forced selling begets forced selling.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How it ended</h2>
            <p>
              Around July 29&ndash;30, 2026, the fund gave up trying to hold on and liquidated its{' '}
              <strong>entire public-equity book &mdash; roughly $16 billion &mdash; in about 24
              hours</strong>, selling largely to a single buyer: Ken Griffin&rsquo;s Citadel, which
              had the balance sheet to absorb it. When the dust settled, the fund was down about{' '}
              <strong>67% for the month</strong> and its assets had fallen to around{' '}
              <strong>$10 billion</strong> &mdash; most of that not cash but an illiquid private
              stake in Anthropic that couldn&rsquo;t be sold in a hurry.
            </p>
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
            <h2>Why it matters — the lessons</h2>
            <div className={styles.lessons}>
              <ul>
                <li>
                  <strong>Being right isn&rsquo;t enough; surviving is.</strong> The AI thesis could
                  be entirely correct over ten years and still wipe you out over ten days if
                  leverage forces you to sell at the bottom. Markets can stay irrational &mdash; or
                  simply volatile &mdash; longer than a levered book can stay solvent.
                </li>
                <li>
                  <strong>Leverage is symmetric.</strong> The +439% and the −67% came from the same
                  dial. Any return achieved with 4× leverage is a return you can also lose 4× as
                  fast.
                </li>
                <li>
                  <strong>Concentration + correlation kills.</strong> The longs were all the same
                  bet (AI infrastructure) and the &ldquo;hedge&rdquo; wasn&rsquo;t truly
                  uncorrelated, so everything fell together exactly when diversification was needed.
                </li>
                <li>
                  <strong>Margin calls set the timing, not you.</strong> Once prime brokers raise
                  requirements, the forced-seller loses control of when and at what price they exit.
                </li>
                <li>
                  <strong>Liquidity is a feature you only miss when it&rsquo;s gone.</strong> What
                  survived was an Anthropic stake that couldn&rsquo;t be sold to meet the calls &mdash;
                  private marks don&rsquo;t pay margin.
                </li>
              </ul>
            </div>
            <p>
              It rhymes with history: <strong>Long-Term Capital Management</strong> (1998) and{' '}
              <strong>Archegos</strong> (2021) were also brilliant, highly levered, highly
              concentrated books that unwound violently into the arms of big banks. Different
              decade, same physics.
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
              Figures are as reported by news outlets in late July and early August 2026 and vary
              between sources — treat the specific numbers as approximate and the overall shape of
              events as the reliable part. This page is an educational post-mortem, not investment
              advice.
            </p>
          </div>
        </article>
      </main>
    </Layout>
  );
}
