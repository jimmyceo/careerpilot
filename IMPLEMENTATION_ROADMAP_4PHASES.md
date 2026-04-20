# Hunt-X SaaS Implementation Roadmap
## 4-Phase Journey from MVP to SaaS Launch

---

## Current State Assessment

**What Works Today:**
- ✅ FastAPI backend with resume upload, AI analysis, CV generation
- ✅ Next.js frontend with landing, upload, dashboard, pricing, generate pages
- ✅ SQLite database (User, Resume, CV models)
- ✅ Stripe payment integration (one-time €49)
- ✅ Basic PDF generation (HTML)
- ✅ AI integration (Kimi via Ollama Cloud)

**What's Missing for SaaS:**
- ❌ No subscription tiers
- ❌ No usage tracking
- ❌ No application pipeline
- ❌ No collaboration features
- ❌ Limited analytics
- ❌ No viral/retention mechanics

---

## Phase 1: Foundation (Weeks 1-2)
**Goal:** Make the app subscription-ready

### Backend Changes

1. **Multi-Tier System**
   ```python
   # New table: subscriptions
   class SubscriptionTier(Enum):
       FREE = "free"
       STARTER = "starter"  # €9/mo
       PRO = "pro"          # €29/mo
       TEAM = "team"        # €49/user/mo
   
   # Update User model
   class User:
       subscription_tier = Column(String, default="free")
       subscription_status = Column(String, default="inactive")
       stripe_subscription_id = Column(String)
       credits_remaining = Column(Integer, default=1)  # For free tier
       current_period_end = Column(DateTime)
   ```

2. **Usage Tracking**
   ```python
   class UsageLog:
       user_id, feature, credits_used, created_at
       # Features: resume_upload, cv_generate, analysis, download
   ```

3. **Stripe Subscription Setup**
   - Convert from one-time to subscription
   - Webhooks: subscription.created, invoice.paid, subscription.deleted
   - Proration handling for upgrades/downgrades

### Frontend Changes

1. **Pricing Page Redesign**
   - 4 tiers: Free, Starter (€9), Pro (€29), Team (€49)
   - Feature comparison matrix
   - Annual billing toggle (2 months free)

2. **Paywall Modal**
   - "You've used 1/1 free CVs"
   - Upgrade CTA with feature preview
   - Smooth checkout flow

3. **Credit Indicator**
   - Show credits remaining in navbar
   - Warning at 80% usage

### Database Migrations

```sql
-- Add subscription columns to users
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN credits_remaining INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN current_period_end TIMESTAMP;

-- Create usage_logs table
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id),
    feature TEXT NOT NULL,
    credits_used INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription_plans reference table
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER NOT NULL,
    features JSONB NOT NULL,
    limits JSONB NOT NULL
);

-- Seed plans
INSERT INTO subscription_plans VALUES
('free', 'Free', 0, 0, 
 '["basic_analysis", "watermarked_pdf"]',
 '{"cv_generations": 1, "resumes": 2, "storage_mb": 50}'),
('starter', 'Starter', 900, 9000,
 '["full_analysis", "no_watermark", "docx_export"]',
 '{"cv_generations": 10, "resumes": 10, "storage_mb": 500}'),
('pro', 'Pro', 2900, 29000,
 '["unlimited_cvs", "cover_letters", "interview_prep", "analytics", "api_access"]',
 '{"cv_generations": -1, "resumes": -1, "storage_mb": 5000}'),
('team', 'Team', 4900, 49000,
 '["everything_in_pro", "client_management", "white_label", "team_collab", "admin_analytics"]',
 '{"cv_generations": -1, "resumes": -1, "storage_mb": 20000, "team_size": 5}');
```

### Phase 1 Success Metrics
- [ ] User can sign up for Free tier
- [ ] User can upgrade to Starter/Pro via Stripe
- [ ] Usage is tracked per feature
- [ ] Limits are enforced (paywall triggers)
- [ ] Subscription status updates correctly

---

## Phase 2: Core SaaS Features (Weeks 3-5)
**Goal:** Add the features that make users stick

### Feature 1: Application Pipeline

**New Model:**
```python
class Application:
    id: UUID
    user_id: UUID
    job_title: str
    company: str
    job_description: text
    job_url: str
    match_score: int  # 0-100
    status: enum  # saved, applied, screening, interview, offer, rejected, ghosted
    stage_history: JSON  # [{stage, timestamp, notes}]
    salary_range: str
    location: str
    remote_status: enum  # onsite, hybrid, remote
    contact_name: str
    contact_email: str
    notes: text
    next_follow_up: datetime
    cv_id: UUID  # Link to generated CV
    source: str  # linkedin, indeed, referral, etc.
    created_at: datetime
    updated_at: datetime
```

