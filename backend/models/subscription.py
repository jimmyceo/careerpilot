"""
SQLAlchemy models for subscription system
"""
from sqlalchemy import (
    Column, String, DateTime, Integer, Boolean, JSON, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from models.enums import (
    SubscriptionTier, SubscriptionStatus, Feature, SubscriptionEventType
)
import uuid


class SubscriptionPlan(Base):
    """Static subscription plan definitions"""
    __tablename__ = "subscription_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tier = Column(SQLEnum(SubscriptionTier), unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    price_monthly_cents = Column(Integer, nullable=False)
    price_yearly_cents = Column(Integer, nullable=False)
    features = Column(JSON, default=list)  # List of feature strings
    limits = Column(JSON, default=dict)    # Feature -> limit mapping
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    subscriptions = relationship("UserSubscription", back_populates="plan")

    def to_dict(self):
        return {
            "id": self.id,
            "tier": self.tier.value,
            "name": self.name,
            "description": self.description,
            "price_monthly_cents": self.price_monthly_cents,
            "price_yearly_cents": self.price_yearly_cents,
            "price_monthly": self.price_monthly_cents / 100,
            "price_yearly": self.price_yearly_cents / 100,
            "features": self.features,
            "limits": self.limits,
            "is_active": self.is_active,
        }


class UserSubscription(Base):
    """User's subscription state"""
    __tablename__ = "user_subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    plan_id = Column(String, ForeignKey("subscription_plans.id"), nullable=False)
    stripe_subscription_id = Column(String, unique=True)
    stripe_customer_id = Column(String)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.INCOMPLETE)

    # Billing periods
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)

    # Trial
    trial_start = Column(DateTime(timezone=True))
    trial_end = Column(DateTime(timezone=True))

    # Meta data (cannot use 'metadata' - reserved by SQLAlchemy)
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    events = relationship("SubscriptionEvent", back_populates="subscription")

    def to_dict(self, include_plan=True):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "status": self.status.value,
            "current_period_start": self.current_period_start.isoformat() if self.current_period_start else None,
            "current_period_end": self.current_period_end.isoformat() if self.current_period_end else None,
            "cancel_at_period_end": self.cancel_at_period_end,
            "trial_end": self.trial_end.isoformat() if self.trial_end else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_plan and self.plan:
            data["plan"] = self.plan.to_dict()
        return data

    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]

    def is_trial(self):
        """Check if subscription is in trial period"""
        return self.status == SubscriptionStatus.TRIALING

    def is_cancelled(self):
        """Check if subscription is cancelled"""
        return self.status == SubscriptionStatus.CANCELLED


class SubscriptionEvent(Base):
    """Audit log for subscription events"""
    __tablename__ = "subscription_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = Column(String, ForeignKey("user_subscriptions.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_type = Column(SQLEnum(SubscriptionEventType), nullable=False)

    # Event details
    previous_plan_id = Column(String, ForeignKey("subscription_plans.id"))
    new_plan_id = Column(String, ForeignKey("subscription_plans.id"))
    event_metadata = Column(JSON, default=dict)  # Additional event data

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    subscription = relationship("UserSubscription", back_populates="events")

    def to_dict(self):
        return {
            "id": self.id,
            "subscription_id": self.subscription_id,
            "user_id": self.user_id,
            "event_type": self.event_type.value,
            "previous_plan_id": self.previous_plan_id,
            "new_plan_id": self.new_plan_id,
            "metadata": self.event_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CreditBalance(Base):
    """Current month's credit balance per user per feature"""
    __tablename__ = "credit_balances"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    feature = Column(SQLEnum(Feature), nullable=False)
    credits_used = Column(Integer, default=0)
    credits_total = Column(Integer, default=0)
    reset_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "feature": self.feature.value,
            "credits_used": self.credits_used,
            "credits_total": self.credits_total,
            "credits_remaining": self.credits_total - self.credits_used,
            "reset_date": self.reset_date.isoformat() if self.reset_date else None,
        }


class UsageLog(Base):
    """Audit log of feature usage"""
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    feature = Column(SQLEnum(Feature), nullable=False)
    credits_used = Column(Integer, default=1)
    usage_metadata = Column(JSON, default=dict)  # Additional context (cv_id, resume_id, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "feature": self.feature.value,
            "credits_used": self.credits_used,
            "metadata": self.usage_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
