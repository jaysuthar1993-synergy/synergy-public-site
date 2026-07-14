/**
 * robots.txt
 *
 * WHY THIS FILE EXISTS:
 * Cloudflare auto-injects a default robots.txt when the origin serves none, and
 * that default sets `Content-Signal: ai-train=no` and hard-blocks every AI
 * crawler:  ClaudeBot, GPTBot, Google-Extended, CCBot, Bytespider,
 * meta-externalagent, Applebot-Extended, Amazonbot  -> all `Disallow: /`.
 *
 * That silently defeats the entire GEO effort. The whole point of the content
 * pipeline is to be the cited source when a CA asks an AI assistant "how do I
 * get an Excel bank statement into Tally" - and those assistants were locked out.
 *
 * Serving our own robots.txt overrides Cloudflare's default. Deleting this file
 * does NOT get you "no robots.txt" - it silently restores Cloudflare's blocking
 * one. Keep it.
 */

const BASE = 'https://synergyfuturecorp.com';

export default function robots() {
  return {
    rules: [
      // Search engines + AI assistants: all welcome, everywhere.
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
