'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './LandingPage.css';

const APP_URL = 'https://app.synergyfuturecorp.com';

const BANKS = [
  'HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank',
  'PNB', 'Bank of Baroda', 'Yes Bank', 'IDFC First', 'Canara Bank',
  'Union Bank', 'IndusInd Bank'
];

const BANK_GUIDES = [
  { slug: 'hdfc', name: 'HDFC Bank' },
  { slug: 'sbi', name: 'SBI' },
  { slug: 'icici', name: 'ICICI Bank' },
  { slug: 'axis', name: 'Axis Bank' },
  { slug: 'kotak', name: 'Kotak Bank' },
  { slug: 'pnb', name: 'PNB' },
  { slug: 'bank-of-baroda', name: 'Bank of Baroda' },
  { slug: 'yes-bank', name: 'Yes Bank' },
];

const COMPARISON = [
  { feature: 'Direct Tally posting (no XML)', xmlTools: false, paidPlatforms: true, synergy: true },
  { feature: 'Completely free', xmlTools: true, paidPlatforms: false, synergy: true },
  { feature: 'Review entries before posting', xmlTools: false, paidPlatforms: true, synergy: true },
  { feature: 'Auto-detects format (no template needed)', xmlTools: false, paidPlatforms: true, synergy: true },
  { feature: 'Works with Tally Prime & ERP 9', xmlTools: true, paidPlatforms: true, synergy: true },
  { feature: 'No file downloads needed', xmlTools: false, paidPlatforms: true, synergy: true },
];

const BLOG_PREVIEWS = [
  {
    slug: 'excel-to-tally-complete-guide',
    title: 'Excel to Tally: The Complete Guide for Indian Accountants (2026)',
    excerpt: 'Everything you need to know about importing Excel bank statements into Tally — formats, steps, common errors, and the fastest way to do it.',
    tag: 'Guide', readTime: '12 min read'
  },
  {
    slug: 'direct-posting-vs-xml-import',
    title: "Direct Tally Posting vs XML File Import: What's the Difference?",
    excerpt: 'Two ways to get bank data into Tally. One requires a file and manual import. The other posts directly. Here\'s why it matters.',
    tag: 'Explainer', readTime: '8 min read'
  }
];

