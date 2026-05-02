"""
Evaluation service - 6-block A-F scoring
Ported from career-ops oferta.md
"""

import json
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

from ai.client import AIClient
from ai.prompts.evaluation import EVALUATION_PROMPT, ARCHETYPE_DETECTION_PROMPT
from ai.prompts.shared import ARCHETYPE_SIGNALS


@dataclass
class BlockA:
    archetype: str
    secondary_archetype: Optional[str]
    domain: str
    function: str
    seniority: str
    remote_policy: str
    team_size: Optional[str]
    tldr: str


@dataclass
class MatchItem:
    requirement: str
    cv_evidence: str
    strength: int
    must_have: bool


@dataclass
class GapItem:
    skill: str
    is_blocker: bool
    adjacent_experience: str
    mitigation: str


@dataclass
class BlockB:
    matches: List[MatchItem]
    gaps: List[GapItem]


@dataclass
class BlockC:
    detected_level: str
    candidate_level: str
    positioning_strategy: str
    downlevel_plan: str


@dataclass
class CompensationData:
    min: int
    max: int
    currency: str


@dataclass
class BlockD:
    salary_range: CompensationData
    market_data: Dict
    company_reputation: str


@dataclass
class CVChange:
    section: str
    current: str
    proposed: str
    reason: str


@dataclass
class BlockE:
    cv_changes: List[CVChange]
    linkedin_changes: List[str]


@dataclass
class STARStory:
    requirement: str
    title: str
    situation: str
    task: str
    action: str
    result: str
    reflection: str
    estimated_duration: str


@dataclass
class BlockF:
    star_stories: List[STARStory]
    red_flags: List[Dict]
    case_study: str
    questions_to_ask: List[str]


@dataclass
class EvaluationResult:
    block_a: BlockA
    block_b: BlockB
    block_c: BlockC
    block_d: BlockD
    block_e: BlockE
    block_f: BlockF
    global_score: float
    recommendation: str


