# 💼 FinWise — AI-Powered Personal Financial Planning Advisor

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-teal.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0-brightgreen.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, full-stack financial planning web platform engineered to eliminate manual spreadsheets and give young adults, students, and early-career professionals automated expense analysis, predictive savings forecasts, mathematical SIP calculators, and a transparent **Financial Health Score (0–100)**.

> **Academic Evaluation:** Final Year B.Tech Computer Science Engineering Project · Invertis University  
> **Team Lead / Defender:** Om

---

## 🏗 System Architecture

The application adopts a **3-tier architecture with a decoupled ML microservice**:

```
┌──────────────────────────────────────────────┐
│  Presentation Layer: React SPA (Vite + TW)   │
└──────────────────────┬───────────────────────┘
                       │ REST + JWT Bearer
┌──────────────────────▼───────────────────────┐
│  Application Layer: Node.js / Express        │
│  - Controllers, Services, Auth & Validation  │
│  - Financial Math Engines (SIP, Compounding) │
│  - Health Score Calculator & Rules Engine    │
└──────────┬───────────────────────┬───────────┘
           │ Mongoose              │ HTTP (Internal)
┌──────────▼──────────┐ ┌──────────▼───────────┐
│  Data Layer         │ │  AI / ML Microservice │
│  MongoDB Database   │ │  FastAPI + Scikit-Learn
└─────────────────────┘ └──────────────────────┘
```

- **Resilient Fallback:** The Node backend interfaces with the ML microservice via a timeout/retry client. If the ML microservice is offline, the backend seamlessly degrades to transparent rule-based classifications and projections.
- **Config-Driven Design:** All currency settings, thresholds, score weights, and categories are centralized in configuration modules.

---

## ⚡ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 18 (Vite), React Router v6, Tailwind CSS, Recharts, Axios, React Hook Form + Zod |
| **Backend** | Node.js, Express, Mongoose, JWT (Access + httpOnly Refresh), bcryptjs, Helmet, Morgan/Winston |
| **AI / ML Service** | Python 3.10+, FastAPI, Pandas, NumPy, Scikit-learn, joblib |
| **Database** | MongoDB 7.0 |
| **DevOps & Tooling**| Docker & Docker Compose, ESLint, Prettier, Jest, Supertest, Vitest, Pytest |

---

## 🚀 Quick Start

### Option A: Running with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd ai-financial-planning-advisor
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Spin up all containers:
   ```bash
   docker-compose up --build
   ```

4. Access services:
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **Node.js API:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
   - **FastAPI ML Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **MongoDB:** `mongodb://localhost:27017/financial_advisor`

---

### Option B: Local Development (Without Docker)

#### 1. Backend (`/server`)
```bash
cd server
npm install
npm run dev
```

#### 2. ML Microservice (`/ml-service`)
```bash
cd ml-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend (`/client`)
```bash
cd client
npm install
npm run dev
```

---

## 🧪 Testing Suite

- **Backend tests:** `cd server && npm test`
- **Frontend tests:** `cd client && npm test`
- **ML microservice tests:** `cd ml-service && pytest`

---

## 📚 Project Documentation

- [System Architecture Specification](docs/ARCHITECTURE.md)
- [Design Decisions Log](docs/DECISIONS.md)
- [REST API Reference](docs/API.md)
- [Machine Learning Research & Report](docs/ML_REPORT.md)
- [Viva Defense Guide & Q&A](docs/VIVA_GUIDE.md)

---

## ⚠️ Academic & Financial Disclaimer

> **Important Notice:** This software is an academic engineering project created solely for educational and demonstrative purposes for degree evaluation at Invertis University. The machine learning models are trained on synthetic profiles and mathematical formulas. This software **does not constitute certified financial advice**, and outputs should never be treated as legal or professional investment guidance.
