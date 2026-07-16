# synergy-public-site — SEO Rules & Invariants

Marketing site for **Synergy Automation** (free tool: post Excel bank statements
straight into Tally). Next.js 14 App Router, static export, **Cloudflare Pages**.

Audience: Indian CAs, accountants, small business owners.

---

## RUN THIS BEFORE EVERY DEPLOY

```bash
npm run build:safe        # next build + SEO preflight
```

or, if you already built:

```bash
npm run seo:check
```

`scripts/seo_preflight.py` inspects the **built HTML** and exits non-zero if any
invariant below is violated. **`npm run build` passing means nothing** — it was
green for every single bug listed here while they sat live on production.

The Telegram poller runs this automatically and **refuses to merge to master** if
it fails.

---

## Invariants (each one is a bug that actually shipped)

### 1. Never fabricate review markup
`aggregateRating` claimed **4.8 stars from 50 ratings**. There were no reviews
anywhere on the site, and it was on **every page**. Fake review schema is a
documented manual-action trigger, and the blast radius was the whole domain.

Only add it back with real, user-submitted reviews **rendered visibly** on the
page, using the true numbers.

### 2. Page-level schema goes on the page it describes
`HowTo` + `FAQPage` were emitted from `layout.js`, so:
- `/privacy-policy` carried a how-to about importing bank statements
- every blog/bank page shipped a **second** `FAQPage` (Google allows one)

Site-wide schema (`Organization`, `SoftwareApplication`) belongs in the layout.
Everything else belongs on its own page.

### 3. Schema must describe content that is actually in the HTML
The homepage rendered FAQ answers as `{openFaq === i && <div>…}` — so **zero
answers were in the HTML** while `FAQPage` schema claimed all nine.

**Always render content into the DOM and collapse it with CSS.** Never gate
marked-up content behind `{open && …}`. Accordions are fine; empty pages that
promise answers are not. Same bug exists on `/updates` (`keyPoints` and
`tallyImpact` — the genuinely unique content — ship in zero pages).

### 4. Next.js SHALLOW-merges metadata
Declaring `openGraph` on a page **replaces the parent's object wholesale**. Omit
`images` and you silently drop `og:image`. Don't override `twitter` and every
article ships the **homepage's** Twitter card — so a share into a CA WhatsApp
group shows the wrong title and no image.

**Every page that declares `openGraph` must also declare `images` AND a
page-specific `twitter` block.**

### 5. Client components cannot export metadata
The homepage was `'use client'`, so it had **no canonical tag** — the most
valuable URL on the site. Fix: server wrapper (`app/page.js`) owns metadata and
JSON-LD, client UI lives in `components/LandingPage.jsx`.

### 6. Link by topic, never by array position
Related content used `.slice(0, 2)` / `.slice(0, 4)` on **array order**:
- every article linked to the same first two posts → 4 of 7 articles had exactly
  **one** inbound link (from `/blog`)
- bank pages always linked to HDFC/SBI/ICICI/Axis → **PNB, Bank of Baroda and
  Yes Bank had ZERO inbound links from anywhere**

Use the curated `related: []` field on each post. Bank pages rotate neighbours.
Bank names in article body auto-link via `autoLinkBanks()`.

**No page may have zero inbound internal links.** The preflight enforces this.

### 7. Drafts must be structurally incapable of going live
Articles are generated with **`hidden: true`**. On production a hidden post is not
built (excluded from `generateStaticParams`), not listed, and **not in the
sitemap** — so a `develop → master` merge *cannot* publish it.

Approving in Telegram is what flips `hidden: false`.

This replaced a merge-timing gate, which failed: an unapproved article went live
because an unrelated merge swept it along. **Merge timing is not a safety
mechanism.**

The draft gate is driven by the **branch**, not an env var. Cloudflare Pages injects
`CF_PAGES_BRANCH` into every build; production is `master`. So drafts show on any
non-master (preview) branch and are hidden on `master` — no Cloudflare env var
needed, and none can leak them (Cloudflare's Variables UI has no per-environment
split, so an env var there would otherwise hit production too). `NEXT_PUBLIC_SHOW_DRAFTS`
is only a LOCAL override, used when `CF_PAGES_BRANCH` is absent (`npm run build` on
your machine). Verified: `master` builds never emit draft pages; `develop` builds do.
The sitemap ignores drafts entirely regardless.

### 8. robots.txt — do not delete `src/app/robots.js`
Cloudflare **auto-injects a default robots.txt when the origin serves none**, and
that default **blocks every AI crawler** (`ClaudeBot`, `GPTBot`,
`Google-Extended`, `CCBot`, `Bytespider`, `meta-externalagent`) and sets
`ai-train=no`.

That silently defeats the entire GEO strategy — the whole point of the content
pipeline is to be the cited source when a CA asks an AI assistant how to get
Excel into Tally.

Deleting `robots.js` does **not** give you "no robots.txt" — it restores
Cloudflare's blocking one.

Also required (Cloudflare dashboard, one-time):
**AI Crawl Control → "Manage your robots.txt" → `Disable robots.txt
configuration`.** Anything else prepends the managed block above ours, and
agent-specific rules beat our `User-agent: *`.

### 9. Don't lie in the sitemap
- `lastModified` derives from **content dates**, not `new Date()`. Stamping
  "modified today" on every build teaches Google to distrust the signal.
- `noindex` pages (e.g. `/privacy-policy`) must **not** be listed, or they park a
  permanent "Excluded by noindex" error in Search Console.

### 10. Never contradict the product
Two articles instructed readers to *"navigate to Gateway of Tally → Import Data →
Transactions"* and *"ensure your statement is in PDF format"*.

That is Tally's own XML-file import — the exact workflow the homepage mocks
competitors for ("No XML. No Import.") — and the product takes **Excel**, not PDF.
The articles taught prospects to do the thing the product exists to eliminate.

**Generated content must be read before approval.** Synergy's flow is:
upload Excel → review in the table → click Post → entries appear in Tally.
No XML file. No Tally import screen.

---

## Content rules (also enforced in the generator prompt)

- **Never** name competitors — say "other tools", "XML converter tools", "paid platforms"
- **Never** mention LedgerMatch, PDF upload, or duplicate detection (develop-only)
- **Never** say "we don't store your data" — say "your data is stored securely in our system"
- Synergy Automation is **free** — state it plainly
- **No invented numbers** ("500+ CAs", "98% accuracy") and no invented quotes

---

## Windows / PowerShell

**Keep every `.ps1` ASCII-only.** PowerShell 5.1 reads `.ps1` as ANSI when there's
no BOM, so a UTF-8 em-dash (`E2 80 94`) decodes with a trailing `0x94` = `"`,
which terminates a string early and makes the file unparseable.

This silently killed two scheduled bots for days — the task died with exit 1
before Python ever started, so there were no logs and no Telegram messages.

Detect:
```powershell
Get-ChildItem -Filter *.ps1 -Recurse | ForEach-Object {
    $n = [regex]::Matches([System.IO.File]::ReadAllText($_.FullName), '[^\x00-\x7F]').Count
    if ($n) { "$($_.Name): $n non-ASCII" }
}
```

**Runtime state files must stay gitignored** (`seo_updates_pending.json`,
`seo_pending.json`, `seo_tg_offset.txt`, `seo_news_seen.json`). The poller mutates
them mid-run; once tracked, `git checkout master` aborts with "local changes would
be overwritten" and **every approval dies silently**.
