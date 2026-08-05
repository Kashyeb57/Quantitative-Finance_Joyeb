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
  { label: 'The AI basket, unlevered', note: 'if you used only your own money', pct: -17 },
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

const GLOSSARY = [
  ['Hedge fund', 'A private investment pool where rich people and institutions hand their money to a manager who tries to grow it with more aggressive tactics than a normal fund is allowed to use.'],
  ['AUM (assets under management)', 'The total pile of money a fund is looking after. Bigger AUM = a bigger, more important fund.'],
  ['Leverage', 'Investing with borrowed money so your bet is bigger than your own cash. It multiplies your winnings — and your losses — by the same amount.'],
  ['Short selling', 'A way to bet that a price will go DOWN instead of up. If you short a stock and it falls, you make money.'],
  ['Hedge', 'A side bet meant to protect you if your main bet goes wrong — basically insurance for your portfolio.'],
  ['Margin call', 'When the bank that lent you money says: “your bet is losing — put in more cash right now, or we sell your stuff to protect our loan.” You don’t get to say no.'],
  ['Prime broker', 'The big bank that lends a hedge fund money and holds its investments. Goldman Sachs and JPMorgan are examples.'],
  ['Liquidity', 'How quickly you can turn something into cash. A stock is liquid (sell in seconds); a share of a private company is not (can take months).'],
];

const TIMELINE = [
  { d: '2023', b: 'Aschenbrenner joins OpenAI’s “Superalignment” team — the group trying to keep future super-smart AI under human control.' },
  { d: 'April 2024', b: 'OpenAI fires him, saying he leaked information. He says the real reason was a memo he wrote warning that OpenAI wasn’t safe from foreign spying. The team is shut down soon after.' },
  { d: 'June 2024', b: 'He publishes “Situational Awareness: The Decade Ahead,” a ~165-page essay predicting that human-level AI arrives around 2027. It goes viral.' },
  { d: 'Late 2024', b: 'He starts his own hedge fund, Situational Awareness LP, with about $225 million from famous tech backers (the Collison brothers, Daniel Gross, Nat Friedman).' },
  { d: 'Through mid-2026', b: 'Betting big — with lots of borrowed money — on the AI boom, the fund reportedly grows +439% and swells toward a reported ~$45 billion. One of the great runs ever.' },
  { d: 'Early–mid July 2026', b: 'AI and chip stocks start falling. Oracle and AMD each drop about 20%. His protective “short” bets don’t save him.' },
  { d: 'July 24, 2026', b: 'Aschenbrenner tells his investors the fund “failed to escape” the sell-off.', crash: true },
  { d: '~July 29–30, 2026', b: 'The banks demand their money back (margin calls). Forced to sell, the fund dumps its ENTIRE ~$16 billion stock portfolio in about a day — mostly to Ken Griffin’s Citadel. It ends the month down ~67%, with only ~$10 billion left, most of it stuck in a private Anthropic stake.', crash: true },
];

