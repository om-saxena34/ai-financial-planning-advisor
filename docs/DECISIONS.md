# 📑 Engineering Decisions Log (ADR)

This document tracks all foundational architectural and engineering choices made across the development lifecycle, documenting trade-offs and alternatives evaluated.

| ID | Decision | Rationale | Alternatives Considered | Date |
|---|---|---|---|---|
| **D1** | **Zod for Schema Validation** | Unified TypeScript-ready schema validation syntax usable across both Node.js backend and React client with `@hookform/resolvers/zod`. Lighter and more intuitive than Joi. | Joi (Node-only, heavier), Yup | 2026-11-14 |
| **D2** | **Recharts for Data Visualization** | React-idiomatic declarative JSX syntax for SVGs. Composable, responsive, and lightweight compared to legacy imperative wrappers. | Chart.js (requires imperative canvas binding wrapper), D3 (overkill complexity) | 2026-11-14 |
| **D3** | **httpOnly Cookie for Refresh Tokens** | Storing refresh tokens in httpOnly cookies prevents client-side JavaScript access, defending against Cross-Site Scripting (XSS) credential theft. Access tokens stay in memory. | `localStorage` (vulnerable to XSS extraction) | 2026-11-14 |
| **D4** | **Winston + Morgan Logging Architecture** | Morgan handles standardized HTTP request/access streams, while Winston structures application exceptions with configurable transports and timestamp levels. | Raw `console.log` (unstructured, lacks severity levels) | 2026-11-14 |
| **D5** | **Gradient Boosting for User Classification** | Tabular financial ratio data features non-linear interactions and collinearity. Gradient Boosting consistently outperforms linear models while allowing native feature importance extraction. | Deep Neural Networks (opaque black box, harder to justify in viva), Naive Bayes (poor handling of correlated financial features) | 2026-11-14 |
| **D6** | **Linear Interpolation for Health Score** | Discrete scoring brackets create artificial cliff effects where ₹1 in savings drops a score by 25 points. Linear interpolation produces continuous, realistic score shifts. | Step-wise discrete threshold scoring | 2026-11-14 |
| **D7** | **Decoupled Python FastAPI Microservice** | Isolates machine learning runtime, dependencies (Pandas, Scikit-learn), and model retraining from Express business logic. Retraining doesn't necessitate Node redeployments. | Running ML models directly in Node via ONNX or `child_process` (inflexible, heavy memory footprint) | 2026-11-14 |
| **D8** | **Graceful Rule-Based Fallback** | Production fintech applications must never crash if an analytics service encounters downtime. The Node server falls back to deterministic rule logic. | Failing with 500 error if ML service is unreachable | 2026-11-14 |
