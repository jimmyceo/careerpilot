# Hunt-X OpenCoDesign Prompts

Copy-paste each prompt into OpenCoDesign's prompt box (one per design session).

---

## Prompt 1: Landing Page (Marketing)

```
Build a modern SaaS landing page for "Hunt-X" — an AI-powered job search copilot.

NAVIGATION (sticky, white bg, blur backdrop):
- Left: Hunt-X logotype (sohne-var 20px weight 400, #061b31)
- Center links: Features, How It Works, Pricing, FAQ
- Right: "Sign In" ghost button + "Get Started" purple CTA (#533afd, 4px radius)

HERO SECTION (white bg, centered, max-width 1080px):
- Eyebrow badge: "AI-Powered Job Search" — neutral pill, 11px, #64748d
- Headline: "Land Your Dream Job, Faster." — 56px sohne-var weight 300, letter-spacing -1.4px, #061b31, font-feature-settings "ss01"
- Subheadline: "Upload your resume, get AI-optimized CVs, discover matching jobs, and track every application — all in one place." — 18px weight 300, line-height 1.40, #64748d
- Two CTAs side by side:
  1. Primary: "Start Free" — #533afd bg, white text, 4px radius, 8px 16px padding, 16px sohne-var weight 400
  2. Ghost: "View Demo" — transparent bg, 1px solid #b9b9f9, #533afd text
- Hero image/dashboard mockup below — white card with blue-tinted shadow: rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px

LOGOS / TRUST BAR:
- "Trusted by job seekers at" + 5 company logos (grayscale, 40px height)
- Subtle #e5edf5 top/bottom borders

FEATURES SECTION (white bg):
- Section label: "FEATURES" — 12px sohne-var weight 400, #64748d, uppercase, letter-spacing 0.1px
- Headline: "Everything You Need to Win the Job Hunt" — 32px weight 300, #061b31
- 3-column grid of feature cards:
  Card 1: "AI Resume Analysis"
    - Icon: document-scan (lucide), #533afd
    - Title: 22px weight 300, #061b31
    - Body: "Upload your resume and get instant AI feedback on structure, keywords, and ATS compatibility." 16px #64748d
    - Card style: white bg, 1px solid #e5edf5, 6px radius, shadow rgba(23,23,23,0.08) 0px 15px 35px
  Card 2: "Tailored CV Generation"
    - Icon: file-plus, #533afd
    - "Generate ATS-optimized CVs tailored to any job description in seconds."
  Card 3: "Smart Job Discovery"
    - Icon: search, #533afd
    - "AI scans LinkedIn, Indeed, and 50+ portals to find jobs that actually match your profile."
  Card 4: "Application Tracker"
    - Icon: layout-dashboard, #533afd
    - "Never lose track of an application. Visual pipeline from applied to offer."
  Card 5: "Interview Prep"
    - Icon: messages-square, #533afd
    - "AI-generated interview questions and answers based on your target role."
  Card 6: "Cover Letters"
    - Icon: mail, #533afd
    - "Personalized cover letters that match the job and highlight your strengths."

HOW IT WORKS (light gray bg #f6f9fc):
- Headline: "How Hunt-X Works" — 32px weight 300
- 3-step horizontal timeline:
  Step 1: "Upload" — dashed circle with "1", 26px title, 16px body
  Step 2: "Analyze" — dashed circle with "2"
  Step 3: "Apply & Track" — dashed circle with "3"
- Connecting line between steps: 1px dashed #b9b9f9

PRICING PREVIEW (white bg):
- Headline: "Simple, Transparent Pricing" — 32px weight 300
- 4 cards in a row:
  Free: €0/mo — "5 job scans, 1 CV/month"
  Starter: €9/mo — "20 job scans, 5 CVs/month"
  Pro: €29/mo — "Unlimited scans, unlimited CVs, interview prep" (featured — purple top border 4px, slightly elevated shadow)
  Team: €49/mo — "Everything in Pro + team collaboration"
- Each card: white bg, 1px solid #e5edf5, 6px radius, 22px tier name, 48px price (weight 300, #061b31), 16px description, purple CTA button
- "View Full Pricing" link below — #533afd, 14px weight 400

CTA SECTION (dark brand bg #1c1e54):
- Headline: "Ready to Supercharge Your Job Search?" — 32px weight 300, white
- Body: "Join thousands of job seekers who landed offers faster with Hunt-X." — 16px rgba(255,255,255,0.7)
- CTA: "Get Started Free" — white bg, #533afd text, 4px radius

FOOTER (white bg, #e5edf5 top border):
- 4 columns: Product, Resources, Company, Legal
- Bottom bar: "© 2026 Hunt-X. All rights reserved." + social icons
- All links: 14px sohne-var weight 400, #64748d

STYLE RULES:
- Font: sohne-var with "ss01" OpenType feature on ALL text. Fallback: SF Pro Display
- Headlines weight 300. UI elements (buttons, nav) weight 400.
- Deep navy #061b31 for headings. Slate #64748d for body.
- Purple #533afd for all interactive elements.
- Border-radius: 4px buttons, 6px cards, 6px nav.
- Shadows: blue-tinted rgba(50,50,93,0.25) for elevated cards.
- Max content width: 1080px, centered.
- Base spacing unit: 8px.
- Responsive: single column on mobile, 2-col tablet, 3-col desktop.
```

