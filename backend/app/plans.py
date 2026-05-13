# Plan limits definition
PLANS = {
    "free": {
        "name": "Free",
        "price": 0,
        "max_jobs": 1,
        "max_cvs_per_month": 10,
        "bulk_upload": False,
        "export": False,
        "priority_support": False,
    },
    "starter": {
        "name": "Starter",
        "price": 29,
        "max_jobs": 5,
        "max_cvs_per_month": 100,
        "bulk_upload": True,
        "export": True,
        "priority_support": False,
    },
    "business": {
        "name": "Business",
        "price": 79,
        "max_jobs": -1,          # -1 means unlimited
        "max_cvs_per_month": -1,
        "bulk_upload": True,
        "export": True,
        "priority_support": True,
    }
}


def get_plan(plan_name: str) -> dict:
    return PLANS.get(plan_name, PLANS["free"])


def check_job_limit(company) -> dict:
    """Check if company can create more jobs"""
    plan = get_plan(company.plan)
    max_jobs = plan["max_jobs"]

    if max_jobs == -1:
        return {"allowed": True, "reason": ""}

    from sqlalchemy import func
    current_jobs = len(company.jobs) if hasattr(company, 'jobs') else 0

    if current_jobs >= max_jobs:
        return {
            "allowed": False,
            "reason": f"Your {plan['name']} plan allows {max_jobs} job post{'s' if max_jobs > 1 else ''}. Upgrade to post more."
        }

    return {"allowed": True, "reason": ""}


def check_cv_limit(company, count: int = 1) -> dict:
    """Check if company can process more CVs this month"""
    plan = get_plan(company.plan)
    max_cvs = plan["max_cvs_per_month"]

    if max_cvs == -1:
        return {"allowed": True, "reason": "", "remaining": 999999}

    current = company.cvs_processed_this_month or 0
    remaining = max_cvs - current

    if remaining <= 0:
        return {
            "allowed": False,
            "remaining": 0,
            "reason": f"You have used all {max_cvs} CV screenings for this month on the {plan['name']} plan. Upgrade for more."
        }

    if remaining < count:
        return {
            "allowed": False,
            "remaining": remaining,
            "reason": f"You only have {remaining} CV screening{'s' if remaining > 1 else ''} left this month. Upgrade for more."
        }

    return {"allowed": True, "remaining": remaining, "reason": ""}


def reset_monthly_usage(company, db):
    """Reset CV count if a new billing month has started"""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    cycle_start = company.billing_cycle_start

    if cycle_start and (now - cycle_start).days >= 30:
        company.cvs_processed_this_month = 0
        company.billing_cycle_start = now
        db.commit()