from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Company Schemas ---
class CompanyRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class CompanyLogin(BaseModel):
    email: EmailStr
    password: str

class CompanyOut(BaseModel):
    id: int
    name: str
    email: str
    plan: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Candidate Schemas ---
class CandidateRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class CandidateOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

    
class CandidateLogin(BaseModel):
    email: EmailStr
    password: str


# --- Job Schemas ---
class JobCreate(BaseModel):
    title: str
    description: str
    requirements: str  # e.g "Python, SQL, 3 years experience, BSc Computer Science"

class JobOut(BaseModel):
    id: int
    title: str
    description: str
    requirements: str
    is_active: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Application Schemas ---
class ApplicationOut(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    cv_url: str
    score: float
    summary: Optional[str]
    matched_skills: Optional[str]
    missing_skills: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Token Schema ---
class Token(BaseModel):
    access_token: str
    token_type: str