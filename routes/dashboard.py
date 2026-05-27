from telemetry.source import get_reading
from flask import Blueprint, Response
import json
import time


def stream():
    while True:
        reading = get_reading()
        json_string = json.dumps(reading)
        yield "data: " + json_string + "\n\n"
        time.sleep(0.1)


dashboard = Blueprint("dashboard", __name__)
@dashboard.route("/stream")
def response():
    return Response(stream(), mimetype="text/event-stream")




