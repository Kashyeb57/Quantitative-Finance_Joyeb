import React from 'react';
import Layout from '@theme/Layout';
import PageHeader from '@site/src/components/PageHeader';
import Heading from '@theme/Heading';
import Tools from '@site/src/components/Tools';

export default function ToolsPage() {
  return (
    <Layout title="Tools" description="Software and tools I use for quantitative finance work.">
      <PageHeader
        eyebrow="Toolkit"
        title="Tools"
        subtitle="The software in my quant toolkit."
      />
      <main>
        <Tools />
      </main>
    </Layout>
  );
}
