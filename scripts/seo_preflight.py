#!/usr/bin/env python3
"""
seo_preflight.py — SEO guardrails. Runs against the BUILT output, before deploy.

WHY THIS EXISTS
---------------
Every check below corresponds to a real bug that shipped to production and sat
there unnoticed. None of them were caught by `npm run build` — the build was
green every single time. They were only found by a manual audit, weeks later.

The point of this file is that they can never silently come back.

Run:
    npm run build
    python scripts/seo_preflight.py

Exit code 0 = safe to deploy. Non-zero = do NOT deploy.
"""

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).parent.parent
OUT = REPO / '.next' / 'server' / 'app'
SRC = REPO / 'src'

failures = []
warnings = []


def fail(check, msg, why):
    failures.append((check, msg, why))


def warn(check, msg):
    warnings.append((check, msg))


def html_pages():
    """Every built HTML page."""
    if not OUT.exists():
        print('ERROR: no build output found. Run `npm run build` first.')
        sys.exit(2)
    return sorted(OUT.rglob('*.html'))


def read(p):
    try:
        return p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return ''


# ---------------------------------------------------------------------------
# CHECK 1 — Fabricated review markup
# Shipped 4.8 stars / 50 ratings site-wide with zero reviews on the site.
# Fake review schema is a documented manual-action trigger.
# ---------------------------------------------------------------------------
def check_no_fake_ratings():
    hits = [p.name for p in html_pages() if 'aggregateRating' in read(p)]
    if hits:
        fail('fake-ratings',
             f'aggregateRating found on {len(hits)} page(s): {hits[:3]}',
             'Review markup must be backed by real, user-submitted reviews that are '
             'visible on the page. Fabricated ratings risk a site-wide penalty.')


# ---------------------------------------------------------------------------
# CHECK 2 — Page-level schema leaking site-wide
# HowTo + FAQPage were injected from the ROOT LAYOUT, so /privacy-policy carried
# a how-to about importing bank statements, and blog/bank pages shipped a SECOND
# FAQPage (Google allows one per page).
# ---------------------------------------------------------------------------
def check_schema_scoping():
    for p in html_pages():
        rel = p.relative_to(OUT).as_posix()
        body = read(p)
        is_home = rel == 'index.html'

        if 'HowTo' in body and not (is_home or rel.startswith('banks/')):
            fail('schema-scope', f'HowTo schema on /{rel}',
                 'A HowTo describes a specific procedure. On a page that does not '
                 'contain that procedure it is false. Emit it from the page it describes.')

        n_faq = body.count('"FAQPage"')
        if n_faq > 1:
            fail('schema-scope', f'{n_faq} FAQPage objects on /{rel}',
                 'Google allows ONE FAQPage per page. A second one (usually leaked '
                 'from the layout) gets rich results suppressed.')


# ---------------------------------------------------------------------------
# CHECK 3 — FAQ answers must actually exist in the HTML
# The homepage rendered answers as {open && <div>...}, so ZERO answers were in
# the HTML while the FAQPage schema claimed all nine. Straight policy violation.
# ---------------------------------------------------------------------------
def check_faq_answers_in_dom():
    home = OUT / 'index.html'
    if not home.exists():
        return
    body = read(home)
    m = re.search(r'"FAQPage".*?"mainEntity":\s*(\[.*?\])\s*}\s*</script>', body, re.S)
    if not m:
        return
    try:
        entities = json.loads(m.group(1))
    except Exception:
        return

    # Strip tags so we compare against rendered text only
    text = re.sub(r'<[^>]+>', ' ', body)
    missing = []
    for e in entities:
        ans = (e.get('acceptedAnswer') or {}).get('text', '')
        probe = ans[:45].strip()
        if probe and probe not in text:
            missing.append(e.get('name', '?')[:50])

    if missing:
        fail('faq-not-rendered',
             f'{len(missing)} FAQ answer(s) are in the schema but NOT in the page HTML: {missing[:2]}',
             'Google requires marked-up Q&A to be present on the page. Render answers '
             'into the DOM and collapse with CSS — never with {open && ...}.')


# ---------------------------------------------------------------------------
# CHECK 4 — Canonical on every indexable page
# The homepage — the most valuable URL — had none, because it was a client
# component and client components cannot export metadata.
# ---------------------------------------------------------------------------
def check_canonicals():
    for p in html_pages():
        rel = p.relative_to(OUT).as_posix()
        if rel.startswith('_') or '404' in rel:
            continue
        body = read(p)
        if 'name="robots" content="noindex' in body:
            continue
        if 'rel="canonical"' not in body:
            fail('canonical', f'no canonical on /{rel}',
                 'Every indexable page needs a canonical. A client component cannot '
                 'export metadata — split it into a server wrapper.')


# ---------------------------------------------------------------------------
# CHECK 5 — og:image + twitter card on every page
# Next.js SHALLOW-merges metadata: a page defining `openGraph` REPLACES the
# parent's, so omitting `images` silently dropped og:image. And because pages
# never overrode `twitter`, every article shipped the HOMEPAGE's Twitter card.
# ---------------------------------------------------------------------------
def check_social_cards():
    for p in html_pages():
        rel = p.relative_to(OUT).as_posix()
        if rel.startswith('_') or '404' in rel or 'privacy' in rel:
            continue
        body = read(p)
        if 'og:title' in body and 'og:image' not in body:
            fail('og-image', f'og:image missing on /{rel}',
                 'Next.js shallow-merges metadata: declaring openGraph without '
                 '`images` drops the parent og:image. Declare images explicitly.')

        # A blog/bank page carrying the homepage's twitter title = not overridden
        if (rel.startswith('blog/') or rel.startswith('banks/')) and rel.count('/') == 1:
            if 'Excel Bank Statement to Tally — Free &amp; Direct' in body or \
               'Excel Bank Statement to Tally — Free & Direct' in body:
                fail('twitter-card', f'/{rel} is shipping the HOMEPAGE twitter card',
                     'Declare a page-specific `twitter` block — otherwise shares into '
                     'WhatsApp/Telegram show the wrong title.')


