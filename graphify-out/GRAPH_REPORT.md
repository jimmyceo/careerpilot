# Graph Report - .  (2026-04-27)

## Corpus Check
- Corpus is ~36,061 words - fits in a single context window. You may not need a graph.

## Summary
- 801 nodes · 1932 edges · 26 communities detected
- Extraction: 51% EXTRACTED · 49% INFERRED · 0% AMBIGUOUS · INFERRED: 948 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `SubscriptionService` - 85 edges
2. `Feature` - 65 edges
3. `SubscriptionStatus` - 60 edges
4. `SubscriptionTier` - 53 edges
5. `SubscriptionPlan` - 51 edges
6. `UserSubscription` - 48 edges
7. `JobScraperService` - 47 edges
8. `ApifyClientWrapper` - 46 edges
9. `JSearchClient` - 45 edges
10. `EvaluationService` - 41 edges

## Surprising Connections (you probably didn't know these)
- `AI Client module Re-exports from ai_client for backward compatibility` --uses--> `AIClient`  [INFERRED]
  /Users/tanvir/Hunt-X/backend/ai/client.py → /Users/tanvir/Hunt-X/backend/ai_client.py
- `Upload resume and parse with AI.     Creates user if doesn't exist.` --uses--> `ResumePDFService`  [INFERRED]
  /Users/tanvir/Hunt-X/backend/routers/resumes.py → /Users/tanvir/Hunt-X/backend/services/resume_pdf_service.py
- `Generate PDF from resume` --uses--> `ResumePDFService`  [INFERRED]
  /Users/tanvir/Hunt-X/backend/routers/resumes.py → /Users/tanvir/Hunt-X/backend/services/resume_pdf_service.py
- `Unified Payment Router v2  Refactored payment endpoints using the provider abstr` --uses--> `SubscriptionService`  [INFERRED]
  /Users/tanvir/Hunt-X/backend/routers/payment_v2.py → /Users/tanvir/Hunt-X/backend/services/subscription_service.py
- `Create Stripe provider with config from environment` --uses--> `SubscriptionService`  [INFERRED]
  /Users/tanvir/Hunt-X/backend/routers/payment_v2.py → /Users/tanvir/Hunt-X/backend/services/subscription_service.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (114): Base, Enum, Feature, get_feature_limit(), get_plan_config(), is_unlimited(), Enums and constants for Hunt-X subscription system, Get configuration for a subscription tier (+106 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (82): AIClient, Wrapper class for AI operations.     Provides query and query_json methods for A, ask_question(), AskQuestionRequest, ChatAssistService, ChatContext, ChatMessage, Chat-based application assistance service Real-time Q&A for job applications (+74 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (65): ApifyClientWrapper, detect_region(), JSearchClient, Job scraper API clients for external job data providers Implements JSearch (Rapi, Search jobs using JSearch API          Args:             query: Job search query, Parse JSearch API response into ScrapedJob objects, Format location from job data, Format salary information (+57 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (61): Query AI with automatic fallback.          Args:             prompt: User prompt, setAuthToken(), get_me(), login(), Authentication router, Login and get access token, Get current user info, refresh_token() (+53 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (51): BaseModel, get_db(), Base model and database setup, Dependency for getting DB sessions, Mixin to add created_at and updated_at timestamps, Base model with common fields, TimestampMixin, BaseModel (+43 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (49): ABC, bKash doesn't have webhooks.          Use callback URL with paymentID instead., create_checkout(), get_pricing(), get_providers_for_region(), is_payment_method_available(), PaymentProvider, PaymentProviderType (+41 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (30): ai_query(), ai_query_json(), AnthropicError, _call_anthropic(), _call_openai(), get_model_usage_stats(), kimi_query(), _log_model_usage() (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (25): CaseStudyResponse, generate_interview_prep(), GenerateInterviewPrepRequest, get_interview_prep(), get_prep_by_evaluation(), InterviewPrepResponse, QuestionToAskResponse, Interview preparation router (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (13): BkashProvider, bKash Payment Provider (Placeholder)  To implement: 1. Get bKash merchant creden, Execute bKash payment after user confirms.          Call this from your callback, bKash doesn't support subscriptions.          For recurring billing:         - S, Query bKash for transaction history, Only available in Bangladesh, Bangladesh pricing in BDT, Refund a bKash payment (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (14): BlockA, BlockB, BlockC, BlockD, BlockE, BlockF, CompensationData, CVChange (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (5): health(), Hunt-X API - Main Application Career-ops ported to SaaS, Health check endpoint, Initialize database on startup, startup()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): init_db(), Initialize database tables

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): Chat-based application assistance User pastes question, AI answers in real-time

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): Ported from career-ops/modes/_shared.md System context, rules, and scoring logic

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): Job scraper prompts for portal scanning Ported from career-ops scan mode

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Resume PDF generation Takes uploaded resume, creates professional ATS-optimized

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): Ported from career-ops 'apply' mode: Application form assistance

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): Ported from career-ops CV generation logic

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Return the provider type identifier

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): Create a checkout session for user to complete payment.          Returns:

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Cancel user's active subscription

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Get payment history for user

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Process webhook from payment provider.          Returns event data for routing t

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Check if this provider supports the given region

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): Get prioritized list of providers for region

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Get pricing for tier in region

## Knowledge Gaps
- **133 isolated node(s):** `Initialize database tables`, `Standalone AI client for Hunt-X (no external dependencies) Replaces company_conf`, `Raised when Anthropic API fails`, `Raised when OpenAI API fails`, `Log model usage with required format:     [AI] Model: {model_name}, Tokens: {inp` (+128 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 11`** (4 nodes): `database.py`, `get_db()`, `init_db()`, `Initialize database tables`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `chat_assist.py`, `Chat-based application assistance User pastes question, AI answers in real-time`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `shared.py`, `Ported from career-ops/modes/_shared.md System context, rules, and scoring logic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `job_scraper.py`, `Job scraper prompts for portal scanning Ported from career-ops scan mode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `resume_pdf.py`, `Resume PDF generation Takes uploaded resume, creates professional ATS-optimized`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `Ported from career-ops 'apply' mode: Application form assistance`, `application_assist.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `cv_generation.py`, `Ported from career-ops CV generation logic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `Return the provider type identifier`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `Create a checkout session for user to complete payment.          Returns:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `Cancel user's active subscription`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Get payment history for user`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Process webhook from payment provider.          Returns event data for routing t`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Check if this provider supports the given region`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `Get prioritized list of providers for region`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Get pricing for tier in region`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JobScraperService` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `SubscriptionService` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `JSearchClient` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 65 inferred relationships involving `SubscriptionService` (e.g. with `CreateSubscriptionRequest` and `CancelSubscriptionRequest`) actually correct?**
  _`SubscriptionService` has 65 INFERRED edges - model-reasoned connections that need verification._
- **Are the 61 inferred relationships involving `Feature` (e.g. with `CreateSubscriptionRequest` and `CancelSubscriptionRequest`) actually correct?**
  _`Feature` has 61 INFERRED edges - model-reasoned connections that need verification._
- **Are the 56 inferred relationships involving `str` (e.g. with `_call_anthropic()` and `_call_openai()`) actually correct?**
  _`str` has 56 INFERRED edges - model-reasoned connections that need verification._
- **Are the 56 inferred relationships involving `SubscriptionStatus` (e.g. with `SubscriptionRepository` and `CreditRepository`) actually correct?**
  _`SubscriptionStatus` has 56 INFERRED edges - model-reasoned connections that need verification._