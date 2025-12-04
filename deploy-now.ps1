# One-Click Backend Deployment Script
Write-Host "🚀 Starting Backend Deployment..." -ForegroundColor Green
Write-Host ""

# Open Railway in browser with GitHub repo
$repoUrl = "https://railway.app/new?template=github&repo=AbhinavGadde/E-Waste-Management"
Write-Host "Opening Railway deployment page..." -ForegroundColor Yellow
Start-Process $repoUrl

Write-Host ""
Write-Host "📋 Quick Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Sign in with GitHub" -ForegroundColor White
Write-Host "2. When prompted, select: AbhinavGadde/E-Waste-Management" -ForegroundColor White
Write-Host "3. Set Root Directory to: backend" -ForegroundColor White
Write-Host "4. Add Environment Variables:" -ForegroundColor White
Write-Host "   - GEMINI_API_KEY = AIzaSyBHBY4GP1c0m_-p-23hUmHjT9gqZffDHuY" -ForegroundColor Yellow
Write-Host "   - FRONTEND_URL = https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app" -ForegroundColor Yellow
Write-Host "5. Railway will auto-deploy!" -ForegroundColor White
Write-Host ""
Write-Host "After deployment, copy your backend URL and run:" -ForegroundColor Green
Write-Host "  cd frontend" -ForegroundColor Cyan
Write-Host "  vercel env add VITE_API_URL production" -ForegroundColor Cyan
Write-Host '  vercel --prod' -ForegroundColor Cyan

