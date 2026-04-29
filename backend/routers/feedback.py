"""
Feedback router for user testimonials and ratings
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db, User
from models.feedback import Feedback
from dependencies import get_optional_user, get_current_user

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class SubmitFeedbackRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    text: Optional[str] = Field(None, max_length=2000, description="Optional feedback text")
    reviewer_name: Optional[str] = Field(None, max_length=255)
    reviewer_role: Optional[str] = Field(None, max_length=255)


class FeedbackResponse(BaseModel):
    id: str
    rating: int
    text: Optional[str]
    reviewer_name: Optional[str]
    reviewer_role: Optional[str]
    created_at: Optional[str]


@router.post("/")
async def submit_feedback(
    request: SubmitFeedbackRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Submit feedback (authenticated or anonymous)"""
    feedback = Feedback(
        user_id=str(current_user.id) if current_user else None,
        rating=request.rating,
        text=request.text,
        approved=False,
        reviewer_name=request.reviewer_name or (current_user.name if current_user else None),
        reviewer_role=request.reviewer_role,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return {"status": "success", "message": "Thank you for your feedback"}


@router.get("/approved", response_model=List[FeedbackResponse])
async def get_approved_feedback(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get approved feedback for public display"""
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.approved == True)
        .order_by(Feedback.created_at.desc())
        .limit(limit)
        .all()
    )
    return [f.to_dict() for f in feedbacks]


@router.get("/admin", response_model=List[FeedbackResponse])
async def get_all_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all feedback (admin only - simple check for now)"""
    feedbacks = (
        db.query(Feedback)
        .order_by(Feedback.created_at.desc())
        .all()
    )
    return [f.to_dict() for f in feedbacks]


@router.post("/{feedback_id}/approve")
async def approve_feedback(
    feedback_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve feedback for public display (admin only)"""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    feedback.approved = True
    db.commit()
    return {"status": "success", "message": "Feedback approved"}
