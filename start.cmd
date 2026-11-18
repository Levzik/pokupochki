@echo off
chcp 65001 > nul
title Покупочки

:: Проверяем, запущен ли сервер
curl -s -m 1 http://localhost:3000 > nul 2>&1
if %errorlevel% neq 0 (
    echo Запуск локального сервера «Покупочки»...
    start /b "" npm run preview
    timeout /t 2 /nobreak > nul
)

:: Открываем в Chrome или Edge в режиме автономного приложения
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000"
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:3000"
) else (
    start http://localhost:3000
)
