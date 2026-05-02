"""
Base model and database setup
"""

import logging
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import create_engine, Column, String, DateTime, Integer, Float, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func
import os

Base = declarative_base()

# Get DATABASE_URL from environment, fallback to SQLite for local dev
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./hunt_x.db')

# Force SQLite only for local development
if not DATABASE_URL or DATABASE_URL.startswith('sqlite'):
    DATABASE_URL = 'sqlite:///./hunt_x.db'
else:
    # Use pg8000 driver explicitly
    if DATABASE_URL.startswith('postgresql://'):
        DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+pg8000://', 1)
    # Add SSL mode for Supabase connections if not present
    if 'supabase' in DATABASE_URL and 'sslmode' not in DATABASE_URL:
        separator = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL = DATABASE_URL + f"{separator}sslmode=require"

logging.getLogger("hunt-x").error(f"Using database: {DATABASE_URL[:50]}...")

# Configure engine based on database type
if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for getting DB sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TimestampMixin:
    """Mixin to add created_at and updated_at timestamps"""
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BaseModel(Base, TimestampMixin):
    """Base model with common fields"""
    __abstract__ = True

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
