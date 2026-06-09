def detect(payload: str | None) -> tuple[int, list[str]]:
    if not payload:
        return 0, []

    normalized = payload.lower()
    patterns = ["' or 1=1", '" or "1"="1', "union select", "drop table"]
    if any(pattern in normalized for pattern in patterns):
        return 85, ["SQL injection pattern found in payload"]

    return 0, []
