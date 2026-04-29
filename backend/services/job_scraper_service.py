"""
Job scraper service
Ported from career-ops scan mode
Scrapes job portals and company sites
Supports JSearch (RapidAPI) and Apify as primary data sources
"""

import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import aiohttp
from bs4 import BeautifulSoup
import re
import logging

from ai.client import AIClient
from ai.prompts.job_scraper import (
    JOB_ANALYSIS_PROMPT,
    PORTAL_QUERY_GENERATION,
    JOB_DEDUPLICATION_PROMPT,
    QUALITY_SCORE_PROMPT
)

# Import new API clients
from services.job_scraper_api import (
    JSearchClient,
    ApifyClientWrapper,
    search_jobs_api,
    detect_region,
    REGION_CONFIG,
    ScrapedJob as ApiScrapedJob
)

logger = logging.getLogger(__name__)


@dataclass
class ScrapedJob:
    id: str
    title: str
    company: str
    location: str
    description: str
    url: str
    archetype: Optional[str] = None
    seniority: Optional[str] = None
    required_skills: List[str] = None
    salary_range: Optional[str] = None
    remote_policy: Optional[str] = None
    posted_date: Optional[datetime] = None
    match_score: Optional[float] = None
    quality_score: Optional[float] = None
    is_duplicate: bool = False


@dataclass
class UserProfile:
    target_roles: List[str]
    preferred_archetypes: List[str]
    location: str
    remote_preference: str
    skills: List[str]
    min_salary: Optional[int] = None


