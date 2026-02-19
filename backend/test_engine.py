import json
import os
import sys

import numpy as np

# Allow backend to see project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.engine.decision_engine import DecisionEngine


def main() -> None:
    print("[test_engine] Starting DecisionEngine smoke test.")

    # Instantiate engine (will log model loading details)
    engine = DecisionEngine()

    # Infer feature dimension from first ensemble member
    first_model = engine.models[0]
    n_features = getattr(first_model, "n_features_in_", None)
    if n_features is None:
        raise RuntimeError(
            "Cannot infer n_features_in_ from the first ensemble model. "
            "Ensure models were trained with scikit-learn-compatible estimators."
        )

    X_sample = np.zeros((1, n_features), dtype=float)
    print(f"[test_engine] Created dummy feature vector with shape: {X_sample.shape}")

    # Run full evaluation
    print("[test_engine] Evaluating sample transaction...")
    result = engine.evaluate_transaction(X_sample)

    print("[test_engine] Final JSON output:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
