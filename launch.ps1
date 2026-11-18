$ErrorActionPreference = 'SilentlyContinue'
$url = "http://localhost:3000"
$workDir = "D:\projects\покупочки"

$isRunning = $false
try {
    $res = Invoke-WebRequest -Uri $url -TimeoutSec 1 -UseBasicParsing
    if ($res.StatusCode -eq 200) { $isRunning = $true }
} catch {}

if (-not $isRunning) {
    Start-Process -FilePath "npm.cmd" -ArgumentList "run preview" -WorkingDirectory $workDir -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$browser = if (Test-Path $chrome) { $chrome } else { $edge }

Start-Process -FilePath $browser -ArgumentList "--app=$url"
