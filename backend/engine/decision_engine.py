import os
from datetime import datetime
from typing import Any, List, Tuple

import joblib
import numpy as np


class DecisionEngine:
    """
    Inference-only decision engine using:
    - Bootstrap XGBoost ensemble (probability + uncertainty)
    - Optional Isolation Forest novelty layer
    - Simple cost-aware routing into APPROVE / MANUAL_REVIEW / DECLINE
    """

    def __init__(
        self,
        model_path: str | None = None,
        anomaly_path: str | None = None,
    ) -> None:
        # Resolve project root (.. from backend/engine/)
        engine_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(engine_dir, os.pardir, os.pardir))
        artifacts_dir = os.path.join(project_root, "artifacts")

        ensemble_path = model_path or os.path.join(artifacts_dir, "xgb_ensemble.pkl")
        isolation_path = anomaly_path or os.path.join(artifacts_dir, "isolation_forest.pkl")

        print(f"[DecisionEngine] Project root: {project_root}")
        print(f"[DecisionEngine] Loading ensemble from: {ensemble_path}")

        if not os.path.exists(ensemble_path):
            raise FileNotFoundError(
                f"Bootstrap ensemble artifact not found at {ensemble_path}"
            )

        self.models: List[Any] = joblib.load(ensemble_path)

        print(f"[DecisionEngine] Loaded ensemble with {len(self.models)} members.")

        if os.path.exists(isolation_path):
            print(f"[DecisionEngine] Loading Isolation Forest from: {isolation_path}")
            self.anomaly_model = joblib.load(isolation_path)
            print("[DecisionEngine] Isolation Forest loaded.")
        else:
            print(f"[DecisionEngine] Isolation Forest not found at {isolation_path}. Novelty disabled.")
            self.anomaly_model = None

        # Thresholds (can be externalized later)
        self.block_threshold = 0.70
        self.review_threshold = 0.30
        self.uncertainty_threshold = 0.02     # bootstrap std
        self.anomaly_threshold = -0.08        # tuned from legit 99th percentile

        # Cost configuration
        self.fraud_cost = 1000
        self.manual_review_cost = 20
        self.false_positive_cost = 50

    # ============================================================
    # PROBABILITY + UNCERTAINTY
    # ============================================================
    def predict_proba(self, X) -> Tuple[np.ndarray, np.ndarray]:
        print(f"[DecisionEngine] Running ensemble prediction on input shape: {getattr(X, 'shape', None)}")

        probs: list[np.ndarray] = []
        for idx, model in enumerate(self.models):
            prob = model.predict_proba(X)[:, 1]
            probs.append(prob)
            print(f"[DecisionEngine]  Member {idx} prob[0]={float(prob[0]):.6f}")

        probs_arr = np.vstack(probs)
        mean_prob = np.mean(probs_arr, axis=0)
        std_prob = np.std(probs_arr, axis=0)

        print(
            f"[DecisionEngine] Ensemble mean={float(mean_prob[0]):.6f}, "
            f"std={float(std_prob[0]):.6f}"
        )

        return mean_prob, std_prob

    # ============================================================
    # ANOMALY SCORE
    # ============================================================
    def anomaly_score(self, X) -> Tuple[float | None, bool]:
        if self.anomaly_model is None:
            print("[DecisionEngine] No anomaly model loaded; skipping novelty detection.")
            return None, False

        score = float(self.anomaly_model.decision_function(X)[0])
        novelty_flag = score > self.anomaly_threshold

        print(
            f"[DecisionEngine] Anomaly score={score:.6f}, "
            f"threshold={self.anomaly_threshold:.6f}, "
            f"novelty_flag={novelty_flag}"
        )

        return score, novelty_flag

    # ============================================================
    # DECISION LOGIC
    # ============================================================
    def decide(self, prob: float, uncertainty: float, novelty_flag: bool) -> str:
        # High confidence fraud
        if prob >= self.block_threshold and uncertainty < self.uncertainty_threshold:
            decision = "DECLINE"
        # Medium risk or uncertain
        elif prob >= self.review_threshold or uncertainty >= self.uncertainty_threshold:
            decision = "MANUAL_REVIEW"
        # Novel behavior but low model risk
        elif novelty_flag:
            decision = "MANUAL_REVIEW"
        else:
            decision = "APPROVE"

        print(
            f"[DecisionEngine] Routing decision: prob={prob:.6f}, "
            f"uncertainty={uncertainty:.6f}, novelty_flag={novelty_flag} -> {decision}"
        )

        return decision

    # ============================================================
    # COST ESTIMATION
    # ============================================================
    def estimate_cost(self, prob: float, decision: str) -> tuple[float, float, float]:
        expected_loss = prob * self.fraud_cost

        if decision == "MANUAL_REVIEW":
            manual_cost = self.manual_review_cost
        else:
            manual_cost = 0.0

        net_utility = -expected_loss - manual_cost

        print(
            f"[DecisionEngine] Cost view: expected_loss={expected_loss:.2f}, "
            f"manual_review_cost={manual_cost:.2f}, net_utility={net_utility:.2f}"
        )

        return expected_loss, manual_cost, net_utility

    # ============================================================
    # RISK TIER
    # ============================================================
    def _tier(self, prob: float) -> str:
        if prob >= self.block_threshold:
            return "high_risk"
        elif prob >= self.review_threshold:
            return "medium_risk"
        return "low_risk"

    # ============================================================
    # MAIN EVALUATION
    # ============================================================
    def evaluate_transaction(self, X) -> dict:
        """
        Evaluate a single transaction feature vector X (1 x n_features).

        Returns a JSON-serializable dict with keys:
        decision, risk_score, uncertainty, novelty_flag, tier,
        costs, explanations, meta.
        """
        prob_arr, unc_arr = self.predict_proba(X)
        prob = float(prob_arr[0])
        uncertainty = float(unc_arr[0])

        anomaly_score, novelty_flag = self.anomaly_score(X)
        decision = self.decide(prob, uncertainty, novelty_flag)

        expected_loss, manual_cost, net_utility = self.estimate_cost(prob, decision)

        result = {
            "decision": decision,
            "risk_score": prob,
            "uncertainty": uncertainty,
            "novelty_flag": bool(novelty_flag),
            "tier": self._tier(prob),
            "costs": {
                "expected_loss": float(expected_loss),
                "manual_review_cost": float(manual_cost),
                "net_utility": float(net_utility),
            },
            "explanations": {
                # Placeholder; can be wired to SHAP later
                "top_features": [],
                "anomaly_score": anomaly_score,
            },
            "meta": {
                "model_version": "xgb_ensemble_v1",
                "uncertainty_method": "bootstrap_std",
                "anomaly_model": "isolation_forest_legit_only"
                if self.anomaly_model is not None
                else None,
                "timestamp": str(datetime.utcnow()),
            },
        }

        print("[DecisionEngine] Final decision payload constructed.")
        return result

