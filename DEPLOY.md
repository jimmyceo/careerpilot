# CareerPilot Deployment Guide

## Frontend → Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import `jimmyceo/careerpilot` repo
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = Railway backend URL (get after Railway deploy)
7. Click Deploy

**Vercel will auto-deploy on every push to main.**

## Backend → Railway

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `jimmyceo/careerpilot`
5. Railway auto-detects Dockerfile
6. Add Environment Variables in Railway dashboard:
   - `DATABASE_URL` = PostgreSQL connection string
   - `STRIPE_SECRET_KEY` = your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` = your Stripe webhook secret
   - `OLLAMA_API_KEY` = from .env
   - `OLLAMA_BASE_URL` = from .env
7. Click Deploy

**Railway provides:**
- Automatic HTTPS URL
- PostgreSQL database (add in Railway dashboard)
- Auto-deploy on push

## Post-Deploy Steps

1. **Update Frontend Env**: Add Railway backend URL to Vercel env vars
2. **Stripe Webhook**: Configure webhook URL to `https://your-railway-url/api/payment/webhook`
3. **Test**: Upload resume → Generate CV → Download PDF
4. **Launch**: Share Vercel URL

## URLs After Deploy

- **Frontend**: `https://careerpilot.vercel.app` (or your custom domain)
- **Backend**: `https://careerpilot-production.up.railway.app` (auto-generated)

## Troubleshooting

**CORS Issues:**
Update `backend/main.py` CORS origins with your Vercel URL.

**Build Failures:**
Check Railway/Vercel logs in their dashboards.

**Database:**
Railway provides managed PostgreSQL. Connection string auto-injected as `DATABASE_URL`.
