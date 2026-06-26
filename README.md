# PitView

![Tests](https://github.com/JackP900/Pitview/actions/workflows/tests.yml/badge.svg)
 
A real-time motorsport telemetry dashboard. PitView reads live input from an Arduino Uno, brake pressure, throttle position, and steering angle and streams it to a browser dashboard as it happens. You can record a session and replay it later, and an anomaly detector flags brake/throttle conflicts while you drive.
 
**[Watch the demo →](https://youtu.be/rHIyymJQ_-8)**
 
---
 
## Features
 
- **Live telemetry** — brake, throttle, and steering charted in real time over Server-Sent Events
- **Mixed sensor input** — a hall sensor, a magnetic encoder, and a load cell, all read over USB serial and scaled to a common range
- **Session recording** — capture a run to SQLite and replay it whenever you want
- **Anomaly detection** — flags full brake and full throttle at the same time, a conflict that shouldn't happen mid-corner
- **Auth-gated** — a login wall so the dashboard isn't open to everyone on the network
## Tech Stack
 
| Layer | Technology |
|---|---|
| Backend | Python / Flask |
| Database | SQLite |
| Frontend | Chart.js, Server-Sent Events |
| Hardware | Arduino Uno (hall sensor, AS5600 encoder, load cell + HX711) |

## Performance

- **Latency:** ~1–8 ms from sensor read to browser, measured live over Server-Sent Events
- **Throughput:** ~476 readings/sec sustained end-to-end, up roughly 3x from ~162, after removing a fixed serial-loop delay and raising the baud rate from 115200 to 250000
- **Responsive under load:** the chart render loop runs on a fixed ~30 fps timer, decoupled from the ingest rate, so the dashboard stays smooth even when readings arrive faster than it can draw
 
## Hardware Setup
 
PitView reads three sensors off an Arduino Uno. They're three different sensor types, but the sketch scales each one to a 0–1023 range before sending, so the serial format stays simple and uniform:
 
```
<steering>,<throttle>,<brake>
```
 
That's one comma-separated line per loop, sent over USB serial at **250000 baud**.
 
| Axis | Sensor | Wiring |
|---|---|---|
| Throttle | Hall effect sensor | analog pin A0 |
| Steering | AS5600 magnetic encoder | I2C: SDA → A4, SCL → A5, DIR → GND |
| Brake | Load cell + HX711 amplifier | data → D2, clock → D3 |
 
The sketch needs two libraries from the Arduino Library Manager: **AS5600** (Rob Tillaart) and **HX711** (Bogdan Necula). The hall sensor is a plain `analogRead`, so it needs nothing extra.
 
**Calibration.** Each axis is mapped from the sensor's real min and max into 0–1023, so the numbers depend on your physical build. Print the raw values, move each pedal or the encoder end to end, and put the extremes into the calibration constants at the top of the sketch. The load cell is also tared (auto-zeroed) at startup, so leave the brake pedal resting for the first second after a reset.
 
Port and baud live in `settings.json`:
 
```json
{"port": "/dev/cu.usbmodem1401", "baud": 250000}
```
 
Change the port to match your board, the Arduino IDE shows it under Tools → Port. Close the IDE's Serial Monitor before starting PitView, since only one program can hold the port at a time.
 
## Getting Started
 
**Requirements:** Python 3, pip, and an Arduino running the matching sketch.
 
```bash
pip install -r requirements.txt
python app.py
```
 
Open `http://localhost:5000`. You'll be sent to the login page first; credentials are set in `config.py`.

**No Arduino? Run the simulator.** PitView ships with a built-in fake telemetry source so you can run the whole app without any hardware:

```bash
PITVIEW_SOURCE=simulator python app.py
```

This feeds the dashboard realistic lapping data (and the occasional brake/throttle conflict so you can see the anomaly detector fire). It's also what powers the live demo.
 
## Project Structure
 
```
telemetry/
  arduino.py      # Reads live data from the Arduino over serial
  simulator.py    # Fake data source for running without hardware
  source.py       # Single swap point — the rest of the app gets telemetry from here
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
 
**One data source, swapped in one place.** Everything that needs telemetry imports from `source.py`, which is the only file that knows where readings come from. Pointing PitView at something else — a recorded file, a simulator, a different board is a one-file change, and nothing downstream has to care.
 
**Server-Sent Events instead of WebSockets.** Data only flows one way, server to browser, so SSE is the simpler fit. No extra libraries and no handshake to manage.
 
**Buffer cleared at connection time.** The serial input buffer is flushed once when the port opens, so the bytes the Arduino spits out during its reset don't get parsed as the first real reading.