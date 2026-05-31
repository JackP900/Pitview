from flask import Blueprint, jsonify
from database.recorder import get_session_reading, get_all_sessions

session = Blueprint("session", __name__)

@session.route("/sessions")
def id_data():
    return jsonify(get_all_sessions())

@session.route("/sessions/<int:id>/readings")
def readings_data(id):
    return jsonify(get_session_reading(id))


