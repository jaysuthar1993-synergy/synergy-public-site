import Link from 'next/link';
import '../../components/BlogPage.css';

const BASE = 'https://synergyfuturecorp.com';
const APP_URL = 'https://app.synergyfuturecorp.com';
const DESC = 'About Synergy Futurecorp OPC Pvt Ltd — the team behind Synergy Automation, a free tool that posts Excel bank statements directly into Tally for Indian accountants.';

export const metadata = {
  title: 'About Synergy Automation',
  description: DESC,
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    type: 'website',
    title: 'About Synergy Automation | Synergy Futurecorp',
    description: DESC,
    url: `${BASE}/about`,
    siteName: 'Synergy Automation',
    locale: 'en_IN',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Synergy Automation',
    description: DESC,
    images: ['/og-image.png'],
  },
};

export default function AboutPage() {
  // AboutPage + Organization schema gives the company a real entity for Google to
  // attach trust to — the E-E-A-T signal that matters most for tax/finance content.
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Synergy Automation',
    url: `${BASE}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Synergy Future Corp',
      legalName: 'Synergy Futurecorp OPC Pvt Ltd',
      url: BASE,
      logo: `${BASE}/og-image.png`,
      email: 'support@synergyfuturecorp.com',
      areaServed: 'IN',
      description:
        'Synergy Futurecorp OPC Pvt Ltd builds free accounting-automation tools for Indian chartered accountants and businesses, including Synergy Automation and the Synergy Connector.',
      knowsAbout: ['Tally Prime', 'Tally ERP 9', 'bank reconciliation', 'GST', 'Indian accounting'],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@synergyfuturecorp.com',
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'About' },
    ],
  };

  return (
    <div className="blog-layout">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />

      <nav className="blog-nav">
        <Link href="/" className="blog-home-link">← Synergy Automation</Link>
        <a href={`${APP_URL}/register`} className="blog-cta-btn">Get Free Access</a>
      </nav>

      <div className="blog-post-container">
        <h1 className="blog-post-title">About Synergy Automation</h1>

        <p className="blog-intro">
          Synergy Automation is a free tool that posts Excel bank statements directly into
          Tally Prime and Tally ERP 9 — no XML files, no manual import screens, and no
          retyping. It is built by Synergy Futurecorp OPC Pvt Ltd for the Indian accountants,
          chartered accountants, and business owners who do this work every month.
        </p>

        <h2>Why we built it</h2>
        <p>
          Getting a bank statement into Tally is one of the most repetitive jobs in any Indian
          accounting office. Typing entries by hand is slow and error-prone; XML converter tools
          add extra steps and give you no chance to review entries before they land in Tally.
          We wanted a simpler path: upload the Excel statement your bank already gives you,
          review every entry in a table, and post directly to your open Tally company.
        </p>

        <h2>What Synergy Automation does</h2>
        <ul>
          <li>Posts entries <strong>directly</strong> to Tally Prime and Tally ERP 9 — no XML file, no import dialog</li>
          <li>Lets you <strong>review and edit every entry</strong> — narrations, ledgers, and which entries to skip — before anything reaches Tally</li>
          <li><strong>Auto-detects</strong> the Excel statement format of major Indian banks, including HDFC, SBI, ICICI, Axis, Kotak, PNB, Bank of Baroda, Yes Bank, IDFC First, Canara, Union Bank and IndusInd</li>
          <li>Works with both Tally Prime and Tally ERP 9</li>
          <li>Is <strong>free</strong>, with no transaction limits</li>
        </ul>

        <h2>Who it is for</h2>
        <p>
          Practising CAs and CA firms handling many clients, in-house accountants closing the
          books each month, and small business owners who maintain their own Tally. If you spend
          hours moving bank data into Tally, Synergy Automation is built for you.
        </p>

        <h2>The company</h2>
        <p>
          Synergy Automation is a product of <strong>Synergy Futurecorp OPC Pvt Ltd</strong>,
          an Indian company that builds free accounting-automation tools for the Tally ecosystem.
          Alongside Synergy Automation, we also make the Synergy Connector, a lightweight desktop
          app that securely links the web tool to your running Tally. We handle your data in line
          with India&rsquo;s Digital Personal Data Protection Act, 2023 — see our{' '}
          <Link href="/privacy-policy" className="blog-inline-link">Privacy Policy</Link> for details.
        </p>

        <h2>Learn more</h2>
        <p>
          Our <Link href="/blog" className="blog-inline-link">Knowledge Hub</Link> has practical,
          jargon-free guides on bank reconciliation, GST, TDS and getting Excel into Tally, and our{' '}
          <Link href="/updates" className="blog-inline-link">Updates</Link> page tracks the
          government circulars that affect Indian accountants — each with the exact step to take in Tally.
        </p>

        <h2>Contact</h2>
        <p>
          Questions, feedback, or a bank format we don&rsquo;t detect yet? Email{' '}
          <a href="mailto:support@synergyfuturecorp.com" className="blog-inline-link">support@synergyfuturecorp.com</a>.
        </p>

        <div className="blog-inline-cta">
          <h3>Try Synergy Automation — Free</h3>
          <p>Upload your Excel bank statement, review entries, post directly to Tally Prime or ERP 9.</p>
          <a href={`${APP_URL}/register`} className="cta-primary">Get Free Access</a>
        </div>
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <Link href="/">Synergy Automation</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/blog">Knowledge Hub</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/updates">Updates</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
