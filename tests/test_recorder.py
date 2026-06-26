from database.models import init_db
from database import recorder


def test_record_and_read_back(tmp_path, monkeypatch):
    # Run in a temp dir so we use a throwaway pitview.db, not the real one.
    monkeypatch.chdir(tmp_path)
    init_db()

    recorder.start_session("test run")
    sessions = recorder.get_all_sessions()
    assert len(sessions) == 1
    session_id = sessions[0]["id"]

    recorder.record_reading(
        {"throttle": 0.5, "brake": 0.2, "steering": 0.9, "timestamp": 123.0}
    )
    recorder.stop_session()

    rows = recorder.get_session_reading(session_id)
    assert len(rows) == 1
    assert rows[0]["throttle"] == 0.5
    assert rows[0]["brake"] == 0.2
    assert rows[0]["steering"] == 0.9


def test_no_reading_recorded_when_stopped(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    init_db()

    recorder.stop_session()  # ensure not recording
    recorder.record_reading(
        {"throttle": 0.5, "brake": 0.5, "steering": 0.5, "timestamp": 1.0}
    )
    assert recorder.get_all_sessions() == []
