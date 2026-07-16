# MARI — Multi-Axis Risk Intelligence

> **A production-grade fraud decision engine that routes transactions through 5 states based on Risk × Uncertainty — not just a score.**

🔗 **Live Demo:** [mari-alpha.vercel.app](https://mari-alpha.vercel.app) &nbsp;|&nbsp; 📄 **Under Review:** IEEE Access (2026)

---

## The Problem With Standard Fraud Detection

A traditional classifier outputs one number: a fraud probability. It cannot distinguish between:

- *"I am 80% confident this is fraud"* → **Auto-block it**
- *"My 5 models wildly disagree but average to 80%"* → **Don't block it — escalate it**

These two cases look identical to a binary system. MARI separates them.

---

## How MARI Works

MARI evaluates every transaction across **three independent axes**:

| Axis | Method | Output |
|---|---|---|
| **Risk Score** | 5-model Bootstrap XGBoost Ensemble | Mean fraud probability |
| **Epistemic Uncertainty** | Standard deviation across ensemble | Model disagreement signal |
| **Novelty Detection** | Isolation Forest (trained on legit txns only) | Unseen behavior flag |

These three signals feed into a **2D Risk × Uncertainty routing matrix** that produces one of **5 actionable states**:

```
Risk ↑
      │  ABSTAIN        │  ESCALATE_INVEST
      │  (low risk,     │  (high risk,
      │  high uncert.)  │  high uncert.)
 0.02 ├─────────────────┼──────────────────
      │  APPROVE        │  STEP_UP_AUTH  │  DECLINE
      │                 │                │
      └─────────────────┴────────────────┴──────── → Uncertainty
                       0.30             0.80
```

| Decision | Trigger | Real-World Action |
|---|---|---|
| `APPROVE` | Low risk + Low uncertainty | Auto-approve |
| `STEP_UP_AUTH` | Medium risk | Require OTP / Biometric |
| `ESCALATE_INVEST` | High risk + High uncertainty OR novel pattern | Route to fraud analyst |
| `DECLINE` | High risk + Low uncertainty | Auto-block |
| `ABSTAIN` | Low risk + High model disagreement | Defer to rule engine |

---

## The V1 → V4 Architecture (Progressive Automation)

MARI evolved through 4 versions, each eliminating a layer of human review:

```
V1: Abstention Engine
    → Maps every transaction into 5 routing buckets
    → Uncertain & novel cases go to ABSTAIN / ESCALATE

V2: SVM Second Opinion Layer
    → Intercepts ABSTAIN cases
    → Non-linear SVM in PCA space clears 16.07% of abstentions safely

V3: Dempster-Shafer Fusion
    → Intercepts ESCALATE cases
    → Mathematically fuses ensemble + SVM + Isolation Forest evidence
    → Conflict factor K ≥ 0.30 → routes to human; K < 0.30 → auto-resolves
    → Automates 44.44% of escalations

V4: SHAP Explainability Layer
    → Remaining unresolved → PEND state
    → Attaches local SHAP feature reason codes to every decision
    → Achieves 0% human review overhead
```

**Result: 100% automated decision lifecycle. Zero false auto-blocks on legitimate transactions.**

---

## Key Metrics

| Metric | Value |
|---|---|
| Ensemble ROC-AUC | **0.9851** |
| Dataset | 284,807 transactions · 0.172% fraud rate |
| Abstain Zone Fraud Enrichment | **290×** above baseline |
| Brier Score Improvement (post-calibration) | **−74.4%** |
| Human Intervention Required | **0%** (V4) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Decision Engine | Python 3.11 · XGBoost 3.2 · Scikit-Learn · FastAPI |
| Frontend | React + TypeScript · Vite · Tailwind · Framer Motion |
| Deployment | Docker (backend) · Railway (API) · Vercel (frontend) |
| Research Pipeline | Pandas · SHAP · Scipy · NumPy |

---

## API

**`POST /predict`**

```json
// Request
{ "features": [0.1, -1.2, 3.4, ...] }  // 31 numerical features

// Response
{
  "decision": "STEP_UP_AUTH",
  "risk_score": 0.42,
  "uncertainty": 0.018,
  "novelty_flag": false,
  "tier": "medium_risk",
  "costs": {
    "expected_loss": 420.0,
    "manual_review_cost": 20.0,
    "net_utility": -440.0
  },
  "model_version": "xgb_ensemble_v2"
}
```

Swagger UI: `http://localhost:8000/docs`

---

## Local Development

### Backend (Docker)
```bash
docker build -t mari-api .
docker run -p 8000:8000 mari-api
```

### Frontend
```bash
cd frontend-glass
npm install
npm run dev
```

---

## Why This Matters for Payment Infrastructure

Every decision state maps directly to a real payment operations layer:

- **`STEP_UP_AUTH`** → Trigger OTP / biometric challenge (like Razorpay's 2FA layer)
- **`ESCALATE_INVEST`** → Push to fraud analyst queue with SHAP reason codes attached
- **`ABSTAIN`** → Defer to rule engine with uncertainty score in the payload
- **`DECLINE`** → Hard block with high-confidence, low-uncertainty guarantee
- **Cost simulation** → Every response includes `expected_loss` and `net_utility` for chargeback optimization

The system is designed to slot into an existing payment gateway as a middleware layer — not just a research demo.

---

## Research

**Paper:** *"Knowing When Not to Decide: A Two-Dimensional Uncertainty Framework for Credit Card Fraud Detection"*  
**Author:** Devansh Kumar · Bennett University CSE · IEEE Student Member  
**Status:** Under Review, IEEE Access (2026)

---

*Built by [Devansh Kumar](https://github.com/devantaris)*
