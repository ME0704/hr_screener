import pdfplumber
import re
import spacy

nlp = spacy.load("en_core_web_sm")

# --- Skill Synonyms Library ---
SKILL_SYNONYMS = {
    "python": ["python", "python3", "django", "flask", "fastapi"],
    "javascript": ["javascript", "js", "node.js", "nodejs", "typescript", "ts"],
    "react": ["react", "reactjs", "react.js", "next.js", "nextjs"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "database"],
    "machine learning": ["machine learning", "ml", "deep learning", "tensorflow", "pytorch", "keras", "scikit"],
    "data analysis": ["data analysis", "data analytics", "power bi", "tableau", "excel", "pandas", "numpy"],
    "java": ["java", "spring", "spring boot", "maven"],
    "php": ["php", "laravel", "wordpress"],
    "cloud": ["aws", "azure", "gcp", "google cloud", "cloud computing", "docker", "kubernetes"],
    "project management": ["project management", "agile", "scrum", "jira", "trello", "kanban"],
    "accounting": ["accounting", "bookkeeping", "quickbooks", "sage", "tally", "financial reporting"],
    "marketing": ["marketing", "digital marketing", "seo", "social media", "google ads", "facebook ads"],
    "communication": ["communication", "presentation", "public speaking", "writing"],
}

# --- Education Keywords ---
EDUCATION_LEVELS = {
    "phd": ["phd", "doctorate", "doctor of philosophy"],
    "masters": ["masters", "msc", "mba", "m.sc", "m.a", "master of"],
    "bachelors": ["bachelor", "bsc", "b.sc", "ba", "b.a", "degree", "undergraduate", "btech", "b.tech"],
    "diploma": ["diploma", "certificate", "higher diploma", "hnd"],
    "alevel": ["a level", "a-level", "aice", "ib diploma"],
    "olevel": ["o level", "o-level", "gcse", "high school", "secondary school"],
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


def extract_years_of_experience(text: str) -> float:
    """Extract the highest number of years of experience mentioned in the CV"""
    text_lower = text.lower()

    # Match patterns like "5 years", "3+ years", "over 2 years"
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in',
    ]

    years_found = []
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            years_found.append(int(match))

    return max(years_found) if years_found else 0


def extract_education_level(text: str) -> str:
    """Detect the highest education level in the CV"""
    text_lower = text.lower()

    # Check from highest to lowest
    for level, keywords in EDUCATION_LEVELS.items():
        if any(kw in text_lower for kw in keywords):
            return level

    return "unknown"


def normalize_skill(skill: str) -> list:
    """Return all known variations of a skill"""
    skill_lower = skill.lower().strip()
    for key, synonyms in SKILL_SYNONYMS.items():
        if skill_lower in synonyms or skill_lower == key:
            return synonyms
    return [skill_lower]


def extract_skills_from_text(text: str, required_skills: list) -> dict:
    text_lower = text.lower()
    matched = []
    missing = []

    for skill in required_skills:
        skill_clean = skill.strip()
        variations = normalize_skill(skill_clean)
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
        "years_of_experience": extract_years_of_experience(text),
        "education_level": extract_education_level(text),
    }