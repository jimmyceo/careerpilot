"""
Application tracking model
"""

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from models.base import BaseModel


class Application(BaseModel):
    __tablename__ = "applications"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    stage = Column(String(50), default="applied")
    date = Column(String(50))
    notes = Column(Text)
    url = Column(String(1000))
    salary = Column(String(255))
    location = Column(String(255))

    user = relationship("User", backref="applications")

    def to_dict(self):
        return {
            "id": str(self.id),
            "company": self.company,
            "role": self.role,
            "stage": self.stage,
            "date": self.date,
            "notes": self.notes,
            "url": self.url,
            "salary": self.salary,
            "location": self.location,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