**Kanban UI:**
```tsx
// /dashboard/pipeline
<DragDropContext onDragEnd={handleDragEnd}>
  <div className="flex gap-4 overflow-x-auto">
    {stages.map(stage => (
      <KanbanColumn 
        key={stage.id}
        title={stage.name}
        count={stage.applications.length}
      >
        {stage.applications.map(app => (
          <ApplicationCard 
            key={app.id}
            company={app.company}
            role={app.job_title}
            matchScore={app.match_score}
            daysSince={calculateDays(app.updated_at)}
          />
        ))}
      </KanbanColumn>
    ))}
  </div>
</DragDropContext>
```

**Stages:**
1. **Saved** — Jobs you're interested in
2. **Applied** — Applications submitted
3. **Screening** — Initial recruiter calls
4. **Interview** — Technical/behavioral rounds
5. **Offer** — Received offers
6. **Rejected** — Closed applications
7. **Ghosted** — No response >30 days

### Feature 2: Job Match Score

**Algorithm (Simple v1):**
```python
def calculate_match_score(resume_text: str, job_description: str) -> dict:
    """
    Returns:
    {
        overall_score: 73,
        categories: {
            skills_match: 85,  # % of required skills found
            experience_match: 60,  # years alignment
            seniority_match: 80,  # level alignment
            keywords_match: 65   # ATS keyword density
        },
        missing_skills: ["Kubernetes", "Terraform"],
        keyword_gaps: {
            "microservices": {"cv_count": 0, "jd_count": 5, "importance": "high"}
        },
        suggestions: ["Add specific metrics to your PM experience"]
    }
    """
    # Implementation using AI analysis + keyword matching
```

**UI Component:**
```tsx
<MatchScoreCard score={73}>
  <ScoreBreakdown 
    skills={85}
    experience={60}
    seniority={80}
    keywords={65}
  />
  <MissingSkills skills={["Kubernetes", "Terraform"]} />
  <OptimizeButton onClick={generateOptimizedCV} />
</MatchScoreCard>
```

### Feature 3: Resume Version History

**Git-like Versioning:**
```python
class ResumeVersion:
    id: UUID
    resume_id: UUID
    version_number: int
    file_path: str
    ai_analysis: JSON
    change_summary: str  # "Added Kubernetes experience"
    created_at: datetime
    created_by: UUID
    is_active: bool
```

**UI:**
```tsx
<VersionHistory>
  <VersionTimeline>
    {versions.map(v => (
      <VersionItem 
        version={v.number}
        date={v.created_at}
        summary={v.change_summary}
        score={v.ai_analysis.overall_score}
        isActive={v.is_active}
        onRestore={() => restoreVersion(v.id)}
      />
    ))}
  </VersionTimeline>
  <CompareVersions 
    left={selected[0]}
    right={selected[1]}
  />
</VersionHistory>
```

### Feature 4: Weekly Digest Emails

**Trigger:** Every Monday 9 AM

**Content:**
```
Subject: Your Hunt-X Weekly — 3 new matches found!

Hi Alex,

Your job search this week:
📬 Applications: 5 new | 12 total active
🎯 Match Score: Your avg is 78% (top 25%)
⚡ Priority: 3 jobs expire in 48 hours
📈 Insight: CVs with quantified metrics get 2x responses

[View Dashboard] [Generate New CV]

Top Matches:
1. Stripe — Senior PM — 89% match
2. Notion — Product Lead — 82% match
3. Linear — Head of Product — 76% match
```

### Phase 2 Success Metrics
- [ ] User can track 50+ applications
- [ ] Kanban drag-drop works smoothly
- [ ] Match score shows within 2 seconds
- [ ] 3+ resume versions can be saved
- [ ] Weekly email has 40%+ open rate

---

## Phase 3: Intelligence & Automation (Weeks 6-8)
**Goal:** AI features that justify Pro tier

### Feature 1: Interview Question Predictor

**AI Prompt:**
```python
system = """You are an interview coach specializing in behavioral and technical interviews.
Given a job description and company, predict 5-7 likely interview questions.
For each question:
1. Classify: behavioral, technical, case study, cultural fit
2. Predict probability: high/medium/low
3. Suggest what the interviewer is actually assessing
4. Provide a framework for answering"""

prompt = f"""
Job: {job_title} at {company}
Job Description: {job_description}
Company Context: {company_research}
Candidate Resume: {resume_text}

Generate interview predictions."""
```