---

## Prompt 2: Auth Page (Login / Register)

```
Build a clean split-screen authentication page for Hunt-X.

LEFT PANEL (45% width, dark brand bg #1c1e54):
- Centered content, vertically aligned:
  - Hunt-X logotype (white, 24px sohne-var weight 400)
  - Large headline: "Welcome Back." — 48px sohne-var weight 300, white, letter-spacing -0.96px, "ss01"
  - Subheadline: "Your next career move starts here." — 18px weight 300, rgba(255,255,255,0.7)
  - Decorative illustration: abstract geometric shapes in purple (#533afd) and magenta (#f96bee) gradients, subtle opacity 0.3
  - Bottom quote: "Hunt-X helped me land 3 interviews in my first week." — 14px italic, rgba(255,255,255,0.5)
  - Quote author: "— Sarah K., Product Designer" — 12px, rgba(255,255,255,0.4)

RIGHT PANEL (55% width, white bg):
- Centered card, max-width 420px:
  - Tab toggle: "Sign In" | "Create Account" — 14px weight 400, active tab has #061b31 text with #533afd underline 2px

  SIGN IN FORM:
  - Email input: label "Email" 14px #273951, input field 1px solid #e5edf5, 4px radius, focus ring #533afd
  - Password input: same style + eye icon toggle
  - "Forgot password?" link: 13px #533afd, right-aligned
  - Submit button: "Sign In" — full width, #533afd bg, white text, 4px radius, 12px 16px padding, 16px weight 400
  - Divider: "or continue with" — 13px #64748d, horizontal lines on sides
  - Social buttons: Google, GitHub — ghost style, 1px solid #e5edf5, 4px radius, icon + text

  REGISTER FORM (same card, toggled):
  - Name input
  - Email input
  - Password input + strength indicator (weak/medium/strong — ruby #ea2261 to success #15be53)
  - "By signing up, you agree to our Terms and Privacy Policy" — 12px #64748d, links in #533afd
  - Submit: "Create Account" — full width, #533afd

- Bottom text: "Don't have an account? Sign up" / "Already have an account? Sign in" — 14px #64748d, link #533afd

FORM STYLING:
- Labels: 14px sohne-var weight 400, #273951
- Inputs: 16px sohne-var, #061b31 text, #e5edf5 border, 4px radius, 12px 14px padding
- Placeholder: #64748d
- Focus: 2px solid #533afd ring, no outline
- Error state: border #ea2261, ruby text below input
- Success state: border #15be53

MOBILE (< 640px):
- Left panel hidden
- Right panel full width, centered card with 24px padding
- Dark gradient bg on mobile instead of full left panel

FONT: sohne-var "ss01" everywhere. Fallback SF Pro Display.
```

---

## Prompt 3: Dashboard (Main Application)

