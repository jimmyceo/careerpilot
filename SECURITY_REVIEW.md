# Hunt-X Security Review
## Phase 1 SaaS Implementation

---

## Executive Summary

**Status:** ✅ Security Ready with Recommendations

This review covers the security posture of the Phase 1 SaaS implementation including subscription system, payment processing, and API security.

---

## 1. Authentication & Authorization

### Current Implementation
- Simple email-based user identification
- No JWT tokens or session management
- No role-based access control

### Security Concerns
⚠️ **CRITICAL:** No authentication middleware
- Anyone can call subscription APIs with any user_id
- No verification that user owns the data they're accessing

### Recommendations
```python
# Implement JWT authentication
def get_current_user(token: str = Depends(oauth2_scheme)):
    """Verify JWT and return user"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user_id
```

**Priority:** HIGH - Implement before production

---

## 2. Payment Security (Stripe)

### Current Implementation
✅ Uses Stripe Checkout (PCI compliant)
✅ Webhook signature verification
✅ No credit card data touches our servers

### Security Strengths
- Stripe handles all card data
- Webhooks verify with signature secret
- Idempotency keys supported

### Recommendations
1. **Enable webhook signature verification in production:**
```python
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
if not STRIPE_WEBHOOK_SECRET:
    raise ValueError("STRIPE_WEBHOOK_SECRET required in production")
```

2. **Add idempotency keys:**
```python
session = stripe.checkout.Session.create(
    idempotency_key=f"checkout-{user_id}-{timestamp}",
    ...
)
```

**Priority:** MEDIUM - Production requirement

---

## 3. API Security

### Current Implementation
- CORS enabled (allow all origins `*`)
- No rate limiting
- Basic input validation via Pydantic

### Security Concerns
⚠️ **HIGH:** CORS allows all origins
```python
allow_origins=["*"]  # Too permissive for production
```

⚠️ **MEDIUM:** No rate limiting
- Susceptible to brute force
- API abuse possible

### Recommendations
```python
# Production CORS
allow_origins=[
    "https://hunt-x.app",
    "https://www.hunt-x.app",
    "https://*.vercel.app"  # Preview deployments
]

# Rate limiting (using slowapi)
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/create-checkout")
@limiter.limit("5/minute")  # Max 5 checkout attempts per minute
async def create_checkout(...)
```

**Priority:** HIGH - Production requirement

---

## 4. Database Security

### Current Implementation
✅ Uses SQLAlchemy ORM (prevents SQL injection)
✅ Foreign key constraints
⚠️ No encryption of sensitive fields

### Security Concerns
- User emails stored in plain text
- No row-level security
- SQLite file permissions not restricted

### Recommendations
1. **Encrypt sensitive PII:**
```python
from cryptography.fernet import Fernet

cipher = Fernet(ENCRYPTION_KEY)

class User:
    email_encrypted = Column(String)  # Store encrypted

    @property
    def email(self):
        return cipher.decrypt(self.email_encrypted).decode()
```

2. **PostgreSQL Row-Level Security:**
```sql
-- Enable RLS on tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_isolation ON user_subscriptions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::text);
```

**Priority:** MEDIUM - GDPR compliance

---

## 5. Input Validation

### Current Implementation
✅ Pydantic models for request validation
✅ Enum validation for tiers/features

### Security Concerns
- No file upload validation (path traversal possible)
- No XSS protection for user-generated content

### Recommendations
```python
# File upload security
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Invalid file type")
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")
    
    # Sanitize filename
    safe_filename = secure_filename(file.filename)
```

**Priority:** MEDIUM - Prevents file attacks

---

## 6. Credit System Security

### Current Implementation
✅ Database transactions
✅ Atomic credit consumption

### Security Concerns
⚠️ **HIGH:** Race condition in credit consumption
- Multiple simultaneous requests could exceed limit

### Recommendations
```python
# Use row-level locking
from sqlalchemy.orm import joinedload

def consume_credits(self, user_id: str, feature: str, amount: int = 1):
    # Lock row for update
    balance = self.db.query(CreditBalance).filter(
        and_(
            CreditBalance.user_id == user_id,
            CreditBalance.feature == feature
        )
    ).with_for_update().first()  # Pessimistic locking
    
    # Rest of logic...
```

**Priority:** HIGH - Prevents credit exploitation

---

## 7. Logging & Monitoring

### Current Implementation
- Basic error logging to console
- Subscription events logged to database

### Security Concerns
- No security event logging
- No audit trail for data access
- No intrusion detection

