"""
Hunt-X API - Main Application
Career-ops ported to SaaS
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
import os

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger("hunt-x")

# Load environment variables before other imports
from dotenv import load_dotenv
load_dotenv()

# Rate limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter

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
from routers.applications import router as applications_router
from routers.profiles import router as profiles_router
from routers.roaster import router as roaster_router

# Create FastAPI app
app = FastAPI(
    title="Hunt-X API",
    description="AI-powered job search platform",
    version="0.2.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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

# Body size limit middleware (10MB)
MAX_BODY_SIZE = 10 * 1024 * 1024

class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large. Maximum size is 10MB."}
            )
        return await call_next(request)

app.add_middleware(BodySizeLimitMiddleware)

# Request logging middleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_host = request.client.host if request.client else "unknown"

        # Try to extract user_id from auth header for logging
        user_id = None
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            from dependencies import decode_token
            try:
                token = auth_header.split(" ")[1]
                payload = decode_token(token)
                user_id = payload.get("sub") if payload else None
            except Exception:
                pass

        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000
            log_msg = (
                f"{request.method} {request.url.path} "
                f"{response.status_code} {duration:.1f}ms "
                f"ip={client_host}"
            )
            if user_id:
                log_msg += f" user={user_id}"
            logger.info(log_msg)
            return response
        except Exception as exc:
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"{request.method} {request.url.path} "
                f"ERROR {duration:.1f}ms ip={client_host} error={exc}"
            )
            raise

app.add_middleware(RequestLoggingMiddleware)

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
app.include_router(applications_router)
app.include_router(profiles_router)
app.include_router(roaster_router)

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
    logger.info("Database initialized")

    # Auto-migrate: add missing columns for PostgreSQL
    _add_missing_columns()


def _add_missing_columns():
    """Add missing columns to existing tables (safe for production)."""
    from sqlalchemy import inspect as sa_inspect, text
    from sqlalchemy.exc import ProgrammingError

    inspector = sa_inspect(engine)
    dialect = engine.dialect.name

    def column_exists(table: str, column: str) -> bool:
        return column in {c["name"] for c in inspector.get_columns(table)}

    def add_column(table: str, column: str, col_type: str):
        if column_exists(table, column):
            return
        try:
            with engine.connect() as conn:
                if dialect == "postgresql":
                    conn.execute(text(f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}'))
                else:
                    conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {col_type}'))
                conn.commit()
            logger.info(f"Added column {table}.{column}")
        except Exception as e:
            logger.warning(f"Could not add column {table}.{column}: {e}")

    # users table migrations
    add_column("users", "email_verified", "BOOLEAN DEFAULT FALSE")
    add_column("users", "verification_code", "VARCHAR(10)")
    add_column("users", "verification_expires", "TIMESTAMP WITH TIME ZONE")
    add_column("users", "reset_token", "VARCHAR(255)")
    add_column("users", "reset_token_expires", "TIMESTAMP WITH TIME ZONE")

    # cover_letters table migrations (added later)
    if "cover_letters" in inspector.get_table_names():
        add_column("cover_letters", "evaluation_id", "VARCHAR(36)")

    # cvs table migrations
    if "cvs" in inspector.get_table_names():
        add_column("cvs", "evaluation_id", "VARCHAR(36)")

    # interview_preps table migrations
    if "interview_preps" in inspector.get_table_names():
        add_column("interview_preps", "evaluation_id", "VARCHAR(36)")

    # resumes table migrations
    if "resumes" in inspector.get_table_names():
        add_column("resumes", "raw_text", "TEXT")

    logger.info("Column migration completed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# Build 1776873896
# Build 1776873917
# Wed Apr 22 19:23:44 EEST 2026
