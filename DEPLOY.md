# Hunt-X Deployment Guide

## Frontend → Vercel

### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Sign up / Login with GitHub
3. Click "Add New Project"

### Step 2: Import Repo
1. Select `jimmyceo/careerpilot` from the list
2. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Environment Variables
Add these (get backend URL after Railway deploy):
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Step 4: Deploy
Click "Deploy" — done! Vercel gives you a URL instantly.

---

## Backend → Railway

### Step 1: Go to Railway
1. Visit https://railway.app
2. Sign up / Login with GitHub
3. Click "New" → "Project" → "Deploy from GitHub repo"

### Step 2: Configure
1. Select `jimmyceo/careerpilot`
2. Railway auto-detects Dockerfile
3. Add PostgreSQL: Click "New" → "Database" → "Add PostgreSQL"

### Step 3: Environment Variables
In Railway dashboard → Variables → "New Variable":
```
DATABASE_URL=${{Postgres.DATABASE_URL}}  (auto-filled after adding DB)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OLLAMA_API_KEY=your_key
OLLAMA_BASE_URL=https://api.ollama.ai/v1
```

### Step 4: Deploy
Railway auto-deploys. Copy the generated URL (e.g., `https://careerpilot-production.up.railway.app`)

---

## Post-Deploy

### Update Frontend
1. Go back to Vercel dashboard
2. Project Settings → Environment Variables
3. Add `NEXT_PUBLIC_API_URL=https://your-railway-url`
4. Redeploy: Click "Redeploy"

### Stripe Webhook
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-railway-url/api/payment/webhook`
3. Select events: `checkout.session.completed`
4. Copy signing secret → add to Railway as `STRIPE_WEBHOOK_SECRET`

---

## Final URLs
- **Frontend**: `https://careerpilot.vercel.app`
- **Backend**: `https://careerpilot-production.up.railway.app`

## Test Flow
1. Open frontend URL
2. Upload resume
3. Enter job description
4. Generate CV
5. Download PDF

Done! 🚀