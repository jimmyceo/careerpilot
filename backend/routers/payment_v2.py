"""
import logging
Unified Payment Router v2

Refactored payment endpoints using the provider abstraction.
This replaces routers/payment.py with a cleaner, extensible design.

To add a new provider:
1. Implement PaymentProvider in payments/providers/
2. Add to PaymentRouter.PROVIDER_MAP
3. Update RegionConfig.REGION_MAP
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from database import get_db
from models import User
from dependencies import get_current_user
from payments import PaymentRouter, PaymentError
from payments.providers import StripeProvider
from models.enums import SubscriptionTier

def create_stripe_provider(db):
    """Create Stripe provider with config from environment"""
    import os
    config = {
        "api_key": os.getenv("STRIPE_SECRET_KEY"),
        "webhook_secret": os.getenv("STRIPE_WEBHOOK_SECRET"),
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY"),
    }
    return StripeProvider(db, config)
from services.subscription_service import SubscriptionService

router = APIRouter(prefix="/api/payment/v2", tags=["payment"])


# ============ Request/Response Models ============

class CheckoutRequest(BaseModel):
    tier: str  # 'try', 'active', 'aggressive', 'unlimited'
    country_override: Optional[str] = None  # e.g., 'IN', 'BD', 'US'


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    provider: str
    region: str
    pricing: dict


class PaymentStatusResponse(BaseModel):
    tier: str
    status: str
    is_active: bool
    current_period_end: Optional[str]
    cancel_at_period_end: bool
    credits_remaining: dict


class WebhookResponse(BaseModel):
    status: str
    event_type: Optional[str] = None


# ============ Checkout Endpoints ============

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # You'll need to implement this
):
    """
    Create checkout session with automatic provider selection.

    Automatically routes to appropriate provider based on user's region.
    Can be overridden with country_override parameter.
    """

    try:
        tier = SubscriptionTier(request.tier)
    except ValueError:
        raise HTTPException(400, detail="Invalid tier")

    # Get client IP for geolocation
    client_ip = request.client.host if request.client else None

    # Create payment router
    payment_router = PaymentRouter(db)

    try:
        result = await payment_router.route_checkout_request(
            user_id=str(current_user.id),
            tier=tier,
            ip_address=client_ip,
            country_override=request.country_override
        )

        return CheckoutResponse(
            checkout_url=result["checkout_url"],
            session_id=result["session_id"],
            provider=result["provider_type"],
            region=result["region"],
            pricing=result["pricing"]
        )

    except PaymentError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Payment creation failed: {str(e)}")


@router.get("/config")
async def get_payment_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get payment configuration for frontend.

    Returns:
    - Available providers for user's region
    - Stripe publishable key (if applicable)
    - Regional pricing
    """

    # Get user's region (from IP or preference)
    # For now, return global config
    region = "default"

    from payments import RegionConfig

    pricing = {}
    for tier in SubscriptionTier:
        pricing[tier.value] = RegionConfig.get_pricing(region, tier)

    return {
        "region": region,
        "currency": "eur",
        "providers": ["stripe"],  # Extend as you add providers
        "stripe_publishable_key": get_stripe_publishable_key(),
        "pricing": pricing
    }


def get_stripe_publishable_key() -> Optional[str]:
    """Get Stripe publishable key for frontend"""
    import os
    return os.getenv("STRIPE_PUBLISHABLE_KEY")


# ============ Billing Portal ============

@router.post("/portal")
async def create_billing_portal(
    return_url: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create Stripe Customer Portal session.

    User can manage payment methods, view invoices, cancel subscription.
    """

    stripe_provider = create_stripe_provider(db)

    portal_url = await stripe_provider.create_portal_session(
        user_id=str(current_user.id),
        return_url=return_url
    )

    if not portal_url:
        raise HTTPException(400, detail="No active subscription found")

    return {"portal_url": portal_url}


# ============ Subscription Status ============

@router.get("/status", response_model=PaymentStatusResponse)
async def get_payment_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's current subscription status and credits"""

    sub_service = SubscriptionService(db)

    # Get subscription
    subscription = sub_service.get_or_create_subscription(str(current_user.id))

    # Get credit summary
    credit_summary = sub_service.get_credit_summary(str(current_user.id))

    # Extract credits by feature type
    credits = {}
    for feature in credit_summary.get("features", []):
        credits[feature["feature"]] = feature["remaining"]

    return PaymentStatusResponse(
        tier=subscription.get("plan", {}).get("tier", "try"),
        status=subscription.get("status", "incomplete"),
        is_active=subscription.get("status") in ["active", "trialing"],
        current_period_end=subscription.get("current_period_end"),
        cancel_at_period_end=subscription.get("cancel_at_period_end", False),
        credits_remaining=credits
    )


@router.post("/cancel")
async def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel subscription at period end"""

    sub_service = SubscriptionService(db)

    try:
        result = sub_service.cancel_subscription(
            user_id=str(current_user.id),
            at_period_end=True
        )
        return {"status": "cancelled", "at_period_end": True}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))


@router.post("/reactivate")
async def reactivate_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reactivate a cancelled subscription before period ends"""

    sub_service = SubscriptionService(db)

    try:
        result = sub_service.reactivate_subscription(str(current_user.id))
        return {"status": "reactivated"}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))


