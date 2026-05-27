import random
import time

class Simulator:
    def __init__(self, step_size=0.05):
        self.throttle = 0.2
        self.brake = 0.0
        self.steering = 0.0
        self.step_size = step_size

    def _step(self, value, min_val, max_val):
        random_value = random.uniform(-self.step_size, self.step_size)
        new_value = value + random_value
        new_value = min(max(new_value, min_val), max_val)
        return new_value

    def get_reading(self):
        self.throttle = self._step(self.throttle, 0.0, 1.0)
        self.brake = self._step(self.brake, 0.0, 1.0)
        self.steering = self._step(self.steering, -1.0, 1.0)

        inputs = {
            "throttle": self.throttle,
            "brake": self.brake,
            "steering": self.steering,
            "timestamp": time.time()
        }

        return inputs

       



