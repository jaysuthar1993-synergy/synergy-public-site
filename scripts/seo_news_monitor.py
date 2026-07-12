#!/usr/bin/env python3
"""
SEO News Monitor — Synergy Automation
======================================
Monitors CA YouTube channels + Indian govt websites for new updates.
When something relevant is found, generates a blog article via Claude AI
and presents it for approval before publishing.

Strategy: "First mover" on regulatory/compliance updates means more backlinks
from CA sites that pick up and cite the news.

SETUP:
  pip install google-api-python-client youtube-transcript-api google-genai feedparser requests beautifulsoup4

ENV VARS:
  YOUTUBE_API_KEY    — free, 10,000 req/day
  GEMINI_API_KEY     — free: aistudio.google.com (1,500 articles/day)

USAGE:
  # Check all channels + govt sites for new content
  python scripts/seo_news_monitor.py

  # Check only government websites
  python scripts/seo_news_monitor.py --govt-only

  # Check only CA YouTube channels
  python scripts/seo_news_monitor.py --channels-only

  # Schedule daily (Windows Task Scheduler — see schedule section at bottom)
"""

import os
import sys
import json
import re
import subprocess
import time
from datetime import date, datetime, timedelta
from pathlib import Path

# Load .env (same repo root)
_env_file = Path(__file__).parent.parent / '.env'
if _env_file.exists():
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _, _v = _line.partition('=')
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

try:
    import feedparser
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Run: pip install feedparser requests beautifulsoup4")
    sys.exit(1)

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
REPO_ROOT         = Path(__file__).parent.parent
SEEN_FILE         = Path(__file__).parent / 'seo_news_seen.json'
UPDATES_DATA_FILE = REPO_ROOT / 'src' / 'data' / 'updatesData.js'
LAST_COUNT_FILE   = REPO_ROOT / '.seo_news_last_count'
GEMINI_API_KEY    = os.environ.get('GEMINI_API_KEY')
YOUTUBE_API_KEY   = os.environ.get('YOUTUBE_API_KEY')
TODAY             = date.today().isoformat()
SITE_URL          = 'https://synergyfuturecorp.com'
TALLY_VERSION     = 'TallyPrime 6.0'
GEMINI_MODEL      = 'gemini-2.5-flash-lite'

# ─────────────────────────────────────────────
# CA YOUTUBE CHANNELS TO MONITOR
# ─────────────────────────────────────────────
# These channels post GST, Tally, Income Tax, and accounting updates.
# We pick up their topics → generate original articles → be first on Google.
CA_CHANNELS = [
    {
        'name':       'CA Guru Ji',
        'channel_id': 'UCaLiAFLDW8TE9mN4yMLYSNA',
        'keywords':   ['tally', 'bank', 'gst', 'reconciliation', 'income tax'],
    },
    {
        'name':       'Neeraj Arora CA',
        'channel_id': 'UCBqXqDf0y2NMqk2eJz1Fy6A',
        'keywords':   ['tally', 'bank statement', 'gst', 'excel', 'accounting'],
    },
    {
        'name':       'CA Suman',
        'channel_id': 'UCQh3jGJxFRJqxF7m91iR_qg',
        'keywords':   ['tally', 'gst', 'bank', 'ledger', 'voucher'],
    },
    {
        'name':       'ICAI',
        'channel_id': 'UCkVPNxlD0YP5F7Q_G2MfmGA',
        'keywords':   ['circular', 'notification', 'bank', 'reconciliation', 'audit'],
    },
    {
        'name':       'Tally Solutions',
        'channel_id': 'UCMqVGK9GlUH8sTLf7hq2sFg',
        'keywords':   ['bank statement', 'reconciliation', 'import', 'excel', 'voucher'],
    },
    {
        'name':       'ClearTax India',
        'channel_id': 'UCt5bXjFOK-LFkAcCr-WoJlw',
        'keywords':   ['gst', 'income tax', 'tds', 'bank', 'reconciliation'],
    },
    {
        'name':       'CA Rachna Ranade',
        'channel_id': 'UCvOHe3ExwKRoqns_Uo_2_8Q',
        'keywords':   ['gst', 'income tax', 'tds', 'bank', 'reconciliation', 'itr'],
    },
    {
        'name':       'Chartered Accountant',
        'channel_id': 'UCl9c3q9VWdEiJChiMN-Pz6A',
        'keywords':   ['tally', 'gst', 'bank', 'circular', 'notification'],
    },
    {
        'name':       'GST Panacea',
        'channel_id': 'UCEMRIkMPnfKmzMUVmrhrUlg',
        'keywords':   ['gst', 'circular', 'notification', 'return', 'reconciliation'],
    },
    {
        'name':       'Accounts Gyaan',
        'channel_id': 'UCfJ4l1IS7MBkKGBHBiOAGkA',
        'keywords':   ['tally', 'bank', 'gst', 'entry', 'ledger', 'voucher'],
    },
]

