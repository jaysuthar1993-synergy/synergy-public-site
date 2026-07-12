#!/usr/bin/env python3
"""
Telegram approval bot for SEO article pipeline.

Sends a notification with preview link + Approve/Discard inline buttons.
Stores pending approvals in seo_pending.json.
Poller (seo_poller.py) checks for callbacks and executes approve/discard.

ENV VARS required in .env:
  TELEGRAM_BOT_TOKEN  — from @BotFather
  TELEGRAM_CHAT_ID    — your personal chat ID (message @userinfobot to get it)
"""

import os
import json
import time
import requests
from pathlib import Path

REPO_ROOT    = Path(__file__).parent.parent
PENDING_FILE = Path(__file__).parent / 'seo_pending.json'

_env_file = REPO_ROOT / '.env'
if _env_file.exists():
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _, _v = _line.partition('=')
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
CHAT_ID   = os.environ.get('TELEGRAM_CHAT_ID', '')
BASE_URL  = f'https://api.telegram.org/bot{BOT_TOKEN}'


def _api(method, **kwargs):
    r = requests.post(f'{BASE_URL}/{method}', json=kwargs, timeout=15)
    return r.json()


def send_approval_request(slug, title, description=''):
    """
    Send a Telegram message with Approve/Discard inline buttons.
    Stores the pending approval in seo_pending.json.
    Returns message_id on success, None on failure.
    """
    if not BOT_TOKEN or not CHAT_ID:
        print('TELEGRAM: No bot token or chat ID — skipping notification.')
        print('  Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env')
        return None

    preview_url = f'https://develop.synergy-public-site.pages.dev/blog/{slug}'

    text = (
        f'*New SEO Article Ready for Review*\n\n'
        f'*Title:* {title}\n\n'
        f'*Preview:* [Open article]({preview_url})\n\n'
        f'_{description[:200]}..._\n\n'
        f'Review the article above, then choose:'
    )

    keyboard = {
        'inline_keyboard': [[
            {'text': 'Publish to master', 'callback_data': f'approve:{slug}'},
            {'text': 'Discard', 'callback_data': f'discard:{slug}'},
        ]]
    }

    resp = _api(
        'sendMessage',
        chat_id=CHAT_ID,
        text=text,
        parse_mode='Markdown',
        reply_markup=keyboard,
        disable_web_page_preview=False,
    )

    if not resp.get('ok'):
        print(f'TELEGRAM ERROR: {resp.get("description", resp)}')
        return None

    msg_id = resp['result']['message_id']
    print(f'TELEGRAM: Message sent (id={msg_id})')
    print(f'  Preview: {preview_url}')

    # Store pending approval
    pending = _load_pending()
    pending[slug] = {
        'slug':        slug,
        'title':       title,
        'message_id':  msg_id,
        'preview_url': preview_url,
        'sent_at':     time.time(),
    }
    _save_pending(pending)
    return msg_id


def get_updates(offset=None):
    """Fetch new updates from Telegram (long-poll, 30s timeout)."""
    params = {'timeout': 30, 'allowed_updates': ['callback_query']}
    if offset:
        params['offset'] = offset
    try:
        r = requests.get(f'{BASE_URL}/getUpdates', params=params, timeout=40)
        return r.json()
    except Exception as e:
        print(f'TELEGRAM getUpdates error: {e}')
        return {'ok': False, 'result': []}


def answer_callback(callback_id, text):
    _api('answerCallbackQuery', callback_query_id=callback_id, text=text)


def edit_message_text(msg_id, new_text):
    _api('editMessageText', chat_id=CHAT_ID, message_id=msg_id, text=new_text, parse_mode='Markdown')


def _load_pending():
    if PENDING_FILE.exists():
        try:
            return json.loads(PENDING_FILE.read_text(encoding='utf-8'))
        except Exception:
            return {}
    return {}


def _save_pending(data):
    PENDING_FILE.write_text(json.dumps(data, indent=2), encoding='utf-8')


def remove_pending(slug):
    pending = _load_pending()
    if slug in pending:
        del pending[slug]
        _save_pending(pending)


def list_pending():
    return _load_pending()


def send_single_update_approval(entry_id, title, summary):
    """
    Send one Telegram message per govt update with individual Approve/Skip buttons.
    entry_id: the unique id for this update (used as slug key)
    """
    if not BOT_TOKEN or not CHAT_ID:
        print('TELEGRAM: No bot token or chat ID — skipping notification.')
        return None

    preview_url = 'https://develop.synergy-public-site.pages.dev/updates'

    text = (
        f'*Govt Update — Approve?*\n\n'
        f'*{title}*\n\n'
        f'_{summary[:280]}_\n\n'
        f'[Preview /updates]({preview_url})'
    )

    slug = f'__update_{entry_id}'
    keyboard = {
        'inline_keyboard': [[
            {'text': 'Publish this update', 'callback_data': f'approve:{slug}'},
            {'text': 'Skip', 'callback_data': f'discard:{slug}'},
        ]]
    }

    resp = _api(
        'sendMessage',
        chat_id=CHAT_ID,
        text=text,
        parse_mode='Markdown',
        reply_markup=keyboard,
        disable_web_page_preview=True,
    )

    if not resp.get('ok'):
        print(f'TELEGRAM ERROR: {resp.get("description", resp)}')
        return None

    msg_id = resp['result']['message_id']
    print(f'  TELEGRAM: Sent approval for "{title[:50]}" (msg={msg_id})')

    pending = _load_pending()
    pending[slug] = {
        'slug':       slug,
        'title':      title,
        'entry_id':   entry_id,
        'message_id': msg_id,
        'type':       'single_update',
        'sent_at':    time.time(),
    }
    _save_pending(pending)
    return msg_id