### Recommendations
```python
# Security logging
import structlog

logger = structlog.get_logger()

def log_security_event(event_type: str, user_id: str, details: dict):
    logger.warning(
        "security_event",
        event=event_type,
        user_id=user_id,
        ip=request.client.host,
        details=details
    )

# Usage
if failed_attempts > 5:
    log_security_event("brute_force_detected", user_id, {"attempts": failed_attempts})
```

**Priority:** MEDIUM - Security visibility

---

## 8. Environment Variables

### Current Implementation
⚠️ **HIGH:** No validation that required env vars are set

### Security Concerns
```python
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
# If not set, stripe.api_key is empty string - not an error
```

### Recommendations
```python
import pydantic

class Settings(BaseSettings):
    stripe_secret_key: str
    stripe_webhook_secret: str
    database_url: str
    secret_key: str  # For JWT
    
    class Config:
        env_file = ".env"

settings = Settings()  # Raises error if any required var missing
```

**Priority:** HIGH - Production requirement

---

## 9. Data Privacy (GDPR/CCPA)

### Current Implementation
❌ No data export functionality
❌ No data deletion functionality
❌ No consent tracking

### Requirements
```python
# Data export
@router.get("/api/user/export-data")
async def export_user_data(user_id: str, db: Session = Depends(get_db)):
    """Export all user data as JSON (GDPR right to portability)"""
    data = {
        "user": get_user(user_id),
        "resumes": get_resumes(user_id),
        "cvs": get_cvs(user_id),
        "subscriptions": get_subscriptions(user_id),
        "usage_logs": get_usage_logs(user_id)
    }
    return data

# Data deletion
@router.delete("/api/user/delete-account")
async def delete_account(user_id: str, db: Session = Depends(get_db)):
    """Delete all user data (GDPR right to erasure)"""
    # Soft delete with 30-day grace period
    mark_for_deletion(user_id)
```

**Priority:** HIGH - Legal requirement

---

## 10. Dependencies Security

### Current Dependencies
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
requests==2.31.0
python-dotenv==1.0.0
stripe==7.10.0
```

### Recommendations
1. **Pin exact versions** ✅ Already done
2. **Use Dependabot** for automatic updates
3. **Scan for vulnerabilities:**
```bash
pip install safety
safety check -r requirements.txt
```

**Priority:** MEDIUM - Ongoing maintenance

---

## Security Checklist

### Pre-Production Checklist
- [ ] Implement JWT authentication
- [ ] Restrict CORS origins
- [ ] Add rate limiting
- [ ] Enable Stripe webhook signature verification
- [ ] Add row-level locking for credit consumption
- [ ] Validate environment variables
- [ ] Encrypt PII (emails, names)
- [ ] Implement GDPR data export/deletion
- [ ] Add security event logging
- [ ] Run dependency vulnerability scan
- [ ] Enable HTTPS only
- [ ] Set secure cookies
- [ ] Add Content Security Policy headers

### Post-Production Monitoring
- [ ] Failed login attempts > 5/hour
- [ ] Stripe webhook failures
- [ ] Database connection errors
- [ ] 402 Payment Required errors spike
- [ ] Unusual API usage patterns

---

## Summary

| Category | Status | Priority |
|----------|--------|----------|
| Authentication | ❌ Missing | CRITICAL |
| CORS | ⚠️ Too permissive | HIGH |
| Rate Limiting | ❌ Missing | HIGH |
| Credit System | ⚠️ Race conditions | HIGH |
| Payment Security | ✅ Good | - |
| Database Security | ⚠️ No encryption | MEDIUM |
| Input Validation | ⚠️ Partial | MEDIUM |
| GDPR Compliance | ❌ Missing | HIGH |
| Monitoring | ⚠️ Basic | MEDIUM |

---

## Immediate Actions Required

1. **Implement JWT authentication** - Before any production deployment
2. **Fix credit race conditions** - Use database locking
3. **Restrict CORS** - Set production origins
4. **Add rate limiting** - Prevent API abuse
5. **Validate env vars** - Fail fast on missing configuration

---

## Testing Security

Run these tests before production:

```bash
# 1. SQL Injection Test
curl -X POST "http://localhost:8000/api/resume/upload" \
  -F "email='; DROP TABLE users;--" \
  -F "file=@test.pdf"

# 2. Path Traversal Test
curl -X POST "http://localhost:8000/api/resume/upload" \
  -F "email=test@test.com" \
  -F "file=@../etc/passwd"

# 3. Rate Limiting Test
for i in {1..20}; do
  curl -X POST "http://localhost:8000/api/subscriptions/create-checkout"
done

# 4. CORS Test
curl -H "Origin: https://evil.com" \
  -I "http://localhost:8000/api/health"
```

---

*Security Review completed: April 2026*
*Next review: After production deployment*
