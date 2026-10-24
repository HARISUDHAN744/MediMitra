Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting MediMitra AI - Personal Health Copilot       " -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/3] Freeing occupied ports (8000, 5173)..." -ForegroundColor Yellow
node scripts/free-ports.js

Write-Host "[2/3] Launching Full Stack (FastAPI Backend + Vite Frontend)..." -ForegroundColor Green
Start-Process "http://localhost:5173"
npm run dev
