# 🎓 Final Year Project Viva Voce Preparation Guide & Demo Script
**Project:** FinWise — AI-Powered Personal Financial Planning Advisor  
**Institution:** Invertis University, Bareilly  
**Degree:** B.Tech in Computer Science & Engineering  
**Presenter & Team Leader:** Om Sharma  

---

## 1. Quick Startup & Demo Setup Guide

To run the entire system during your evaluation, open three terminal windows:

### Terminal 1: Backend Express Server
```powershell
cd server
npm start
# Server runs on: http://localhost:5000
# Tests: npm test
# Seed Demo Database: npm run seed
```

### Terminal 2: Python FastAPI ML Microservice
```powershell
cd ml-service
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# ML Service runs on: http://localhost:8000
# Auto-docs (Swagger UI): http://localhost:8000/docs
# Tests: .\.venv\Scripts\pytest -v
```

### Terminal 3: React Vite Client
```powershell
cd client
npm run dev
# Frontend runs on: http://localhost:5173
# Unit Tests: npm test
# Production Build: npm run build
```

---

## 2. Seeded Demo Accounts (Ready for Live Demo)

The database seed script (`npm run seed` in `server`) automatically populates three realistic personas:

| Persona | Email | Password | Monthly Income | Health Score | ML Classification | Key Demo Purpose |
|---|---|---|---|---|---|---|
| **Saver** | `saver.demo@finwise.com` | `Password@123` | ₹1,20,000 | **89 / 100** (Excellent) | **Saver** (94% conf.) | Disciplined budgeting, completed emergency fund, thriving SIP goals |
| **Balanced** | `balanced.demo@finwise.com` | `Password@123` | ₹75,000 | **74 / 100** (Good) | **Balanced** (82% conf.) | Normal young professional, healthy outgo, active vacation goal |
| **Overspender** | `overspender.demo@finwise.com` | `Password@123` | ₹50,000 | **36 / 100** (Poor) | **Overspender** (88% conf.) | High dining & shopping burn, low liquidity, lagging bike goal |

---

## 3. Recommended 5-Minute Live Viva Demo Script

### Minute 0:00 – 1:00: Problem & Architecture Introduction
- *"Respected professors, our project is FinWise — an AI-powered personal financial planning advisor."*
- *"Students and young professionals often enter the workforce without financial literacy. They track expenses manually on spreadsheets without predictive intelligence or goal-driven math."*
- *"FinWise implements a modern 3-tier microservice architecture: React 18 with Tailwind & Recharts on the frontend, Node.js and Express handling business rules and MongoDB persistence, and an independent Python FastAPI microservice executing Gradient Boosting models for behavioral classification and multi-year wealth regression."*

### Minute 1:00 – 2:30: Persona Comparison (The Core AI Demonstration)
- Click **"Sign In"**, use the quick demo button: **"Saver Demo"**.
- Point out:
  1. **Financial Health Score Gauge:** 89/100 (Excellent) computed across 6 mathematical pillars.
  2. **AI Behavioral Badge:** Identifies Aarav as a **Saver** based on low discretionary burn and high savings rate.
  3. **Wealth Forecast:** Regressor predicts 12-month savings and 5-year compounding with confidence bands.
- Log out and click **"Overspender Demo"** (Rohan Verma).
- Show the stark contrast:
  1. Health Score plunges to **36/100 (Poor)** with a red warning gauge.
  2. AI Behavior switches to **Overspender**.
  3. The AI Recommendation Engine triggers **Priority High Directives** (e.g. 50/30/20 budget reset, food dining cut, emergency fund alert).

### Minute 2:30 – 3:15: Interactive What-If Scenario Simulator
- Click **"What-If"** in the top navigation.
- Explain: *"A key innovation in our system is counterfactual simulation."*
- Drag the **"Trim Discretionary Expenses"** slider to 25% and **"Boost Monthly SIP"** by ₹6,000.
- Point out the real-time reactivity:
  - Health Score jumps from 36 to **68 (+32 points)**.
  - Persona shifts from **Overspender → Balanced**.
  - 5-year wealth generation gains **+₹8.4 Lakhs** of compound returns on the interactive chart.

### Minute 3:15 – 4:00: Interactive AI Chatbot ("Fin") Live Demonstration
- Click the floating **"Ask Fin"** button in the bottom right corner (or navigate to `/chat`).
- Show the examiner conversational financial advisory in action:
  1. **Live SIP Math Query:** Type: `"If I save 5000 for 10 years at 12%?"`
     - Point out the live entity extraction (`5000`, `10 years`, `12%`), annuity due compounding calculation, and interactive SIP breakdown card showing +₹5.61 Lakhs of growth.
  2. **Affordability Check:** Type: `"Can I buy an iPhone for 65k?"`
     - Point out how Fin calculates the user's free monthly cash surplus and advises months to save to prevent high-interest EMI traps.
  3. **Hinglish Understanding:** Type: `"Emergency fund kya hota hai?"`
     - Demonstrates natural conversational matching across 85 peer-reviewed personal finance topics.

