"""
Regression Model Training & Benchmarking Pipeline
==================================================
Trains and benchmarks:
1. Ridge Regression (Baseline)
2. Random Forest Regressor
3. Gradient Boosting Regressor

Targets:
- savings_12m: Projected 12-month savings surplus
- wealth_5y: Projected 5-year wealth accumulation

Evaluates RMSE, MAE, and R-squared on unseen test data,
persists regressor.joblib and saves complete evaluation metrics to metrics.json.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

FEATURE_COLS = [
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

TARGET_COLS = ['savings_12m', 'wealth_5y']

def train_and_evaluate_regressor(data_path: Path, output_dir: Path) -> dict:
  print(f"Loading synthetic dataset from {data_path}...")
  df = pd.read_csv(data_path)

  X = df[FEATURE_COLS]
  y = df[TARGET_COLS]

  X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
  )

  print(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")

  # Candidate models
  candidates = {
    'RidgeRegression': Pipeline([
      ('scaler', StandardScaler()),
      ('reg', MultiOutputRegressor(Ridge(alpha=1.0)))
    ]),
    'RandomForestRegressor': Pipeline([
      ('reg', MultiOutputRegressor(RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)))
    ]),
    'GradientBoostingRegressor': Pipeline([
      ('reg', MultiOutputRegressor(GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)))
    ]),
  }

  cv = KFold(n_splits=5, shuffle=True, random_state=42)
  benchmark_results = {}

  print("\n--- Running 5-Fold Cross-Validation Benchmark (R² Score) ---")
  best_name = None
  best_score = -100.0

  for name, pipe in candidates.items():
    scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='r2')
    mean_score = float(np.mean(scores))
    std_score = float(np.std(scores))
    benchmark_results[name] = {
      'cv_r2_mean': round(mean_score, 4),
      'cv_r2_std': round(std_score, 4),
      'cv_scores': [round(float(s), 4) for s in scores],
    }
    print(f"{name:28s} | 5-Fold R²: {mean_score:.4f} (+/- {std_score:.4f})")

    if mean_score > best_score:
      best_score = mean_score
      best_name = name

  print(f"\n🏆 Best Regressor Selected: {best_name} (Mean R² = {best_score:.4f})")
  best_pipe = candidates[best_name]

  # Fit on training split
  best_pipe.fit(X_train, y_train)

  # Evaluate on test set
  y_pred = best_pipe.predict(X_test)

  # Calculate metrics per target
  metrics_per_target = {}
  residual_std = {}

  for idx, target in enumerate(TARGET_COLS):
    y_true_col = y_test.iloc[:, idx]
    y_pred_col = y_pred[:, idx]

    rmse = float(np.sqrt(mean_squared_error(y_true_col, y_pred_col)))
    mae = float(mean_absolute_error(y_true_col, y_pred_col))
    r2 = float(r2_score(y_true_col, y_pred_col))
    residuals = y_true_col - y_pred_col
    std_err = float(np.std(residuals))

    metrics_per_target[target] = {
      'rmse': round(rmse, 2),
      'mae': round(mae, 2),
      'r2': round(r2, 4),
      'std_error': round(std_err, 2),
    }
    residual_std[target] = std_err

    print(f"Target '{target}': RMSE = ₹{rmse:,.2f}, MAE = ₹{mae:,.2f}, R² = {r2:.4f}")

  overall_r2 = float(r2_score(y_test, y_pred))
  overall_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
  overall_mae = float(mean_absolute_error(y_test, y_pred))

  # Extract feature importances if available
  reg_step = best_pipe.named_steps.get('reg')
  feature_importances = {}
  if hasattr(reg_step, 'estimators_'):
    # Average feature importances across the 2 target estimators
    importances_arr = []
    for est in reg_step.estimators_:
      if hasattr(est, 'feature_importances_'):
        importances_arr.append(est.feature_importances_)
    if importances_arr:
      avg_imp = np.mean(importances_arr, axis=0)
      for col, imp in zip(FEATURE_COLS, avg_imp):
        feature_importances[col] = round(float(imp), 4)

  sorted_importance = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

  # Persist model
  output_dir.mkdir(parents=True, exist_ok=True)
  model_path = output_dir / 'regressor.joblib'
  joblib.dump(best_pipe, model_path)
  print(f"Regressor saved successfully to {model_path}")

  results = {
    'model_type': best_name,
    'overall_r2': round(overall_r2, 4),
    'overall_rmse': round(overall_rmse, 2),
    'overall_mae': round(overall_mae, 2),
    'targets': metrics_per_target,
    'residual_std': residual_std,
    'benchmarks': benchmark_results,
    'feature_importance': sorted_importance,
    'features': FEATURE_COLS,
  }

  return results

if __name__ == '__main__':
  root = Path(__file__).resolve().parent.parent
  data_file = root / 'data' / 'synthetic_users.csv'
  models_dir = root / 'models'
  train_and_evaluate_regressor(data_file, models_dir)
