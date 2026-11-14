"""
Prediction endpoints – classify behaviour & forecast finances.
"""

from fastapi import APIRouter

from app.schemas import (
    ClassificationInput,
    ClassificationOutput,
    ForecastInput,
    ForecastOutput,
)
from app.services.classifier import classifier_service
from app.services.regressor import regressor_service

router = APIRouter(prefix="/predict", tags=["predictions"])


@router.post("/classify", response_model=ClassificationOutput)
async def classify(data: ClassificationInput) -> ClassificationOutput:
    """Classify a user's financial behaviour as Overspender / Balanced / Saver."""
    return classifier_service.predict(data)


@router.post("/forecast", response_model=ForecastOutput)
async def forecast(data: ForecastInput) -> ForecastOutput:
    """Forecast 12-month savings and 5-year wealth."""
    return regressor_service.predict(data)
