# 🌌 Glass Lens: Risk-Aware Fraud Decision Engine

> A production-grade decision intelligence system combining ensemble ML, epistemic uncertainty, and novelty detection into a unified, cost-aware routing architecture.

## 🚀 Overview

Traditional fraud systems treat transactions as a binary `APPROVE` or `DECLINE`, ignoring the nuance of model confidence. **Glass Lens** changes this paradigm by evaluating transactions across three dimensions:

1. **Risk Score:** Consensus probability from a 5-model Bootstrap XGBoost Ensemble.
2. **Predictive Uncertainty:** Standard deviation across the ensemble (epistemic disagreement).
3. **Novelty Detection:** Isolation Forest identifying unseen anomalous behavior.

These metrics feed into a cost-aware engine that routes transactions into **5 distinct states**, optimizing for financial outcome and minimizing false positives.

---

## 🧠 5-State Decision Architecture

The engine dynamically routes traffic based on the Risk × Uncertainty matrix:

| Decision | Trigger Condition | Action |
| :--- | :--- | :--- |
| `APPROVE` | Low Risk + Low Uncertainty | Auto-approve transaction. |
| `STEP_UP_AUTH` | Medium Risk | Require 2FA / Biometric verification. |
| `ESCALATE_INVEST` | High Risk + High Uncertainty *or* Novel Pattern | Route to human fraud analyst. |
| `DECLINE` | High Risk + Low Uncertainty | Auto-block transaction. |
| `ABSTAIN` | Low Risk + High Uncertainty | Defer decision due to model disagreement. |

---

## ⚙️ Technical Stack

- **Backend (API Engine):** FastAPI, Python 3.11, Scikit-Learn, XGBoost
- **Frontend (Glass UI):** Vanilla JS, Canvas API, Vite (Cosmic / Terminal Aesthetic)
- **Deployment:** Docker, Railway (Backend), Vercel (Frontend)

---

## 💻 Local Development

### 1. Backend (Dockerized API)
```bash
docker build -t fraud-api .
docker run -p 8000:8000 fraud-api
```
*Swagger UI available at: `http://localhost:8000/docs`*

### 2. Frontend (Glass UI)
```bash
cd frontend-glass
npm install
npm run dev
```

---

## 🔌 API Integration

**POST `/predict`**

*Request:*
```json
{
  "features": [0.1, -1.2, 3.4 /* ... 31 numerical features total */ ]
}
```

*Response:*
```json
{
  "decision": "STEP_UP_AUTH",
  "risk_score": 0.42,
  "uncertainty": 0.01,
  "novelty_flag": false,
  "tier": "medium_risk",
  "costs": {
    "expected_loss": 420.0,
    "manual_review_cost": 20.0,
    "net_utility": -440.0
  }
}
```

---

## ☁️ Cloud Deployment

- **Frontend (Vercel):** Set `VITE_API_URL` to your backend URL in the Vercel dashboard.
- **Backend (Railway):** Set `ALLOWED_ORIGINS` to your frontend URL in the Railway dashboard.
