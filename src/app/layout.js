import Script from 'next/script';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://synergyfuturecorp.com'),
  title: {
    default: 'Excel Bank Statement to Tally | Free Direct Posting | Synergy Automation',
    template: '%s | Synergy Automation',
  },
  description:
    'Upload Excel bank statement, review entries, post directly to Tally Prime or ERP 9. No XML export, no manual import. Free for Indian chartered accountants and businesses.',
  keywords:
    'excel to tally, bank statement to tally, tally bank reconciliation, tally prime bank import, free tally automation, bank reconciliation tally india',
  authors: [{ name: 'Synergy Future Corp' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: 'https://synergyfuturecorp.com/',
    siteName: 'Synergy Automation',
    title: 'Excel Bank Statement to Tally | Free Direct Posting | Synergy Automation',
    description: 'Upload Excel bank statement, review entries, post directly to Tally. No XML export needed. Free for Indian accountants.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Excel Bank Statement to Tally — Free & Direct | Synergy Automation',
    description: 'Upload Excel bank statement, review entries, post directly to Tally. No XML export needed. Free for Indian accountants.',
    images: ['/og-image.png'],
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Synergy Automation',
  alternateName: 'Synergy Tally Automation',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'AccountingApplication',
  operatingSystem: 'Web Browser',
  description:
    'Upload Excel bank statement, review entries, post directly to Tally Prime or Tally ERP 9. No XML export needed. Free for chartered accountants and businesses in India.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '50' },
  provider: { '@type': 'Organization', name: 'Synergy Future Corp', url: 'https://synergyfuturecorp.com' },
  featureList: [
    'Direct Tally posting — no XML file needed',
    'Review and edit entries before posting',
    'Auto-detect Indian bank statement format',
    'Compatible with Tally Prime and Tally ERP 9',
    'Works with HDFC, SBI, ICICI, Axis, Kotak, PNB and more',
    'Full entry review table — edit narrations and assign ledgers before posting',
    'Unlimited entries — no transaction limits',
    'Cloud dashboard — access from any device',
  ],
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Synergy Future Corp',
  legalName: 'Synergy Futurecorp OPC Pvt Ltd',
  url: 'https://synergyfuturecorp.com',
  logo: 'https://synergyfuturecorp.com/og-image.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@synergyfuturecorp.com',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  description:
    'Synergy Future Corp builds free accounting automation tools for Indian chartered accountants and businesses.',
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to import Excel bank statement directly into Tally',
  description: 'Post bank statement entries directly to Tally Prime or ERP 9 without XML files. Three simple steps.',
  totalTime: 'PT5M',
  tool: [
    { '@type': 'HowToTool', name: 'Synergy Automation (free web tool)' },
    { '@type': 'HowToTool', name: 'Synergy Connector (lightweight desktop app)' },
    { '@type': 'HowToTool', name: 'Tally Prime or Tally ERP 9' },
  ],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Upload your Excel bank statement',
      text: 'Download your bank statement in Excel format from your bank portal. Upload it to Synergy Automation — the system automatically detects your bank format (HDFC, SBI, ICICI, Axis, Kotak and more).',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Review entries before posting',
      text: 'Check every entry in the dashboard before it goes to Tally. Edit narrations, assign ledger accounts, skip entries you do not need. Nothing posts without your review.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Post directly to Tally',
      text: 'Click Post — entries appear instantly in your open Tally company. No XML file, no manual import, no extra steps. Works with Tally Prime and Tally ERP 9.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is Synergy Automation different from Excel to Tally converter tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Other tools create XML files that you must manually import into Tally. Synergy Automation posts entries DIRECTLY into your open Tally software — no XML file, no manual import step, no file handling. You upload the Excel statement, review entries, and click Post. Done.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which Indian banks are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Synergy Automation works with most major Indian bank statement formats including HDFC Bank, SBI, ICICI Bank, Axis Bank, Kotak Mahindra Bank, Punjab National Bank (PNB), Bank of Baroda, Yes Bank, IDFC First Bank, Canara Bank, and Union Bank of India. The system auto-detects the format from your Excel file.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Synergy Automation really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Synergy Automation is completely free to use during our launch period. Early users lock in free access. When premium features are added, early adopters receive priority pricing and benefits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Synergy Automation work with Tally Prime and Tally ERP 9?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Synergy Automation is compatible with both Tally Prime (all versions including 6.0) and Tally ERP 9. You install the lightweight Synergy Connector on the same PC where Tally is running, and entries post directly into your open Tally company.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install anything?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need to install the Synergy Connector — a lightweight desktop app — on the Windows PC where Tally is running. The Connector bridges our cloud dashboard to your local Tally software. The dashboard itself runs in any web browser with no installation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my bank data secure with Synergy Automation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Your bank statement data is stored securely in our system to process and post entries into Tally. We do not share your financial data with any third party, and we do not use it for any purpose other than posting to your Tally company. Your data is never sold, never used for analytics, and never shared.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use Synergy Automation for multiple companies in Tally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can manage multiple Tally companies in Synergy Automation. Switch between companies in the dashboard. Each company\'s data is kept separate. Ideal for chartered accountants managing multiple clients.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to import 500 bank entries into Tally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'With Synergy Automation, uploading, reviewing, and posting 500 bank entries typically takes 10–20 minutes depending on how many entries need manual ledger assignment. The same task done manually in Tally typically takes 3–6 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I review and edit entries before they go into Tally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — this is one of Synergy Automation\'s key features. Before any entry reaches Tally, you see a complete table of all entries with narrations, amounts, dates, and suggested ledger accounts. You can edit narrations, change ledger assignments, or skip specific entries. Nothing posts without your review.',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/og-image.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        {children}
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MYXZSXXRHF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MYXZSXXRHF');
            gtag('config', 'AW-17942155496');
          `}
        </Script>
      </body>
    </html>
  );
}
