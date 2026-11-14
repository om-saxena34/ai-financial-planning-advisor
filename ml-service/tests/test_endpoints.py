"""
Endpoint tests for the FinWise ML Service.
Uses httpx AsyncClient with ASGITransport for in-process testing.
"""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.anyio
async def test_health_endpoint():
  transport = ASGITransport(app=app)
  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["models_loaded"] is True


@pytest.mark.anyio
async def test_root():
  transport = ASGITransport(app=app)
  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.get("/")
    assert response.status_code == 200


@pytest.mark.anyio
async def test_classify_validation_error():
  transport = ASGITransport(app=app)
  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.post("/predict/classify", json={"age": -1})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_forecast_validation_error():
  transport = ASGITransport(app=app)
  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.post("/predict/forecast", json={})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_live_classification_inference():
  transport = ASGITransport(app=app)
  payload = {
    "age": 28,
    "dependents": 0,
    "risk_profile": 1,
    "monthly_income": 65000.0,
    "total_expenses": 30000.0,
    "savings_rate": 0.5385,
    "essential_expense_ratio": 0.55,
    "discretionary_expense_ratio": 0.45,
    "food_ratio": 0.22,
    "entertainment_ratio": 0.08,
    "shopping_ratio": 0.07,
    "debt_to_income": 0.05,
    "emergency_fund_months": 5.0,
    "investment_ratio": 0.20,
  }

  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.post("/predict/classify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_class"] in ["Saver", "Balanced", "Overspender"]
    assert "probabilities" in data
    assert len(data["top_factors"]) > 0
    assert data["source"] == "ml_service"


@pytest.mark.anyio
async def test_live_forecast_inference():
  transport = ASGITransport(app=app)
  payload = {
    "age": 28,
    "dependents": 0,
    "risk_profile": 1,
    "monthly_income": 65000.0,
    "total_expenses": 30000.0,
    "savings_rate": 0.5385,
    "essential_expense_ratio": 0.55,
    "discretionary_expense_ratio": 0.45,
    "food_ratio": 0.22,
    "entertainment_ratio": 0.08,
    "shopping_ratio": 0.07,
    "debt_to_income": 0.05,
    "emergency_fund_months": 5.0,
    "investment_ratio": 0.20,
    "existing_savings": 100000.0,
    "existing_investments": 50000.0,
    "expected_return_rate": 12.0,
  }

  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.post("/predict/forecast", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_savings_12m"] > 0
    assert data["predicted_wealth_5y"] > 0
    assert "confidence_band" in data
    assert data["source"] == "ml_service"


@pytest.mark.anyio
async def test_metrics_endpoint():
  transport = ASGITransport(app=app)
  async with AsyncClient(transport=transport, base_url="http://test") as client:
    response = await client.get("/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.0.0"
    assert data["dataset_type"] == "synthetic"
    assert "classifier" in data
    assert "regressor" in data
    assert data["classifier"]["accuracy"] > 0.85
    assert data["regressor"]["overall_r2"] > 0.85