**UI:**
```tsx
<InterviewPrep company={company} role={role}>
  <QuestionList>
    {questions.map(q => (
      <QuestionCard 
        question={q.text}
        type={q.type}
        probability={q.probability}
        assessment={q.what_interviewer_wants}
        framework={q.answer_framework}
        relevantExperience={q.your_relevant_experience}
      />
    ))}
  </QuestionList>
  <MockInterviewButton />
  <CompanyResearch company={company} />
</InterviewPrep>
```

### Feature 2: Cover Letter Generation

**Endpoint:**
```python
POST /api/cover-letter/generate
{
    "resume_id": "uuid",
    "job_id": "uuid",  // Or manual input
    "tone": "professional" | "enthusiastic" | "confident",
    "length": "short" | "medium" | "detailed",
    "highlight": "experience" | "skills" | "culture_fit"
}

Response:
{
    "cover_letter_html": "...",
    "key_points": ["Referenced 3 specific requirements", "Mentioned mutual connection"],
    "estimated_read_time": "45 seconds"
}
```

### Feature 3: Smart Job Suggestions

**Algorithm:**
```python
def get_job_suggestions(user_id: str) -> List[JobSuggestion]:
    """
    1. Analyze user's resume for:
       - Top skills
       - Experience level
       - Industry preferences (from past applications)
    
    2. Score available jobs by:
       - Match score (>70%)
       - Salary alignment
       - Location preference
       - Company size preference
       - Recent posting (last 7 days = boost)
    
    3. Return top 10 with explanations
    """
```

**Daily Email:**
```
Subject: 5 jobs match your profile today

Based on your experience and preferences:

1. Vercel — Senior PM — 87% match
   "Your React experience aligns with their developer-focused PM role"
   
2. Figma — Product Manager — 82% match
   "Your design tool background makes you a strong fit"
   
[Save All] [View Matches]
```

### Feature 4: Analytics Dashboard

**Metrics to Track:**
- CV generation count over time
- Application funnel (applied → interview → offer)
- Response rate by CV version
- Match score distribution
- Time-to-response by company
- Salary progression
- Industry diversity

**UI Components:**
```tsx
<AnalyticsDashboard>
  <StatRow>
    <StatCard title="Applications" value={45} trend={+12} />
    <StatCard title="Response Rate" value="23%" trend={+5} />
    <StatCard title="Interviews" value={8} trend={+3} />
    <StatCard title="Avg Match Score" value={78} trend={+4} />
  </StatRow>
  
  <ChartRow>
    <FunnelChart data={funnelData} />
    <LineChart title="Response Rate by CV Version" data={cvPerformance} />
  </ChartRow>
  
  <InsightsList>
    {insights.map(i => (
      <InsightCard 
        type={i.type}  // tip, achievement, warning
        message={i.message}
        action={i.action}
      />
    ))}
  </InsightsList>
</AnalyticsDashboard>
```

### Feature 5: Chrome Extension (Beta)

**Manifest V3 Setup:**
```javascript
// content.js - Runs on LinkedIn, Indeed, etc.
const saveButton = document.createElement('button');
saveButton.innerText = '💾 Save to Hunt-X';
saveButton.onclick = () => {
    const jobData = extractJobData(); // Parse DOM
    chrome.runtime.sendMessage({
        action: 'saveJob',
        data: jobData
    });
};

// Insert button next to "Apply" button
```

**Features:**
- One-click save from LinkedIn/Indeed
- Auto-extract job details
- Show match score inline
- Quick-apply with Hunt-X CV

### Phase 3 Success Metrics
- [ ] Interview prep used by 30% of Pro users
- [ ] Cover letters generated: 100+/week
- [ ] Chrome extension has 500+ installs
- [ ] Analytics dashboard viewed weekly
- [ ] Job suggestion CTR > 20%

---

## Phase 4: Launch & Scale (Weeks 9-10)
**Goal:** Public launch with growth mechanisms

### Pre-Launch Checklist

**Technical:**
- [ ] Load testing (1000 concurrent users)
- [ ] Security audit (OWASP Top 10)
- [ ] GDPR compliance (data export, deletion)
- [ ] Stripe production mode
- [ ] Domain setup (hunt-x.app)
- [ ] SSL certificates
- [ ] Database backups automated
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring (Datadog/LogRocket)

