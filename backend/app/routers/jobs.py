from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.routers.auth import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from app.plans import check_job_limit

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# --- Helper: Get current logged in company from token ---
def get_current_company(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")

        if email is None or role != "company":
            raise HTTPException(status_code=401, detail="Not authorized")

        company = db.query(models.Company).filter(models.Company.email == email).first()
        if company is None:
            raise HTTPException(status_code=404, detail="Company not found")

        return company
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Create a Job ---
@router.post("/", response_model=schemas.JobOut)
def create_job(
    payload: schemas.JobCreate,
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)

    # Check job limit for plan
    limit_check = check_job_limit(company)
    if not limit_check["allowed"]:
        raise HTTPException(status_code=403, detail=limit_check["reason"])

    new_job = models.Job(
        company_id=company.id,
        title=payload.title,
        description=payload.description,
        requirements=payload.requirements
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# --- Get All Jobs for a Company ---
@router.get("/my-jobs", response_model=list[schemas.JobOut])
def get_my_jobs(
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)
    jobs = db.query(models.Job).filter(models.Job.company_id == company.id).all()
    return jobs


# --- Get Single Job by ID ---
@router.get("/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# --- Get All Active Jobs (for candidates to browse) ---
@router.get("/", response_model=list[schemas.JobOut])
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.is_active == "active").all()
    return jobs


# --- Close a Job ---
@router.put("/{job_id}/close", response_model=schemas.JobOut)
def close_job(
    job_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.company_id == company.id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    job.is_active = "closed"
    db.commit()
    db.refresh(job)
    return job


# --- Edit a Job ---
@router.put("/{job_id}", response_model=schemas.JobOut)
def edit_job(
    job_id: int,
    payload: schemas.JobCreate,
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.company_id == company.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    job.title = payload.title
    job.description = payload.description
    job.requirements = payload.requirements
    db.commit()
    db.refresh(job)
    return job


# --- Delete a Job ---
@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.company_id == company.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}


# --- Toggle Job Status (Active/Closed) ---
@router.put("/{job_id}/toggle-status", response_model=schemas.JobOut)
def toggle_job_status(
    job_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.company_id == company.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    job.is_active = "closed" if job.is_active == "active" else "active"
    db.commit()
    db.refresh(job)
    return job