"""
Authentication router
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from limiter import limiter
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import secrets
import os
import httpx

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

from models import get_db, User
from dependencies import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from services.email_service import email_service


class GoogleAuthRequest(BaseModel):
    id_token: str


class VerifyEmailRequest(BaseModel):
    code: str


class VerifyEmailResponse(BaseModel):
    success: bool
    message: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    tier: str
    jobs_remaining: int
    email_verified: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class PasswordResetResponse(BaseModel):
    success: bool
    message: str


@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        import secrets
        user = User(
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            name=user_data.name,
            tier="free",
            jobs_remaining=5,
            email_verified=False,
            verification_code=secrets.token_urlsafe(16)[:8].upper(),
            verification_expires=datetime.utcnow() + timedelta(hours=24)
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Send verification email (async-ish via background task would be better, but sync for now)
        email_service.send_verification(user.email, user.verification_code, user.name)

        # Create token
        token = create_access_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
                tier=user.tier,
                jobs_remaining=user.jobs_remaining,
                email_verified=user.email_verified
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("hunt-x.auth").error(f"Registration error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create token (30 days if remember me)
    token = create_access_token({"sub": str(user.id)}, remember_me=credentials.remember_me)

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            tier=user.tier,
            jobs_remaining=user.jobs_remaining,
            email_verified=user.email_verified
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        tier=current_user.tier,
        jobs_remaining=current_user.jobs_remaining,
        email_verified=current_user.email_verified
    )


@router.put("/me", response_model=UserResponse)
async def update_me(
    name: Optional[str] = None,
    phone: Optional[str] = None,
    location: Optional[str] = None,
    linkedin_url: Optional[str] = None,
    github_url: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    if name is not None:
        current_user.name = name
    if phone is not None:
        current_user.phone = phone
    if location is not None:
        current_user.location = location
    if linkedin_url is not None:
        current_user.linkedin_url = linkedin_url
    if github_url is not None:
        current_user.github_url = github_url
    db.commit()
    db.refresh(current_user)
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        tier=current_user.tier,
        jobs_remaining=current_user.jobs_remaining,
        email_verified=current_user.email_verified
    )


@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    request: VerifyEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify email with code"""
    if current_user.email_verified:
        return VerifyEmailResponse(success=True, message="Email already verified")

    if not current_user.verification_code or current_user.verification_code != request.code.upper():
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if current_user.verification_expires and current_user.verification_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code expired")

    current_user.email_verified = True
    current_user.verification_code = None
    current_user.verification_expires = None
    db.commit()

    return VerifyEmailResponse(success=True, message="Email verified successfully")


@router.post("/resend-verification", response_model=VerifyEmailResponse)
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resend verification email"""
    if current_user.email_verified:
        return VerifyEmailResponse(success=True, message="Email already verified")

    current_user.verification_code = secrets.token_urlsafe(16)[:8].upper()
    current_user.verification_expires = datetime.utcnow() + timedelta(hours=24)
    db.commit()

    email_service.send_verification(current_user.email, current_user.verification_code, current_user.name)
    return VerifyEmailResponse(success=True, message="Verification email sent")


@router.post("/forgot-password", response_model=PasswordResetResponse)
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    request_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Request password reset token"""
    user = db.query(User).filter(User.email == request_data.email).first()
    if not user:
        # Don't reveal if email exists
        return PasswordResetResponse(
            success=True,
            message="If an account exists, a reset link has been sent."
        )

    # Generate secure token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.commit()

    email_service.send_password_reset(user.email, token, user.name)

    return PasswordResetResponse(
        success=True,
        message="If an account exists, a reset link has been sent."
    )


@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user = db.query(User).filter(
        User.reset_token == request.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Update password
    password_bytes = request.new_password.encode('utf-8')[:72]
    truncated_password = password_bytes.decode('utf-8', errors='ignore')
    user.password_hash = get_password_hash(truncated_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return PasswordResetResponse(
        success=True,
        message="Password has been reset successfully."
    )


@router.post("/change-password", response_model=PasswordResetResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password while logged in"""
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    password_bytes = request.new_password.encode('utf-8')[:72]
    truncated_password = password_bytes.decode('utf-8', errors='ignore')
    current_user.password_hash = get_password_hash(truncated_password)
    db.commit()

    return PasswordResetResponse(
        success=True,
        message="Password updated successfully"
    )


@router.post("/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Refresh access token"""
    token = create_access_token({"sub": str(current_user.id)})
    return {"access_token": token, "token_type": "bearer"}


async def _verify_google_id_token(id_token: str) -> dict:
    """Verify a Google ID token and return the payload."""
    from jose import jwt as jose_jwt
    from jose.exceptions import JWTError

    # Fetch Google's public keys
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://www.googleapis.com/oauth2/v3/certs")
        resp.raise_for_status()
        certs = resp.json()

    # Try each key
    for key in certs.get("keys", []):
        try:
            payload = jose_jwt.decode(
                id_token,
                key,
                algorithms=["RS256"],
                audience=os.getenv("GOOGLE_CLIENT_ID", ""),
                issuer=["https://accounts.google.com", "accounts.google.com"]
            )
            return payload
        except JWTError:
            continue

    raise HTTPException(status_code=400, detail="Invalid Google ID token")


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """Authenticate with Google ID token. Creates or links user account."""
    try:
        payload = await _verify_google_id_token(request.id_token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token verification failed: {str(e)}")

    google_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("name") or payload.get("given_name", "")

    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Invalid token: missing email or sub")

    # Find existing user by google_id or email
    user = db.query(User).filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()

    if user:
        # Link google_id if not already linked
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
        # Update name if empty
        if not user.name and name:
            user.name = name
            db.commit()
    else:
        # Create new user
        import secrets
        random_password = secrets.token_urlsafe(32)
        user = User(
            email=email,
            password_hash=get_password_hash(random_password),
            name=name,
            google_id=google_id,
            tier="free",
            jobs_remaining=5,
            email_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            tier=user.tier,
            jobs_remaining=user.jobs_remaining,
            email_verified=user.email_verified
        )
    )
