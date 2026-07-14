import Link from 'next/link';
import { getBlogPost, blogPosts, getVisiblePosts } from '@/data/blogData';
import { banks } from '@/data/bankData';
import '../../../components/BlogPage.css';
import ShareBar from '../../../components/ShareBar';

/**
 * Auto-link bank names in article body text to their bank pages.
 *
 * The pillar article lists 12 Indian banks as plain strings and linked to NONE of
 * the 8 bank pages that exist — so those pages sat near-orphaned while the article
 * that should feed them just named them in text. This turns every mention into a
 * real internal link, which is the cheapest way to make the pillar an actual hub.
 *
 * Longest names first, so "Bank of Baroda" is matched before "Bank".
 */
const BANK_LINKS = [...banks]
  .sort((a, b) => b.name.length - a.name.length)
  .map(b => ({ name: b.name, href: `/banks/${b.slug}` }));

function autoLinkBanks(text, keyPrefix) {
  if (typeof text !== 'string') return text;

  const pattern = new RegExp(
    `\\b(${BANK_LINKS.map(b => b.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'g'
  );

  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    const match = BANK_LINKS.find(b => b.name === part);
    if (!match) return part;
    return (
      <Link key={`${keyPrefix}-b${i}`} href={match.href} className="blog-inline-link">
        {part}
      </Link>
    );
  });
}

const APP_URL = 'https://app.synergyfuturecorp.com';

export async function generateStaticParams() {
  return getVisiblePosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = getBlogPost(params.slug);
  if (!post) return { title: 'Article Not Found' };

  const url = `https://synergyfuturecorp.com/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    // Next.js SHALLOW-merges metadata: defining `openGraph` here REPLACES the
    // root's openGraph object, so omitting `images` silently dropped og:image from
    // every article. And because `twitter` was never overridden, every article
    // shipped the HOMEPAGE's Twitter card — so a share into a CA WhatsApp group
    // showed the wrong title and no image. Both must be declared explicitly.
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      siteName: 'Synergy Automation',
      locale: 'en_IN',
      publishedTime: post.published,
      modifiedTime: post.updated || post.published,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og-image.png'],
    },
  };
}

