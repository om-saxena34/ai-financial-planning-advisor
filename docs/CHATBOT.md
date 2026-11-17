# 🤖 Fin — AI Financial Planning Assistant (Technical Documentation)

**Project:** FinWise — Personal Financial Planning Advisor  
**Academic Institution:** Invertis University, Bareilly  
**Component:** Conversational Financial Planning Assistant ("Fin")  
**Module Location:** `server/src/services/chatbot/` & `client/src/components/Chatbot/`

---

## 1. System Overview & Academic Purpose

"Fin" is a deterministic, domain-specialized financial planning chatbot built to assist students, young professionals, and finance beginners in understanding financial concepts, calculating investment growth, and checking purchase affordability in plain 7th-grade English.

### Why Not Just Call OpenAI / ChatGPT API?
In an academic evaluation, examiners look for **deterministic engineering rigor**, **explainability**, **zero runtime cost/API dependencies**, and **domain safety**:
1. **No Hallucinations:** Generative LLMs frequently hallucinate financial figures, compounding formulas, and tax slabs. Fin uses strictly validated mathematical functions (`calculateSip`, `calculateRequiredSip`).
2. **Deterministic & Explainable:** Every response maps directly to either a verified mathematical solver or a curated 85+ question peer-reviewed financial knowledge base.
3. **No External Network / Quota Dependency:** The system functions 100% offline without requiring paid API keys, internet connectivity, or token limits during an in-person viva evaluation.
4. **Safety & Compliance:** Fin automatically adds educational disclaimers to forward-looking statements, adhering to SEBI educational advisory norms.

---

## 2. Technical Architecture Pipeline

```

---

## 3. Real AI Tool Upgrade (Gemini Function Calling & Anti-Hallucination)

Fin features a **hybrid AI orchestrator** (`server/src/services/chatbot/geminiChatbot.service.js`) powered by Google's official `@google/genai` Node SDK:

### A. The 10 Server-Side Financial Tools
When `FEATURE_GEMINI_AI_CHAT=true` and `GEMINI_API_KEY` is provided, Fin utilizes Gemini's Function Calling mechanism to run deterministic calculations on the backend:
1. `calc_sip`: Calculates exact compound interest on recurring investments.
2. `calc_compound`: Evaluates lump-sum returns.
3. `required_sip`: Solves for the exact monthly contribution needed for target funds.
4. `goal_status`: Fetches user's live goal progress bars from MongoDB.
5. `spending_summary`: Summarizes essential bills, surplus, and savings rates.
6. `health_score`: Computes 0–100 score across all pillars.
7. `explain_score`: Explains the single easiest point gain.
8. `what_if`: Models before-and-after scenarios.
9. `student_planner`: Plans college semester fees and 50/30/20 first salary splits.
10. `future_plan`: Generates 10-year inflation-adjusted projections and readiness ladder steps.

### B. Anti-Hallucination Number Verifier
Before sending Gemini's generated answer to the client, the server executes `verifyNumbers()`:
- Extracts all numerical values, percentages, and rupee amounts from the model's text.
- Validates that every number is present in the tool's JSON output or the user's prompt (within a 3% rounding tolerance).
- If an ungrounded number is found, the server rejects the LLM prose and substitutes a safe, deterministic template directly formatted from the tool's data.

### C. Privacy Boundary (Zero PII)
- User names, email addresses, phone numbers, and individual bank transaction rows are **never** transmitted to external AI endpoints.
- Gemini receives only anonymized context (e.g. `monthlyIncomeApprox: 60000`, `fixedBillsApprox: 35000`, `occupation: "student"`).

### D. Graceful Circuit Breaker Fallback
If the Gemini API key is missing, or if Gemini returns HTTP 429 (quota exceeded), or if the network request exceeds 18 seconds, Fin automatically and silently falls back to the deterministic rule-based knowledge engine without crashing or throwing client errors.
  ┌────────────────────────────────────────────────────────┐
  │                    React Frontend SPA                  │
  │  • Floating ChatbotLauncher    • Sliding ChatDrawer    │
  │  • Interactive Rich Cards      • Quick Reply Chips     │
  └───────────────────────────┬────────────────────────────┘
                              │ POST /api/v1/chatbot/message
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │             Chatbot Intent & Routing Engine            │
  │                                                        │
  │ 1. Indian Currency Entity Extractor                    │
  │    (5k, 50k, 1.5L, 2.5 lakh, 1 cr, 12%, 10 yrs)        │
  │                                                        │
  │ 2. Session Context & Memory (Last 5 Turns / Sliding)   │
  │                                                        │
  │ 3. Multi-Intent Routing Hierarchy:                     │
  │    ├── Intent A: SIP Future Value Calculation          │
  │    ├── Intent B: Purchase Affordability Checker        │
  │    ├── Intent C: Health Score & Wellness Status        │
  │    ├── Intent D: Monthly Expense & Budget Breakdown    │
  │    ├── Intent E: Active Goals Status Query             │
  │    └── Intent F: 85-Item Domain Knowledge Base Match   │
  └───────────────────────────┬────────────────────────────┘
                              │ Dispatches to:
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Financial Math   │ │ MongoDB Query    │ │ Knowledge Base   │
│ Engine           │ │ Aggregations     │ │ Matcher (TF-IDF  │
│ (financialMath)  │ │ (Tx, Profile,    │ │ + Token Boost)   │
│ • SIP Annuity    │ │  Goals, Health)  │ │ 85 Curated Q&As  │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         └────────────────────┼────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │         Uniform Response & Card Payload Builder        │
  │  • Plain Class 7-8 English text                        │
  │  • Structured Card: sip_calculation / affordability /  │
  │                     health_score / goals / expenses    │
  │  • Action Hint (e.g. open_sip_calculator)              │
  │  • Quick Reply Suggestion Chips                        │
  │  • Educational Disclaimer Tag                          │
  └────────────────────────────────────────────────────────┘
```

