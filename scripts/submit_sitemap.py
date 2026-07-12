#!/usr/bin/env python3
"""
submit_sitemap.py — Submit sitemap to Google Search Console via API.

Uses a Service Account (no browser OAuth needed) so this can run headlessly
from Task Scheduler, GitHub Actions, or the Telegram poller after every deploy.

SETUP (one-time):
  1. Google Cloud Console → Enable "Google Search Console API"
  2. Create Service Account → download JSON key
  3. Search Console → Settings → Users → Add service account email as Owner
  4. Set GOOGLE_SERVICE_ACCOUNT_JSON in .env (paste full JSON contents)

USAGE:
  python scripts/submit_sitemap.py
  python scripts/submit_sitemap.py --site https://synergyfuturecorp.com/
"""

import os
import sys
import json
from pathlib import Path

# Load .env
_env_file = Path(__file__).parent.parent / '.env'
if _env_file.exists():
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _, _v = _line.partition('=')
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

SITE_URL    = 'https://synergyfuturecorp.com/'
SITEMAP_URL = 'https://synergyfuturecorp.com/sitemap.xml'
SCOPES      = ['https://www.googleapis.com/auth/webmasters']


def get_credentials():
    raw = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON', '')
    if not raw:
        print('ERROR: GOOGLE_SERVICE_ACCOUNT_JSON not set in .env')
        print('  Add the full service account JSON as a single env var.')
        return None
    try:
        info = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f'ERROR: GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON: {e}')
        return None

    try:
        from google.oauth2 import service_account
        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    except ImportError:
        print('ERROR: Run: pip install google-auth google-api-python-client')
        return None


def submit_sitemap(site_url=SITE_URL, sitemap_url=SITEMAP_URL):
    creds = get_credentials()
    if not creds:
        return False

    try:
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
    except ImportError:
        print('ERROR: Run: pip install google-api-python-client')
        return False

    service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

    try:
        service.sitemaps().submit(
            siteUrl=site_url,
            feedpath=sitemap_url,
        ).execute()
        print(f'Sitemap submitted: {sitemap_url}')
        print(f'  Site: {site_url}')
        print(f'  Google will re-read the sitemap within a few hours.')
        return True

    except HttpError as e:
        if e.resp.status == 403:
            print(f'ERROR 403: Service account not authorised for {site_url}')
            print('  → In Search Console → Settings → Users → check service account has Owner access')
        elif e.resp.status == 404:
            print(f'ERROR 404: Site {site_url} not found in Search Console')
            print('  → Verify the exact URL in Search Console (with or without trailing slash)')
        else:
            print(f'ERROR {e.resp.status}: {e}')
        return False

    except Exception as e:
        print(f'ERROR: {e}')
        return False


if __name__ == '__main__':
    args = sys.argv[1:]
    site = next((args[i + 1] for i, a in enumerate(args) if a == '--site' and i + 1 < len(args)), SITE_URL)
    ok = submit_sitemap(site_url=site)
    sys.exit(0 if ok else 1)
