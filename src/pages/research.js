import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './research.module.css';

// My research-paper shelf. To add a paper, append an object below:
//   { title, authors, venue, year, url, topic?, note? }
// `url` can be an arXiv / SSRN / journal link, or a self-hosted PDF you drop in
// static/library/ and reference as /library/<file>.pdf (opens in the /read reader).
const PAPERS = [
  // Example shape (delete the // to activate, or copy it):
  // {
  //   title: 'Optimal Execution of Portfolio Transactions',
  //   authors: 'Robert Almgren & Neil Chriss',
  //   venue: 'Journal of Risk',
  //   year: 2000,
  //   topic: 'Market Microstructure',
  //   url: 'https://arxiv.org/abs/...',
  //   note: 'The mean–variance framework for trading out of a position while balancing market impact against timing risk.',
  // },
];

function PaperCard({ p }) {
  const meta = [p.authors, p.venue, p.year].filter(Boolean).join(' · ');
  const external = p.url && p.url.startsWith('http');
  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.title}>
          <a href={p.url} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            {p.title} {external ? '↗' : '→'}
          </a>
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
      <header className="hero hero--primary" style={{ padding: '2.5rem 1rem' }}>
        <div className="container">
          <Heading as="h1" className="hero__title">Research Papers</Heading>
          <p className="hero__subtitle">Papers I&rsquo;m reading and working through on the quant journey.</p>
        </div>
      </header>

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
