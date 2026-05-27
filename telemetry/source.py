from telemetry.simulator import Simulator
_source = Simulator()
def get_reading():
    return _source.get_reading()