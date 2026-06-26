from telemetry.anomaly import detect_anomaly


def test_both_full_is_anomaly():
    assert detect_anomaly({"throttle": 1.0, "brake": 1.0}) is True


def test_only_throttle_is_not_anomaly():
    assert detect_anomaly({"throttle": 1.0, "brake": 0.0}) is False


def test_only_brake_is_not_anomaly():
    assert detect_anomaly({"throttle": 0.0, "brake": 1.0}) is False


def test_exactly_at_threshold_is_anomaly():
    assert detect_anomaly({"throttle": 0.8, "brake": 0.8}) is True


def test_just_below_threshold_is_not_anomaly():
    assert detect_anomaly({"throttle": 0.79, "brake": 0.79}) is False
