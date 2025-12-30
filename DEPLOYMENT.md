# 🚀 Smart Agri Advisor - Deployment Guide

This guide will help you deploy the application to production using **FREE** hosting services.

---

## 📋 Architecture Overview

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | FREE |
| Backend | Render.com | FREE (750 hrs/month) |
| Database | Supabase | FREE (500MB) |

---

## 🗄️ Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Choose a name, password, and region (choose closest to India for lower latency)
4. Wait for project to be created (~2 minutes)
5. Go to **Settings → Database → Connection String**
6. Copy the **URI** format (starts with `postgresql://`)
7. Replace `[YOUR-PASSWORD]` with your database password

**Your DATABASE_URL will look like:**
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

---

## 🐍 Step 2: Deploy Backend to Render.com

### 2.1 Prepare Repository
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2.2 Create Render Account
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**

### 2.3 Configure Web Service
- **Name**: `smart-agri-advisor-api`
- **Region**: Singapore (closest to India)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### 2.4 Set Environment Variables
In Render Dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `GEMINI_KEYS` | Your Google AI API keys (comma-separated) |
| `SERPER_API_KEY` | Your Serper API key (optional) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |

### 2.5 Deploy
Click **"Create Web Service"** and wait (~5 minutes)

Your backend URL will be: `https://smart-agri-advisor-api.onrender.com`

---

## ⚛️ Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New..."** → **"Project"**

### 3.2 Import Repository
1. Select your `Smart-Agri-Avisor` repository
2. Set **Root Directory**: `frontend`
3. Framework Preset will auto-detect as **Vite**

### 3.3 Set Environment Variable
Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://smart-agri-advisor-api.onrender.com/api` |

### 3.4 Deploy
Click **"Deploy"** and wait (~2 minutes)

Your frontend URL will be: `https://your-project.vercel.app`

---

## 🔄 Step 4: Update CORS on Render

After getting your Vercel URL, go back to Render and update:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://your-project.vercel.app,http://localhost:5173` |

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured with Vercel URL
- [ ] Test login/registration works
- [ ] Test map analysis works
- [ ] Test chat with AI works

---

## 🔧 Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure GEMINI_KEYS are valid

### Frontend can't connect to backend?
- Check VITE_API_BASE_URL is correct (must end with `/api`)
- Verify CORS_ORIGINS includes your Vercel URL
- Check browser console for errors

### Database errors?
- Verify Supabase connection string has correct password
- Tables should auto-create on first run

---

## 🎉 You're Live!

Your app should now be accessible at your Vercel URL. Share it with the world!

**Estimated Cost**: $0/month (within free tier limits)
