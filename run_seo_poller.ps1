# -------------------------------------------------------------
#  SEO Telegram Poller - checks for Approve/Discard button presses.
#  Runs every 5 minutes via Task Scheduler (Synergy-SEO-Poller).
#
#  ASCII-ONLY on purpose. PowerShell 5.1 reads .ps1 files as ANSI when there is
#  no BOM, so a UTF-8 em-dash (E2 80 94) decodes with a trailing 0x94 = a double
#  quote, which terminates a string early and makes the whole file unparseable.
#  That silently killed two scheduled bots for days: the task exited 1 before
#  Python ever started, so there were no logs and no Telegram messages.
#  See CLAUDE.md.
# -------------------------------------------------------------

$py       = "C:\Users\ADMIN\AppData\Local\Programs\Python\Python311\python.exe"
$RepoRoot = $PSScriptRoot

if (-not (Test-Path $py)) {
    $py = (Get-Command python -ErrorAction SilentlyContinue).Source
}

$env:PYTHONIOENCODING = "utf-8"
Set-Location $RepoRoot

& $py scripts/seo_poller.py
