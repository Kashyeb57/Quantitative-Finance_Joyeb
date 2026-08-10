import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

/**
 * PHOSPHOR page header — the shared "furniture" for every bespoke page.
 * A mono eyebrow/kicker (with a green register tick), a Space Grotesk title,
 * and a lead subtitle, set over a graphite panel with a masked hairline
 * lattice. Replaces the stock Docusaurus `hero hero--primary` banner.
 */
export default function PageHeader({eyebrow, title, subtitle, children, align = 'left'}) {
  return (
    <header className={clsx(styles.header, align === 'center' && styles.center)}>
      <div className={clsx('container', styles.inner)}>
        {eyebrow && (
          <p className={styles.eyebrow}>
            <span className={styles.tick} aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <Heading as="h1" className={styles.title}>{title}</Heading>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </header>
  );
}