const SOURCES = [
  { t: 'CNBC — “AI investor Leopold Aschenbrenner forced to unwind all public stock positions after steep losses” (Jul 30, 2026)', u: 'https://www.cnbc.com/2026/07/30/leopold-aschenbrenners-hedge-fund-is-facing-steep-ai-losses.html' },
  { t: 'CNBC — “Situational Awareness fund: $45B to fire sale” (Jul 31, 2026)', u: 'https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html' },
  { t: 'Bloomberg — “Situational Awareness Assets Fall to $10 Billion After Losses” (Jul 30, 2026)', u: 'https://www.bloomberg.com/news/articles/2026-07-30/situational-awareness-assets-fall-to-10-billion-after-losses' },
  { t: 'TradingKey — “How leverage amplified the crisis”', u: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262066744-ex-openai-researcher-leopold-aschenbrenner-situational-awareness-blows-up-tradingkey' },
  { t: 'CryptoBriefing — “Situational Awareness dumps entire public stock portfolio in margin-fueled fire sale”', u: 'https://cryptobriefing.com/situational-awareness-hedge-fund-liquidates-portfolio/' },
  { t: 'Wikipedia — Leopold Aschenbrenner', u: 'https://en.wikipedia.org/wiki/Leopold_Aschenbrenner' },
  { t: 'Roman Paolucci — “Situational Awareness LP Blowup” (the YouTube video that prompted this write-up)', u: 'https://youtu.be/-h8hPIlMgvs' },
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
      description="How Leopold Aschenbrenner turned $225M into a reported ~$45B AI-infrastructure fund and then lost roughly two-thirds of it in one month — a textbook leverage blow-up, explained simply with charts.">
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
            a hedge fund on exactly that idea &mdash; and then got wiped out when AI stocks dipped.
            His big-picture idea might still turn out right. Borrowed money just doesn&rsquo;t give
            you time to be early.
          </p>

          {/* Plain-English one-shot summary */}
          <div className={styles.plainBox}>
            <Heading as="h2">The whole thing in plain English</Heading>
            <p>
              A very smart 24-year-old borrowed a <em>huge</em> amount of money to bet that
              AI-related stocks (chips, data centers, electricity) would keep going up. For a while
              he was a genius: he turned $225 million into what was reported as around $45 billion.
            </p>
            <p>
              Then those stocks dropped for a few weeks. Because so much of the money was borrowed, a
              medium-sized dip in the stocks turned into a <strong>giant</strong> loss for his fund.
              The banks that lent him the money got scared and forced him to sell everything, fast, at
              bad prices. In about one month he lost roughly <strong>two-thirds</strong> of the whole
              fund. That&rsquo;s the entire story &mdash; the rest of this page explains the
              &ldquo;why,&rdquo; step by step.
            </p>
          </div>

          <div className={styles.stats}>
            {STATS.map((s) => <Stat key={s.label} s={s} />)}
          </div>

          {/* Glossary */}
          <div className={styles.glossary}>
            <strong>The words you&rsquo;ll need (in plain English)</strong>
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
            <h2>1. Who is Leopold Aschenbrenner?</h2>
            <p>
              He&rsquo;s a German-born prodigy, born around 2001. He finished Columbia University at
              the top of his class at just 19, studying economics and math. In 2023 he went to work
              at OpenAI (the company behind ChatGPT) on a team whose job was to keep future
              super-smart AI safe and under control.
            </p>
            <p>
              In April 2024 OpenAI fired him. The company said he leaked information; he says the
              real reason was that he warned &mdash; in writing &mdash; that OpenAI wasn&rsquo;t
              protected against foreign spies. Two months later, in June 2024, he published a long
              essay called{' '}
              <a href="https://situational-awareness.ai/" target="_blank" rel="noreferrer">
                &ldquo;Situational Awareness: The Decade Ahead&rdquo;
              </a>
              , predicting that AI would become as smart as humans around 2027 and reshape the world.
              It became one of the most talked-about documents in tech. Then he did something bold:
              he bet real money on his own prediction.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. What was his bet? (The &ldquo;shovels&rdquo; idea)</h2>
            <p>
              In late 2024 he opened a <strong>hedge fund</strong> &mdash; a pool of money he invests
              for wealthy backers &mdash; called <strong>Situational Awareness LP</strong>. It
              started with about <strong>$225 million</strong>. His strategy was clever.
            </p>
            <p className={styles.analogy}>
              <strong>Picture this:</strong> In the 1849 Gold Rush, most people digging for gold went
              broke. But the folks who sold the <em>shovels, picks and jeans</em> got rich no matter
              who struck gold. Leopold&rsquo;s bet was the modern version: don&rsquo;t try to guess
              which AI company wins &mdash; instead, own the &ldquo;shovels&rdquo; that <em>every</em>{' '}
              AI company has to buy: the computer chips, the memory, the data centers, the
              electricity.
            </p>
            <p>
              So he bought big stakes in companies like Oracle, AMD, memory-chip makers and power
              companies. It was a smart idea, and for 18 months it worked better than almost anyone
              in history: through June 2026 the fund was reportedly up <strong>+439%</strong>, and
              its money had grown from $225 million to a reported peak near{' '}
              <strong>$45 billion</strong>. The problem was never the idea. The problem was <em>how</em>{' '}
              he made the bet.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>The money: $225M → ~$45B → ~$10B</p>
              <TimeSeriesChart
                data={AUM}
                peakT={20}
                unit={{ prefix: '$', suffix: 'B' }}
                ariaLabel="The fund's money rising from $225M to about $45B, then collapsing to about $10B in July 2026"
              />
              <figcaption className={styles.figCaption}>
                Green is the climb, red is the crash. Notice how the drop at the end is almost
                straight down &mdash; that&rsquo;s what &ldquo;forced selling&rdquo; looks like.
                (Figures are approximate; the reported peak ranges from ~$20B to ~$45B depending on
                the source, but every account agrees on this shape.)
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2>3. The secret ingredient &mdash; and the poison &mdash; was leverage</h2>
            <p>
              <strong>Leverage</strong> means investing with borrowed money so your bet is bigger
              than your own cash. Leopold used a <em>lot</em> of it &mdash; reportedly up to{' '}
              <strong>4×</strong>. Here&rsquo;s why that matters, with small numbers:
            </p>
            <p className={styles.analogy}>
              <strong>Picture this:</strong> You have $100. You&rsquo;re so sure a stock will go up
              that you borrow $300 from a bank and buy $400 of it. If it rises 25%, you now have
              $500 &mdash; pay back the $300 loan and you&rsquo;ve got $200. You <em>doubled</em> your
              money on a 25% move! But if it <em>falls</em> 25%, your $400 becomes $300 &mdash; you
              pay back the loan and you&rsquo;re left with <strong>$0</strong>. The stock only dropped
              a quarter, but <em>all</em> your money is gone. That is leverage: it multiplies wins and
              losses by the same amount.
            </p>
            <p>
              Now scale that up to billions. In early July 2026 the AI stocks he owned fell &mdash;
              Oracle and AMD each dropped about 20%, and smaller names fell more. A ~17% drop in his
              basket of stocks doesn&rsquo;t sound fatal&hellip; until you remember it was ~4×
              leveraged:
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>How ~4× leverage turned a bad month into a wipe-out</p>
              <LeverageBars rows={LEVERAGE} />
              <figcaption className={styles.figCaption}>
                A roughly 17% fall in the stocks, multiplied by ~4× borrowing, becomes about a 67%
                loss for the fund &mdash; the actual figure reported for July 2026. Same market, very
                different pain, purely because of borrowed money.
              </figcaption>
            </figure>
          </section>

          <section className={styles.section}>
            <h2>4. The &ldquo;doom loop&rdquo; that finished it off</h2>
            <p>
              When you invest with borrowed money, the bank that lent it to you is watching nervously,
              because it&rsquo;s <em>their</em> money at risk too. When your investments start losing,
              they make a <strong>margin call</strong>.
            </p>
            <p className={styles.analogy}>
              <strong>Picture this:</strong> Remember the $300 you borrowed? As your $400 of stock
              slides toward $300, the bank calls you: <em>&ldquo;Add more cash right now, or we sell
              your stock today to get our $300 back.&rdquo;</em> You can&rsquo;t say no, and you
              don&rsquo;t get to pick the price. That phone call is a margin call.
            </p>
            <p>
              Now imagine <em>everyone</em> in the same AI trade gets that call on the same day. They
              all sell at once. All that selling pushes prices down even more &mdash; which triggers
              <em> more</em> margin calls &mdash; which forces <em>more</em> selling. It feeds on
              itself. Traders call this a <strong>doom loop</strong>, and it&rsquo;s why the end of
              the chart is a cliff instead of a gentle slope. Leopold&rsquo;s prime brokers (Goldman
              Sachs, JPMorgan, Bank of America, Citi) all wanted their loans made safe at the same
              time.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. The insurance that didn&rsquo;t work</h2>
            <p>
              Leopold wasn&rsquo;t reckless on purpose &mdash; he thought he was protected. Alongside
              buying AI stocks, he also <strong>shorted</strong> (bet against) a bunch of software
              stocks. The plan: if the market fell, his short bets would go up and cushion the blow.
              That protective side bet is called a <strong>hedge</strong>.
            </p>
            <p>
              But the hedge failed. The software stocks he bet against didn&rsquo;t fall enough to
              help, so <em>both</em> sides of his book lost money at the same time &mdash; exactly
              when he needed one side to win. A hedge only helps if it actually moves the opposite way
              from your main bet. His didn&rsquo;t.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. The fire sale &mdash; how it ended</h2>
            <p>
              Around July 29&ndash;30, 2026, it was over. Unable to meet the margin calls, the fund
              sold its <strong>entire pile of stocks &mdash; about $16 billion worth &mdash; in
              roughly 24 hours</strong>. When you have to sell that much that fast, you take whatever
              price you can get. Most of it went to a single buyer big enough to swallow it: Ken
              Griffin&rsquo;s <strong>Citadel</strong>, one of the largest funds in the world.
            </p>
            <p>
              When the smoke cleared, the fund was down about <strong>67%</strong> for the month and
              only around <strong>$10 billion</strong> was left.
            </p>
            <p className={styles.analogy}>
              <strong>And here&rsquo;s the cruel twist:</strong> most of that remaining $10 billion
              wasn&rsquo;t cash &mdash; it was a stake the fund owned in <em>Anthropic</em>, a private
              AI company. You can sell a normal stock in seconds, but you can&rsquo;t quickly sell a
              piece of a private company. It&rsquo;s like owning part of a house when you need cash
              tonight: it&rsquo;s worth a lot, but you can&rsquo;t spend it right now. That&rsquo;s
              called being <strong>illiquid</strong> &mdash; and it meant the one valuable thing left
              couldn&rsquo;t be used to stop the bleeding.
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
            <h2>Why it matters &mdash; the lessons</h2>
            <div className={styles.lessons}>
              <ul>
                <li>
                  <strong>Being right isn&rsquo;t enough &mdash; you have to survive to see it.</strong>{' '}
                  His AI idea could be 100% correct over ten years and <em>still</em> wipe him out over
                  ten days, because borrowed money forced him to sell at the bottom. In plain terms:
                  the market can stay scary longer than a borrowed bet can stay alive.
                </li>
                <li>
                  <strong>Leverage cuts both ways.</strong> The same 4× that made the +439% also made
                  the −67%. Any gain you get from borrowing is a loss you can suffer just as fast.
                </li>
                <li>
                  <strong>Putting all your eggs in one basket is dangerous</strong> &mdash; especially
                  when your &ldquo;backup plan&rdquo; is secretly tied to the same basket. Everything
                  fell together right when he needed something to hold up.
                </li>
                <li>
                  <strong>When the bank calls, you&rsquo;re not in charge anymore.</strong> Margin
                  calls decide <em>when</em> and <em>at what price</em> you sell &mdash; not you.
                </li>
                <li>
                  <strong>Cash you can&rsquo;t reach isn&rsquo;t really cash.</strong> A great private
                  investment is useless if you can&rsquo;t sell it in the exact moment you need money.
                </li>
              </ul>
            </div>
            <p>
              This has happened before to very smart people. <strong>Long-Term Capital Management</strong>{' '}
              (1998) was run by Nobel Prize winners and blew up the same way. <strong>Archegos</strong>{' '}
              (2021) lost $20 billion in days on borrowed, concentrated bets. Different decade, same
              trap: brilliance + borrowed money + one big bet.
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
