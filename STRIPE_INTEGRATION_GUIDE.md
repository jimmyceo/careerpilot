# Hunt-X Stripe Integration Checklist
## Complete Setup Guide

---

## Overview

The backend code is ready for Stripe integration. You just need to configure your Stripe account and add the API keys. This guide covers everything needed to go from zero to accepting payments.

---

## Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Complete registration
3. Verify email
4. Complete business profile (can be individual/sole proprietor for now)

### 1.2 Switch to Test Mode
1. In Stripe Dashboard, toggle "Test mode" ON (top right)
2. All operations will use test data (no real charges)

---

## Step 2: Create Products & Prices

### 2.1 Create Products
In Stripe Dashboard, go to **Products** → **Add product**

Create these 3 products:

| Product Name | Description | Price Type |
|--------------|-------------|------------|
| **Hunt-X Starter** | 10 CV generations/month, full analysis | Recurring |
| **Hunt-X Pro** | Unlimited CVs, cover letters, interview prep | Recurring |
| **Hunt-X Team** | Client management, white-label, team collaboration | Recurring |

### 2.2 Add Pricing
For each product, add pricing:

**Starter Plan:**
- Price: €9.00
- Billing period: Monthly
- Currency: EUR

**Pro Plan:**
- Price: €29.00
- Billing period: Monthly
- Currency: EUR

**Team Plan:**
- Price: €49.00
- Billing period: Monthly
- Currency: EUR
- Per seat: Yes (if supported in your Stripe version)

**Optional - Annual Discounts:**
- Starter: €90/year (2 months free)
- Pro: €290/year (2 months free)
- Team: €490/year (2 months free)

---

## Step 3: Get API Keys

### 3.1 Secret Key (Backend)
1. Go to **Developers** → **API keys**
2. Copy **Secret key** (starts with `sk_test_` for test mode)
3. Store securely - this is for backend only!

### 3.2 Publishable Key (Frontend - Optional)
If you want to use Stripe Elements later:
1. Copy **Publishable key** (starts with `pk_test_`)
2. This goes in frontend env vars

---

## Step 4: Configure Webhook

### 4.1 Add Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/subscriptions/webhook`
   - For local testing: `https://ngrok-url.ngrok.io/api/subscriptions/webhook`
4. Description: "Hunt-X Subscription Events"

### 4.2 Select Events to Listen For
Check these events:
- ✅ `checkout.session.completed`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.created`

### 4.3 Get Webhook Secret
1. After creating endpoint, click **Reveal** under "Signing secret"
2. Copy the secret (starts with `whsec_`)
3. This is your `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Environment Variables

### 5.1 Create .env File
Create `/Users/tanvir/Hunt-X/backend/.env`:

```bash
# Required for Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional - for redirect URLs
STRIPE_SUCCESS_URL=https://hunt-x.app/dashboard?payment=success
STRIPE_CANCEL_URL=https://hunt-x.app/pricing?cancelled

# Existing variables
DATABASE_URL=sqlite:///./hunt_x.db
OLLAMA_API_KEY=your_key
OLLAMA_BASE_URL=https://api.ollama.ai/v1
```

### 5.2 Load Environment Variables
Make sure your backend loads the .env file. In `main.py`, add at the top:

```python
from dotenv import load_dotenv
load_dotenv()  # This loads variables from .env file
```

---

## Step 6: Test the Integration

### 6.1 Start Backend
```bash
cd /Users/tanvir/Hunt-X/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 6.2 Initialize Plans
```bash
curl -X POST http://localhost:8000/api/subscriptions/initialize
# Should return: {"status": "success", "message": "Plans initialized"}
```

### 6.3 Create Test Checkout
```bash
curl -X POST http://localhost:8000/api/subscriptions/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "starter",
    "user_id": "test-user-123",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "checkout_url": "https://checkout.stripe.com/c/pay/...",
  "session_id": "cs_test_..."
}
```

### 6.4 Complete Test Payment
1. Open the `checkout_url` in browser
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiry date (e.g., 12/25)
4. Any CVC (e.g., 123)
5. Complete payment

### 6.5 Verify Webhook Received
Check your backend logs - you should see webhook events processed.

### 6.6 Verify Subscription
```bash
curl 'http://localhost:8000/api/subscriptions/current?user_id=test-user-123'
```

Should show:
```json
{
  "status": "success",
  "subscription": {
    "status": "active",
    "plan": {
      "tier": "starter",
      "name": "Starter"
    }
  }
}
```

---

## Step 7: Test Credit System

### 7.1 Check Credits
```bash
curl 'http://localhost:8000/api/subscriptions/usage?user_id=test-user-123'
```

### 7.2 Consume a Credit
```bash
curl -X POST http://localhost:8000/api/subscriptions/consume-feature \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "feature": "cv.generate",
    "amount": 1
  }'