# ─────────────────────────────────────────────
# GOVERNMENT RSS/UPDATE FEEDS
# ─────────────────────────────────────────────
# Indian govt updates are gold for first-mover SEO.
# CAs search for these immediately after circulars drop.
GOVT_FEEDS = [
    {
        'name':     'CBDT (Income Tax)',
        'url':      'https://www.incometax.gov.in/iec/foportal/rss/whatsnew',
        'type':     'rss',
        'keywords': ['bank', 'tds', 'reconciliation', 'statement', 'tally', 'return'],
    },
    {
        'name':     'CBIC GST',
        'url':      'https://www.cbic.gov.in/htdocs-cbec/gst/gst-updates.rss',
        'type':     'rss',
        'keywords': ['gst', 'return', 'reconciliation', 'bank', 'circular', 'notification'],
    },
    {
        'name':     'GST Portal News',
        'url':      'https://www.gst.gov.in/newsandupdates',
        'type':     'scrape',
        'keywords': ['bank', 'reconciliation', 'tds', 'return', 'gstr'],
        'selector': '.news-item, .update-item, .list-item',
    },
    {
        'name':     'MCA (Company Affairs)',
        'url':      'https://www.mca.gov.in/MinistryV2/rss.html',
        'type':     'rss',
        'keywords': ['bank', 'audit', 'account', 'compliance', 'circular'],
    },
    {
        'name':     'RBI Press Releases',
        'url':      'https://www.rbi.org.in/Scripts/RSS.aspx?Id=316',
        'type':     'rss',
        'keywords': ['bank', 'reconciliation', 'statement', 'account', 'circular'],
    },
    {
        'name':     'PIB Finance Ministry',
        'url':      'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
        'type':     'rss',
        'keywords': ['gst', 'income tax', 'tds', 'bank', 'audit', 'tally'],
    },
    # ── Twitter/X via Nitter RSS (free, no API key) ──
    {
        'name':     'CBIC India (Twitter)',
        'url':      'https://nitter.net/CBIC_India/rss',
        'type':     'rss',
        'keywords': ['gst', 'circular', 'notification', 'bank', 'reconciliation'],
    },
    {
        'name':     'Income Tax India (Twitter)',
        'url':      'https://nitter.net/IncomeTaxIndia/rss',
        'type':     'rss',
        'keywords': ['tds', 'bank', 'statement', 'return', 'circular', 'refund'],
    },
    {
        'name':     'ICAI (Twitter)',
        'url':      'https://nitter.net/theicai/rss',
        'type':     'rss',
        'keywords': ['circular', 'notification', 'bank', 'reconciliation', 'audit'],
    },
    {
        'name':     'MCA India (Twitter)',
        'url':      'https://nitter.net/MCA21India/rss',
        'type':     'rss',
        'keywords': ['bank', 'audit', 'account', 'compliance', 'circular'],
    },
]

BRAND_RULES = """
BRAND RULES:
- Product: "Synergy Automation" — NEVER "Synergy Dashboard"
- No competitor names — use "other tools", "XML converter tools", "paid platforms"
- No fake numbers, no fake quotes
- LedgerMatch: NEVER mention (develop-only)
- Data honesty: "data stored securely, not shared"
- Free claim: Synergy Automation is free — state this
""".strip()


# ─────────────────────────────────────────────
# SEEN TRACKING (avoid processing same content twice)
# ─────────────────────────────────────────────
def load_seen():
    if SEEN_FILE.exists():
        return json.loads(SEEN_FILE.read_text(encoding='utf-8'))
    return {'videos': [], 'govt_items': []}


def save_seen(seen):
    SEEN_FILE.write_text(json.dumps(seen, indent=2), encoding='utf-8')


def is_relevant(text, keywords):
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in keywords)


