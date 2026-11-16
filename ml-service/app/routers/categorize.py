"""
Statement categorizer router – identifies categories from transaction descriptions.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.categorizer import categorize_batch

router = APIRouter(prefix="/categorize", tags=["categorize"])

class CategorizeItem(BaseModel):
    idx: int
    description: str

class CategorizeBatchRequest(BaseModel):
    items: List[CategorizeItem]

@router.post("")
async def categorize_statement_items(req: CategorizeBatchRequest):
    """Categorizes a list of transaction descriptions."""
    items_dicts = [{"idx": item.idx, "description": item.description} for item in req.items]
    results = categorize_batch(items_dicts)
    return {"results": results, "source": "ml_service"}
