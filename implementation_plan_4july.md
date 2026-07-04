# Implementation Plan — Risk-Aware Fraud Transaction Decision System V4 Completion

This plan outlines the steps required to complete the production implementation of the **Risk-Aware Fraud Transaction Decision System** up to **Version 4 (V4)**. 

Currently, the production code on the desktop (`C:\Users\Devansh\Desktop\Risk Aware Fraud Transaction Decision System`) only implements a corrupted version of the V1 pipeline. We will align it with the research findings in the paper repository and complete the implementation through V4.

---

## Research Findings & Bugs Identified

1. **V1 Routing Logic Bug (Priority Order)**:
   In the production `backend/engine/decision_engine.py`, the routing checks are evaluated sequentially:
   - Rule 3 (`auth_threshold <= prob < decline_threshold` -> `STEP_UP_AUTH`) is evaluated *before* Rule 5 (`novelty_flag` -> `ESCALATE_INVEST`).
   - If a transaction is highly anomalous (novelty flag is True) but has a medium risk probability (e.g. `prob = 0.50`), it returns `STEP_UP_AUTH` instead of `ESCALATE_INVEST`.
   - In the paper's vectorised code (`v1_route_vectorised`), the novelty override has a higher priority than `STEP_UP_AUTH`.

2. **Feature Alignment Bug**:
   - The model was trained on: `V1..V28`, `Amount` (log1p-transformed), `hour`, and `delta_time`.
   - The frontend sends a 31-feature list formatted as: `[Time, V1..V28, Amount, 0.0]`.
   - The backend does not realign or preprocess these features (treating `Time` as `V1`, shifting the PCA features, and treating raw `Amount` as `hour`).
   - The `Amount` is never log-transformed (`log1p`), meaning it is fed on the raw dollar scale, which differs completely from the model's training scale.

3. **Incomplete V2, V3, V4 Stages**:
   - The production backend does not load or evaluate V2 SVM models (`svm_calibrated_final.pkl`), V3 SVM models (`v3_svm_calibrated.pkl`), or V4 SHAP models.
   - The MARI website dashboard only displays V1 decisions and does not have controls or visual components for V2 (second opinion), V3 (Dempster-Shafer fusion details), or V4 (PEND with SHAP reason codes).

---

## User Review Required

> [!IMPORTANT]
> **API Version Parameter**: We will add a `version` query parameter (defaulting to `"V4"`) to the `/predict` endpoint. The backend will return a comprehensive `trace` field containing predictions and routing outcomes for *all* versions (V1, V2, V3, V4) regardless of the selected version, enabling step-by-step visual audits.
>
> **Model Porting & Pre-training**: We will copy the V2/V3 SVM and scaler weights into the production `artifacts/` folder. We will also pre-train the uncalibrated XGBoost classifier used for SHAP TreeExplainer and save it to `artifacts/xgb_raw_shap.pkl`. This avoids the ~60s training lag at server startup.

---

## Proposed Changes

### 1. Artifacts & Models
#### [NEW] [prepare_artifacts.py](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/scripts/prepare_artifacts.py)
A script to:
- Create `artifacts/` if missing.
- Copy `svm_calibrated_final.pkl` and `svm_scaler_final.pkl` from the paper's `v2_playground/artifacts` directory.
- Copy `v3_svm_calibrated.pkl` and `v3_svm_scaler.pkl` from the paper's `v3_playground` directory.
- Load `creditcard_phase0_clean.csv`, train the raw uncalibrated XGBoost classifier (on the training set), and save it to `artifacts/xgb_raw_shap.pkl` to support real-time SHAP evaluations in V4.

---

