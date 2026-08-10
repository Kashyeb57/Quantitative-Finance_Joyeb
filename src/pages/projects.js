import React from 'react';
import Layout from '@theme/Layout';
import PageHeader from '@site/src/components/PageHeader';
import Heading from '@theme/Heading';
import Projects from '@site/src/components/Projects';

export default function ProjectsPage() {
  return (
    <Layout title="Projects" description="My quantitative finance projects — models, backtests, tools, and experiments.">
      <PageHeader
        eyebrow="Build log"
        title="Projects"
        subtitle="What I’ve built on the quant journey."
      />
      <main>
        <Projects />
      </main>
    </Layout>
  );
}