```
Build a full-featured SaaS dashboard for Hunt-X with sidebar navigation and data-rich main area.

LAYOUT:
- Full height, flex row
- Sidebar: 260px fixed width, white bg, 1px right border #e5edf5
- Main area: flex-1, #f6f9fc background, overflow-y auto

SIDEBAR:
- Top: Hunt-X logo (20px sohne-var #061b31) + hamburger toggle for mobile
- Navigation links (vertical list, 8px gap):
  - Overview — layout-dashboard icon, active: #533afd bg rgba(83,58,253,0.08), 4px radius
  - Job Search — search icon
  - My Resumes — file-text icon
  - CV Generator — file-plus icon
  - Cover Letters — mail icon
  - Interview Prep — messages-square icon
  - Application Tracker — kanban icon
  - Settings — settings icon
  - Each: 14px sohne-var weight 400, #64748d inactive, #061b31 active, 8px 12px padding
- Bottom section:
  - Credit indicator card: "Credits: 12/20" — 12px, progress bar (#533afd fill, #e5edf5 track), 4px radius
  - "Upgrade" link: 12px #533afd
  - User profile row: avatar circle (40px, #533afd bg, white initials), name 14px #061b31, email 12px #64748d

MAIN HEADER (sticky, white bg, 1px bottom border #e5edf5, 64px height):
- Left: Page title "Dashboard" — 26px sohne-var weight 300, #061b31, "ss01"
- Right: Notification bell (lucide bell, #64748d) + badge (8px circle, #ea2261) + "New" label

STATS ROW (4 cards, horizontal, 16px gap):
Card 1: "Jobs Applied"
  - Large number: "24" — 48px weight 300, #061b31
  - Label: "This month" — 13px #64748d
  - Trend: "+12%" — 12px success #15be53 with up arrow
  - Style: white bg, 6px radius, 1px solid #e5edf5, ambient shadow
Card 2: "Interviews Scheduled"
  - "5" — same style
  - "2 this week"
  - Trend: "+3" — #15be53
Card 3: "Resume Match Score"
  - "87%" — same style
  - "Average across 10 jobs"
  - Trend: "+5%" — #15be53
Card 4: "Credits Remaining"
  - "12" — #533afd color for number
  - "of 20 monthly"
  - Progress bar below: 60% fill

SECTION: "Recent Job Matches" (white card, 6px radius, 1px solid #e5edf5, padding 24px):
- Header row:
  - "Recent Job Matches" — 22px weight 300, #061b31
  - "View All" link — 14px #533afd
- Job list (vertical, 12px gap between items):
  Each job row:
  - Company logo placeholder: 40px circle, #f6f9fc bg, building icon #64748d
  - Job title: "Senior Frontend Engineer" — 16px weight 400, #061b31
  - Company: "Stripe" — 14px #64748d
  - Location: "Remote • Full-time" — 13px #64748d
  - Match score badge: "94%" — success badge style (rgba(21,190,83,0.2) bg, #108c9d text, 4px radius, 10px weight 300)
  - Salary: "€80k - €120k" — 14px #061b31
  - Actions: bookmark icon + "Apply" ghost button (#533afd border)
  - Row separator: 1px solid #f6f9fc
  - Hover: bg shifts to rgba(83,58,253,0.02)

SECTION: "Application Pipeline" (white card):
- Header: "Your Pipeline" — 22px weight 300
- Kanban-style columns (4 columns, equal width, 12px gap):
  Column 1: "Applied" — #64748d header, count badge, cards stacked vertically
  Column 2: "Interview" — #533afd header
  Column 3: "Offer" — #15be53 header
  Column 4: "Rejected" — #ea2261 header
  Each card in column:
    - Company: 14px weight 400, #061b31
    - Role: 13px #64748d
    - Date: 12px #64748d
    - Style: white bg, 1px solid #e5edf5, 4px radius, 12px padding

SECTION: "Quick Actions" (horizontal cards, 3 items):
Card 1: "Upload Resume"
  - Upload icon, #533afd
  - "Get AI feedback instantly"
  - Dashed border drop zone: 1px dashed #362baa, 6px radius, 40px padding
Card 2: "Generate CV"
  - File-plus icon
  - "Tailored to any job posting"
  - Purple CTA button
Card 3: "Practice Interview"
  - Mic icon
  - "AI-generated Q&A for your role"
  - Ghost button

SECTION: "Recent Activity" (smaller card, right side if space, or below):
- "Recent Activity" — 18px weight 300
- Vertical timeline:
  - Dot: 8px circle, #533afd
  - Line: 1px solid #e5edf5 connecting dots
  - "You applied to Senior Frontend at Stripe" — 14px #061b31
  - "2 hours ago" — 12px #64748d

FONT & STYLE:
- sohne-var "ss01" on all text. Fallback SF Pro Display.
- Headlines 300, UI 400.
- Navy #061b31, slate #64748d, purple #533afd.
- Cards: 6px radius, 1px solid #e5edf5, ambient shadows.
- Spacing: 8px base unit, 24px section gaps.
- Responsive: sidebar collapses to hamburger on tablet/mobile, single column cards.
```

