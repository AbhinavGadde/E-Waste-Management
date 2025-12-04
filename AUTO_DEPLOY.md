# Automated Deployment Instructions

## 🎯 Quick Deploy Backend (2 minutes)

### Step 1: Deploy to Railway
I've opened Railway in your browser. Follow these steps:

1. **Sign in** with GitHub
2. **Select repository**: `AbhinavGadde/E-Waste-Management`
3. **Set Root Directory**: `backend`
4. **Add Environment Variables**:
   ```
   GEMINI_API_KEY = AIzaSyBHBY4GP1c0m_-p-23hUmHjT9gqZffDHuY
   FRONTEND_URL = https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app
   ENVIRONMENT = production
   ```
5. **Deploy** - Railway will automatically deploy!

### Step 2: Connect Frontend to Backend

After Railway provides your backend URL (e.g., `https://your-app.railway.app`):

```bash
cd frontend
vercel env add VITE_API_URL production
# Paste your Railway backend URL when prompted
vercel --prod
```

### ✅ Done!

Your full-stack app will be live!

---

**Alternative**: If Railway didn't open, go to: https://railway.app/new?template=github&repo=AbhinavGadde/E-Waste-Management

