"""
Model-metrics endpoint – serves the metrics.json written after training.
"""

import json

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import ModelMetricsResponse

router = APIRouter(tags=["metrics"])


@router.get("/model/metrics", response_model=ModelMetricsResponse)
async def get_model_metrics() -> ModelMetricsResponse:
    """Return metrics from the most recent training run."""
    try:
        with open(settings.metrics_path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return ModelMetricsResponse(**data)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="No metrics available – train models first.",
        )
