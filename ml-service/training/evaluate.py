"""
Master Evaluation & Model Persisting Script
===========================================
Trains both the behavior classification pipeline and the wealth/savings
regression pipeline, benchmarks candidates via cross-validation,
and saves the consolidated evaluation report to models/metrics.json.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from train_classifier import train_and_evaluate_classifier
from train_regressor import train_and_evaluate_regressor

def run_full_pipeline():
  root = Path(__file__).resolve().parent.parent
  data_path = root / 'data' / 'synthetic_users.csv'
  models_dir = root / 'models'

  print("=" * 70)
  print("FINWISE MACHINE LEARNING TRAINING & EVALUATION PIPELINE")
  print("=" * 70)

  # 1. Train Classifier
  print("\n>>> STAGE 1: Training Behavior Classifier...")
  classifier_metrics = train_and_evaluate_classifier(data_path, models_dir)

  # 2. Train Regressor
  print("\n>>> STAGE 2: Training Savings & Wealth Regressor...")
  regressor_metrics = train_and_evaluate_regressor(data_path, models_dir)

  # 3. Consolidate into metrics.json
  metrics_report = {
    'version': '1.0.0',
    'trained_at': datetime.now(timezone.utc).isoformat(),
    'dataset_size': 10000,
    'dataset_type': 'synthetic',
    'classifier': classifier_metrics,
    'regressor': regressor_metrics,
  }

  metrics_path = models_dir / 'metrics.json'
  with open(metrics_path, 'w', encoding='utf-8') as f:
    json.dump(metrics_report, f, indent=2)

  print("\n" + "=" * 70)
  print(f"🎉 Pipeline Complete! Consolidated metrics stored at: {metrics_path}")
  print("=" * 70)

if __name__ == '__main__':
  run_full_pipeline()
