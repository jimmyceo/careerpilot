"""
Application tracker router
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db, User
from models.application import Application
from dependencies import get_current_user

router = APIRouter(prefix="/api/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    stage: str = Field(default="applied")
    date: Optional[str] = Field(None)
    notes: Optional[str] = Field(None, max_length=5000)
    url: Optional[str] = Field(None, max_length=1000)
    salary: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)


class ApplicationUpdate(BaseModel):
    company: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    stage: Optional[str] = Field(None)
    date: Optional[str] = Field(None)
    notes: Optional[str] = Field(None, max_length=5000)
    url: Optional[str] = Field(None, max_length=1000)
    salary: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)


@router.get("/")
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all applications for current user"""
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )
    return {
        "status": "success",
        "applications": [a.to_dict() for a in apps]
    }


@router.post("/")
async def create_application(
    request: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new application"""
    app = Application(
        user_id=current_user.id,
        company=request.company,
        role=request.role,
        stage=request.stage,
        date=request.date,
        notes=request.notes,
        url=request.url,
        salary=request.salary,
        location=request.location,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {
        "status": "success",
        "application": app.to_dict()
    }


@router.get("/{app_id}")
async def get_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return {
        "status": "success",
        "application": app.to_dict()
    }


@router.put("/{app_id}")
async def update_application(
    app_id: str,
    request: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(app, field, value)

    db.commit()
    db.refresh(app)
    return {
        "status": "success",
        "application": app.to_dict()
    }


@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
    return {
        "status": "success",
        "message": "Application deleted"
    }
