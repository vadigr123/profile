@echo off
chcp 65001 >nul
title Local HTML Server
cd /d "%~dp0"

set PORT=8000

where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:%PORT%
    python -m http.server %PORT%
) else (
    where py >nul 2>nul
    if %errorlevel%==0 (
        start "" http://localhost:%PORT%
        py -m http.server %PORT%
    ) else (
        echo Python не знайдено. Встановіть Python з https://www.python.org/ і не забудьте відмітити "Add Python to PATH".
        pause
    )
)