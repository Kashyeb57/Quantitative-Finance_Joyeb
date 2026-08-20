import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

/*
 * The White House Crypto Summit (Aug 19, 2026) — a Big Event of the bullish
 * kind. President Trump shares a podium with the CEOs of Coinbase, Ripple and
 * Robinhood, flanked by the SEC and CFTC chairs, pushing the CLARITY Act and a
 * regulate-by-agency pivot (SEC "Regulation Crypto Assets"). Stacked with a
 * Treasury buyback surprise, it sparks a sharp crypto rally: BTC past $68K,
 * $1B+ shorts liquidated, Coinbase/Strategy up double digits. Written to also
 * carry the skeptic's view — summits can mark tops, and rules-by-agency are
 * reversible.
 */

// One-day move — the crypto-equity beta. Spot BTC moved a few percent; the
// listed proxies moved multiples of that.
const RALLY = [
  { label: 'Bitcoin (BTC)', note: 'spot — past $68K, high since June', val: 3, kind: 'btc' },
  { label: 'Coinbase (COIN)', note: 'the exchange', val: 11, kind: 'eq' },
  { label: 'Strategy (MSTR)', note: 'the leveraged BTC proxy', val: 13, kind: 'eq' },
  { label: 'Bitmine (BMNR)', note: 'crypto-treasury name', val: 13, kind: 'eq' },
];

const STATS = [
  { v: '$68K+', label: 'Bitcoin blew past it to ~$69.5K — highest since June, biggest jump since March', dir: 'up' },
  { v: '$1B+', label: 'Short positions liquidated in about an hour as the squeeze fed on itself', dir: 'up' },
  { v: '+11–13%', label: 'One-day move in Coinbase, Strategy and Bitmine — the crypto-equity beta', dir: 'up' },
  { v: '3 chairs', label: 'Trump shared the frame with the SEC and CFTC chairs and crypto’s CEOs' },
  { v: '$75M / yr', label: 'Tiered raise the SEC’s new "Regulation Crypto Assets" would let crypto projects do' },
  { v: '35 members', label: 'CFTC’s new industry-heavy Innovation Advisory Committee, seated the next day' },
];

const GLOSSARY = [
  ['CLARITY Act', 'The Digital Asset Market Clarity Act — the bill that would set, in law, which crypto assets the SEC regulates (as securities) and which the CFTC regulates (as commodities). Industry’s top ask. It has stalled in Congress, which is why the administration pivoted to agency rulemaking.'],
  ['Regulation Crypto Assets', 'The SEC’s newly-proposed framework giving crypto projects defined ways to raise capital under securities law — a one-time startup exemption (up to ~$5M) and tiered raises up to ~$75M a year. Chair Paul Atkins called it the SEC’s "most historic step yet" on crypto.'],
  ['SEC vs CFTC jurisdiction', 'The long-running turf question: is a token a security (SEC) or a commodity (CFTC)? The lack of a clear answer is what the CLARITY Act — and, in its absence, these agency moves — are trying to settle.'],
  ['Short squeeze / liquidation', 'When price rises fast, traders who bet against it (shorts, often on leverage) are force-bought out of their positions. That forced buying pushes price higher still — a feedback loop. Over $1B of crypto shorts were liquidated here in about an hour.'],
  ['Crypto-equity beta', 'Listed stocks that trade as leveraged proxies for crypto — an exchange (Coinbase), a company that holds Bitcoin on its balance sheet (Strategy), a crypto-treasury name (Bitmine). They tend to move several times as much as spot Bitcoin, up and down.'],
  ['Regulate-by-agency', 'Setting policy through rules written by agencies (SEC, CFTC) rather than laws passed by Congress. Faster, but reversible: a future administration or chair can rewrite the rules, where a statute is harder to undo.'],
  ['Prediction markets', 'Exchanges where you trade contracts on real-world outcomes (elections, sports, econ data). Polymarket and Kalshi were in the room — a sign of how broad the "crypto" tent at the table had become.'],
];

