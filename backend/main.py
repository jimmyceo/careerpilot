from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uvicorn
import os
import uuid
from pathlib import Path
from datetime import datetime

from ai_client import kimi_query, notify
from database import init_db, get_db, User, Resume, CV
from services.pdf_generator import generate_pdf_from_html

app = FastAPI(title="Hunt-X API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', '/app/uploads'))
UPLOAD_DIR.mkdir(exist_ok=True)

PDF_DIR = Path(os.getenv('PDF_DIR', '/app/uploads/pdfs'))
PDF_DIR.mkdir(parents=True, exist_ok=True)

def extract_text_from_file(file_path: str) -> str:
    """Extract text from PDF, DOC, DOCX, or TXT"""
    # TODO: Implement proper extraction
    # For MVP, return placeholder
    return "Resume text extracted from file"

@app.post("/api/resume/upload")
async def upload_resume(
    email: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload resume and create user if needed"""
    if not file.filename.endswith(('.pdf', '.doc', '.docx', '.txt')):
        raise HTTPException(400, "Only PDF, DOC, DOCX, TXT files allowed")
    
    # Create or get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(id=str(uuid.uuid4()), email=email)
        db.add(user)
        db.commit()
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Create resume record
    resume = Resume(
        id=file_id,
        user_id=user.id,
        file_path=str(file_path),
        file_name=file.filename
    )
    db.add(resume)
    db.commit()
    
    return {
        "status": "success",
        "resume_id": file_id,
        "user_id": user.id,
        "message": "Resume uploaded successfully"
    }

@app.post("/api/resume/analyze")
async def analyze_resume(resume_id: str, db: Session = Depends(get_db)):
    """Analyze resume with AI"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    # Extract text
    resume_text = extract_text_from_file(resume.file_path)
    
    # AI Analysis
    prompt = f"""Analyze this resume and extract:
    1. Key skills (technical and soft) - top 10
    2. Years of experience (total)
    3. Industry focus
    4. Seniority level (junior/mid/senior)
    5. Suggested job titles to target
    6. Key strengths
    7. Areas for improvement
    
    Resume text: {resume_text}
    
    Return as JSON."""
    
    analysis_text = kimi_query(prompt, system="You are an expert resume analyst and career coach.")
    
    # Parse JSON from response
    import json
    try:
        analysis = json.loads(analysis_text)
    except:
        analysis = {"raw_analysis": analysis_text}
    
    # Save analysis
    resume.ai_analysis = analysis
    db.commit()
    
    return {
        "status": "success",
        "resume_id": resume_id,
        "analysis": analysis
    }

@app.post("/api/cv/generate")
async def generate_cv(
    resume_id: str,
    job_title: str,
    company: str,
    job_description: str,
    db: Session = Depends(get_db)
):
    """Generate tailored CV"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    
    # Get resume text
    resume_text = extract_text_from_file(resume.file_path)
    
    # Generate CV with AI
    prompt = f"""You are an expert CV writer specializing in ATS-optimized resumes.

Given:
- Resume: {resume_text}
- Job Description: {job_description}
- Job Title: {job_title}
- Company: {company}

Generate an ATS-optimized CV in HTML format that:
1. Matches keywords from the job description
2. Highlights the most relevant experience
3. Uses professional, clean formatting
4. Includes quantifiable achievements
5. Is tailored specifically for this role

Return ONLY the HTML content."""
    
    cv_html = kimi_query(prompt, system="You are an expert CV writer.")
    
    # Save CV
    cv_id = str(uuid.uuid4())
    cv = CV(
        id=cv_id,
        user_id=resume.user_id,
        resume_id=resume_id,
        job_title=job_title,
        company=company,
        job_description=job_description,
        cv_html=cv_html
    )
    db.add(cv)
    db.commit()
    
    return {
        "status": "success",
        "cv_id": cv_id,
        "cv_html": cv_html
    }

@app.get("/api/cv/{cv_id}/download")
async def download_cv(cv_id: str, db: Session = Depends(get_db)):
    """Download CV as PDF"""
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv:
        raise HTTPException(404, "CV not found")
    
    # Generate PDF if not exists
    if not cv.pdf_path or not Path(cv.pdf_path).exists():
        pdf_path = generate_pdf_from_html(cv.cv_html, cv_id)
        cv.pdf_path = pdf_path
        db.commit()
    
    return FileResponse(
        cv.pdf_path,
        media_type="application/pdf",
        filename=f"{cv.job_title.replace(' ', '_')}_CV.pdf"
    )

@app.get("/api/cv/user/{user_id}")
async def get_user_cvs(user_id: str, db: Session = Depends(get_db)):
    """Get all CVs for a user"""
    cvs = db.query(CV).filter(CV.user_id == user_id).order_by(CV.created_at.desc()).all()
    return [{"id": cv.id, "job_title": cv.job_title, "company": cv.company, "created_at": cv.created_at} for cv in cvs]

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

@app.on_event("startup")
async def startup():
    init_db()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)