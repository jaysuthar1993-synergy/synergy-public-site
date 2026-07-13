#!/usr/bin/env python3
"""
SEO Telegram Poller — runs every few minutes via Task Scheduler.
Checks for Approve/Discard button presses and executes the action.

  Approve → git checkout master && git merge develop && git push → article goes live
  Discard → removes article from blogData.js on develop, pushes, sends confirmation
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path

REPO_ROOT    = Path(__file__).parent.parent
OFFSET_FILE  = Path(__file__).parent / 'seo_tg_offset.txt'

_env_file = REPO_ROOT / '.env'
if _env_file.exists():
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _, _v = _line.partition('=')
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

sys.path.insert(0, str(Path(__file__).parent))
from seo_telegram import (
    get_updates, answer_callback, edit_message_text,
    remove_pending, list_pending, _load_pending
)

BLOG_DATA = REPO_ROOT / 'src' / 'data' / 'blogData.js'


def _run(cmd, **kwargs):
    return subprocess.run(cmd, cwd=str(REPO_ROOT), capture_output=True, text=True, **kwargs)


def _git(*args):
    return _run(['git'] + list(args))


def _ping_sitemap():
    """Submit sitemap to Google Search Console after every master deploy."""
    try:
        result = _run([sys.executable, str(REPO_ROOT / 'scripts' / 'submit_sitemap.py')])
        if result.returncode == 0:
            print('  Sitemap submitted to Google Search Console.')
        else:
            print(f'  Sitemap submit skipped: {result.stdout.strip() or result.stderr.strip()}')
    except Exception as e:
        print(f'  Sitemap submit error: {e}')


def verify_live(url, needle=None, timeout=240, interval=15):
    """
    Poll the LIVE production URL until the content actually appears.

    Cloudflare Pages takes ~1-2 min to build and deploy after a push, and the
    build can fail. Pushing to master is NOT the same as being live, so we
    confirm with our own eyes before telling the user it published.

    needle: substring that must appear in the page body (None = just want 200).
    Returns (ok: bool, detail: str).
    """
    import urllib.request
    import urllib.error

    deadline = time.time() + timeout
    attempt = 0
    last = 'no response'

    while time.time() < deadline:
        attempt += 1
        # Cache-buster so we read the origin, not an edge/proxy copy
        probe = f'{url}{"&" if "?" in url else "?"}cb={int(time.time())}'
        try:
            req = urllib.request.Request(
                probe,
                headers={
                    'User-Agent': 'SynergyBot/1.0 (deploy-verify)',
                    'Cache-Control': 'no-cache',
                },
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                if resp.status == 200:
                    body = resp.read().decode('utf-8', errors='ignore')
                    if needle is None or needle in body:
                        elapsed = int(timeout - (deadline - time.time()))
                        print(f'  VERIFIED live after ~{elapsed}s: {url}')
                        return True, f'verified live after ~{elapsed}s'
                    last = 'page is up but new content not present yet'
                else:
                    last = f'HTTP {resp.status}'
        except urllib.error.HTTPError as e:
            last = f'HTTP {e.code}'
        except Exception as e:
            last = f'{type(e).__name__}: {str(e)[:60]}'

        print(f'  verify attempt {attempt}: {last} — retrying in {interval}s')
        time.sleep(interval)

    print(f'  NOT VERIFIED after {timeout}s: {last}')
    return False, last


def approve_article(slug, title, msg_id):
    """Merge develop to master → article goes live."""
    print(f'Approving: {slug}')

    # Ensure on develop, pull latest
    _git('checkout', 'develop')
    _git('pull', 'origin', 'develop')

    # Merge to master
    _git('checkout', 'master')
    _git('pull', 'origin', 'master')
    merge = _git('merge', 'develop', '--no-edit')
    if merge.returncode != 0:
        print(f'  Merge failed: {merge.stderr}')
        edit_message_text(msg_id, f'ERROR: Could not merge to master.\n```{merge.stderr[:200]}```')
        return False

    push = _git('push', 'origin', 'master')
    if push.returncode != 0:
        print(f'  Push failed: {push.stderr}')
        return False

    _git('checkout', 'develop')

    edit_message_text(msg_id,
        f'*Merged to master.*\n\n'
        f'*{title}*\n\n'
        f'Waiting for Cloudflare to deploy, then verifying it is really live...'
    )

    # A blog article gets its own URL, so a 200 on that URL proves it deployed.
    article_url = f'https://synergyfuturecorp.com/blog/{slug}'
    ok, detail = verify_live(article_url, needle=None)

    if ok:
        _ping_sitemap()
        edit_message_text(msg_id,
            f'*PUBLISHED & VERIFIED LIVE*\n\n'
            f'*{title}*\n\n'
            f'Live: {article_url}\n'
            f'Confirmed on the live site ({detail}).\n'
            f'Sitemap submitted to Google.'
        )
    else:
        edit_message_text(msg_id,
            f'*Merged, but NOT yet visible live*\n\n'
            f'*{title}*\n\n'
            f'Pushed to master, but {article_url} is still not serving after 4 min.\n'
            f'Reason: {detail}\n\n'
            f'Check the Cloudflare Pages build log - the build may have failed.'
        )

    remove_pending(slug)
    print(f'  Published: /blog/{slug} (live={ok})')
    return True


def discard_article(slug, title, msg_id):
    """Remove article from blogData.js on develop branch."""
    print(f'Discarding: {slug}')

    _git('checkout', 'develop')
    _git('pull', 'origin', 'develop')

    # Read and rewrite blogData.js removing this article
    if not BLOG_DATA.exists():
        edit_message_text(msg_id, 'ERROR: blogData.js not found.')
        return False

    content = BLOG_DATA.read_text(encoding='utf-8')

    # Find and remove the article block
    # Article starts at a '{' whose first property line contains the slug
    slug_marker = f'"slug": "{slug}"'
    alt_marker  = f"slug: '{slug}'"

    if slug_marker not in content and alt_marker not in content:
        print(f'  Slug not found in blogData.js — already removed?')
        edit_message_text(msg_id, f'Article "{title}" was already removed or not found.')
        remove_pending(slug)
        return True

    lines = content.split('\n')
    # Find slug line
    slug_line_idx = None
    for i, line in enumerate(lines):
        if slug_marker in line or alt_marker in line:
            slug_line_idx = i
            break

    if slug_line_idx is None:
        print('  Could not find slug line')
        return False

    # Walk back to find opening '{' of the article
    start_idx = None
    for j in range(slug_line_idx, max(slug_line_idx - 5, 0), -1):
        if lines[j].strip() in ('{', '{,'):
            start_idx = j
            break
    if start_idx is None:
        # slug might be on same level as {
        start_idx = slug_line_idx - 1

    # Walk forward from slug line to find the matching closing '}'
    # Count brace depth starting from the opening {
    depth = 0
    end_idx = None
    for j in range(start_idx, len(lines)):
        depth += lines[j].count('{') - lines[j].count('}')
        if depth == 0 and j > start_idx:
            end_idx = j
            break

    if end_idx is None:
        print('  Could not find article end')
        return False

    # Remove the article block and any preceding comma/whitespace separator
    # Also fix the trailing comma on the previous article if needed
    new_lines = lines[:start_idx] + lines[end_idx + 1:]

    # Fix: if now the last article ends with '},' followed directly by '];'
    # walk back and ensure no double-comma or syntax issue
    # (trailing comma before ]; is fine in JS)

    BLOG_DATA.write_text('\n'.join(new_lines), encoding='utf-8')

    # Commit and push to develop
    _git('add', 'src/data/blogData.js')
    _git('commit', '-m', f'fix(blog): discard article {slug} (rejected via Telegram)')
    push = _git('push', 'origin', 'develop')

    if push.returncode != 0:
        print(f'  Push failed: {push.stderr}')

    # Add to done list so pipeline never regenerates it
    done_file = Path(__file__).parent / 'seo_topics_done.txt'
    with open(done_file, 'a', encoding='utf-8') as f:
        f.write(slug + '\n')

    edit_message_text(msg_id,
        f'*Discarded.*\n\n'
        f'"{title}" removed from develop branch. Topic added to skip list.'
    )
    remove_pending(slug)
    print(f'  Discarded: {slug}')
    return True


def approve_single_update(slug, title, msg_id, entry_id):
    """
    Write one pending update to updatesData.js, commit to develop, merge to master.
    slug is a short hash key ('__u_<md5-12>'); entry_id comes from the pending record.
    """
    print(f'Approving single update: {entry_id}')

    # Import the write helper from the monitor script
    sys.path.insert(0, str(REPO_ROOT / 'scripts'))
    from seo_news_monitor import write_pending_update_to_file

    _git('checkout', 'develop')
    _git('pull', 'origin', 'develop')

    ok, result = write_pending_update_to_file(entry_id)
    if not ok:
        print(f'  Write failed: {result}')
        edit_message_text(msg_id, f'ERROR: Could not write update.\n`{result}`')
        return False

    # Commit to develop  (_git already sets cwd — do NOT pass it again)
    _git('add', 'src/data/updatesData.js')
    commit = _git('commit', '-m', f'feat(updates): publish approved update - {result[:60]}')
    if commit.returncode != 0:
        print(f'  Commit failed: {commit.stderr}')
        return False

    _git('push', 'origin', 'develop')

    # Merge to master
    _git('checkout', 'master')
    _git('pull', 'origin', 'master')
    merge = _git('merge', 'develop', '--no-edit')
    if merge.returncode != 0:
        print(f'  Merge failed: {merge.stderr}')
        edit_message_text(msg_id, f'ERROR: Merge to master failed.\n```{merge.stderr[:200]}```')
        return False

    push = _git('push', 'origin', 'master')
    _git('checkout', 'develop')

    if push.returncode != 0:
        print(f'  Push failed: {push.stderr}')
        return False

    # Tell the user we are waiting, so the message is never stale/misleading
    edit_message_text(msg_id,
        f'*Merged to master.*\n\n'
        f'*{result[:80]}*\n\n'
        f'Waiting for Cloudflare to deploy, then verifying it is really live...'
    )

    # Verify the title actually renders on the live page before claiming success.
    # Match on a distinctive slice of the title (HTML-escaping can mangle quotes/dashes).
    needle = result[:40].split('—')[0].split('"')[0].strip()
    ok, detail = verify_live('https://synergyfuturecorp.com/updates', needle=needle)

    if ok:
        _ping_sitemap()
        edit_message_text(msg_id,
            f'*PUBLISHED & VERIFIED LIVE*\n\n'
            f'*{result[:80]}*\n\n'
            f'Live: https://synergyfuturecorp.com/updates\n'
            f'Confirmed on the live site ({detail}).\n'
            f'Sitemap submitted to Google.'
        )
    else:
        edit_message_text(msg_id,
            f'*Merged, but NOT yet visible live*\n\n'
            f'*{result[:80]}*\n\n'
            f'Pushed to master, but after 4 min the live page still does not show it.\n'
            f'Reason: {detail}\n\n'
            f'Check the Cloudflare Pages build log - the build may have failed.\n'
            f'Preview: https://develop.synergy-public-site.pages.dev/updates'
        )
    remove_pending(slug)
    print(f'  Published: {result}')
    return True


def run_once():
    """Check for one batch of Telegram updates and process any callbacks."""
    pending = list_pending()
    if not pending:
        return  # Nothing waiting — fast exit

    offset = None
    if OFFSET_FILE.exists():
        try:
            offset = int(OFFSET_FILE.read_text().strip())
        except Exception:
            pass

    data = get_updates(offset=offset)
    if not data.get('ok'):
        print('Telegram getUpdates failed')
        return

    updates = data.get('result', [])
    new_offset = offset

    for update in updates:
        update_id = update['update_id']
        new_offset = update_id + 1

        cb = update.get('callback_query')
        if not cb:
            continue

        callback_id = cb['id']
        callback_data = cb.get('data', '')
        msg_id = cb['message']['message_id']

        if ':' not in callback_data:
            continue

        action, slug = callback_data.split(':', 1)
        item = pending.get(slug)

        if not item:
            answer_callback(callback_id, 'Article not found in pending list.')
            continue

        title = item.get('title', slug)

        # Per-update approval (short hash slug '__u_<md5-12>')
        if slug.startswith('__u_'):
            entry_id = item.get('entry_id', '')
            if not entry_id:
                answer_callback(callback_id, 'Update record is missing its entry id.')
                continue
            if action == 'approve':
                answer_callback(callback_id, 'Writing and publishing update...')
                approve_single_update(slug, title, msg_id, entry_id)
            elif action == 'discard':
                answer_callback(callback_id, 'Skipped.')
                edit_message_text(msg_id, f'*Skipped.* "{title[:60]}" will not be published.')
                remove_pending(slug)
            else:
                answer_callback(callback_id, 'Unknown action.')
        elif action == 'approve':
            answer_callback(callback_id, 'Publishing to master...')
            approve_article(slug, title, msg_id)
        elif action == 'discard':
            answer_callback(callback_id, 'Discarding article...')
            discard_article(slug, title, msg_id)
        else:
            answer_callback(callback_id, 'Unknown action.')

    if new_offset and new_offset != offset:
        OFFSET_FILE.write_text(str(new_offset), encoding='utf-8')


if __name__ == '__main__':
    run_once()