const TIMELINE = [
  { d: 'Jul–Aug 2026', b: 'The CLARITY Act — the market-structure bill dividing crypto oversight between the SEC and CFTC — stalls in Congress, frustrating an industry that had treated it as the finish line.' },
  { d: 'Aug 18, 2026', b: 'In a surprise move, the SEC formally proposes "Regulation Crypto Assets," a fit-for-purpose framework letting crypto projects raise capital under securities law. Chair Paul Atkins frames it as ending an era of an "activist SEC weaponized against this asset class."', up: true },
  { d: 'Aug 19, 2026 — morning', b: 'The U.S. Treasury signals it will more than double the size of its debt buybacks — an unexpected liquidity tailwind that lifts risk appetite across markets.' },
  { d: 'Aug 19, 2026 — the summit', b: 'At the Eisenhower Executive Office Building, President Trump appears with Coinbase’s Brian Armstrong, Ripple’s Brad Garlinghouse and Robinhood’s Vlad Tenev, alongside SEC Chair Atkins and CFTC Acting Chair Mike Selig. Trump presses Congress to pass the CLARITY Act, calling digital assets essential to U.S. dominance over China.', up: true },
  { d: 'Aug 19, 2026 — the tape', b: 'The catalyst stack fires. Bitcoin blasts past $68,000 toward ~$69,500 — its highest since June and biggest single-day gain since March — as more than $1B of short positions are liquidated in about an hour. Coinbase +11%, Strategy +13%, Bitmine +13%.', up: true },
  { d: 'Aug 20, 2026', b: 'The CFTC’s Innovation Advisory Committee holds its inaugural meeting — a 35-member, industry-heavy panel with the CEOs of Coinbase, Robinhood, Polymarket, Kalshi, FanDuel and DraftKings — underscoring the regulate-by-agency pivot.' },
];