# ─────────────────────────────────────────────
# YOUTUBE CHANNEL MONITORING
# ─────────────────────────────────────────────
def check_ca_channels(seen, days_back=3):
    if not YOUTUBE_API_KEY:
        print('YOUTUBE_API_KEY not set — skipping channel check')
        return []

    try:
        from googleapiclient.discovery import build
    except ImportError:
        print('Run: pip install google-api-python-client')
        return []

    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    since = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%dT%H:%M:%SZ')
    found = []

    for ch in CA_CHANNELS:
        try:
            resp = youtube.search().list(
                part='snippet',
                channelId=ch['channel_id'],
                type='video',
                publishedAfter=since,
                maxResults=5,
                order='date'
            ).execute()

            for item in resp.get('items', []):
                vid_id = item['id'].get('videoId')
                if not vid_id or vid_id in seen['videos']:
                    continue

                title = item['snippet']['title']
                desc  = item['snippet']['description']

                if is_relevant(title + ' ' + desc, ch['keywords']):
                    found.append({
                        'source':     ch['name'],
                        'type':       'youtube',
                        'id':         vid_id,
                        'title':      title,
                        'url':        f'https://youtube.com/watch?v={vid_id}',
                        'published':  item['snippet']['publishedAt'][:10],
                    })
                    seen['videos'].append(vid_id)

        except Exception as e:
            print(f'  Channel error ({ch["name"]}): {e}')

    return found


# ─────────────────────────────────────────────
# GOVERNMENT WEBSITE MONITORING
# ─────────────────────────────────────────────
def check_govt_feeds(seen):
    found = []

    for feed_cfg in GOVT_FEEDS:
        try:
            if feed_cfg['type'] == 'rss':
                items = _parse_rss(feed_cfg)
            else:
                items = _scrape_page(feed_cfg)

            for item in items:
                item_id = feed_cfg['name'] + '|' + item['title'][:80]
                if item_id in seen['govt_items']:
                    continue

                if is_relevant(item['title'] + ' ' + item.get('summary', ''), feed_cfg['keywords']):
                    found.append({
                        'source':   feed_cfg['name'],
                        'type':     'govt',
                        'id':       item_id,
                        'title':    item['title'],
                        'url':      item.get('url', ''),
                        'summary':  item.get('summary', ''),
                        'published': item.get('published', TODAY),
                    })
                    seen['govt_items'].append(item_id)

        except Exception as e:
            print(f'  Feed error ({feed_cfg["name"]}): {e}')

    return found


def _parse_rss(feed_cfg):
    feed = feedparser.parse(feed_cfg['url'])
    items = []
    for entry in feed.entries[:10]:
        items.append({
            'title':     entry.get('title', ''),
            'summary':   entry.get('summary', ''),
            'url':       entry.get('link', ''),
            'published': entry.get('published', TODAY)[:10] if entry.get('published') else TODAY,
        })
    return items


def _scrape_page(feed_cfg):
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; SynergyBot/1.0; +https://synergyfuturecorp.com)'}
    resp = requests.get(feed_cfg['url'], headers=headers, timeout=10)
    soup = BeautifulSoup(resp.text, 'html.parser')
    items = []
    for el in soup.select(feed_cfg.get('selector', '.news-item'))[:10]:
        title = el.get_text(strip=True)[:200]
        href  = el.find('a')
        url   = href['href'] if href and href.get('href') else ''
        if title:
            items.append({'title': title, 'url': url})
    return items


# ─────────────────────────────────────────────
# GEMINI HELPER
# ─────────────────────────────────────────────
def _call_gemini(prompt, max_tokens=1200, temperature=0.7):
    """Call Gemini with retry on 429/503. Returns text or None."""
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print('Run: pip install google-genai')
        return None

    if not GEMINI_API_KEY:
        print('GEMINI_API_KEY not set')
        return None

    client = genai.Client(api_key=GEMINI_API_KEY)
    for attempt in range(3):
        try:
            resp = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                ),
            )
            return resp.text.strip()
        except Exception as e:
            err = str(e)
            if ('429' in err or '503' in err) and attempt < 2:
                wait = 30 + attempt * 30
                print(f'  Gemini error ({err[:60]}) — retrying in {wait}s ({attempt+1}/3)...')
                time.sleep(wait)
            else:
                print(f'  Gemini error: {err}')
                return None
    return None


