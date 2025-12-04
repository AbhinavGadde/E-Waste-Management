# Backend Deployment Script for PowerShell
# This script helps deploy the backend to Railway

Write-Host "🚀 Backend Deployment Helper" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "Option 1: Deploy via Railway Web Interface" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app and sign in with GitHub"
Write-Host "2. Click 'New Project' → 'Deploy from GitHub repo'"
Write-Host "3. Select: AbhinavGadde/E-Waste-Management"
Write-Host "4. Set Root Directory to: backend"
Write-Host "5. Add Environment Variables:"
Write-Host "   - GEMINI_API_KEY: (your key)"
Write-Host "   - FRONTEND_URL: https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app"
Write-Host ""
Write-Host "Option 2: Deploy via Railway CLI" -ForegroundColor Yellow
Write-Host "Run: railway login"
Write-Host "Then: cd backend; railway up"
Write-Host ""
Write-Host "After deployment, copy your backend URL and run:" -ForegroundColor Cyan
Write-Host "cd frontend"
Write-Host "vercel env add VITE_API_URL production"
Write-Host "(Enter your backend URL when prompted)"

