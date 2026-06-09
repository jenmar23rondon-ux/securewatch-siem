from pydantic import BaseModel


class EventInput(BaseModel):
    type: str
    ip: str
    payload: str | None = None
    failedAttempts: int = 0
    requestCount: int = 0
    uniquePorts: int = 0


class RiskResult(BaseModel):
    risk: str
    score: int
    reasons: list[str]
    model: str = "securewatch-rules-v1"
