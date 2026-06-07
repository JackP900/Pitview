# PitView
 
A real-time motorsport telemetry dashboard. PitView reads live input from an Arduino Uno — brake pressure, throttle position, and steering angle — and streams it to a browser dashboard as it happens. Sessions can be recorded and replayed, and an anomaly detector flags brake/throttle conflicts in real time.
 
**[Watch the demo →](https://youtu.be/rHIyymJQ_-8)**
 
---
 
## Features
 
- **Live telemetry** — brake, throttle, and steering charted in real time via Server-Sent Events
- **Arduino input** — reads analog sensors over USB serial, normalized to usable ranges
- **Session recording** — capture a run to SQLite and replay it at any time
- **Anomaly detection** — flags simultaneous full brake and full throttle (a driving conflict that shouldn't happen)
- **Auth-gated** — simple login wall so the dashboard isn't open to anyone on the network
## Tech Stack
 
| Layer | Technology |
|---|---|
| Backend | Python / Flask |
| Database | SQLite |
| Frontend | Chart.js, Server-Sent Events |
| Hardware | Arduino Uno (analog sensors over USB serial) |
 
## Hardware Setup
 
The Arduino reads three analog sensors and sends them as a comma-separated line over serial at 9600 baud:
 
```
<steering>,<throttle>,<brake>
```
 
Each value is a raw 10-bit analog read (0–1023). PitView expects the Arduino to be on `/dev/cu.usbmodem1401` — update `telemetry/arduino.py` if your port differs.
 
## Getting Started
 
**Requirements:** Python 3, pip, an Arduino running the matching sketch.
 
```bash
pip install -r requirements.txt
python app.py
```
 
Open `http://localhost:5000`. You'll be redirected to the login page. Credentials are set in `config.py`.
 
## Project Structure
 
```
telemetry/
  arduino.py      # Reads live data from the Arduino over serial
  simulator.py    # Random-walk simulator for testing without hardware
  source.py       # Single swap point — change data source here only
  anomaly.py      # Brake/throttle conflict detection
database/
  models.py       # DB init (sessions + readings tables)
  recorder.py     # Start/stop recording, write readings
routes/
  dashboard.py    # SSE stream, start/stop recording endpoints
  session.py      # Session list and replay data endpoints
  auth.py         # Login / logout
static/js/
  dashboard.js    # Live chart rendering, SSE client
  replay.js       # Session replay with setInterval playback
```
 
## Design Notes
 
**Swappable data source** — everything that needs telemetry imports from `source.py`. Switching between the Arduino and the simulator means changing one file, nothing else.
 
**Server-Sent Events over WebSockets** — data only flows one direction (server → browser), so SSE is the simpler fit. No extra libraries, no handshake overhead.
 
**Buffer flushing on every read** — the serial buffer is flushed before each `readline()` so the dashboard always reflects the current sensor state, not data that accumulated while the server was busy.