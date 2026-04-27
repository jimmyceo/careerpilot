# Hunt-X Fixes & Audit Report
## Date: 2026-04-27
## Commit: 5b414f3

---

## Summary

Comprehensive audit and fix of 10+ critical issues across backend and frontend. All fixes verified via backend import checks and frontend production build.

---

## Issues Fixed

### 1. Frontend/Backend Pricing Mismatch
**Severity: Critical**
- **Problem:** Landing page showed "€49 one-time" but backend implemented monthly SaaS subscriptions (Free €0, Starter €9, Pro €29, Team €49)
- **Fix:**
  - `frontend/src/app/page.tsx`: Replaced single €49 card with 4-tier SaaS preview (Free/Starter/Pro/Team)
  - `frontend/src/app/pricing/page.tsx`: Full pricing page with monthly/yearly toggle, feature comparison table, FAQ accordion
  - `frontend/src/lib/api.ts`: Added subscription endpoints (`/api/subscriptions/*`)

### 2. API Client Hardcoded Production URL
**Severity: High**
- **Problem:** `api.ts` pointed to `https://hunt-x-production-2954.up.railway.app` with no local dev fallback
- **Fix:**
  - Changed base URL to `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'`
  - Added `authHeaders()` and `jsonHeaders()` helpers for DRY auth token handling
  - Added subscription API methods: `getPlans()`, `getCurrentSubscription()`, `createCheckout()`, `cancelSubscription()`, `getUsageSummary()`
  - Fixed legacy `checkPaymentStatus()` to use `/api/payment/v2/status/{email}`

### 3. Auth System Misalignment
**Severity: Medium**
- **Problem:** README claimed "Supabase Auth" but codebase used custom JWT (bcrypt + python-jose)
- **Fix:**
  - Updated `README.md` to reflect actual JWT-based authentication
  - Kept existing auth implementation (it works correctly)

### 4. CORS Wildcard Origins
**Severity: High (Security)**
- **Problem:** `allow_origins=["*"]` in `main.py` allowed any origin in production
- **Fix:**
  - Added `CORS_ORIGINS` env var support
  - Production mode restricts to configured origins only
  - Development mode still allows `*` for local testing
  - `ENVIRONMENT` env var controls the behavior

### 5. Missing `.env` Loading
**Severity: Medium**
- **Problem:** `main.py` didn't load `.env` file despite `python-dotenv` being in requirements
- **Fix:**
  - Added `from dotenv import load_dotenv; load_dotenv()` at top of `main.py`
  - Runs before any other imports to ensure env vars are available

