# Quick Deployment Guide

## ✅ Frontend Status: DEPLOYED
**URL**: https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app

## 🚀 Backend Deployment (Choose One)

### Option 1: Railway (Recommended - 5 minutes)

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: `AbhinavGadde/E-Waste-Management`
5. **Configure**:
   - Root Directory: `backend`
   - Railway will auto-detect Python
6. **Add Environment Variables** (in Railway dashboard):
   - `GEMINI_API_KEY` = `AIzaSyBHBY4GP1c0m_-p-23hUmHjT9gqZffDHuY`
   - `FRONTEND_URL` = `https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app`
   - `ENVIRONMENT` = `production`
7. **Deploy**: Railway will automatically deploy
8. **Copy Backend URL**: Railway will provide a URL like `https://your-app.railway.app`

### Option 2: Render (Alternative)

1. **Go to Render**: https://render.com
2. **Sign in** with GitHub
3. **Click**: "New" → "Web Service"
4. **Connect**: Your GitHub repo `AbhinavGadde/E-Waste-Management`
5. **Configure**:
   - Name: `e-waste-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. **Add Environment Variables**:
   - `GEMINI_API_KEY` = `AIzaSyBHBY4GP1c0m_-p-23hUmHjT9gqZffDHuY`
   - `FRONTEND_URL` = `https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app`
7. **Deploy**: Click "Create Web Service"

## 🔗 Connect Frontend to Backend

After backend is deployed, get your backend URL and run:

```bash
cd frontend
vercel env add VITE_API_URL production
# Enter your backend URL when prompted (e.g., https://your-app.railway.app)
vercel --prod
```

Or add via Vercel Dashboard:
1. Go to: https://vercel.com/abhinav-gaddes-projects/frontend/settings/environment-variables
2. Add: `VITE_API_URL` = `your-backend-url`
3. Redeploy

## ✅ Verify Deployment

1. Visit frontend: https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app
2. Test login/register
3. Test image upload with e-waste detection

## 🎉 Done!

Your app should now be fully deployed and working!