---

## Prompt 4: Pricing Page

```
Build a pricing page for Hunt-X with 4 tier cards and clear feature comparisons.

HEADER (same as landing page nav — sticky, white, blur backdrop).

HERO:
- Eyebrow: "PRICING" — 12px uppercase, #64748d, letter-spacing 0.1px
- Headline: "Simple Pricing, Powerful Results" — 48px weight 300, #061b31, letter-spacing -0.96px, "ss01"
- Subheadline: "Start free. Upgrade when you're ready to accelerate your job search." — 18px weight 300, #64748d
- Toggle: Monthly | Yearly — pill toggle, active: #061b31 bg white text, inactive: #f6f9fc bg #64748d text, 4px radius

PRICING CARDS (4 cards, horizontal, equal width, 16px gap, max-width 1080px):
All cards: white bg, 1px solid #e5edf5, 6px radius, 32px padding, vertical stack.

Card 1: FREE
- Tier name: "Free" — 14px weight 400, #64748d, uppercase
- Price: "€0" — 48px weight 300, #061b31
- Period: "/month" — 16px #64748d
- Description: "Perfect for trying out Hunt-X" — 16px #64748d
- CTA: "Get Started" — ghost button, 1px solid #b9b9f9, #533afd text, 4px radius, full width
- Features list (checkmarks + text):
  - 5 job scans per month
  - 1 CV generation
  - Basic resume analysis
  - Email support
  - Check icon: #15be53, 16px
  - Cross icon for missing features: #64748d with 0.4 opacity
- Feature text: 14px sohne-var, #64748d

Card 2: STARTER
- "Starter" — 14px #533afd (purple accent for paid tiers)
- "€9" — 48px #061b31
- "/month"
- "For active job seekers"
- CTA: "Start Starter" — #533afd bg, white text, full width
- Features:
  - 20 job scans per month
  - 5 CV generations
  - Full resume analysis
  - Cover letter generation
  - Priority email support

Card 3: PRO (FEATURED / RECOMMENDED)
- Top badge: "MOST POPULAR" — 10px weight 400, white text, #533afd bg, 4px radius, 4px 8px padding, centered above card
- Card has elevated shadow: rgba(50,50,93,0.25) 0px 30px 45px -30px
- Purple top border: 4px solid #533afd at top of card
- "Pro" — 14px #533afd
- "€29" — 48px #061b31
- "/month"
- "For serious job hunters"
- CTA: "Start Pro" — #533afd bg, white text, slightly larger padding (14px 24px), 4px radius
- Features (all checked):
  - Unlimited job scans
  - Unlimited CV generations
  - Advanced AI resume scoring
  - Unlimited cover letters
  - Interview prep & mock questions
  - Application tracker
  - Priority chat support

Card 4: TEAM
- "Team" — 14px #061b31
- "€49" — 48px #061b31
- "/month"
- "For teams & career coaches"
- CTA: "Contact Sales" — ghost button, #061b31 border, #061b31 text
- Features:
  - Everything in Pro
  - Up to 5 team members
  - Shared job boards
  - Team analytics dashboard
  - Dedicated account manager
  - API access

FEATURE COMPARISON TABLE (below cards, white card, 6px radius):
- Full comparison grid: features as rows, tiers as columns
- Header row: feature name | Free | Starter | Pro | Team
- Checkmarks: #15be53 for included, "—" for not included
- Alternating row bg: white / #f6f9fc
- Border: 1px solid #e5edf5
- Text: 14px sohne-var, #64748d for features, #061b31 for tier headers

FAQ SECTION (below pricing):
- "Frequently Asked Questions" — 32px weight 300
- Accordion items (4-5 questions):
  - "Can I cancel anytime?" — 16px weight 400, #061b31
  - Answer: 16px weight 300, #64748d, 14px padding below
  - Chevron icon rotates on open
  - Border bottom: 1px solid #e5edf5
  - Open state: answer visible + chevron up

CTA SECTION (same dark brand #1c1e54 as landing page):
- "Still have questions?" — 32px weight 300, white
- "Our team is here to help you choose the right plan." — 16px rgba(255,255,255,0.7)
- "Contact Support" — white bg, #533afd text

FOOTER: same as landing page.

FONT & STYLE:
- sohne-var "ss01" everywhere. Fallback: SF Pro Display.
- Headlines weight 300, UI weight 400.
- Navy #061b31, slate #64748d, purple #533afd, success #15be53.
- Border-radius: 4px buttons, 6px cards.
- Shadows: blue-tinted for featured card.
- Max-width: 1080px centered.
```

