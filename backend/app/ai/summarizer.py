def generate_summary(
    name: str,
    matched_skills: list,
    missing_skills: list,
    score: float,
    job_title: str,
    years_of_experience: float,
    education_level: str,
    breakdown: dict,
    quality_feedback: list = []
) -> str:

    if score >= 75:
        rating = "Strong match ✅"
    elif score >= 55:
        rating = "Good match 🟡"
    elif score >= 35:
        rating = "Partial match 🟠"
    else:
        rating = "Weak match ❌"

    exp_line = f"{years_of_experience} years experience" if years_of_experience > 0 else "Experience not specified"

    edu_map = {
        "phd": "PhD", "masters": "Master's degree",
        "bachelors": "Bachelor's degree", "diploma": "Diploma",
        "alevel": "A-Level", "olevel": "O-Level", "unknown": "Education not detected"
    }
    edu_line = edu_map.get(education_level, "Not specified")

    matched_str = ", ".join(matched_skills) if matched_skills else "none detected"
    missing_str = ", ".join(missing_skills) if missing_skills else "none"
    quality_str = ", ".join(quality_feedback) if quality_feedback else "well structured"

    summary = (
        f"{rating} for {job_title}. "
        f"{exp_line}. {edu_line}. "
        f"Skills matched: {matched_str}. "
        f"Missing: {missing_str}. "
        f"CV quality notes: {quality_str}. "
        f"Score breakdown — Skills: {breakdown['skills']}/25, "
        f"Experience: {breakdown['experience']}/20, "
        f"Education: {breakdown['education']}/15, "
        f"Relevance: {breakdown['semantic']}/10, "
        f"CV Quality: {breakdown['cv_quality']}/30."
    )

    return summary