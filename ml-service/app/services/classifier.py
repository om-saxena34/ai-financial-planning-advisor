"""
Classifier service – loads the trained behaviour-classification model and
exposes a predict() helper used by the /predict/classify endpoint.
"""

import logging
import joblib
import pandas as pd
from fastapi import HTTPException

from app.config import settings
from app.schemas import ClassificationInput, ClassificationOutput

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
]


class ClassifierService:
  """Wraps a scikit-learn classifier pipeline persisted with joblib."""

  def __init__(self) -> None:
    self.model = None
    self.load_model()

  def load_model(self) -> None:
    try:
      self.model = joblib.load(settings.classifier_path)
      logger.info("Classifier loaded from %s", settings.classifier_path)
    except FileNotFoundError:
      logger.warning("Classifier not found at %s – train models first.", settings.classifier_path)
    except Exception as exc:
      logger.error("Failed to load classifier: %s", exc)

  @property
  def is_loaded(self) -> bool:
    return self.model is not None

  def predict(self, data: ClassificationInput) -> ClassificationOutput:
    if not self.is_loaded:
      self.load_model()
      if not self.is_loaded:
        raise HTTPException(
          status_code=503,
          detail="Classifier model not loaded – train models first.",
        )

    # Build single-row DataFrame with exact columns
    feature_dict = {feat: getattr(data, feat) for feat in FEATURE_ORDER}
    df = pd.DataFrame([feature_dict])

    predicted_class = str(self.model.predict(df)[0])
    probas = self.model.predict_proba(df)[0]
    classes = list(self.model.classes_)

    probabilities = {str(name): round(float(p), 4) for name, p in zip(classes, probas)}

    # Feature importances extraction
    try:
      estimator = self.model.named_steps.get('clf') if hasattr(self.model, 'named_steps') else self.model
      importances = getattr(estimator, 'feature_importances_', [0.0] * len(FEATURE_ORDER))
    except Exception:
      importances = [0.0] * len(FEATURE_ORDER)

    ranked = sorted(zip(FEATURE_ORDER, importances), key=lambda x: x[1], reverse=True)
    top_factors = [
      {"feature": feat, "importance": round(float(imp), 4)}
      for feat, imp in ranked[:5]
    ]

    return ClassificationOutput(
      predicted_class=predicted_class,
      probabilities=probabilities,
      top_factors=top_factors,
      model_version=settings.MODEL_VERSION,
      source="ml_service",
    )


classifier_service = ClassifierService()
