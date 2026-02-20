from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import sys
import os

# Make backend importable
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from backend.engine.decision_engine import DecisionEngine

app = FastAPI(title="Risk-Aware Fraud Decision API")

# Load engine once (startup load)
engine = DecisionEngine()

class TransactionInput(BaseModel):
    features: list[float]  # must be length 31

@app.get("/")
def root():
    return {"message": "Fraud Decision API is running"}

@app.post("/predict")
def predict(txn: TransactionInput):
    if len(txn.features) != 31:
        return {"error": "Expected 31 features"}

    features = np.array(txn.features).reshape(1, -1)
    result = engine.evaluate_transaction(features)
    return result