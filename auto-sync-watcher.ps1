# Скрипт автоматического отслеживания изменений и автокоммита в GitHub
param (
    [int]$DebounceSeconds = 5
)

$workDir = $PSScriptRoot
Write-Host "👀 Запущен авто-синхронизатор с GitHub для папки: $workDir" -ForegroundColor Yellow

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $workDir
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$script:lastChange = [DateTime]::MinValue
$script:hasChanges = $false

$action = {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match '\\.git\\|\\node_modules\\|\\dist\\|\.log$') { return }
    $script:lastChange = [DateTime]::Now
    $script:hasChanges = $true
}

Register-ObjectEvent $watcher 'Changed' -Action $action | Out-Null
Register-ObjectEvent $watcher 'Created' -Action $action | Out-Null
Register-ObjectEvent $watcher 'Deleted' -Action $action | Out-Null

try {
    while ($true) {
        Start-Sleep -Seconds 2
        if ($script:hasChanges -and ([DateTime]::Now - $script:lastChange).TotalSeconds -ge $DebounceSeconds) {
            $script:hasChanges = $false
            Write-Host "🚀 Обнаружены изменения, отправка в GitHub..." -ForegroundColor Cyan
            git -C $workDir add .
            git -C $workDir commit -m "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git -C $workDir push origin main
            Write-Host "✅ Успешно синхронизировано с GitHub!" -ForegroundColor Green
        }
    }
} finally {
    $watcher.Dispose()
}
