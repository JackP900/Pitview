import time
import math
import random


def Simulator():
    t = 0.0
    while True:
        steering = 0.5 + 0.45 * math.sin(t * 0.8)

        phase = math.sin(t * 0.5)
        if phase > 0:
            throttle = phase + random.uniform(-0.05, 0.05)
            brake = random.uniform(0.0, 0.04)
        else:
            throttle = random.uniform(0.0, 0.04)
            brake = -phase + random.uniform(-0.05, 0.05)

        if random.random() < 0.01:
            throttle, brake = 0.9, 0.9

        yield {
            "throttle": round(min(1.0, max(0.0, throttle)), 3),
            "brake": round(min(1.0, max(0.0, brake)), 3),
            "steering": round(min(1.0, max(0.0, steering)), 3),
            "timestamp": time.time(),
        }

        t += 0.05
        time.sleep(0.02)  