### Minute 4:00 – 5:00: Machine Learning Rigor & Model Transparency
- Click **"Model Metrics (Viva)"** (`/model-metrics`).
- Explain the scientific validation:
  - 10,000-record synthetic research dataset generated with realistic log-normal Indian salary distributions.
  - Benchmark comparison: **Gradient Boosting Classifier (95.80% Accuracy, 0.953 Macro F1)** vs Random Forest (95.65%) vs Logistic Regression (70.15%).
  - 5-fold stratified cross-validation ensuring variance &lt; 0.005.
  - Multi-output regressor achieving **0.988 R²** on 12-month savings and **0.973 R²** on 5-year wealth.
  - Conclude with the academic transparency disclaimer in the UI.

---

## 4. Anticipated Technical Viva Questions & Winning Answers

### Question 1: Why did you decouple the ML model into a separate FastAPI microservice instead of running it inside Node.js?
**Winning Answer:**
> *"Decoupling ML into a dedicated microservice adheres to the Single Responsibility Principle and separation of concerns. Machine learning workloads in Python benefit from native, optimized C-extensions (NumPy, Scikit-learn, Pandas) which Node.js lacks. Furthermore, retraining or replacing ML models can occur independently without restarting or risking downtime for the Express business logic API."*

---

### Question 2: What happens if your ML microservice crashes or experiences network latency during a live demo?
**Winning Answer:**
> *"We engineered a fault-tolerant circuit pattern in `mlClient.service.js`. Every call to the ML microservice enforces a strict 5000ms timeout with automatic retry. If the microservice is unreachable or times out, the backend seamlessly activates a deterministic rule-based heuristic that classifies the user and estimates projections, tagging the response with `"source": "fallback_rule_engine"`. The application never crashes due to downstream ML service downtime."*

---

### Question 3: Why did you use synthetic data instead of scraping or using real bank data?
**Winning Answer:**
> *"Real personal banking and credit data is strictly protected under privacy regulations (RBI guidelines, GDPR/DPDP). Gathering genuine financial transaction records from thousands of individuals without licensed Account Aggregator APIs is illegal and unethical. Therefore, we engineered a realistic synthetic data generator ($N=10,000$, seed 42) based on Indian demographic benchmarks and expenditure distributions, explicitly adding stochastic Gaussian noise to avoid trivial lookup artifacts. We openly disclose this in our UI and documentation."*

---

### Question 4: Why Gradient Boosting over Deep Learning or Neural Networks?
**Winning Answer:**
> *"For structured tabular datasets of this dimensionality (~14 features, 10k rows), Tree-based Ensemble methods like Gradient Boosting and Random Forests consistently match or outperform Deep Neural Networks while requiring substantially fewer hyperparameter tuning cycles and lower inference latency. More importantly, tree ensembles provide direct, explainable feature importances (MDI and permutation importance), ensuring our recommendations are transparent and interpretable."*

---

### Question 5: What is the exact mathematical formula used for SIP calculation?
**Winning Answer:**
> *"The Future Value (FV) of an annuity due (SIP invested at the beginning of each period) is calculated as:*
> 
> $$FV = P \times \left[\frac{(1+i)^n - 1}{i}\right] \times (1+i)$$
> 
> *Where $P$ is the monthly installment, $i$ is the periodic monthly interest rate ($\text{Annual Rate} / 12 / 100$), and $n$ is total compounding periods in months. We also implement an exact inverse formula to solve for $P$ when a user defines a target goal amount."*

---

### Question 6: How is the Financial Health Score (0–100) calculated?
**Winning Answer:**
> *"The Health Score is a composite index computed as a weighted sum across 6 essential financial pillars:*
> 1. *Savings Rate (25% weight)*
> 2. *Expense Control / Discretionary Balance (20% weight)*
> 3. *Emergency Fund Coverage (20% weight)*
> 4. *Debt-to-Income Ratio (15% weight)*
> 5. *Investment Consistency (10% weight)*
> 6. *Goal Progress (10% weight)*
> *We apply linear interpolation between designated risk thresholds to avoid artificial cliffs in scoring."*

---

### Question 7: How are recommendations generated and prioritized?
**Winning Answer:**
> *"FinWise employs a hybrid expert-system approach: 10 deterministic financial heuristics (e.g. emergency cushion shortfall, debt-to-income &gt;35%, discretionary outgo &gt;35%, goal shortfall) evaluate the user's latest transaction and profile telemetry. The urgency and ordering of these recommendations is dynamically prioritized using the ML behavioral classification: for an Overspender, aggressive budget corrections and 50/30/20 resets take top precedence; for a Saver, tax optimization, index fund deployment, and goal acceleration lead."*

---

### Question 8: How did you secure authentication and API routes?
**Winning Answer:**
> *"We implemented standard defense-in-depth security: passwords are salted and hashed using `bcrypt` (10 rounds). Authentication uses stateless JWT access tokens (15-minute lifespan) paired with HTTP-only refresh tokens. Sensitive endpoints enforce CORS restrictions, Helmet HTTP security headers, mongo-sanitize to prevent NoSQL injection, and express-rate-limit to protect against brute-force attacks."*

---