# ─────────────────────────────────────────────
# ARTICLE GENERATION FOR NEWS ITEMS
# ─────────────────────────────────────────────
def generate_news_article(item):
    source_type = 'YouTube CA channel' if item['type'] == 'youtube' else 'Indian government website'
    summary_text = item.get('summary', '')

    prompt = f"""You are writing an SEO blog post for synergyfuturecorp.com about Synergy Automation.
Today is {TODAY}. Tally version in use: {TALLY_VERSION}.

{BRAND_RULES}

SOURCE: {item['source']} ({source_type})
HEADLINE: {item['title']}
ORIGINAL URL: {item['url']}
CONTEXT: {summary_text[:1000] if summary_text else '(no summary available — write based on the headline)'}

TASK: Write a PRACTICAL blog article explaining what this update/news means for Indian CAs,
accountants, and small business owners who use Tally for accounting.

WRITING PHILOSOPHY (non-negotiable):
- Deliver true value first — this is not an advertisement
- Write for a busy CA with 5 minutes, not for a search engine bot
- Less information, more insight — one sharp point beats five vague ones
- Plain English: explain acronyms on first use, avoid bureaucratic language
- One paragraph = one idea. Max 3 sentences per paragraph.
- DO NOT mention Synergy Automation in every section — mention it ONCE naturally at the end
- The reader's time is the most valuable thing on this page — do not waste it

WRITING RULES:
- Open with the real-world consequence (money, penalty, deadline) — not background history
- Name the exact menu path in {TALLY_VERSION} when giving Tally instructions
- Lead with what CHANGED and WHY it matters right now
- Every section must give the reader something actionable
- Include a strong FAQ block with questions real CAs actually search for
- NEVER duplicate an article topic — unique angle only

OUTPUT FORMAT:
Return ONLY a valid JavaScript object (no markdown, no export keyword — raw object only).
Use single quotes for all strings. Published date: {TODAY}

Schema:
{{
  slug: 'url-slug-here',
  title: 'Headline 55-60 chars ({TODAY[:4]})',
  tag: 'News',
  published: '{TODAY}',
  updated: '{TODAY}',
  description: '140-160 char meta description. Complete sentence.',
  keywords: 'keyword1, keyword2, keyword3',
  content: [
    {{ type: 'intro', text: '3-4 sentences. What happened, who it affects, what they should do right now.' }},
    {{ type: 'h2', text: 'What Changed' }},
    {{ type: 'p', text: '...' }},
    {{ type: 'h2', text: 'What This Means for Tally Users' }},
    {{ type: 'p', text: '...' }},
    {{ type: 'h2', text: 'Action Steps for CAs and Accountants' }},
    {{ type: 'list', items: ['Step 1', 'Step 2', 'Step 3'] }},
    {{ type: 'h2', text: 'How Synergy Automation Helps' }},
    {{ type: 'p', text: '...' }},
    {{
      type: 'faq',
      items: [
        {{ q: 'Specific question CAs ask about this update?', a: 'Self-contained answer.' }},
        {{ q: 'Another specific question?', a: 'Self-contained answer.' }},
        {{ q: 'Question about Synergy Automation and this topic?', a: 'Self-contained answer.' }}
      ]
    }}
  ]
}}
"""

    return _call_gemini(prompt, max_tokens=1800, temperature=0.7)


# ─────────────────────────────────────────────
# MAIN FLOW
# ─────────────────────────────────────────────
def run_monitor(mode='all'):
    seen = load_seen()
    all_found = []

    if mode in ('all', 'channels-only'):
        print('Checking CA YouTube channels...')
        ch_items = check_ca_channels(seen)
        print(f'  {len(ch_items)} new relevant video(s)')
        all_found.extend(ch_items)

    if mode in ('all', 'govt-only'):
        print('Checking government websites...')
        govt_items = check_govt_feeds(seen)
        print(f'  {len(govt_items)} new relevant update(s)')
        all_found.extend(govt_items)

    save_seen(seen)

    if not all_found:
        print('\nNothing new today. Run again tomorrow.')
        return

    print(f'\n=== {len(all_found)} NEW ITEM(S) FOUND ===')
    for i, item in enumerate(all_found, 1):
        print(f'\n[{i}/{len(all_found)}] {item["source"]} — {item["title"][:80]}')
        print(f'      URL: {item["url"]}')

        print('  Generating article...')
        article_js = generate_news_article(item)

        if not article_js:
            print('  Skipping (generation failed).')
            continue

        # Quick preview
        slug_m  = re.search(r"slug:\s*'([^']+)'",  article_js)
        title_m = re.search(r"title:\s*'([^']+)'", article_js)
        print(f'  → /blog/{slug_m.group(1) if slug_m else "?"}')
        print(f'  → {title_m.group(1) if title_m else "?"}')

        choice = input('  Publish? (y/n/s for save-draft): ').strip().lower()

        if choice == 'y':
            # Import and call publish from the main pipeline
            sys.path.insert(0, str(Path(__file__).parent))
            from seo_youtube_pipeline import publish_article
            publish_article(article_js)

        elif choice == 's':
            from seo_youtube_pipeline import save_draft, DRAFTS_DIR
            topic = re.sub(r'[^a-z0-9]+', '-', item['title'].lower())[:50]
            save_draft(topic, article_js)

        else:
            print('  Skipped.')


