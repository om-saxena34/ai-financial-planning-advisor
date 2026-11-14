# 🏛 FinWise — System Architecture Specification

## 1. Executive Architectural Summary

FinWise is engineered using a **modular three-tier web application architecture combined with an isolated AI microservice**. The design decouples volatile analytical and predictive machine learning models from standard transactional business logic.

```
┌────────────────────────────────────────────────────────┐
│               Client Tier: React (Vite)                │
│  - Tailwind CSS UI Components & Recharts               │
│  - Context-based Auth & Dark/Light Theme Providers     │
│  - Axios Client with Interceptors                      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT in Header)
┌───────────────────────────▼────────────────────────────┐
│            Application Tier: Node.js / Express         │
│  - Security: Helmet, CORS, Rate Limiters, Sanitizers   │
│  - Controllers & Business Logic Services               │
│  - Pure Mathematical Financial Calculators             │
│  - Health Score Calculation Engine                     │
│  - Resilient `mlClient` (Timeout, Retry, Fallback)     │
└──────────────┬───────────────────────────┬─────────────┘
               │ Mongoose ORM              │ HTTP Internal (JSON)
┌──────────────▼─────────────┐ ┌───────────▼─────────────┐
│      Persistence Tier      │ │       AI / ML Tier      │
│      MongoDB Database      │ │     FastAPI Service     │
│  - Users & Profiles        │ │  - Classification Pipe │
│  - Transactions & Goals    │ │  - Regression Forecast  │
│  - Score Snapshots & Logs  │ │  - Scikit-learn Models  │
└────────────────────────────┘ └─────────────────────────┘
```

---

## 2. Tier Breakdown & Responsibilities

### 2.1 Presentation Tier (`client/`)
- **Technology:** React 18, Vite bundler, Tailwind CSS 3.4, React Router v6.
- **State Management:** React Context API for authentication lifecycle and theme state.
- **Data Visualization:** Recharts for modular SVG charting (area, line, donut, bar, gauges).
- **Client Security:** JWT stored securely in memory; refresh triggers via httpOnly cookie; route guarding via `<ProtectedRoute />`.

### 2.2 Application Tier (`server/`)
- **Technology:** Node.js (v20), Express.js framework, Mongoose ODM.
- **Architectural Pattern:** Layered Architecture (`routes` → `controllers` → `services` → `models`).
- **Resilience Strategy:** `mlClient.service.js` isolates external ML calls. If the Python FastAPI service is unreachable or times out (>5000ms), the Node service automatically executes a deterministic rule-based fallback, preventing service disruption.

### 2.3 Machine Learning Tier (`ml-service/`)
- **Technology:** Python 3.10+, FastAPI, Pandas, NumPy, Scikit-learn, Joblib.
- **Pattern:** Stateless prediction microservice. Exposes strict Pydantic contract validation endpoints (`/predict/classify`, `/predict/forecast`, `/model/metrics`).

### 2.4 Persistence Tier (`mongo`)
- **Technology:** MongoDB 7.0 document store.
- **Indexing Strategy:** Compound indexes on `(userId, date)` and `(userId, category)` optimize high-volume queries for transactions and historical health score trendlines.

---

## 3. Key Data Flows

### 3.1 User Behavior Classification Flow
1. User logs in; frontend requests behavior insights via `POST /api/v1/predictions/classify`.
2. Node backend aggregates recent 90-day transaction ratios (essential vs. discretionary, savings rate, debt payments).
3. Backend invokes internal ML microservice `POST http://ml-service:8000/predict/classify`.
4. ML microservice executes the trained Scikit-learn pipeline, returning class probabilities and top 5 feature weights.
5. If ML microservice fails, backend triggers rule-based heuristic classification and tags response with `"source": "fallback"`.
6. Node stores an audit record in `PredictionLog` and returns the prediction to the client.

---

## 4. Security Architecture

1. **Authentication:** Dual-token JWT architecture (Short-lived 15m access token + 7d rotating refresh token).
2. **Defensive Headers:** Helmet secures HTTP response headers (HSTS, CSP, XSS protection).
3. **NoSQL Injection Defense:** Sanitization middleware removes `$` and `.` operators from request bodies.
4. **Rate Limiting:** Granular throttling on authentication endpoints (10 req/15min) and general endpoints (100 req/15min).
