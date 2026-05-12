import pdfplumber
import re

def extract_text_from_pdf(file_path: str) -> str:
    """Extract raw text from a PDF file"""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_email(text: str) -> str:
    """Pull email address from CV text"""
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else "Not found"


def extract_phone(text: str) -> str:
    """Pull phone number from CV text"""
    match = re.search(r'(\+?\d[\d\s\-]{7,15}\d)', text)
    return match.group(0).strip() if match else "Not found"


def extract_name(text: str) -> str:
    """Extract name — usually the first line of a CV"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines[0] if lines else "Unknown"


def extract_skills_from_text(text: str, required_skills: list) -> dict:
    """
    Check which required skills appear in the CV text.
    Returns matched and missing skills.
    """
    text_lower = text.lower()
    matched = []
    missing = []

    for skill in required_skills:
        if skill.lower().strip() in text_lower:
            matched.append(skill.strip())
        else:
            missing.append(skill.strip())

    return {
        "matched": matched,
        "missing": missing
    }


def parse_cv(file_path: str, required_skills: list) -> dict:
    """
    Main function — parse a CV and return all extracted data
    """
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