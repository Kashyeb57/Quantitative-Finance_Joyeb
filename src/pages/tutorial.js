import React from 'react';
import Layout from '@theme/Layout';
import PageHeader from '@site/src/components/PageHeader';
import Heading from '@theme/Heading';
import TutorialHub from '@site/src/components/TutorialHub';

export default function TutorialPage() {
  return (
    <Layout title="Tutorial" description="Study notes by field — Finance, Mathematics, Statistics, Probability, Economics, Programming, and Machine Learning.">
      <PageHeader
        eyebrow="Study notes · 7 fields"
        title="Tutorial"
        subtitle="My study notes, organized by field — click any topic to dive in."
      />
      <main>
        <TutorialHub />
      </main>
    </Layout>
  );
}
