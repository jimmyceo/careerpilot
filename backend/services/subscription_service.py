"""
Business logic layer for subscription management
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import os

# Repository imports
from repositories.subscription_repo import SubscriptionRepository, CreditRepository

# Model imports
from models.enums import (
    SubscriptionTier, SubscriptionStatus, Feature,
    SubscriptionEventType, get_feature_limit, is_unlimited
)
from models.subscription import SubscriptionPlan


class SubscriptionService:
    """Service for managing user subscriptions"""

    def __init__(self, db: Session):
        self.db = db
        self.sub_repo = SubscriptionRepository(db)
        self.credit_repo = CreditRepository(db)

    # ============ Plan Management ============

    def initialize_plans(self) -> None:
        """Initialize default subscription plans in database"""
        for tier in SubscriptionTier:
            existing = self.sub_repo.get_plan_by_tier(tier)
            if not existing:
                from models.enums import PLAN_CONFIGS
                config = PLAN_CONFIGS[tier]
                self.sub_repo.create_plan(
                    tier=tier,
                    name=config["name"],
                    description=f"{config['name']} plan for Hunt-X",
                    price_monthly=config["price_monthly_cents"],
                    price_yearly=config["price_yearly_cents"],
                    features=config["features"],
                    limits={k.value: v for k, v in config["limits"].items()}
                )

    def get_all_plans(self) -> List[Dict[str, Any]]:
        """Get all active subscription plans"""
        plans = self.sub_repo.get_all_active_plans()
        return [plan.to_dict() for plan in plans]

    def get_plan(self, tier: SubscriptionTier) -> Optional[SubscriptionPlan]:
        """Get a specific plan by tier"""
        return self.sub_repo.get_plan_by_tier(tier)

    # ============ Subscription Lifecycle ============

    def get_or_create_subscription(self, user_id: str) -> Dict[str, Any]:
        """Get existing subscription or create free tier subscription"""
        subscription = self.sub_repo.get_user_subscription(user_id)

        if not subscription:
            # Create free tier subscription
            free_plan = self.sub_repo.get_plan_by_tier(SubscriptionTier.FREE)
            if not free_plan:
                raise ValueError("Free plan not initialized")

            subscription = self.sub_repo.create_subscription(
                user_id=user_id,
                plan_id=free_plan.id
            )

            # Initialize credits for free tier
            self._initialize_credits_for_tier(user_id, SubscriptionTier.FREE)

        return subscription.to_dict()

    def get_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's current subscription"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if subscription:
            return subscription.to_dict()
        return None

    def upgrade_subscription(self, user_id: str, new_tier: SubscriptionTier) -> Dict[str, Any]:
        """Upgrade user to a new plan"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if not subscription:
            raise ValueError("User has no subscription")

        new_plan = self.sub_repo.get_plan_by_tier(new_tier)
        if not new_plan:
            raise ValueError(f"Plan {new_tier} not found")

        old_plan_id = subscription.plan_id

        # Update subscription
        subscription = self.sub_repo.change_plan(subscription.id, new_plan.id)
        subscription = self.sub_repo.update_subscription_status(
            subscription.id, SubscriptionStatus.ACTIVE
        )

        # Log event
        self.sub_repo.log_event(
            subscription_id=subscription.id,
            user_id=user_id,
            event_type=SubscriptionEventType.UPGRADED,
            previous_plan_id=old_plan_id,
            new_plan_id=new_plan.id
        )

        # Re-initialize credits for new tier
        self._initialize_credits_for_tier(user_id, new_tier)

        return subscription.to_dict()

    def cancel_subscription(self, user_id: str, at_period_end: bool = True) -> Dict[str, Any]:
        """Cancel user's subscription"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if not subscription:
            raise ValueError("User has no subscription")

        subscription = self.sub_repo.cancel_subscription(
            subscription.id, at_period_end
        )

        # Log event
        self.sub_repo.log_event(
            subscription_id=subscription.id,
            user_id=user_id,
            event_type=SubscriptionEventType.CANCELLED,
            previous_plan_id=subscription.plan_id
        )

        return subscription.to_dict()

    def reactivate_subscription(self, user_id: str) -> Dict[str, Any]:
        """Reactivate a cancelled subscription"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if not subscription:
            raise ValueError("User has no subscription")

        subscription = self.sub_repo.update_subscription_status(
            subscription.id, SubscriptionStatus.ACTIVE
        )
        subscription.cancel_at_period_end = False
        self.db.commit()

        # Log event
        self.sub_repo.log_event(
            subscription_id=subscription.id,
            user_id=user_id,
            event_type=SubscriptionEventType.REACTIVATED,
            new_plan_id=subscription.plan_id
        )

        return subscription.to_dict()

    # ============ Feature Access ============

    def check_feature_access(self, user_id: str, feature: Feature) -> Dict[str, Any]:
        """Check if user has access to a feature and return details"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if not subscription or not subscription.plan:
            return {
                "has_access": False,
                "reason": "no_subscription",
                "tier": SubscriptionTier.FREE.value
            }

        tier = subscription.plan.tier
        limit = get_feature_limit(tier, feature)

        # Check if feature is unlimited
        if is_unlimited(tier, feature):
            return {
                "has_access": True,
                "tier": tier.value,
                "unlimited": True
            }

        # Check credit balance
        balance = self.credit_repo.get_credit_balance(user_id, feature)
        if not balance:
            # Initialize if not exists
            self._initialize_credits_for_tier(user_id, tier)
            balance = self.credit_repo.get_credit_balance(user_id, feature)

        remaining = balance.credits_total - balance.credits_used if balance else 0

        return {
            "has_access": remaining > 0,
            "tier": tier.value,
            "remaining": remaining,
            "total": balance.credits_total if balance else 0,
            "unlimited": False
        }

    def consume_feature(self, user_id: str, feature: Feature,
                       amount: int = 1, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Consume credits for a feature"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if not subscription or not subscription.plan:
            raise ValueError("User has no subscription")

        tier = subscription.plan.tier

        # Check if unlimited
        if is_unlimited(tier, feature):
            # Log usage but don't consume
            self.credit_repo.log_usage(user_id, feature, amount, metadata)
            return {
                "success": True,
                "remaining": -1,  # Unlimited
                "unlimited": True
            }

        # Consume credits
        success, remaining = self.credit_repo.consume_credits(user_id, feature, amount)

        if success:
            # Log usage
            self.credit_repo.log_usage(user_id, feature, amount, metadata)

        return {
            "success": success,
            "remaining": remaining,
            "unlimited": False
        }

    def get_credit_summary(self, user_id: str) -> Dict[str, Any]:
        """Get credit summary for all features"""
        subscription = self.sub_repo.get_user_subscription(user_id)
        if not subscription or not subscription.plan:
            return {"features": []}

        tier = subscription.plan.tier
        balances = self.credit_repo.get_all_credit_balances(user_id)

        features = []
        for feature in Feature:
            balance = next((b for b in balances if b.feature == feature), None)
            is_unltd = is_unlimited(tier, feature)

            features.append({
                "feature": feature.value,
                "display_name": feature.name.replace("_", " ").title(),
                "used": balance.credits_used if balance else 0,
                "total": balance.credits_total if balance else 0,
                "remaining": -1 if is_unltd else (balance.credits_total - balance.credits_used if balance else 0),
                "unlimited": is_unltd,
                "reset_date": balance.reset_date.isoformat() if balance else None
            })

        return {
            "tier": tier.value,
            "plan_name": subscription.plan.name,
            "features": features
        }

    def _initialize_credits_for_tier(self, user_id: str, tier: SubscriptionTier) -> None:
        """Initialize all credit balances for a tier"""
        reset_date = datetime.utcnow() + timedelta(days=30)

        for feature in Feature:
            limit = get_feature_limit(tier, feature)
            if limit > 0:  # Only create for non-zero limits
                existing = self.credit_repo.get_credit_balance(user_id, feature)
                if not existing:
                    self.credit_repo.initialize_credits(
                        user_id=user_id,
                        feature=feature,
                        credits_total=limit,
                        reset_date=reset_date
                    )

    # ============ Webhook Handling ============

    def handle_stripe_webhook(self, event_type: str, event_data: Dict[str, Any]) -> None:
        """Handle Stripe webhook events"""
        from database import SessionLocal

        if event_type == "checkout.session.completed":
            self._handle_checkout_completed(event_data)
        elif event_type == "invoice.paid":
            self._handle_invoice_paid(event_data)
        elif event_type == "customer.subscription.updated":
            self._handle_subscription_updated(event_data)
        elif event_type == "customer.subscription.deleted":
            self._handle_subscription_deleted(event_data)

    def _handle_checkout_completed(self, data: Dict[str, Any]) -> None:
        """Handle checkout session completed"""
        subscription_id = data.get("subscription")
        customer_id = data.get("customer")
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        plan_id = metadata.get("plan_id")

        if not user_id or not plan_id:
            return

        # Update subscription with Stripe IDs
        subscription = self.sub_repo.get_user_subscription(user_id)
        if subscription:
            subscription.stripe_subscription_id = subscription_id
            subscription.stripe_customer_id = customer_id
            self.sub_repo.update_subscription_status(
                subscription.id, SubscriptionStatus.ACTIVE
            )

            # Log event
            self.sub_repo.log_event(
                subscription_id=subscription.id,
                user_id=user_id,
                event_type=SubscriptionEventType.CREATED,
                new_plan_id=plan_id,
                metadata={"stripe_subscription_id": subscription_id}
            )

    def _handle_invoice_paid(self, data: Dict[str, Any]) -> None:
        """Handle invoice paid"""
        subscription_id = data.get("subscription")
        if not subscription_id:
            return

        subscription = self.sub_repo.get_subscription_by_stripe_id(subscription_id)
        if subscription:
            # Extend current period
            current_period_end = datetime.utcnow() + timedelta(days=30)
            self.sub_repo.update_subscription_status(
                subscription.id, SubscriptionStatus.ACTIVE, current_period_end
            )

            # Log event
            self.sub_repo.log_event(
                subscription_id=subscription.id,
                user_id=subscription.user_id,
                event_type=SubscriptionEventType.PAYMENT_SUCCEEDED,
                metadata={"invoice_id": data.get("id")}
            )

    def _handle_subscription_updated(self, data: Dict[str, Any]) -> None:
        """Handle subscription updated"""
        stripe_subscription_id = data.get("id")
        status = data.get("status")
        cancel_at_period_end = data.get("cancel_at_period_end", False)

        subscription = self.sub_repo.get_subscription_by_stripe_id(stripe_subscription_id)
        if not subscription:
            return

        # Map Stripe status to our status
        status_mapping = {
            "active": SubscriptionStatus.ACTIVE,
            "canceled": SubscriptionStatus.CANCELLED,
            "incomplete": SubscriptionStatus.INCOMPLETE,
            "past_due": SubscriptionStatus.PAST_DUE,
            "unpaid": SubscriptionStatus.UNPAID,
            "trialing": SubscriptionStatus.TRIALING
        }

        new_status = status_mapping.get(status, SubscriptionStatus.INCOMPLETE)

        # Update status
        current_period_end = datetime.fromtimestamp(data.get("current_period_end"))
        self.sub_repo.update_subscription_status(
            subscription.id, new_status, current_period_end
        )

        subscription.cancel_at_period_end = cancel_at_period_end
        self.db.commit()

    def _handle_subscription_deleted(self, data: Dict[str, Any]) -> None:
        """Handle subscription deleted"""
        stripe_subscription_id = data.get("id")

        subscription = self.sub_repo.get_subscription_by_stripe_id(stripe_subscription_id)
        if subscription:
            # Downgrade to free tier
            free_plan = self.sub_repo.get_plan_by_tier(SubscriptionTier.FREE)
            if free_plan:
                old_plan_id = subscription.plan_id
                self.sub_repo.change_plan(subscription.id, free_plan.id)
                self.sub_repo.update_subscription_status(
                    subscription.id, SubscriptionStatus.CANCELLED
                )

                # Log event
                self.sub_repo.log_event(
                    subscription_id=subscription.id,
                    user_id=subscription.user_id,
                    event_type=SubscriptionEventType.CANCELLED,
                    previous_plan_id=old_plan_id,
                    new_plan_id=free_plan.id
                )

                # Reset credits to free tier
                self._initialize_credits_for_tier(subscription.user_id, SubscriptionTier.FREE)
