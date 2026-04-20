"""
Repository layer for subscription database operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from datetime import datetime, timedelta
import uuid


class SubscriptionRepository:
    """Repository for subscription-related database operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_plan_by_tier(self, tier: str):
        """Get subscription plan by tier"""
        from models.subscription import SubscriptionPlan
        return self.db.query(SubscriptionPlan).filter(
            SubscriptionPlan.tier == tier
        ).first()

    def get_plan_by_id(self, plan_id: str):
        """Get subscription plan by ID"""
        from models.subscription import SubscriptionPlan
        return self.db.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == plan_id
        ).first()

    def get_all_active_plans(self):
        """Get all active subscription plans ordered by price"""
        from models.subscription import SubscriptionPlan
        return self.db.query(SubscriptionPlan).filter(
            SubscriptionPlan.is_active == True
        ).order_by(SubscriptionPlan.price_monthly_cents).all()

    def create_plan(self, tier: str, name: str, description: str,
                    price_monthly: int, price_yearly: int,
                    features: list, limits: dict):
        """Create a new subscription plan"""
        from models.subscription import SubscriptionPlan
        plan = SubscriptionPlan(
            id=str(uuid.uuid4()),
            tier=tier,
            name=name,
            description=description,
            price_monthly_cents=price_monthly,
            price_yearly_cents=price_yearly,
            features=features,
            limits=limits,
            is_active=True
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def get_user_subscription(self, user_id: str):
        """Get user's current subscription"""
        from models.subscription import UserSubscription
        return self.db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

    def get_subscription_by_stripe_id(self, stripe_subscription_id: str):
        """Get subscription by Stripe subscription ID"""
        from models.subscription import UserSubscription
        return self.db.query(UserSubscription).filter(
            UserSubscription.stripe_subscription_id == stripe_subscription_id
        ).first()

    def create_subscription(self, user_id: str, plan_id: str,
                          stripe_subscription_id: str = None,
                          stripe_customer_id: str = None):
        """Create a new subscription for user"""
        from models.subscription import UserSubscription
        from models.enums import SubscriptionStatus
        subscription = UserSubscription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            plan_id=plan_id,
            stripe_subscription_id=stripe_subscription_id,
            stripe_customer_id=stripe_customer_id,
            status=SubscriptionStatus.INCOMPLETE
        )
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def update_subscription_status(self, subscription_id: str,
                                 status: str,
                                 current_period_end: datetime = None):
        """Update subscription status"""
        from models.subscription import UserSubscription
        sub = self.db.query(UserSubscription).filter(
            UserSubscription.id == subscription_id
        ).first()

        if sub:
            sub.status = status
            if current_period_end:
                sub.current_period_end = current_period_end
            self.db.commit()
            self.db.refresh(sub)
        return sub

    def cancel_subscription(self, subscription_id: str,
                          at_period_end: bool = True):
        """Cancel a subscription"""
        from models.subscription import UserSubscription
        from models.enums import SubscriptionStatus
        sub = self.db.query(UserSubscription).filter(
            UserSubscription.id == subscription_id
        ).first()

        if sub:
            sub.cancel_at_period_end = at_period_end
            if not at_period_end:
                sub.status = SubscriptionStatus.CANCELLED
            self.db.commit()
            self.db.refresh(sub)
        return sub

    def change_plan(self, subscription_id: str, new_plan_id: str):
        """Change subscription plan"""
        from models.subscription import UserSubscription
        sub = self.db.query(UserSubscription).filter(
            UserSubscription.id == subscription_id
        ).first()

        if sub:
            old_plan_id = sub.plan_id
            sub.plan_id = new_plan_id
            self.db.commit()
            self.db.refresh(sub)
        return sub

    def log_event(self, subscription_id: str, user_id: str,
                 event_type: str,
                 previous_plan_id: str = None,
                 new_plan_id: str = None,
                 metadata: dict = None):
        """Log a subscription event"""
        from models.subscription import SubscriptionEvent
        event = SubscriptionEvent(
            id=str(uuid.uuid4()),
            subscription_id=subscription_id,
            user_id=user_id,
            event_type=event_type,
            previous_plan_id=previous_plan_id,
            new_plan_id=new_plan_id,
            event_metadata=metadata or {}
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event


class CreditRepository:
    """Repository for credit/usage tracking operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_credit_balance(self, user_id: str, feature: str):
        """Get credit balance for a user and feature"""
        from models.subscription import CreditBalance
        return self.db.query(CreditBalance).filter(
            and_(
                CreditBalance.user_id == user_id,
                CreditBalance.feature == feature
            )
        ).first()

    def get_all_credit_balances(self, user_id: str):
        """Get all credit balances for a user"""
        from models.subscription import CreditBalance
        return self.db.query(CreditBalance).filter(
            CreditBalance.user_id == user_id
        ).all()

    def initialize_credits(self, user_id: str, feature: str,
                         credits_total: int, reset_date: datetime):
        """Initialize credit balance for a feature"""
        from models.subscription import CreditBalance
        balance = CreditBalance(
            id=str(uuid.uuid4()),
            user_id=user_id,
            feature=feature,
            credits_used=0,
            credits_total=credits_total,
            reset_date=reset_date
        )
        self.db.add(balance)
        self.db.commit()
        self.db.refresh(balance)
        return balance

    def consume_credits(self, user_id: str, feature: str,
                       amount: int = 1):
        """
        Consume credits for a feature.
        Returns: (success: bool, remaining: int)
        """
        from models.subscription import CreditBalance
        balance = self.get_credit_balance(user_id, feature)

        if not balance:
            return False, 0

        # Check if reset date passed
        if datetime.utcnow() >= balance.reset_date:
            # Reset credits
            balance.credits_used = 0
            balance.reset_date = self._get_next_reset_date(balance.reset_date)

        # Check if enough credits
        remaining = balance.credits_total - balance.credits_used
        if remaining < amount:
            return False, remaining

        # Consume credits
        balance.credits_used += amount
        self.db.commit()
        self.db.refresh(balance)

        return True, remaining - amount

    def reset_credits(self, user_id: str, feature: str,
                     new_total: int, reset_date: datetime):
        """Reset credits to new total"""
        balance = self.get_credit_balance(user_id, feature)

        if balance:
            balance.credits_used = 0
            balance.credits_total = new_total
            balance.reset_date = reset_date
            self.db.commit()
            self.db.refresh(balance)
        return balance

    def log_usage(self, user_id: str, feature: str,
                 credits_used: int = 1, metadata: dict = None):
        """Log feature usage"""
        from models.subscription import UsageLog
        log = UsageLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            feature=feature,
            credits_used=credits_used,
            metadata=metadata or {}
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_usage_history(self, user_id: str, days: int = 30):
        """Get usage history for a user"""
        from models.subscription import UsageLog
        cutoff = datetime.utcnow() - timedelta(days=days)

        return self.db.query(UsageLog).filter(
            and_(
                UsageLog.user_id == user_id,
                UsageLog.created_at >= cutoff
            )
        ).order_by(UsageLog.created_at.desc()).all()

    def get_usage_stats(self, user_id: str, days: int = 30):
        """Get aggregated usage statistics"""
        from sqlalchemy import func
        from models.subscription import UsageLog
        cutoff = datetime.utcnow() - timedelta(days=days)

        results = self.db.query(
            UsageLog.feature,
            func.sum(UsageLog.credits_used).label('total_credits')
        ).filter(
            and_(
                UsageLog.user_id == user_id,
                UsageLog.created_at >= cutoff
            )
        ).group_by(UsageLog.feature).all()

        return {feature: total for feature, total in results}

    def _get_next_reset_date(self, current_reset: datetime):
        """Calculate next monthly reset date"""
        return current_reset + timedelta(days=30)
