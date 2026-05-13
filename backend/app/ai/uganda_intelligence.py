# ============================================
# UGANDA-SPECIFIC AI INTELLIGENCE
# Teaches the AI to understand the Ugandan
# job market, qualifications and institutions
# ============================================

# --- Universities & Institutions ---
UGANDAN_UNIVERSITIES = {
    "tier_1": [  # Most recognized
        "makerere", "makerere university",
        "makerere university business school", "mubs",
        "uganda christian university", "ucu",
        "kyambogo", "kyambogo university",
    ],
    "tier_2": [  # Well recognized
        "nkumba", "nkumba university",
        "ndejje", "ndejje university",
        "kiu", "kampala international university",
        "busitema", "busitema university",
        "gulu university",
        "mbarara university", "must",
        "cavendish university",
        "victoria university",
        "umukama university",
    ],
    "tier_3": [  # Recognized
        "isbat", "ymca", "orient",
        "st lawrence university",
        "bishop stuart university",
        "lira university",
        "soroti university",
    ]
}

# --- Ugandan Qualifications ---
UGANDAN_QUALIFICATIONS = {
    "professional": [
        "icpau",  # Institute of Certified Public Accountants Uganda
        "cpa uganda", "cpa (u)",
        "acca",
        "cima",
        "cia",  # Certified Internal Auditor
        "cfe",  # Certified Fraud Examiner
        "pmp",  # Project Management Professional
        "cissp",
        "prince2",
        "nebosh",  # Health & Safety
        "ihrm",  # Institute of Human Resource Management
        "umoa",  # Uganda Medical Officers Association
        "unmc",  # Uganda Nursing and Midwifery Council
    ],
    "academic": [
        "uce",   # Uganda Certificate of Education (O-Level)
        "uace",  # Uganda Advanced Certificate of Education (A-Level)
        "ubteb", # Uganda Business and Technical Examinations Board
        "uneb",  # Uganda National Examinations Board
    ],
    "vocational": [
        "uaheb",  # Uganda Allied Health Examinations Board
        "utm",    # Uganda Technical College
        "utc",
        "nvq",    # National Vocational Qualification
    ]
}

# --- Credible Ugandan Companies (Experience Recognition) ---
CREDIBLE_UG_COMPANIES = {
    "tier_1": [  # Top tier — major signal
        "mtn uganda", "mtn",
        "airtel uganda", "airtel",
        "stanbic bank", "stanbic",
        "dfcu bank", "dfcu",
        "bank of uganda",
        "uganda revenue authority", "ura",
        "national social security fund", "nssf",
        "umeme",
        "equity bank",
        "centenary bank",
        "absa uganda", "absa",
        "standard chartered",
        "housing finance bank",
        "post bank uganda",
    ],
    "tier_2": [  # Well known organizations
        "world vision", "world vision uganda",
        "save the children",
        "care international", "care uganda",
        "action aid", "actionaid",
        "red cross", "uganda red cross",
        "unicef", "undp", "unhcr", "who",
        "usaid", "dfid", "giz",
        "kampala capital city authority", "kcca",
        "national water", "nwsc",
        "uganda telecom", "utl",
        "africell",
        "ncba bank",
        "orient bank",
        "tropical bank",
    ],
    "tier_3": [  # Known companies
        "roofings", "roofings group",
        "movit products",
        "mukwano", "mukwano industries",
        "kpcl", "kakira sugar",
        "sugar corporation", "scoul",
        "nile breweries",
        "uganda breweries",
        "bralirwa",
        "roke telkom",
    ]
}

# --- Ugandan Cities and Regions (Location Awareness) ---
UGANDAN_LOCATIONS = [
    "kampala", "entebbe", "jinja", "gulu", "mbarara",
    "mbale", "fort portal", "soroti", "lira", "arua",
    "masaka", "kasese", "kabale", "hoima", "tororo",
    "wakiso", "mukono", "buikwe", "mityana",
    "uganda", "east africa", "east african"
]

