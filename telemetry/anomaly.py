threshold = 0.3

def detect_anomaly(reading):
    if reading["throttle"] >= threshold and reading["brake"] >= threshold:
        return True
    else:
        return False