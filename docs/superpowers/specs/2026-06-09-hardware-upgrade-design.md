# Pitview — Hardware Upgrade Design Spec
**Date:** 2026-06-09
**Status:** Approved

---

## Overview

Upgrade Pitview's hardware from a joystick and potentiometer to a proper 5-channel telemetry rig using the existing Fanatec CSL Elite pedal frame (throttle, brake, clutch) and sim steering wheel. Fanatec electronics are bypassed in favour of raw sensors wired directly to an Arduino Mega 2560, mirroring real motorsport telemetry setups.

---

## Goals

- Impressive physical wiring setup visible as a real engineering project
- 5 distinct data pipelines entering Pitview simultaneously
- High precision readings on all channels
- Non-destructive to the Fanatec pedals' USB gaming function (pedals still work in sim games)
- Foundation for future upgrade to real car sensors

---

## Hardware

### Microcontroller
**Arduino Mega 2560** — chosen over Uno for its 16 analog pins, 54 digital pins, dedicated I2C bus, and headroom for future sensor expansion.

### Sensors

| Channel | Sensor | Part | Notes |
|---|---|---|---|
| Throttle position | Linear hall effect | SS495A | Mounted to pedal travel axis with disc magnet |
| Brake position | Linear hall effect | SS495A | Mounted to pedal travel axis with disc magnet |
| Clutch position | Linear hall effect | SS495A | Mounted to pedal travel axis with disc magnet |
| Brake pressure | 50kg load cell + amplifier | Generic load cell + HX711 module | Load cell sits under brake pad, HX711 handles ADC |
| Steering angle | Magnetic rotary encoder | AS5600 module | Mounted to steering column shaft, diametrically magnetised disc magnet |

### Full Parts List

- 3× SS495A linear hall effect sensors
- 3× small neodymium disc magnets (one per pedal, ~6mm diameter)
- 1× 50kg load cell
- 1× HX711 load cell amplifier module
- 1× AS5600 magnetic rotary encoder module
- 1× diametrically magnetised disc magnet (for AS5600)
- 1× Arduino Mega 2560
- Protoboard or stripboard for clean permanent wiring
- JST-XH connectors for each sensor run (enables clean disconnection)
- Hookup wire (24 AWG stranded recommended)

---

## Wiring Map

```
Arduino Mega 2560
│
├── A0  ← SS495A Throttle (signal pin)
├── A1  ← SS495A Brake position (signal pin)
├── A2  ← SS495A Clutch (signal pin)
│
├── D2  ← HX711 DOUT (brake pressure data)
├── D3  ← HX711 SCK  (brake pressure clock)
│
├── SDA (pin 20)  ← AS5600 SDA (steering angle)
├── SCL (pin 21)  ← AS5600 SCL (steering angle)
│
├── 5V  → SS495A VCC (×3), HX711 VCC, AS5600 VCC
└── GND → all sensor grounds
```

All 3 hall effect sensors are analog ratiometric — output voltage proportional to magnetic field, readable directly on analog pins. HX711 communicates over a simple 2-wire bit-bang protocol. AS5600 communicates over I2C and returns a 12-bit angle value (0–4095 across 360°).

---

## Data Pipelines

### Pipeline Architecture

```
[SS495A Throttle] ──analog──┐
[SS495A Brake]    ──analog──┤
[SS495A Clutch]   ──analog──┼── Arduino Mega ──USB serial──► Pitview (Python)
[HX711 Load Cell] ──digital─┤
[AS5600 Steering] ──I2C─────┘
```

### Serial Output Format

Arduino serialises all 5 channels as a comma-separated line at ~80ms intervals (matching current sample rate):

```
throttle,brake_pos,brake_pressure,clutch,steering\n
```

Example:
```
0.72,0.45,18340,0.10,2047
```

Values:
- `throttle` — 0.0 to 1.0 (normalised from 0–1023 analog read)
- `brake_pos` — 0.0 to 1.0 (normalised from 0–1023 analog read)
- `brake_pressure` — raw HX711 reading (calibrated in software, ~0–50kg range)
- `clutch` — 0.0 to 1.0 (normalised from 0–1023 analog read)
- `steering` — 0 to 4095 (raw AS5600 12-bit angle, normalised to -1.0–1.0 in Python)

---

## Software Changes

### `telemetry/arduino.py`

- Parse 5 values from serial instead of 3
- Normalise brake pressure from raw HX711 counts to kg (requires calibration constant)
- Normalise steering from 0–4095 to -1.0–1.0 (centre = 2048)
- Add tare/zero offset for load cell on startup
- Yield updated `inputs` dict:

```python
inputs = {
    "throttle": throttle,
    "brake_pos": brake_pos,
    "brake_pressure": brake_pressure_kg,
    "clutch": clutch,
    "steering": steering,
    "timestamp": time.time()
}
```

### `database/models.py`

- Add `clutch`, `brake_pressure`, and update `steering` columns to session recording schema

### `static/js/dashboard.js`

- Add clutch and brake pressure datasets to the live chart
- 5 colour-coded lines: throttle (green), brake position (red), brake pressure (orange), clutch (purple), steering (blue)

### `telemetry/anomaly.py`

- Update anomaly detection to distinguish trail braking (simultaneous throttle + brake pressure = intentional) from genuine anomalies
- Add clutch slip detection (clutch partially engaged at high throttle)

---

## Physical Mounting Notes

- SS495A sensors mount best with a 3D-printed or aluminium bracket positioning the sensor ~1–2mm from the magnet at pedal rest, increasing distance as pedal is pressed
- Load cell sits between the brake pedal backplate and the Fanatec frame — no drilling required, use M4 bolts through existing holes
- AS5600 mounts on a small bracket fixed to the steering column housing; magnet glues to the shaft end face

---

## Future Expansion (out of scope for this phase)

- Real car: same sensor types, same Arduino code — swap physical mounting only
- Brake temperature: thermocouple + MAX6675 module on spare analog/SPI pins
- Suspension travel: additional SS495A sensors on each corner
- G-force: MPU-6050 IMU over I2C (shares bus with AS5600)

---

## Success Criteria

- All 5 channels reading live in Pitview dashboard simultaneously
- Brake pressure responds to pedal force independently of pedal position
- Steering angle tracks full lock-to-lock range
- Session recording captures all 5 channels
- Replay plays back all 5 channels on chart
