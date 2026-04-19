# Railway Setup (One-Time)

## Step 1: Create Project
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `jimmyceo/Hunt-X`
4. Railway will auto-detect the Dockerfile

## Step 2: Add PostgreSQL
1. In Railway dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. This auto-injects `DATABASE_URL` into your project

## Step 3: Add Environment Variables
In Railway dashboard → Project Settings → Variables:
- `STRIPE_SECRET_KEY` = your Stripe secret
- `STRIPE_WEBHOOK_SECRET` = your Stripe webhook secret
- `OLLAMA_API_KEY` = from your .env
- `OLLAMA_BASE_URL` = from your .env

## Step 4: Deploy
Railway auto-deploys on push to main.

## Step 5: Connect Frontend
Copy your Railway URL (e.g., `https://hunt-x-production.up.railway.app`)
Add to GitHub Secret:
- `NEXT_PUBLIC_API_URL` = your Railway URL

Done! Every push to main auto-deploys.