---

## 3. Real AI Tool Upgrade (Gemini Function Calling & Anti-Hallucination)

Fin features a **hybrid AI orchestrator** (`server/src/services/chatbot/geminiChatbot.service.js`) powered by Google's official `@google/genai` Node SDK:

### A. The 10 Server-Side Financial Tools
When `FEATURE_GEMINI_AI_CHAT=true` and `GEMINI_API_KEY` is provided, Fin utilizes Gemini's Function Calling mechanism to run deterministic calculations on the backend:
1. `calc_sip`: Calculates exact compound interest on recurring investments.
2. `calc_compound`: Evaluates lump-sum returns.
3. `required_sip`: Solves for the exact monthly contribution needed for target funds.
4. `goal_status`: Fetches user's live goal progress bars from MongoDB.
5. `spending_summary`: Summarizes essential bills, surplus, and savings rates.
6. `health_score`: Computes 0–100 score across all pillars.
7. `explain_score`: Explains the single easiest point gain.
8. `what_if`: Models before-and-after scenarios.
9. `student_planner`: Plans college semester fees and 50/30/20 first salary splits.
10. `future_plan`: Generates 10-year inflation-adjusted projections and readiness ladder steps.

### B. Anti-Hallucination Number Verifier
Before sending Gemini's generated answer to the client, the server executes `verifyNumbers()`:
- Extracts all numerical values, percentages, and rupee amounts from the model's text.
- Validates that every number is present in the tool's JSON output or the user's prompt (within a 3% rounding tolerance).
- If an ungrounded number is found, the server rejects the LLM prose and substitutes a safe, deterministic template directly formatted from the tool's data.

### C. Privacy Boundary (Zero PII)
- User names, email addresses, phone numbers, and individual bank transaction rows are **never** transmitted to external AI endpoints.
- Gemini receives only anonymized context (e.g. `monthlyIncomeApprox: 60000`, `fixedBillsApprox: 35000`, `occupation: "student"`).

### D. Graceful Circuit Breaker Fallback
If the Gemini API key is missing, or if Gemini returns HTTP 429 (quota exceeded), or if the network request exceeds 18 seconds, Fin automatically and silently falls back to the deterministic rule-based knowledge engine without crashing or throwing client errors.

---

## 3. Mathematical Tools & Intent Recognition

### 3.1 SIP Wealth Solver
- **Trigger:** Queries matching investment/savings terms (`sip`, `invest`, `monthly`, `save`) paired with numbers and percentages.
- **Math Formula (Annuity Due):**
  $$FV = P \times \left[\frac{(1+i)^n - 1}{i}\right] \times (1+i)$$
- **Default Fallbacks:** ₹5,000/mo, 12% p.a., 10 years if parameters are omitted.
- **Output:** Returns invested principal, compound gain, total wealth, and structured `sip_calculation` card.

### 3.2 Purchase Affordability Assessment
- **Trigger:** Queries containing purchase verbs (`afford`, `buy`, `cost`, `purchase`, `can i get`, `laptop`, `iphone`, `phone`, `car`, `bike`).
- **Logic:**
  1. Retrieves user's monthly free surplus: $\text{Surplus} = \text{Monthly Income} - \text{Fixed Expenses}$.
  2. If unauthenticated, assumes baseline starter surplus (₹25,000/mo).
  3. Calculates months to save: $\text{Months} = \frac{\text{Item Cost}}{\text{Monthly Surplus}}$.
  4. Decision rule:
     - If $\text{Months} \le 1.0$: Item is comfortably affordable with cash upfront.
     - If $1.0 < \text{Months} \le 4.0$: Advises saving for $M$ months to avoid high-interest EMIs.
     - If $\text{Months} > 4.0$: Flags heavy financial burden and suggests setting a disciplined Goal.
