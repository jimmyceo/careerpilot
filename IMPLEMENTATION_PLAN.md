# Hunt-X Implementation Plan (G3 Spec)

## Priority Order (Vertical Slices)

### Phase 1: Foundation & Safety (Days 1-2)
**Goal:** Fix auth, add tests, secure subscriptions, improve SEO. These are prerequisites for everything else.

| # | Slice | Files | Acceptance Criteria | Tests |
|---|-------|-------|---------------------|-------|
| 1.1 | **Fix auth (done)** | `backend/dependencies.py`, `backend/routers/auth.py` | Register/login work, bcrypt stable | `test_auth.py` passes |
| 1.2 | **Add Remember Me** | `backend/dependencies.py`, `frontend/src/app/auth/page.tsx` | Checkbox extends token expiry to 30 days | Backend test for token expiry |
| 1.3 | **Email verification** | `backend/models/user.py`, `backend/routers/auth.py` | Register sends code, verify endpoint, login blocks unverified | Integration test |
| 1.4 | **Secure subscriptions** | `backend/routers/subscriptions.py` | All endpoints use `get_current_user`, reject foreign user_id | Unit tests |
| 1.5 | **SEO foundation** | `frontend/src/app/layout.tsx`, add `robots.txt`, `sitemap.xml` | Meta per page, OG tags, canonical, schema.org | Lighthouse SEO > 90 |

### Phase 2: Landing + Marketing (Days 2-3)
**Goal:** Glamify landing, update pricing, add feedback system.

| # | Slice | Files | Acceptance Criteria | Tests |
|---|-------|-------|---------------------|-------|
| 2.1 | **Landing Features merge** | `frontend/src/app/page.tsx` | Combined Resume+CV block, Job Evaluation featured, responsive | Visual review |
| 2.2 | **Process section update** | `frontend/src/app/page.tsx` | 3-step: Upload → AI Analyze → Generate CV+Cover | Visual review |
| 2.3 | **Feedback system** | `backend/models/user.py` + new table, `frontend/src/app/page.tsx` | Submit rating+text, admin flag, show approved | Backend test |
| 2.4 | **Pricing rewrite** | `frontend/src/app/pricing/page.tsx`, `backend/models/enums.py` | Basic/Starter/Pro match spec, limits enforced | Unit tests |
| 2.5 | **Priority Support teaser** | `frontend/src/app/pricing/page.tsx` | "$69 Coming Soon" visible, no checkout | Visual review |

### Phase 3: Core UX Improvements (Days 3-4)
**Goal:** Tracker polish, Settings SaaS, My Documents.

| # | Slice | Files | Acceptance Criteria | Tests |
|---|-------|-------|---------------------|-------|
| 3.1 | **Tracker UX polish** | `frontend/src/app/applications/page.tsx` | Fewer clicks to add, quick status update, celebratory states | E2E test |
| 3.2 | **Settings SaaS** | `frontend/src/app/settings/page.tsx` | Tabs: Account, Security, Billing, Preferences, Data | Visual review |
| 3.3 | **My Documents** | New `frontend/src/app/documents/page.tsx`, new backend router | Grouped by company+job, delete works, Pro-only reports | Unit + E2E |
| 3.4 | **Interview Prep polish** | `frontend/src/app/interview/page.tsx` | JD input before generate, Pro voice mock "Coming Soon" | Visual review |

### Phase 4: Profile System (Days 4-5)
**Goal:** Add Profile concept, integrate with existing flows.

| # | Slice | Files | Acceptance Criteria | Tests |
|---|-------|-------|---------------------|-------|
| 4.1 | **Profile model** | `backend/models/profile.py`, migration | Profile has name, target roles, preferences, 1 primary CV | Unit test |
| 4.2 | **Profile API** | `backend/routers/profiles.py` | CRUD profiles, set primary CV, list by user | Integration test |
| 4.3 | **Profile UI** | `frontend/src/app/profile/page.tsx` | Create/select profile, upload CV+JD buttons, action buttons | E2E test |
| 4.4 | **Overview integration** | `frontend/src/app/dashboard/page.tsx` | Show profile switcher, tracker summary, quick actions | Visual review |

