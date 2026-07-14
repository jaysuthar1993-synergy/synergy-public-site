# -------------------------------------------------------------
#  SEO News Monitor - Local Runner
#  Checks govt sites for new updates, saves them to a pending
#  store, and sends one Telegram approval message per update.
#
#  NOTE: ASCII-only on purpose. PowerShell 5.1 reads .ps1 files as
#  ANSI when there is no BOM, so non-ASCII chars (em-dash, box-draw)
#  get mangled into bytes that break string parsing.
#
#  Usage:
#    .\run_seo_news.ps1              # govt sources (default)
#    .\run_seo_news.ps1 --govt-only
#    .\run_seo_news.ps1 --channels-only
#    .\run_seo_news.ps1 --dry        # no push
# -------------------------------------------------------------

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot
$Python   = "C:\Users\ADMIN\AppData\Local\Programs\Python\Python311\python.exe"
if (-not (Test-Path $Python)) {
    $Python = (Get-Command python -ErrorAction SilentlyContinue).Source
}

Set-Location $RepoRoot

# Force UTF-8 output so emoji in pipeline prints don't crash on Windows cp1252
$env:PYTHONIOENCODING = "utf-8"

$dry  = $false
$mode = ""
foreach ($arg in $args) {
    if ($arg -eq "--dry")                           { $dry  = $true }
    elseif ($arg -match "^--(govt|channels)-only$") { $mode = $arg }
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " SEO News Monitor - $timestamp" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Ensure on develop branch and pull latest
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($branch -ne "develop") {
    Write-Host "Switching to develop..." -ForegroundColor Cyan
    git checkout develop
}
git pull origin develop --quiet

# Run monitor - govt sources only for updates page (YouTube handled by blog pipeline)
if ($mode) {
    & $Python scripts/seo_news_monitor.py --auto $mode
} else {
    & $Python scripts/seo_news_monitor.py --auto --govt-only
}

$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
    Write-Host "Monitor failed (exit $exitCode)." -ForegroundColor Red
    exit $exitCode
}

# How many updates were queued for approval
$countFile = "$RepoRoot\.seo_news_last_count"
$count = if (Test-Path $countFile) { Get-Content $countFile } else { "0" }
$count = [int]($count.Trim())

if ($count -eq 0) {
    Write-Host "No new updates found." -ForegroundColor Yellow
    exit 0
}

if ($dry) {
    Write-Host "Dry run - $count update(s) queued but not pushed." -ForegroundColor Yellow
    exit 0
}

# NOTE: Do NOT git-add the seen tracker or the pending store.
# They are LOCAL RUNTIME STATE and are gitignored on purpose.
#
# Tracking them is actively harmful: the poller mutates seo_updates_pending.json
# while approving, and a tracked copy makes `git checkout master` abort with
# "local changes would be overwritten" - which silently killed every approval.
#
# updatesData.js is not committed here either. seo_poller.py writes each entry
# only after you press Approve in Telegram.

Write-Host ""
Write-Host "OK $count update(s) queued - Telegram approval sent for each." -ForegroundColor Cyan
