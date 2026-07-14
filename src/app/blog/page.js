import Link from 'next/link';
import { getVisiblePosts } from '@/data/blogData';
import '../../components/BlogPage.css';

const DESC = 'Guides, how-tos, and tips for Indian accountants using Tally. Learn how to import bank statements, avoid entry errors, and automate reconciliation.';

export const metadata = {
  title: 'Tally Automation Knowledge Hub',
  description: DESC,
  alternates: { canonical: 'https://synergyfuturecorp.com/blog' },
  // `images` must be explicit: Next.js shallow-merges metadata, so declaring
  // openGraph here replaces the root's object and silently drops og:image.
  openGraph: {
    type: 'website',
    title: 'Tally Automation Knowledge Hub | Synergy Automation',
    description: DESC,
    url: 'https://synergyfuturecorp.com/blog',
    siteName: 'Synergy Automation',
    locale: 'en_IN',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tally Automation Knowledge Hub',
    description: DESC,
    images: ['/og-image.png'],
  },
};

const APP_URL = 'https://app.synergyfuturecorp.com';

export default function BlogListPage() {
  return (
    <div className="blog-layout">
      <nav className="blog-nav">
        <Link href="/" className="blog-home-link">← Synergy Automation</Link>
        <a href={`${APP_URL}/register`} className="blog-cta-btn">Get Free Access</a>
      </nav>

      <div className="blog-list-container">
        <div className="blog-list-header">
          <h1>Tally Automation Knowledge Hub</h1>
          <p>Practical guides for Indian accountants and CA firms using Tally</p>
        </div>

        <div className="blog-grid">
          {getVisiblePosts().map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-list-card">
              <span className="blog-list-tag">{post.tag}</span>
              <h2 className="blog-list-title">{post.title}</h2>
              <p className="blog-list-excerpt">{post.description}</p>
              <div className="blog-list-meta">
                <span>{new Date(post.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="blog-read-link">Read →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="blog-list-cta">
          <div className="blog-cta-box">
            <h3>Try Synergy Automation Free</h3>
            <p>Post Excel bank statements directly to Tally Prime or ERP 9. No XML. No manual import.</p>
            <a href={`${APP_URL}/register`} className="cta-primary">Get Free Access</a>
          </div>
        </div>
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <span>© 2026 Synergy Future Corp</span>
          <span className="blog-footer-sep">·</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span className="blog-footer-sep">·</span>
          <a href="mailto:support@synergyfuturecorp.com">support@synergyfuturecorp.com</a>
        </div>
      </footer>
    </div>
  );
}
