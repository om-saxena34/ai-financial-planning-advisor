# 🎁 FinWise Extra Enhancements Log

This file records small, tasteful improvements added to enhance usability, polish, and defense presentation.

| Feature Added | Why It Was Added | How to Turn It Off |
|---|---|---|
| **CornerDecor Shapes** | Subtle inline SVGs in card and page corners make the app feel designed by a human team, avoiding blank template look. | Remove `<CornerDecor />` from page or pass `opacity={0}`. |
| **HelpTooltip ("What is this?")** | Explains complex terms (SIP, Health Score, Emergency Fund, DTI) in plain 7th-grade English next to labels. | Remove `<HelpTooltip />` next to headings/labels. |
| **AnimatedNumber Counter** | Counts up balances, health scores, and savings smoothly on mount for a polished fintech feel. | Replace with plain `{value.toLocaleString('en-IN')}`. |
| **Quick-Fill Demo Buttons** | Lets you sign in as Saver, Balanced, or Overspender with one click during the viva demo without typing passwords. | Remove the demo buttons row in `client/src/pages/Login.jsx`. |
| **Simple Word Replacements** | Swapped out cold academic jargon ("financial telemetry", "discretionary velocity") for plain, warm language. | Reviewable in git history. |
| **Glowing Circular Health Gauge** | Beautiful SVG filter (`#gauge-glow`) with animated stroke dash-offset and colour shift (poor/fair/good/excellent). | Stored in `client/src/pages/HealthScore.jsx`. |
| **Blue-First Recharts Palette** | Charts default to soft blue tones (`#5B9FD6`, `#A9CFEE`) to keep visual calm and avoid garish rainbow gradients. | Styled inside Recharts definitions. |
| **Floating Matters Animation** | Gentle floating pills (Health Score, SIP Growth, Goal Progress) and ambient floating particles drifting softly across hero sections to bring pages to life. | Remove `<FloatingElements />` or adjust speed/count. |
| **Fin AI Financial Helper** | 85-question rule+intent financial assistant with live SIP solver, affordability checker, user health score queries, and interactive card responses. | Unmount `<ChatbotLauncher />` in `PageWrapper.jsx` or disable `/api/v1/chatbot`. |
| **Quick Command Palette (⌘K / Ctrl+K)** | Instant keyboard jump menu to navigate any page, calculator, or ask Fin directly with live fuzzy search. | Remove `<CommandPalette />` from `PageWrapper.jsx`. |
| **Indian Number Entity Extractor** | Parses amounts like `5k`, `50k`, `1.5L`, `2.5 lakh`, `1 crore`, percentages like `12%`, and durations like `10 yrs` so users can speak naturally. | Located in `server/src/services/chatbot/entityExtractor.js`. |
| **Feature Flags System** | Configurable flags (`STUDENT_MODE`, `WHAT_IF_SAVE_SCENARIOS`, `WHY_EXPLAINER`, `STATEMENT_UPLOAD`, `STUDY_MODE`) allow toggling any upgrade on or off without breaking code. | Toggle boolean in `server/src/config/features.js` and `client/src/config/features.js`. |
| **Shared Formula Package** | Single pure JS library (`shared/financialCalc.js`) used by both browser and server to guarantee zero calculation discrepancies. | Located in root `shared/financialCalc.js`. |
| **Student Mode & Fee Amortization** | Specialized module for students with irregular income (median calculation), semester fee planner, 3-month safety fund rules, and first-salary 50/30/20 planner. | Set `STUDENT_MODE=false` in feature config. |
| **What-If Multi-Scenario Save (x3)** | Allows saving up to 3 hypothetical scenarios and rendering side-by-side comparative cards with live wealth trajectories. | Set `WHAT_IF_SAVE_SCENARIOS=false` in feature config. |
| **Why? Explainer & WhyPanel** | Zero-dependency explainable AI utilizing feature permutation to output top 3 classification factors and easiest point gain in plain language. | Set `WHY_EXPLAINER=false` in feature config. |
| **Bank Statement CSV Categorizer** | In-memory parser that classifies Indian bank transactions via TF-IDF + LinearSVC, detects MAD outliers, and remembers user category corrections. | Set `STATEMENT_UPLOAD=false` in feature config. |