- **Output:** Returns structured `affordability` card with status badge and months-to-save counter.

### 3.3 Dynamic User Telemetry Queries
- **Health Score Query:** "What is my health score?" triggers live recalculation using `computeHealthScore()` and returns a `health_score` badge card.
- **Recent Expenses Query:** "How much did I spend this month?" executes a 30-day MongoDB aggregation grouped by category and returns an `expenses` breakdown card.
- **Goals Query:** "What are my active goals?" retrieves all non-completed savings goals and returns a `goals` progress card.

---

## 4. The 85-Question Knowledge Base Breakdown

The curated knowledge base (`server/src/services/chatbot/knowledge_base.json`) covers 9 core personal finance categories:

| Domain | Question Count | Topics Covered |
|---|:---:|---|
| **1. Basics & Budgeting** | 10 | 50-30-20 rule, Needs vs Wants, Inflation, Net Worth, Emergency cushion |
| **2. Saving & Banking** | 9 | Savings Account interest, Auto-Sweep facility, FD vs RD, Safe UPI habits |
| **3. Investing & Equity** | 12 | Mutual Funds, Index Funds, Large/Mid/Small cap, SGBs, Diversification |
| **4. Loans & Debt** | 9 | Credit cards, CIBIL score, Good debt vs Bad debt, DTI ratio, No-cost EMI |
| **5. Tax Planning** | 9 | Old vs New Tax Regime, Section 80C, ELSS, 80D Health Insurance |
| **6. Emergency Funds** | 8 | 3–6 months reserve, Liquid funds, Parking safety cash |
| **7. Insurance & Risk** | 8 | Term Life Insurance, Health cover, Why avoid ULIPs/endowment plans |
| **8. Habits & Psychology** | 10 | Lifestyle inflation, Impulse buys, 24-hour rule, Compound patience |
| **9. Hinglish Queries** | 10 | "Emergency fund kya hota hai", "SIP kaise start kare", "FD vs MF" |
| **Total** | **85** | Complete peer-reviewed personal finance coverage |

---

## 5. Session Memory & Context Retention

The in-memory session manager (`server/src/services/chatbot/chatMemory.js`):
- Tracks conversations by `userId` (or `guestId` for landing page visitors).
- Retains the **last 5 turns** (10 messages maximum) using a sliding FIFO window.
- Enables follow-up questions:
  - User: *"If I save ₹5,000 for 10 years at 12%?"*
  - Fin: *(Calculates ₹11.61 Lakhs)*
  - User: *"What if I do it for 15 years instead?"*
  - Fin: Retains ₹5,000 and 12%, updates duration to 15 years, and recalibrates wealth to ₹25.22 Lakhs!

---

## 6. Indian Currency & Colloquial Entity Extraction

Built into `server/src/services/chatbot/entityExtractor.js`:
- **"k" Notation:** `5k` $\to 5,000$, `25.5k` $\to 25,500$
- **Lakh Notation:** `1L` $\to 1,00,000$, `1.5 lakh` $\to 1,50,000$, `2 lac` $\to 2,00,000$
- **Crore Notation:** `1 cr` $\to 1,00,00,000$, `2.5 crore` $\to 2,50,00,000$
- **Percentages:** `12%` $\to 12$, `15 percent` $\to 15$
- **Durations:** `10 yrs` $\to 10$, `6 months` $\to 0.5$ years

---

## 7. Viva Voce Sample Queries for Demonstration

| Examiner Ask | Fin Query to Type | What Fin Demonstrates |
|---|---|---|
| *"Can it calculate compound interest on the fly?"* | `If I save 10k per month for 15 years at 12%?` | Parses `10k`, calculates Annuity Due compounding, outputs **₹50.45 Lakhs** with interactive breakdown card. |
| *"Can it advise a student on an expensive purchase?"* | `Can I buy a gaming laptop for 80,000?` | Assesses user's free monthly cash flow, advises saving duration in months to avoid costly EMI debt. |
| *"Does it understand Hinglish or regional slang?"* | `Emergency fund kya hota hai?` | Matches Hinglish intent, explains 3–6 months reserve concept in simple terms. |
| *"Can it query the user's live profile?"* | `What is my Health Score?` | Executes live backend health score algorithm and returns score badge with recommendations. |
