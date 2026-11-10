@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 22.12 o superior y abre nuevamente esta ventana.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm.cmd install
  if errorlevel 1 exit /b 1
)
call npm.cmd run dev
pause
