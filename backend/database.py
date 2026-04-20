from sqlalchemy import create_engine, Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Use SQLite for Railway (simpler, no external DB needed)
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./hunt_x.db')

# If Railway injected a PostgreSQL URL with localhost, force SQLite
if 'localhost' in DATABASE_URL or 'postgres' in DATABASE_URL.lower():
    DATABASE_URL = 'sqlite:///./hunt_x.db'

# For SQLite, disable check_same_thread
if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    stripe_customer_id = Column(String)
    stripe_payment_status = Column(String, default='pending')
    plan = Column(String, default='free')  # free, monthly, lifetime
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Resume(Base):
    __tablename__ = 'resumes'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'))
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    ai_analysis = Column(JSON)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")

class CV(Base):
    __tablename__ = 'cvs'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'))
    resume_id = Column(String, ForeignKey('resumes.id'))
    job_title = Column(String)
    company = Column(String)
    job_description = Column(String)
    cv_html = Column(String, nullable=False)
    pdf_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

User.resumes = relationship("Resume", back_populates="user")

def init_db():
    # Import subscription models here to avoid circular imports
    from models.subscription import (
        SubscriptionPlan, UserSubscription, SubscriptionEvent,
        CreditBalance, UsageLog
    )
    # Add relationship after models are imported
    User.subscription = relationship("UserSubscription", back_populates="user", uselist=False)

    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
