"""
FastAPI dependencies
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import hashlib
import base64

from models import get_db, User

# Security setup
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # Truncate to 72 bytes to avoid bcrypt limitation
    truncated = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(truncated, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password - bcrypt has 72 byte limit"""
    # Truncate to 72 bytes to avoid bcrypt limitation
    truncated = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated)


def create_access_token(data: dict, remember_me: bool = False) -> str:
    """Create JWT access token"""
    from datetime import datetime, timedelta
    to_encode = data.copy()
    minutes = ACCESS_TOKEN_EXPIRE_MINUTES * 30 if remember_me else ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User | None:
    """Get user if token provided, otherwise None"""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


# Service dependencies (for injection)
async def get_chat_service():
    """Get chat assist service"""
    from services.chat_assist_service import ChatAssistService
    from ai.client import AIClient
    return ChatAssistService(AIClient())


async def get_job_scraper_service():
    """Get job scraper service"""
    from services.job_scraper_service import JobScraperService
    from ai.client import AIClient
    return JobScraperService(AIClient())


async def get_cover_letter_service():
    """Get cover letter service"""
    from services.cover_letter_service import CoverLetterService
    from services.resume_pdf_service import ResumePDFService
    from ai.client import AIClient
    pdf_service = ResumePDFService(AIClient())
    return CoverLetterService(AIClient(), pdf_service)


async def get_evaluation_service():
    """Get evaluation service"""
    from services.evaluation_service import EvaluationService
    from ai.client import AIClient
    return EvaluationService(AIClient())


async def get_cv_service():
    """Get CV service"""
    from services.cv_service import CVService
    from services.resume_pdf_service import ResumePDFService
    from ai.client import AIClient
    pdf_service = ResumePDFService(AIClient())
    return CVService(AIClient(), pdf_service)


async def get_interview_service():
    """Get interview service"""
    from services.interview_service import InterviewService
    from ai.client import AIClient
    return InterviewService(AIClient())


async def get_resume_pdf_service():
    """Get resume PDF service"""
    from services.resume_pdf_service import ResumePDFService
    from ai.client import AIClient
    return ResumePDFService(AIClient())
