"""
Regressor service – loads the trained financial-forecast model and
exposes a predict() helper used by the /predict/forecast endpoint.
"""

import logging
import joblib
import pandas as pd
from fastapi import HTTPException

from app.config import settings
from app.schemas import ForecastInput, ForecastOutput

logger = logging.getLogger(__name__)

FEATURE_ORDER = [
  'age',
  'dependents',
  'risk_profile',
  'monthly_income',
  'total_expenses',
  'savings_rate',
  'essential_expense_ratio',
  'discretionary_expense_ratio',
  'food_ratio',
  'entertainment_ratio',
  'shopping_ratio',
  'debt_to_income',
  'emergency_fund_months',
  'investment_ratio',
  'existing_savings',
  'existing_investments',
]


class RegressorService:
  """Wraps a scikit-learn regressor multi-output pipeline persisted with joblib."""

  def __init__(self) -> None:
    self.model = None
    self.load_model()

  def load_model(self) -> None:
    try:
      self.model = joblib.load(settings.regressor_path)
      logger.info("Regressor loaded from %s", settings.regressor_path)
    except FileNotFoundError:
      logger.warning("Regressor not found at %s – train models first.", settings.regressor_path)
    except Exception as exc:
      logger.error("Failed to load regressor: %s", exc)

  @property
  def is_loaded(self) -> bool:
    return self.model is not None

  def predict(self, data: ForecastInput) -> ForecastOutput:
    if not self.is_loaded:
      self.load_model()
      if not self.is_loaded:
        raise HTTPException(
          status_code=503,
          detail="Regressor model not loaded – train models first.",
        )

    # Build single-row DataFrame with exact columns
    feature_dict = {feat: getattr(data, feat) for feat in FEATURE_ORDER}
    df = pd.DataFrame([feature_dict])

    prediction = self.model.predict(df)[0]
    savings_12m = max(0.0, float(prediction[0]))
    wealth_5y = max(0.0, float(prediction[1]))

    # ±12% confidence band based on evaluation residual std
    confidence_band = {
      "savings_12m_low": round(savings_12m * 0.88, 2),
      "savings_12m_high": round(savings_12m * 1.12, 2),
      "wealth_5y_low": round(wealth_5y * 0.88, 2),
      "wealth_5y_high": round(wealth_5y * 1.12, 2),
    }

    return ForecastOutput(
      predicted_savings_12m=round(savings_12m, 2),
      predicted_wealth_5y=round(wealth_5y, 2),
      confidence_band=confidence_band,
      model_version=settings.MODEL_VERSION,
      source="ml_service",
    )


regressor_service = RegressorService()
