"""
Interview preparation router
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db, User, Evaluation, InterviewPrep as InterviewPrepModel
from dependencies import get_current_user, get_interview_service
from services.interview_service import InterviewService

router = APIRouter(prefix="/api/interview", tags=["interview"])


class GenerateInterviewPrepRequest(BaseModel):
    evaluation_id: str


class STARStoryResponse(BaseModel):
    requirement: str
    title: str
    situation: str
    task: str
    action: str
    result: str
    reflection: str
    estimated_duration: str


class RedFlagResponse(BaseModel):
    question: str
    answer: str
    key_message: str


class CaseStudyResponse(BaseModel):
    project: str
    framing: str
    key_points: List[str]
    potential_questions: List[str]


class QuestionToAskResponse(BaseModel):
    category: str
    question: str
    why_good: str


class InterviewPrepResponse(BaseModel):
    id: str
    star_stories: List[STARStoryResponse]
    red_flags: List[RedFlagResponse]
    case_study: CaseStudyResponse
    questions_to_ask: List[QuestionToAskResponse]
    created_at: str


@router.post("/prep", response_model=InterviewPrepResponse)
async def generate_interview_prep(
    request: GenerateInterviewPrepRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service)
):
    """
    Generate interview preparation for a job.
    Includes STAR stories, red flags, case study, and questions to ask.
    """

    # Get evaluation
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == request.evaluation_id,
        Evaluation.user_id == user.id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # Get resume
    from models import Resume
    resume = db.query(Resume).filter(
        Resume.id == evaluation.resume_id
    ).first()

    if not resume or not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume not found")

    # Generate interview prep
    result = await interview_service.prepare(
        resume_text=resume.raw_text,
        job_description=evaluation.job_description,
        evaluation_data={
            "archetype": evaluation.archetype,
            "block_b": {
                "matches": evaluation.matched_requirements or [],
                "gaps": evaluation.gaps or []
            },
            "block_f": evaluation.interview_plan or {}
        }
    )

    # Save to database
    prep = InterviewPrepModel(
        user_id=user.id,
        evaluation_id=evaluation.id,
        star_stories=[
            {
                "requirement": s.requirement,
                "title": s.title,
                "situation": s.situation,
                "task": s.task,
                "action": s.action,
                "result": s.result,
                "reflection": s.reflection,
                "estimated_duration": s.estimated_duration
            }
            for s in result.star_stories
        ],
        red_flags=[
            {
                "question": rf.question,
                "answer": rf.answer,
                "key_message": rf.key_message
            }
            for rf in result.red_flags
        ],
        case_study={
            "project": result.case_study.project,
            "framing": result.case_study.framing,
            "key_points": result.case_study.key_points,
            "potential_questions": result.case_study.potential_questions
        },
        questions_to_ask=[
            {
                "category": q.category,
                "question": q.question,
                "why_good": q.why_good
            }
            for q in result.questions_to_ask
        ]
    )

    db.add(prep)
    db.commit()
    db.refresh(prep)

    return InterviewPrepResponse(
        id=str(prep.id),
        star_stories=[
            STARStoryResponse(
                requirement=s.requirement,
                title=s.title,
                situation=s.situation,
                task=s.task,
                action=s.action,
                result=s.result,
                reflection=s.reflection,
                estimated_duration=s.estimated_duration
            )
            for s in result.star_stories
        ],
        red_flags=[
            RedFlagResponse(
                question=rf.question,
                answer=rf.answer,
                key_message=rf.key_message
            )
            for rf in result.red_flags
        ],
        case_study=CaseStudyResponse(
            project=result.case_study.project,
            framing=result.case_study.framing,
            key_points=result.case_study.key_points,
            potential_questions=result.case_study.potential_questions
        ),
        questions_to_ask=[
            QuestionToAskResponse(
                category=q.category,
                question=q.question,
                why_good=q.why_good
            )
            for q in result.questions_to_ask
        ],
        created_at=prep.created_at.isoformat()
    )


@router.get("/{prep_id}", response_model=InterviewPrepResponse)
async def get_interview_prep(
    prep_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview preparation"""

    prep = db.query(InterviewPrepModel).filter(
        InterviewPrepModel.id == prep_id,
        InterviewPrepModel.user_id == user.id
    ).first()

    if not prep:
        raise HTTPException(status_code=404, detail="Interview prep not found")

    return InterviewPrepResponse(
        id=str(prep.id),
        star_stories=[
            STARStoryResponse(**s)
            for s in (prep.star_stories or [])
        ],
        red_flags=[
            RedFlagResponse(**rf)
            for rf in (prep.red_flags or [])
        ],
        case_study=CaseStudyResponse(**prep.case_study) if prep.case_study else None,
        questions_to_ask=[
            QuestionToAskResponse(**q)
            for q in (prep.questions_to_ask or [])
        ],
        created_at=prep.created_at.isoformat()
    )


@router.get("/evaluation/{evaluation_id}")
async def get_prep_by_evaluation(
    evaluation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview prep for an evaluation"""

    prep = db.query(InterviewPrepModel).filter(
        InterviewPrepModel.evaluation_id == evaluation_id,
        InterviewPrepModel.user_id == user.id
    ).first()

    if not prep:
        raise HTTPException(status_code=404, detail="Interview prep not found")

    return InterviewPrepResponse(
        id=str(prep.id),
        star_stories=[
            STARStoryResponse(**s)
            for s in (prep.star_stories or [])
        ],
        red_flags=[
            RedFlagResponse(**rf)
            for rf in (prep.red_flags or [])
        ],
        case_study=CaseStudyResponse(**prep.case_study) if prep.case_study else None,
        questions_to_ask=[
            QuestionToAskResponse(**q)
            for q in (prep.questions_to_ask or [])
        ],
        created_at=prep.created_at.isoformat()
    )


@router.get("/")
async def list_interview_preps(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all interview preps for current user"""
    preps = db.query(InterviewPrepModel).filter(InterviewPrepModel.user_id == user.id).order_by(InterviewPrepModel.created_at.desc()).all()
    return [
        {
            "id": str(prep.id),
            "evaluation_id": str(prep.evaluation_id) if prep.evaluation_id else None,
            "created_at": prep.created_at.isoformat() if prep.created_at else None,
        }
        for prep in preps
    ]