# ---------------------------------------------------------------------------
# CHECK 6 — Unapproved drafts must never reach production or the sitemap
# An unapproved article went live because a develop->master merge swept it along.
# ---------------------------------------------------------------------------
def check_no_drafts_in_prod():
    blog = (SRC / 'data' / 'blogData.js').read_text(encoding='utf-8', errors='ignore')
    drafts = []
    for m in re.finditer(r'["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']', blog):
        slug = m.group(1)
        window = blog[m.end(): m.end() + 400]
        if re.search(r'["\']?hidden["\']?\s*:\s*true', window):
            drafts.append(slug)

    sitemap = OUT / 'sitemap.xml.body'
    sm = read(sitemap) if sitemap.exists() else ''

    for slug in drafts:
        if (OUT / 'blog' / f'{slug}.html').exists():
            fail('draft-leak', f'DRAFT "{slug}" was BUILT into production',
                 'hidden:true articles must be excluded from generateStaticParams. '
                 'An unapproved article must not be reachable.')
        if slug in sm:
            fail('draft-leak', f'DRAFT "{slug}" is in the sitemap',
                 'Google must only ever be shown approved work.')


# ---------------------------------------------------------------------------
# CHECK 7 — noindex pages must not be in the sitemap
# ---------------------------------------------------------------------------
def check_sitemap_sanity():
    sitemap = OUT / 'sitemap.xml.body'
    if not sitemap.exists():
        warn('sitemap', 'no sitemap.xml found in build output')
        return
    sm = read(sitemap)
    for p in html_pages():
        rel = p.relative_to(OUT).as_posix()
        if 'name="robots" content="noindex' in read(p):
            url_path = '/' + rel.replace('.html', '').replace('index', '')
            if url_path.rstrip('/') and url_path.rstrip('/') in sm:
                fail('sitemap', f'{url_path} is noindex but IS in the sitemap',
                     'It will sit in Search Console as "Excluded by noindex" forever. '
                     'Pick one: index it, or drop it from the sitemap.')


# ---------------------------------------------------------------------------
# CHECK 8 — No orphan pages (every page needs an inbound internal link)
# related-content used slice(0,2)/slice(0,4) on array order, so 4 of 7 articles
# and 3 of 8 bank pages had ZERO or ONE inbound link.
# ---------------------------------------------------------------------------
def check_no_orphans():
    pages = html_pages()
    bodies = {p.relative_to(OUT).as_posix(): read(p) for p in pages}

    for p in pages:
        rel = p.relative_to(OUT).as_posix()
        if not (rel.startswith('blog/') or rel.startswith('banks/')):
            continue
        if rel.count('/') != 1:
            continue
        route = '/' + rel.replace('.html', '')
        inbound = sum(
            1 for other, body in bodies.items()
            if other != rel and f'href="{route}"' in body
        )
        if inbound == 0:
            fail('orphan', f'{route} has ZERO inbound internal links',
                 'Google cannot judge a page it can only reach from the sitemap. '
                 'Link it from a related page.')
        elif inbound == 1:
            warn('orphan', f'{route} has only 1 inbound link — consider linking it more')


# ---------------------------------------------------------------------------
# CHECK 9 — Duplicated "Bank Bank" in titles
# bank.name already ends in "Bank", so `${bank.name} Bank Statement` produced
# "HDFC Bank Bank Statement to Tally" on 5 of 8 pages.
# ---------------------------------------------------------------------------
def check_titles():
    for p in html_pages():
        rel = p.relative_to(OUT).as_posix()
        body = read(p)
        m = re.search(r'<title>(.*?)</title>', body, re.S)
        if not m:
            continue
        title = m.group(1).strip()

        if re.search(r'\bBank Bank\b', title):
            fail('title', f'/{rel}: duplicated word — "{title[:60]}"',
                 'bank.name already ends in "Bank". Strip it before appending.')

        if len(title) > 75:
            warn('title', f'/{rel}: title is {len(title)} chars (truncates in SERPs) — "{title[:50]}..."')


CHECKS = [
    ('fabricated review markup', check_no_fake_ratings),
    ('schema scoping', check_schema_scoping),
    ('FAQ answers rendered', check_faq_answers_in_dom),
    ('canonical tags', check_canonicals),
    ('og:image + twitter cards', check_social_cards),
    ('draft leakage', check_no_drafts_in_prod),
    ('sitemap sanity', check_sitemap_sanity),
    ('orphan pages', check_no_orphans),
    ('title bugs', check_titles),
]


def main():
    print()
    print('SEO PREFLIGHT')
    print('=' * 60)

    for name, fn in CHECKS:
        before = len(failures)
        try:
            fn()
        except Exception as e:
            warn(name, f'check errored: {e}')
        status = 'FAIL' if len(failures) > before else 'ok'
        print(f'  [{status:>4}]  {name}')

    print()
    if warnings:
        print(f'{len(warnings)} warning(s):')
        for check, msg in warnings:
            print(f'  ~ [{check}] {msg}')
        print()

    if failures:
        print(f'{len(failures)} FAILURE(S) — DO NOT DEPLOY')
        print('=' * 60)
        for check, msg, why in failures:
            print()
            print(f'  X [{check}] {msg}')
            print(f'    -> {why}')
        print()
        return 1

    print('All checks passed. Safe to deploy.')
    print()
    return 0


if __name__ == '__main__':
    sys.exit(main())