# ─────────────────────────────────────────────
# AUTO MODE — write summaries to updatesData.js
# (used by GitHub Actions, no interactive prompts)
# ─────────────────────────────────────────────
def _js_quote(s):
    """Escape a string value for single-quoted JavaScript."""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('\r', '')


def generate_news_summary(item):
    """Ask Gemini for a short JSON summary suitable for updatesData.js."""
    source_type = 'Indian CA YouTube channel' if item['type'] == 'youtube' else 'Indian government website'
    context = item.get('summary', '')[:600]

    prompt = f"""You are summarising a government update for Indian CAs and accountants who use Tally.
Today is {TODAY}. Tally version: {TALLY_VERSION}.

SOURCE: {item['source']} ({source_type})
HEADLINE: {item['title']}
CONTEXT: {context if context else '(headline only — write based on the headline)'}

WRITING RULES (strict):
- Plain English only — write as if explaining to a small business owner, not a CA exam student
- No jargon without explanation. If you must use "GSTR-3B", immediately say what it is in brackets
- Be direct: "You need to do X by Y date" beats "It is advised that taxpayers consider..."
- DO NOT promote any product — this is a news summary, not an ad
- DO NOT say "we" or mention Synergy Automation in summary/keyPoints
- tallyImpact: name the EXACT menu path in TallyPrime (e.g. Gateway → Statutory Reports → GSTR-3B)
- No duplication of information across fields

Return ONLY a valid JSON object (no markdown, no extra text):
{{
  "title": "Improved plain-English headline — max 100 chars. Who it affects + what changed.",
  "summary": "3-4 sentences in simple English. What happened? Why should I care? What do I need to do? Write for someone who has 30 seconds.",
  "keyPoints": [
    {{"label": "Who is affected", "text": "Specific businesses or taxpayers this applies to — be concrete"}},
    {{"label": "What changed", "text": "One clear sentence on the actual change or new rule"}},
    {{"label": "What to do now", "text": "The single most important action with a deadline if any"}}
  ],
  "tallyImpact": "Exact step-by-step action in {TALLY_VERSION}: name the menu path and what entry/report to check."
}}
"""

    raw = _call_gemini(prompt, max_tokens=600, temperature=0.3)
    if not raw:
        return None
    try:
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        return json.loads(raw)
    except Exception as e:
        print(f'  Summary JSON parse error: {e}')
        return None


def append_to_updates_file(item, summary):
    """Append one entry to updatesData.js before the closing ];"""
    if not UPDATES_DATA_FILE.exists():
        print(f'  ERROR: {UPDATES_DATA_FILE} not found')
        return False

    content = UPDATES_DATA_FILE.read_text(encoding='utf-8')
    insert_pos = content.rfind('];')
    if insert_pos == -1:
        print('  ERROR: updatesData.js format unexpected — cannot find ];')
        return False

    # Build a unique id
    safe_src = re.sub(r'[^a-z0-9]+', '-', item['source'].lower())[:18].strip('-')
    safe_date = item.get('published', TODAY)
    safe_title = re.sub(r'[^a-z0-9]+', '-', summary['title'].lower())[:28].strip('-')
    entry_id = f"{safe_src}-{safe_date[:10]}-{safe_title}"

    # Dedup — never insert if this id already exists in the file
    if f"id: '{entry_id}'" in content:
        print(f'  Already exists — skipping duplicate: {entry_id}')
        return False

    # Build keyPoints array JS string
    kp_list = summary.get('keyPoints', [])
    kp_lines = []
    for kp in kp_list:
        kp_lines.append(f"      {{ label: '{_js_quote(kp.get('label',''))}', text: '{_js_quote(kp.get('text',''))}' }},")
    kp_js = '\n'.join(kp_lines)

    entry = f"""  {{
    id: '{entry_id}',
    type: 'govt',
    title: '{_js_quote(summary['title'])}',
    source: '{_js_quote(item['source'])}',
    date: '{safe_date[:10]}',
    summary: '{_js_quote(summary['summary'])}',
    keyPoints: [
{kp_js}
    ],
    tallyImpact: '{_js_quote(summary.get('tallyImpact',''))}',
    url: '{_js_quote(item.get('url', ''))}',
    relatedSlug: '',
  }},
"""

    new_content = content[:insert_pos] + entry + content[insert_pos:]
    UPDATES_DATA_FILE.write_text(new_content, encoding='utf-8')
    return True


