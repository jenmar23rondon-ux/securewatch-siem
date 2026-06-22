from fastapi import FastAPI

from app.services.analyzer import analyze_event, model_status, train_model
from app.utils.schemas import EventInput, TrainingRequest, TrainingStatus, RiskResult

app = FastAPI(title="SecureWatch Analyzer", version="1.0.0")


@app.get("/")
def health():
    return {"name": "SecureWatch Analyzer", "status": "ok"}


@app.post("/analyze", response_model=RiskResult)
def analyze(event: EventInput):
    return analyze_event(event)


@app.get("/model/status", response_model=TrainingStatus)
def status():
    return model_status()


@app.post("/train", response_model=TrainingStatus)
def train(request: TrainingRequest):
    return train_model(request.samples)