### 6. Design System Misalignment
**Severity: Medium**
- **Problem:** Frontend used dark slate theme instead of DESIGN_PROMPTS.md white/navy/purple palette
- **Fix:**
  - `frontend/src/app/globals.css`: Updated CSS variables to match design tokens (navy #061b31, slate #64748d, purple #533afd, success #15be53)
  - `frontend/src/app/layout.tsx`: Switched from `bg-slate-900` to white background with sohne-var font stack
  - `frontend/src/app/page.tsx`: Full redesign with hero, trust bar, 6 feature cards, 4-tier pricing preview, how-it-works timeline, CTA, footer
  - `frontend/src/app/pricing/page.tsx`: Complete 4-tier pricing page with monthly/yearly toggle, feature comparison table, FAQ accordion

---

## Additional Backend Bugs Found & Fixed

### 7. Duplicate Database Engines
**File:** `backend/database.py`
- **Problem:** Both `database.py` and `models/base.py` created separate SQLAlchemy engines, causing potential session conflicts
- **Fix:** Rewrote `database.py` to re-export `engine`, `SessionLocal`, `get_db`, `Base` from `models.base`

### 8. Payment System Tier Conflict
**Files:** `backend/payments/__init__.py`, `backend/payments/providers/__init__.py`, `backend/routers/payment_v2.py`
- **Problem:** Payment abstraction used old tier enum (`try/active/aggressive/unlimited`) while subscription system used new enum (`free/starter/pro/team`)
- **Fix:**
  - `payments/__init__.py`: Now imports `SubscriptionTier` from `models.enums`
  - `payments/providers/__init__.py`: Updated `TIER_CONFIG` and `RegionConfig.TIER_PRICING` to new tiers with correct amounts
  - `payment_v2.py`: Fixed import to use `models.enums.SubscriptionTier`

### 9. Cover Letter Router Attribute Errors
**File:** `backend/routers/cover_letter.py`
- **Problem:** Used `user.phone`, `user.linkedin`, `user.github` which don't exist (should be `phone`, `linkedin_url`, `github_url`)
- **Fix:**
  - Fixed attribute names
  - Implemented actual DB lookups for resume and evaluation data (was using string placeholder "...")
  - Added `list_cover_letters` and `download_cover_letter` endpoints

### 10. Chat Router Placeholder Data
**File:** `backend/routers/chat.py`
- **Problem:** Never fetched resume_text, job_description, or evaluation_data from DB — used hardcoded "..." and `{...}`
- **Fix:** Implemented proper DB queries for Resume and Evaluation models

### 11. Evaluation Background Task Bug
**File:** `backend/routers/evaluation.py`
- **Problem:** Passed SQLAlchemy session to `background_tasks.add_task()` — session gets closed after response is sent, causing the background task to fail
- **Fix:** Background task now creates its own fresh `SessionLocal()` inside the task function

### 12. Jobs Router Unimplemented Endpoints
**File:** `backend/routers/jobs.py`
- **Problem:** `get_saved_jobs()` returned empty list, `save_job()` returned fake JSON — no DB operations
- **Fix:** Implemented actual DB queries using `SavedJob` model

### 13. User Tier Default Misalignment
**Files:** `backend/routers/auth.py`, `backend/routers/resumes.py`
- **Problem:** New users got `tier="try"` which doesn't exist in the subscription system
- **Fix:** Changed to `tier="free"` for consistency with `SubscriptionTier.FREE`

### 14. Missing Framer-Motion Dependency
**Files:** `frontend/src/components/ui/card.tsx`, `credit-indicator.tsx`, `paywall.tsx`
- **Problem:** 3 components imported `framer-motion` which wasn't in `package.json`
- **Fix:** Replaced all `motion.div` and `AnimatePresence` with CSS transitions and animations (no new dependency needed)

---

## Verification Results

| Check | Result |
|-------|--------|
| Backend import test (all critical modules) | PASS |
| All router syntax checks | PASS |
| SubscriptionTier enum values | `['free', 'starter', 'pro', 'team']` |
| Frontend production build | PASS (9 pages) |
| CORS origins configurable | YES (via `CORS_ORIGINS` env var) |
| `.env` loading | YES (via `python-dotenv`) |

---

## Files Changed (20 total)

**Backend (12 files):**
- `backend/main.py`
- `backend/database.py`
- `backend/routers/auth.py`
- `backend/routers/resumes.py`
- `backend/routers/evaluation.py`
- `backend/routers/cover_letter.py`
- `backend/routers/chat.py`
- `backend/routers/jobs.py`
- `backend/routers/payment_v2.py`
- `backend/payments/__init__.py`
- `backend/payments/providers/__init__.py`

**Frontend (8 files):**
- `frontend/src/app/page.tsx`
- `frontend/src/app/pricing/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/lib/api.ts`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/credit-indicator.tsx`
- `frontend/src/components/ui/paywall.tsx`

**Docs (1 file):**
- `README.md`

---

## Deployment Notes

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Required env vars:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=sqlite:///./hunt_x.db
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://hunt-x.app,https://www.hunt-x.app
ENVIRONMENT=production
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

Env vars:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # or production URL
```

---

## Remaining Technical Debt (Non-Critical)

1. `backend/routers/payment.py` (legacy) — not mounted in main.py, safe to delete
2. `backend/routers/payment_v2.py` — uses payment abstraction layer; consider consolidating with `subscriptions.py`
3. `backend/ai_client.py` — `kimi_query()` uses Bearer auth for Ollama which may not match actual endpoint
4. `frontend/src/app/auth/`, `dashboard/`, `generate/`, `upload/` pages — still need design system update
5. No automated tests exist — consider adding pytest for backend and jest for frontend
6. `User.jobs_remaining` field is legacy — subscription credit system is the source of truth