---

## Prompt 5: Upload & Generate Workflow

```
Build a multi-step upload and CV generation workflow page for Hunt-X.

LAYOUT:
- Same sidebar + main layout as Dashboard (Prompt 3)
- Main area: centered content, max-width 720px, single column
- Step indicator at top

STEP INDICATOR (horizontal, 4 steps):
- Step 1: Upload Resume — circle with checkmark or "1", active: #533afd circle white text, completed: #15be53 with checkmark, upcoming: #e5edf5 circle #64748d text
- Connecting line: 1px solid, active/completed: #533afd, upcoming: #e5edf5
- Labels below: 12px sohne-var, active: #061b31, completed: #15be53, upcoming: #64748d
- Steps: 1. Upload → 2. Analyze → 3. Customize → 4. Download

STEP 1: UPLOAD RESUME
- Section title: "Upload Your Resume" — 26px weight 300, #061b31
- Subtitle: "We'll analyze it and generate tailored documents for any job." — 16px #64748d
- Drop zone (large, centered, 200px height):
  - Border: 2px dashed #362baa (purple dashed)
  - Background: rgba(83,58,253,0.02)
  - Border-radius: 8px
  - Icon: upload-cloud (lucide), 48px, #533afd
  - Text: "Drag & drop your resume here" — 16px weight 400, #061b31
  - Subtext: "or click to browse — PDF, DOCX, TXT up to 5MB" — 14px #64748d
  - Hover state: bg rgba(83,58,253,0.05), border solid #533afd
  - Active/drag-over state: bg rgba(83,58,253,0.08), border 2px solid #533afd
- Recent uploads list below:
  - Each item: file icon + filename (14px #061b31) + size (12px #64748d) + date (12px #64748d) + "Use" button (ghost, #533afd)
  - Separator: 1px solid #f6f9fc

STEP 2: AI ANALYSIS RESULTS (after upload)
- Animated loading state: spinning loader (#533afd) + "Analyzing your resume..." — 16px #64748d
- Results card (white, 6px radius, 1px solid #e5edf5, shadow):
  - Header: "Analysis Complete" — 22px weight 300, #061b31 + success badge "87% Match Ready" (rgba(21,190,83,0.2) bg, #108c3d text)
  - Sections inside card:
    - Skills Detected: horizontal pill badges, each: #f6f9fc bg, #061b31 text, 4px radius, 12px weight 400
      Examples: React, TypeScript, Node.js, AWS, Tailwind CSS
    - Experience Level: "Senior (5+ years detected)" — 16px #061b31
    - Suggested Target Roles: pill badges, #533afd bg, white text
    - Improvement Tips:
      - List with lightbulb icon, #64748d text
      - "Add measurable outcomes to your experience bullets"
      - "Include more keywords from your target job descriptions"
      - "Quantify your impact with numbers and percentages"
  - "Continue to Customize" button: #533afd bg, white text, full width

STEP 3: CUSTOMIZE CV
- Section title: "Tailor Your CV" — 26px weight 300
- Two-column layout (60/40 split):
  LEFT: Job Details Form
    - "Paste Job Description" — label 14px #273951
    - Textarea: 200px height, 1px solid #e5edf5, 4px radius, focus #533afd, placeholder "Paste the job description here..."
    - "Or enter job URL" — input field below textarea
    - "Target Company" input
    - "Tone" select dropdown: Professional, Casual, Formal, Creative
    - "Emphasize" multi-select: Leadership, Technical Skills, Projects, Education
    - "Generate CV" button: #533afd bg, white text, full width, loading spinner when processing
  
  RIGHT: Live Preview Panel
    - Sticky, top: 24px
    - "Preview" — 14px #64748d uppercase
    - CV preview card (white bg, 1px solid #e5edf5, 6px radius, A4 proportion):
      - Header: name (22px #061b31), title (16px #64748d), contact row (14px #64748d)
      - Sections: Summary, Experience, Skills, Education
      - Styled like a clean ATS-friendly CV
    - "Regenerate" ghost button below preview
    - "Download PDF" primary button below

STEP 4: DOWNLOAD / SHARE
- Success animation: checkmark circle (64px, #15be53 bg, white check) with subtle scale-in
- Title: "Your CV is Ready!" — 32px weight 300, #061b31
- Stats row:
  - "ATS Score: 94%" — success badge
  - "Tailored for: Senior Frontend at Stripe" — 16px #64748d
  - "Generated in: 3.2s" — 16px #64748d
- Action buttons (horizontal, 16px gap):
  1. "Download PDF" — #533afd bg, white text, large (14px 32px), 4px radius, download icon
  2. "Download DOCX" — ghost, #533afd border
  3. "Copy Link" — ghost, #533afd border
- "Generate Cover Letter" secondary CTA below — outlined, #533afd
- "Start Over" text link — 14px #64748d

PROGRESSIVE DISCLOSURE:
- Each step is a full card with 32px padding
- Transitions between steps: fade + slight translateY (20px to 0)
- Step indicator updates as user progresses
- Back button on steps 2-4: "← Back" text link, 14px #64748d

STYLE:
- sohne-var "ss01" everywhere.
- Navy #061b31, slate #64748d, purple #533afd, success #15be53.
- Border-radius: 4px inputs, 6px cards, 8px drop zone.
- Shadows: ambient for cards, blue-tinted for elevated elements.
- Spacing: 8px base unit.
```