### 2. Backend Decision Engine
#### [MODIFY] [decision_engine.py](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/backend/engine/decision_engine.py)
- Load all required model artifacts: Ensemble, Isolation Forest, V2 SVM + Scaler, V3 SVM + Scaler, and the SHAP model.
- Add `preprocess_features` to parse raw inputs (30- or 31-dimension vectors), apply `np.log1p` to `Amount`, compute the cyclic `hour`, and output aligned features: `[V1..V28, log_amount, hour, delta_time]`.
- Fix the V1 priority order in `decide()`.
- Implement V2 Second Opinion logic (clearing `ABSTAIN` if SVM $P(\text{fraud}) < 0.01$).
- Implement V3 Dempster-Shafer evidence fusion (combining ensemble, anomaly, and SVM probabilities to sub-route `ESCALATE_INVEST` into `AUTO_DECLINE`, `STEP_UP_AUTH`, or `HUMAN_ESCALATE`).
- Implement V4 collapse to 4 terminal states (`APPROVE`, `DECLINE`, `STEP_UP`, `PEND`) and integrate SHAP to return the top-3 feature explanations and reason codes for any transaction routed to `PEND`.
- Return a detailed `trace` object with calculations and rules applied for V1, V2, V3, and V4.

---

### 3. API Layer
#### [MODIFY] [main.py](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/api/main.py)
- Support receiving a `version` parameter in the request payload or query string.
- Invoke the Decision Engine with the realigned preprocessing pipeline.

---

### 4. Frontend Dashboard (MARI Website)
#### [MODIFY] [dashboard.html](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/frontend-glass/dashboard.html)
- Add a dropdown selector in the header to select the active version: `V1 (5-State Baseline)`, `V2 (SVM Second Opinion)`, `V3 (Dempster-Shafer Fusion)`, `V4 (Automated PEND + SHAP)`.
- Add an **X-Ray Detail Panel** containing:
  - **V2 Second Opinion status**: Showing SVM probability and whether the transaction was cleared.
  - **V3 D-S Belief Fusion details**: Displaying combined belief of fraud ($bel_F$), ignorance ($m_{FL}$), and conflict ($K$).
  - **V4 PEND Explainability details**: Presenting a mini horizontal bar chart of the top-3 SHAP features driving uncertainty.

#### [MODIFY] [main.js](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/frontend-glass/main.js)
- Handle the version toggle and update the displayed decisions, badges, rules, and X-Ray detail panels.
- Update the preset generators to inject true raw features and call the `/predict` endpoint.
- Correct the `high_risk` vs `high` risk tier mismatch bug in the routing explanations.

#### [MODIFY] [landscape.js](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/frontend-glass/landscape.js)
- Update region mapping. When the active version changes:
  - Redraw canvas backgrounds corresponding to the active version's regions (e.g., merging region blocks for V4 to reflect only 4 states).
  - Update dot color rules to match the active version's decisions.

---

## Verification Plan

### Automated Pipeline Verification
#### [NEW] [test_pipeline_reproduction.py](file:///C:/Users/Devansh/Desktop/Risk%20Aware%20Fraud%20Transaction%20Decision%20System/backend/test_pipeline_reproduction.py)
We will write a python script that:
1. Loads the test set from `creditcard_phase0_clean.csv`.
2. Runs the completed production `DecisionEngine` on all 56,962 test transactions.
3. Compares the resulting counts for each version (V1, V2, V3, V4) against the paper's verified numbers:
   - **V1**: APPROVE = 56,816, ABSTAIN = 56, STEP_UP = 45, ESCALATE = 45, DECLINE = 0.
   - **V2**: Remaining ABSTAIN = 47, cleared to APPROVE = 9.
   - **V3**: ESCALATE sub-routed to: AUTO_DECLINE = 10, STEP_UP_AUTH = 10, HUMAN_ESCALATE = 25.
   - **V4**: APPROVE = 56,825, DECLINE = 47, STEP_UP = 20, PEND = 72.
4. Asserts that the counts match *exactly* to verify 100% mathematical accuracy.

### Manual Verification
- Deploy FastAPI backend and Vite frontend.
- Select V4, click preset scenario buttons (Approve, Step-Up, Abstain, Escalate, Decline), and check that:
  - The verdict maps to V4 terminal states (`PEND` instead of `ABSTAIN`/`HUMAN_ESCALATE`).
  - The SHAP reason code displays the correct top-3 features (e.g., `PEND_V14_V17_V10`).
  - The landscape canvas updates its color regions and plots the transaction dot.
