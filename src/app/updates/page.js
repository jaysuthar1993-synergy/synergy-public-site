import UpdatesClient from './UpdatesClient';

export const metadata = {
  title: 'GST, Income Tax & Tally Updates',
  description: 'Latest government circulars and notices for Indian accountants — CBIC, CBDT, GST Portal, MCA and RBI updates that affect Tally users.',
  alternates: { canonical: 'https://synergyfuturecorp.com/updates' },
  openGraph: {
    title: 'GST & Income Tax Updates for Tally Users | Synergy Automation',
    url: 'https://synergyfuturecorp.com/updates',
  },
};

export default function UpdatesPage() {
  return <UpdatesClient />;
}
