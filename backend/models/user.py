"""
User model
"""

from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.orm import relationship

from models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    # Basic info
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    website = Column(String(500))

    # Job preferences - using JSON instead of ARRAY for SQLite compatibility
    target_roles = Column(JSON, default=list)
    preferred_archetypes = Column(JSON, default=list)
    remote_preference = Column(String(50), default="any")  # remote, hybrid, onsite, any
    min_salary = Column(Integer)

    # Subscription
    tier = Column(String(50), default="try")  # try, active, aggressive, unlimited
    jobs_remaining = Column(Integer, default=5)
    jobs_reset_date = Column(DateTime)

    # Password reset
    reset_token = Column(String(255), unique=True, nullable=True, index=True)
    reset_token_expires = Column(DateTime)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="user")
    cvs = relationship("CV", back_populates="user")
    cover_letters = relationship("CoverLetter", back_populates="user")
    interview_preps = relationship("InterviewPrep", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    saved_jobs = relationship("SavedJob", back_populates="user")
    subscription = relationship("UserSubscription", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, tier={self.tier})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "location": self.location,
            "tier": self.tier,
            "jobs_remaining": self.jobs_remaining,
            "target_roles": self.target_roles or [],
            "preferred_archetypes": self.preferred_archetypes or [],
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
