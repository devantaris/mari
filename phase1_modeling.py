import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    precision_recall_curve,
    roc_auc_score
)

# ====================================
# Phase 1 – Baseline Logistic Model
# ====================================

# 1️⃣ Load cleaned dataset
df = pd.read_csv("creditcard_phase0_clean.csv")

# 2️⃣ Log-transform skewed feature
df["Amount"] = np.log1p(df["Amount"])

# 3️⃣ Split features / target
X = df.drop(columns=["Class"])
y = df["Class"]

# 4️⃣ Stratified split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 5️⃣ Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 6️⃣ Train baseline model
model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

model.fit(X_train_scaled, y_train)

# 7️⃣ Predict probabilities
y_prob = model.predict_proba(X_test_scaled)[:, 1]
y_pred_default = (y_prob >= 0.5).astype(int)

# 8️⃣ Baseline evaluation
print("===== BASELINE (Threshold = 0.5) =====")
print("ROC-AUC:", roc_auc_score(y_test, y_prob))
print(classification_report(y_test, y_pred_default))

high_risk = y_prob >= 0.8
medium_risk = (y_prob >= 0.3) & (y_prob < 0.8)
low_risk = y_prob < 0.3

print("\n===== Tier Analysis =====")

print("\nHigh Risk (>=0.8)")
print("Count:", high_risk.sum())
print("Fraud in High Risk:", y_test[high_risk].sum())

print("\nMedium Risk (0.3–0.8)")
print("Count:", medium_risk.sum())
print("Fraud in Medium Risk:", y_test[medium_risk].sum())

print("\nLow Risk (<0.3)")
print("Count:", low_risk.sum())
print("Fraud in Low Risk:", y_test[low_risk].sum())


# ====================================
# 📊 Precision-Recall Curve
# ====================================

precision, recall, thresholds = precision_recall_curve(y_test, y_prob)

plt.figure(figsize=(8,6))
plt.plot(recall, precision)
plt.xlabel("Recall")
plt.ylabel("Precision")
plt.title("Precision-Recall Curve")
plt.grid(True)
plt.show()

# ====================================
# 📊 Probability Distribution
# ====================================

plt.figure(figsize=(8,5))
sns.histplot(y_prob[y_test == 0], bins=50, label="Legit", stat="density", element="step")
sns.histplot(y_prob[y_test == 1], bins=50, label="Fraud", stat="density", element="step")
plt.legend()
plt.title("Predicted Probability Distribution")
plt.show()
