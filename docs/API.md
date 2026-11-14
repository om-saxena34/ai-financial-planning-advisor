# 📡 FinWise REST API Specification

Base URL: `/api/v1`  
All protected endpoints require `Authorization: Bearer <accessToken>` header unless specified otherwise.

---

## 1. Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account | No |
| `POST` | `/auth/login` | Authenticate user, return JWT and set refresh cookie | No |
| `POST` | `/auth/refresh` | Exchange httpOnly refresh cookie for fresh access token | Cookie |
| `POST` | `/auth/logout` | Revoke refresh token and clear cookie | Yes |
| `GET` | `/auth/me` | Fetch currently authenticated user profile | Yes |

---

## 2. Financial Profile (`/profile`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/profile` | Retrieve user financial metrics and profile | Yes |
| `PUT` | `/profile` | Update income, expenses, and risk profile | Yes |

---

## 3. Transactions & Expenses (`/transactions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/transactions` | List paginated transactions with date/category filters | Yes |
| `POST` | `/transactions` | Record new income or expense transaction | Yes |
| `PUT` | `/transactions/:id` | Update existing transaction | Yes |
| `DELETE`| `/transactions/:id` | Remove transaction | Yes |
| `GET` | `/transactions/summary`| Get monthly categorized totals and breakdown | Yes |
| `POST` | `/transactions/import` | Upload and parse CSV bank statement | Yes |
| `GET` | `/transactions/export` | Download transactions as CSV | Yes |

---

## 4. Financial Calculators (`/calculators`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/calculators/sip` | Calculate SIP future value and invested sum | Yes |
| `POST` | `/calculators/compound` | Compute lump sum compound interest | Yes |
| `POST` | `/calculators/required-sip` | Compute required monthly SIP for target goal | Yes |
| `POST` | `/calculators/step-up-sip` | Calculate growth with annual step-up % | Yes |

---

## 5. Health Score (`/health-score`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health-score` | Get current 0–100 score and component sub-scores | Yes |
| `GET` | `/health-score/history` | Historical score snapshots for trendline chart | Yes |
| `POST` | `/health-score/calculate`| Recompute score and store historical snapshot | Yes |

---

## 6. Machine Learning Predictions (`/predictions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/predictions/classify` | Get behavior classification (Saver/Balanced/Overspender) | Yes |
| `POST` | `/predictions/forecast` | Get 12m savings and 5y wealth projection | Yes |
| `GET` | `/predictions/history` | Retrieve logged predictions and fallback audit trail | Yes |

---

## 7. Python ML Microservice Endpoints (Internal Port 8000)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Microservice health check and loaded model status |
| `POST` | `/predict/classify` | Infer user behavioral classification and top factors |
| `POST` | `/predict/forecast` | Infer regression forecast for savings and wealth |
| `GET` | `/model/metrics` | Retrieve model training evaluation metrics and matrices |