const SOURCES = [
  { t: 'Bloomberg — “Bitcoin Surges Most Since March Ahead of White House Meeting”', u: 'https://www.bloomberg.com/news/articles/2026-08-19/bitcoin-surges-most-since-march-ahead-of-white-house-meeting' },
  { t: 'Bloomberg — “Crypto Executives Join Trump in Push for US Digital Asset Legislation”', u: 'https://www.bloomberg.com/news/articles/2026-08-19/trump-asks-congress-to-pass-crypto-bill-alongside-executives' },
  { t: 'CoinDesk — “Bitcoin Surges Above $68,000, Liquidating $1.4B Shorts as Treasury Buybacks Boost Risk Appetite” (Aug 19, 2026)', u: 'https://www.coindesk.com/markets/2026/08/19/bitcoin-surges-above-usd68-000-liquidating-usd1-4-billion-shorts-as-treasury-buybacks-boost-risk-appetite' },
  { t: 'Washington Times — “Trump hosts crypto execs at White House after SEC guidelines release” (Aug 19, 2026)', u: 'https://www.washingtontimes.com/news/2026/aug/19/donald-trump-hosts-crypto-execs-white-house-sec-guidelines-release/' },
  { t: 'SEC — “SEC Proposes New Regulation Crypto Assets” (Press Release 2026-76)', u: 'https://www.sec.gov/newsroom/press-releases/2026-76-sec-proposes-new-regulation-crypto-assets' },
  { t: 'InvestmentNews — “Atkins: SEC takes ‘most historic step yet’ on crypto regulation”', u: 'https://www.investmentnews.com/alternatives/atkins-sec-takes-most-historic-step-yet-on-crypto-regulation/267873' },
  { t: '24/7 Wall St. — “Strategy Rockets 13%, Bitmine 13%, Coinbase 11% as Bitcoin Surges Past $68,000” (Aug 19, 2026)', u: 'https://247wallst.com/investing/2026/08/19/strategy-rockets-13-bitmine-immersion-technologies-rallies-13-coinbase-jumps-11-as-bitcoin-surges-past-68000/' },
  { t: 'Yahoo Finance — “The White House Summit Isn’t a Photo Op. It’s the Regulatory Architecture.”', u: 'https://finance.yahoo.com/markets/crypto/articles/white-house-summit-isn-t-200422934.html' },
  { t: 'Benzinga — “President Trump Scheduled for White House Crypto Summit as CLARITY Act Stalls”', u: 'https://www.benzinga.com/crypto/cryptocurrency/26/08/61258699/president-trump-scheduled-for-white-house-crypto-summit-as-clarity-act-stalls' },
  { t: 'PYMNTS — “White House Convenes Meeting With Crypto and Prediction Market CEOs”', u: 'https://www.pymnts.com/cryptocurrency/2026/white-house-convenes-meeting-with-crypto-and-prediction-market-ceos/' },
  { t: 'Bitcoin Magazine — “Bitcoin Blasts Past $68,000 After US Treasury Doubles Debt Buybacks”', u: 'https://bitcoinmagazine.com/news/bitcoin-blasts-past-68000' },
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

function BarChart({ rows, max, valueFmt, fillFor, labelW = 220, ariaLabel, rowH = 40 }) {
  const height = rows.length * rowH + 20;
  const innerW = 780 - labelW - 90;
  return (
    <svg
      viewBox={`0 0 780 ${height}`}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'var(--ifm-font-family-base)' }}
    >
      {rows.map((r, i) => {
        const cy = 14 + i * rowH + 17;
        const barW = (r.val / max) * innerW;
        const fill = fillFor(r);
        return (
          <g key={r.label}>
            <text x={labelW - 12} y={cy - 3} textAnchor="end" style={{ fill: 'var(--viz-ink)', fontSize: '13px', fontWeight: 600 }}>{r.label}</text>
            <text x={labelW - 12} y={cy + 12} textAnchor="end" style={{ fill: 'var(--viz-muted)', fontSize: '10.5px' }}>{r.note}</text>
            <rect x={labelW} y={cy - 13} width={innerW} height={24} rx={4} fill="var(--viz-panel-bg)" />
            <rect x={labelW} y={cy - 13} width={barW} height={24} rx={4} fill={fill} opacity={0.9} />
            <text x={labelW + barW + 8} y={cy + 5} style={{ fill, fontSize: '14px', fontWeight: 800 }}>{valueFmt(r.val)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function WhiteHouseCryptoSummit() {
  return (
    <Layout
      title="Crypto goes to Washington: the White House summit rally"
      description="A Big Event: on August 19, 2026, President Trump shared a White House podium with the CEOs of Coinbase, Ripple and Robinhood, flanked by the SEC and CFTC chairs — pushing the CLARITY Act and a regulate-by-agency pivot. Stacked with a Treasury buyback surprise, it sparked a sharp crypto rally: Bitcoin past $68,000, over $1B of shorts liquidated, Coinbase and Strategy up double digits. What a policy tailwind looks like — and why summits can also mark tops.">
      <header className="hero hero--primary" style={{ padding: '2.2rem 1rem' }}>
        <div className="container">
          <Heading as="h1" className="hero__title" style={{ fontSize: '2rem' }}>
            Crypto goes to Washington
          </Heading>
          <p className="hero__subtitle">August 2026 · Trump shares a podium with crypto’s CEOs — and the market rips</p>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <article className={styles.article}>
          <Link className={styles.backLink} to="/events">← All Big Events</Link>
          <div className={styles.articleMeta}>
            <span className={styles.developing}>Policy shift · market event</span>
            <span>August 19–20, 2026 · ~10 min read · by Joyeb Kashyeb</span>
          </div>

          <p className={styles.dek}>
            On <strong>August 19, 2026</strong>, President Trump stood at the Eisenhower Executive Office
            Building beside a row of the industry&rsquo;s biggest names &mdash; <strong>Coinbase&rsquo;s
            Brian Armstrong, Ripple&rsquo;s Brad Garlinghouse and Robinhood&rsquo;s Vlad Tenev</strong>,
            with the <strong>SEC and CFTC chairs</strong> at his side &mdash; and told Congress to pass a
            crypto law before America loses the race to China. Coming right on top of a surprise SEC
            rulebook and a Treasury liquidity boost, the message hit the tape like a match on kerosene:{' '}
            <strong>Bitcoin ripped past $68,000</strong>, over <strong>$1 billion of shorts</strong> were
            wiped out in an hour, and the crypto-linked stocks jumped double digits. This is what a{' '}
            <em>policy tailwind</em> looks like &mdash; and why the smartest question to ask at the top of
            a rally is what could go wrong.
          </p>

          <div className={styles.plainBox}>
            <Heading as="h2">The short version</Heading>
            <p>
              For a decade, crypto&rsquo;s biggest problem in the U.S. wasn&rsquo;t technology &mdash; it
              was <strong>not knowing the rules</strong>. Was a token a security (the SEC&rsquo;s turf) or
              a commodity (the CFTC&rsquo;s)? Nobody could say for sure, and the SEC spent years suing
              first and answering later. The <strong>CLARITY Act</strong> was supposed to settle it in
              law &mdash; but it stalled in Congress. So the administration changed tactics: if the law
              won&rsquo;t come, <strong>write the rules through the agencies</strong> instead.
            </p>
            <p>
              That is what the summit was really about. The day before, the SEC proposed{' '}
              <strong>&ldquo;Regulation Crypto Assets,&rdquo;</strong> a framework giving crypto projects
              defined, legal ways to raise money. The next day, the CFTC seated a new industry-stacked
              advisory panel. The White House event tied a bow on it: the President, personally, standing
              with the CEOs and the two regulators, signalling that Washington is now <em>working with</em>{' '}
              the industry, not against it. Markets read that instantly &mdash; and, helped along by a
              <strong> $1B+ short squeeze</strong> and a Treasury buyback surprise, they ripped.
            </p>
          </div>

          <div className={styles.stats}>
            {STATS.map((s) => <Stat key={s.label} s={s} />)}
          </div>

          <nav className={styles.toc} aria-label="Table of contents">
            <div className={styles.tocTitle}>In this breakdown</div>
            <ol className={styles.tocList}>
              <li><a href="#s-podium"><span className={styles.tocNum}>1</span>The podium</a></li>
              <li><a href="#s-ask"><span className={styles.tocNum}>2</span>What Trump actually asked for</a></li>
              <li><a href="#s-planb"><span className={styles.tocNum}>3</span>Plan B: regulate by agency</a></li>
              <li><a href="#s-rip"><span className={styles.tocNum}>4</span>Why the market ripped</a></li>
              <li><a href="#s-skeptic"><span className={styles.tocNum}>5</span>The skeptic&rsquo;s view</a></li>
              <li><a href="#s-watch"><span className={styles.tocNum}>6</span>What to watch</a></li>
              <li><a href="#s-lessons"><span className={styles.tocNum}>★</span>Why it matters</a></li>
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
            <h2 id="s-podium">1. The podium</h2>
            <p>
              The picture was the point. For most of crypto&rsquo;s history the industry and Washington
              faced each other across a courtroom; here they shared a <strong>stage</strong>. Around the
              President stood <strong>Brian Armstrong</strong> (Coinbase, the largest U.S. exchange),{' '}
              <strong>Brad Garlinghouse</strong> (Ripple, which spent years litigating the SEC), and{' '}
              <strong>Vlad Tenev</strong> (Robinhood, the app that put crypto in millions of retail
              pockets) &mdash; joined by <strong>SEC Chair Paul Atkins</strong> and <strong>CFTC Acting
              Chair Mike Selig</strong>, plus names from Nasdaq, CME and even the prediction markets
              (Polymarket, Kalshi).
            </p>
            <p>
              Put the two regulators, the exchanges and the President in one frame and you communicate a
              regime change without saying a word: the people who used to be <em>investigated</em> are now
              being <em>consulted</em>. Markets price symbols like that immediately.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-ask">2. What Trump actually asked for</h2>
            <p>
              The specific ask was legislative: <strong>pass the CLARITY Act</strong>. That bill would fix
              in law the one thing crypto has never had in America &mdash; a clean line between which
              assets the <strong>SEC</strong> oversees as securities and which the <strong>CFTC</strong>{' '}
              oversees as commodities. Trump wrapped it in a competitiveness argument: digital assets are
              critical to keeping U.S. financial dominance, and if America doesn&rsquo;t build the rails,{' '}
              <strong>China and others will</strong>.
            </p>
            <p>
              It&rsquo;s worth being precise about what a summit like this <em>is</em> and{' '}
              <em>isn&rsquo;t</em>. No law was passed that day. A President asking Congress to act is not
              the same as Congress acting. What changed was <strong>direction and probability</strong> —
              the signal that the executive branch is now pushing the same way the industry is.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-planb">3. Plan B: regulate by agency</h2>
            <p>
              Here is the part that actually moved markets. Because the CLARITY Act is stuck, the
              administration isn&rsquo;t waiting for it. The day before the summit, the <strong>SEC
              proposed &ldquo;Regulation Crypto Assets&rdquo;</strong> &mdash; a real framework, not a
              speech &mdash; giving crypto projects defined ways to raise capital: a one-time startup
              exemption (up to ~$5M) and tiered raises up to <strong>~$75M a year</strong>, out for a
              60-day comment period. Chair Atkins didn&rsquo;t undersell it:
            </p>

            <div className={styles.letterWrap}>
              <div className={styles.letter}>
                <div className={styles.letterHeader}>
                  <span>🎙️ SEC Chair Paul Atkins</span>
                  <span className={styles.letterDate}>Aug 18–19, 2026</span>
                </div>
                <div className={styles.letterBody}>
                  <blockquote className={styles.letterQuote}>
                    &ldquo;Regulation Crypto Assets seeks to provide crypto asset entrepreneurs and market
                    participants with clear pathways to raise capital under the federal securities laws.
                    For too long, issuers and investors had to navigate an activist SEC weaponized against
                    this asset class.&rdquo;
                  </blockquote>
                  <p className={styles.letterNote}>
                    He called it the SEC&rsquo;s &ldquo;most historic step yet&rdquo; on crypto. The next
                    day, the CFTC seated a 35-member Innovation Advisory Committee stacked with industry
                    CEOs — the same regulate-by-agency move from the other regulator.
                  </p>
                </div>
              </div>
            </div>

            <p>
              This is the substance behind the symbolism. A framework you can actually raise money under
              is worth more to a crypto business than any number of friendly speeches &mdash; and doing it
              through <strong>agency rules</strong> means it can happen in months, not the years a
              stalled bill would take.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-rip">4. Why the market ripped</h2>
            <p>
              No single headline did this alone. Three tailwinds landed in the same 48 hours &mdash; a{' '}
              <strong>friendly SEC framework</strong>, the <strong>White House summit</strong>, and a{' '}
              <strong>Treasury plan to more than double its debt buybacks</strong> (a liquidity boost that
              lifts risk appetite everywhere). Into that, a crowded field of <strong>short sellers</strong>{' '}
              got run over: as Bitcoin broke $68,000, more than <strong>$1 billion of short positions were
              liquidated in about an hour</strong>, and that forced buying pushed it toward ~$69,500 &mdash;
              its highest since June and biggest single-day gain since March.
            </p>

            <figure className={styles.figure}>
              <p className={styles.figTitle}>The one-day move — spot vs the crypto-equity beta</p>
              <BarChart
                rows={RALLY}
                max={13}
                valueFmt={(v) => `+${v}%`}
                fillFor={() => 'var(--viz-good)'}
                ariaLabel="One-day gains: Bitcoin about 3 percent, Coinbase 11 percent, Strategy 13 percent, Bitmine 13 percent"
              />
              <figcaption className={styles.figCaption}>
                Spot Bitcoin moved a few percent; the <em>listed proxies</em> moved multiples of it. That
                gap is the whole story of crypto-equity beta &mdash;{' '}
                <span style={{ color: 'var(--viz-good)', fontWeight: 700 }}>Coinbase</span> is a leveraged
                bet on volumes,{' '}
                <span style={{ color: 'var(--viz-good)', fontWeight: 700 }}>Strategy</span> is a leveraged
                bet on Bitcoin&rsquo;s price itself. It amplifies on the way up. It amplifies just as hard
                on the way down. One-day figures, Aug 19, 2026.
              </figcaption>
            </figure>

            <p>
              The lesson hidden in that chart: if you wanted exposure to the <em>news</em>, the stocks gave
              you 3–4× the move of the coin. That cuts both ways, and it&rsquo;s exactly why the next
              section matters.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-skeptic">5. The skeptic&rsquo;s view</h2>
            <p>
              A good post-mortem doesn&rsquo;t only cheer. Three cautions belong next to the green candles:
            </p>
            <div className={styles.lessons}>
              <ul>
                <li><strong>Rules-by-agency are reversible.</strong> A framework written by the SEC and CFTC can be rewritten by a future SEC and CFTC. A statute — an actual law — is far harder to undo. Until the CLARITY Act passes, this is policy that lives at the pleasure of whoever runs the agencies.</li>
                <li><strong>An industry-stacked table invites the capture question.</strong> When the regulators seat advisory panels full of the CEOs they regulate, critics reasonably ask who the rules are being written <em>for</em>. Friendly regulation and good regulation aren&rsquo;t automatically the same thing.</li>
                <li><strong>Summits can mark tops.</strong> A move powered by a one-hour short squeeze and stacked catalysts is, by definition, partly mechanical. When the most bullish possible news is already on the tape and the shorts are already gone, ask who is left to buy. &ldquo;Buy the rumor, sell the news&rdquo; exists for days exactly like this.</li>
              </ul>
            </div>
            <p>
              None of that means the policy shift is fake &mdash; it looks real and durable-ish. It means
              the <em>price reaction</em> and the <em>policy reality</em> are two different things, and
              conflating them is how people buy the top.
            </p>
          </section>

          <section className={styles.section}>
            <h2 id="s-watch">6. What to watch</h2>
            <div className={styles.lessons}>
              <ul>
                <li><strong>The CLARITY Act.</strong> Does the summit actually move votes, or does the bill stay stuck? Law &gt; rules for staying power.</li>
                <li><strong>The comment period.</strong> &ldquo;Regulation Crypto Assets&rdquo; is a <em>proposal</em> with 60 days of comment ahead of it. Watch what survives to a final rule.</li>
                <li><strong>Follow-through vs fade.</strong> Does Bitcoin hold above the old range ($60–67K) or slide back once the squeeze fuel is spent? The first is a regime change; the second is a headline pop.</li>
                <li><strong>The beta names.</strong> Coinbase, Strategy and Bitmine will tell you, in real time and in exaggerated form, whether the market still believes the story.</li>
                <li><strong>Who else gets a seat.</strong> Prediction markets (Polymarket, Kalshi) in the room signals how wide the &ldquo;crypto&rdquo; policy tent is becoming — stablecoins and tokenized assets are the next fronts.</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2 id="s-lessons">Why it matters</h2>
            <div className={styles.lessons}>
              <ul>
                <li>
                  <strong>For markets, regulation is a price input, not a footnote.</strong> The single
                  biggest overhang on U.S. crypto was legal uncertainty. Removing even part of it re-rates
                  the whole asset class — which is why a <em>policy</em> event produced a <em>violent
                  price</em> move.
                </li>
                <li>
                  <strong>Watch the plumbing, not just the podium.</strong> The photo made the news, but the
                  mover was the SEC framework and the Treasury buyback — the boring mechanics. Symbolism
                  gets the clicks; liquidity and rules move the tape.
                </li>
                <li>
                  <strong>Leverage cuts both ways.</strong> The crypto-equity proxies gave 3–4× the coin&rsquo;s
                  move up. Remember that on the day the news is bad — the same names will give you 3–4× down.
                </li>
                <li>
                  <strong>The most bullish tape is the riskiest to chase.</strong> When every catalyst has
                  fired and the shorts are already squeezed out, the easy money is behind you, not ahead.
                </li>
                <li>
                  <strong>Rules made fast can be unmade fast.</strong> Agency action is quick and reversible;
                  law is slow and durable. Know which one a rally is actually standing on.
                </li>
              </ul>
            </div>
            <div className={styles.learnBox}>
              <strong>Related on this site →</strong>
              <ul>
                <li><Link to="/events/meta-social-media-trial">Meta on trial</Link> — the other way Washington moves a mega-cap: through the courts.</li>
                <li><Link to="/events/jane-street-15b-loss">Jane Street&rsquo;s $15 billion month</Link> — when leverage runs the other direction.</li>
                <li><Link to="/terminal">Market terminal</Link> — watch BTC, COIN and MSTR move in real time.</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Timeline</h2>
            <ul className={styles.timeline}>
              {TIMELINE.map((e, i) => (
                <li key={i} className={styles.tItem}>
                  <div className={styles.tDate}>{e.d}</div>
                  <p className={styles.tBody}>{e.b}</p>
                </li>
              ))}
            </ul>
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
              Prices, one-day percentage moves and attendee lists are as reported by the outlets above on
              August 19–20, 2026 and may be revised; intraday figures depend on the snapshot time. The SEC&rsquo;s
              &ldquo;Regulation Crypto Assets&rdquo; is a <strong>proposal</strong> in a public comment
              period, not a final rule, and the CLARITY Act had not passed as of writing. This page is an
              educational explainer of a public policy-and-market event, not investment advice — and
              nothing here is a recommendation to buy or sell any asset.
            </p>
          </div>
        </article>
      </main>
    </Layout>
  );
}
