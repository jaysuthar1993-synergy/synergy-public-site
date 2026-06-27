#!/usr/bin/env python3
"""
SEO Pipeline Setup — run once to configure everything
Usage: python scripts/seo_setup.py
"""
import subprocess
import sys
import os
from pathlib import Path

REQUIRED_PACKAGES = [
    'google-api-python-client',
    'youtube-transcript-api',
    'google-generativeai',   # Gemini Flash (FREE default)
    'feedparser',
    'requests',
    'beautifulsoup4',
    # Optional paid alternatives (uncomment if needed):
    # 'openai',      # GPT-4o-mini ~₹0.20/article
    # 'anthropic',   # Claude claude-sonnet-4-6 ~₹4.50/article
]

def main():
    print('=== Synergy SEO Pipeline Setup ===\n')

    # 1. Install packages
    print('1. Installing Python packages...')
    subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + REQUIRED_PACKAGES)
    print('   ✓ All packages installed\n')

    # 2. Check env vars
    print('2. Checking environment variables...')
    yt_key = os.environ.get('YOUTUBE_API_KEY')
    ai_key = os.environ.get('ANTHROPIC_API_KEY')

    gemini_key = os.environ.get('GEMINI_API_KEY')

    if yt_key:
        print(f'   ✓ YOUTUBE_API_KEY set (ends with ...{yt_key[-6:]})')
    else:
        print('   ✗ YOUTUBE_API_KEY missing')
        print('     → Get free key: console.cloud.google.com')
        print('     → Enable YouTube Data API v3 → Create API key')
        print('     → Set: setx YOUTUBE_API_KEY "YOUR_KEY" /M  (run as admin)\n')

    if gemini_key:
        print(f'   ✓ GEMINI_API_KEY set (ends with ...{gemini_key[-6:]})')
    else:
        print('   ✗ GEMINI_API_KEY missing  ← REQUIRED (FREE)')
        print('     → Get free key: aistudio.google.com → "Get API key"')
        print('     → No credit card needed, 1,500 articles/day free')
        print('     → Set: setx GEMINI_API_KEY "YOUR_KEY" /M  (run as admin)\n')

    if ai_key:
        print(f'   ✓ ANTHROPIC_API_KEY set (optional, ~₹4.50/article)')
    else:
        print('   - ANTHROPIC_API_KEY not set (optional — Gemini is free and good enough)')

    # 3. Create drafts dir
    drafts = Path(__file__).parent / 'seo_drafts'
    drafts.mkdir(exist_ok=True)
    print(f'3. ✓ Drafts directory: {drafts}\n')

    # 4. Quick usage guide
    print('=== USAGE ===')
    print()
    print('Generate article from a topic:')
    print('  python scripts/seo_youtube_pipeline.py "bank reconciliation tally"')
    print()
    print('Process next topic from queue:')
    print('  python scripts/seo_youtube_pipeline.py --queue')
    print()
    print('Monitor CA channels + govt sites for news:')
    print('  python scripts/seo_news_monitor.py')
    print()
    print('Publish a saved draft:')
    print('  python scripts/seo_youtube_pipeline.py --publish scripts/seo_drafts/draft-xyz.js')
    print()
    print('Schedule daily monitor (run as admin):')
    print('  schtasks /create /tn "Synergy SEO Monitor" /tr "python C:\\Synergy\\ft01-react-dashboard\\scripts\\seo_news_monitor.py" /sc daily /st 08:00 /f')

if __name__ == '__main__':
    main()
