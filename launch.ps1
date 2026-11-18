$ErrorActionPreference = 'SilentlyContinue'
$url = "http://localhost:3000"
$workDir = "D:\projects\покупочки"

# Проверка, отвечает ли локальный сервер
$isRunning = $false
try {
    $res = Invoke-WebRequest -Uri $url -TimeoutSec 1 -UseBasicParsing
    if ($res.StatusCode -eq 200) { $isRunning = $true }
} catch {}

if (-not $isRunning) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c npm run preview"
    $psi.WorkingDirectory = $workDir
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $psi.CreateNoWindow = $true
    [System.Diagnostics.Process]::Start($psi) | Out-Null
    Start-Sleep -Milliseconds 1500
}

# Открываем в браузере по умолчанию
Start-Process $url
