"""
Resume router
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
import os
from pathlib import Path

from models import get_db, User, Resume
from dependencies import get_current_user, get_resume_pdf_service
from services.resume_pdf_service import ResumePDFService

router = APIRouter(prefix="/api/resume", tags=["resumes"])

# Upload directories
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
PDF_DIR = Path(os.getenv("PDF_DIR", "./uploads/pdfs"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)


class ResumeResponse(BaseModel):
    id: str
    original_filename: str
    file_size: int
    skills: List[str]
    experience_years: Optional[float]
    seniority_level: Optional[str]
    pdf_url: Optional[str]
    created_at: str


class ResumeDetailResponse(BaseModel):
    id: str
    original_filename: str
    file_size: int
    raw_text: str
    structured_data: Optional[dict]
    skills: List[str]
    experience_years: Optional[float]
    industry_focus: Optional[str]
    seniority_level: Optional[str]
    pdf_url: Optional[str]
    created_at: str


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pdf_service: ResumePDFService = Depends(get_resume_pdf_service)
):
    """
    Upload resume and parse with AI.
    Requires authenticated user.
    """

    # Validate file type
    allowed_extensions = [".pdf", ".doc", ".docx", ".txt"]
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse resume (placeholder - implement actual parsing)
    # TODO: Implement actual resume parsing (PyPDF2, python-docx, etc.)
    resume_text = "Parsed resume text would go here"

    # AI analysis
    from ai.client import AIClient
    ai = AIClient()

    # Extract skills, experience, etc.
    prompt = f"""Extract from this resume:
    1. Skills (technical and soft) - as a list
    2. Years of experience
    3. Industry focus
    4. Seniority level

    Resume: {resume_text[:3000]}

    Return JSON with: skills (list), experience_years (float), industry_focus (string), seniority_level (string)"""

    try:
        analysis = await ai.generate_json(prompt)
    except:
        analysis = {
            "skills": [],
            "experience_years": None,
            "industry_focus": None,
            "seniority_level": None
        }

    # Generate professional PDF
    try:
        pdf_result = await pdf_service.generate_resume_pdf(
            resume_text=resume_text,
            user_info={
                "name": user.name or user.email.split("@")[0],
                "email": user.email,
                "phone": user.phone or "",
                "location": user.location or "",
                "linkedin": user.linkedin_url or "",
                "github": user.github_url or ""
            }
        )
        pdf_path = pdf_result.pdf_path
    except Exception as e:
        logging.getLogger("hunt-x").error(f"PDF generation failed: {e}")
        pdf_path = None

    # Create resume record
    resume = Resume(
        id=file_id,
        user_id=user.id,
        original_filename=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        raw_text=resume_text,
        skills=analysis.get("skills", []),
        experience_years=analysis.get("experience_years"),
        industry_focus=analysis.get("industry_focus"),
        seniority_level=analysis.get("seniority_level"),
        pdf_path=pdf_path
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeResponse(
        id=str(resume.id),
        original_filename=resume.original_filename,
        file_size=resume.file_size,
        skills=resume.skills or [],
        experience_years=resume.experience_years,
        seniority_level=resume.seniority_level,
        pdf_url=resume.pdf_path,
        created_at=resume.created_at.isoformat()
    )


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get resume details"""

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return ResumeDetailResponse(
        id=str(resume.id),
        original_filename=resume.original_filename,
        file_size=resume.file_size,
        raw_text=resume.raw_text or "",
        structured_data=resume.structured_data,
        skills=resume.skills or [],
        experience_years=resume.experience_years,
        industry_focus=resume.industry_focus,
        seniority_level=resume.seniority_level,
        pdf_url=resume.pdf_path,
        created_at=resume.created_at.isoformat()
    )


@router.get("/list", response_model=List[ResumeResponse])
async def list_resumes_alias(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's resumes (alias for /)"""
    return await list_resumes(user, db)


@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's resumes"""

    resumes = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(Resume.created_at.desc()).all()

    return [
        ResumeResponse(
            id=str(r.id),
            original_filename=r.original_filename,
            file_size=r.file_size,
            skills=r.skills or [],
            experience_years=r.experience_years,
            seniority_level=r.seniority_level,
            pdf_url=r.pdf_path,
            created_at=r.created_at.isoformat()
        )
        for r in resumes
    ]


@router.post("/{resume_id}/pdf")
async def generate_resume_pdf(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pdf_service: ResumePDFService = Depends(get_resume_pdf_service)
):
    """Generate PDF from resume"""

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume has no content")

    # Generate PDF
    result = await pdf_service.generate_resume_pdf(
        resume_text=resume.raw_text,
        user_info={
            "name": user.name or user.email.split("@")[0],
            "email": user.email,
            "phone": user.phone or "",
            "location": user.location or "",
            "linkedin": user.linkedin_url or "",
            "github": user.github_url or ""
        }
    )

    # Update resume
    resume.pdf_path = result.pdf_path
    db.commit()

    return {"pdf_url": result.pdf_path, "pages": result.pages}


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete resume"""

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Delete file
    try:
        if resume.file_path:
            Path(resume.file_path).unlink(missing_ok=True)
        if resume.pdf_path:
            Path(resume.pdf_path).unlink(missing_ok=True)
    except Exception as e:
        logging.getLogger("hunt-x").error(f"Error deleting files: {e}")

    db.delete(resume)
    db.commit()

    return {"status": "deleted"}
