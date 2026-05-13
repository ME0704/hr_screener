from sentence_transformers import SentenceTransformer, util
from app.ai.cv_quality import score_cv_quality
from app.ai.uganda_intelligence import get_uganda_intelligence_report

model = SentenceTransformer('all-MiniLM-L6-v2')

EDUCATION_RANK = {
    "phd": 5, "masters": 4, "bachelors": 3,
    "diploma": 2, "alevel": 1, "olevel": 0, "unknown": 0,
}


def score_skills(matched_skills: list, total_skills: int) -> float:
    if total_skills == 0:
        return 0.0
    return len(matched_skills) / total_skills


def score_experience(cv_years: float, requirements_text: str) -> float:
    import re
    text_lower = requirements_text.lower()
    patterns = [
        r'(\d+)\+?\s*years?\s*experience',
        r'(\d+)\+?\s*years?\s*of',
        r'minimum\s*(\d+)\s*years?',
        r'at\s*least\s*(\d+)\s*years?',
    ]
    required_years = 0
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            required_years = int(match.group(1))
            break

    if required_years == 0:
        return 1.0
    if cv_years >= required_years:
        return 1.0
    elif cv_years >= required_years * 0.75:
        return 0.75
    elif cv_years >= required_years * 0.5:
        return 0.5
    elif cv_years > 0:
        return 0.25
    return 0.0


def score_education(cv_education: str, requirements_text: str) -> float:
    text_lower = requirements_text.lower()
    cv_rank = EDUCATION_RANK.get(cv_education, 0)

    required_rank = 0
    if any(kw in text_lower for kw in ["phd", "doctorate"]):
        required_rank = 5
    elif any(kw in text_lower for kw in ["masters", "msc", "mba"]):
        required_rank = 4
    elif any(kw in text_lower for kw in ["degree", "bachelor", "bsc", "graduate"]):
        required_rank = 3
    elif any(kw in text_lower for kw in ["diploma", "certificate"]):
        required_rank = 2
    else:
        return 1.0

    if cv_rank >= required_rank:
        return 1.0
    elif cv_rank == required_rank - 1:
        return 0.5
    else:
        return 0.1


def score_semantic(cv_text: str, job_requirements: str) -> float:
    cv_embedding = model.encode(cv_text[:3000], convert_to_tensor=True)
    job_embedding = model.encode(job_requirements, convert_to_tensor=True)
    similarity = util.cos_sim(cv_embedding, job_embedding).item()
    return max(0.0, min(1.0, similarity))


def calculate_match_score(
    cv_text: str,
    job_requirements: str,
    matched_skills: list,
    total_skills: int,
    years_of_experience: float = 0,
    education_level: str = "unknown"
) -> dict:

    # Core scores
    skills_raw = score_skills(matched_skills, total_skills)
    experience_raw = score_experience(years_of_experience, job_requirements)
    education_raw = score_education(education_level, job_requirements)
    semantic_raw = score_semantic(cv_text, job_requirements)

    # CV quality score (out of 30)
    quality_result = score_cv_quality(cv_text)
    quality_score = quality_result["quality_score"]

    # Uganda intelligence bonus (out of 15)
    uganda_report = get_uganda_intelligence_report(cv_text, job_requirements)
    uganda_bonus = uganda_report["total_bonus"]

    # Weighted scores
    skills_score = round(skills_raw * 25, 1)
    experience_score = round(experience_raw * 20, 1)
    education_score = round(education_raw * 15, 1)
    semantic_score = round(semantic_raw * 10, 1)

    # Base score out of 85 + quality 30 + uganda bonus 15 = max 100
    base_score = skills_score + experience_score + education_score + semantic_score
    final_score = round(base_score + quality_score + uganda_bonus, 1)

    return {
        "final_score": min(final_score, 100),
        "breakdown": {
            "skills": skills_score,
            "experience": experience_score,
            "education": education_score,
            "semantic": semantic_score,
            "cv_quality": quality_score,
            "uganda_bonus": uganda_bonus,
        },
        "quality_feedback": quality_result["feedback"],
        "quality_breakdown": quality_result["breakdown"],
        "uganda_report": uganda_report,
    }