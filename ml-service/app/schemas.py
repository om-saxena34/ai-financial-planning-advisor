"""
Pydantic v2 schemas for request / response models.
"""

from pydantic import BaseModel, Field


# ── Inputs ──────────────────────────────────────────────────────────────────

class ClassificationInput(BaseModel):
    """Input features for the financial-behaviour classifier."""

    age: int = Field(..., ge=18, le=100, description="User age")
    monthly_income: float = Field(..., gt=0, description="Monthly income in currency units")
    total_expenses: float = Field(..., ge=0, description="Total monthly expenses")
    savings_rate: float = Field(..., description="Savings as a fraction of income")
    essential_expense_ratio: float = Field(..., ge=0, le=1, description="Essential expenses / total expenses")
    discretionary_expense_ratio: float = Field(..., ge=0, le=1, description="Discretionary expenses / total expenses")
    food_ratio: float = Field(..., ge=0, le=1, description="Food spending / total expenses")
    entertainment_ratio: float = Field(..., ge=0, le=1, description="Entertainment spending / total expenses")
    shopping_ratio: float = Field(..., ge=0, le=1, description="Shopping spending / total expenses")
    debt_to_income: float = Field(..., ge=0, le=1, description="Debt-to-income ratio")
    emergency_fund_months: float = Field(..., ge=0, description="Months of expenses in emergency fund")
    investment_ratio: float = Field(..., ge=0, le=1, description="Investment as a fraction of income")
    dependents: int = Field(..., ge=0, description="Number of dependents")
    risk_profile: int = Field(..., ge=0, le=2, description="Risk profile: 0=Conservative, 1=Moderate, 2=Aggressive")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "age": 30,
                    "monthly_income": 5000.0,
                    "total_expenses": 3500.0,
                    "savings_rate": 0.30,
                    "essential_expense_ratio": 0.55,
                    "discretionary_expense_ratio": 0.45,
                    "food_ratio": 0.25,
                    "entertainment_ratio": 0.10,
                    "shopping_ratio": 0.10,
                    "debt_to_income": 0.20,
                    "emergency_fund_months": 3.0,
                    "investment_ratio": 0.15,
                    "dependents": 1,
                    "risk_profile": 1,
                }
            ]
        }
    }


class ForecastInput(ClassificationInput):
    """Input features for the financial-forecast regressor (extends ClassificationInput)."""

    existing_savings: float = Field(..., ge=0, description="Current total savings")
    existing_investments: float = Field(..., ge=0, description="Current total investments")
    expected_return_rate: float = Field(..., ge=0, le=30, description="Expected annual return rate (%)")


# ── Outputs ─────────────────────────────────────────────────────────────────

class ClassificationOutput(BaseModel):
    """Response from the behaviour classifier."""

    model_config = {"protected_namespaces": ()}

    predicted_class: str
    probabilities: dict[str, float]
    top_factors: list[dict]
    model_version: str
    source: str = "ml_service"


class ForecastOutput(BaseModel):
    """Response from the financial-forecast regressor."""

    model_config = {"protected_namespaces": ()}

    predicted_savings_12m: float
    predicted_wealth_5y: float
    confidence_band: dict
    model_version: str
    source: str = "ml_service"


# ── Misc ────────────────────────────────────────────────────────────────────

class ModelMetricsResponse(BaseModel):
    """Metrics saved after a training run."""

    version: str
    trained_at: str
    dataset_size: int
    dataset_type: str = "synthetic"
    classifier: dict
    regressor: dict


class HealthCheckResponse(BaseModel):
    """Health-check payload."""

    status: str
    version: str
    models_loaded: bool
