from app.rules import anomaly, brute_force, ddos, sql_injection
from app.utils.schemas import EventInput, RiskResult


def analyze_event(event: EventInput) -> RiskResult:
    checks = [
        sql_injection.detect(event.payload),
        brute_force.detect(event.failedAttempts),
        ddos.detect(event.requestCount),
        anomaly.detect(event.uniquePorts),
    ]

    score = max(item[0] for item in checks)
    reasons: list[str] = []
    for _, found in checks:
        reasons.extend(found)

    if score >= 90:
        risk = "critical"
    elif score >= 75:
        risk = "high"
    elif score >= 50:
        risk = "medium"
    else:
        risk = "low"

    return RiskResult(risk=risk, score=score, reasons=reasons)
