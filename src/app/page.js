/**
 * Homepage — SERVER component.
 *
 * The landing page itself is a client component (it has accordions//state), and
 * a client component cannot `export const metadata`. That is why the homepage —
 * the most valuable URL on the site — shipped with NO canonical tag while every
 * other page type had one.
 *
 * So the page is split: this server wrapper owns the metadata and the page-level
 * JSON-LD, and renders the client UI inside it.
 *
 * The HowTo and FAQPage schemas live HERE, not in layout.js. In the layout they
 * were injected into every page on the site — including /privacy-policy and
 * /updates, which contain neither a how-to nor those questions.
 */

import LandingPage from '@/components/LandingPage';
import { howToSchema, faqSchema } from './layout';

export const metadata = {
  alternates: { canonical: 'https://synergyfuturecorp.com/' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage />
    </>
  );
}
