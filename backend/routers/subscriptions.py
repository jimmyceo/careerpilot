"""
import logging
API routes for subscription management
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import os
import stripe

from database import get_db
from services.subscription_service import SubscriptionService
from models.enums import SubscriptionTier, Feature
from dependencies import get_current_user
from models import User

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')


# ============ Pydantic Models ============

class CreateSubscriptionRequest(BaseModel):
    tier: str = Field(..., description="Subscription tier: free, starter, pro, team")


class CancelSubscriptionRequest(BaseModel):
    at_period_end: bool = Field(True, description="Cancel at period end")


class CheckFeatureRequest(BaseModel):
    feature: str = Field(..., description="Feature to check")


class ConsumeFeatureRequest(BaseModel):
    feature: str = Field(..., description="Feature to consume")
    amount: int = Field(1, description="Amount to consume")


# ============ Routes ============

@router.get("/plans")
async def get_subscription_plans(db: Session = Depends(get_db)):
    """Get all available subscription plans"""
    try:
        service = SubscriptionService(db)
        plans = service.get_all_plans()
        return {
            "status": "success",
            "plans": plans
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current")
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current subscription"""
    try:
        service = SubscriptionService(db)
        subscription = service.get_or_create_subscription(str(current_user.id))
        return {
            "status": "success",
            "subscription": subscription
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-checkout")
async def create_checkout_session(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe Checkout session for subscription"""
    try:
        service = SubscriptionService(db)

        # Get plan details
        tier = request.tier.lower()
        if tier == "free":
            # Just create free subscription directly
            subscription = service.get_or_create_subscription(str(current_user.id))
            return {
                "status": "success",
                "checkout_url": None,
                "message": "Free subscription created"
            }

        plan = service.get_plan(SubscriptionTier(tier))
        if not plan:
            raise HTTPException(status_code=400, detail=f"Invalid tier: {tier}")

        # Create checkout session
        price_cents = plan.price_monthly_cents
        product_name = f"Hunt-X {plan.name}"

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': product_name,
                        'description': f"Monthly subscription to Hunt-X {plan.name}"
                    },
                    'unit_amount': price_cents,
                    'recurring': {'interval': 'month'}
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=os.getenv('STRIPE_SUCCESS_URL', 'http://localhost:3000/dashboard?payment=success'),
            cancel_url=os.getenv('STRIPE_CANCEL_URL', 'http://localhost:3000/pricing?cancelled'),
            customer_email=current_user.email,
            metadata={
                'user_id': str(current_user.id),
                'plan_id': plan.id,
                'tier': tier
            }
        )

        return {
            "status": "success",
            "checkout_url": session.url,
            "session_id": session.id
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancel")
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel user's subscription"""
    try:
        service = SubscriptionService(db)
        subscription = service.cancel_subscription(
            str(current_user.id),
            request.at_period_end
        )
        return {
            "status": "success",
            "subscription": subscription
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/usage")
async def get_usage_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get credit usage summary"""
    try:
        service = SubscriptionService(db)
        summary = service.get_credit_summary(str(current_user.id))
        return {
            "status": "success",
            "usage": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-feature")
async def check_feature_access(
    request: CheckFeatureRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has access to a feature"""
    try:
        service = SubscriptionService(db)

        # Validate feature
        try:
            feature = Feature(request.feature)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid feature: {request.feature}")

        access = service.check_feature_access(str(current_user.id), feature)
        return {
            "status": "success",
            "access": access
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/consume-feature")
async def consume_feature(
    request: ConsumeFeatureRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Consume credits for a feature"""
    try:
        service = SubscriptionService(db)

        # Validate feature
        try:
            feature = Feature(request.feature)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid feature: {request.feature}")

        result = service.consume_feature(
            str(current_user.id),
            feature,
            request.amount
        )

        if not result["success"]:
            return JSONResponse(
                status_code=402,
                content={
                    "status": "error",
                    "message": "Insufficient credits",
                    "result": result
                }
            )

        return {
            "status": "success",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks (public — called by Stripe)"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        else:
            # For development, construct event without verification
            import json
            event = json.loads(payload)

        event_type = event.get('type')
        event_data = event.get('data', {}).get('object', {})

        # Handle event
        service = SubscriptionService(db)
        service.handle_stripe_webhook(event_type, event_data)

        return {"status": "success"}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        # Log error but return 200 to prevent Stripe retries
        logging.getLogger("hunt-x").error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


@router.post("/initialize")
async def initialize_plans(db: Session = Depends(get_db)):
    """Initialize subscription plans (admin only)"""
    try:
        service = SubscriptionService(db)
        service.initialize_plans()
        return {
            "status": "success",
            "message": "Plans initialized"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
