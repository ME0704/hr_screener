import re

# --- Section Keywords ---
SUMMARY_KEYWORDS = [
    "summary", "objective", "profile", "about me",
    "career objective", "professional summary", "personal statement"
]

EXPERIENCE_KEYWORDS = [
    "experience", "work experience", "employment", "work history",
    "career history", "professional experience", "internship"
]

EDUCATION_KEYWORDS = [
    "education", "academic", "qualification", "university",
    "college", "school", "degree", "studied"
]

SKILLS_KEYWORDS = [
    "skills", "competencies", "expertise", "technologies",
    "tools", "technical skills", "core competencies"
]

CONTACT_PATTERNS = {
    "email": r'[\w\.-]+@[\w\.-]+\.\w+',
    "phone": r'(\+?\d[\d\s\-]{7,15}\d)',
    "linkedin": r'linkedin\.com/in/[\w\-]+',
}


def check_contact_info(text: str) -> dict:
    """Check if CV has proper contact information"""
    text_lower = text.lower()
    score = 0
    details = []

    # Check email
    if re.search(CONTACT_PATTERNS["email"], text):
        score += 2
        details.append("email ✅")
    else:
        details.append("email ❌")

    # Check phone
    if re.search(CONTACT_PATTERNS["phone"], text):
        score += 2
        details.append("phone ✅")
    else:
        details.append("phone ❌")

    # Check name (first non-empty line should look like a name)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    first_line = lines[0] if lines else ""
    # A name is usually 2-4 words, no numbers
    if first_line and len(first_line.split()) >= 2 and not any(c.isdigit() for c in first_line):
        score += 2
        details.append("name ✅")
    else:
        details.append("name ❌")

    return {"score": score, "max": 6, "details": details}


def check_professional_summary(text: str) -> dict:
    """Check if CV has a professional summary or objective"""
    text_lower = text.lower()

    has_summary = any(kw in text_lower for kw in SUMMARY_KEYWORDS)

    if has_summary:
        # Also check it has some substance (more than just the heading)
        for kw in SUMMARY_KEYWORDS:
            idx = text_lower.find(kw)
            if idx != -1:
                section_text = text_lower[idx:idx+300]
                word_count = len(section_text.split())
                if word_count >= 20:
                    return {"score": 5, "max": 5, "has_summary": True}
        return {"score": 2, "max": 5, "has_summary": True}

    return {"score": 0, "max": 5, "has_summary": False}


def check_work_experience(text: str) -> dict:
    """Check if CV has proper work experience section with dates"""
    text_lower = text.lower()
    score = 0
    details = []

    # Check for experience section
    has_section = any(kw in text_lower for kw in EXPERIENCE_KEYWORDS)
    if has_section:
        score += 2
        details.append("experience section ✅")
    else:
        details.append("experience section ❌")

    # Check for years/dates (like 2020-2023 or Jan 2021)
    date_pattern = r'(20\d{2}|19\d{2})'
    dates = re.findall(date_pattern, text)
    if len(dates) >= 2:
        score += 3
        details.append(f"dates found ({len(dates)}) ✅")
    elif len(dates) == 1:
        score += 1
        details.append("partial dates ⚠️")
    else:
        details.append("no dates ❌")

    # Check for job titles / company names (lines with capitalized words near dates)
    if has_section and len(dates) >= 2:
        score += 2
        details.append("structured experience ✅")

    return {"score": min(score, 7), "max": 7, "details": details}


def check_education(text: str) -> dict:
    """Check if CV has a proper education section"""
    text_lower = text.lower()
    score = 0
    details = []

    has_section = any(kw in text_lower for kw in EDUCATION_KEYWORDS)
    if has_section:
        score += 2
        details.append("education section ✅")
    else:
        details.append("education section ❌")

    # Check for degree mentioned
    degree_keywords = ["bachelor", "master", "phd", "diploma", "bsc", "msc", "degree", "certificate"]
    if any(kw in text_lower for kw in degree_keywords):
        score += 2
        details.append("degree mentioned ✅")
    else:
        details.append("degree not mentioned ❌")

    # Check for institution name (usually capitalized word near education section)
    institution_keywords = ["university", "college", "institute", "school", "makerere", "kyambogo"]
    if any(kw in text_lower for kw in institution_keywords):
        score += 1
        details.append("institution ✅")

    return {"score": min(score, 5), "max": 5, "details": details}


def check_skills_section(text: str) -> dict:
    """Check if CV has a dedicated skills section"""
    text_lower = text.lower()

    has_skills = any(kw in text_lower for kw in SKILLS_KEYWORDS)

    if has_skills:
        # Check how many skills are listed
        for kw in SKILLS_KEYWORDS:
            idx = text_lower.find(kw)
            if idx != -1:
                section = text_lower[idx:idx+500]
                # Count comma-separated or bullet-pointed skills
                skill_count = len(re.findall(r'[,\n•\-]', section))
                if skill_count >= 5:
                    return {"score": 4, "max": 4, "skill_count": skill_count}
                elif skill_count >= 2:
                    return {"score": 2, "max": 4, "skill_count": skill_count}
        return {"score": 1, "max": 4, "skill_count": 0}

    return {"score": 0, "max": 4, "skill_count": 0}


def check_cv_length(text: str) -> dict:
    """Check if CV is an appropriate length"""
    word_count = len(text.split())

    if 300 <= word_count <= 1000:
        # Ideal length
        return {"score": 3, "max": 3, "word_count": word_count, "verdict": "ideal"}
    elif 200 <= word_count < 300:
        # A bit short
        return {"score": 2, "max": 3, "word_count": word_count, "verdict": "short"}
    elif 1000 < word_count <= 1500:
        # A bit long
        return {"score": 2, "max": 3, "word_count": word_count, "verdict": "long"}
    elif word_count < 200:
        # Too short
        return {"score": 0, "max": 3, "word_count": word_count, "verdict": "too short"}
    else:
        # Too long
        return {"score": 1, "max": 3, "word_count": word_count, "verdict": "too long"}


def score_cv_quality(text: str) -> dict:
    """
    Main function — run all CV quality checks and return
    a total quality score and detailed breakdown
    """
    contact = check_contact_info(text)
    summary = check_professional_summary(text)
    experience = check_work_experience(text)
    education = check_education(text)
    skills = check_skills_section(text)
    length = check_cv_length(text)

    total = (
        contact["score"] +
        summary["score"] +
        experience["score"] +
        education["score"] +
        skills["score"] +
        length["score"]
    )

    # Generate quality feedback
    feedback = []
    if contact["score"] < 6:
        feedback.append("missing contact info")
    if summary["score"] == 0:
        feedback.append("no professional summary")
    if experience["score"] < 4:
        feedback.append("work experience needs more detail")
    if education["score"] < 3:
        feedback.append("education section incomplete")
    if skills["score"] == 0:
        feedback.append("no skills section")
    if length["verdict"] in ["too short", "short"]:
        feedback.append("CV is too short")

    return {
        "quality_score": total,
        "max": 30,
        "breakdown": {
            "contact": contact["score"],
            "summary": summary["score"],
            "experience": experience["score"],
            "education": education["score"],
            "skills": skills["score"],
            "length": length["score"],
        },
        "feedback": feedback,
        "word_count": length["word_count"]
    }