### Phase 5: Advanced Features (Days 5-6)
**Goal:** Google OAuth, Resume Roaster, interactive job search.

| # | Slice | Files | Acceptance Criteria | Tests |
|---|-------|-------|---------------------|-------|
| 5.1 | **Google OAuth** | `backend/routers/auth.py`, `frontend/src/app/auth/page.tsx` | Google button, callback, create/link account | Integration test |
| 5.2 | **Resume Roaster** | `backend/routers/roaster.py`, `backend/services/roaster_service.py` | ATS/Impact/Clarity/Formatting scores, tone toggle | Unit test |
| 5.3 | **Roaster UI** | `frontend/src/app/roaster/page.tsx` | Upload CV, get scores, see suggestions, tone selector | E2E test |
| 5.4 | **Job Search interactive** | `frontend/src/app/jobs/page.tsx` | Preference wizard, search, fit check message | E2E test |

---

## Data Model Changes

### New Tables

```sql
-- profiles (Phase 4)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  target_roles JSON DEFAULT '[]',
  preferred_location TEXT,
  min_salary INTEGER,
  remote_preference TEXT DEFAULT 'any',
  primary_resume_id TEXT REFERENCES resumes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- feedback (Phase 2)
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- applications (Phase 3 — backend sync for tracker)
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_id TEXT REFERENCES profiles(id),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  stage TEXT DEFAULT 'applied',
  date TEXT,
  notes TEXT,
  url TEXT,
  salary TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modified Tables

```sql
-- users (Phase 1)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_code TEXT;
ALTER TABLE users ADD COLUMN verification_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN remember_me BOOLEAN DEFAULT FALSE;

-- subscription plans (Phase 2)
-- Update PLAN_CONFIGS in code, no schema change needed
```

---

## Plan Entitlements (Updated)

| Feature | Basic (Free) | Starter ($9/mo) | Pro ($29/mo) |
|---------|--------------|-----------------|--------------|
| Job Scans | 5/mo | 20/mo | Unlimited |
| Evaluations | 3/mo | 5/mo | Unlimited |
| CV Generations | 1/mo | 5/mo | Unlimited |
| Cover Letters | 1/mo | 5/mo | Unlimited |
| Interview Prep | Basic | Basic | Full + mock Qs |
| Resume Roaster | 1/mo | 3/mo | Unlimited |
| Application Tracker | Included | Included | Included |
| My Documents | Basic | Full | Pro reports |
| Priority Support | — | — | "$69 Coming Soon" |

---

## Rollback Plans

| Slice | Rollback | Data Risk |
|-------|----------|-----------|
| 1.1-1.5 | Revert commit | Low (auth only) |
| 2.1-2.5 | Revert commit | Low (landing only) |
| 3.1-3.4 | Revert commit, keep localStorage tracker as fallback | Medium |
| 4.1-4.4 | Revert commit, old dashboard works without profiles | Medium |
| 5.1-5.4 | Revert commit, fallback to email auth | Low |

---

## Testing Strategy

| Layer | Framework | Coverage Target |
|-------|-----------|-----------------|
| Frontend unit | Vitest + React Testing Library | 60% utils, contexts |
| Frontend E2E | Playwright | Auth, dashboard, key flows |
| Backend unit | pytest | 70% services, routers |
| Backend integration | pytest + TestClient | Auth, subscriptions, profiles |

---

## Start Order

1. **Now:** Phase 1.2 (Remember Me) — smallest, highest impact
2. **Then:** Phase 1.4 (Secure subscriptions) — security critical
3. **Then:** Phase 2.4 (Pricing rewrite) — unlocks monetization
4. **Then:** Phase 3.3 (My Documents) — user-requested
5. **Continue:** Remaining slices in priority order