const IconSearch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconFile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconEye = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconActivity = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const FEATURES = [
  { Icon: IconSearch, title: 'Auto-Detects Your Bank Format', description: 'Works with HDFC, SBI, ICICI, Axis, Kotak, PNB, Bank of Baroda, Yes Bank, IDFC First, Canara Bank, Union Bank, IndusInd Bank and more — no manual template selection needed.' },
  { Icon: IconFile,   title: 'Direct Tally Posting',         description: 'No XML file, no manual import, no Tally import dialog. Entries post directly into your open Tally company via the Synergy Connector.' },
  { Icon: IconEye,    title: 'Review Before Posting',        description: 'See every entry in a table — date, narration, debit/credit amount, and ledger assignment. Edit anything, skip entries, then post.' },
  { Icon: IconActivity, title: 'Flexible Ledger Assignment', description: 'Choose the correct Tally ledger for each transaction from your chart of accounts. Full control over every entry before it posts.' },
  { Icon: IconCheck,  title: 'Tally Prime & ERP 9',          description: 'Compatible with both Tally Prime (including version 6.0) and Tally ERP 9. Install the Synergy Connector once and start posting.' },
  { Icon: IconBar,    title: 'Unlimited Entries',            description: "No transaction limits, no entry caps. Process every entry from every month's bank statement without restrictions." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const faqs = [
    {
      q: 'How is this different from other Excel to Tally tools?',
      a: 'Most tools convert your Excel file to XML, then you manually import that XML into Tally. Synergy Automation skips all of that — it posts directly into your open Tally software. No XML, no import dialog, no file handling. Upload Excel → review entries → click Post. Done.'
    },
    {
      q: 'Which Indian banks are supported?',
      a: "Synergy Automation works with HDFC Bank, SBI, ICICI Bank, Axis Bank, Kotak Bank, PNB, Bank of Baroda, Yes Bank, IDFC First Bank, Canara Bank, Union Bank, and IndusInd Bank. The system auto-detects your bank's format — no manual configuration needed."
    },
    {
      q: 'Does it work with Tally Prime and Tally ERP 9?',
      a: 'Yes. Synergy Automation is compatible with both Tally Prime (including version 6.0) and Tally ERP 9. Install the lightweight Synergy Connector on the PC where Tally runs, and entries post directly into your open Tally company.'
    },
    {
      q: 'Can I review entries before they post to Tally?',
      a: "Yes — this is one of our core features. Every entry appears in a review table before anything reaches Tally. You see the date, narration, amount, and ledger assignment. Edit narrations, change ledger accounts, skip entries you don't want — then click Post."
    },
    {
      q: 'Is it really free?',
      a: 'Yes. Synergy Automation is free to use. Early users lock in free access. When premium features are added, early adopters receive priority benefits.'
    },
    {
      q: 'What do I need to install?',
      a: 'Only the Synergy Connector — a lightweight app — on the Windows PC where Tally is running. The web dashboard works in any browser. No other software required.'
    },
    {
      q: 'Is my bank data safe?',
      a: 'Yes. Your bank statement data is stored securely in our system to process and post entries into Tally. We do not share your financial data with any third party, and we do not use it for any purpose other than posting to your Tally company. Your data is never sold, never used for analytics, and never shared.'
    },
    {
      q: 'Can I manage multiple Tally companies?',
      a: "Yes. Switch between multiple Tally companies in the dashboard. Each company's data is kept separate — ideal for CAs managing multiple clients."
    }
  ];

  return (
    <div className="lp">
      {/* ── Navigation ── */}
      <nav className="lp-nav">
        <Link href="/" className="lp-logo">Synergy Automation</Link>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
          <Link href="/blog" className="lp-nav-link">Blog</Link>
          <Link href="/updates" className="lp-nav-link">Updates</Link>
          <Link href="/banks/hdfc" className="lp-nav-link">Bank Guides</Link>
        </div>
        <div className="lp-nav-actions">
          <a href={`${APP_URL}/login`} className="lp-btn-ghost">Login</a>
          <a href={`${APP_URL}/register`} className="lp-btn-primary">Get Started Free</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-glow" aria-hidden="true" />
        <div className="lp-hero-inner">
          <div className="lp-badge">Free for Indian CAs &amp; Accountants</div>
          <h1 className="lp-h1">
            Post Bank Statements<br />
            Directly to Tally.<br />
            <span className="lp-h1-accent">No XML. No Import.</span>
          </h1>
          <p className="lp-hero-sub">
            Upload your Excel bank statement, review every entry, and post directly into Tally Prime or ERP 9 in 3 steps. Free forever.
          </p>
          <div className="lp-hero-actions">
            <a href={`${APP_URL}/register`} className="lp-btn-primary lp-btn-lg">Get Started Free →</a>
            <button className="lp-btn-outline-lg" onClick={() => scrollTo('how-it-works')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: 8}}>
                <path d="M8 5v14l11-7z"/>
              </svg>
              See How It Works
            </button>
          </div>
          <p className="lp-hero-trust">
            Works with Tally Prime &amp; ERP&nbsp;9 &nbsp;·&nbsp; HDFC &nbsp;·&nbsp; SBI &nbsp;·&nbsp; ICICI &nbsp;·&nbsp; Axis &nbsp;·&nbsp; Kotak &nbsp;·&nbsp; 12&nbsp;banks
          </p>
        </div>
      </section>

      {/* ── Banks Strip ── */}
      <section className="lp-banks">
        <p className="lp-banks-label">Supports all major Indian banks</p>
        <div className="lp-banks-row">
          {BANKS.map((b) => <span key={b} className="lp-bank-pill">{b}</span>)}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-section-inner">
          <p className="lp-eyebrow">Process</p>
          <h2 className="lp-h2">Three Steps. That's It.</h2>
          <p className="lp-section-sub">No XML files, no import dialogs, no extra complexity</p>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">1</div>
              <div className="lp-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 className="lp-step-title">Upload Excel</h3>
              <p className="lp-step-desc">Drag and drop your bank statement Excel file. Synergy auto-detects your bank format — no template selection needed.</p>
            </div>
            <div className="lp-step-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">2</div>
              <div className="lp-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3 className="lp-step-title">Review Entries</h3>
              <p className="lp-step-desc">Every transaction appears in a review table. Edit narrations, assign Tally ledgers, skip entries. Full control before anything posts.</p>
            </div>
            <div className="lp-step-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">3</div>
              <div className="lp-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
              </div>
              <h3 className="lp-step-title">Post to Tally</h3>
              <p className="lp-step-desc">Click Post. Entries appear instantly in your open Tally company as bank payment and receipt vouchers. Open Tally — they're there.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="lp-compare-section">
        <div className="lp-section-inner">
          <p className="lp-eyebrow">Comparison</p>
          <h2 className="lp-h2">Why Accountants Choose Synergy Automation</h2>
          <p className="lp-section-sub">Honest comparison with every alternative available today</p>
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th className="lp-th lp-th-feature">Feature</th>
                  <th className="lp-th lp-th-other">XML Converter Tools<span className="lp-th-sub">Free, file-based</span></th>
                  <th className="lp-th lp-th-other">Paid Platforms<span className="lp-th-sub">₹4,000+ /year</span></th>
                  <th className="lp-th lp-th-synergy">
                    <span className="lp-synergy-badge">Best Choice</span>
                    Synergy Automation
                    <span className="lp-th-sub-white">Free forever</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="lp-tr">
                    <td className="lp-td lp-td-feature">{row.feature}</td>
                    <td className="lp-td lp-td-check">{row.xmlTools ? <span className="lp-yes">✓</span> : <span className="lp-no">✗</span>}</td>
                    <td className="lp-td lp-td-check">{row.paidPlatforms ? <span className="lp-yes">✓</span> : <span className="lp-no">✗</span>}</td>
                    <td className="lp-td lp-td-synergy">{row.synergy ? <span className="lp-yes-s">✓</span> : <span className="lp-no">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <p className="lp-eyebrow">Features</p>
          <h2 className="lp-h2">Everything You Need. Nothing You Don't.</h2>
          <p className="lp-section-sub">Built for Indian CAs and accountants managing Tally bank entries</p>
          <div className="lp-features">
            {FEATURES.map(({ Icon, title, description }, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon"><Icon /></div>
                <h3 className="lp-feature-title">{title}</h3>
                <p className="lp-feature-desc">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bank Guides Strip ── */}
      <section className="lp-bank-guides-section">
        <div className="lp-section-inner">
          <p className="lp-banks-label" style={{marginBottom: 20}}>Step-by-step guides for your bank</p>
          <div className="lp-bank-guides-grid">
            {BANK_GUIDES.map((b) => (
              <Link key={b.slug} href={`/banks/${b.slug}`} className="lp-bank-guide-card">
                <span className="lp-bank-guide-name">{b.name}</span>
                <span className="lp-bank-guide-arrow">Guide →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge Hub ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <p className="lp-eyebrow">Knowledge Hub</p>
          <h2 className="lp-h2">Guides for Indian Accountants</h2>
          <p className="lp-section-sub">In-depth guides on Tally bank entry, reconciliation, and automation</p>
          <div className="lp-blog-grid">
            {BLOG_PREVIEWS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="lp-blog-card">
                <div className="lp-blog-card-top">
                  <span className="lp-blog-tag">{post.tag}</span>
                  <span className="lp-blog-time">{post.readTime}</span>
                </div>
                <h3 className="lp-blog-title">{post.title}</h3>
                <p className="lp-blog-excerpt">{post.excerpt}</p>
                <span className="lp-blog-read">Read article →</span>
              </Link>
            ))}
          </div>
          <div className="lp-blog-more">
            <Link href="/blog" className="lp-btn-outline">View All Articles →</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="lp-faq-section">
        <div className="lp-section-inner lp-faq-inner">
          <p className="lp-eyebrow">FAQ</p>
          <h2 className="lp-h2">Frequently Asked Questions</h2>
          <p className="lp-section-sub">Common questions about Synergy Automation and Tally bank entry</p>
          <div className="lp-faq">
            {faqs.map((faq, i) => (
              <div key={i} className={`lp-faq-item${openFaq === i ? ' lp-faq-open' : ''}`}>
                <button className="lp-faq-q" onClick={() => toggleFaq(i)}>
                  <span>{faq.q}</span>
                  <svg
                    className={`lp-faq-icon${openFaq === i ? ' lp-faq-icon-open' : ''}`}
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {/* Always render the answer into the HTML, collapse with CSS.
                    Rendering it conditionally ({open && ...}) kept every answer
                    out of the static HTML while the FAQPage JSON-LD still claimed
                    them — which violates Google's FAQ policy (the marked-up Q&A
                    must exist on the page). An accordion is fine; an empty page
                    with schema promising answers is not. */}
                <div className="lp-faq-a" hidden={openFaq !== i}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-final-cta">
        <div className="lp-final-cta-inner">
          <h2 className="lp-final-cta-h2">Start Posting Bank Statements to Tally Today</h2>
          <p className="lp-final-cta-sub">Free. No credit card. Works immediately with Tally Prime and ERP 9.</p>
          <a href={`${APP_URL}/register`} className="lp-btn-white">Get Started Free →</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">Synergy Automation</div>
            <p className="lp-footer-tagline">Bank statement to Tally. Direct. Free.</p>
            <p className="lp-footer-company">by Synergy Future Corp<br />(Synergy Futurecorp OPC Pvt Ltd)</p>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Product</h4>
            <ul className="lp-footer-links">
              <li><button className="lp-footer-link-btn" onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
              <li><button className="lp-footer-link-btn" onClick={() => scrollTo('faq')}>FAQ</button></li>
              <li><a href={`${APP_URL}/register`} className="lp-footer-link">Get Started Free</a></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Bank Guides</h4>
            <ul className="lp-footer-links">
              <li><Link href="/banks/hdfc" className="lp-footer-link">HDFC Bank to Tally</Link></li>
              <li><Link href="/banks/sbi" className="lp-footer-link">SBI to Tally</Link></li>
              <li><Link href="/banks/icici" className="lp-footer-link">ICICI Bank to Tally</Link></li>
              <li><Link href="/banks/axis" className="lp-footer-link">Axis Bank to Tally</Link></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Knowledge Hub</h4>
            <ul className="lp-footer-links">
              <li><Link href="/blog" className="lp-footer-link">All Articles</Link></li>
              <li><Link href="/updates" className="lp-footer-link">GST &amp; Tax Updates</Link></li>
              <li><Link href="/blog/excel-to-tally-complete-guide" className="lp-footer-link">Excel to Tally Guide</Link></li>
              <li><Link href="/blog/direct-posting-vs-xml-import" className="lp-footer-link">Direct Posting vs XML</Link></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-heading">Legal &amp; Support</h4>
            <ul className="lp-footer-links">
              <li><Link href="/privacy-policy" className="lp-footer-link">Privacy Policy</Link></li>
              <li><a href="mailto:support@synergyfuturecorp.com" className="lp-footer-link">support@synergyfuturecorp.com</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>Made in India for Indian Accountants</span>
          <span className="lp-footer-sep">·</span>
          <span>© 2026 Synergy Future Corp</span>
          <span className="lp-footer-sep">·</span>
          <Link href="/privacy-policy" className="lp-footer-bottom-link">Privacy Policy</Link>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className={`lp-sticky${showStickyCta ? ' lp-sticky-visible' : ''}`}>
        <p className="lp-sticky-text">Post bank statements directly to Tally — free</p>
        <a href={`${APP_URL}/register`} className="lp-sticky-btn">Get Started Free</a>
      </div>
    </div>
  );
}
