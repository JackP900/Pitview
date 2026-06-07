from telemetry.arduino import arduino
reading = arduino()
def get_reading():
    return next(reading)
