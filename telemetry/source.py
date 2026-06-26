import os

# Pick the telemetry source. Set PITVIEW_SOURCE=simulator to run without
# an Arduino (e.g. for the live demo); defaults to the real hardware.
_source = os.environ.get("PITVIEW_SOURCE", "arduino").lower()

if _source == "simulator":
    from telemetry.simulator import Simulator
    _reading = Simulator()
else:
    from telemetry.arduino import arduino
    _reading = arduino()


def get_reading():
    return next(_reading)
