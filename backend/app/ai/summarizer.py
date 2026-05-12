def generate_summary(
    name: str,
    matched_skills: list,
    missing_skills: list,
    score: float,
    job_title: str
) -> str:
    """
    Generate a short AI summary for the HR dashboard.
    Tells the HR manager the key facts at a glance.
    """

    # Score label
    if score >= 75:
        rating = "Strong match"
    elif score >= 50:
        rating = "Good match"
    elif score >= 30:
        rating = "Partial match"
    else:
        rating = "Weak match"

    # Build summary
    matched_str = ", ".join(matched_skills) if matched_skills else "none detected"
    missing_str = ", ".join(missing_skills) if missing_skills else "none"

    summary = (
        f"{rating} for {job_title}. "
        f"Matched skills: {matched_str}. "
        f"Missing: {missing_str}. "
        f"Overall score: {score}/100."
    )

    return summary