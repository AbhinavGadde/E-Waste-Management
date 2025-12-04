# Deployment Guide

This guide covers deploying the E-Waste Management application.

## Architecture

- **Frontend**: React/Vite application (deploy to Vercel)
- **Backend**: FastAPI application (deploy to Railway/Render/Fly.io)

## Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your repository: `AbhinavGadde/E-Waste-Management`
4. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)

6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel
```

Follow the prompts and add the `VITE_API_URL` environment variable when asked.

## Backend Deployment

The backend needs persistent storage for SQLite database and file uploads, so Vercel serverless functions are not ideal. Use one of these platforms:

### Option 1: Railway (Recommended)

1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Python
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GEMINI_MODEL_NAME`: (optional) Model name, default is `gemini-1.5-flash-001`
7. Railway will provide a URL like `https://your-app.railway.app`
8. Update your frontend's `VITE_API_URL` to this URL

### Option 2: Render

1. Go to [Render](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: e-waste-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables (same as Railway)
6. Render will provide a URL

### Option 3: Fly.io

```bash
# Install flyctl
# Then in backend directory:
fly launch
# Follow prompts
fly deploy
```

## Environment Variables

### Frontend (Vercel)
- `VITE_API_URL`: Backend API URL

### Backend (Railway/Render/Fly.io)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL_NAME`: (optional) Model name
- `ENVIRONMENT`: Set to `production` for production

## Post-Deployment

1. Update CORS in `backend/app.py` to include your Vercel frontend URL
2. Test the API connection from the frontend
3. Verify file uploads work (may need cloud storage like S3 for production)

## Notes

- SQLite works for small-scale deployments but consider PostgreSQL for production
- File uploads are stored locally; consider cloud storage (S3, Cloudinary) for production
- Vercel has a 10-second timeout for serverless functions, so backend must be separate

