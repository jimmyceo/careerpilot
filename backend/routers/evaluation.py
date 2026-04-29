"""
import logging
Evaluation router
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from limiter import limiter
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from models import get_db, User, Resume, Evaluation
from dependencies import get_current_user, get_evaluation_service
from services.evaluation_service import EvaluationService

router = APIRouter(prefix="/api/evaluate", tags=["evaluation"])


class CreateEvaluationRequest(BaseModel):
    resume_id: str
    job_description: str
    company: str
    job_title: str
    job_url: Optional[str] = None


class MatchItem(BaseModel):
    requirement: str
    cv_evidence: str
    strength: int
    must_have: bool


class GapItem(BaseModel):
    skill: str
    is_blocker: bool
    adjacent_experience: str
    mitigation: str


class BlockA(BaseModel):
    archetype: str
    secondary_archetype: Optional[str]
    domain: str
    function: str
    seniority: str
    remote_policy: str
    team_size: Optional[str]
    tldr: str


class BlockB(BaseModel):
    matches: List[MatchItem]
    gaps: List[GapItem]


class BlockC(BaseModel):
    detected_level: str
    candidate_level: str
    positioning_strategy: str
    downlevel_plan: str


class CompensationData(BaseModel):
    min: int
    max: int
    currency: str


class BlockD(BaseModel):
    salary_range: CompensationData
    market_data: dict
    company_reputation: str


class CVChange(BaseModel):
    section: str
    current: str
    proposed: str
    reason: str


class BlockE(BaseModel):
    cv_changes: List[CVChange]
    linkedin_changes: List[str]


class STARStory(BaseModel):
    requirement: str
    title: str
    situation: str
    task: str
    action: str
    result: str
    reflection: str
    estimated_duration: str


class BlockF(BaseModel):
    star_stories: List[STARStory]
    red_flags: List[dict]
    case_study: dict
    questions_to_ask: List[str]


class EvaluationResponse(BaseModel):
    id: str
    company: str
    role: str
    block_a: BlockA
    block_b: BlockB
    block_c: BlockC
    block_d: BlockD
    block_e: BlockE
    block_f: BlockF
    global_score: float
    recommendation: str
    created_at: str


class EvaluationListItem(BaseModel):
    id: str
    company: str
    role: str
    global_score: float
    recommendation: str
    created_at: str


@router.post("/", response_model=EvaluationResponse)
@limiter.limit("20/hour")
async def create_evaluation(
    request: Request,
    request_data: CreateEvaluationRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    eval_service: EvaluationService = Depends(get_evaluation_service)
):
    """
    Create a new 6-block evaluation.
    This is the core feature - evaluates job fit comprehensively.
    """

    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == request_data.resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume has no parsed text")

    # Check job credit (in production, decrement here)
    if user.jobs_remaining <= 0:
        raise HTTPException(
            status_code=402,
            detail="No jobs remaining. Please upgrade your plan."
        )

    # Generate evaluation
    try:
        result = await eval_service.evaluate(
            cv_text=resume.raw_text,
            job_description=request_data.job_description,
            target_archetypes=user.preferred_archetypes
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )

    # Save to database
    evaluation = Evaluation(
        user_id=user.id,
        resume_id=request_data.resume_id,
        company=request_data.company,
        role=request_data.job_title,
        job_description=request_data.job_description,
        job_url=request_data.job_url,
        archetype=result.block_a.archetype,
        domain=result.block_a.domain,
        seniority=result.block_a.seniority,
        remote_policy=result.block_a.remote_policy,
        matched_requirements=[
            {
                "requirement": m.requirement,
                "cv_evidence": m.cv_evidence,
                "strength": m.strength,
                "must_have": m.must_have
            }
            for m in result.block_b.matches
        ],
        gaps=[
            {
                "skill": g.skill,
                "is_blocker": g.is_blocker,
                "adjacent_experience": g.adjacent_experience,
                "mitigation": g.mitigation
            }
            for g in result.block_b.gaps
        ],
        positioning_strategy=result.block_c.positioning_strategy,
        salary_range_min=result.block_d.salary_range.min,
        salary_range_max=result.block_d.salary_range.max,
        market_data=result.block_d.market_data,
        personalization_plan={
            "cv_changes": [
                {
                    "section": c.section,
                    "current": c.current,
                    "proposed": c.proposed,
                    "reason": c.reason
                }
                for c in result.block_e.cv_changes
            ],
            "linkedin_changes": result.block_e.linkedin_changes
        },
        interview_plan={
            "star_stories": [
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
                for s in result.block_f.star_stories
            ],
            "red_flags": result.block_f.red_flags,
            "case_study": result.block_f.case_study,
            "questions_to_ask": result.block_f.questions_to_ask
        },
        global_score=result.global_score,
        recommendation=result.recommendation
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    # Decrement job counter in background (use fresh session)
    background_tasks.add_task(
        _decrement_job_counter,
        user.id
    )

    # Build response
    return EvaluationResponse(
        id=str(evaluation.id),
        company=evaluation.company,
        role=evaluation.role,
        block_a=BlockA(
            archetype=result.block_a.archetype,
            secondary_archetype=result.block_a.secondary_archetype,
            domain=result.block_a.domain,
            function=result.block_a.function,
            seniority=result.block_a.seniority,
            remote_policy=result.block_a.remote_policy,
            team_size=result.block_a.team_size,
            tldr=result.block_a.tldr
        ),
        block_b=BlockB(
            matches=[
                MatchItem(
                    requirement=m.requirement,
                    cv_evidence=m.cv_evidence,
                    strength=m.strength,
                    must_have=m.must_have
                )
                for m in result.block_b.matches
            ],
            gaps=[
                GapItem(
                    skill=g.skill,
                    is_blocker=g.is_blocker,
                    adjacent_experience=g.adjacent_experience,
                    mitigation=g.mitigation
                )
                for g in result.block_b.gaps
            ]
        ),
        block_c=BlockC(
            detected_level=result.block_c.detected_level,
            candidate_level=result.block_c.candidate_level,
            positioning_strategy=result.block_c.positioning_strategy,
            downlevel_plan=result.block_c.downlevel_plan
        ),
        block_d=BlockD(
            salary_range=CompensationData(
                min=result.block_d.salary_range.min,
                max=result.block_d.salary_range.max,
                currency=result.block_d.salary_range.currency
            ),
            market_data=result.block_d.market_data,
            company_reputation=result.block_d.company_reputation
        ),
        block_e=BlockE(
            cv_changes=[
                CVChange(
                    section=c.section,
                    current=c.current,
                    proposed=c.proposed,
                    reason=c.reason
                )
                for c in result.block_e.cv_changes
            ],
            linkedin_changes=result.block_e.linkedin_changes
        ),
        block_f=BlockF(
            star_stories=[
                STARStory(
                    requirement=s.requirement,
                    title=s.title,
                    situation=s.situation,
                    task=s.task,
                    action=s.action,
                    result=s.result,
                    reflection=s.reflection,
                    estimated_duration=s.estimated_duration
                )
                for s in result.block_f.star_stories
            ],
            red_flags=result.block_f.red_flags,
            case_study=result.block_f.case_study,
            questions_to_ask=result.block_f.questions_to_ask
        ),
        global_score=result.global_score,
        recommendation=result.recommendation,
        created_at=evaluation.created_at.isoformat()
    )


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific evaluation"""

    evaluation = db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.user_id == user.id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # Reconstruct response from DB
    return _db_to_response(evaluation)


