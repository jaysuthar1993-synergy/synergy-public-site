import { blogPosts } from '@/data/blogData';
import { banks } from '@/data/bankData';

const BASE = 'https://synergyfuturecorp.com';

export default function sitemap() {
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

  return [
    { url: `${BASE}/`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/blog`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/updates`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/privacy-policy`,lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    ...blogUrls,
    ...bankUrls,
  ];
}
