# Metrics Tables – Risk-Aware Fraud Transaction Decision System

All values are extracted directly from source code. File paths and line numbers cite exact locations.

---

## 1. Decision Engine Thresholds

| Parameter | Value | Type | Source File | Line |
|-----------|-------|------|-------------|------|
| `decline_threshold` | `0.80` | Risk threshold | `backend/engine/decision_engine.py` | 49 |
| `escalate_threshold` | `0.60` | Risk threshold | `backend/engine/decision_engine.py` | 50 |
| `auth_threshold` | `0.30` | Risk threshold | `backend/engine/decision_engine.py` | 51 |
| `uncertainty_threshold` | `0.02` | Uncertainty threshold | `backend/engine/decision_engine.py` | 54 |
| `anomaly_threshold` | `-0.08` | Anomaly score threshold | `backend/engine/decision_engine.py` | 57 |

---

## 2. Cost Configuration (Production Engine)

| Parameter | Value | Unit | Source File | Line |
|-----------|-------|------|-------------|------|
| `fraud_cost` | `1000` | USD per fraud event | `backend/engine/decision_engine.py` | 60 |
| `review_cost` | `20` | USD per manual review | `backend/engine/decision_engine.py` | 61 |
| `false_positive_cost` | `50` | USD per false positive | `backend/engine/decision_engine.py` | 62 |

---

## 3. Research Phase Cost Configuration (Phase 2)

| Parameter | Value | Unit | Source File | Line |
|-----------|-------|------|-------------|------|
| `C_FN` (false negative) | `5000` | USD | `phase2_uncertainty.py` | 137 |
| `C_FP_block` (false positive auto-block) | `200` | USD | `phase2_uncertainty.py` | 138 |
| `C_manual` (manual review) | `50` | USD | `phase2_uncertainty.py` | 139 |
| `C_step_up` (step-up auth) | `10` | USD | `phase2_uncertainty.py` | 140 |
| `C_escalate` (escalation) | `100` | USD | `phase2_uncertainty.py` | 141 |

---

## 4. XGBoost Hyperparameters

### Phase 1 – Calibrated XGBoost (phase1_xgboost.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `n_estimators` | `300` | `phase1_xgboost.py` | 44 |
| `max_depth` | `4` | `phase1_xgboost.py` | 45 |
| `learning_rate` | `0.05` | `phase1_xgboost.py` | 46 |
| `scale_pos_weight` | Computed dynamically | `phase1_xgboost.py` | 40 |
| `eval_metric` | `logloss` | `phase1_xgboost.py` | 48 |
| `random_state` | `42` | `phase1_xgboost.py` | 49 |
| `tree_method` | `hist` | `phase1_xgboost.py` | 50 |
| `device` | `cuda` (GPU) | `phase1_xgboost.py` | 51 |
| Calibration method | `isotonic` | `phase1_xgboost.py` | 57 |
| Calibration CV folds | `3` | `phase1_xgboost.py` | 58 |

### Phase 2 – Bootstrap Ensemble (phase2_uncertainty.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `n_models` (ensemble size) | `5` | `phase2_uncertainty.py` | 35 |
| `n_estimators` | `300` | `phase2_uncertainty.py` | 49 |
| `max_depth` | `4` | `phase2_uncertainty.py` | 50 |
| `learning_rate` | `0.05` | `phase2_uncertainty.py` | 51 |
| `scale_pos_weight` | Computed dynamically | `phase2_uncertainty.py` | 30 |
| `eval_metric` | `logloss` | `phase2_uncertainty.py` | 53 |
| `random_state` | `seed` (0–4 per model) | `phase2_uncertainty.py` | 54 |
| `tree_method` | `hist` | `phase2_uncertainty.py` | 55 |
| `device` | `cpu` | `phase2_uncertainty.py` | 56 |
| Calibration method | `isotonic` | `phase2_uncertainty.py` | 61 |
| Calibration CV folds | `3` | `phase2_uncertainty.py` | 62 |

### Phase 3 – SHAP Base Model (phase3_explainability.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `n_estimators` | `300` | `phase3_explainability.py` | 31 |
| `max_depth` | `4` | `phase3_explainability.py` | 32 |
| `learning_rate` | `0.05` | `phase3_explainability.py` | 33 |
| `device` | `cuda` (GPU) | `phase3_explainability.py` | 38 |

### Phase 5 – Reliability Raw Model (phase5_reliability.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `n_estimators` | `300` | `phase5_reliability.py` | 36 |
| `max_depth` | `4` | `phase5_reliability.py` | 37 |
| `learning_rate` | `0.05` | `phase5_reliability.py` | 38 |
| `device` | `cuda` (GPU) | `phase5_reliability.py` | 43 |
| Calibration method | `isotonic` | `phase5_reliability.py` | 56 |
| Calibration CV folds | `3` | `phase5_reliability.py` | 57 |

---

## 5. Logistic Regression Hyperparameters (phase1_modeling.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `max_iter` | `1000` | `phase1_modeling.py` | 45 |
| `class_weight` | `balanced` | `phase1_modeling.py` | 46 |

---

## 6. Isolation Forest Hyperparameters (phase4_outlier.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `n_estimators` | `200` | `phase4_outlier.py` | 33 |
| `contamination` | `0.001` | `phase4_outlier.py` | 34 |
| `random_state` | `42` | `phase4_outlier.py` | 35 |
| `n_jobs` | `-1` (all cores) | `phase4_outlier.py` | 36 |

---

## 7. Data Split Configuration

