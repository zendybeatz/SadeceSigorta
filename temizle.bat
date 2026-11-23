@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Gereksiz dosyalar siliniyor...
del /q "images.jpg" "images (1).jpg" "images (2).jpg" 2>nul
del /q "js\vendor\lenis.mjs" 2>nul
del /q "assets\logo-mark.png" "assets\logo-circle.png" "assets\favicon-32.png" "assets\favicon-48.png" 2>nul
rmdir "html" 2>nul
echo Tamam. Bu dosyayi (temizle.bat) da silebilirsiniz.
pause
