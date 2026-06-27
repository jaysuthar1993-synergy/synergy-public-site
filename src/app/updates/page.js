import UpdatesClient from './UpdatesClient';

export const metadata = {
  title: 'GST, Income Tax & CA Updates for Tally Users',
  description: 'Daily government circulars, CBIC/CBDT notifications, and CA community updates for Indian accountants using Tally. Updated every morning.',
  alternates: { canonical: 'https://synergyfuturecorp.com/updates' },
  openGraph: {
    title: 'GST & Income Tax Updates for Tally Users | Synergy Automation',
    url: 'https://synergyfuturecorp.com/updates',
  },
};

export default function UpdatesPage() {
  return <UpdatesClient />;
}
