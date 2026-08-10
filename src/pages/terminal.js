import React from 'react';
import Layout from '@theme/Layout';
import PageHeader from '@site/src/components/PageHeader';
import Heading from '@theme/Heading';
import Terminal from '@site/src/components/Terminal';

export default function TerminalPage() {
  return (
    <Layout title="Terminal" description="A market terminal — live stock charts and news.">
      <PageHeader
        eyebrow="Live · market data"
        title="Market Terminal"
        subtitle="Stock charts and news, side by side."
      />
      <main>
        <Terminal />
      </main>
    </Layout>
  );
}