---

## Prompt 6: Job Search Results Page

```
Build a job search results page for Hunt-X with filters, job cards, and match scoring.

LAYOUT:
- Same sidebar + main layout as Dashboard
- Main area: two-column (280px sidebar filters + flex-1 results)

FILTERS SIDEBAR (280px, white bg, 1px right border #e5edf5, sticky):
- "Filters" header — 18px weight 300, #061b31
- Search input at top: magnifying glass icon, 1px solid #e5edf5, 4px radius
- Filter groups (vertical, 16px gap):
  
  Location:
  - Label: "Location" — 14px weight 400, #273951
  - Checkbox list: Remote, On-site, Hybrid — 14px #64748d, checkboxes 16px #533afd when checked
  
  Experience Level:
  - Entry Level, Mid Level, Senior, Lead — same checkbox style
  
  Job Type:
  - Full-time, Contract, Freelance, Part-time
  
  Salary Range:
  - Dual-handle slider: #533afd thumbs, #e5edf5 track, selected range rgba(83,58,253,0.2)
  - Min/max inputs beside slider
  
  Date Posted:
  - Radio group: Last 24h, Last Week, Last Month, Anytime — 14px #64748d
  
  Skills:
  - Input with tag chips: React, TypeScript, Python (pill badges, #f6f9fc bg, #061b31 text, X to remove)
  
- "Clear All" link: 14px #533afd, below all filters
- "Apply Filters" button: #533afd bg, white text, full width

RESULTS HEADER:
- "124 jobs found" — 26px weight 300, #061b31
- Sort dropdown: "Relevance" default — 14px #64748d, chevron icon
- View toggle: list icon | grid icon (active: #061b31, inactive: #64748d)

JOB CARDS (vertical list, 12px gap):
Each card: white bg, 1px solid #e5edf5, 6px radius, 20px padding, hover shadow rgba(50,50,93,0.1) 0px 10px 20px -10px

Card content (horizontal layout):
- Left: Company logo placeholder (48px circle, #f6f9fc, building icon)
- Middle (flex-1):
  - Job title: "Senior Frontend Engineer" — 18px weight 400, #061b31
  - Company + location: "Stripe — Remote • Dublin, IE" — 14px #64748d
  - Tags row: "Full-time" | "€80k-€120k" | "Posted 2d ago" — pill badges, 12px, #f6f9fc bg, #64748d text, 4px radius
  - Snippet: "We're looking for an experienced frontend engineer to lead our design system team..." — 14px #64748d, 2 lines max, ellipsis
  - Skills match: "React, TypeScript, Node.js" highlighted, other skills muted
- Right (160px, right-aligned):
  - Match score: "94%" — large 32px weight 300, color based on score:
    - 90-100%: #15be53
    - 70-89%: #533afd
    - 50-69%: #9b6829 (lemon/warning)
    - <50%: #ea2261 (ruby)
  - "Match" label: 12px #64748d
  - "Save" bookmark icon: #64748d, hover #533afd
  - "Apply" button: ghost, #533afd border, 14px, 4px radius

PAGINATION (below results):
- "← Previous" | 1 | 2 | 3 | ... | 12 | "Next →"
- Active page: #533afd bg, white text, 4px radius
- Inactive: #64748d, hover #061b31

EMPTY STATE (when no results):
- Search icon (48px, #e5edf5)
- "No jobs match your filters" — 22px weight 300, #061b31
- "Try adjusting your search criteria or clearing filters." — 16px #64748d
- "Clear Filters" button: #533afd

MOBILE:
- Filters collapse into slide-out drawer (hamburger toggle)
- Cards stack vertically, full width
- Match score moves below title

STYLE:
- sohne-var "ss01", navy #061b31, slate #64748d, purple #533afd.
- Cards 6px radius, inputs 4px.
- Ambient shadows for cards, blue-tinted for hover.
```

