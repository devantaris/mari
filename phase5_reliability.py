import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier

# ==========================================
# Phase 5 – Reliability & Calibration Check
# ==========================================

# 1️⃣ Load Data
df = pd.read_csv("creditcard_phase0_clean.csv")
df["Amount"] = np.log1p(df["Amount"])

X = df.drop(columns=["Class"])
y = df["Class"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

scale_pos_weight = (len(y_train) - y_train.sum()) / y_train.sum()

# ------------------------------------------
# 2️⃣ Train RAW XGBoost
# ------------------------------------------

raw_model = XGBClassifier(
    n_estimators=300,
    max_depth=4,
    learning_rate=0.05,
    scale_pos_weight=scale_pos_weight,
    eval_metric="logloss",
    random_state=42,
    tree_method="hist",
    device="cuda"
)

raw_model.fit(X_train, y_train)

raw_probs = raw_model.predict_proba(X_test)[:, 1]

# ------------------------------------------
# 3️⃣ Train CALIBRATED XGBoost
# ------------------------------------------

calibrated_model = CalibratedClassifierCV(
    raw_model,
    method="isotonic",
    cv=3
)

calibrated_model.fit(X_train, y_train)

cal_probs = calibrated_model.predict_proba(X_test)[:, 1]

# ------------------------------------------
# 4️⃣ Compute Brier Scores
# ------------------------------------------

raw_brier = brier_score_loss(y_test, raw_probs)
cal_brier = brier_score_loss(y_test, cal_probs)

print("\n===== BRIER SCORE =====")
print("Raw Model Brier Score:", raw_brier)
print("Calibrated Model Brier Score:", cal_brier)

# ------------------------------------------
# 5️⃣ Reliability Curve
# ------------------------------------------

raw_frac_pos, raw_mean_pred = calibration_curve(
    y_test, raw_probs, n_bins=10
)

cal_frac_pos, cal_mean_pred = calibration_curve(
    y_test, cal_probs, n_bins=10
)

plt.figure(figsize=(8, 6))

plt.plot(raw_mean_pred, raw_frac_pos, "s-", label="Raw Model")
plt.plot(cal_mean_pred, cal_frac_pos, "o-", label="Calibrated Model")
plt.plot([0, 1], [0, 1], "k--", label="Perfect Calibration")

plt.xlabel("Mean Predicted Probability")
plt.ylabel("Fraction of Positives")
plt.title("Reliability Curve")
plt.legend()
plt.show()

