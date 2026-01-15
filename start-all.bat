@echo off
setlocal

start "frontend" cmd /k "cd /d %~dp0frontend && npm run start:fast"
cd /d %~dp0
npm start
