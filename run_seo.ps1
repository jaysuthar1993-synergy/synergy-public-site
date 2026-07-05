# ─────────────────────────────────────────────────────────────
#  SEO Article Generator — Local Runner
#  Runs the pipeline, commits result, and pushes to GitHub.
#
#  Usage:
#    .\run_seo.ps1                        # next topic from queue
#    .\run_seo.ps1 "tds entry tally prime"  # specific topic
#    .\run_seo.ps1 --dry                  # test without pushing
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Set-Location $RepoRoot

# Parse args
$topic = ""
$dry = $false
foreach ($arg in $args) {
    if ($arg -eq "--dry") { $dry = $true }
    else { $topic = $arg }
}

# Check .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "ERROR: .env file not found at $RepoRoot\.env" -ForegroundColor Red
    Write-Host "Create it with:" -ForegroundColor Yellow
    Write-Host "  GEMINI_API_KEY=your_key_here" -ForegroundColor Yellow
    Write-Host "  YOUTUBE_API_KEY=your_key_here  (optional)" -ForegroundColor Yellow
    exit 1
}

# Ensure on develop branch
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -ne "develop") {
    Write-Host "Switching to develop branch..." -ForegroundColor Cyan
    git checkout develop
}

# Pull latest
Write-Host "Pulling latest from origin/develop..." -ForegroundColor Cyan
git pull origin develop --quiet

# Build command
$pushFlag = if ($dry) { "" } else { "--push" }

if ($topic) {
    Write-Host ""
    Write-Host "Running pipeline for topic: $topic" -ForegroundColor Green
    python scripts/seo_youtube_pipeline.py $topic $pushFlag
} else {
    Write-Host ""
    Write-Host "Running pipeline (next topic from queue)..." -ForegroundColor Green
    python scripts/seo_youtube_pipeline.py --queue $pushFlag
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Pipeline failed. Check output above." -ForegroundColor Red
    exit 1
}

Write-Host ""
if ($dry) {
    Write-Host "Dry run complete. No push performed." -ForegroundColor Yellow
    Write-Host "Run without --dry to push to GitHub."
} else {
    Write-Host "Done! Article pushed to GitHub." -ForegroundColor Green
    Write-Host "Netlify will deploy to synergyfuturecorp.com in ~1 minute."
}
