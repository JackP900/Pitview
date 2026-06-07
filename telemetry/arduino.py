from serial import Serial
import time

def arduino():
    port = Serial("/dev/cu.usbmodem1401", 9600)
    while True:
        data = port.readline().decode("utf-8").strip("\r\n")
        split_data = data.split(",")

        steering = int(split_data[0]) / 1023 * 2 - 1
        throttle = int(split_data[1]) / 1023
        brake = int(split_data[2]) / 1023

        inputs = {
            "throttle": throttle,
            "brake": brake,
            "steering": steering,
            "timestamp": time.time()
        }

        yield inputs

