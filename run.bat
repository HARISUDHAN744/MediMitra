@echo off
echo ========================================================
echo   Starting MediMitra AI - Personal Health Copilot
echo ========================================================
echo [1/3] Freeing occupied ports (8000, 5173)...
node scripts/free-ports.js

echo [2/3] Launching Full Stack (FastAPI Backend + Vite Frontend)...
start "" http://localhost:5173
npm run dev
