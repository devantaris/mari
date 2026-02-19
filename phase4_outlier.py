import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest

# ==========================================
# Phase 4 – Isolation Forest (Novelty Layer)
# ==========================================

# 1️⃣ Load data
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

# ------------------------------------------
# 2️⃣ Train ONLY on Legitimate Transactions
# ------------------------------------------

X_train_legit = X_train[y_train == 0]

iso = IsolationForest(
    n_estimators=200,
    contamination=0.001,  # approx fraud rate
    random_state=42,
    n_jobs=-1
)

iso.fit(X_train_legit)

# ------------------------------------------
# 3️⃣ Compute Anomaly Scores
# ------------------------------------------

# decision_function → higher = more normal
anomaly_score = iso.decision_function(X_test)

# Convert so higher = more anomalous
anomaly_score = -anomaly_score

results = pd.DataFrame({
    "anomaly_score": anomaly_score,
    "true_label": y_test.values
})

# ------------------------------------------
# 4️⃣ Compare Fraud vs Legit Scores
# ------------------------------------------

fraud_scores = results[results["true_label"] == 1]["anomaly_score"]
legit_scores = results[results["true_label"] == 0]["anomaly_score"]

print("\n===== Anomaly Score Stats =====")
print("Fraud Mean:", fraud_scores.mean())
print("Legit Mean:", legit_scores.mean())

print("\nFraud Std:", fraud_scores.std())
print("Legit Std:", legit_scores.std())

# ------------------------------------------
# 5️⃣ Visual Comparison
# ------------------------------------------

plt.hist(legit_scores, bins=50, alpha=0.6, label="Legit")
plt.hist(fraud_scores, bins=50, alpha=0.6, label="Fraud")
plt.legend()
plt.title("Isolation Forest Anomaly Score Distribution")
plt.show()

# ------------------------------------------
# 6️⃣ Simple Separation Check
# ------------------------------------------

threshold = np.percentile(legit_scores, 99.9)

predicted_anomaly = anomaly_score > threshold

detected_fraud = sum(predicted_anomaly & (y_test.values == 1))
total_fraud = sum(y_test.values == 1)

print("\n===== Simple Anomaly Detection Test =====")
print("Fraud detected via anomaly threshold:", detected_fraud)
print("Total fraud:", total_fraud)
print("Detection rate:", detected_fraud / total_fraud)

anomaly_threshold = np.percentile(legit_scores, 99)

print("Anomaly Threshold (99th percentile legit):", anomaly_threshold)



import joblib
import os

os.makedirs("artifacts", exist_ok=True)
joblib.dump(iso, "artifacts/isolation_forest.pkl")

print("Isolation Forest saved successfully.")
