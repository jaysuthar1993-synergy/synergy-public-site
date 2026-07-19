import { blogPosts } from '@/data/blogData';
import { banks } from '@/data/bankData';
import { updates } from '@/data/updatesData';

const BASE = 'https://synergyfuturecorp.com';

export default function sitemap() {
  // Deliberately NOT getVisiblePosts(): unapproved drafts must never reach the
  // sitemap, not even on the preview deploy. Google must only ever see approved work.
  const blogUrls = blogPosts
    .filter(p => !p.hidden)
    .map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.updated || p.published),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  const bankUrls = banks.map(b => ({
    url: `${BASE}/banks/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: b.priority || 0.7,
  }));

  // Derive lastModified from actual CONTENT dates, not new Date().
  // Stamping "modified today" on every build tells Google the whole site changed
  // every time we deploy — even when nothing did. Google learns to distrust the
  // lastmod signal and starts ignoring it, which then hurts us when a page
  // genuinely does change.
  const newestPost = blogPosts
    .filter(p => !p.hidden)
    .map(p => new Date(p.updated || p.published))
    .sort((a, b) => b - a)[0] || new Date();

  const newestUpdate = updates
    .map(u => new Date(u.date))
    .sort((a, b) => b - a)[0] || new Date();

  return [
    { url: `${BASE}/`,        lastModified: newestPost,   changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/blog`,    lastModified: newestPost,   changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/updates`, lastModified: newestUpdate, changeFrequency: 'daily',  priority: 0.8 },
    { url: `${BASE}/about`,   lastModified: newestPost,   changeFrequency: 'monthly', priority: 0.5 },
    // /privacy-policy is deliberately ABSENT: it ships `noindex`, so listing it
    // just parks a permanent "Excluded by noindex tag" error in Search Console.
    ...blogUrls,
    ...bankUrls,
  ];
}
