import Link from 'next/link';
import { getBank, banks } from '@/data/bankData';
import '../../../components/BlogPage.css';

const APP_URL = 'https://app.synergyfuturecorp.com';

export async function generateStaticParams() {
  return banks.map(b => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const bank = getBank(params.slug);
  if (!bank) return { title: 'Bank Not Found' };
  return {
    title: `${bank.name} Bank Statement to Tally | Direct Post Free`,
    description: bank.description,
    keywords: `${bank.keyword}, ${bank.name} excel to tally, ${bank.name} tally import`,
    alternates: { canonical: `https://synergyfuturecorp.com/banks/${bank.slug}` },
    openGraph: {
      title: `${bank.name} Bank Statement to Tally | Synergy Automation`,
      url: `https://synergyfuturecorp.com/banks/${bank.slug}`,
    },
  };
}

export default function BankPage({ params }) {
  const bank = getBank(params.slug);

  if (!bank) {
    return (
      <div className="blog-layout">
        <nav className="blog-nav">
          <Link href="/" className="blog-home-link">← Synergy Automation</Link>
        </nav>
        <div className="blog-post-container">
          <h1>Bank Not Found</h1>
          <p><Link href="/">Go to home →</Link></p>
        </div>
      </div>
    );
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to import ${bank.name} statement to Tally`,
    description: bank.description,
    tool: [
      { '@type': 'HowToTool', name: 'Synergy Automation (free)' },
      { '@type': 'HowToTool', name: 'Synergy Connector (desktop app)' },
      { '@type': 'HowToTool', name: 'Tally Prime or Tally ERP 9' },
    ],
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Download statement', text: `Download your ${bank.name} statement in Excel format: ${bank.downloadPath}` },
      { '@type': 'HowToStep', position: 2, name: 'Upload to Synergy Automation', text: 'Log into Synergy Automation. Select your company. Upload the Excel file. Format is detected automatically.' },
      { '@type': 'HowToStep', position: 3, name: 'Review entries', text: 'Check all entries in the review table. Edit narrations, assign Tally ledgers, skip any entries you do not need.' },
      { '@type': 'HowToStep', position: 4, name: 'Post to Tally', text: 'Click Post — entries appear directly in your Tally company. No XML file, no import step.' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I import ${bank.name} statement to Tally?`,
        acceptedAnswer: { '@type': 'Answer', text: `Download your ${bank.name} statement as Excel from net banking. Upload to Synergy Automation. Review entries and click Post — entries go directly into Tally Prime or ERP 9. No XML file needed.` },
      },
      {
        '@type': 'Question',
        name: `Does Synergy Automation work with ${bank.name} Excel statements?`,
        acceptedAnswer: { '@type': 'Answer', text: `Yes. Synergy Automation auto-detects the ${bank.name} Excel statement format: ${bank.excelFormat}` },
      },
    ],
  };

  // Rotate through the list instead of slicing the first 4.
  // `.filter(...).slice(0, 4)` always returned HDFC/SBI/ICICI/Axis, so PNB,
  // Bank of Baroda and Yes Bank received ZERO inbound links from any other bank
  // page — they were orphans. Rotating gives every bank inbound links from its
  // neighbours, so link equity actually circulates.
  const idx = banks.findIndex(b => b.slug === params.slug);
  const otherBanks = [...banks.slice(idx + 1), ...banks.slice(0, idx)].slice(0, 4);

  return (
    <div className="blog-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <nav className="blog-nav">
        <Link href="/" className="blog-home-link">← Synergy Automation</Link>
        <a href={`${APP_URL}/register`} className="blog-cta-btn">Get Free Access</a>
      </nav>

      <div className="blog-post-container">
        <div className="blog-post-header">
          <span className="blog-list-tag">Bank Guide</span>
          <h1 className="blog-post-title">{bank.name} Bank Statement to Tally: Direct Import Guide</h1>
          <p className="blog-post-meta">Free · Works with Tally Prime and Tally ERP 9 · No XML needed</p>
        </div>

        <article className="blog-post-body">
          <p className="blog-intro">{bank.description}</p>

          <h2>How to Download {bank.name} Statement as Excel</h2>
          <p><strong>Where to find it:</strong> {bank.downloadPath}</p>
          <p><strong>File format:</strong> {bank.excelFormat}</p>

          <h2>Step-by-Step: {bank.name} Statement to Tally</h2>
          <ol className="blog-steps">
            <li><strong>Download your {bank.name} statement</strong><br />Go to {bank.downloadPath}. Select your date range and download as Excel (.xlsx or .xls).</li>
            <li><strong>Open Synergy Automation</strong><br />Make sure Tally is open with the correct company. Make sure the Synergy Connector is running on the same PC.</li>
            <li><strong>Upload the Excel file</strong><br />Drag and drop your {bank.name} Excel file into Synergy Automation. The system auto-detects the format. You will see all transactions parsed and listed.</li>
            <li><strong>Review every entry</strong><br />Check narrations, amounts, dates. Assign Tally ledger accounts. Skip any entries you do not want in Tally.</li>
            <li><strong>Post to Tally</strong><br />Click Post. Entries appear instantly in your open Tally company as bank payment and receipt vouchers. No XML, no file, no import dialog.</li>
          </ol>

          {bank.notes.length > 0 && (
            <>
              <h2>{bank.name}-Specific Notes</h2>
              <ul className="blog-list">
                {bank.notes.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </>
          )}

          {bank.commonLedgers.length > 0 && (
            <>
              <h2>Common Ledger Assignments for {bank.name} Transactions</h2>
              <div className="blog-table-wrap">
                <table className="blog-table">
                  <thead>
                    <tr><th>Narration Contains</th><th>Suggested Tally Ledger</th></tr>
                  </thead>
                  <tbody>
                    {bank.commonLedgers.map((row, i) => (
                      <tr key={i}>
                        <td><code>{row.narrationKeyword}</code></td>
                        <td>{row.suggestedLedger}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="blog-note">Use these as a reference when assigning ledgers in the review table before posting to Tally.</p>
            </>
          )}

          <h2>Frequently Asked Questions</h2>
          <div className="blog-faq">
            <div className="blog-faq-item">
              <p className="blog-faq-q"><strong>Q: Does Synergy Automation work with {bank.name} statement format?</strong></p>
              <p className="blog-faq-a">Yes. Synergy Automation automatically detects the {bank.name} Excel statement format and parses columns correctly. No manual column mapping needed.</p>
            </div>
            <div className="blog-faq-item">
              <p className="blog-faq-q"><strong>Q: Do I need to convert {bank.name} statement to XML before importing to Tally?</strong></p>
              <p className="blog-faq-a">No. Synergy Automation posts entries directly from Excel to Tally — no XML file is created or needed. This is faster and simpler than traditional XML import methods.</p>
            </div>
            <div className="blog-faq-item">
              <p className="blog-faq-q"><strong>Q: Is this free for {bank.name} statements?</strong></p>
              <p className="blog-faq-a">Yes. Synergy Automation is free to use. No limits on banks, entries, or companies.</p>
            </div>
          </div>
        </article>

        <div className="blog-inline-cta">
          <h3>Try with Your {bank.name} Statement — Free</h3>
          <p>Upload your {bank.name} Excel statement. Review entries. Post directly to Tally Prime or ERP 9.</p>
          <a href={`${APP_URL}/register`} className="cta-primary">Get Free Access</a>
        </div>

        {/* Bank pages previously linked ONLY to other bank pages — the blog and the
            bank cluster were two disconnected islands with zero links between them.
            These send authority into the pillar and let a reader who lands here from
            "HDFC statement to Tally" go deeper. */}
        <div className="blog-related">
          <h3>Related Guides</h3>
          <div className="blog-related-grid">
            <Link href="/blog/excel-to-tally-complete-guide" className="blog-related-card">
              <strong>Excel to Tally: The Complete Guide</strong>
              <span>Formats, common errors, and the fastest way to post entries →</span>
            </Link>
            <Link href="/blog/bank-reconciliation-tally-prime-excel" className="blog-related-card">
              <strong>Bank Reconciliation in Tally Prime</strong>
              <span>Match your {bank.name} statement against your books →</span>
            </Link>
          </div>
        </div>

        <div className="blog-related">
          <h3>Other Bank Guides</h3>
          <div className="blog-related-grid bank-grid">
            {otherBanks.map(b => (
              <Link key={b.slug} href={`/banks/${b.slug}`} className="bank-guide-card">
                <strong>{b.name}</strong>
                <span>to Tally guide →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <Link href="/">Synergy Automation</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/blog">Knowledge Hub</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
