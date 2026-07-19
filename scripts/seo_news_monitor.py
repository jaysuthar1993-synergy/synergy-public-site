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
REPO_ROOT              = Path(__file__).parent.parent
SEEN_FILE              = Path(__file__).parent / 'seo_news_seen.json'
UPDATES_DATA_FILE      = REPO_ROOT / 'src' / 'data' / 'updatesData.js'
UPDATES_PENDING_FILE   = Path(__file__).parent / 'seo_updates_pending.json'
LAST_COUNT_FILE        = REPO_ROOT / '.seo_news_last_count'
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
    # Official sources — accept ALL items (empty keywords = no filter)
    {
        'name':     'CBDT (Income Tax)',
        'url':      'https://www.incometax.gov.in/iec/foportal/rss/whatsnew',
        'type':     'rss',
        'keywords': [],
    },
    {
        'name':     'CBIC GST',
        'url':      'https://www.cbic.gov.in/htdocs-cbec/gst/gst-updates.rss',
        'type':     'rss',
        'keywords': [],
    },
    {
        'name':     'GST Portal News',
        'url':      'https://www.gst.gov.in/newsandupdates',
        'type':     'scrape',
        'keywords': [],
        'selector': '.news-item, .update-item, .list-item',
    },
    {
        'name':     'MCA (Company Affairs)',
        'url':      'https://www.mca.gov.in/MinistryV2/rss.html',
        'type':     'rss',
        'keywords': [],
    },
    {
        'name':     'RBI Press Releases',
        'url':      'https://www.rbi.org.in/Scripts/RSS.aspx?Id=316',
        'type':     'rss',
        'keywords': [],
    },
    {
        'name':     'PIB Finance Ministry',
        'url':      'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
        'type':     'rss',
        'keywords': [],
    },
    # ── Twitter/X via Nitter RSS (free, no API key) ──
    # Light keyword filter for social — exclude pure promotional/event tweets
    {
        'name':     'CBIC India (Twitter)',
        'url':      'https://nitter.net/CBIC_India/rss',
        'type':     'rss',
        'keywords': ['gst', 'circular', 'notification', 'gstr', 'itc', 'e-invoice',
                     'return', 'filing', 'deadline', 'extension', 'tax', 'rate'],
    },
    {
        'name':     'Income Tax India (Twitter)',
        'url':      'https://nitter.net/IncomeTaxIndia/rss',
        'type':     'rss',
        'keywords': ['tax', 'tds', 'tcs', 'return', 'circular', 'refund',
                     'itr', 'filing', 'deadline', 'notice', 'compliance', 'audit'],
    },
    {
        'name':     'ICAI (Twitter)',
        'url':      'https://nitter.net/theicai/rss',
        'type':     'rss',
        'keywords': ['circular', 'notification', 'audit', 'compliance', 'tax', 'gst', 'accounting', 'guidelines'],
    },
    {
        'name':     'MCA India (Twitter)',
        'url':      'https://nitter.net/MCA21India/rss',
        'type':     'rss',
        'keywords': ['audit', 'compliance', 'circular', 'company', 'form', 'filing', 'deadline'],
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
    if not keywords:
        return True
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
    for entry in feed.entries[:25]:
        # Use feedparser's parsed time tuple (always available if feed has a date)
        pub_date = TODAY
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            try:
                import time as _time
                pub_date = _time.strftime('%Y-%m-%d', entry.published_parsed)
            except Exception:
                pass
        elif entry.get('published', '')[:4].isdigit():
            # Already ISO-like (YYYY-...)
            pub_date = entry['published'][:10]

        items.append({
            'title':     entry.get('title', ''),
            'summary':   entry.get('summary', ''),
            'url':       entry.get('link', ''),
            'published': pub_date,
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


def is_actionable_update(item):
    """Ask Gemini: is this a real regulatory/compliance update for Indian CAs?
    Returns True if yes, False if it's ceremonial/sports/general news."""
    title = item.get('title', '')
    context = item.get('summary', '')[:300]
    prompt = f"""You are filtering news for Indian Chartered Accountants and accountants.

HEADLINE: {title}
CONTEXT: {context if context else '(headline only)'}

Is this a REAL regulatory, compliance, or tax update that is actionable or informative for Indian CAs, accountants, or business owners?

REAL UPDATES include: GST circulars, income tax deadlines, new ITR forms, TDS changes, MCA compliance notices, penalty announcements, new tax rules, audit guidelines, filing deadlines, utility releases, scheme extensions.

NOT REAL UPDATES include: government awards ceremonies, sports achievements, book exhibitions, office renovations, PM foreign visits, diaspora events, student awareness programs, zone celebration events, motivational messages, PR tweets.

Reply with ONLY a single JSON object: {{"real": true}} or {{"real": false}}"""

    raw = _call_gemini(prompt, max_tokens=20, temperature=0.0)
    if not raw:
        return True  # if Gemini fails, default to processing the item
    try:
        raw = re.sub(r'^```(?:json)?\s*', '', raw.strip())
        raw = re.sub(r'\s*```$', '', raw)
        return json.loads(raw).get('real', True)
    except Exception:
        return True  # default to True on parse failure


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
    // 2 to 4 items — only include what genuinely matters for THIS specific update.
    // Each label should be unique and specific to the content (e.g. "Deadline", "Penalty", "Who qualifies", "The new rule").
    // Do NOT always use the same 3 labels. Let the content decide.
    {{"label": "Short label (2-4 words)", "text": "One clear sentence — concrete, no filler"}}
  ],
  "tallyImpact": "Exact step-by-step action in {TALLY_VERSION}: name the menu path and what entry/report to check. If this update has NO direct action required in Tally, return empty string \"\"."
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


def _build_entry(item, summary):
    """Build the JS entry string and entry_id for a govt update. Returns (entry_id, js_string) or (None, None)."""
    safe_src   = re.sub(r'[^a-z0-9]+', '-', item['source'].lower())[:18].strip('-')
    safe_date  = item.get('published', TODAY)
    safe_title = re.sub(r'[^a-z0-9]+', '-', summary['title'].lower())[:28].strip('-')
    entry_id   = f"{safe_src}-{safe_date[:10]}-{safe_title}"

    kp_list  = summary.get('keyPoints', [])
    kp_lines = [f"      {{ label: '{_js_quote(kp.get('label',''))}', text: '{_js_quote(kp.get('text',''))}' }},"
                for kp in kp_list]
    kp_js = '\n'.join(kp_lines)

    js = f"""  {{
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
    return entry_id, js


def append_to_updates_file(item, summary):
    """Append one entry to updatesData.js before the closing ]; Returns entry_id or None."""
    if not UPDATES_DATA_FILE.exists():
        print(f'  ERROR: {UPDATES_DATA_FILE} not found')
        return None

    content = UPDATES_DATA_FILE.read_text(encoding='utf-8')
    insert_pos = content.rfind('];')
    if insert_pos == -1:
        print('  ERROR: updatesData.js format unexpected — cannot find ];')
        return None

    entry_id, js_entry = _build_entry(item, summary)

    # Dedup by ID
    if f"id: '{entry_id}'" in content:
        print(f'  Already exists — skipping duplicate: {entry_id}')
        return None

    # Dedup by title (catches manual entries with different ID format)
    title_slug = re.sub(r'[^a-z0-9]+', '-', summary['title'].lower())[:40].strip('-')
    if title_slug and title_slug in content.lower():
        print(f'  Title already present — skipping duplicate: {summary["title"][:60]}')
        return None

    new_content = content[:insert_pos] + js_entry + content[insert_pos:]
    UPDATES_DATA_FILE.write_text(new_content, encoding='utf-8')
    return entry_id


def save_to_pending_updates(entry_id, js_entry, item, summary):
    """Save a generated update to the pending store (not yet written to updatesData.js)."""
    pending = {}
    if UPDATES_PENDING_FILE.exists():
        try:
            pending = json.loads(UPDATES_PENDING_FILE.read_text(encoding='utf-8'))
        except Exception:
            pending = {}
    pending[entry_id] = {
        'entry_id':  entry_id,
        'js_entry':  js_entry,
        'title':     summary['title'],
        'summary':   summary['summary'],
        'source':    item['source'],
        'date':      item.get('published', TODAY),
    }
    UPDATES_PENDING_FILE.write_text(json.dumps(pending, indent=2, ensure_ascii=False), encoding='utf-8')


def write_pending_update_to_file(entry_id):
    """Called by poller on Approve — inserts the pending entry into updatesData.js."""
    if not UPDATES_PENDING_FILE.exists():
        return False, 'Pending file not found'

    pending = {}
    try:
        pending = json.loads(UPDATES_PENDING_FILE.read_text(encoding='utf-8'))
    except Exception as e:
        return False, f'Pending JSON error: {e}'

    if entry_id not in pending:
        return False, f'Entry {entry_id} not in pending store'

    record   = pending[entry_id]
    js_entry = record['js_entry']

    if not UPDATES_DATA_FILE.exists():
        return False, 'updatesData.js not found'

    content    = UPDATES_DATA_FILE.read_text(encoding='utf-8')
    insert_pos = content.rfind('];')
    if insert_pos == -1:
        return False, 'updatesData.js has unexpected format'

    # Dedup check
    if f"id: '{entry_id}'" in content:
        del pending[entry_id]
        UPDATES_PENDING_FILE.write_text(json.dumps(pending, indent=2, ensure_ascii=False), encoding='utf-8')
        return False, 'Already in file (duplicate)'

    new_content = content[:insert_pos] + js_entry + content[insert_pos:]
    UPDATES_DATA_FILE.write_text(new_content, encoding='utf-8')

    del pending[entry_id]
    UPDATES_PENDING_FILE.write_text(json.dumps(pending, indent=2, ensure_ascii=False), encoding='utf-8')
    return True, record['title']


def _existing_update_titles():
    """Titles of updates already PUBLISHED (updatesData.js) or already QUEUED
    (pending store) — so we don't queue a second copy of the same news in one run."""
    titles = []
    if UPDATES_DATA_FILE.exists():
        c = UPDATES_DATA_FILE.read_text(encoding='utf-8')
        titles += re.findall(r"title:\s*'([^']+)'", c)
    if UPDATES_PENDING_FILE.exists():
        try:
            p = json.loads(UPDATES_PENDING_FILE.read_text(encoding='utf-8'))
            titles += [v.get('title', '') for v in p.values()]
        except Exception:
            pass
    return [t for t in titles if t]


def is_duplicate_update(title, summary):
    """
    Semantic dedup: does this update convey the SAME news as one already published
    or queued? The exact ID/title-slug check can't catch this — e.g. "Income Tax
    Filing: Check AIS & Form 26AS" vs "Check AIS & Form 26AS for AY 2026-27" are
    the same circular with different wording. Ask Gemini. Returns (is_dup, reason).
    """
    existing = _existing_update_titles()
    if not existing:
        return False, ''
    listing = '\n'.join(f'- {t}' for t in existing[-40:])  # recent 40 is plenty
    prompt = (
        f'Updates already published or queued:\n{listing}\n\n'
        f'NEW update:\n  Title: {title}\n  Summary: {summary[:300]}\n\n'
        'Does the NEW update convey substantially the SAME information as any one '
        'listed above — the same circular, deadline, utility, or guidance — such that '
        'a reader would find it redundant?\n'
        'Reply with exactly one line: DUPLICATE or UNIQUE, then a colon and a short reason.'
    )
    result = _call_gemini(prompt, max_tokens=60, temperature=0.0)
    if not result:
        return False, 'dedup check unavailable'
    line = result.strip().splitlines()[0]
    is_dup = line.upper().startswith('DUPLICATE')
    reason = line.split(':', 1)[-1].strip() if ':' in line else line
    return is_dup, reason


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

    print(f'\n=== {len(all_found)} NEW ITEM(S) — filtering with Gemini ===')
    queued = 0
    for item in all_found:
        print(f'\n  [{item["source"]}] {item["title"][:80]}')

        # Gemini relevance gate — skip ceremonies, sports, general news
        if not is_actionable_update(item):
            print('  Not a real update (Gemini verdict) — skipped.')
            continue

        summary = generate_news_summary(item)
        if not summary:
            print('  Summary failed — skipping.')
            continue

        entry_id, js_entry = _build_entry(item, summary)

        # Skip if already in updatesData.js
        if UPDATES_DATA_FILE.exists():
            content = UPDATES_DATA_FILE.read_text(encoding='utf-8')
            if f"id: '{entry_id}'" in content:
                print(f'  Already in file — skipping duplicate.')
                continue
            title_slug = re.sub(r'[^a-z0-9]+', '-', summary['title'].lower())[:40].strip('-')
            if title_slug and title_slug in content.lower():
                print(f'  Title already present — skipping duplicate.')
                continue

        # Semantic dedup — catches the SAME news worded differently, which the
        # exact-match checks above miss. Prevents queuing near-identical updates
        # (e.g. two "Check AIS & Form 26AS" items) that waste review time.
        is_dup, dup_reason = is_duplicate_update(summary['title'], summary['summary'])
        if is_dup:
            print(f'  Duplicate of an existing/queued update — skipped: {dup_reason}')
            continue

        # Save to pending store (not written to JS file yet)
        save_to_pending_updates(entry_id, js_entry, item, summary)

        # Send individual Telegram approval message
        try:
            from seo_telegram import send_single_update_approval
            send_single_update_approval(entry_id, summary['title'], summary['summary'])
            queued += 1
        except Exception as e:
            print(f'  Telegram send failed: {e}')

    LAST_COUNT_FILE.write_text(str(queued), encoding='utf-8')
    if queued:
        print(f'\n✅ {queued} update(s) queued — Telegram approval sent for each.')
    else:
        print('\nNothing new to queue.')


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
