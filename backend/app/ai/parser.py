import pdfplumber
import re

# Skill synonyms — maps variations to a standard skill name
SKILL_SYNONYMS = {
    "python": ["python", "python3", "py"],
    "javascript": ["javascript", "js", "node.js", "nodejs", "node"],
    "react": ["react", "reactjs", "react.js"],
    "fastapi": ["fastapi", "fast api"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mysql": ["mysql", "my sql"],
    "machine learning": ["machine learning", "ml", "deep learning", "ai", "artificial intelligence"],
    "data analysis": ["data analysis", "data analytics", "power bi", "tableau", "excel"],
    "bsc computer science": ["computer science", "bsc cs", "bsc computer science", "bachelor of science", "bsc"],
    "2 years experience": ["2 years", "two years", "3 years", "4 years", "5 years", "senior", "experienced"],
}


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_email(text: str) -> str:
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else "Not found"


def extract_phone(text: str) -> str:
    match = re.search(r'(\+?\d[\d\s\-]{7,15}\d)', text)
    return match.group(0).strip() if match else "Not found"


def extract_name(text: str) -> str:
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines[0] if lines else "Unknown"


def normalize_skill(skill: str) -> list:
    """Return all known variations of a skill for matching"""
    skill_lower = skill.lower().strip()
    # Check if we have synonyms for this skill
    for key, synonyms in SKILL_SYNONYMS.items():
        if skill_lower in synonyms or skill_lower == key:
            return synonyms
    # If no synonyms, just return the skill itself
    return [skill_lower]


def extract_skills_from_text(text: str, required_skills: list) -> dict:
    text_lower = text.lower()
    matched = []
    missing = []

    for skill in required_skills:
        skill_clean = skill.strip()
        variations = normalize_skill(skill_clean)
        # Check if ANY variation of the skill appears in the CV
        found = any(variation in text_lower for variation in variations)
        if found:
            matched.append(skill_clean)
        else:
            missing.append(skill_clean)

    return {"matched": matched, "missing": missing}


def parse_cv(file_path: str, required_skills: list) -> dict:
    text = extract_text_from_pdf(file_path)
    skills_result = extract_skills_from_text(text, required_skills)

    return {
        "raw_text": text,
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "matched_skills": skills_result["matched"],
        "missing_skills": skills_result["missing"],
    }