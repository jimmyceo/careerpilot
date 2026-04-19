# CareerPilot — CLAUDE IMPLEMENTATION BIBLE
## AI-Powered Job Search Copilot
### Version 0.1 | MVP Build (3 Days)

---

> **TO: Any Claude/AI Agent**  
> **FROM: Tanvir (Founder)**  
> **STATUS: Active Build — Day 2 Complete, Ready for Day 3**

**Your Job:** Continue building CareerPilot based on this spec.  
**Timeline:** 3 days to MVP launch.  
**Repo:** https://github.com/jimmyceo/careerpilot

---

## 1. WHAT WE'RE BUILDING

**Product:** CareerPilot — An AI-powered job search copilot that helps job seekers:
- Upload and analyze their resume with AI
- Generate tailored, ATS-optimized CVs for specific job descriptions
- Track job applications in a dashboard
- (Phase 2) Auto-scan job portals for matching positions

**Value Proposition:** "Upload once. Get perfect CVs for every job application. Land interviews faster."

**Target Users:**
- Job seekers applying to multiple positions
- Professionals wanting tailored CVs without manual work
- Career changers needing repositioned resumes
- Global market (not niche-specific)

**Pricing:**
- One-time: €49 (MVP — simple, no subscription complexity)
- Includes: Unlimited CV generations, AI resume analysis, application tracker

---

## 2. MVP SCOPE (3 Days)

### Day 1 — Backend + Foundation ✅ COMPLETE
- [x] FastAPI backend scaffold
- [x] Resume upload endpoint (PDF/DOC/TXT)
- [x] AI resume analysis (extract skills, experience, seniority)
- [x] CV generation endpoint (tailored to job description)
- [x] Database models (User, Resume, CV)
- [x] SQLAlchemy integration

### Day 2 — Frontend + Payments ✅ COMPLETE
- [x] Next.js frontend with Tailwind
- [x] Landing page with pricing
- [x] Upload page with drag-drop
- [x] Dashboard with stats
- [x] CV generation flow
- [x] Stripe payment integration
- [x] Payment webhook handler
- [x] PDF generation service

### Day 3 — Deploy + Launch ⏳ IN PROGRESS
- [ ] Docker containerization
- [ ] Vercel deployment (frontend)
- [ ] VPS deployment (backend)
- [ ] Environment variables setup
- [ ] Stripe live mode
- [ ] Launch marketing
- [ ] Product Hunt submission
- [ ] Landing page with payment CTA
- [ ] Resume upload UI with drag-drop
- [ ] Dashboard (view generated CVs, track applications)
- [ ] Job description input + CV generation flow
- [ ] Payment flow (Stripe checkout)

### Day 3 — Polish + Deploy
- [ ] PDF generation and download
- [ ] Vercel deployment (frontend)
- [ ] VPS deployment (backend)
- [ ] Stripe webhooks for payment confirmation
- [ ] Launch to Product Hunt / Reddit

### Out of Scope (Phase 2)
- Auto job portal scanning (Greenhouse, Ashby, Lever APIs)
- Cover letter generation
- Interview prep
- Subscription model
- User auth (use simple email + payment confirmation)

---

## 3. TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + Tailwind CSS | Web UI, landing page, dashboard |
| Backend | Python FastAPI | API, AI processing, file handling |
| AI | Ollama Cloud (Kimi models) | Resume analysis, CV generation |
| Database | Supabase (PostgreSQL) | User data, CV history, applications |
| Auth | Supabase Auth (or simple email) | User accounts |
| Storage | Supabase Storage | Resume uploads, generated PDFs |
| Payments | Stripe | One-time €49 purchase |
| PDF Gen | Playwright + HTML templates | Convert AI-generated CVs to PDF |
| Deployment | Vercel (frontend), VPS (backend) | Hosting |

---

## 4. PROJECT STRUCTURE

```
careerpilot/
├── README.md
├── CLAUDE_BIBLE.md (this file)
├── backend/
│   ├── main.py (FastAPI app)
│   ├── requirements.txt
│   ├── models.py (database models)
│   ├── services/
│   │   ├── resume_analyzer.py (AI analysis)
│   │   ├── cv_generator.py (AI CV generation)
│   │   └── pdf_generator.py (HTML to PDF)
│   └── routers/
│       ├── resume.py
│       ├── cv.py
│       └── payment.py
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (landing)
│   │   │   ├── upload/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── generate/page.tsx
│   │   └── components/
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.js
├── templates/
│   └── cv-template.html (for PDF generation)
└── uploads/ (temporary storage)
```

---

## 5. API ENDPOINTS

### Resume Endpoints

```python
POST /api/resume/upload
- Input: multipart/form-data (PDF/DOC/TXT file)
- Output: { file_id, file_path, message }
- Stores file, returns ID for analysis

POST /api/resume/analyze
- Input: { file_id }
- Output: { 
    skills: [...],
    experience_years: number,
    seniority: "junior|mid|senior",
    industry: string,
    suggested_roles: [...],
    strengths: [...],
    improvement_areas: [...]
  }
- Uses AI to analyze resume content
```

### CV Generation Endpoints

