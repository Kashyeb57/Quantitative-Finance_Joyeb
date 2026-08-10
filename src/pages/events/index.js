import React from 'react';
import Layout from '@theme/Layout';
import PageHeader from '@site/src/components/PageHeader';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

/*
 * Big Events — a running log of the market blow-ups, manias and incidents worth
 * understanding in full. Each entry is a standalone page written to still make
 * sense a decade from now: what happened, the numbers, the charts, and the
 * lesson. To add one, drop a new page in src/pages/events/ and append it here.
 */
const EVENTS = [
  {
    slug: 'kospi-leverage-crash',
    tag: 'Blow-up',
    date: 'July–August 2026',
    title: 'The KOSPI leverage crash',
    blurb:
      'South Korea cheered its citizens into stocks, then let single-stock leveraged ETFs list to retail — stacked on record margin debt and concentrated in Samsung and SK Hynix. The KOSPI ran +116% to an all-time high, then fell 38.6% in five weeks; ~360,000 retail accounts were force-liquidated (62% under 35), and the finance minister apologized as the rules were rewritten mid-crash.',
  },
  {
    slug: 'situational-awareness-collapse',
    tag: 'Blow-up',
    date: 'July 2026',
    title: 'The Situational Awareness fund collapse',
    blurb:
      'Leopold Aschenbrenner — the ex-OpenAI researcher who wrote the famous "Situational Awareness" AGI manifesto — turned $225M into a reported ~$45B AI-infrastructure fund, then lost roughly two-thirds of it in a single month. Prime brokers forced a ~$16B fire sale to Citadel. A textbook leverage blow-up.',
  },
];

function EventCard({ e }) {
  return (
    <Link className={styles.card} to={`/events/${e.slug}`}>
      <div className={styles.cardTop}>
        <span className={`${styles.tag} ${styles.tagCrash}`}>{e.tag}</span>
        <span className={styles.date}>{e.date}</span>
      </div>
      <Heading as="h2" className={styles.cardTitle}>{e.title}</Heading>
      <p className={styles.cardBlurb}>{e.blurb}</p>
      <span className={styles.readMore}>Read the full breakdown →</span>
    </Link>
  );
}

export default function BigEvents() {
  return (
    <Layout
      title="Big Events"
      description="A running log of the market blow-ups, manias and incidents worth understanding in full — what happened, the numbers, the charts, and the lesson.">
      <PageHeader
        eyebrow="Post-mortems"
        title="Big Events & Incidents"
        subtitle="The blow-ups and manias worth remembering — explained in full, with the curves."
      />

      <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <p className={styles.intro}>
          Markets teach their hardest lessons through spectacular failures. This is my log of the
          ones worth keeping — each written as a complete, self-contained story so that even years
          from now I can open it and get the whole picture: what happened, the numbers, the charts,
          and what it teaches about risk. Newest first.
        </p>

        <div className={styles.list}>
          {EVENTS.map((e) => (
            <EventCard key={e.slug} e={e} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
