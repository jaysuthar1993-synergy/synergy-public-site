# ─────────────────────────────────────────────────────────────
#  SEO News Monitor — Local Runner
#  Checks govt sites + CA YouTube channels for new updates,
#  writes to updatesData.js, commits and pushes to GitHub.
#
#  Usage:
#    .\run_seo_news.ps1              # check all sources
#    .\run_seo_news.ps1 --govt-only
#    .\run_seo_news.ps1 --channels-only
#    .\run_seo_news.ps1 --dry        # no push
# ─────────────────────────────────────────────────────────────

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
    if ($arg -eq "--dry")             { $dry  = $true }
    elseif ($arg -match "^--(govt|channels)-only$") { $mode = $arg }
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host " SEO News Monitor — $timestamp" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# Ensure on develop branch and pull latest
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($branch -ne "develop") {
    Write-Host "Switching to develop..." -ForegroundColor Cyan
    git checkout develop
}
git pull origin develop --quiet

# Run monitor — govt sources only for updates page (YouTube is handled by blog pipeline)
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

# Check how many items were added
$countFile = "$RepoRoot\.seo_news_last_count"
$count = if (Test-Path $countFile) { Get-Content $countFile } else { "0" }
$count = [int]($count.Trim())

if ($count -eq 0) {
    Write-Host "No new updates found — nothing to push." -ForegroundColor Yellow
    exit 0
}

if ($dry) {
    Write-Host "Dry run — $count update(s) written but not pushed." -ForegroundColor Yellow
    exit 0
}

# Commit and push to develop first
$today = Get-Date -Format "yyyy-MM-dd"
# Save the seen-items tracker (prevents re-processing same RSS entries)
git add scripts/seo_news_seen.json scripts/seo_updates_pending.json 2>$null
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "chore(seo): update seen tracker ($today)"
    git push origin develop
}

# NOTE: updatesData.js is NOT committed here.
# Each update is saved to seo_updates_pending.json.
# seo_news_monitor.py sends individual Telegram messages — one per update.
# seo_poller.py writes the entry, commits, and merges to master when Approve is pressed.

if ($count -gt 0) {
    Write-Host ""
    Write-Host "OK $count update(s) queued — Telegram approval sent for each." -ForegroundColor Cyan
} else {
    Write-Host "Nothing new found." -ForegroundColor Yellow
}
