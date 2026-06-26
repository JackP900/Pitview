from serial import Serial
import time
import json


def parse_reading(line):
    """Parse one CSV serial line into a normalised reading dict.

    Expects "<steering>,<throttle>,<brake>" with each value 0-1023.
    Returns a dict with values scaled to 0.0-1.0, or None if the
    line is malformed (wrong field count or non-numeric).
    """
    try:
        parts = line.split(",")
        steering = int(parts[0]) / 1023
        throttle = int(parts[1]) / 1023
        brake = int(parts[2]) / 1023
    except (ValueError, IndexError):
        return None

    return {"throttle": throttle, "brake": brake, "steering": steering}


def arduino():
    with open("settings.json") as f:
        data = json.load(f)

    port = Serial(data["port"], data["baud"])
    port.reset_input_buffer()
    while True:
        line = port.readline().decode("utf-8").strip("\r\n")

        reading = parse_reading(line)
        if reading is None:
            continue

        reading["timestamp"] = time.time()
        yield reading