---

## How to Use These Prompts in OpenCoDesign

1. **Open the app** — Launch OpenCoDesign from Applications
2. **New Design** — Click "New Design" in the sidebar
3. **Paste prompt** — Copy one prompt above, paste into the prompt box
4. **Generate** — Click Generate and watch the agent build
5. **Iterate** — Use Comment Mode (click any element, drop a pin) to refine
6. **Export** — When satisfied, click Export → ZIP (multi-file)
7. **Integrate** — Extract into `Hunt-X/frontend/src/`, replacing existing pages

### Recommended Order:
1. Landing Page → establishes visual language
2. Auth Page → reuse the split-screen pattern
3. Dashboard → most complex, builds on landing styles
4. Pricing → cards + comparison table
5. Upload/Generate → multi-step wizard
6. Job Search → filters + results list

### After Exporting:
- Replace `frontend/src/app/page.tsx` with Landing Page
- Replace `frontend/src/app/auth/page.tsx` with Auth Page
- Replace `frontend/src/app/dashboard/page.tsx` with Dashboard
- Add `frontend/src/app/pricing/page.tsx` with Pricing
- Add `frontend/src/app/upload/page.tsx` with Upload/Generate
- Add `frontend/src/app/jobs/page.tsx` with Job Search
- Update `frontend/src/app/layout.tsx` with shared fonts + global styles
- Update `frontend/src/app/globals.css` with design tokens (colors, shadows, radius)
- Keep `frontend/src/lib/api.ts` for backend integration

### Post-Export Tweaks (Manual):
- Wire up form submissions to your FastAPI backend
- Replace placeholder data with API calls
- Add loading skeletons for async data
- Implement auth state (JWT token in localStorage, check on mount)
```
