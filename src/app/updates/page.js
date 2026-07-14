import UpdatesClient from './UpdatesClient';
import { getUpdatesByType } from '../../data/updatesData';

const DESC = 'Latest government circulars and notices for Indian accountants — CBIC, CBDT, GST Portal, MCA and RBI updates that affect Tally users.';

export const metadata = {
  title: 'GST, Income Tax & Tally Updates',
  description: DESC,
  alternates: { canonical: 'https://synergyfuturecorp.com/updates' },
  // `images` must be explicit: Next.js shallow-merges metadata, so declaring
  // openGraph here replaces the root's object and silently drops og:image.
  openGraph: {
    type: 'website',
    title: 'GST & Income Tax Updates for Tally Users | Synergy Automation',
    description: DESC,
    url: 'https://synergyfuturecorp.com/updates',
    siteName: 'Synergy Automation',
    locale: 'en_IN',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GST & Income Tax Updates for Tally Users',
    description: DESC,
    images: ['/og-image.png'],
  },
};

export default function UpdatesPage() {
  const updates = getUpdatesByType('govt');

  // ItemList tells Google this page is a structured feed of dated updates, not
  // one blob of text. Without it, individual circulars have no chance of
  // surfacing for queries like "CBIC ITC reversal Rule 42 circular".
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'GST, Income Tax & Tally Updates',
    description: DESC,
    numberOfItems: updates.length,
    itemListElement: updates.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'NewsArticle',
        headline: u.title,
        description: u.summary,
        datePublished: u.date,
        url: `https://synergyfuturecorp.com/updates#${u.id}`,
        author: { '@type': 'Organization', name: u.source },
        publisher: {
          '@type': 'Organization',
          name: 'Synergy Automation',
          logo: { '@type': 'ImageObject', url: 'https://synergyfuturecorp.com/og-image.png' },
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <UpdatesClient />
    </>
  );
}
