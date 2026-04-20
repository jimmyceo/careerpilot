"""
Enums and constants for Hunt-X subscription system
"""
from enum import Enum


class SubscriptionTier(str, Enum):
    """Subscription tiers available in Hunt-X"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    TEAM = "team"


class SubscriptionStatus(str, Enum):
    """Status of a subscription"""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"


class Feature(str, Enum):
    """Trackable features for usage"""
    CV_GENERATE = "cv.generate"
    RESUME_UPLOAD = "resume.upload"
    RESUME_ANALYZE = "resume.analyze"
    COVER_LETTER_GENERATE = "cover_letter.generate"
    INTERVIEW_PREP = "interview.prep"
    API_REQUEST = "api.request"
    EXPORT_PDF = "export.pdf"
    EXPORT_DOCX = "export.docx"


class SubscriptionEventType(str, Enum):
    """Types of subscription events for audit logs"""
    CREATED = "subscription.created"
    UPGRADED = "subscription.upgraded"
    DOWNGRADED = "subscription.downgraded"
    CANCELLED = "subscription.cancelled"
    REACTIVATED = "subscription.reactivated"
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    CREDITS_RESET = "credits.reset"


# Plan configurations
PLAN_CONFIGS = {
    SubscriptionTier.FREE: {
        "name": "Free",
        "price_monthly_cents": 0,
        "price_yearly_cents": 0,
        "limits": {
            Feature.CV_GENERATE: 1,
            Feature.RESUME_UPLOAD: 2,
            Feature.RESUME_ANALYZE: 2,
            Feature.COVER_LETTER_GENERATE: 0,
            Feature.INTERVIEW_PREP: 0,
            Feature.API_REQUEST: 0,
            Feature.EXPORT_PDF: 1,
            Feature.EXPORT_DOCX: 0,
        },
        "features": [
            "basic_analysis",
            "watermarked_pdf",
            "email_support",
        ],
    },
    SubscriptionTier.STARTER: {
        "name": "Starter",
        "price_monthly_cents": 900,
        "price_yearly_cents": 9000,
        "limits": {
            Feature.CV_GENERATE: 10,
            Feature.RESUME_UPLOAD: 10,
            Feature.RESUME_ANALYZE: 10,
            Feature.COVER_LETTER_GENERATE: 0,
            Feature.INTERVIEW_PREP: 0,
            Feature.API_REQUEST: 0,
            Feature.EXPORT_PDF: 10,
            Feature.EXPORT_DOCX: 10,
        },
        "features": [
            "full_analysis",
            "no_watermark",
            "docx_export",
            "priority_email_support",
        ],
    },
    SubscriptionTier.PRO: {
        "name": "Pro",
        "price_monthly_cents": 2900,
        "price_yearly_cents": 29000,
        "limits": {
            Feature.CV_GENERATE: -1,  # Unlimited
            Feature.RESUME_UPLOAD: -1,
            Feature.RESUME_ANALYZE: -1,
            Feature.COVER_LETTER_GENERATE: -1,
            Feature.INTERVIEW_PREP: -1,
            Feature.API_REQUEST: 1000,
            Feature.EXPORT_PDF: -1,
            Feature.EXPORT_DOCX: -1,
        },
        "features": [
            "everything_in_starter",
            "unlimited_cvs",
            "cover_letters",
            "interview_prep",
            "analytics_dashboard",
            "api_access",
            "priority_processing",
        ],
    },
    SubscriptionTier.TEAM: {
        "name": "Team",
        "price_monthly_cents": 4900,
        "price_yearly_cents": 49000,
        "limits": {
            Feature.CV_GENERATE: -1,
            Feature.RESUME_UPLOAD: -1,
            Feature.RESUME_ANALYZE: -1,
            Feature.COVER_LETTER_GENERATE: -1,
            Feature.INTERVIEW_PREP: -1,
            Feature.API_REQUEST: 10000,
            Feature.EXPORT_PDF: -1,
            Feature.EXPORT_DOCX: -1,
        },
        "features": [
            "everything_in_pro",
            "client_management",
            "white_label_exports",
            "team_collaboration",
            "admin_analytics",
            "dedicated_support",
        ],
    },
}


def get_plan_config(tier: SubscriptionTier) -> dict:
    """Get configuration for a subscription tier"""
    return PLAN_CONFIGS.get(tier, PLAN_CONFIGS[SubscriptionTier.FREE])


def get_feature_limit(tier: SubscriptionTier, feature: Feature) -> int:
    """Get the limit for a specific feature in a tier"""
    config = get_plan_config(tier)
    return config["limits"].get(feature, 0)


def is_unlimited(tier: SubscriptionTier, feature: Feature) -> bool:
    """Check if a feature is unlimited for a tier"""
    limit = get_feature_limit(tier, feature)
    return limit == -1
