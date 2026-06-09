def detect(request_count: int) -> tuple[int, list[str]]:
    if request_count >= 100:
        return 88, ["High request volume detected"]
    if request_count >= 50:
        return 55, ["Elevated request volume"]
    return 0, []
