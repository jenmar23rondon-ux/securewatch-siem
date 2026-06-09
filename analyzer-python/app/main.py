from fastapi import FastAPI

from app.services.analyzer import analyze_event
from app.utils.schemas import EventInput, RiskResult

app = FastAPI(title="SecureWatch Analyzer", version="1.0.0")


@app.get("/")
def health():
    return {"name": "SecureWatch Analyzer", "status": "ok"}


@app.post("/analyze", response_model=RiskResult)
def analyze(event: EventInput):
    return analyze_event(event)
