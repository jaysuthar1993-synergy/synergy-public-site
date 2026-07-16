/**
 * /.well-known/security.txt  (RFC 9116)
 *
 * Tells security researchers how to responsibly report a vulnerability instead
 * of disclosing it publicly. Cheap, standard, and a small credibility signal.
 *
 * Expires is required by the RFC and must be a future date. We compute it as one
 * year from build time, and the site rebuilds frequently (content pipeline), so
 * it effectively auto-renews. If the file ever shows as expired, just redeploy.
 */

export const dynamic = 'force-static';

const BASE = 'https://synergyfuturecorp.com';

export function GET() {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = `# Security contact for synergyfuturecorp.com
# If you have found a security issue, please report it privately to the contact below.

Contact: mailto:support@synergyfuturecorp.com
Expires: ${expires.toISOString()}
Preferred-Languages: en
Canonical: ${BASE}/.well-known/security.txt
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
