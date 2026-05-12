from sentence_transformers import SentenceTransformer, util
import torch

# Load the model once when the server starts
model = SentenceTransformer('all-MiniLM-L6-v2')


def calculate_match_score(cv_text: str, job_requirements: str, matched_skills: list, total_skills: int) -> float:
    """
    Calculate how well a CV matches a job.
    Combines two scores:
    - Semantic similarity (NLP meaning match) — 60% weight
    - Keyword/skills match — 40% weight
    """

    # Score 1: Semantic similarity using sentence transformers
    cv_embedding = model.encode(cv_text[:2000], convert_to_tensor=True)  # limit text size
    job_embedding = model.encode(job_requirements, convert_to_tensor=True)

    semantic_score = util.cos_sim(cv_embedding, job_embedding).item()
    semantic_score = max(0.0, min(1.0, semantic_score))  # clamp between 0 and 1

    # Score 2: Skills keyword match
    if total_skills > 0:
        skills_score = len(matched_skills) / total_skills
    else:
        skills_score = 0.0

    # Final score — weighted combination
    final_score = (semantic_score * 0.6) + (skills_score * 0.4)

    # Return as 0-100
    return round(final_score * 100, 2)