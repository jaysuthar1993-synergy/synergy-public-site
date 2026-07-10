# ─────────────────────────────────────────────────────────────
#  SEO Telegram Poller — checks for Approve/Discard button presses
#  Runs every 5 minutes via Task Scheduler.
# ─────────────────────────────────────────────────────────────

$py      = "C:\Users\ADMIN\AppData\Local\Programs\Python\Python311\python.exe"
$RepoRoot = $PSScriptRoot

if (-not (Test-Path $py)) {
    $py = (Get-Command python -ErrorAction SilentlyContinue).Source
}

$env:PYTHONIOENCODING = "utf-8"
Set-Location $RepoRoot

& $py scripts/seo_poller.py
