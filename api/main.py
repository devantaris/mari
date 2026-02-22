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
# ALLOWED_ORIGINS: comma-separated exact origins from Railway env var.
# allow_origin_regex always permits any *.vercel.app URL (production + preview)
# and localhost for local development.
_raw = os.environ.get("ALLOWED_ORIGINS", "")
_explicit = [o.strip() for o in _raw.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_explicit,
    allow_origin_regex=(
        r"https://[a-zA-Z0-9\-]+\.vercel\.app"
        r"|https?://localhost(:\d+)?"
        r"|https?://127\.0\.0\.1(:\d+)?"
    ),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Engine (loaded once at startup) ───────────────────────────────────────
engine = DecisionEngine()


# ── Models ────────────────────────────────────────────────────────────────
class TransactionInput(BaseModel):
    features: list[float]  # must be length 31


# ── Endpoints ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Fraud Decision API is running"}


@app.get("/health")
def health():
    """Health check endpoint used by Railway and the Glass Lens status indicator."""
    return {"status": "ok", "model": "xgb_ensemble_v2"}


@app.post("/predict")
def predict(txn: TransactionInput):
    if len(txn.features) != 31:
        return {"error": "Expected 31 features"}

    features = np.array(txn.features).reshape(1, -1)
    result = engine.evaluate_transaction(features)
    return result