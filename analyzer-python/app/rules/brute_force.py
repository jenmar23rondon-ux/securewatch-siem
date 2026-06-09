def detect(failed_attempts: int) -> tuple[int, list[str]]:
    if failed_attempts >= 10:
        return 95, ["10 or more failed login attempts"]
    if failed_attempts >= 5:
        return 60, ["Multiple failed login attempts"]
    return 0, []