**Product:**
- [ ] Feature freeze (no new features, only bugs)
- [ ] Documentation complete
- [ ] Help center articles
- [ ] Onboarding flow polished
- [ ] Empty states designed
- [ ] Error messages user-friendly

**Marketing:**
- [ ] Landing page optimized
- [ ] Pricing page A/B tested
- [ ] Email sequences ready
- [ ] Social proof collected (beta testimonials)
- [ ] Demo video recorded
- [ ] Product Hunt page prepared
- [ ] Indie Hackers post drafted
- [ ] Reddit r/startups post ready

### Launch Strategy

**Week 9: Soft Launch**
- Invite beta users (500 people)
- Monitor conversion rates
- Fix critical bugs
- Gather testimonials

**Week 10: Public Launch**
- Product Hunt (Monday 12:01 AM PST)
- LinkedIn announcement
- Reddit communities
- Twitter thread
- Newsletter to waitlist

### Post-Launch Growth Features

1. **Referral Program**
   - Give €10, Get €10
   - Unique referral links
   - Referral tracking dashboard

2. **Template Marketplace**
   - Users create and sell templates
   - 70/30 revenue split
   - Rating system
   - Featured templates

3. **Team/Organization Support**
   - Invite team members
   - Role-based access
   - Shared templates
   - Admin analytics

4. **API Access (Pro+)**
   - REST API for CV generation
   - Webhook events
   - Rate limits by tier
   - API key management

### Success Metrics (3 months post-launch)

| Metric | Target |
|--------|--------|
| Signups | 5,000 |
| Free→Starter conversion | 10% |
| Free→Pro conversion | 5% |
| Monthly Churn | <10% |
| NPS Score | >40 |
| MRR | €10,000 |
| Active users (weekly) | 1,500 |

---

## Weekly Timeline Summary

| Week | Phase | Focus | Key Deliverable |
|------|-------|-------|-----------------|
| 1 | 1 | Backend setup | Subscription tiers working |
| 2 | 1 | Frontend + Stripe | Payment flows complete |
| 3 | 2 | Application model | Database schema for pipeline |
| 4 | 2 | Kanban UI | Drag-drop application board |
| 5 | 2 | Match score | AI-powered job matching |
| 6 | 3 | Interview prep | Question predictor live |
| 7 | 3 | Analytics | Dashboard with insights |
| 8 | 3 | Chrome ext + Polish | Extension beta + bug fixes |
| 9 | 4 | Soft launch | 500 beta users onboarded |
| 10 | 4 | Public launch | Product Hunt + marketing |

---

## Resource Requirements

### Development
- **Backend Developer:** Full-time (FastAPI, SQLAlchemy, Stripe)
- **Frontend Developer:** Full-time (Next.js, Tailwind, DnD)
- **AI/ML Engineer:** Part-time (prompts, fine-tuning)

### Infrastructure
- **VPS:** €50/month (backend)
- **Vercel:** €20/month (frontend)
- **Database:** €50/month (Supabase/PostgreSQL)
- **Stripe:** 2.9% + €0.30/transaction
- **AI API:** €100-500/month (depends on usage)
- **Email:** €20/month (SendGrid/Resend)
- **Monitoring:** €50/month (Sentry, LogRocket)
- **CDN:** €20/month (Cloudflare)

**Total Monthly:** ~€400-800

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stripe approval delayed | Start with PayPal as backup |
| AI costs too high | Cache common responses, use GPT-3.5 for free tier |
| User acquisition expensive | Focus on organic (SEO, content marketing) |
| Churn too high | Weekly check-ins, success metrics tracking |
| Competitor copies features | Build brand + community moat |

---

## Decision Points

**Week 2:** Proceed to Phase 2?
- Yes if: Stripe working, basic subscription flows functional
- No if: Payment issues, block on critical bugs

**Week 5:** Proceed to Phase 3?
- Yes if: 100+ beta users active, retention >60%
- No if: Users churning, pivot features needed

**Week 8:** Ready for soft launch?
- Yes if: All critical features working, no P0 bugs
- No if: Performance issues, security concerns

---

## Conclusion

This roadmap takes Hunt-X from a one-time purchase MVP to a full SaaS platform in 10 weeks. Each phase builds on the previous, with clear success metrics and decision gates.

**The key insight:** Don't build everything at once. Phase 1 makes it monetizable. Phase 2 makes it sticky. Phase 3 makes it differentiated. Phase 4 makes it scalable.

**Start Phase 1 today.**

---

*Implementation Roadmap for Hunt-X SaaS Transformation*
*Last Updated: April 2026*
