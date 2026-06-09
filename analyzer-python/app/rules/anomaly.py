def detect(unique_ports: int) -> tuple[int, list[str]]:
    if unique_ports >= 20:
        return 75, ["Many different destination ports detected"]
    return 0, []
