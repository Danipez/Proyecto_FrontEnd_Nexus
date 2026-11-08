@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  node scripts/serve.mjs
) else (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    "%ProgramFiles%\nodejs\node.exe" scripts/serve.mjs
  ) else (
    echo Instala Node.js 22.12 o superior y vuelve a abrir este archivo.
  )
)
pause