### Question 9: How does the conversational assistant "Fin" work? Why not use an external LLM like OpenAI?
**Winning Answer:**
> *"Fin is designed as an explainable, deterministic financial assistant rather than a probabilistic generative LLM. In fintech, generative models suffer from mathematical hallucinations, regulatory non-compliance, latency, and expensive API token limits. Fin operates an intent router coupled with an entity extractor: it dynamically evaluates mathematical formulas for SIP and compounding (annuity due), queries real-time user database telemetry for health scores and expenses, and references a curated 85-question peer-reviewed knowledge base across 9 financial domains. It runs 100% offline with zero latency and zero runtime cost."*

---

### Question 10: How does Fin parse Indian monetary expressions like "50k", "1.5 lakh", or "1 cr"?
**Winning Answer:**
> *"We implemented a specialized natural language entity extractor in `entityExtractor.js`. It utilizes tokenized regex pattern matching to normalize Indian numerical standards: interpreting 'k' as $\times 1,000$, 'lakh/lac/L' as $\times 100,000$, and 'cr/crore' as $\times 10,000,000$, alongside durations in months/years and percentage return rates. It feeds these normalized primitives directly into our verified financial math functions."*

---

### Question 11: What extra usability enhancements did you build into the frontend?
**Winning Answer:**
> *"Beyond the core requirements, we introduced: (1) An omnipresent Quick Command Palette accessed via `Ctrl+K` or `⌘K` for keyboard navigation across all financial tools, (2) Inline SVG corner decorations and gentle floating matter animations (`FloatingElements.jsx`) to create a calm, human-made aesthetic, (3) Interactive rich response cards inside the chat that allow instant 1-click goal setting and calculator deep-dives, and (4) Plain Class 7-8 English vocabulary with inline tooltips explaining financial terms."*

---

### Question 12: How does Student Mode accommodate irregular income and student life?
**Winning Answer:**
> *"Most personal finance software naively assumes a stable monthly salary. Students, however, earn intermittently via internships, pocket money, or scholarships. FinWise solves this by computing effective planning income as the statistical median of the last 3–6 months rather than the mean, making it robust against outlier months. Furthermore, we adapt our financial health rules specifically for students: the emergency fund threshold is reduced from 6 months of essential outgo to 3 months, an integrated Semester Fee Planner calculates exact monthly buffers needed before tuition deadlines, and a First-Salary Planner provides an actionable 50/30/20 roadmap tailored to Indian rent and living tiers."*

---

### Question 13: How does the What-If Simulator prevent formula duplication between the frontend and backend?
**Winning Answer:**
> *"To avoid code drift and discrepancy between instant UI sliders and backend evaluations, all deterministic financial formulas (Health Score, SIP future value, compound interest, semester fee amortization) reside in a single shared calculation package (`shared/financialCalc.js`). The React client imports these pure functions for zero-latency, 60fps slider updates with animated counters, while the Express backend utilizes the identical package for persisted scenario evaluations. Users can save up to 3 discrete scenarios and compare their 5-year wealth trajectory side-by-side in real-time Recharts visualizations."*

---

### Question 14: How does the "Why?" Explainer make AI decisions interpretable without heavy libraries like SHAP?
**Winning Answer:**
> *"Rather than treating ML predictions as a black box, FinWise implements an efficient, zero-dependency explainability engine based on manual feature permutation. In our Python microservice (`/explain/class`), we evaluate the baseline behavioral prediction, systematically substitute key features (savings rate, debt-to-income, emergency months) with population medians, and measure the probability delta to identify the top 3 driving factors. For the Health Score (`/explain/score`), we decompose composite points across the 6 pillars, identify the user's weakest component, and generate a concrete, actionable recommendation (e.g. '+4 points if you save ₹800 more this month')."*

---

### Question 15: How does Bank Statement Upload work and how is user privacy guaranteed?
**Winning Answer:**
> *"FinWise processes bank statement CSVs entirely in temporary memory using `multer` with memory storage—raw statement files, account numbers, and transaction IDs are never saved to disk or persistent storage. For categorization, merchant descriptions are vectorized using character n-grams (2–5 ngrams) and classified via a trained `LinearSVC` pipeline saved in `categorizer.joblib`. If a user manually reclassifies a merchant, a custom per-user keyword mapping (`CategoryRule`) is updated, allowing Fin to learn user preferences over time. Unusual transactions are flagged using Median Absolute Deviation (MAD), an outlier detection metric far more resilient to skewed financial data than standard deviation."*

---

### Question 16: What is Study Mode and how does it prove the system's effectiveness?
**Winning Answer:**
> *"Unlike projects that simply claim usefulness, FinWise includes an empirical evaluation framework (`Study Mode`) designed for academic rigor. Participants review an informed consent screen and are assigned an anonymous alphanumeric code (protecting PII). They complete a randomized 10-question financial literacy test and self-efficacy Likert survey before and after engaging with FinWise. The system tracks engagement telemetry and computes paired difference metrics (post-test vs pre-test) to statistically evaluate financial literacy gains. The administrator interface displays genuine anonymous outcomes with a strict policy against fabricated data."*
