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
  pip install google-api-python-client youtube-transcript-api google-generativeai feedparser requests beautifulsoup4

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
from datetime import date, datetime, timedelta
from pathlib import Path

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
REPO_ROOT        = Path(__file__).parent.parent
SEEN_FILE        = Path(__file__).parent / 'seo_news_seen.json'
GEMINI_API_KEY    = os.environ.get('GEMINI_API_KEY')
YOUTUBE_API_KEY   = os.environ.get('YOUTUBE_API_KEY')
TODAY             = date.today().isoformat()
SITE_URL          = 'https://synergyfuturecorp.com'

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
        'name':       'TallyERP',
        'channel_id': 'UCMqVGK9GlUH8sTLf7hq2sFg',
        'keywords':   ['bank statement', 'reconciliation', 'import', 'excel', 'voucher'],
    },
    {
        'name':       'ClearTax India',
        'channel_id': 'UCt5bXjFOK-LFkAcCr-WoJlw',
        'keywords':   ['gst', 'income tax', 'tds', 'bank', 'reconciliation'],
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
# ARTICLE GENERATION FOR NEWS ITEMS
# ─────────────────────────────────────────────
def generate_news_article(item):
    try:
        import google.generativeai as genai
    except ImportError:
        print('Run: pip install google-generativeai')
        return None

    if not GEMINI_API_KEY:
        print('GEMINI_API_KEY not set')
        return None

    source_type = 'YouTube CA channel' if item['type'] == 'youtube' else 'Indian government website'
    summary_text = item.get('summary', '')

    prompt = f"""You are writing an SEO blog post for synergyfuturecorp.com about Synergy Automation.

{BRAND_RULES}

SOURCE: {item['source']} ({source_type})
HEADLINE: {item['title']}
ORIGINAL URL: {item['url']}
CONTEXT: {summary_text[:1000] if summary_text else '(no summary available — write based on the headline)'}

TASK: Write a PRACTICAL blog article explaining what this update/news means for Indian CAs,
accountants, and small business owners who use Tally for accounting.

- Lead with what CHANGED and WHY it matters
- Explain the practical impact on Tally users specifically
- If relevant, explain how Synergy Automation helps with the bank entry / reconciliation side
- End with clear action items for the reader
- Include a strong FAQ block with real questions CAs would ask about this update

OUTPUT FORMAT:
Return ONLY a valid JavaScript object (no markdown, no export keyword — raw object only).
Use single quotes for all strings. Use today's date: {TODAY}

Schema:
{{
  slug: 'url-slug-here',
  title: 'Headline 55-60 chars (2026)',
  tag: 'News',
  published: '{TODAY}',
  updated: '{TODAY}',
  description: '140-160 char meta description. Complete sentence.',
  keywords: 'keyword1, keyword2, keyword3',
  content: [
    {{ type: 'intro', text: '3-4 sentences. What happened, who it affects, what they should do.' }},
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

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text.strip()


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


def main():
    args = sys.argv[1:]
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
