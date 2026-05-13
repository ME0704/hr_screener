from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.plans import PLANS, get_plan
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


# --- Utility Functions ---
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# --- Company Register ---
@router.post("/company/register", response_model=schemas.CompanyOut)
def register_company(payload: schemas.CompanyRegister, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.Company).filter(models.Company.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_company = models.Company(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company


# --- Company Login ---
@router.post("/company/login", response_model=schemas.Token)
def login_company(payload: schemas.CompanyLogin, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.email == payload.email).first()
    if not company or not verify_password(payload.password, company.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={
        "sub": company.email,
        "id": company.id,
        "role": "company"
    })
    return {"access_token": token, "token_type": "bearer"}


# --- Candidate Register ---
@router.post("/candidate/register", response_model=schemas.CandidateOut)
def register_candidate(payload: schemas.CandidateRegister, db: Session = Depends(get_db)):
    existing = db.query(models.Candidate).filter(models.Candidate.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_candidate = models.Candidate(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate


# --- Candidate Login ---
@router.post("/candidate/login", response_model=schemas.Token)
def login_candidate(payload: schemas.CandidateLogin, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.email == payload.email).first()
    if not candidate or not verify_password(payload.password, candidate.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={
        "sub": candidate.email,
        "id": candidate.id,
        "role": "candidate"
    })
    return {"access_token": token, "token_type": "bearer"}


# --- Get current company plan info ---
@router.get("/company/plan")
def get_company_plan(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        company = db.query(models.Company).filter(
            models.Company.email == email
        ).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        plan = get_plan(company.plan)
        max_cvs = plan["max_cvs_per_month"]
        used = company.cvs_processed_this_month or 0

        return {
            "company_name": company.name,
            "plan": company.plan,
            "plan_details": plan,
            "cvs_used_this_month": used,
            "cvs_remaining": (max_cvs - used) if max_cvs != -1 else -1,
            "max_cvs_per_month": max_cvs,
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Upgrade plan (manual for now, Flutterwave later) ---
@router.put("/company/upgrade-plan")
def upgrade_plan(
    new_plan: str,
    token: str,
    db: Session = Depends(get_db)
):
    if new_plan not in ["free", "starter", "business"]:
        raise HTTPException(status_code=400, detail="Invalid plan")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        company = db.query(models.Company).filter(
            models.Company.email == email
        ).first()
        if not company:
            raise HTTPException(status_code=404, detail="Not found")

        company.plan = new_plan
        db.commit()

        return {"message": f"Plan upgraded to {new_plan}", "plan": new_plan}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")