```

### 7.3 Verify Credit Deducted
Run step 7.1 again - credits_used should have increased by 1.

---

## Step 8: Frontend Integration

### 8.1 Add Stripe.js (Optional)
If you want to use Stripe Elements for custom checkout:

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 8.2 Update API Client
Add to `/frontend/src/lib/api.ts`:

```typescript
async createCheckout(tier: string, email: string) {
  const res = await fetch(`${API_BASE_URL}/api/subscriptions/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, user_id: email, email }),
  });
  return res.json();
}
```

### 8.3 Connect Pricing Page Buttons
In the pricing page, update the CTA buttons:

```typescript
const handleSubscribe = async (tier: string) => {
  if (tier === 'free') {
    router.push('/upload');
    return;
  }
  
  const { checkout_url } = await apiClient.createCheckout(tier, userEmail);
  if (checkout_url) {
    window.location.href = checkout_url; // Redirect to Stripe Checkout
  }
};
```

---

## Step 9: Production Deployment

### 9.1 Switch to Production Mode
1. In Stripe Dashboard, toggle "Test mode" OFF
2. Get production keys (start with `sk_live_` and `pk_live_`)
3. Update `.env` with production keys

### 9.2 Update Webhook URL
1. In Stripe Dashboard, edit webhook endpoint
2. Change URL from `localhost` to your production domain
3. Get new webhook secret for production

### 9.3 Required Production Checklist
- [ ] SSL certificate installed (HTTPS only)
- [ ] Production Stripe keys configured
- [ ] Webhook URL updated to production domain
- [ ] Webhook secret updated
- [ ] Success/Cancel URLs point to production domain
- [ ] Database backed up
- [ ] Error monitoring configured (Sentry recommended)

---

## Step 10: Testing Production

### 10.1 Use Real Card (Small Amount)
Use actual card for €1 test:
- Card: Your real card number
- Will charge real money (small test amount)
- Refund immediately after test

### 10.2 Verify End-to-End Flow
1. Click pricing page CTA
2. Complete Stripe Checkout
3. Return to dashboard
4. Verify subscription is active
5. Test feature access (e.g., generate CV)
6. Verify credits deducted
7. Check Stripe Dashboard for successful payment

---

## Common Issues & Solutions

### Issue: "No such plan" error
**Cause:** Plans not initialized in database
**Fix:**
```bash
curl -X POST http://localhost:8000/api/subscriptions/initialize
```

### Issue: Webhook not receiving events
**Cause:** URL not accessible from internet
**Fix:**
- For local testing: Use ngrok
  ```bash
  ngrok http 8000
  # Update webhook URL with ngrok URL
  ```
- For production: Ensure server is publicly accessible

### Issue: "Invalid signature" webhook error
**Cause:** Wrong webhook secret
**Fix:**
- Copy exact webhook secret from Stripe Dashboard
- No extra spaces or newlines
- Different secrets for test vs production

### Issue: Checkout redirects to wrong URL
**Cause:** success_url/cancel_url hardcoded
**Fix:**
Update in `routers/subscriptions.py`:
```python
success_url=os.getenv('STRIPE_SUCCESS_URL', 'http://localhost:3000/dashboard?payment=success'),
cancel_url=os.getenv('STRIPE_CANCEL_URL', 'http://localhost:3000/pricing?cancelled'),
```

### Issue: Credits not resetting monthly
**Cause:** No automated job to reset credits
**Fix:**
Set up a cron job or scheduled task:
```python
# Run this daily
@app.get("/api/admin/reset-credits")
async def reset_monthly_credits(db: Session = Depends(get_db)):
    service = SubscriptionService(db)
    # Logic to reset expired credits
```

---

## Files That Need Your Input

### 1. `/Users/tanvir/Hunt-X/backend/.env`
Add these variables:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. `/Users/tanvir/Hunt-X/backend/routers/subscriptions.py`
Lines 50-70: Update success/cancel URLs if needed (currently hardcoded to hunt-x.app)

### 3. `/Users/tanvir/Hunt-X/frontend/src/app/pricing/page.tsx`
Connect CTA buttons to backend API (see Step 8)

---

## Testing Checklist

Before going live, verify:

- [ ] Test card `4242 4242 4242 4242` works
- [ ] Subscription created after payment
- [ ] Credits initialized correctly
- [ ] Webhook events received
- [ ] Subscription status updates correctly
- [ ] Credit consumption works
- [ ] Upgrade from Free → Starter works
- [ ] Upgrade from Starter → Pro works
- [ ] Cancel subscription works
- [ ] Refund process tested (if needed)

---

## Going Live Checklist

- [ ] Stripe account verified (business documents submitted)
- [ ] Production keys obtained
- [ ] Webhook configured for production URL
- [ ] Success/Cancel URLs use production domain
- [ ] Terms of Service page exists
- [ ] Privacy Policy page exists
- [ ] Refund policy defined
- [ ] Customer support email configured
- [ ] Stripe account settings complete
- [ ] Tested with real card (small amount)

---

## Support

**Stripe Documentation:**
- https://stripe.com/docs/testing
- https://stripe.com/docs/webhooks

**Hunt-X Code Reference:**
- Subscription API: `/backend/routers/subscriptions.py`
- Service Logic: `/backend/services/subscription_service.py`
- Webhook Handler: Lines 170-220 in subscription_service.py

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3DS: `4000 0025 0000 3155`

---

**Estimated Time:** 2-3 hours for complete setup
**Difficulty:** Medium (mostly Stripe dashboard configuration)

Good luck with the integration! 🚀