@router.get("/", response_model=List[EvaluationListItem])
async def list_evaluations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """List user's evaluations"""

    evaluations = db.query(Evaluation).filter(
        Evaluation.user_id == user.id
    ).order_by(Evaluation.created_at.desc()).offset(offset).limit(limit).all()

    return [
        EvaluationListItem(
            id=str(e.id),
            company=e.company,
            role=e.role,
            global_score=float(e.global_score) if e.global_score else 0,
            recommendation=e.recommendation,
            created_at=e.created_at.isoformat()
        )
        for e in evaluations
    ]


@router.delete("/{evaluation_id}")
async def delete_evaluation(
    evaluation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an evaluation"""

    evaluation = db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.user_id == user.id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    db.delete(evaluation)
    db.commit()

    return {"status": "deleted"}


def _db_to_response(evaluation: Evaluation) -> EvaluationResponse:
    """Convert DB model to response"""

    return EvaluationResponse(
        id=str(evaluation.id),
        company=evaluation.company,
        role=evaluation.role,
        block_a=BlockA(
            archetype=evaluation.archetype or "",
            secondary_archetype=None,
            domain=evaluation.domain or "",
            function="",
            seniority=evaluation.seniority or "",
            remote_policy=evaluation.remote_policy or "",
            team_size=None,
            tldr=""
        ),
        block_b=BlockB(
            matches=[
                MatchItem(
                    requirement=m.get("requirement", ""),
                    cv_evidence=m.get("cv_evidence", ""),
                    strength=m.get("strength", 3),
                    must_have=m.get("must_have", True)
                )
                for m in (evaluation.matched_requirements or [])
            ],
            gaps=[
                GapItem(
                    skill=g.get("skill", ""),
                    is_blocker=g.get("is_blocker", False),
                    adjacent_experience=g.get("adjacent_experience", ""),
                    mitigation=g.get("mitigation", "")
                )
                for g in (evaluation.gaps or [])
            ]
        ),
        block_c=BlockC(
            detected_level="",
            candidate_level="",
            positioning_strategy=evaluation.positioning_strategy or "",
            downlevel_plan=""
        ),
        block_d=BlockD(
            salary_range=CompensationData(
                min=evaluation.salary_range_min or 0,
                max=evaluation.salary_range_max or 0,
                currency="EUR"
            ),
            market_data=evaluation.market_data or {},
            company_reputation=""
        ),
        block_e=BlockE(
            cv_changes=[],
            linkedin_changes=[]
        ),
        block_f=BlockF(
            star_stories=[],
            red_flags=[],
            case_study={},
            questions_to_ask=[]
        ),
        global_score=float(evaluation.global_score) if evaluation.global_score else 0,
        recommendation=evaluation.recommendation or "",
        created_at=evaluation.created_at.isoformat()
    )


def _decrement_job_counter(user_id: str):
    """Decrement user's job counter using a fresh database session."""
    from database import SessionLocal
    from models import User
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.jobs_remaining > 0:
            user.jobs_remaining -= 1
            db.commit()
    except Exception as e:
        db.rollback()
        logging.getLogger("hunt-x").error(f"Error decrementing job counter: {e}")
    finally:
        db.close()
