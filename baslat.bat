@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js bulunamadi. https://nodejs.org adresinden kurun. & pause & exit /b)
echo Site aciliyor... Kapatmak icin bu pencereyi kapatin.
node scripts\serve.mjs
pause
