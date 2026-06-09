from serial import Serial
import time
import json

def arduino():
    with open("settings.json") as f:
        data = json.load(f)

    port = Serial(data["port"], data["baud"])
    port.reset_input_buffer()
    while True:
        data = port.readline().decode("utf-8").strip("\r\n")

        try:
            split_data = data.split(",")
            steering = int(split_data[0]) / 1023 
            throttle = int(split_data[1]) / 1023
            brake = int(split_data[2]) / 1023
        except (ValueError, IndexError):
            continue

        inputs = {
            "throttle": throttle,
            "brake": brake,
            "steering": steering,
            "timestamp": time.time()
        }

        yield inputs

