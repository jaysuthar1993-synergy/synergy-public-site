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

# Run monitor
if ($mode) {
    & $Python scripts/seo_news_monitor.py --auto $mode
} else {
    & $Python scripts/seo_news_monitor.py --auto
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

# Commit and push
$today = Get-Date -Format "yyyy-MM-dd"
git add src/data/updatesData.js scripts/seo_news_seen.json 2>$null
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "feat(seo): add $count news update(s) ($today)"
    git push origin develop

    Write-Host ""
    Write-Host "✓ $count update(s) pushed → Cloudflare Pages deploying..." -ForegroundColor Green
    Write-Host "  Preview: https://develop.synergy-public-site.pages.dev/updates" -ForegroundColor Cyan
} else {
    Write-Host "Nothing staged to commit (updatesData.js unchanged)." -ForegroundColor Yellow
}
