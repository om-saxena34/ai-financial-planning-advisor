"""
Synthetic Financial Dataset Generator
=====================================
Generates N = 10,000 synthetic Indian user financial profiles with deterministic
random seed 42. Injects controlled stochastic noise to represent real-world
behavioral variations.
"""

import numpy as np
import pandas as pd
from pathlib import Path

def generate_synthetic_data(n_samples: int = 10000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    # 1. Demographics
    # Age: skewed towards young professionals (20–35)
    age = np.clip(np.random.gamma(shape=9, scale=3, size=n_samples).astype(int), 18, 65)

    # Dependents: 0 to 4
    dependents_prob = [0.45, 0.25, 0.20, 0.08, 0.02]
    dependents = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=dependents_prob)

    # Risk Profile: 0=Conservative, 1=Moderate, 2=Aggressive
    risk_profile = np.random.choice([0, 1, 2], size=n_samples, p=[0.25, 0.55, 0.20])

    # 2. Monthly Income (in INR ₹)
    # Log-normal distribution centered around ₹45,000, bounds ₹12,000 to ₹3,00,000
    income_log = np.random.normal(loc=10.7, scale=0.6, size=n_samples)
    monthly_income = np.clip(np.exp(income_log), 12000, 300000).round(-2)

    # 3. Expenditure & Savings Patterns
    # Base expense ratio: varies by income and financial discipline
    expense_ratio_base = np.random.beta(a=5, b=3, size=n_samples) # around 0.62 average
    # Adjust for dependents
    expense_ratio = np.clip(expense_ratio_base + (dependents * 0.04), 0.35, 1.15)
    total_expenses = (monthly_income * expense_ratio).round(-2)

    # Savings rate: (Income - Expenses) / Income
    savings_rate = (monthly_income - total_expenses) / monthly_income

    # 4. Expense Breakdown Ratios
    # Essential vs Discretionary
    essential_ratio = np.clip(np.random.normal(loc=0.62, scale=0.10, size=n_samples), 0.35, 0.88)
    discretionary_ratio = 1.0 - essential_ratio

    # Sub-category ratios (as fraction of total expenses)
    food_ratio = np.clip(np.random.normal(loc=0.25, scale=0.06, size=n_samples), 0.10, 0.45)
    entertainment_ratio = np.clip(np.random.normal(loc=0.10, scale=0.05, size=n_samples), 0.02, 0.30)
    shopping_ratio = np.clip(np.random.normal(loc=0.08, scale=0.04, size=n_samples), 0.01, 0.25)

    # 5. Debt, Emergency Cushion, and Investments
    # Debt-to-income (EMIs / Income)
    debt_to_income = np.clip(np.random.exponential(scale=0.18, size=n_samples), 0.0, 0.70)

    # Emergency fund months
    emergency_months_base = np.random.exponential(scale=3.5, size=n_samples)
    emergency_fund_months = np.clip(emergency_months_base, 0.0, 18.0)

    # Investment ratio (Investments / Income)
    invest_ratio_base = np.random.beta(a=2, b=8, size=n_samples) # around 0.15 average
    investment_ratio = np.clip(invest_ratio_base, 0.0, 0.40)

    # Existing Assets (for regression forecasting)
    essential_monthly = total_expenses * essential_ratio
    existing_savings = (emergency_fund_months * essential_monthly).round(-2)
    existing_investments = (monthly_income * investment_ratio * np.random.uniform(6, 48, size=n_samples)).round(-2)

    # 6. Behavioral Classification Label (Saver vs Balanced vs Overspender)
    # Ground truth rules with stochastic noise
    behavior_class = []
    for s_rate, dti, disc, inv in zip(savings_rate, debt_to_income, discretionary_ratio, investment_ratio):
      # Score heuristic
      if s_rate >= 0.28 and inv >= 0.08 and dti <= 0.25:
        b_class = 'Saver'
      elif s_rate < 0.10 or dti >= 0.42 or (disc >= 0.45 and s_rate < 0.15):
        b_class = 'Overspender'
      else:
        b_class = 'Balanced'

      # Add 5% stochastic noise (simulate edge-case exceptions / human messiness)
      if np.random.rand() < 0.05:
        b_class = np.random.choice(['Saver', 'Balanced', 'Overspender'])

      behavior_class.append(b_class)

    # 7. Regression Target Variables
    # 12-month projected savings
    monthly_net = monthly_income - total_expenses
    noise_12m = np.random.normal(loc=1.0, scale=0.06, size=n_samples)
    savings_12m = np.maximum(0, monthly_net * 12 * noise_12m).round(-2)

    # 5-year wealth accumulation (savings + compounding investments)
    annual_return_assumptions = np.where(risk_profile == 0, 0.07, np.where(risk_profile == 1, 0.11, 0.15))
    compound_factor = np.power(1 + annual_return_assumptions, 5)
    sip_future_value_5y = (monthly_income * investment_ratio * 12) * ((compound_factor - 1) / annual_return_assumptions)
    noise_5y = np.random.normal(loc=1.0, scale=0.08, size=n_samples)

    wealth_5y = np.maximum(
      0,
      (existing_investments * compound_factor + existing_savings + (monthly_net * 60) + sip_future_value_5y) * noise_5y
    ).round(-2)

    df = pd.DataFrame({
      'age': age,
      'dependents': dependents,
      'risk_profile': risk_profile,
      'monthly_income': monthly_income,
      'total_expenses': total_expenses,
      'savings_rate': savings_rate.round(4),
      'essential_expense_ratio': essential_ratio.round(4),
      'discretionary_expense_ratio': discretionary_ratio.round(4),
      'food_ratio': food_ratio.round(4),
      'entertainment_ratio': entertainment_ratio.round(4),
      'shopping_ratio': shopping_ratio.round(4),
      'debt_to_income': debt_to_income.round(4),
      'emergency_fund_months': emergency_fund_months.round(2),
      'investment_ratio': investment_ratio.round(4),
      'existing_savings': existing_savings,
      'existing_investments': existing_investments,
      'behavior_class': behavior_class,
      'savings_12m': savings_12m,
      'wealth_5y': wealth_5y,
    })

    return df

if __name__ == '__main__':
    data_dir = Path(__file__).resolve().parent.parent / 'data'
    data_dir.mkdir(parents=True, exist_ok=True)
    out_csv = data_dir / 'synthetic_users.csv'

    print(f"Generating 10,000 synthetic user financial profiles (seed 42)...")
    df = generate_synthetic_data(10000, 42)
    df.to_csv(out_csv, index=False)
    print(f"Dataset successfully created at: {out_csv}")
    print(f"Shape: {df.shape}")
    print("Class distribution:")
    print(df['behavior_class'].value_counts(normalize=True))
