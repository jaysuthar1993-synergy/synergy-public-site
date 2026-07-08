# ─────────────────────────────────────────────────────────────
#  Setup Windows Task Scheduler — SEO Daily Article Generator
#  Run this ONCE as Administrator to register the daily task.
#  After that it runs automatically every day at 10:00 AM.
# ─────────────────────────────────────────────────────────────

$TaskName   = "Synergy-SEO-Daily"
$RepoRoot   = "C:\Synergy\synergy-public-site"
$Script     = "$RepoRoot\run_seo.ps1"
$LogFile    = "$RepoRoot\seo_task_log.txt"
$RunAt      = "10:00"   # 10:00 AM local time (change if needed)

# The action: run PowerShell with the script, append output to log
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$Script`" >> `"$LogFile`" 2>&1" `
    -WorkingDirectory $RepoRoot

# Trigger: daily at 10 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At $RunAt

# Settings: run even if missed (e.g. PC was off), stop after 30 min
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

# Register (replaces if already exists)
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed old task." -ForegroundColor Yellow
}

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Generates daily SEO article and pushes to GitHub (synergy-public-site)" `
    -RunLevel Highest

Write-Host ""
Write-Host "Task registered: $TaskName" -ForegroundColor Green
Write-Host "Runs daily at $RunAt (local time)" -ForegroundColor Green
Write-Host "Log: $LogFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run NOW for testing:"
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
Write-Host "To check last run status:"
Write-Host "  Get-ScheduledTask '$TaskName' | Get-ScheduledTaskInfo"
Write-Host ""
Write-Host "To remove the task:"
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
