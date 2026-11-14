"""
Health-check endpoint.
"""

from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthCheckResponse
from app.services.classifier import classifier_service
from app.services.regressor import regressor_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheckResponse)
async def health_check() -> HealthCheckResponse:
    """Liveness / readiness probe."""
    return HealthCheckResponse(
        status="healthy",
        version=settings.MODEL_VERSION,
        models_loaded=classifier_service.is_loaded and regressor_service.is_loaded,
    )
