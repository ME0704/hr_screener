from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class PlanEnum(str, enum.Enum):
    free = "free"
    starter = "starter"
    business = "business"

class StatusEnum(str, enum.Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    rejected = "rejected"
    interviewed = "interviewed"

# --- Company Table ---
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(Enum(PlanEnum), default=PlanEnum.free)
    cvs_processed_this_month = Column(Integer, default=0)
    billing_cycle_start = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jobs = relationship("Job", back_populates="company")


# --- Job Table ---
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)  # stored as comma separated skills
    is_active = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")


# --- Candidate Table ---
class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship("Application", back_populates="candidate")


# --- Application Table (the AI results live here) ---
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    cv_url = Column(String, nullable=False)          # path to uploaded PDF
    score = Column(Float, default=0.0)               # AI match score 0-100
    summary = Column(Text, nullable=True)            # AI generated summary
    matched_skills = Column(Text, nullable=True)     # JSON string of matched skills
    missing_skills = Column(Text, nullable=True)     # JSON string of missing skills
    parsed_data = Column(Text, nullable=True)        # full extracted CV text
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")