class JobScraperService:
    """
    Service for scraping job portals and company sites.
    Ported from career-ops scan mode.
    """

    def __init__(self, ai_client: AIClient):
        self.ai = ai_client
        self.scraped_jobs: Dict[str, ScrapedJob] = {}  # url -> job
        self.session: Optional[aiohttp.ClientSession] = None

        # Portal configurations
        self.portals = {
            'linkedin': {
                'base_url': 'https://www.linkedin.com/jobs/search',
                'requires_auth': True,
                'rate_limit': 1  # requests per second
            },
            'indeed': {
                'base_url': 'https://www.indeed.com/jobs',
                'requires_auth': False,
                'rate_limit': 2
            },
            'glassdoor': {
                'base_url': 'https://www.glassdoor.com/Job/jobs.htm',
                'requires_auth': False,
                'rate_limit': 1
            },
            'weworkremotely': {
                'base_url': 'https://weworkremotely.com/remote-jobs',
                'requires_auth': False,
                'rate_limit': 1
            },
            'angelist': {
                'base_url': 'https://angel.co/jobs',
                'requires_auth': False,
                'rate_limit': 1
            }
        }

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def generate_search_queries(
        self,
        profile: UserProfile
    ) -> Dict[str, List[str]]:
        """Generate optimized search queries for each portal"""

        prompt = PORTAL_QUERY_GENERATION.format(
            target_roles=", ".join(profile.target_roles),
            archetypes=", ".join(profile.preferred_archetypes),
            location=profile.location,
            remote_preference=profile.remote_preference,
            skills=", ".join(profile.skills[:10])
        )

        response = await self.ai.generate_json(prompt)
        return response.get('queries', {})

    async def scrape_portal(
        self,
        portal_name: str,
        query: str,
        max_results: int = 20
    ) -> List[ScrapedJob]:
        """Scrape a specific job portal"""

        if portal_name not in self.portals:
            raise ValueError(f"Unknown portal: {portal_name}")

        config = self.portals[portal_name]
        jobs = []

        try:
            if portal_name == 'linkedin':
                jobs = await self._scrape_linkedin(query, max_results)
            elif portal_name == 'indeed':
                jobs = await self._scrape_indeed(query, max_results)
            elif portal_name == 'weworkremotely':
                jobs = await self._scrape_weworkremotely(query, max_results)
            elif portal_name == 'angelist':
                jobs = await self._scrape_angelist(query, max_results)
            else:
                # Generic scraper
                jobs = await self._scrape_generic(
                    config['base_url'],
                    query,
                    max_results
                )

        except Exception as e:
            logging.getLogger("hunt-x").error(f"Error scraping {portal_name}: {e}")

        # Rate limiting
        await asyncio.sleep(1 / config['rate_limit'])

        return jobs

    async def analyze_job(
        self,
        raw_text: str,
        candidate_profile: Optional[UserProfile] = None
    ) -> ScrapedJob:
        """
        Analyze scraped job text using AI.
        Extract structured data and calculate match score.
        """

        prompt = JOB_ANALYSIS_PROMPT.format(
            raw_text=raw_text[:5000]  # Limit tokens
        )

        if candidate_profile:
            prompt += f"\n\nCANDIDATE SKILLS: {', '.join(candidate_profile.skills)}"

        response = await self.ai.generate_json(prompt)

        job = ScrapedJob(
            id=response.get('id', ''),
            title=response.get('title', 'Unknown'),
            company=response.get('company', 'Unknown'),
            location=response.get('location', ''),
            description=raw_text,
            url=response.get('apply_url', ''),
            archetype=response.get('archetype'),
            seniority=response.get('seniority'),
            required_skills=response.get('required_skills', []),
            salary_range=response.get('salary_range'),
            remote_policy=response.get('remote_policy'),
            match_score=response.get('match_score')
        )

        return job

    async def check_duplicate(
        self,
        new_job: ScrapedJob,
        existing_jobs: List[ScrapedJob]
    ) -> bool:
        """Check if job is duplicate using AI + heuristics"""

        # Quick heuristic check
        for existing in existing_jobs:
            # Same URL = duplicate
            if new_job.url == existing.url:
                return True

            # Same company + very similar title
            if (new_job.company == existing.company and
                self._title_similarity(new_job.title, existing.title) > 0.8):
                return True

        # AI-based check for borderline cases
        if existing_jobs:
            prompt = JOB_DEDUPLICATION_PROMPT.format(
                new_job={
                    'title': new_job.title,
                    'company': new_job.company,
                    'description': new_job.description[:500]
                },
                existing_jobs=[{
                    'id': j.id,
                    'title': j.title,
                    'company': j.company,
                    'description': j.description[:500]
                } for j in existing_jobs[:5]]
            )

            response = await self.ai.generate_json(prompt)
            return response.get('is_duplicate', False)

        return False

    async def score_job_quality(self, job: ScrapedJob) -> float:
        """Score job posting quality"""

        prompt = QUALITY_SCORE_PROMPT.format(
            job_text=job.description[:2000]
        )

        response = await self.ai.generate_json(prompt)
        return response.get('score', 5.0)

    async def filter_jobs(
        self,
        jobs: List[ScrapedJob],
        profile: UserProfile,
        min_match_score: float = 3.0
    ) -> List[ScrapedJob]:
        """Filter and rank jobs by relevance"""

        filtered = []

        for job in jobs:
            # Skip duplicates
            if job.is_duplicate:
                continue

            # Skip low match scores
            if job.match_score and job.match_score < min_match_score:
                continue

            # Skip if salary below minimum
            if profile.min_salary and job.salary_range:
                job_min = self._parse_salary(job.salary_range)
                if job_min and job_min < profile.min_salary:
                    continue

            filtered.append(job)

        # Sort by match score (highest first)
        filtered.sort(key=lambda j: j.match_score or 0, reverse=True)

        return filtered

    # Platform-specific scrapers (simplified - use actual implementations)

    async def _scrape_linkedin(
        self,
        query: str,
        max_results: int
    ) -> List[ScrapedJob]:
        """Scrape LinkedIn jobs (requires session/auth)"""
        # Note: LinkedIn requires complex auth/session handling
        # Consider using official API or browser automation
        return []

    async def _scrape_indeed(
        self,
        query: str,
        max_results: int
    ) -> List[ScrapedJob]:
        """Scrape Indeed jobs"""
        url = f"{self.portals['indeed']['base_url']}?q={query.replace(' ', '+')}"

        async with self.session.get(url) as response:
            html = await response.text()
            soup = BeautifulSoup(html, 'html.parser')

            jobs = []
            for card in soup.find_all('div', class_='job_seen_beacon')[:max_results]:
                try:
                    title = card.find('h2', class_='jobTitle').text.strip()
                    company = card.find('span', class_='companyName').text.strip()
                    location = card.find('div', class_='companyLocation').text.strip()

                    job = ScrapedJob(
                        id=f"indeed_{len(jobs)}",
                        title=title,
                        company=company,
                        location=location,
                        description="",  # Would need to fetch detail page
                        url=""
                    )
                    jobs.append(job)
                except:
                    continue

            return jobs

    async def _scrape_weworkremotely(
        self,
        query: str,
        max_results: int
    ) -> List[ScrapedJob]:
        """Scrape We Work Remotely"""
        # Implementation similar to Indeed
        return []

    async def _scrape_angelist(
        self,
        query: str,
        max_results: int
    ) -> List[ScrapedJob]:
        """Scrape AngelList/Wellfound"""
        # Implementation
        return []

    async def _scrape_generic(
        self,
        base_url: str,
        query: str,
        max_results: int
    ) -> List[ScrapedJob]:
        """Generic scraper fallback"""
        return []

    # =========================================================================
    # API-based job search (JSearch + Apify)
    # =========================================================================

    def detect_region(self, location: str) -> str:
        """
        Detect region from location string

        Args:
            location: Location string (e.g., "Berlin, Germany", "Remote US")

        Returns:
            Region code (US, UK, EU, AU, DE, REMOTE)
        """
        return detect_region(location)

    async def search_jobs_api(
        self,
        query: str,
        location: str,
        max_results: int = 20,
        page: int = 1,
        employment_type: Optional[str] = None
    ) -> List[ScrapedJob]:
        """
        Search jobs using JSearch (RapidAPI) and Apify
        Tries primary provider based on region, falls back to secondary

        Args:
            query: Job search query (e.g., "Python Developer")
            location: Location string for region detection
            max_results: Maximum number of results to return
            page: Page number for pagination
            employment_type: Optional filter (FULLTIME, CONTRACTOR, etc.)

        Returns:
            List of ScrapedJob objects from API providers
        """
        region = self.detect_region(location)
        config = REGION_CONFIG.get(region, REGION_CONFIG['US'])

        logger.info(f"[JobScraperService] Searching with region={region}, query={query}")

        all_jobs = []

        # Try primary provider
        if config['primary'] == 'jsearch':
            async with JSearchClient() as client:
                jsearch_params = config.get('jsearch_params', {})
                api_jobs = await client.search(
                    query=query,
                    page=page,
                    num_pages=1,
                    country=jsearch_params.get('country', 'us'),
                    language=jsearch_params.get('language', 'en'),
                    remote_only=jsearch_params.get('remote_jobs_only') == 'true',
                    employment_types=employment_type
                )
                # Convert API ScrapedJob to service ScrapedJob
                for job in api_jobs:
                    service_job = ScrapedJob(
                        id=job.id,
                        title=job.title,
                        company=job.company,
                        location=job.location,
                        description=job.description,
                        url=job.url,
                        archetype=job.archetype,
                        seniority=job.seniority,
                        required_skills=job.required_skills,
                        salary_range=job.salary_range,
                        remote_policy=job.remote_policy,
                        posted_date=job.posted_date,
                        match_score=job.match_score,
                        quality_score=job.quality_score,
                        is_duplicate=job.is_duplicate
                    )
                    all_jobs.append(service_job)

        elif config['primary'] == 'apify':
            async with ApifyClientWrapper() as client:
                api_jobs = []
                if region == 'AU':
                    api_jobs = await client.search_seek_australia(
                        query=query,
                        location=location,
                        max_results=max_results
                    )
                elif region == 'DE':
                    api_jobs = await client.search_stepstone_germany(
                        query=query,
                        location=location,
                        max_results=max_results
                    )

                # Convert API ScrapedJob to service ScrapedJob
                for job in api_jobs:
                    service_job = ScrapedJob(
                        id=job.id,
                        title=job.title,
                        company=job.company,
                        location=job.location,
                        description=job.description,
                        url=job.url,
                        archetype=job.archetype,
                        seniority=job.seniority,
                        required_skills=job.required_skills,
                        salary_range=job.salary_range,
                        remote_policy=job.remote_policy,
                        posted_date=job.posted_date,
                        match_score=job.match_score,
                        quality_score=job.quality_score,
                        is_duplicate=job.is_duplicate
                    )
                    all_jobs.append(service_job)

        # Try fallback if primary returned insufficient results
        if len(all_jobs) < max_results / 2 and config.get('fallback') == 'jsearch':
            logger.info(f"[JobScraperService] Falling back to JSearch for {region}")
            async with JSearchClient() as client:
                jsearch_params = config.get('jsearch_params', {})
                api_jobs = await client.search(
                    query=query,
                    page=page,
                    num_pages=1,
                    country=jsearch_params.get('country', 'us'),
                    language=jsearch_params.get('language', 'en'),
                    employment_types=employment_type
                )
                # Convert and append
                for job in api_jobs:
                    service_job = ScrapedJob(
                        id=job.id,
                        title=job.title,
                        company=job.company,
                        location=job.location,
                        description=job.description,
                        url=job.url,
                        archetype=job.archetype,
                        seniority=job.seniority,
                        required_skills=job.required_skills,
                        salary_range=job.salary_range,
                        remote_policy=job.remote_policy,
                        posted_date=job.posted_date,
                        match_score=job.match_score,
                        quality_score=job.quality_score,
                        is_duplicate=job.is_duplicate
                    )
                    all_jobs.append(service_job)

        # Remove duplicates (by URL)
        seen_urls = set()
        unique_jobs = []
        for job in all_jobs:
            if job.url and job.url not in seen_urls:
                seen_urls.add(job.url)
                unique_jobs.append(job)

        logger.info(f"[JobScraperService] API search returned {len(unique_jobs)} unique jobs")
        return unique_jobs[:max_results]

    async def scan_all_portals_with_api(
        self,
        profile: UserProfile,
        max_results_per_portal: int = 20,
        use_api_first: bool = True
    ) -> List[ScrapedJob]:
        """
        Enhanced portal scanning with API fallbacks
        Tries API providers first, then falls back to web scraping

        Args:
            profile: UserProfile with search preferences
            max_results_per_portal: Max results per data source
            use_api_first: If True, try JSearch/Apify before web scraping

        Returns:
            List of ScrapedJob objects from all sources
        """
        all_jobs = []

        if use_api_first:
            # Try API-based search first
            for target_role in profile.target_roles[:3]:  # Limit to first 3 roles
                try:
                    api_jobs = await self.search_jobs_api(
                        query=target_role,
                        location=profile.location,
                        max_results=max_results_per_portal
                    )
                    all_jobs.extend(api_jobs)
                except Exception as e:
                    logger.error(f"[JobScraperService] API search failed: {e}")

        # Then try traditional web scraping
        web_jobs = await self.scan_all_portals(profile, max_results_per_portal)
        all_jobs.extend(web_jobs)

        # Final deduplication
        seen_urls = set()
        unique_jobs = []
        for job in all_jobs:
            if job.url and job.url not in seen_urls:
                seen_urls.add(job.url)
                unique_jobs.append(job)
            elif not job.url:
                # Keep jobs without URLs (might be from scraping)
                unique_jobs.append(job)

        # Sort by match score if available
        unique_jobs.sort(key=lambda j: j.match_score or 0, reverse=True)

        return unique_jobs

    def _title_similarity(self, title1: str, title2: str) -> float:
        """Calculate title similarity"""
        # Simple Jaccard similarity
        words1 = set(title1.lower().split())
        words2 = set(title2.lower().split())

        if not words1 or not words2:
            return 0.0

        intersection = len(words1 & words2)
        union = len(words1 | words2)

        return intersection / union if union > 0 else 0.0

    def _parse_salary(self, salary_text: str) -> Optional[int]:
        """Extract minimum salary from text"""
        # Look for patterns like "€70-90k" or "$70000"
        numbers = re.findall(r'[\d,]+', salary_text)
        if numbers:
            try:
                return int(numbers[0].replace(',', ''))
            except:
                pass
        return None

    async def scan_all_portals(
        self,
        profile: UserProfile,
        max_results_per_portal: int = 20
    ) -> List[ScrapedJob]:
        """
        Scan all configured portals and return filtered jobs.
        Main entry point for portal scanning.
        """

        # Generate queries
        queries = await self.generate_search_queries(profile)

        # Scrape all portals concurrently
        tasks = []
        for portal, query_list in queries.items():
            if query_list:
                tasks.append(
                    self.scrape_portal(
                        portal,
                        query_list[0],  # Use first query
                        max_results_per_portal
                    )
                )

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Flatten and deduplicate
        all_jobs = []
        for jobs in results:
            if isinstance(jobs, list):
                for job in jobs:
                    is_dup = await self.check_duplicate(job, all_jobs)
                    if not is_dup:
                        all_jobs.append(job)

        # Filter and rank
        filtered = await self.filter_jobs(all_jobs, profile)

        return filtered
