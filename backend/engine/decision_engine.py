import os
from datetime import datetime
from typing import Any, List, Tuple

import joblib
import numpy as np
import shap

class DecisionEngine:
    """
    Production-grade inference decision engine with support for V1, V2, V3, and V4 pipelines:

    - Preprocessing raw 31-feature input vectors: [Time, V1..V28, Amount, delta_time]
    - Bootstrap XGBoost ensemble + uncertainty estimation
    - Isolation Forest novelty detection
    - V2 Calibrated SVM second opinion
    - V3 Dempster-Shafer evidence fusion
    - V4 collapse to 4 terminal states + SHAP explainability for PEND cases
    """

    def __init__(
        self,
        model_path: str | None = None,
        anomaly_path: str | None = None,
    ) -> None:

        engine_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(engine_dir, os.pardir, os.pardir))
        artifacts_dir = os.path.join(project_root, "artifacts")

        print(f"[DecisionEngine] Project root: {project_root}")

        # V1 Models
        ensemble_path = model_path or os.path.join(artifacts_dir, "xgb_ensemble.pkl")
        isolation_path = anomaly_path or os.path.join(artifacts_dir, "isolation_forest.pkl")

        if not os.path.exists(ensemble_path):
            raise FileNotFoundError(f"Ensemble not found at {ensemble_path}")
        self.models: List[Any] = joblib.load(ensemble_path)
        print(f"[DecisionEngine] Loaded ensemble with {len(self.models)} members.")

        if os.path.exists(isolation_path):
            self.anomaly_model = joblib.load(isolation_path)
            print("[DecisionEngine] Isolation Forest loaded.")
        else:
            self.anomaly_model = None
            print("[DecisionEngine] Isolation Forest not found. Novelty disabled.")

        # V2 Models (aligned with paper configuration using V3 SVM/Scaler)
        v2_svm_path = os.path.join(artifacts_dir, "v3_svm_calibrated.pkl")
        v2_scaler_path = os.path.join(artifacts_dir, "v3_svm_scaler.pkl")
        if os.path.exists(v2_svm_path) and os.path.exists(v2_scaler_path):
            self.v2_svm = joblib.load(v2_svm_path)
            self.v2_scaler = joblib.load(v2_scaler_path)
            print("[DecisionEngine] V2 SVM and Scaler loaded.")
        else:
            self.v2_svm = None
            self.v2_scaler = None
            print("[DecisionEngine] V2 SVM files not found.")

        # V3 Models
        v3_svm_path = os.path.join(artifacts_dir, "v3_svm_calibrated.pkl")
        v3_scaler_path = os.path.join(artifacts_dir, "v3_svm_scaler.pkl")
        if os.path.exists(v3_svm_path) and os.path.exists(v3_scaler_path):
            self.v3_svm = joblib.load(v3_svm_path)
            self.v3_scaler = joblib.load(v3_scaler_path)
            print("[DecisionEngine] V3 SVM and Scaler loaded.")
        else:
            self.v3_svm = None
            self.v3_scaler = None
            print("[DecisionEngine] V3 SVM files not found.")

        # V4 SHAP Model & Explainer
        shap_model_path = os.path.join(artifacts_dir, "xgb_raw_shap.pkl")
        if os.path.exists(shap_model_path):
            self.shap_model = joblib.load(shap_model_path)
            self.shap_explainer = shap.TreeExplainer(self.shap_model)
            print("[DecisionEngine] SHAP raw model loaded.")
        else:
            self.shap_model = None
            self.shap_explainer = None
            print("[DecisionEngine] SHAP model not found.")

        # Column names expected by the models (aligned after preprocessing)
        self.feature_cols = [f"V{i}" for i in range(1, 29)] + ["Amount", "hour", "delta_time"]

        # Config thresholds
        self.decline_threshold = 0.80
        self.escalate_threshold = 0.60
        self.auth_threshold = 0.30
        self.uncertainty_threshold = 0.02
        self.anomaly_threshold = -0.08

        # Dempster-Shafer thresholds (V3)
        self.ds_bel_auto_decline = 0.91
        self.ds_ign_low = 0.05
        self.ds_conflict_human = 0.25
        self.ds_ign_human = 0.10
        self.ds_bel_stepup = 0.35

        # V2 approuve threshold
        self.v2_approve_thresh = 0.01

        # Cost config
        self.fraud_cost = 1000
        self.review_cost = 20
        self.false_positive_cost = 50

    # ============================================================
    # PREPROCESSING PIPELINE
    # ============================================================

    def preprocess_features(self, raw_X: np.ndarray) -> np.ndarray:
        """
        Realign raw features to model-aligned features.
        Input raw_X has shape (1, 31): [Time, V1..V28, Amount, delta_time]
        Output aligned_X has shape (1, 31): [V1..V28, Amount (log1p), hour, delta_time]
        """
        time_val = raw_X[0, 0]
        pca_vals = raw_X[0, 1:29]  # V1 to V28
        amount_val = raw_X[0, 29]
        delta_time_val = raw_X[0, 30]

        hour_val = (time_val / 3600.0) % 24.0
        log_amount = np.log1p(amount_val)

        aligned = np.zeros((1, 31))
        aligned[0, 0:28] = pca_vals
        aligned[0, 28] = log_amount
        aligned[0, 29] = hour_val
        aligned[0, 30] = delta_time_val
        return aligned

    # ============================================================
    # BASE ENSEMBLE & ANOMALY PREDICTIONS
    # ============================================================

    def predict_proba(self, X: np.ndarray) -> Tuple[float, float]:
        probs = []
        for model in self.models:
            prob = model.predict_proba(X)[:, 1]
            probs.append(prob)
        probs_arr = np.vstack(probs)
        mean_prob = float(np.mean(probs_arr))
        std_prob = float(np.std(probs_arr))
        return mean_prob, std_prob

    def anomaly_score(self, X: np.ndarray) -> Tuple[float | None, bool]:
        if self.anomaly_model is None:
            return None, False
        score = float(self.anomaly_model.decision_function(X)[0])
        novelty_flag = score < self.anomaly_threshold
        return score, novelty_flag

    # ============================================================
    # DEMPSTER-SHAFER HELPER METHODS
    # ============================================================

    def bpa_from_ensemble(self, mean_prob: float, std: float) -> dict:
        std_scale = 0.05
        max_ign = 0.50
        std_normalised = float(np.clip(std / std_scale, 0.0, 1.0))
        uncertainty_weight = std_normalised * max_ign

        m_F = mean_prob * (1.0 - uncertainty_weight)
        m_L = (1.0 - mean_prob) * (1.0 - uncertainty_weight)
        m_FL = uncertainty_weight

        total = m_F + m_L + m_FL
        return {'F': m_F / total, 'L': m_L / total, 'FL': m_FL / total}

    def bpa_from_isolation_forest(self, raw_score: float) -> dict:
        sigmoid_scale = 20.0
        base_ign = 0.40
        anomaly_degree = float(np.clip(1.0 / (1.0 + np.exp(raw_score * sigmoid_scale)), 0.0, 1.0))

        m_F = anomaly_degree * (1.0 - base_ign)
        m_L = (1.0 - anomaly_degree) * (1.0 - base_ign)
        m_FL = base_ign

        total = m_F + m_L + m_FL
        return {'F': m_F / total, 'L': m_L / total, 'FL': m_FL / total}

    def bpa_from_svm(self, svm_prob_fraud: float) -> dict:
        base_ign = 0.15
        max_ign = 0.45
        confidence = float(np.clip(abs(svm_prob_fraud - 0.5) * 2.0, 0.0, 1.0))
        ign = max_ign - (max_ign - base_ign) * confidence

        m_F = svm_prob_fraud * (1.0 - ign)
        m_L = (1.0 - svm_prob_fraud) * (1.0 - ign)
        m_FL = ign

        total = m_F + m_L + m_FL
        return {'F': m_F / total, 'L': m_L / total, 'FL': m_FL / total}

    def dempster_combine(self, m1: dict, m2: dict) -> Tuple[dict, float]:
        m1_F, m1_L, m1_FL = m1['F'], m1['L'], m1['FL']
        m2_F, m2_L, m2_FL = m2['F'], m2['L'], m2['FL']

        K = m1_F * m2_L + m1_L * m2_F      # conflict mass
        if K >= 1.0 - 1e-9:
            K = 0.999999

        normaliser = 1.0 - K
        num_F = m1_F * m2_F + m1_F * m2_FL + m1_FL * m2_F
        num_L = m1_L * m2_L + m1_L * m2_FL + m1_FL * m2_L
        num_FL = m1_FL * m2_FL

        combined = {
            'F': num_F / normaliser,
            'L': num_L / normaliser,
            'FL': num_FL / normaliser,
        }
        total = sum(combined.values())
        return {k: v / total for k, v in combined.items()}, float(K)

    def extract_belief_metrics(self, m: dict) -> dict:
        return {
            'bel_F': m['F'],
            'pl_F': m['F'] + m['FL'],
            'bel_L': m['L'],
            'pl_L': m['L'] + m['FL'],
            'ignorance': m['FL'],
        }

    # ============================================================
    # PIPELINE ROUTING DECISIONS
    # ============================================================

    def decide_v1(self, prob: float, uncertainty: float, novelty_flag: bool) -> str:
        # Vectorized paper priority replication: lower priority rules are overwritten by higher ones
        decision = "APPROVE"

        # Rule 4: Low risk but uncertain
        if prob < self.auth_threshold and uncertainty >= self.uncertainty_threshold and not novelty_flag:
            decision = "ABSTAIN"

        # Rule 3: Medium risk
        if prob >= self.auth_threshold and not novelty_flag and not (prob >= self.escalate_threshold and uncertainty >= self.uncertainty_threshold):
            decision = "STEP_UP_AUTH"

        # Rule 5: Anomaly novelty override
        if novelty_flag and not (prob >= self.decline_threshold and uncertainty < self.uncertainty_threshold):
            decision = "ESCALATE_INVEST"

        # Rule 2: High risk but uncertain
        if prob >= self.escalate_threshold and uncertainty >= self.uncertainty_threshold:
            decision = "ESCALATE_INVEST"

        # Rule 1: High risk and low uncertainty (DECLINE)
        if prob >= self.decline_threshold and uncertainty < self.uncertainty_threshold:
            decision = "DECLINE"

        return decision

    # ============================================================
    # MAIN EVALUATION
    # ============================================================

    def evaluate_transaction(
        self,
        raw_X: np.ndarray,
        version: str = "V4",
        precomputed_prob: float | None = None,
        precomputed_std: float | None = None,
        precomputed_anomaly: float | None = None,
    ) -> dict:
        """
        Evaluate a single raw transaction through V1 -> V2 -> V3 -> V4 pipeline.
        raw_X has shape (1, 31): [Time, V1..V28, Amount, delta_time]
        """
        # 1. Preprocess raw input
        X = self.preprocess_features(raw_X)

        # 2. Base predictions
        if precomputed_prob is not None and precomputed_std is not None:
            prob = precomputed_prob
            uncertainty = precomputed_std
        else:
            prob, uncertainty = self.predict_proba(X)

        if precomputed_anomaly is not None:
            anomaly_score = precomputed_anomaly
            novelty_flag = anomaly_score < self.anomaly_threshold
        else:
            anomaly_score, novelty_flag = self.anomaly_score(X)

        # 3. Route V1
        v1_decision = self.decide_v1(prob, uncertainty, novelty_flag)

        # 4. Route V2
        v2_decision = v1_decision
        v2_svm_prob = 0.0
        if v1_decision == "ABSTAIN" and self.v2_svm is not None and self.v2_scaler is not None:
            X_scaled = self.v2_scaler.transform(X)
            v2_svm_prob = float(self.v2_svm.predict_proba(X_scaled)[0, 1])
            if v2_svm_prob < self.v2_approve_thresh:
                v2_decision = "APPROVE"

        # 5. Route V3
        v3_decision = v2_decision
        v3_svm_prob = 0.0
        bel_F = 0.0
        ignorance = 0.0
        conflict_K = 0.0

        if v2_decision == "ESCALATE_INVEST" and self.v3_svm is not None and self.v3_scaler is not None:
            # V3 SVM prediction
            X_v3_scaled = self.v3_scaler.transform(X)
            v3_svm_prob = float(self.v3_svm.predict_proba(X_v3_scaled)[0, 1])

            # Dempster-Shafer BPA Construction
            bpa1 = self.bpa_from_ensemble(prob, uncertainty)
            bpa2 = self.bpa_from_isolation_forest(anomaly_score if anomaly_score is not None else 0.0)
            bpa3 = self.bpa_from_svm(v3_svm_prob)

            # BPA Fusion
            m12, K12 = self.dempster_combine(bpa1, bpa2)
            m123, conflict_K = self.dempster_combine(m12, bpa3)
            belief_metrics = self.extract_belief_metrics(m123)

            bel_F = belief_metrics['bel_F']
            ignorance = belief_metrics['ignorance']

            # Sub-routing ESCALATE
            if conflict_K >= self.ds_conflict_human:
                v3_decision = "HUMAN_ESCALATE"
            elif bel_F >= self.ds_bel_auto_decline and ignorance <= self.ds_ign_low:
                v3_decision = "AUTO_DECLINE"
            elif ignorance >= self.ds_ign_human:
                v3_decision = "HUMAN_ESCALATE"
            elif bel_F >= self.ds_bel_stepup:
                v3_decision = "STEP_UP_AUTH"
            else:
                v3_decision = "HUMAN_ESCALATE"

        # 6. Route V4 (Terminal States + SHAP Explainability)
        v4_decision = v3_decision
        pend_origin = ""
        shap_features = []
        reason_code = ""

        # Map to V4 terminal states
        if v3_decision in ("APPROVE", "AUTO_APPROVE"):
            v4_decision = "APPROVE"
        elif v3_decision in ("DECLINE", "AUTO_DECLINE"):
            v4_decision = "DECLINE"
        elif v3_decision in ("STEP_UP", "STEP_UP_AUTH"):
            v4_decision = "STEP_UP"
        elif v3_decision == "ABSTAIN":
            v4_decision = "PEND"
            pend_origin = "ABSTAIN"
        elif v3_decision == "HUMAN_ESCALATE":
            v4_decision = "PEND"
            pend_origin = "HUMAN_ESCALATE"
        else:
            # Fallback
            v4_decision = "PEND"
            pend_origin = "HUMAN_ESCALATE"

        # If V4 decision is PEND, calculate SHAP explainability
        if v4_decision == "PEND" and self.shap_explainer is not None:
            sv = self.shap_explainer.shap_values(X)[0]
            top_idxs = np.argsort(np.abs(sv))[::-1][:3]
            for rank, fidx in enumerate(top_idxs, 1):
                fname = self.feature_cols[fidx]
                sval = float(sv[fidx])
                shap_features.append({
                    "feature": fname,
                    "value": round(sval, 4),
                    "direction": "elevates_fraud" if sval > 0 else "suppresses_fraud"
                })
            reason_code = "PEND_" + "_".join([tf["feature"] for tf in shap_features])

        # Expected Loss and Cost Simulation
        expected_loss = prob * self.fraud_cost
        
        # Determine manual review cost based on version-specific decision
        current_decision = v4_decision if version == "V4" else (v3_decision if version == "V3" else (v2_decision if version == "V2" else v1_decision))
        if current_decision in ("STEP_UP_AUTH", "STEP_UP"):
            manual_cost = 10.0  # Challenge cost
        elif current_decision in ("ESCALATE_INVEST", "ABSTAIN", "HUMAN_ESCALATE", "PEND"):
            manual_cost = 50.0  # Human investigation or PEND holding cost
        else:
            manual_cost = 0.0

        net_utility = -expected_loss - manual_cost

        # Map requested version to final output decision
        mapped_decision = v1_decision
        if version == "V2":
            mapped_decision = v2_decision
        elif version == "V3":
            mapped_decision = v3_decision
        elif version == "V4":
            mapped_decision = v4_decision

        return {
            "decision": mapped_decision,
            "risk_score": prob,
            "uncertainty": uncertainty,
            "novelty_flag": novelty_flag,
            "tier": "high_risk" if prob >= self.decline_threshold else ("medium_risk" if prob >= self.auth_threshold else "low_risk"),
            "costs": {
                "expected_loss": expected_loss,
                "manual_review_cost": manual_cost,
                "net_utility": net_utility,
            },
            "explanations": {
                "anomaly_score": anomaly_score,
                "top_features": shap_features,
            },
            "trace": {
                "v1_decision": v1_decision,
                "v2_decision": v2_decision,
                "v3_decision": v3_decision,
                "v4_decision": v4_decision,
                "v2_svm_prob": round(v2_svm_prob, 6),
                "v3_svm_prob": round(v3_svm_prob, 6),
                "ds_bel_F": round(bel_F, 6),
                "ds_ignorance": round(ignorance, 6),
                "ds_conflict_K": round(conflict_K, 6),
                "pend_origin": pend_origin,
                "shap_reason_code": reason_code,
                "shap_features": shap_features,
            },
            "meta": {
                "model_version": f"xgb_ensemble_{version.lower()}",
                "uncertainty_method": "bootstrap_std",
                "timestamp": str(datetime.utcnow()),
            },
        }