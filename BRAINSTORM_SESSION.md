# Hunt-X Phase 1 Implementation Brainstorm
## Building the SaaS Foundation

---

## Big Picture Vision

### What We're Building (Phase 1 Scope)
A subscription-ready job search platform with:
- 4-tier pricing (Free → Starter → Pro → Team)
- Usage tracking and enforcement
- Credit-based system for free tier
- Beautiful, conversion-optimized UI
- Robust backend with proper abstractions

### Architecture Decisions

**Backend Philosophy:**
- Repository pattern for database operations
- Service layer for business logic
- Clear separation: routes → services → repositories
- Dependency injection for testability
- Event-driven for future extensibility

**Frontend Philosophy:**
- "Career Command Center" aesthetic
- Dark mode by default (reduces eye strain)
- Data-dense, dashboard-first design
- Micro-interactions for delight
- Mobile-responsive (job seekers apply on-the-go)

**Database Philosophy:**
- PostgreSQL for production (SQLite for dev)
- Proper migrations (Alembic)
- Indexes on frequently queried columns
- JSONB for flexible metadata
- Audit logs for compliance

---

## System Components

### 1. Subscription System

**Tiers:**
```
┌────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION TIERS                       │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│    Free     │   Starter   │     Pro     │      Team        │
│    €0       │    €9/mo    │   €29/mo    │   €49/user/mo    │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ 1 CV/mo     │ 10 CV/mo    │ Unlimited   │ Unlimited        │
│ 2 resumes   │ 10 resumes  │ Unlimited   │ Unlimited        │
│ Watermarked │ No watermarks│ No watermarks│ White-label     │
│ Basic analysis│ Full analysis│ + Cover letters│ + Client mgmt│
│             │             │ + Interview AI│ + Team collab    │
│             │             │ + Analytics │ + Admin panel    │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

**Key Entities:**
- `SubscriptionPlan` - Static plan definitions
- `UserSubscription` - User's current subscription state
- `UsageCredit` - Track feature usage
- `SubscriptionEvent` - Audit log (created, upgraded, cancelled)

### 2. Usage Tracking System

**Features to Track:**
- `cv.generate` - CV generation
- `resume.upload` - Resume upload
- `resume.analyze` - AI analysis
- `cover_letter.generate` - Cover letter
- `api.request` - API calls

**Enforcement Strategy:**
- Soft limits: Warning at 80%, paywall at 100%
- Hard limits: Block feature entirely
- Roll-over: Unused credits expire monthly
- Bonus: Complete profile = +5 credits

### 3. Frontend Components

**Pages:**
1. `/pricing` - Conversion-focused pricing page
2. `/dashboard` - Command center with stats
3. `/subscribe` - Checkout flow
4. `/upgrade` - Plan comparison
5. `/billing` - Manage subscription

**Components:**
- `<PricingCard />` - Animated tier cards
- `<CreditIndicator />` - Usage display in navbar
- `<PaywallModal />` - Upgrade prompt
- `<FeatureGate />` - Hides/shows based on tier
- `<UsageBar />` - Visual credit consumption

### 4. API Design

**Subscription Endpoints:**
```
GET  /api/subscriptions/plans           # List all plans
GET  /api/subscriptions/current         # User's current sub
POST /api/subscriptions/create          # Create checkout session
POST /api/subscriptions/webhook          # Stripe webhooks
POST /api/subscriptions/cancel           # Cancel subscription
POST /api/subscriptions/upgrade          # Change plan
GET  /api/subscriptions/usage            # Get usage stats
```

**Protected Endpoints (with limits):**
```
POST /api/cv/generate          # Requires: cv.generate credit
POST /api/resume/upload        # Requires: resume.upload credit
POST /api/cover-letter/generate # Requires: cover_letter credit
```

---

## Database Schema

### Tables

```sql
-- subscription_plans (static data)
id, name, slug, description, price_monthly_cents, price_yearly_cents,
features[], limits{}, is_active, created_at