# --- Industry-Specific Keywords for Uganda ---
UGANDAN_INDUSTRY_KEYWORDS = {
    "banking_finance": [
        "core banking", "flexcube", "temenos", "t24",
        "mobile money", "momo", "airtel money",
        "forex", "treasury", "trade finance",
        "microfinance", "sacco", "village savings",
        "bank of uganda regulations", "fia",  # Financial Intelligence Authority
    ],
    "ngo_development": [
        "m&e", "monitoring and evaluation",
        "log frame", "logframe", "theory of change",
        "beneficiary", "community mobilization",
        "capacity building", "donor reporting",
        "usaid regulations", "dfid", "eu funding",
        "district local government", "sub county",
    ],
    "telecom": [
        "uu", "momo api", "mobile money integration",
        "vas", "value added services",
        "bss", "oss", "billing systems",
        "network operations",
    ],
    "healthcare": [
        "dhis2",  # District Health Information System used in Uganda
        "hmis",   # Health Management Information System
        "nda",    # National Drug Authority Uganda
        "unas",   # Uganda Nurses and Allied health Staff
        "mulago", "aga khan", "case clinic",
        "health center", "village health team", "vht",
    ],
    "agriculture": [
        "naads", "naro",  # Uganda agricultural bodies
        "out grower", "coffee", "tea", "tobacco",
        "export promotion board",
        "ucda",  # Uganda Coffee Development Authority
        "unbs",  # Uganda National Bureau of Standards
    ]
}


def detect_ugandan_university(text: str) -> dict:
    """Detect if candidate went to a Ugandan university and its tier"""
    text_lower = text.lower()

    for tier, universities in UGANDAN_UNIVERSITIES.items():
        for uni in universities:
            if uni in text_lower:
                return {
                    "found": True,
                    "tier": tier,
                    "institution": uni,
                    "bonus": 3 if tier == "tier_1" else 2 if tier == "tier_2" else 1
                }

    return {"found": False, "tier": None, "institution": None, "bonus": 0}


def detect_ugandan_qualifications(text: str) -> dict:
    """Detect Ugandan professional qualifications"""
    text_lower = text.lower()
    found_quals = []
    bonus = 0

    for category, quals in UGANDAN_QUALIFICATIONS.items():
        for qual in quals:
            if qual in text_lower:
                found_quals.append(qual.upper())
                if category == "professional":
                    bonus += 3
                elif category == "academic":
                    bonus += 1

    return {
        "found": len(found_quals) > 0,
        "qualifications": found_quals,
        "bonus": min(bonus, 8)  # cap at 8 bonus points
    }


def detect_credible_experience(text: str) -> dict:
    """Detect experience at well-known Ugandan organizations"""
    text_lower = text.lower()
    found_companies = []
    bonus = 0

    for tier, companies in CREDIBLE_UG_COMPANIES.items():
        for company in companies:
            if company in text_lower:
                found_companies.append(company.title())
                if tier == "tier_1":
                    bonus += 4
                elif tier == "tier_2":
                    bonus += 2
                elif tier == "tier_3":
                    bonus += 1

    return {
        "found": len(found_companies) > 0,
        "companies": list(set(found_companies)),  # remove duplicates
        "bonus": min(bonus, 10)  # cap at 10 bonus points
    }


def detect_industry_expertise(text: str, job_description: str) -> dict:
    """
    Detect if candidate has industry-specific Ugandan expertise
    that matches the job description
    """
    text_lower = text.lower()
    job_lower = job_description.lower()
    found_keywords = []
    bonus = 0

    for industry, keywords in UGANDAN_INDUSTRY_KEYWORDS.items():
        # Check if the job is in this industry
        industry_match = any(kw in job_lower for kw in keywords)
        if industry_match:
            # Check how many industry keywords the candidate has
            for kw in keywords:
                if kw in text_lower:
                    found_keywords.append(kw)
                    bonus += 1

    return {
        "found": len(found_keywords) > 0,
        "keywords": found_keywords[:5],  # top 5
        "bonus": min(bonus, 8)  # cap at 8
    }


def get_uganda_intelligence_report(cv_text: str, job_description: str) -> dict:
    """
    Run all Uganda-specific checks and return a full report
    with bonus points and insights for HR
    """
    university = detect_ugandan_university(cv_text)
    qualifications = detect_ugandan_qualifications(cv_text)
    experience = detect_credible_experience(cv_text)
    industry = detect_industry_expertise(cv_text, job_description)

    total_bonus = (
        university["bonus"] +
        qualifications["bonus"] +
        experience["bonus"] +
        industry["bonus"]
    )

    # Build HR insights
    insights = []
    if university["found"]:
        insights.append(f"Studied at {university['institution'].title()}")
    if qualifications["found"]:
        insights.append(f"Has {', '.join(qualifications['qualifications'][:3])} certification(s)")
    if experience["found"]:
        insights.append(f"Worked at {', '.join(experience['companies'][:2])}")
    if industry["found"]:
        insights.append(f"Has local industry expertise")

    return {
        "university": university,
        "qualifications": qualifications,
        "experience": experience,
        "industry": industry,
        "total_bonus": min(total_bonus, 15),  # max 15 bonus points
        "insights": insights
    }