PitView
Video Demo: <[URL HERE](https://youtu.be/rHIyymJQ_-8)>
Description:
A telemetry dashboard built for CS50. It tracks brake, throttle, and steering inputs in real time, records sessions to a SQLite database, and lets you play them back afterwards.
What it does
The dashboard shows three live charts — brake, throttle, and steering — updated ten times a second via a simulated data engine. You can start recording, drive around (or let the simulator run), stop, then replay the session from the replay page. If brake and throttle both exceed 0.8 at the same time, a warning appears on the dashboard. There's a login page. Nothing else loads without credentials.
Stack

Python + Flask
SQLite
Chart.js
Server-Sent Events for pushing data to the browser

Running it
pip install -r requirements.txt
python app.py
Open http://localhost:5000. You'll land on the login page. Credentials are in config.py — the password is stored as a hash, not plain text.
Project structure
pitview/
├── app.py                  # Flask app, blueprints, login guard
├── config.py               # Secret key, credentials
├── telemetry/
│   ├── simulator.py        # Random walk data engine
│   ├── source.py           # Single interface for telemetry data
│   └── anomaly.py          # Brake + throttle spike detection
├── database/
│   ├── models.py           # Table creation
│   └── recorder.py         # Session recording and retrieval
├── routes/
│   ├── dashboard.py        # SSE stream, start/stop recording
│   ├── sessions.py         # Session list, replay data, replay page
│   └── auth.py             # Login, logout
├── templates/
│   ├── base.html
│   ├── dashboard.html
│   ├── replay.html
│   └── login.html
└── static/
    └── js/
        ├── dashboard.js    # Live chart updates via EventSource
        └── replay.js       # Replay with play/stop controls
Design decisions
SSE instead of WebSockets. Data only flows one way here — server to browser. SSE does that over a plain HTTP connection with no extra libraries.
Telemetry abstraction in source.py. The dashboard, recorder, and anomaly detector all call one function: get_reading(). They don't know whether the data comes from the simulator or hardware. Adding Arduino support later means writing one new file, not touching the rest of the app.
Simulator uses a random walk, not pure random. Random values produce charts that look like static. The simulator nudges each value slightly from where it was, then clamps to range. The charts end up looking like actual inputs.
Single-user auth with a hardcoded hash. Credentials live in config.py. The password is hashed with pbkdf2:sha256 via Werkzeug. A before_request function in app.py catches unauthenticated requests before they reach any route.
Optional hardware
The app is designed to work with an Arduino Uno and three potentiometers for real sensor input. The abstraction in source.py means an arduino.py reader can be added without changing anything else in the codebase.