-- user_subscriptions (user's subscription state)
id, user_id, plan_id, stripe_subscription_id, status,
current_period_start, current_period_end, cancel_at_period_end,
created_at, updated_at

-- usage_logs (audit trail)
id, user_id, feature, credits_used, metadata{}, created_at

-- credit_balances (current month)
user_id, feature, credits_remaining, credits_total, reset_date

-- subscription_events (audit)
id, user_id, event_type, plan_id, metadata{}, created_at
```

### Indexes
```sql
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_usage_logs_user_feature ON usage_logs(user_id, feature);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX idx_credit_balances_user ON credit_balances(user_id);
```

---

## Frontend Design Direction

### Aesthetic: "Midnight Command Center"

**Color Palette:**
```css
--bg-primary: #0a0a0f;        /* Deepest black-blue */
--bg-secondary: #12121a;      /* Elevated surfaces */
--bg-tertiary: #1a1a25;       /* Interactive elements */
--accent-primary: #6366f1;    /* Indigo - primary action */
--accent-secondary: #22d3ee;  /* Cyan - secondary */
--accent-success: #10b981;    /* Emerald - success */
--accent-warning: #f59e0b;    /* Amber - warning */
--accent-error: #ef4444;      /* Red - error */
--text-primary: #f8fafc;      /* White - primary text */
--text-secondary: #94a3b8;  /* Slate - secondary text */
--text-muted: #64748b;        /* Muted text */
```

**Typography:**
- Display: "Space Grotesk" or "Clash Display" - geometric, modern
- Body: "Inter" or "Satoshi" - clean, readable
- Mono: "JetBrains Mono" - code/numbers

**Motion Philosophy:**
- Page load: Staggered reveal (50ms delays)
- Hover states: Scale + glow, not just color
- Credit updates: Animated counter (odometer effect)
- Progress bars: Smooth fill with shimmer
- Modals: Scale in + backdrop blur

**Key Interactions:**
- Pricing toggle: Monthly/Annual with morphing animation
- Credit warning: Pulse animation at < 20%
- Upgrade button: Gradient shimmer on hover
- Paywall: Blur background content, focus on CTA

---

## Backend Architecture

### Layer Structure
```
routes/
├── subscriptions.py        # HTTP handlers
├── usage.py               # Usage endpoints
└── webhooks.py            # Stripe webhooks

services/
├── subscription_service.py  # Business logic
├── usage_service.py       # Credit management
├── stripe_service.py      # Payment processing
└── notification_service.py # Emails/alerts

repositories/
├── subscription_repo.py   # Database operations
├── usage_repo.py          # Usage queries
└── user_repo.py           # User queries

models/
├── subscription.py          # SQLAlchemy models
├── usage.py               # Usage models
└── enums.py               # Constants/enums

middleware/
├── auth.py                # Authentication
├── subscription.py         # Subscription checking
└── rate_limit.py          # API rate limiting

lib/
├── stripe_client.py       # Stripe SDK wrapper
├── email_client.py        # SendGrid/Resend
└── cache.py               # Redis cache
```

### Key Abstractions

**SubscriptionService:**
```python
class SubscriptionService:
    async def create_subscription(user_id, plan_id, payment_method)
    async def cancel_subscription(user_id, at_period_end)
    async def upgrade_subscription(user_id, new_plan_id)
    async def get_current_subscription(user_id)
    async def check_feature_access(user_id, feature)
```

**UsageService:**
```python
class UsageService:
    async def consume_credit(user_id, feature, amount=1)
    async def get_credit_balance(user_id, feature)
    async def reset_monthly_credits()
    async def get_usage_history(user_id, days=30)
    async def get_usage_stats(user_id)
```

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with 15-min expiry
- Refresh tokens with 7-day expiry
- Role-based access (user, admin, superadmin)
- Feature flags per subscription tier
- API rate limiting per tier

### Payment Security
- Stripe Checkout (PCI compliant, we never touch cards)
- Webhook signature verification
- Idempotency keys for payments
- Idempotent usage tracking

### Data Protection
- Encrypt sensitive fields (PII)
- Row-level security in DB
- Audit logs for all subscription changes
- GDPR-compliant data export/deletion

### API Security
- Input validation (Pydantic)
- SQL injection prevention (SQLAlchemy ORM)
- XSS prevention (React escapes by default)
- CSRF tokens for mutations
- CORS configured properly

---

## Testing Strategy

### Unit Tests
- Service layer (business logic)
- Repository layer (database queries)
- Utility functions

### Integration Tests
- API endpoints (FastAPI TestClient)
- Database migrations
- Stripe webhook handlers

### E2E Tests
- User signup flow
- Subscription upgrade flow
- Paywall behavior
- Credit consumption

### Load Tests
- 1000 concurrent users
- Stripe webhook burst handling
- Database connection pooling

---

## Implementation Order

### Week 1: Backend Foundation
Day 1-2: Database schema + migrations
Day 3-4: Models + Repositories
Day 5-7: Services + Business logic

### Week 2: Frontend + Integration
Day 8-10: Pricing page + components
Day 11-12: Dashboard + credit indicators
Day 13-14: Paywall + feature gates + testing

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stripe integration complexity | Use Stripe Checkout (hosted), not Elements |
| Race conditions in credit system | Database transactions + row locking |
| Webhook failures | Idempotency keys + retry logic |
| Frontend performance | Code splitting, lazy loading |
| Database migrations | Alembic with rollback scripts |

---

## Success Metrics for Phase 1

**Technical:**
- [ ] All 4 tiers functional
- [ ] Credit system working accurately
- [ ] Zero race conditions in usage tracking
- [ ] Stripe webhooks 100% reliable
- [ ] Page load < 2 seconds
- [ ] API response < 200ms

**Business:**
- [ ] User can upgrade in < 3 clicks
- [ ] Paywall converts > 5% of free users
- [ ] Checkout completion > 70%
- [ ] No billing-related support tickets

---

## Ready to Execute

This brainstorm maps the entire Phase 1 implementation. The architecture supports future phases (application pipeline, AI features, etc.) while delivering immediate SaaS capability.

**Next:** Start implementation with database schema.
