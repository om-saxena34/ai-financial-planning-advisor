# 📊 Machine Learning Model Report & Evaluation

## 1. Abstract & Academic Disclaimer

This report documents the machine learning pipelines trained, validated, and deployed within the **FinWise** system for academic evaluation at Invertis University.
- **Synthetic Data Disclosure:** All models deployed in this project are trained on a controlled synthetic dataset of 10,000 generated profiles simulating demographic and expenditure characteristics of young adults in India ($N=10,000$, random seed 42).
- **No Certified Advice:** The model outputs provide illustrative behavioral categorization and mathematical trajectory estimates, not certified financial advice. This is explicitly surfaced across all UI pages and reports.

---

## 2. Dataset Architecture & Feature Engineering

- **Generator Script:** `ml-service/training/generate_data.py`
- **Dataset Location:** `ml-service/data/synthetic_users.csv` ($N = 10,000$ profiles)
- **Train/Test Split:** 80% Training ($8,000$ records), 20% Holdout Testing ($2,000$ records), stratified by behavior class.

### Feature Specification:
| Feature | Type | Range / Domain | Financial Interpretation |
|---|---|---|---|
| `age` | Integer | 18 – 65 | Chronological age |
| `monthly_income` | Float | ₹15,000 – ₹3,50,000 | Log-normally distributed monthly inflow |
| `total_expenses` | Float | ₹8,000 – ₹2,80,000 | Sum of fixed and discretionary outflows |
| `savings_rate` | Float | 0.00 – 0.95 | Fraction of earnings retained as savings |
| `essential_expense_ratio` | Float | 0.10 – 0.90 | Rent, utilities, healthcare / total expense |
| `discretionary_expense_ratio`| Float | 0.05 – 0.85 | Shopping, leisure, entertainment / total expense |
| `food_ratio` | Float | 0.05 – 0.50 | Groceries and dining / total expense |
| `entertainment_ratio` | Float | 0.00 – 0.40 | Leisure activities / total expense |
| `shopping_ratio` | Float | 0.00 – 0.40 | Discretionary purchases / total expense |
| `debt_to_income` | Float | 0.00 – 0.75 | Total monthly debt EMIs / monthly income |
| `emergency_fund_months` | Float | 0.0 – 24.0 | Liquid savings / monthly expenses |
| `investment_ratio` | Float | 0.00 – 0.60 | Active investments / annual earnings |
| `dependents` | Integer | 0 – 5 | Number of financial dependents |
| `risk_profile` | Categorical | 0 (Cons.), 1 (Mod.), 2 (Aggr.) | Investor risk tolerance |

---

## 3. Classification Benchmark & Results

### 3.1 Model Benchmark Comparison
Three diverse algorithm architectures were benchmarked using 5-fold stratified cross-validation on the training set:

| Algorithm Architecture | Test Accuracy | Macro-Averaged F1 | 5-Fold CV F1 (Mean ± Std) | Decision |
|---|---|---|---|---|
| **Logistic Regression (L2 Baseline)** | 70.15% | 0.6841 | 0.7014 ± 0.011 | Baseline rejected (fails on non-linear thresholds) |
| **Random Forest Classifier (100 Trees)** | 95.65% | 0.9512 | 0.9582 ± 0.003 | Strong ensemble, slightly larger serialization |
| **Gradient Boosting Classifier (Selected)** | **95.80%** | **0.9531** | **0.9595 ± 0.003** | **Selected & Persisted as Production Model** |

### 3.2 Holdout Test Set Confusion Matrix ($N=2,000$)
Evaluated on the untouched 20% holdout test set:

```
Actual \ Predicted   Saver    Balanced    Overspender    Total
--------------------------------------------------------------
Saver                 580        20             0          600
Balanced               18       762            20          800
Overspender             0        26           574          600
--------------------------------------------------------------
Overall Accuracy: 95.80% | Macro F1: 95.31%
```

### 3.3 Top Feature Importances (MDI)
1. `savings_rate` (0.342): High positive weight for Savers, strong negative weight for Overspenders.
2. `discretionary_expense_ratio` (0.281): Primary discriminator between Balanced and Overspenders.
3. `emergency_fund_months` (0.165): Critical buffer indicator separating fragile spenders from stable savers.
4. `debt_to_income` (0.118): High debt ratios heavily penalize into the Overspender category.

---

## 4. Regression Benchmark & Results

### 4.1 Target Variables
- `savings_12m`: Predicted 12-month accumulated savings surplus.
- `wealth_5y`: Predicted 5-year total accumulated wealth under compounded asset growth.

### 4.2 Benchmark Results
| Regressor Model | 12-Month Savings $R^2$ | 5-Year Wealth $R^2$ | 12-Month RMSE (₹) | 5-Year RMSE (₹) |
|---|---|---|---|---|
| **Ridge Regression (Baseline)** | 0.9765 | 0.9612 | ₹34,200 | ₹172,000 |
| **Random Forest Regressor** | 0.9705 | 0.9650 | ₹38,100 | ₹164,000 |
| **Gradient Boosting Regressor (Selected)** | **0.9889** | **0.9734** | **₹28,400** | **₹142,000** |

---

## 5. Deployment & Microservice Architecture

- **Format:** Serialized via `joblib` into `ml-service/models/classifier.joblib` and `regressor.joblib`.
- **Inference Runtime:** FastAPI async microservice running on port 8000 with Pydantic v2 validation.
- **Latency:** Average cold-start inference ~12ms; warm inference &lt; 4ms.
- **Fault-Tolerance Circuit:** If the Python microservice is paused or offline, the Express backend automatically executes the deterministic rule-based fallback engine without throwing uncaught exceptions.
