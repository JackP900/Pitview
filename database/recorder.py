import sqlite3
import time

_current_session_id = None
_recording = False

def start_session():
    global _recording, _current_session_id
    _recording = True

    connection = sqlite3.connect("pitview.db")
    cursor = connection.cursor()

    cursor.execute("INSERT INTO sessions (created_at) VALUES (?)", (time.time(),))

    _current_session_id = cursor.lastrowid
    connection.commit()
    connection.close()


def record_reading(readings):
    if _recording == True:
        connection = sqlite3.connect("pitview.db")
        cursor = connection.cursor()
        cursor.execute("INSERT INTO readings (session_id, throttle, brake, steering, timestamp) VALUES (?, ?, ?, ?, ?)", (_current_session_id, readings["throttle"], readings["brake"], readings["steering"], readings["timestamp"]))
        connection.commit()
        connection.close()


def stop_session():
    global _current_session_id, _recording
    _recording = False
    _current_session_id = None