```python
POST /api/cv/generate
- Input: { 
    resume_file_id: string,
    job_description: string,
    job_title: string,
    company: string
  }
- Output: { cv_id, cv_html, preview_url }
- Generates tailored CV using AI

GET /api/cv/{cv_id}/download
- Input: cv_id
- Output: PDF file
- Converts HTML CV to PDF using Playwright

GET /api/cv/user/{user_id}
- Input: user_id
- Output: [list of generated CVs]
```

### Payment Endpoints

```python
POST /api/payment/create-checkout
- Input: { email }
- Output: { checkout_url }
- Creates Stripe Checkout session for €49

POST /api/payment/webhook
- Input: Stripe webhook payload
- Output: 200 OK
- Confirms payment, activates user account
```

---

## 6. DATABASE SCHEMA

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    stripe_payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    ai_analysis JSONB, -- stores analysis results
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Generated CVs table
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    resume_id UUID REFERENCES resumes(id),
    job_title TEXT,
    company TEXT,
    job_description TEXT,
    cv_html TEXT NOT NULL,
    pdf_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Application tracking (simple MVP version)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    cv_id UUID REFERENCES cvs(id),
    company TEXT,
    role TEXT,
    status TEXT DEFAULT 'applied', -- applied, interview, rejected, offer
    applied_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. KEY FEATURES SPEC

### Resume Upload & Analysis
1. User drags/drops resume (PDF, DOC, DOCX, TXT)
2. File saved to Supabase Storage
3. AI extracts text (use PyPDF2, python-docx, or simple text extraction)
4. AI analyzes:
   - Technical and soft skills
   - Years of experience
   - Industry focus
   - Seniority level
   - Suggested job titles
   - Improvement areas

### CV Generation
1. User pastes job description
2. User enters job title and company name
3. AI generates CV HTML that:
   - Matches keywords from job description
   - Highlights relevant experience
   - Uses ATS-friendly formatting
   - Includes quantifiable achievements
4. Convert HTML to PDF using Playwright
5. User downloads PDF

### Payment Flow
1. Landing page → "Get Started €49" → /upload (requires auth/payment check)
2. If not paid: redirect to Stripe Checkout
3. Stripe webhook confirms payment → activate user
4. Redirect to dashboard

---

## 8. AI PROMPTS

### Resume Analysis Prompt
```
You are an expert resume analyzer and career coach.

Analyze this resume text and extract:
1. Key skills (technical and soft) - list top 10
2. Years of experience (total)
3. Industry focus (e.g., tech, finance, healthcare)
4. Seniority level (junior: 0-2 yrs, mid: 3-5 yrs, senior: 6+ yrs)
5. Suggested job titles this person should target
6. Key strengths based on achievements
7. Areas for improvement

Resume text:
{resume_text}

Return ONLY valid JSON:
{
  "skills": [...],
  "experience_years": number,
  "industry": string,
  "seniority": "junior|mid|senior",
  "suggested_roles": [...],
  "strengths": [...],
  "improvement_areas": [...]
}
```

### CV Generation Prompt
```
You are an expert CV writer specializing in ATS-optimized resumes.

Given:
- Resume: {resume_text}
- Job Description: {job_description}
- Job Title: {job_title}
- Company: {company}

Generate an ATS-optimized CV in HTML format that:
1. Matches keywords from the job description
2. Highlights the most relevant experience
3. Uses professional, clean formatting
4. Includes quantifiable achievements where possible
5. Is tailored specifically for this role

Return ONLY the HTML content. No markdown code blocks. The HTML should be a complete document with inline CSS for styling.
```

---

## 9. CURRENT STATUS (Last Updated)

**Day 1 — In Progress:**
- ✅ Repo created: https://github.com/jimmyceo/careerpilot
- ✅ Backend scaffold (FastAPI)
- ✅ Frontend scaffold (Next.js)
- ✅ Landing page created
- ✅ Upload page created
- 🔄 Resume analysis endpoint (in progress)
- 🔄 Database setup
- ⏳ Stripe integration

**Next Tasks:**
1. Complete resume upload + AI analysis endpoint
2. Set up Supabase database
3. Create CV generation endpoint
4. Add Stripe payment flow
5. Build dashboard UI
6. Add PDF generation

---

## 10. HOW TO CONTINUE

### If You're Taking Over This Build:

1. **Read this file completely** — This is your source of truth
2. **Check the repo** — See what's already committed
3. **Continue Day 1 tasks** — Backend API completion
4. **Commit regularly** — `git add -A && git commit -m "Day X: Description"`
5. **Update this file** — Mark tasks complete, add notes

### Running the Project:

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Testing:
- Landing page: http://localhost:3000
- Upload page: http://localhost:3000/upload
- API docs: http://localhost:8000/docs (FastAPI auto-generated)

---

## 11. NOTES FOR FUTURE AGENTS

**What Works:**
- FastAPI + Next.js stack is solid
- Ollama Cloud AI is already configured in company_config.py
- Stripe keys are in .env

**What Needs Attention:**
- PDF text extraction from uploaded files (use PyPDF2, python-docx)
- PDF generation from HTML (use Playwright)
- Supabase setup (credentials in .env)
- Stripe webhook handling for payment confirmation

**Known Issues:**
- None yet (build just started)

**Questions for Human:**
- Should we require signup before upload, or after?
- Any specific CV template styling preferences?
- Launch timeline firm at 3 days or flexible?

---

**END OF BIBLE**

*Last Updated: Day 1 of 3*  
*Next Update: When Day 2 begins*
