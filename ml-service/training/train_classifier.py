"""
Classification Model Training & Benchmarking Pipeline
======================================================
Trains and benchmarks:
1. Logistic Regression (Baseline)
2. Random Forest Classifier
3. Gradient Boosting Classifier

Evaluates models using Stratified 5-Fold Cross-Validation,
selects the top performer, fits on train set, evaluates on test set,
extracts feature importances, and persists classifier.joblib.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

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
]

TARGET_COL = 'behavior_class'

def train_and_evaluate_classifier(data_path: Path, output_dir: Path) -> dict:
  print(f"Loading synthetic dataset from {data_path}...")
  df = pd.read_csv(data_path)

  X = df[FEATURE_COLS]
  y = df[TARGET_COL]

  # 80/20 train/test split with stratification
  X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
  )

  print(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")

  # Define candidate model pipelines
  candidates = {
    'LogisticRegression': Pipeline([
      ('scaler', StandardScaler()),
      ('clf', LogisticRegression(max_iter=1000, random_state=42))
    ]),
    'RandomForestClassifier': Pipeline([
      ('clf', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
    ]),
    'GradientBoostingClassifier': Pipeline([
      ('clf', GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42))
    ]),
  }

  cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
  benchmark_results = {}

  print("\n--- Running 5-Fold Stratified Cross-Validation Benchmark ---")
  best_name = None
  best_score = -1.0

  for name, pipe in candidates.items():
    scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='f1_macro')
    mean_score = float(np.mean(scores))
    std_score = float(np.std(scores))
    benchmark_results[name] = {
      'cv_f1_macro_mean': round(mean_score, 4),
      'cv_f1_macro_std': round(std_score, 4),
      'cv_scores': [round(float(s), 4) for s in scores],
    }
    print(f"{name:28s} | 5-Fold Macro-F1: {mean_score:.4f} (+/- {std_score:.4f})")

    if mean_score > best_score:
      best_score = mean_score
      best_name = name

  print(f"\n🏆 Best Model Selected: {best_name} (Macro-F1 = {best_score:.4f})")
  best_pipe = candidates[best_name]

  # Fit best model on full training split
  best_pipe.fit(X_train, y_train)

  # Evaluate on unseen test set
  y_pred = best_pipe.predict(X_test)
  test_acc = float(accuracy_score(y_test, y_pred))
  test_macro_f1 = float(f1_score(y_test, y_pred, average='macro'))
  report = classification_report(y_test, y_pred, output_dict=True)
  labels = sorted(list(y.unique()))
  conf_matrix = confusion_matrix(y_test, y_pred, labels=labels).tolist()

  print(f"Test Set Accuracy: {test_acc:.4f}")
  print(f"Test Set Macro-F1: {test_macro_f1:.4f}")

  # Feature importance extraction
  clf_step = best_pipe.named_steps.get('clf')
  feature_importances = {}
  if hasattr(clf_step, 'feature_importances_'):
    for col, imp in zip(FEATURE_COLS, clf_step.feature_importances_):
      feature_importances[col] = round(float(imp), 4)
  elif hasattr(clf_step, 'coef_'):
    # For linear models, average absolute coefficient across classes
    avg_coef = np.mean(np.abs(clf_step.coef_), axis=0)
    for col, imp in zip(FEATURE_COLS, avg_coef):
      feature_importances[col] = round(float(imp), 4)

  # Sort feature importances descending
  sorted_importance = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

  # Persist model
  output_dir.mkdir(parents=True, exist_ok=True)
  model_path = output_dir / 'classifier.joblib'
  joblib.dump(best_pipe, model_path)
  print(f"Classifier saved successfully to {model_path}")

  results = {
    'model_type': best_name,
    'accuracy': round(test_acc, 4),
    'macro_f1': round(test_macro_f1, 4),
    'per_class': {
      cls: {
        'precision': round(report[cls]['precision'], 4),
        'recall': round(report[cls]['recall'], 4),
        'f1': round(report[cls]['f1-score'], 4),
        'support': report[cls]['support'],
      }
      for cls in labels
    },
    'confusion_matrix': {
      'labels': labels,
      'matrix': conf_matrix,
    },
    'benchmarks': benchmark_results,
    'feature_importance': sorted_importance,
    'features': FEATURE_COLS,
  }

  return results

if __name__ == '__main__':
  root = Path(__file__).resolve().parent.parent
  data_file = root / 'data' / 'synthetic_users.csv'
  models_dir = root / 'models'
  train_and_evaluate_classifier(data_file, models_dir)
