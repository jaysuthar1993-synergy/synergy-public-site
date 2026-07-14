/**
 * /robots.txt
 *
 * A route handler rather than Next's robots.js metadata API, because the metadata
 * API cannot emit custom directives (Content-Signal) and we need them.
 *
 * DO NOT DELETE THIS FILE.
 * Cloudflare auto-injects its own robots.txt when the origin serves none, and that
 * default hard-blocks every AI crawler (ClaudeBot, GPTBot, Google-Extended, CCBot,
 * Bytespider, meta-externalagent) and sets ai-train=no. Deleting this does not give
 * you "no robots.txt" — it silently restores Cloudflare's blocking one, which
 * defeats the entire GEO strategy.
 *
 * Also required, one-time, in the Cloudflare dashboard:
 *   AI Crawl Control -> "Manage your robots.txt" -> "Disable robots.txt configuration"
 * Anything else prepends Cloudflare's managed block ABOVE ours, and agent-specific
 * rules beat our `User-agent: *`.
 */

export const dynamic = 'force-static';

const BASE = 'https://synergyfuturecorp.com';

/**
 * Content Signals (contentsignals.org) — our declared stance:
 *
 *   search=yes     Index us and link to us. Obviously yes.
 *   ai-input=yes   Use our content to answer questions in AI assistants, WITH
 *                  citation. This is the entire point of the content pipeline —
 *                  we WANT to be the source ChatGPT/Claude/Perplexity cite when a
 *                  CA asks how to get an Excel bank statement into Tally.
 *   ai-train=no    Do not use our content to train models. Training gives us no
 *                  citation, no traffic, and no attribution — it is pure give.
 *
 * NOTE: the common boilerplate is `ai-train=no, search=yes, ai-input=no`.
 * Do NOT copy that. `ai-input=no` tells AI assistants not to cite us, which kills
 * GEO. If you ever want to allow training too, flip ai-train to yes — but never
 * set ai-input to no.
 *
 * These are declarations of preference, not blocks: nothing below is disallowed.
 */
const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no';

export function GET() {
  const body = `# Synergy Automation — synergyfuturecorp.com
# Free tool: post Excel bank statements directly into Tally Prime / ERP 9.
#
# All crawlers, including AI assistants, are welcome. We want to be cited.
# AI-readable index of this site: ${BASE}/llms.txt

User-agent: *
Content-Signal: ${CONTENT_SIGNAL}
Allow: /

Host: ${BASE}
Sitemap: ${BASE}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
