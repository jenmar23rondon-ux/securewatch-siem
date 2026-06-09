from app.rules import anomaly, brute_force, ddos, sql_injection
from app.utils.schemas import EventInput, RiskResult
import numpy as np
from sklearn.ensemble import IsolationForest


HISTORICAL_BASELINE = np.array([
    [0, 3, 0, 0],
    [1, 5, 1, 0],
    [0, 12, 0, 0],
    [2, 20, 1, 0],
    [0, 2, 0, 0],
    [1, 8, 0, 0],
    [3, 30, 2, 0],
    [0, 15, 0, 0],
    [2, 25, 3, 0],
    [1, 10, 1, 0],
])


def payload_risk(payload: str | None) -> int:
    if not payload:
        return 0
    normalized = payload.lower()
    patterns = ["' or 1=1", "union select", "drop table", "--", "sleep("]
    return 1 if any(pattern in normalized for pattern in patterns) else 0


def isolation_forest_score(event: EventInput) -> tuple[int, list[str]]:
    vector = np.array([[event.failedAttempts, event.requestCount, event.uniquePorts, payload_risk(event.payload)]])
    model = IsolationForest(contamination=0.15, random_state=42)
    model.fit(HISTORICAL_BASELINE)
    prediction = model.predict(vector)[0]
    raw_score = model.decision_function(vector)[0]

    if prediction == -1:
      score = min(99, max(80, int(85 + abs(raw_score) * 100)))
      return score, ["IsolationForest detected anomalous behavior"]

    return 0, []


def analyze_event(event: EventInput) -> RiskResult:
    checks = [
        sql_injection.detect(event.payload),
        brute_force.detect(event.failedAttempts),
        ddos.detect(event.requestCount),
        anomaly.detect(event.uniquePorts),
    ]

    ml_score, ml_reasons = isolation_forest_score(event)
    score = max(max(item[0] for item in checks), ml_score)
    reasons: list[str] = []
    for _, found in checks:
        reasons.extend(found)
    reasons.extend(ml_reasons)

    if score >= 90:
        risk = "critical"
    elif score >= 75:
        risk = "high"
    elif score >= 50:
        risk = "medium"
    else:
        risk = "low"

    return RiskResult(risk=risk, score=score, reasons=reasons, model="securewatch-isolationforest-v1")
