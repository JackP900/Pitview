from telemetry.arduino import parse_reading


def test_valid_line_scales_to_0_1():
    r = parse_reading("1023,512,0")
    assert r["steering"] == 1.0
    assert r["throttle"] == 512 / 1023
    assert r["brake"] == 0.0


def test_full_range():
    r = parse_reading("1023,1023,1023")
    assert r == {"steering": 1.0, "throttle": 1.0, "brake": 1.0}


def test_all_zero():
    r = parse_reading("0,0,0")
    assert r == {"steering": 0.0, "throttle": 0.0, "brake": 0.0}


def test_too_few_fields_returns_none():
    assert parse_reading("512,256") is None


def test_non_numeric_returns_none():
    assert parse_reading("a,b,c") is None


def test_empty_line_returns_none():
    assert parse_reading("") is None
