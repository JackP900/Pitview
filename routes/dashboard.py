from telemetry.source import get_reading
from flask import Blueprint, Response, render_template
from database.recorder import start_session, stop_session, record_reading
from telemetry.anomaly import detect_anomaly
import json
import time


def stream():
    while True:
        reading = get_reading()
        reading["anomaly"] = detect_anomaly(reading)
        record_reading(reading)
        json_string = json.dumps(reading)
        yield "data: " + json_string + "\n\n"

dashboard = Blueprint("dashboard", __name__)
@dashboard.route("/stream")
def response():
    return Response(stream(), mimetype="text/event-stream")

@dashboard.route("/")
def render():
    return render_template("dashboard.html")

@dashboard.route("/start", methods=["POST"])
def start():
    start_session()
    return "ok"

@dashboard.route("/stop", methods=["POST"])
def stop():
    stop_session()
    return "ok"








