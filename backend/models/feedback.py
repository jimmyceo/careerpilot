"""
Feedback model for user testimonials and ratings
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from models.base import BaseModel


class Feedback(BaseModel):
    __tablename__ = "feedback"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    text = Column(Text)
    approved = Column(Boolean, default=False)
    reviewer_name = Column(String(255))
    reviewer_role = Column(String(255))

    user = relationship("User", backref="feedback_entries")

    def to_dict(self):
        return {
            "id": str(self.id),
            "rating": self.rating,
            "text": self.text,
            "approved": self.approved,
            "reviewer_name": self.reviewer_name,
            "reviewer_role": self.reviewer_role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
