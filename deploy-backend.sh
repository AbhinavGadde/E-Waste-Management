#!/bin/bash
# Backend Deployment Script
# This script helps deploy the backend to Railway

echo "🚀 Backend Deployment Helper"
echo "=============================="
echo ""
echo "Option 1: Deploy via Railway Web Interface"
echo "1. Go to https://railway.app and sign in with GitHub"
echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
echo "3. Select: AbhinavGadde/E-Waste-Management"
echo "4. Set Root Directory to: backend"
echo "5. Add Environment Variables:"
echo "   - GEMINI_API_KEY: (your key)"
echo "   - FRONTEND_URL: https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app"
echo ""
echo "Option 2: Deploy via Railway CLI"
echo "Run: railway login"
echo "Then: cd backend && railway up"
echo ""
echo "After deployment, copy your backend URL and run:"
echo "vercel env add VITE_API_URL production"
echo "(Enter your backend URL when prompted)"

