import os
from datetime import datetime
from typing import Any, List, Tuple

import joblib
import numpy as np


class DecisionEngine:
    """
    Production-grade inference decision engine with:

    - Bootstrap XGBoost ensemble
    - Uncertainty estimation (std of ensemble)
    - Isolation Forest novelty detection
    - 2-axis routing (Risk × Uncertainty)
    - 5 decision states
    """

    def __init__(
        self,
        model_path: str | None = None,
        anomaly_path: str | None = None,
    ) -> None:

        engine_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(engine_dir, os.pardir, os.pardir))
        artifacts_dir = os.path.join(project_root, "artifacts")

        ensemble_path = model_path or os.path.join(artifacts_dir, "xgb_ensemble.pkl")
        isolation_path = anomaly_path or os.path.join(artifacts_dir, "isolation_forest.pkl")

        print(f"[DecisionEngine] Project root: {project_root}")

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

        # Risk thresholds
        self.decline_threshold = 0.80
        self.escalate_threshold = 0.60
        self.auth_threshold = 0.30

        # Uncertainty threshold
        self.uncertainty_threshold = 0.02

        # Anomaly threshold
        self.anomaly_threshold = -0.08

        # Cost config
        self.fraud_cost = 1000
        self.review_cost = 20
        self.false_positive_cost = 50

    # ============================================================
    # ENSEMBLE PREDICTION
    # ============================================================

    def predict_proba(self, X) -> Tuple[float, float]:

        probs = []
        for model in self.models:
            prob = model.predict_proba(X)[:, 1]
            probs.append(prob)

        probs_arr = np.vstack(probs)

        mean_prob = float(np.mean(probs_arr))
        std_prob = float(np.std(probs_arr))

        return mean_prob, std_prob

    # ============================================================
    # ANOMALY DETECTION
    # ============================================================

    def anomaly_score(self, X) -> Tuple[float | None, bool]:

        if self.anomaly_model is None:
            return None, False

        score = float(self.anomaly_model.decision_function(X)[0])
        novelty_flag = score < self.anomaly_threshold

        return score, novelty_flag

    # ============================================================
    # 5-STATE ROUTING LOGIC
    # ============================================================

    def decide(self, prob: float, uncertainty: float, novelty_flag: bool) -> str:

        # 1️⃣ Hard fraud
        if prob >= self.decline_threshold and uncertainty < self.uncertainty_threshold:
            return "DECLINE"

        # 2️⃣ High risk but uncertain
        if prob >= self.escalate_threshold and uncertainty >= self.uncertainty_threshold:
            return "ESCALATE_INVEST"

        # 3️⃣ Medium risk
        if self.auth_threshold <= prob < self.decline_threshold:
            return "STEP_UP_AUTH"

        # 4️⃣ Low risk but uncertain
        if prob < self.auth_threshold and uncertainty >= self.uncertainty_threshold:
            return "ABSTAIN"

        # 5️⃣ Novel behaviour override
        if novelty_flag:
            return "ESCALATE_INVEST"

        # 6️⃣ Safe
        return "APPROVE"

    # ============================================================
    # COST ESTIMATION
    # ============================================================

    def estimate_cost(self, prob: float, decision: str) -> tuple[float, float, float]:

        expected_loss = prob * self.fraud_cost

        if decision in ["STEP_UP_AUTH", "ESCALATE_INVEST", "ABSTAIN"]:
            manual_cost = self.review_cost
        else:
            manual_cost = 0.0

        net_utility = -expected_loss - manual_cost

        return expected_loss, manual_cost, net_utility

    # ============================================================
    # RISK TIER
    # ============================================================

    def tier(self, prob: float) -> str:

        if prob >= self.decline_threshold:
            return "high_risk"
        elif prob >= self.auth_threshold:
            return "medium_risk"
        return "low_risk"

    # ============================================================
    # MAIN EVALUATION
    # ============================================================

    def evaluate_transaction(self, X) -> dict:

        prob, uncertainty = self.predict_proba(X)

        anomaly_score, novelty_flag = self.anomaly_score(X)

        decision = self.decide(prob, uncertainty, novelty_flag)

        expected_loss, manual_cost, net_utility = self.estimate_cost(prob, decision)

        return {
            "decision": decision,
            "risk_score": prob,
            "uncertainty": uncertainty,
            "novelty_flag": novelty_flag,
            "tier": self.tier(prob),
            "costs": {
                "expected_loss": expected_loss,
                "manual_review_cost": manual_cost,
                "net_utility": net_utility,
            },
            "explanations": {
                "anomaly_score": anomaly_score,
                "top_features": [],
            },
            "meta": {
                "model_version": "xgb_ensemble_v2",
                "uncertainty_method": "bootstrap_std",
                "timestamp": str(datetime.utcnow()),
            },
        }