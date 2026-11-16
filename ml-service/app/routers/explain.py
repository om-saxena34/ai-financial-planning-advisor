"""
Explainability router – explains ML classification in human terms.
"""
from fastapi import APIRouter
from app.services.explainer import explain_class

router = APIRouter(prefix="/explain", tags=["explain"])

@router.post("/class")
async def explain_user_class(data: dict):
    """Explains why user was assigned to Saver/Balanced/Overspender with top 3 factors."""
    return explain_class(data)
