import os
import shutil
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

# Define paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

PAPER_REPO = "C:/Users/Devansh/Desktop/Projects/Knowing-When-Not-to-Decide"
V2_ART_DIR = os.path.join(PAPER_REPO, "v2_playground/artifacts")
V3_ART_DIR = os.path.join(PAPER_REPO, "v3_playground/experiment_01_ds_full_routing/artifacts")

def copy_models():
    print("[prepare_artifacts] Copying models from paper repository...")
    
    # V2 SVM & Scaler
    src_v2_svm = os.path.join(V2_ART_DIR, "svm_calibrated_final.pkl")
    src_v2_scaler = os.path.join(V2_ART_DIR, "svm_scaler_final.pkl")
    
    dest_v2_svm = os.path.join(ARTIFACTS_DIR, "svm_calibrated_final.pkl")
    dest_v2_scaler = os.path.join(ARTIFACTS_DIR, "svm_scaler_final.pkl")
    
    shutil.copy(src_v2_svm, dest_v2_svm)
    shutil.copy(src_v2_scaler, dest_v2_scaler)
    print("  Copied V2 SVM and Scaler.")
    
    # V3 SVM & Scaler
    src_v3_svm = os.path.join(V3_ART_DIR, "v3_svm_calibrated.pkl")
    src_v3_scaler = os.path.join(V3_ART_DIR, "v3_svm_scaler.pkl")
    
    dest_v3_svm = os.path.join(ARTIFACTS_DIR, "v3_svm_calibrated.pkl")
    dest_v3_scaler = os.path.join(ARTIFACTS_DIR, "v3_svm_scaler.pkl")
    
    shutil.copy(src_v3_svm, dest_v3_svm)
    shutil.copy(src_v3_scaler, dest_v3_scaler)
    print("  Copied V3 SVM and Scaler.")

def train_shap_model():
    print("[prepare_artifacts] Training SHAP-compatible raw XGBoost model...")
    csv_path = os.path.join(PROJECT_ROOT, "creditcard_phase0_clean.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Clean CSV not found at {csv_path}")
        
    df = pd.read_csv(csv_path)
    df["Amount"] = np.log1p(df["Amount"])
    
    X = df.drop(columns=["Class"])
    y = df["Class"]
    
    X_train, _, y_train, _ = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scale_pos_weight = (len(y_train) - y_train.sum()) / y_train.sum()
    
    shap_model = XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        scale_pos_weight=scale_pos_weight, eval_metric="logloss",
        random_state=42, tree_method="hist", device="cpu"
    )
    shap_model.fit(X_train, y_train)
    
    out_path = os.path.join(ARTIFACTS_DIR, "xgb_raw_shap.pkl")
    joblib.dump(shap_model, out_path)
    print(f"  SHAP raw model saved to {out_path}")

if __name__ == "__main__":
    copy_models()
    train_shap_model()
    print("[prepare_artifacts] All artifacts prepared successfully.")
