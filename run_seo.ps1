# ─────────────────────────────────────────────────────────────
#  SEO Article Generator — Local Runner
#  Generates article, commits, and pushes to GitHub.
#
#  Usage (manual):
#    .\run_seo.ps1                           # next topic from queue, interactive
#    .\run_seo.ps1 "tds entry tally prime"   # specific topic, interactive
#    .\run_seo.ps1 --auto                    # next topic, no approval prompt
#    .\run_seo.ps1 --dry                     # test without pushing
#
#  Automated (Task Scheduler calls this with --auto):
#    No interaction needed — generates, commits, pushes, done.
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

# Use system Python (not any active venv that may lack google-genai)
$Python = "C:\Users\ADMIN\AppData\Local\Programs\Python\Python311\python.exe"
if (-not (Test-Path $Python)) {
    $Python = (Get-Command python -ErrorAction SilentlyContinue).Source
}

Set-Location $RepoRoot

# Parse args
$topic = ""
$dry   = $false
$auto  = $false
foreach ($arg in $args) {
    if ($arg -eq "--dry")  { $dry  = $true }
    elseif ($arg -eq "--auto") { $auto = $true }
    else { $topic = $arg }
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Synergy SEO Pipeline — $timestamp" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# Check .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "ERROR: .env file not found at $RepoRoot\.env" -ForegroundColor Red
    Write-Host "Create it with:" -ForegroundColor Yellow
    Write-Host "  GEMINI_API_KEY=your_key_here" -ForegroundColor Yellow
    Write-Host "  YOUTUBE_API_KEY=your_key_here" -ForegroundColor Yellow
    exit 1
}

# Ensure on develop branch
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($branch -ne "develop") {
    Write-Host "Switching to develop branch..." -ForegroundColor Cyan
    git checkout develop
}

# Pull latest
Write-Host "Pulling latest..." -ForegroundColor Cyan
git pull origin develop --quiet

# Build flags
$autoFlag = if ($auto) { "--auto" } else { "" }
$pushFlag = if ($dry)  { "" } else { "--push" }

# Run pipeline
if ($topic) {
    Write-Host "Topic: $topic" -ForegroundColor Green
    if ($auto) {
        & $Python scripts/seo_youtube_pipeline.py $topic $autoFlag $pushFlag
    } else {
        & $Python scripts/seo_youtube_pipeline.py $topic $pushFlag
    }
} else {
    Write-Host "Mode: trending YouTube topic discovery" -ForegroundColor Green
    & $Python scripts/seo_youtube_pipeline.py --trending $autoFlag $pushFlag
}

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -ne 0) {
    Write-Host "Pipeline failed (exit $exitCode). Check output above." -ForegroundColor Red
    exit $exitCode
}

if ($dry) {
    Write-Host "Dry run complete — no push." -ForegroundColor Yellow
} else {
    Write-Host "Done! Pushed to GitHub → Netlify deploys in ~1 min." -ForegroundColor Green
    Write-Host "Live at: https://synergyfuturecorp.com/blog/" -ForegroundColor Cyan
}
