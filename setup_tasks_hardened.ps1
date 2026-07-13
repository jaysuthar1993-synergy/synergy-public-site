# -------------------------------------------------------------
#  Synergy SEO - Harden Scheduled Tasks
#
#  RUN THIS ONCE, AS ADMINISTRATOR:
#    Right-click this file -> "Run with PowerShell" (as Admin)
#    or:  Start -> type "PowerShell" -> right-click -> Run as Administrator
#         cd C:\Synergy\synergy-public-site
#         .\setup_tasks_hardened.ps1
#
#  What it fixes:
#    1. NO POPUP WINDOW  - LogonType S4U + Hidden means the PowerShell
#       console never appears. (Interactive logon is what causes the popup.)
#    2. SURVIVES REBOOT  - S4U runs whether you are logged in or not, and
#       StartWhenAvailable catches up any run missed while the PC was off.
#    3. WATCHDOG         - RestartCount 3 / RestartInterval 2min retries a
#       failed run automatically instead of waiting for the next cycle.
#    4. POLLER TIMEOUT   - raised 2min -> 10min. The poller now verifies the
#       page is really live (polls up to 4 min), and a 2 min limit would have
#       had Windows KILL it mid-publish.
#
#  ASCII-only on purpose (PowerShell 5.1 mangles non-ASCII in .ps1 files).
# -------------------------------------------------------------

$ErrorActionPreference = "Stop"

# Verify we are elevated
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERROR: This script must be run as Administrator." -ForegroundColor Red
    Write-Host "  Right-click PowerShell -> Run as Administrator, then re-run this script." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$userId = "$env:USERDOMAIN\$env:USERNAME"
Write-Host ""
Write-Host "Hardening Synergy SEO tasks for user: $userId" -ForegroundColor Cyan
Write-Host ""

# S4U: "Run whether user is logged on or not", without storing a password.
# This is the setting that makes the task run SILENTLY (no console window).
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType S4U -RunLevel Limited

$tasks = @(
    @{ Name = "Synergy-SEO-News";   Minutes = 20 },
    @{ Name = "Synergy-SEO-Poller"; Minutes = 10 },   # was 2 - too short for live-verify
    @{ Name = "Synergy-SEO-Daily";  Minutes = 30 }
)

foreach ($t in $tasks) {
    $existing = Get-ScheduledTask -TaskName $t.Name -ErrorAction SilentlyContinue
    if (-not $existing) {
        Write-Host "SKIP (not found): $($t.Name)" -ForegroundColor Yellow
        continue
    }

    $settings = New-ScheduledTaskSettingsSet `
        -StartWhenAvailable `
        -Hidden `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 2) `
        -ExecutionTimeLimit (New-TimeSpan -Minutes $t.Minutes) `
        -MultipleInstances IgnoreNew `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries

    Set-ScheduledTask -TaskName $t.Name -Principal $principal -Settings $settings | Out-Null
    Write-Host ("OK  {0,-20} hidden, S4U, retry x3, limit {1} min" -f $t.Name, $t.Minutes) -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding boot triggers (so tasks resume after a reboot)..." -ForegroundColor Cyan

# Keep each task's existing schedule trigger and ADD an at-startup trigger.
# Delay 3 min so the network/VPN is up before the first run.
foreach ($t in $tasks) {
    $task = Get-ScheduledTask -TaskName $t.Name -ErrorAction SilentlyContinue
    if (-not $task) { continue }

    $hasBoot = $task.Triggers | Where-Object { $_.CimClass.CimClassName -eq "MSFT_TaskBootTrigger" }
    if ($hasBoot) {
        Write-Host ("--  {0,-20} boot trigger already present" -f $t.Name) -ForegroundColor DarkGray
        continue
    }

    $boot = New-ScheduledTaskTrigger -AtStartup
    $boot.Delay = "PT3M"

    $allTriggers = @($task.Triggers) + $boot
    Set-ScheduledTask -TaskName $t.Name -Trigger $allTriggers | Out-Null
    Write-Host ("OK  {0,-20} boot trigger added (3 min delay)" -f $t.Name) -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Final state ===" -ForegroundColor Cyan
foreach ($t in $tasks) {
    $task = Get-ScheduledTask -TaskName $t.Name -ErrorAction SilentlyContinue
    if (-not $task) { continue }
    $info = $task | Get-ScheduledTaskInfo
    Write-Host ""
    Write-Host $t.Name -ForegroundColor White
    Write-Host "  LogonType    : $($task.Principal.LogonType)   (S4U = silent, no login needed)"
    Write-Host "  Hidden       : $($task.Settings.Hidden)"
    Write-Host "  Retry on fail: $($task.Settings.RestartCount) times, every $($task.Settings.RestartInterval)"
    Write-Host "  Time limit   : $($task.Settings.ExecutionTimeLimit)"
    Write-Host "  Triggers     : $(($task.Triggers | ForEach-Object { $_.CimClass.CimClassName }) -join ', ')"
    Write-Host "  Last result  : $($info.LastTaskResult)  (0 = success)"
}

Write-Host ""
Write-Host "Done. Tasks now run silently, survive reboot, and retry on failure." -ForegroundColor Green
Write-Host ""
