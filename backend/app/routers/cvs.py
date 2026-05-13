from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.routers.auth import SECRET_KEY, ALGORITHM
from app.ai.parser import parse_cv
from app.ai.matcher import calculate_match_score
from app.ai.summarizer import generate_summary
from app.ai.matcher import calculate_match_score
from app.ai.summarizer import generate_summary
from app.plans import check_cv_limit, reset_monthly_usage
from jose import JWTError, jwt
import shutil
import os
import json

router = APIRouter(prefix="/cvs", tags=["CVs"])

# Folder to save uploaded CVs
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- Helper: get current candidate from token ---
def get_current_candidate(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")

        if email is None or role != "candidate":
            raise HTTPException(status_code=401, detail="Not authorized")

        candidate = db.query(models.Candidate).filter(
            models.Candidate.email == email
        ).first()

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        return candidate
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Helper: get current company from token ---
def get_current_company(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")

        if email is None or role != "company":
            raise HTTPException(status_code=401, detail="Not authorized")

        company = db.query(models.Company).filter(
            models.Company.email == email
        ).first()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        return company
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Candidate applies to a job and uploads CV ---
@router.post("/apply/{job_id}", response_model=schemas.ApplicationOut)
def apply_to_job(
    job_id: int,
    token: str = Form(...),
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Authenticate candidate
    candidate = get_current_candidate(token, db)

    # Check company CV limit
    job_company = db.query(models.Company).filter(
        models.Company.id == job.company_id
    ).first()

    reset_monthly_usage(job_company, db)
    cv_check = check_cv_limit(job_company, count=1)
    if not cv_check["allowed"]:
        raise HTTPException(status_code=403, detail=cv_check["reason"])

    # 2. Check job exists
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.is_active == "active"
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or closed")

    # 3. Check not already applied
    existing = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.candidate_id == candidate.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    # 4. Save the uploaded PDF
    file_path = f"{UPLOAD_DIR}/cv_{candidate.id}_{job_id}.pdf"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(cv_file.file, buffer)

    # 5. Parse the CV with AI
    required_skills = [s.strip() for s in job.requirements.split(",")]
    parsed = parse_cv(file_path, required_skills)

    # 6. Calculate match score
    score_result = calculate_match_score(
        cv_text=parsed["raw_text"],
        job_requirements=job.requirements + " " + job.description,
        matched_skills=parsed["matched_skills"],
        total_skills=len(required_skills),
        years_of_experience=parsed["years_of_experience"],
        education_level=parsed["education_level"]
    )

    # 7. Generate summary
    summary = generate_summary(
        name=parsed["name"],
        matched_skills=parsed["matched_skills"],
        missing_skills=parsed["missing_skills"],
        score=score_result["final_score"],
        job_title=job.title,
        years_of_experience=parsed["years_of_experience"],
        education_level=parsed["education_level"],
        breakdown=score_result["breakdown"],
        quality_feedback=score_result["quality_feedback"],
        uganda_insights=score_result["uganda_report"]["insights"]
    )

    # 8. Save to database
    application = models.Application(
        job_id=job_id,
        candidate_id=candidate.id,
        cv_url=file_path,
        score=score_result["final_score"],
        summary=summary,
        matched_skills=json.dumps(parsed["matched_skills"]),
        missing_skills=json.dumps(parsed["missing_skills"]),
        parsed_data=parsed["raw_text"]
    )

    # Increment company CV count
    job_company.cvs_processed_this_month += 1
    db.commit()


# -- company upload bulk cvs for a job 
@router.post("/bulk-upload/{job_id}")
def bulk_upload_cvs(
    job_id: int,
    token: str = Form(...),
    cv_files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)

    # Check job belongs to company
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.company_id == company.id
    ).first()

    # Check company CV limit for bulk
    company_obj = db.query(models.Company).filter(
        models.Company.id == job.company_id
    ).first()

    reset_monthly_usage(company_obj, db)
    cv_check = check_cv_limit(company_obj, count=len(cv_files))
    if not cv_check["allowed"]:
        raise HTTPException(
            status_code=403,
            detail=cv_check["reason"]
        )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    required_skills = [s.strip() for s in job.requirements.split(",")]
    results = []

    for cv_file in cv_files:
        try:
            # Save file
            file_path = f"{UPLOAD_DIR}/bulk_{job_id}_{cv_file.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(cv_file.file, buffer)

            # Parse CV
            parsed = parse_cv(file_path, required_skills)

            # Score CV
            score_result = calculate_match_score(
                cv_text=parsed["raw_text"],
                job_requirements=job.requirements + " " + job.description,
                matched_skills=parsed["matched_skills"],
                total_skills=len(required_skills),
                years_of_experience=parsed["years_of_experience"],
                education_level=parsed["education_level"]
            )

            # Generate summary
            summary = generate_summary(
                name=parsed["name"],
                matched_skills=parsed["matched_skills"],
                missing_skills=parsed["missing_skills"],
                score=score_result["final_score"],
                job_title=job.title,
                years_of_experience=parsed["years_of_experience"],
                education_level=parsed["education_level"],
                breakdown=score_result["breakdown"],
                quality_feedback=score_result["quality_feedback"],
                uganda_insights=score_result["uganda_report"]["insights"]
            )

            # Create a guest candidate record for bulk uploads
            guest_email = f"bulk_{job_id}_{cv_file.filename}@upload.local"
            candidate = db.query(models.Candidate).filter(
                models.Candidate.email == guest_email
            ).first()

            if not candidate:
                candidate = models.Candidate(
                    name=parsed["name"],
                    email=guest_email,
                    hashed_password="bulk_upload"
                )
                db.add(candidate)
                db.commit()
                db.refresh(candidate)

            # Save application
            application = models.Application(
                job_id=job_id,
                candidate_id=candidate.id,
                cv_url=file_path,
                score=score_result["final_score"],
                summary=summary,
                matched_skills=json.dumps(parsed["matched_skills"]),
                missing_skills=json.dumps(parsed["missing_skills"]),
                parsed_data=parsed["raw_text"]
            )
            db.add(application)
            db.commit()
            db.refresh(application)

            company_obj.cvs_processed_this_month += 1
            db.commit()

            results.append({
                "filename": cv_file.filename,
                "candidate_name": parsed["name"],
                "candidate_email": parsed["email"],
                "score": score_result["final_score"],
                "summary": summary,
                "matched_skills": parsed["matched_skills"],
                "missing_skills": parsed["missing_skills"],
                "application_id": application.id,
                "status": "processed"
            })

        except Exception as e:
            results.append({
                "filename": cv_file.filename,
                "status": "failed",
                "error": str(e)
            })

    # Sort by score highest first
    results.sort(key=lambda x: x.get("score", 0), reverse=True)

    return {
        "job_title": job.title,
        "total_uploaded": len(cv_files),
        "total_processed": len([r for r in results if r["status"] == "processed"]),
        "total_failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    }

# --- Company views all ranked applications for a job ---
@router.get("/job/{job_id}/applications")
def get_ranked_applications(
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

    applications = db.query(models.Application).filter(
        models.Application.job_id == job_id
    ).order_by(models.Application.score.desc()).all()

    # Add candidate name to each application
    results = []
    for app in applications:
        candidate = db.query(models.Candidate).filter(
            models.Candidate.id == app.candidate_id
        ).first()
        results.append({
            "id": app.id,
            "candidate_id": app.candidate_id,
            "candidate_name": candidate.name if candidate else "Unknown",
            "candidate_email": candidate.email if candidate else "Unknown",
            "job_id": app.job_id,
            "cv_url": app.cv_url,
            "score": app.score,
            "summary": app.summary,
            "matched_skills": app.matched_skills,
            "missing_skills": app.missing_skills,
            "status": app.status,
            "created_at": app.created_at,
        })
    return results


# --- Company updates candidate status ---
@router.put("/application/{application_id}/status", response_model=schemas.ApplicationOut)
def update_status(
    application_id: int,
    status: str,
    token: str,
    db: Session = Depends(get_db)
):
    company = get_current_company(token, db)

    application = db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    valid_statuses = ["pending", "shortlisted", "rejected", "interviewed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    application.status = status
    db.commit()
    db.refresh(application)
    return application


@router.get("/my-applications")
def get_my_applications(
    token: str,
    db: Session = Depends(get_db)
):
    candidate = get_current_candidate(token, db)

    applications = db.query(models.Application).filter(
        models.Application.candidate_id == candidate.id
    ).order_by(models.Application.created_at.desc()).all()

    results = []
    for app in applications:
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        results.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown",
            "candidate_id": app.candidate_id,
            "cv_url": app.cv_url,
            "score": app.score,
            "summary": app.summary,
            "matched_skills": app.matched_skills,
            "missing_skills": app.missing_skills,
            "status": app.status,
            "created_at": app.created_at,
        })
    return results