class EvaluationService:
    """
    Service for generating 6-block A-F evaluations.
    Ported from career-ops modes/oferta.md
    """

    def __init__(self, ai_client: AIClient):
        self.ai = ai_client

    async def evaluate(
        self,
        cv_text: str,
        job_description: str,
        target_archetypes: Optional[List[str]] = None
    ) -> EvaluationResult:
        """
        Generate complete 6-block evaluation.

        Args:
            cv_text: Candidate's resume content
            job_description: Job description text
            target_archetypes: User's preferred archetypes (optional)

        Returns:
            Complete EvaluationResult with all 6 blocks
        """

        # First, detect archetype (lightweight call)
        archetype = await self._detect_archetype(job_description)

        # Full evaluation
        prompt = EVALUATION_PROMPT.format(
            cv_text=cv_text[:4000],  # Truncate to save tokens
            job_description=job_description[:3000],
            target_archetypes=", ".join(target_archetypes or [])
        )

        response = await self.ai.generate_json(prompt)

        # Parse response into structured objects
        return self._parse_evaluation(response)

    async def _detect_archetype(self, job_description: str) -> str:
        """Quick archetype detection"""

        prompt = ARCHETYPE_DETECTION_PROMPT.format(
            job_description=job_description[:2000]
        )

        try:
            response = await self.ai.generate_json(prompt)
            return response.get("primary_archetype", "unknown")
        except:
            # Fallback to heuristic detection
            return self._heuristic_archetype_detection(job_description)

    def _heuristic_archetype_detection(self, job_description: str) -> str:
        """Fallback archetype detection using keyword matching"""

        jd_lower = job_description.lower()
        scores = {}

        for archetype, signals in ARCHETYPE_SIGNALS.items():
            score = sum(1 for signal in signals if signal.lower() in jd_lower)
            scores[archetype] = score

        if not scores:
            return "unknown"

        return max(scores, key=scores.get)

    def _parse_evaluation(self, response: dict) -> EvaluationResult:
        """Parse JSON response into EvaluationResult"""

        # Block A
        block_a_data = response.get("block_a", {})
        block_a = BlockA(
            archetype=block_a_data.get("archetype", "unknown"),
            secondary_archetype=block_a_data.get("secondary_archetype"),
            domain=block_a_data.get("domain", ""),
            function=block_a_data.get("function", ""),
            seniority=block_a_data.get("seniority", ""),
            remote_policy=block_a_data.get("remote_policy", ""),
            team_size=block_a_data.get("team_size"),
            tldr=block_a_data.get("tldr", "")
        )

        # Block B
        block_b_data = response.get("block_b", {})
        matches = [
            MatchItem(
                requirement=m.get("requirement", ""),
                cv_evidence=m.get("cv_evidence", ""),
                strength=m.get("strength", 3),
                must_have=m.get("must_have", True)
            )
            for m in block_b_data.get("matches", [])
        ]
        gaps = [
            GapItem(
                skill=g.get("skill", ""),
                is_blocker=g.get("blocker", False),
                adjacent_experience=g.get("adjacent_experience", ""),
                mitigation=g.get("mitigation", "")
            )
            for g in block_b_data.get("gaps", [])
        ]
        block_b = BlockB(matches=matches, gaps=gaps)

        # Block C
        block_c_data = response.get("block_c", {})
        block_c = BlockC(
            detected_level=block_c_data.get("detected_level", ""),
            candidate_level=block_c_data.get("candidate_level", ""),
            positioning_strategy=block_c_data.get("positioning_strategy", ""),
            downlevel_plan=block_c_data.get("downlevel_plan", "")
        )

        # Block D
        block_d_data = response.get("block_d", {})
        salary_data = block_d_data.get("salary_range", {})
        # Ensure market_data is always a dict
        raw_market_data = block_d_data.get("market_data", {})
        if isinstance(raw_market_data, str):
            market_data = {"analysis": raw_market_data}
        elif isinstance(raw_market_data, dict):
            market_data = raw_market_data
        else:
            market_data = {}

        block_d = BlockD(
            salary_range=CompensationData(
                min=salary_data.get("min", 0),
                max=salary_data.get("max", 0),
                currency=salary_data.get("currency", "EUR")
            ),
            market_data=market_data,
            company_reputation=block_d_data.get("company_reputation", "")
        )

        # Block E
        block_e_data = response.get("block_e", {})
        cv_changes = [
            CVChange(
                section=c.get("section", ""),
                current=c.get("current", ""),
                proposed=c.get("proposed", ""),
                reason=c.get("reason", "")
            )
            for c in block_e_data.get("cv_changes", [])
        ]
        block_e = BlockE(
            cv_changes=cv_changes,
            linkedin_changes=block_e_data.get("linkedin_changes", [])
        )

        # Block F
        block_f_data = response.get("block_f", {})
        star_stories = [
            STARStory(
                requirement=s.get("requisito", s.get("requirement", "")),
                title=s.get("title", ""),
                situation=s.get("situation", s.get("S", "")),
                task=s.get("task", s.get("T", "")),
                action=s.get("action", s.get("A", "")),
                result=s.get("result", s.get("R", "")),
                reflection=s.get("reflection", s.get("R_plus", "")),
                estimated_duration=s.get("estimated_duration", "")
            )
            for s in block_f_data.get("star_stories", [])
        ]
        # Coerce red_flags strings to dicts
        raw_red_flags = block_f_data.get("red_flags", [])
        red_flags = []
        for rf in raw_red_flags:
            if isinstance(rf, dict):
                red_flags.append(rf)
            elif isinstance(rf, str):
                red_flags.append({"description": rf})

        block_f = BlockF(
            star_stories=star_stories,
            red_flags=red_flags,
            case_study=block_f_data.get("case_study", ""),
            questions_to_ask=block_f_data.get("questions_to_ask", [])
        )

        return EvaluationResult(
            block_a=block_a,
            block_b=block_b,
            block_c=block_c,
            block_d=block_d,
            block_e=block_e,
            block_f=block_f,
            global_score=float(response.get("global_score", 0)),
            recommendation=response.get("recommendation", "")
        )

    def calculate_match_score(self, evaluation: EvaluationResult) -> float:
        """
        Calculate overall match score from evaluation.
        Used for filtering and ranking.
        """
        return evaluation.global_score

    def get_top_matches(
        self,
        evaluation: EvaluationResult,
        n: int = 5
    ) -> List[MatchItem]:
        """Get top N matched requirements"""
        sorted_matches = sorted(
            evaluation.block_b.matches,
            key=lambda m: m.strength,
            reverse=True
        )
        return sorted_matches[:n]

    def get_critical_gaps(self, evaluation: EvaluationResult) -> List[GapItem]:
        """Get only blocker gaps"""
        return [g for g in evaluation.block_b.gaps if g.is_blocker]
