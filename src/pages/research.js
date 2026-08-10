import React from 'react';
import Layout from '@theme/Layout';
import PageHeader from '@site/src/components/PageHeader';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './research.module.css';

// My research-paper shelf. To add a paper, append an object below:
//   { title, authors, venue, year, url, topic?, note? }
// `url` can be an arXiv / SSRN / journal link, or a self-hosted PDF you drop in
// static/library/ and reference as /library/<file>.pdf (opens in the /read reader).
const PAPERS = [
  {
    title: 'Can Day Trading Really Be Profitable? Evidence from the Opening Range Breakout (ORB) Strategy',
    authors: 'Carlo Zarattini & Andrew Aziz',
    venue: 'SSRN Working Paper',
    year: 2023,
    topic: 'Trading Strategies',
    url: '/library/can-day-trading-be-profitable-orb.pdf',
    note: 'Backtests a simple 5-minute Opening Range Breakout strategy on QQQ/TQQQ (2016–2023) and finds a large, market-uncorrelated alpha — while showing how leveraged ETFs sidestep broker leverage caps, and flagging the slippage caveats.',
  },
  {
    title: 'VWAP: The Holy Grail for Day Trading Systems',
    authors: 'Carlo Zarattini & Andrew Aziz',
    venue: 'SSRN Working Paper',
    year: 2023,
    topic: 'Trading Strategies',
    url: '/library/vwap-holy-grail-day-trading.pdf',
    note: 'Uses the Volume-Weighted Average Price to detect intraday supply/demand imbalances and build day-trading signals — a practitioner study from the same Concretum authors as the ORB paper.',
  },
  // To add another: copy a shape above. `url` can be an external link
  // (arXiv/SSRN/journal) or a self-hosted PDF at /library/<file>.pdf.
];

function PaperCard({ p }) {
  const meta = [p.authors, p.venue, p.year].filter(Boolean).join(' · ');
  const external = p.url && p.url.startsWith('http');
  const selfHosted = p.url && p.url.startsWith('/library/');
  // Self-hosted PDFs open in the on-site reader (like the books); external
  // links (arXiv/SSRN/journal) open in a new tab.
  const readerHref = selfHosted
    ? `/read?file=${encodeURIComponent(p.url)}&title=${encodeURIComponent(p.title)}`
    : p.url;
  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.title}>
          {external ? (
            <a href={p.url} target="_blank" rel="noreferrer">{p.title} ↗</a>
          ) : (
            <Link to={readerHref}>{p.title} {selfHosted ? '📖' : '→'}</Link>
          )}
        </h2>
        {p.topic && <span className={styles.topic}>{p.topic}</span>}
      </div>
      {meta && <p className={styles.meta}>{meta}</p>}
      {p.note && <p className={styles.note}>{p.note}</p>}
    </article>
  );
}

export default function ResearchPapers() {
  return (
    <Layout
      title="Research Papers"
      description="Research papers in quantitative finance I'm reading, working through, and collecting — with a note on why each one matters.">
      <PageHeader
        eyebrow="Reading list"
        title="Research Papers"
        subtitle="Papers I’m reading and working through on the quant journey."
      />

      <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
        {PAPERS.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>📄 This shelf is being curated.</p>
            <p>
              I&rsquo;m collecting the papers that shape how I think about markets and models —
              foundational work and current research alike. Each will land here with a short note
              on why it matters and a link to read it. Check back soon.
            </p>
            <Link className="button button--primary" to="/books">
              Browse the book library →
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {PAPERS.map((p) => (
              <PaperCard key={p.title} p={p} />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
