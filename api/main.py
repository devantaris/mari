from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import sys
import os

# Make backend importable
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from backend.engine.decision_engine import DecisionEngine

app = FastAPI(title="Risk-Aware Fraud Decision API")

# ── CORS ──────────────────────────────────────────────────────────────────
# Public research/demo API — allow all origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Engine (loaded once at startup) ───────────────────────────────────────
engine = DecisionEngine()


class TransactionInput(BaseModel):
    features: list[float]  # must be length 31


@app.get("/")
def root():
    return {"message": "Fraud Decision API is running"}


@app.get("/health")
def health(version: str = "V4"):
    return {"status": "ok", "model": f"xgb_ensemble_{version.lower()}"}


@app.post("/predict")
def predict(txn: TransactionInput, version: str = "V4"):
    if len(txn.features) != 31:
        return {"error": "Expected 31 features"}
    features = np.array(txn.features).reshape(1, -1)
    return engine.evaluate_transaction(features, version=version)