import random

class Simulator:
    def __init__(self, step_size=0.05):
        self.throttle = 0.2
        self.brake = 0.0
        self.steering = 0.0
        self.step_size = step_size

    def _step(self, value):
        random_value = random.uniform(-self.step_size, self.step_size)
        new_value = value + random_value
        return new_value