# ============ Webhook Handler ============

@router.post("/webhook/{provider}")
async def payment_webhook(
    provider: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Universal webhook handler for all payment providers.

    Routes to appropriate provider based on URL parameter.
    Providers: stripe, bkash (future), razorpay (future)
    """

    payload = await request.body()
    signature = request.headers.get("stripe-signature")  # Stripe specific

    from payments import PaymentProviderType

    try:
        provider_type = PaymentProviderType(provider)
    except ValueError:
        raise HTTPException(400, detail=f"Unknown provider: {provider}")

    payment_router = PaymentRouter(db)

    try:
        provider_impl = payment_router.get_provider(provider_type)
    except ValueError:
        raise HTTPException(400, detail=f"Provider {provider} not implemented")

    try:
        # Process webhook
        event = provider_impl.handle_webhook(payload, signature)

        # Route to appropriate handler based on event type
        await handle_payment_event(db, event)

        return {"status": "success"}

    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        # Log error but return 200 to prevent retries
        # (Stripe will retry on 4xx/5xx)
        logging.getLogger("hunt-x").error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


async def handle_payment_event(db: Session, event: dict):
    """
    Route standardized payment events to appropriate handlers.

    This is where you implement business logic for each event type.
    """

    event_type = event.get("event_type")
    sub_service = SubscriptionService(db)

    if event_type == "checkout_completed":
        # Payment successful - activate subscription
        user_id = event.get("user_id")
        tier = event.get("tier")

        if user_id and tier:
            try:
                # Upgrade subscription to paid tier
                from payments import SubscriptionTier as TierEnum
                sub_service.upgrade_subscription(user_id, TierEnum(tier))
            except Exception as e:
                logging.getLogger("hunt-x").error(f"Failed to activate subscription: {e}")

    elif event_type == "payment_succeeded":
        # Recurring payment succeeded
        subscription_id = event.get("subscription_id")
        # SubscriptionService handles this via webhooks already
        # But you could add additional logic here

    elif event_type == "subscription_cancelled":
        # Subscription ended - downgrade to free
        subscription_id = event.get("subscription_id")
        # This is handled by SubscriptionService

    elif event_type == "subscription_updated":
        # Handle tier changes, trial ending, etc.
        pass


# ============ Invoices ============

@router.get("/invoices")
async def get_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment history for user"""

    stripe_provider = create_stripe_provider(db)
    invoices = await stripe_provider.get_invoices(str(current_user.id))

    return {"invoices": invoices}


# ============ Legacy Compatibility ============

@router.get("/status/{email}")
async def check_payment_status_legacy(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Legacy endpoint for backward compatibility.

    Maintains compatibility with existing frontend.
    """

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {
            "plan": "try",
            "paid": False,
            "credits_remaining": 5,
            "features": ["5 free job evaluations"]
        }

    sub_service = SubscriptionService(db)
    subscription = sub_service.get_subscription(str(user.id))
    credit_summary = sub_service.get_credit_summary(str(user.id))

    is_paid = subscription and subscription.get("status") == "active"

    # Count total remaining credits
    total_remaining = 0
    for feature in credit_summary.get("features", []):
        remaining = feature.get("remaining", 0)
        if remaining == -1:  # Unlimited
            total_remaining = -1
            break
        total_remaining += remaining

    tier = subscription.get("plan", {}).get("tier", "try") if subscription else "try"

    return {
        "plan": tier,
        "paid": is_paid,
        "credits_remaining": total_remaining,
        "status": subscription.get("status") if subscription else "incomplete",
        "current_period_end": subscription.get("current_period_end") if subscription else None
    }