def run_monitor_auto(mode='all', days_back=3):
    """Non-interactive: find new items, generate summaries, write to updatesData.js."""
    seen = load_seen()
    all_found = []

    if mode in ('all', 'channels-only'):
        print(f'Checking CA YouTube channels (last {days_back} days)...')
        ch_items = check_ca_channels(seen, days_back=days_back)
        print(f'  {len(ch_items)} new relevant video(s)')
        all_found.extend(ch_items)

    if mode in ('all', 'govt-only'):
        print('Checking government websites...')
        govt_items = check_govt_feeds(seen)
        print(f'  {len(govt_items)} new relevant update(s)')
        all_found.extend(govt_items)

    save_seen(seen)

    if not all_found:
        print('Nothing new today.')
        LAST_COUNT_FILE.write_text('0', encoding='utf-8')
        return

    print(f'\n=== {len(all_found)} NEW ITEM(S) — generating summaries ===')
    added = 0
    for item in all_found:
        print(f'\n  [{item["source"]}] {item["title"][:80]}')
        summary = generate_news_summary(item)
        if not summary:
            print('  Summary failed — skipping.')
            continue
        ok = append_to_updates_file(item, summary)
        if ok:
            print(f'  ✓ Added: {summary["title"][:70]}')
            added += 1
        else:
            print('  ERROR writing to updatesData.js')

    LAST_COUNT_FILE.write_text(str(added), encoding='utf-8')
    print(f'\n✅ {added} update(s) written to updatesData.js')


def main():
    args = sys.argv[1:]
    auto = '--auto' in args
    args = [a for a in args if a != '--auto']

    # Parse --days N (default 3)
    days_back = 3
    for i, a in enumerate(args):
        if a == '--days' and i + 1 < len(args):
            try:
                days_back = int(args[i + 1])
            except ValueError:
                pass
    args = [a for a in args if not a.startswith('--days') and a not in [str(days_back)]]

    if auto:
        if '--govt-only' in args:
            run_monitor_auto('govt-only', days_back=days_back)
        elif '--channels-only' in args:
            run_monitor_auto('channels-only', days_back=days_back)
        else:
            run_monitor_auto('all', days_back=days_back)
    else:
        if '--govt-only' in args:
            run_monitor('govt-only')
        elif '--channels-only' in args:
            run_monitor('channels-only')
        else:
            run_monitor('all')


if __name__ == '__main__':
    main()


# ─────────────────────────────────────────────
# WINDOWS TASK SCHEDULER SETUP
# ─────────────────────────────────────────────
# Run once to schedule daily monitoring at 8 AM:
#
#   schtasks /create /tn "Synergy SEO Monitor" /tr "python C:\Synergy\ft01-react-dashboard\scripts\seo_news_monitor.py" /sc daily /st 08:00 /f
#
# Or for weekly:
#   schtasks /create /tn "Synergy SEO Monitor" /tr "python C:\Synergy\ft01-react-dashboard\scripts\seo_news_monitor.py" /sc weekly /d MON,WED,FRI /st 09:00 /f
#
# Check it:
#   schtasks /query /tn "Synergy SEO Monitor"
#
# Run manually right now:
#   schtasks /run /tn "Synergy SEO Monitor"
#
# IMPORTANT: YOUTUBE_API_KEY and GEMINI_API_KEY must be set as SYSTEM environment
# variables for Task Scheduler to pick them up:
#   [System Properties → Advanced → Environment Variables → System Variables]
#   Add YOUTUBE_API_KEY = your_key
#   Add GEMINI_API_KEY  = your_key