function renderContent(blocks) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'intro':
        return <p key={i} className="blog-intro">{block.text}</p>;
      case 'h2': {
        const id = block.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return <h2 key={i} id={id}>{block.text}</h2>;
      }
      case 'h3':
        return <h3 key={i}>{block.text}</h3>;
      case 'p':
        return <p key={i}>{block.text}</p>;
      case 'list':
        return (
          <ul key={i} className="blog-list">
            {block.items.map((item, j) => (
              <li key={j}>{autoLinkBanks(item, `l${i}-${j}`)}</li>
            ))}
          </ul>
        );
      case 'table':
        return (
          <div key={i} className="blog-table-wrap">
            <table className="blog-table">
              <thead>
                <tr>{block.headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {block.rows.map((row, j) => (
                  <tr key={j}>{row.map((cell, k) => <td key={k}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'steps':
        return (
          <ol key={i} className="blog-steps-list">
            {block.items.map((item, j) => <li key={j}>{item}</li>)}
          </ol>
        );
      case 'infographic':
        if (block.variant === 'checklist') {
          return (
            <div key={i} className="blog-infographic blog-infographic-checklist">
              <h3 className="blog-infographic-title">{block.title}</h3>
              <ul className="blog-infographic-items">
                {block.items.map((item, j) => (
                  <li key={j}><span className="blog-infographic-check">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <div key={i} className="blog-infographic blog-infographic-steps">
            <h3 className="blog-infographic-title">{block.title}</h3>
            <div className="blog-infographic-grid">
              {block.items.map((item, j) => {
                const text = typeof item === 'string' ? item : item.text;
                const href = typeof item === 'object' && item.href ? item.href : null;
                return (
                  <div key={j} className="blog-infographic-step">
                    <span className="blog-infographic-num">{j + 1}</span>
                    {href
                      ? <a href={href} className="blog-infographic-link"><p>{text}</p></a>
                      : <p>{text}</p>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'faq':
        return (
          <div key={i} className="blog-faq">
            {block.items.map((item, j) => (
              <div key={j} className="blog-faq-item">
                <p className="blog-faq-q"><strong>Q: {item.q}</strong></p>
                <p className="blog-faq-a faq-answer">{item.a}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  });
}

export default function BlogPostPage({ params }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    return (
      <div className="blog-layout">
        <nav className="blog-nav">
          <Link href="/blog" className="blog-home-link">← Knowledge Hub</Link>
          <a href={`${APP_URL}/register`} className="blog-cta-btn">Get Free Access</a>
        </nav>
        <div className="blog-post-container">
          <h1>Article Not Found</h1>
          <p><Link href="/blog">Browse all articles →</Link></p>
        </div>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    // `image` was missing — Google treats it as effectively required for Article
    // and article rich results are not granted without it.
    image: ['https://synergyfuturecorp.com/og-image.png'],
    datePublished: post.published,
    dateModified: post.updated || post.published,
    author: { '@type': 'Organization', name: 'Synergy Future Corp', url: 'https://synergyfuturecorp.com' },
    publisher: {
      '@type': 'Organization',
      name: 'Synergy Automation',
      url: 'https://synergyfuturecorp.com',
      logo: { '@type': 'ImageObject', url: 'https://synergyfuturecorp.com/og-image.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://synergyfuturecorp.com/blog/${post.slug}` },
  };

  // Breadcrumbs: replaces the raw URL in the SERP with
  // "synergyfuturecorp.com > Knowledge Hub > <title>" and reinforces hub/spoke
  // structure for the crawler. There was no BreadcrumbList anywhere on the site.
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://synergyfuturecorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: 'https://synergyfuturecorp.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  const faqBlocks = post.content.filter(b => b.type === 'faq');
  const faqSchema = faqBlocks.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqBlocks.flatMap(b => b.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))),
  } : null;

  // Link by TOPIC, not by array position.
  // This was `getVisiblePosts().filter(...).slice(0, 2)`, which handed every
  // article the same first two posts in blogData.js. Consequence: 4 of 7 articles
  // had exactly ONE inbound link (from /blog) — they were effectively orphans, and
  // Google had no signal about which pages matter. `related` is curated per post.
  const visible = getVisiblePosts();
  const bySlug = new Map(visible.map(p => [p.slug, p]));
  const related = (post.related || [])
    .map(s => bySlug.get(s))
    .filter(p => p && p.slug !== params.slug);
  const otherPosts = related.length
    ? related.slice(0, 3)
    : visible.filter(p => p.slug !== params.slug).slice(0, 2); // fallback for posts with no related[]

  return (
    <div className="blog-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <nav className="blog-nav">
        <Link href="/blog" className="blog-home-link">← Knowledge Hub</Link>
        <a href={`${APP_URL}/register`} className="blog-cta-btn">Get Free Access</a>
      </nav>

      <div className="blog-post-container">
        <div className="blog-post-header">
          <span className="blog-list-tag">{post.tag}</span>
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta-row">
            <p className="blog-post-meta">
              By Synergy Automation Team ·{' '}
              {new Date(post.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <ShareBar
              url={`https://synergyfuturecorp.com/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </div>

        <article className="blog-post-body">
          {renderContent(post.content)}
        </article>

        <div className="blog-inline-cta">
          <h3>Try Synergy Automation — Free</h3>
          <p>Post Excel bank statements directly to Tally Prime or ERP 9. No XML. No manual import. Review every entry before it reaches Tally.</p>
          <a href={`${APP_URL}/register`} className="cta-primary">Get Free Access</a>
        </div>

        {otherPosts.length > 0 && (
          <div className="blog-related">
            <h3>More from the Knowledge Hub</h3>
            <div className="blog-related-grid">
              {otherPosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-list-card">
                  <span className="blog-list-tag">{p.tag}</span>
                  <h4 className="blog-list-title">{p.title}</h4>
                  <span className="blog-read-link">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <Link href="/">Synergy Automation</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/blog">Knowledge Hub</Link>
          <span className="blog-footer-sep">·</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span className="blog-footer-sep">·</span>
          <a href="mailto:support@synergyfuturecorp.com">support@synergyfuturecorp.com</a>
        </div>
      </footer>
    </div>
  );
}
