"""
Hunt-X API - Main Application
Career-ops ported to SaaS
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os

# Load environment variables before other imports
from dotenv import load_dotenv
load_dotenv()

# Import models and initialize
from models import engine, Base
from models import (
    User, Resume, Evaluation, CV, CoverLetter,
    InterviewPrep, ChatSession, ChatMessage,
    ScrapedJob, SavedJob
)

# Import routers
from routers import (
    auth,
    resumes,
    evaluation,
    cv,
    cover_letter,
    interview,
    chat,
    jobs,
    subscriptions
)
from routers.payment_v2 import router as payment_v2_router
from routers.feedback import router as feedback_router

# Create FastAPI app
app = FastAPI(
    title="Hunt-X API",
    description="AI-powered job search platform",
    version="0.2.0"
)

# CORS middleware - configurable origins for security
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
# Allow all in development; restrict in production
if os.getenv("ENVIRONMENT", "development").lower() == "production":
    allowed_origins = [origin.strip() for origin in _cors_origins.split(",") if origin.strip()]
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(evaluation.router)
app.include_router(cv.router)
app.include_router(cover_letter.router)
app.include_router(interview.router)
app.include_router(chat.router)
app.include_router(jobs.router)
app.include_router(subscriptions.router)
app.include_router(payment_v2_router)
app.include_router(feedback_router)

# Upload directories
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
PDF_DIR = Path(os.getenv("PDF_DIR", "./uploads/pdfs"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "version": "0.2.0",
        "features": [
            "auth",
            "resumes",
            "evaluation",
            "cv_generation",
            "cover_letter",
            "interview_prep",
            "chat_assist",
            "job_scraper",
            "subscriptions"
        ]
    }


@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database initialized")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# Build 1776873896
# Build 1776873917
# Wed Apr 22 19:23:44 EEST 2026
