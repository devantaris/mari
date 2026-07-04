import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# Load raw and clean datasets
df_raw = pd.read_csv("creditcard.csv")
df_clean = pd.read_csv("creditcard_phase0_clean.csv")

# Find delta_time from clean df
# Note: clean df was sorted by Time in phase0_cleaning.py
df_raw_sorted = df_raw.sort_values("Time").reset_index(drop=True)

# Split identically to phase1/run_full_pipeline
X_raw = df_raw_sorted.drop(columns=["Class"])
y_raw = df_raw_sorted["Class"]

_, X_test_raw, _, y_test_raw = train_test_split(
    X_raw, y_raw, test_size=0.2, random_state=42, stratify=y_raw
)

# Load V4 decisions
v4_table = pd.read_csv("C:/Users/Devansh/Desktop/Projects/Knowing-When-Not-to-Decide/v4_playground/results/v4_full_decision_table.csv")

# Add delta_time to raw test set
# Let's extract delta_time from df_clean which corresponds row-by-row to df_raw_sorted
df_clean_features = df_clean.drop(columns=["Class"])
_, X_test_clean, _, _ = train_test_split(
    df_clean_features, y_raw, test_size=0.2, random_state=42, stratify=y_raw
)

# Find representative indices in v4_table
# 1. APPROVE
idx_approve = v4_table[v4_table["v4_decision"] == "APPROVE"].head(3)["test_idx"].tolist()
# 2. DECLINE
idx_decline = v4_table[v4_table["v4_decision"] == "DECLINE"].head(3)["test_idx"].tolist()
# 3. STEP_UP
idx_step_up = v4_table[v4_table["v4_decision"] == "STEP_UP"].head(3)["test_idx"].tolist()
# 4. PEND (from ABSTAIN)
idx_pend_abstain = v4_table[(v4_table["v4_decision"] == "PEND") & (v4_table["pend_origin"] == "ABSTAIN")].head(3)["test_idx"].tolist()
# 5. PEND (from HUMAN_ESCALATE)
idx_pend_he = v4_table[(v4_table["v4_decision"] == "PEND") & (v4_table["pend_origin"] == "HUMAN_ESCALATE")].head(3)["test_idx"].tolist()

categories = {
    "APPROVE": idx_approve,
    "DECLINE": idx_decline,
    "STEP_UP": idx_step_up,
    "PEND (ABSTAIN)": idx_pend_abstain,
    "PEND (HUMAN_ESCALATE)": idx_pend_he
}

print("Found representative transactions:")
for cat, idxs in categories.items():
    print(f"\nCategory: {cat}")
    for idx in idxs:
        row_raw = X_test_raw.iloc[idx]
        row_clean = X_test_clean.iloc[idx]
        
        time_val = float(row_raw["Time"])
        amount_val = float(row_raw["Amount"])
        delta_time_val = float(row_clean["delta_time"])
        pca_vals = [float(row_raw[f"V{i}"]) for i in range(1, 29)]
        
        # Format as Javascript array: [Time, V1..V28, Amount, delta_time]
        js_features = [time_val] + pca_vals + [amount_val, delta_time_val]
        print(f"  Test Index {idx}:")
        print(f"    Features: {js_features}")
        print(f"    Expected Decision Info: {v4_table.iloc[idx].to_dict()}")