| Parameter | Value | Applies To | Source File | Line |
|-----------|-------|------------|-------------|------|
| `test_size` | `0.2` (20%) | All phases | Multiple | Various |
| `random_state` | `42` | All splits | Multiple | Various |
| `stratify` | `y` (target column) | All splits | Multiple | Various |

---

## 8. Research Phase Routing Thresholds (Phase 2)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `T_block` | `0.8` | `phase2_uncertainty.py` | 87 |
| `T_review` | `0.1164` | `phase2_uncertainty.py` | 88 |
| `U_threshold` | `0.015` | `phase2_uncertainty.py` | 89 |

> **NOTE**: These research thresholds differ from the production engine thresholds. The production engine uses `auth_threshold = 0.30` (vs `T_review = 0.1164`), `uncertainty_threshold = 0.02` (vs `U_threshold = 0.015`), and has a `escalate_threshold = 0.60` which did not exist in the research phase.

---

## 9. Port Numbers

| Service | Port | Protocol | Source File | Line |
|---------|------|----------|-------------|------|
| FastAPI (uvicorn) | `8000` | HTTP | `Dockerfile` | 11, 13 |
| Streamlit (default) | `8501` | HTTP | `frontend/app.py` | (default) |
| API URL (frontend config) | `8000` | HTTP | `frontend/app.py` | 5 |

---

## 10. Dataset Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Total transactions | `284,807` | `phase0_cleaning.py` line 28, `README.md` line 153 |
| Fraud rate | `0.172%` | `README.md` line 154 |
| Raw features | `31` (Time + V1-V28 + Amount + Class) | `README.md` line 98, `api/main.py` line 19 |
| Clean features | `31` (hour + V1-V28 + Amount + delta_time + Class) | `phase0_cleaning.py` logic |
| Raw CSV size | ~150 MB | File system |
| Clean CSV size | ~155 MB | File system |

---

## 11. Model Validation Metrics (from README.md)

| Metric | Value | Source |
|--------|-------|--------|
| ROC-AUC | ≈ `0.986` | `README.md` line 62 |
| Calibration | Reliability curve verified | `README.md` line 63 |
| Brier score | Improved post-calibration | `README.md` line 64 |

---

## 12. Synthetic Transaction Generator Parameters (frontend/app.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| `time` range | `uniform(0, 172800)` (~2 days in seconds) | `frontend/app.py` | 25 |
| `amount` range | `uniform(1, 5000)` | `frontend/app.py` | 26 |
| PCA features | `normal(0, 1, 28)` (28 features) | `frontend/app.py` | 28 |
| Total features generated | `31` (time + 28 PCA + amount + padding) | `frontend/app.py` | 30–34 |
| `max_attempts` | `500` | `frontend/app.py` | 51 |

---

## 13. Uncertainty Display Thresholds (frontend/app.py)

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| Frontend uncertainty display threshold | `0.01` | `frontend/app.py` | 114 |

> **NOTE**: The frontend uses `0.01` to classify uncertainty as "High" vs "Low" for display purposes, which differs from the engine's production threshold of `0.02`. This creates a cosmetic inconsistency where the display may show "Low" uncertainty while the engine might route differently.

---

## 14. Docker Configuration

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| Base image | `python:3.11` | `Dockerfile` | 1 |
| Working directory | `/app` | `Dockerfile` | 3 |
| Exposed port | `8000` | `Dockerfile` | 11 |
| CMD | `python -m uvicorn api.main:app --host 0.0.0.0 --port 8000` | `Dockerfile` | 13 |

---

## 15. Dependency Versions (requirements.txt)

| Package | Pinned Version | Notes |
|---------|---------------|-------|
| `fastapi` | Not pinned | Latest at install time |
| `uvicorn` | Not pinned | Latest at install time |
| `numpy` | Not pinned | Latest at install time |
| `scikit-learn` | Not pinned | Latest at install time |
| `xgboost` | Not pinned | Latest at install time |
| `joblib` | Not pinned | Latest at install time |
| `pydantic` | Not pinned | Latest at install time |

### Installed Versions (from venv)

| Package | Installed Version | Source |
|---------|------------------|--------|
| `xgboost` | `3.2.0` | `venv/Lib/site-packages/xgboost-3.2.0.dist-info` |

> **NOTE**: No version pinning in `requirements.txt`. This is a reproducibility risk — future installs may break due to API changes in dependencies.

---

## 16. Logging Configuration

| Parameter | Value | Source File | Line |
|-----------|-------|-------------|------|
| Log file | `logs/system.log` | `backend/config/logger.py` | 4 |
| Log level | `INFO` | `backend/config/logger.py` | 5 |
| Log format | `%(asctime)s - %(levelname)s - %(message)s` | `backend/config/logger.py` | 6 |

---

## 17. Model Version Metadata (Returned in API Response)

| Field | Value | Source File | Line |
|-------|-------|-------------|------|
| `model_version` | `xgb_ensemble_v2` | `backend/engine/decision_engine.py` | 184 |
| `uncertainty_method` | `bootstrap_std` | `backend/engine/decision_engine.py` | 185 |
| `timestamp` | `datetime.utcnow()` (UTC) | `backend/engine/decision_engine.py` | 186 |

---

## 18. Retry / Timeout Values

| Context | Value | Source File | Line |
|---------|-------|-------------|------|
| Streamlit max retry attempts | `500` | `frontend/app.py` | 51 |

> **NOTE**: No explicit timeouts, connection limits, memory limits, or batch sizes are configured anywhere in the codebase. The system relies on default values from FastAPI/uvicorn/requests.
